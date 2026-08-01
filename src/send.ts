/**
 * Create (or reuse) a chat and send a first text-only message.
 *
 * Sandbox rules:
 * - Inbound-first: the recipient must text your Linq number before this succeeds.
 * - First outbound on a new chat cannot include links, reply_to, or message effects.
 *
 * Usage:
 *   npm run send -- +15551234567
 *   npm run send -- +15551234567 "Hello from my agent!"
 */
import {
  assertNoLinksInFirstMessage,
  createLinqClient,
  getLinqPhoneNumber,
} from "./linq.js";

async function main() {
  const to = process.argv[2];
  const message =
    process.argv.slice(3).join(" ").trim() || "Hello from my agent!";

  if (!to) {
    throw new Error("Usage: npm run send -- <+E.164 recipient> [message]");
  }

  assertNoLinksInFirstMessage(message);

  const from = getLinqPhoneNumber();
  const client = createLinqClient();

  console.log(`Sending from ${from} → ${to}`);
  console.log(`Message: ${message}`);

  const chat = await client.chats.create({
    from,
    to: [to],
    message: {
      parts: [{ type: "text", value: message }],
    },
  });

  console.log("Chat response:", JSON.stringify(chat, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
