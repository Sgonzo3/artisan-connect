/**
 * Create or update the Linq iMessage contact card for LINQ_PHONE_NUMBER.
 *
 *   npx tsx scripts/update-contact-card.ts
 *   npx tsx scripts/update-contact-card.ts --first Artisan --last Connect
 */
import { createLinqClient, getLinqPhoneNumber } from "../src/linq.js";

function arg(flag: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

async function main() {
  const phone = getLinqPhoneNumber();
  const firstName = arg("--first", process.env.CONTACT_FIRST_NAME || "Artisan")!;
  const lastName = arg("--last", process.env.CONTACT_LAST_NAME || "Connect")!;
  const imageUrl =
    arg("--image") ||
    process.env.CONTACT_IMAGE_URL ||
    "https://sgonzo3.github.io/artisan-connect/assets/contact-card.png";

  const client = createLinqClient();

  console.log(`Phone: ${phone}`);
  const existing = await client.contactCard.retrieve();
  const cards = existing.contact_cards ?? [];
  console.log("Current cards:", JSON.stringify(cards, null, 2));

  const hasActive = cards.some(
    (c) => c.phone_number === phone && c.is_active,
  );

  let result;
  if (hasActive) {
    console.log("Updating active contact card…");
    result = await client.contactCard.update({
      phone_number: phone,
      first_name: firstName,
      last_name: lastName,
      image_url: imageUrl,
    });
  } else {
    console.log("Creating contact card…");
    try {
      result = await client.contactCard.create({
        phone_number: phone,
        first_name: firstName,
        last_name: lastName,
        image_url: imageUrl,
      });
    } catch (err) {
      // Already exists but inactive/mismatched — try update
      console.warn("Create failed, trying update…", err);
      result = await client.contactCard.update({
        phone_number: phone,
        first_name: firstName,
        last_name: lastName,
        image_url: imageUrl,
      });
    }
  }

  console.log("Result:", JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
