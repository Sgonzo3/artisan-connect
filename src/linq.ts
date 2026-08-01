import "dotenv/config";
import LinqAPIV3 from "@linqapp/sdk";

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy .env.example to .env and set your sandbox credentials.`,
    );
  }
  return value;
}

/** Prefer LINQ_API_KEY (docs / sandbox) but also accept the SDK's LINQ_API_V3_API_KEY. */
export function getApiKey(): string {
  const key =
    process.env.LINQ_API_KEY?.trim() ||
    process.env.LINQ_API_V3_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Missing LINQ_API_KEY. Copy .env.example to .env and paste your sandbox API key.",
    );
  }
  return key;
}

export function getLinqPhoneNumber(): string {
  return requireEnv("LINQ_PHONE_NUMBER");
}

export function createLinqClient(webhookSecret?: string | null): LinqAPIV3 {
  return new LinqAPIV3({
    apiKey: getApiKey(),
    webhookSecret:
      webhookSecret ?? process.env.LINQ_WEBHOOK_SECRET?.trim() ?? null,
  });
}

export const OPT_OUT_KEYWORDS = new Set([
  "STOP",
  "UNSUBSCRIBE",
  "OPTOUT",
  "CANCEL",
  "END",
  "QUIT",
]);

export function extractText(parts: Array<{ type: string; value?: string }>): string {
  return parts
    .filter((p): p is { type: "text"; value: string } => p.type === "text" && typeof p.value === "string")
    .map((p) => p.value)
    .join("\n")
    .trim();
}

export function isOptOut(text: string): boolean {
  const tokens = text.trim().split(/\s+/);
  if (tokens.some((t) => OPT_OUT_KEYWORDS.has(t))) return true;
  return /stop messaging me/i.test(text);
}

/** First outbound on a brand-new chat cannot include URLs (sandbox / deliverability rule). */
export function assertNoLinksInFirstMessage(text: string): void {
  if (/https?:\/\/|www\./i.test(text)) {
    throw new Error(
      "First outbound message on a new chat cannot contain URLs. Send the text-only hello first, then a follow-up with the link.",
    );
  }
}
