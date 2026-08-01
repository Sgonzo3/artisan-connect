import fs from "node:fs";
import path from "node:path";
import { createLinqClient } from "./linq.js";

const STATE_FILE = path.resolve(".webhook-subscription.json");

function upsertEnv(key: string, value: string): void {
  const envPath = path.resolve(".env");
  let contents = "";
  if (fs.existsSync(envPath)) {
    contents = fs.readFileSync(envPath, "utf8");
  }
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(contents)) {
    contents = contents.replace(re, line);
  } else {
    contents = contents.trimEnd() + (contents.endsWith("\n") || !contents ? "" : "\n") + line + "\n";
  }
  fs.writeFileSync(envPath, contents.endsWith("\n") ? contents : contents + "\n");
}

async function main() {
  const baseUrl = (
    process.env.PUBLIC_WEBHOOK_URL ||
    process.argv[2] ||
    ""
  ).replace(/\/$/, "");

  if (!baseUrl) {
    throw new Error(
      "Pass a public HTTPS base URL: npm run subscribe -- https://xxxx.trycloudflare.com\n" +
        "Or set PUBLIC_WEBHOOK_URL in .env",
    );
  }

  if (!baseUrl.startsWith("https://")) {
    throw new Error(`Webhook URL must be HTTPS, got: ${baseUrl}`);
  }

  const targetUrl = baseUrl.includes("/webhook")
    ? baseUrl.includes("version=")
      ? baseUrl
      : `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}version=2026-02-03`
    : `${baseUrl}/webhook?version=2026-02-03`;

  const client = createLinqClient();

  // Replace any prior subscription that points at a dead tunnel URL.
  const existing = await client.webhookSubscriptions.list();
  for (const sub of existing.subscriptions ?? []) {
    if (sub.target_url?.includes("/webhook")) {
      console.log(`Deleting old subscription ${sub.id} → ${sub.target_url}`);
      await client.webhookSubscriptions.delete(sub.id);
    }
  }

  const phone = process.env.LINQ_PHONE_NUMBER?.trim();
  const created = await client.webhookSubscriptions.create({
    target_url: targetUrl,
    subscribed_events: ["message.received"],
    ...(phone ? { phone_numbers: [phone] } : {}),
  });

  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      {
        id: created.id,
        target_url: created.target_url,
        created_at: created.created_at,
      },
      null,
      2,
    ),
  );

  upsertEnv("LINQ_WEBHOOK_SECRET", created.signing_secret);
  upsertEnv("PUBLIC_WEBHOOK_URL", baseUrl);

  console.log("Webhook subscription created:");
  console.log(`  id:         ${created.id}`);
  console.log(`  target_url: ${created.target_url}`);
  console.log(`  events:     ${created.subscribed_events.join(", ")}`);
  console.log("Wrote LINQ_WEBHOOK_SECRET to .env — restart the server to verify signatures.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
