import express from "express";
import {
  greetingIfEmptyHistory,
  handleBookingMessage,
  newBookingState,
} from "./booking-agent.js";
import {
  createLinqClient,
  extractText,
  getLinqPhoneNumber,
  isOptOut,
} from "./linq.js";
import { getSession, saveSession } from "./sessions.js";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
if (!Number.isFinite(PORT) || PORT <= 0 || PORT >= 65536) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

/** Number that receives drafted booking summaries (E.164). */
const BOOKING_NOTIFY_NUMBER = (
  process.env.BOOKING_NOTIFY_NUMBER || "+16469434074"
).replace(/[^\d+]/g, "");

const optedOut = new Set<string>();
const seenEvents = new Set<string>();

const app = express();

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  }),
);

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    agent: "italian-barber-booking",
    linq_number: process.env.LINQ_PHONE_NUMBER || null,
    notify_number: BOOKING_NOTIFY_NUMBER,
    hint: "Text the Linq number to book a haircut at The Italian Barber.",
  });
});

async function sendText(
  client: ReturnType<typeof createLinqClient>,
  chatId: string,
  value: string,
): Promise<void> {
  // Keep iMessage chunks reasonably short
  const chunks: string[] = [];
  const max = 1200;
  if (value.length <= max) {
    chunks.push(value);
  } else {
    let rest = value;
    while (rest.length > 0) {
      if (rest.length <= max) {
        chunks.push(rest);
        break;
      }
      let cut = rest.lastIndexOf("\n", max);
      if (cut < max * 0.5) cut = max;
      chunks.push(rest.slice(0, cut));
      rest = rest.slice(cut).replace(/^\n+/, "");
    }
  }

  for (const part of chunks) {
    await client.chats.messages.send(chatId, {
      message: { parts: [{ type: "text", value: part }] },
    });
  }
}

async function sendBookingNotify(
  client: ReturnType<typeof createLinqClient>,
  draft: string,
): Promise<void> {
  const from = getLinqPhoneNumber();
  // Reuses existing chat when the notify number has already texted (sandbox inbound-first).
  const chat = await client.chats.create({
    from,
    to: [BOOKING_NOTIFY_NUMBER],
    message: {
      parts: [{ type: "text", value: draft }],
    },
  });
  console.log(
    `[notify] booking draft sent to ${BOOKING_NOTIFY_NUMBER} chat=${(chat as { id?: string }).id ?? "?"}`,
  );
}

app.post("/webhook", async (req, res) => {
  const rawBody =
    (req as express.Request & { rawBody?: string }).rawBody ??
    JSON.stringify(req.body);

  res.status(200).json({ received: true });

  try {
    const client = createLinqClient();
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.headers)) {
      if (typeof v === "string") headers[k] = v;
      else if (Array.isArray(v) && v[0]) headers[k] = v[0];
    }

    let event;
    if (process.env.LINQ_WEBHOOK_SECRET?.trim()) {
      event = client.webhooks.unwrap(rawBody, { headers });
    } else {
      event = JSON.parse(rawBody);
      console.warn(
        "[webhook] LINQ_WEBHOOK_SECRET not set — skipping signature verification",
      );
    }

    const eventType = event.event_type as string;
    const eventId = event.event_id as string | undefined;

    if (eventId) {
      if (seenEvents.has(eventId)) return;
      seenEvents.add(eventId);
      if (seenEvents.size > 1000) {
        const first = seenEvents.values().next().value;
        if (first) seenEvents.delete(first);
      }
    }

    console.log(`[webhook] ${eventType}`, eventId ?? "");
    if (eventType !== "message.received") return;

    const data = event.data as {
      chat?: {
        id?: string;
        health_status?: { status?: string };
      };
      parts?: Array<{ type: string; value?: string }>;
      sender_handle?: { handle?: string };
      direction?: string;
    };

    if (data.direction && data.direction !== "inbound") return;

    const chatId = data.chat?.id;
    if (!chatId) {
      console.error("[webhook] message.received missing chat.id");
      return;
    }

    if (data.chat?.health_status?.status === "OPTED_OUT") {
      console.log(`[webhook] chat ${chatId} is OPTED_OUT — not replying`);
      return;
    }

    const fromHandle = data.sender_handle?.handle ?? "unknown";
    const text = extractText(data.parts ?? []);
    console.log(`[inbound] ${fromHandle}: ${text || "(non-text)"}`);

    if (isOptOut(text)) {
      optedOut.add(chatId);
      console.log(`[opt-out] ${fromHandle} / chat ${chatId}`);
      await sendText(
        client,
        chatId,
        "You're opted out — we won't message further. Text START if you want booking help again.",
      );
      return;
    }

    if (optedOut.has(chatId)) {
      if (/^(START|OPTIN|UNSTOP)$/.test(text.trim())) {
        optedOut.delete(chatId);
      } else {
        console.log(`[webhook] chat ${chatId} locally opted out — not replying`);
        return;
      }
    }

    let state = getSession(chatId);
    let turn;
    if (!state) {
      if (!text || /^(hi|hello|hey|ciao|help|book|booking)\b/i.test(text)) {
        turn = greetingIfEmptyHistory(fromHandle);
      } else {
        state = newBookingState(fromHandle);
        turn = handleBookingMessage(state, text);
      }
    } else {
      turn = handleBookingMessage(state, text || "");
    }

    saveSession(chatId, turn.state);

    for (const reply of turn.replies) {
      await sendText(client, chatId, reply);
      console.log(`[outbound] → ${fromHandle}: ${reply.slice(0, 120).replace(/\n/g, " ")}…`);
    }

    if (turn.notifyDraft) {
      try {
        // If the customer IS the notify number, they already got the draft in-thread.
        if (fromHandle.replace(/[^\d+]/g, "") !== BOOKING_NOTIFY_NUMBER) {
          await sendBookingNotify(client, turn.notifyDraft);
        } else {
          console.log(
            "[notify] customer is notify number — draft already sent in-thread",
          );
        }
      } catch (err) {
        console.error("[notify] failed to send booking draft", err);
        await sendText(
          client,
          chatId,
          "I saved your details, but couldn't relay the draft to the shop line. We'll follow up manually.",
        );
      }
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
  }
});

app.listen(PORT, () => {
  const number = process.env.LINQ_PHONE_NUMBER || "(set LINQ_PHONE_NUMBER)";
  console.log(`Italian Barber booking agent on http://localhost:${PORT}`);
  console.log(`Webhook: POST /webhook?version=2026-02-03`);
  console.log(`Linq number: ${number}`);
  console.log(`Booking notify → ${BOOKING_NOTIFY_NUMBER}`);
});
