import express from "express";
import {
  createLinqClient,
  extractText,
  getLinqPhoneNumber,
  isOptOut,
} from "./linq.js";

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
if (!Number.isFinite(PORT) || PORT <= 0 || PORT >= 65536) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}
const optedOut = new Set<string>();
const seenEvents = new Set<string>();

const app = express();

// Keep the raw body for Standard Webhooks signature verification.
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
    linq_number: process.env.LINQ_PHONE_NUMBER || null,
    hint: "Text this Linq number first (inbound-first sandbox). The agent will reply.",
  });
});

app.post("/webhook", async (req, res) => {
  const rawBody =
    (req as express.Request & { rawBody?: string }).rawBody ??
    JSON.stringify(req.body);

  // Always ack quickly so Linq does not retry on our processing time.
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
      // Dev fallback before subscribe writes the signing secret into .env
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

    const health = data.chat?.health_status?.status;
    if (health === "OPTED_OUT") {
      console.log(`[webhook] chat ${chatId} is OPTED_OUT — not replying`);
      return;
    }

    const fromHandle = data.sender_handle?.handle ?? "unknown";
    const text = extractText(data.parts ?? []);
    console.log(`[inbound] ${fromHandle}: ${text || "(non-text)"}`);

    if (isOptOut(text)) {
      optedOut.add(chatId);
      console.log(`[opt-out] ${fromHandle} / chat ${chatId}`);
      return;
    }

    if (optedOut.has(chatId)) {
      console.log(`[webhook] chat ${chatId} locally opted out — not replying`);
      return;
    }

    const reply = text
      ? `Hello from my agent! You said: "${text.slice(0, 200)}"`
      : "Hello from my agent! Thanks for texting — I'm listening.";

    // Reply on the existing chat (no links / effects / reply_to on first outbound).
    const sent = await client.chats.messages.send(chatId, {
      message: {
        parts: [{ type: "text", value: reply }],
      },
    });

    console.log(`[outbound] replied in chat ${chatId}`, sent);

    // Optional follow-up with a link once the chat already has an outbound message.
    if (process.env.SEND_FOLLOWUP_LINK === "1") {
      await client.chats.messages.send(chatId, {
        message: {
          parts: [
            {
              type: "text",
              value: "Docs: https://docs.linqapp.com/getting-started/quickstart/",
            },
          ],
        },
      });
      console.log(`[outbound] follow-up link sent in chat ${chatId}`);
    }
  } catch (err) {
    console.error("[webhook] handler error", err);
  }
});

app.listen(PORT, () => {
  const number = process.env.LINQ_PHONE_NUMBER || "(set LINQ_PHONE_NUMBER)";
  console.log(`Linq agent listening on http://localhost:${PORT}`);
  console.log(`Webhook path: POST /webhook?version=2026-02-03`);
  console.log(`Sandbox Linq number: ${number}`);
  console.log("Inbound-first: text that number from your phone, then the agent replies.");
  try {
    getLinqPhoneNumber();
  } catch {
    console.warn("Warning: LINQ_PHONE_NUMBER is not set yet.");
  }
});
