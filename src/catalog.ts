/**
 * Multi-shop service menus + hours.
 * Sources:
 * - The Italian Barber: https://theitalianbarber.dk/
 * - Fratres M Vesterbrogade: https://fratresm.dk/vesterbrogade/priser/
 *
 * Prices in DKK. Durations are shop-listed where available; otherwise estimates.
 */

export type ShopId = "italian_barber" | "fratres_vesterbrogade";

export type ServiceCategory =
  | "hair_grooming"
  | "toner"
  | "highlights"
  | "color"
  | "beard_shave"
  | "packages"
  | "other";

export interface OpeningHours {
  open: string;
  close: string;
}

export interface Shop {
  id: ShopId;
  name: string;
  shortName: string;
  address: string;
  phone: string;
  website: string;
  paymentNote: string;
  cancellationNote: string;
  hoursSummary: string;
  openingHours: Record<number, OpeningHours | null>;
  /** Keywords that select this shop in free text */
  aliases: string[];
}

export interface Service {
  id: string;
  shopId: ShopId;
  name: string;
  category: ServiceCategory;
  priceDkk: number;
  /** Approximate duration in minutes */
  durationMin: number;
  aliases: string[];
  /** Shared key for cross-shop price/time comparison */
  compareKey?: string;
}

export const SHOPS: Record<ShopId, Shop> = {
  italian_barber: {
    id: "italian_barber",
    name: "The Italian Barber",
    shortName: "Italian Barber",
    address: "Knabrostræde 8A, st, 1210 København K",
    phone: "40 15 89 57",
    website: "https://theitalianbarber.dk/",
    paymentNote: "MobilePay and cash only — no credit cards.",
    cancellationNote:
      "Cancel at least 24h ahead. No-show / late cancel = 50% charge. 10+ min late = appointment cancelled.",
    hoursSummary:
      "Mon–Fri 9:00–18:00, Sat 9:00–14:00, Sun closed (Copenhagen time).",
    openingHours: {
      0: null,
      1: { open: "09:00", close: "18:00" },
      2: { open: "09:00", close: "18:00" },
      3: { open: "09:00", close: "18:00" },
      4: { open: "09:00", close: "18:00" },
      5: { open: "09:00", close: "18:00" },
      6: { open: "09:00", close: "14:00" },
    },
    aliases: [
      "italian barber",
      "italian",
      "the italian barber",
      "knabrostraede",
      "knabrostræde",
      "1",
    ],
  },
  fratres_vesterbrogade: {
    id: "fratres_vesterbrogade",
    name: "Fratres M Vesterbrogade",
    shortName: "Fratres Vesterbrogade",
    address: "Vesterbrogade 30, 1620 København V",
    phone: "+45 60 56 11 55",
    website: "https://fratresm.dk/vesterbrogade/priser/",
    paymentNote: "Ask the shop about payment options when confirming.",
    cancellationNote:
      "Confirm cancellation policy with the shop when they follow up.",
    hoursSummary:
      "Mon 10:00–18:00, Tue–Fri 9:00–18:00, Sat 9:00–16:00, Sun closed (Copenhagen time).",
    openingHours: {
      0: null,
      1: { open: "10:00", close: "18:00" },
      2: { open: "09:00", close: "18:00" },
      3: { open: "09:00", close: "18:00" },
      4: { open: "09:00", close: "18:00" },
      5: { open: "09:00", close: "18:00" },
      6: { open: "09:00", close: "16:00" },
    },
    aliases: [
      "fratres",
      "fratres m",
      "fratresm",
      "vesterbrogade",
      "vesterbro",
      "2",
    ],
  },
};

/** @deprecated Use SHOPS / getShop — kept for callers that expect a single shop. */
export const SHOP = SHOPS.italian_barber;

export const SHOP_ORDER: ShopId[] = [
  "italian_barber",
  "fratres_vesterbrogade",
];

export const SERVICES: Service[] = [
  // ── The Italian Barber ─────────────────────────────────────────────
  {
    id: "itb_bangs",
    shopId: "italian_barber",
    name: "Bangs / Pandehår",
    category: "hair_grooming",
    priceDkk: 110,
    durationMin: 15,
    aliases: ["bangs", "pandehår", "pandehar", "fringe"],
  },
  {
    id: "itb_haircut",
    shopId: "italian_barber",
    name: "Haircut",
    category: "hair_grooming",
    priceDkk: 390,
    durationMin: 30,
    aliases: ["haircut", "cut", "hair cut", "klip", "klipning"],
    compareKey: "haircut",
  },
  {
    id: "itb_haircut_long",
    shopId: "italian_barber",
    name: "Haircut LONG HAIR",
    category: "hair_grooming",
    priceDkk: 390,
    durationMin: 60,
    aliases: ["long haircut", "long hair", "haircut long", "long cut"],
  },
  {
    id: "itb_haircut_wash",
    shopId: "italian_barber",
    name: "Haircut & wash",
    category: "hair_grooming",
    priceDkk: 410,
    durationMin: 30,
    aliases: [
      "haircut and wash",
      "cut and wash",
      "haircut & wash",
      "wash and cut",
      "klipning inkl vask",
    ],
    compareKey: "haircut_wash",
  },
  {
    id: "itb_kids_cut",
    shopId: "italian_barber",
    name: "Kids cut (0–8)",
    category: "hair_grooming",
    priceDkk: 290,
    durationMin: 30,
    aliases: ["kids", "kid", "kids cut", "child", "children"],
  },
  {
    id: "itb_kids_cut_wash",
    shopId: "italian_barber",
    name: "Kids cut & wash (0–8)",
    category: "hair_grooming",
    priceDkk: 310,
    durationMin: 30,
    aliases: ["kids wash", "kids cut and wash", "kids cut & wash"],
  },
  {
    id: "itb_beard_trim",
    shopId: "italian_barber",
    name: "Beard trim",
    category: "hair_grooming",
    priceDkk: 230,
    durationMin: 30,
    aliases: ["beard", "beard trim", "trim beard", "skæg", "skægtrim"],
    compareKey: "beard_trim",
  },
  {
    id: "itb_hot_towel_shave",
    shopId: "italian_barber",
    name: "Hot towel shave",
    category: "hair_grooming",
    priceDkk: 290,
    durationMin: 60,
    aliases: [
      "hot towel",
      "shave",
      "hot towel shave",
      "barber shave",
      "glat barbering",
    ],
    compareKey: "hot_towel_shave",
  },
  {
    id: "itb_haircut_beard",
    shopId: "italian_barber",
    name: "Haircut & beard trim",
    category: "hair_grooming",
    priceDkk: 520,
    durationMin: 60,
    aliases: [
      "haircut and beard",
      "cut and beard",
      "haircut & beard",
      "hair and beard",
      "combo",
      "hår og skæg",
      "har og skaeg",
    ],
    compareKey: "haircut_beard",
  },
  {
    id: "itb_haircut_shave",
    shopId: "italian_barber",
    name: "Haircut & hot towel shave",
    category: "hair_grooming",
    priceDkk: 550,
    durationMin: 60,
    aliases: ["haircut and shave", "cut and shave", "haircut & shave"],
  },
  {
    id: "itb_wash_blowdry",
    shopId: "italian_barber",
    name: "Wash & blowdry",
    category: "hair_grooming",
    priceDkk: 420,
    durationMin: 30,
    aliases: ["wash and blowdry", "blowdry", "blow dry", "wash & blowdry"],
  },
  {
    id: "itb_wash_cut_blowdry",
    shopId: "italian_barber",
    name: "Wash, haircut & blowdry",
    category: "hair_grooming",
    priceDkk: 480,
    durationMin: 60,
    aliases: [
      "wash haircut blowdry",
      "wash, haircut & blowdry",
      "full wash cut blowdry",
    ],
  },
  {
    id: "itb_buzz",
    shopId: "italian_barber",
    name: "Buzz cut (machine only, no fade)",
    category: "hair_grooming",
    priceDkk: 200,
    durationMin: 20,
    aliases: ["buzz", "buzz cut", "buzzcut"],
    compareKey: "head_trim",
  },
  {
    id: "itb_fade",
    shopId: "italian_barber",
    name: "Fade (sides only)",
    category: "hair_grooming",
    priceDkk: 250,
    durationMin: 25,
    aliases: ["fade", "sides", "fade sides"],
  },
  {
    id: "itb_toner_short",
    shopId: "italian_barber",
    name: "Toner — short (around the ears)",
    category: "toner",
    priceDkk: 280,
    durationMin: 15,
    aliases: ["toner short", "toner", "toner ears"],
  },
  {
    id: "itb_toner_medium",
    shopId: "italian_barber",
    name: "Toner — medium (to shoulders)",
    category: "toner",
    priceDkk: 310,
    durationMin: 15,
    aliases: ["toner medium", "toner shoulders"],
  },
  {
    id: "itb_toner_over_shoulders",
    shopId: "italian_barber",
    name: "Toner — over the shoulders",
    category: "toner",
    priceDkk: 410,
    durationMin: 15,
    aliases: ["toner long", "toner over shoulders"],
  },
  {
    id: "itb_toner_extra_long",
    shopId: "italian_barber",
    name: "Toner — extra long",
    category: "toner",
    priceDkk: 560,
    durationMin: 15,
    aliases: ["toner extra long", "toner xlong"],
  },
  {
    id: "itb_highlights_half",
    shopId: "italian_barber",
    name: "Highlights — half head",
    category: "highlights",
    priceDkk: 850,
    durationMin: 90,
    aliases: ["highlights half", "half head highlights", "half highlights"],
  },
  {
    id: "itb_highlights_short",
    shopId: "italian_barber",
    name: "Highlights — short (around the ears)",
    category: "highlights",
    priceDkk: 1000,
    durationMin: 90,
    aliases: ["highlights short", "highlights ears"],
  },
  {
    id: "itb_highlights_medium",
    shopId: "italian_barber",
    name: "Highlights — medium (to shoulders)",
    category: "highlights",
    priceDkk: 1100,
    durationMin: 105,
    aliases: ["highlights medium", "highlights shoulders"],
  },
  {
    id: "itb_highlights_over_shoulders",
    shopId: "italian_barber",
    name: "Highlights — over the shoulders",
    category: "highlights",
    priceDkk: 1250,
    durationMin: 120,
    aliases: ["highlights over shoulders"],
  },
  {
    id: "itb_highlights_to_breast",
    shopId: "italian_barber",
    name: "Highlights — long (to breast)",
    category: "highlights",
    priceDkk: 1350,
    durationMin: 120,
    aliases: ["highlights breast", "highlights long"],
  },
  {
    id: "itb_highlights_over_breast",
    shopId: "italian_barber",
    name: "Highlights — long (over the breast)",
    category: "highlights",
    priceDkk: 1500,
    durationMin: 120,
    aliases: ["highlights over breast"],
  },
  {
    id: "itb_highlights_extra_long",
    shopId: "italian_barber",
    name: "Highlights — extra long",
    category: "highlights",
    priceDkk: 1650,
    durationMin: 120,
    aliases: ["highlights extra long", "highlights xlong"],
  },
  {
    id: "itb_color_short",
    shopId: "italian_barber",
    name: "Color — short (to the ears)",
    category: "color",
    priceDkk: 760,
    durationMin: 40,
    aliases: ["color short", "colour short", "dye short"],
  },
  {
    id: "itb_color_medium",
    shopId: "italian_barber",
    name: "Color — medium (to shoulders)",
    category: "color",
    priceDkk: 850,
    durationMin: 45,
    aliases: ["color medium", "colour medium", "dye medium"],
  },
  {
    id: "itb_color_over_shoulders",
    shopId: "italian_barber",
    name: "Color — over the shoulders",
    category: "color",
    priceDkk: 950,
    durationMin: 45,
    aliases: ["color over shoulders", "colour over shoulders"],
  },
  {
    id: "itb_color_to_breast",
    shopId: "italian_barber",
    name: "Color — long (to breast)",
    category: "color",
    priceDkk: 990,
    durationMin: 50,
    aliases: ["color long", "colour long", "color breast"],
  },
  {
    id: "itb_color_to_breast_alt",
    shopId: "italian_barber",
    name: "Color — long (to breast, alt)",
    category: "color",
    priceDkk: 1000,
    durationMin: 50,
    aliases: ["color 1000"],
  },
  {
    id: "itb_color_extra_long",
    shopId: "italian_barber",
    name: "Color — extra long (over the breast)",
    category: "color",
    priceDkk: 1200,
    durationMin: 50,
    aliases: ["color extra long", "colour extra long"],
  },
  {
    id: "itb_full_bleach",
    shopId: "italian_barber",
    name: "Full bleach (from)",
    category: "color",
    priceDkk: 1000,
    durationMin: 90,
    aliases: ["bleach", "full bleach", "bleaching"],
  },

  // ── Fratres M Vesterbrogade ────────────────────────────────────────
  // https://fratresm.dk/vesterbrogade/priser/
  {
    id: "frm_haircut",
    shopId: "fratres_vesterbrogade",
    name: "Klipning uden vask",
    category: "hair_grooming",
    priceDkk: 399,
    durationMin: 45,
    aliases: [
      "klipning uden vask",
      "haircut",
      "cut",
      "hair cut",
      "klip",
      "klipning",
      "herreklip",
    ],
    compareKey: "haircut",
  },
  {
    id: "frm_haircut_wash",
    shopId: "fratres_vesterbrogade",
    name: "Klipning inkl. vask",
    category: "hair_grooming",
    priceDkk: 449,
    durationMin: 50,
    aliases: [
      "klipning inkl vask",
      "klipning inkl. vask",
      "haircut and wash",
      "cut and wash",
      "haircut & wash",
      "wash and cut",
    ],
    compareKey: "haircut_wash",
  },
  {
    id: "frm_head_trim",
    shopId: "fratres_vesterbrogade",
    name: "Trimming af hoved",
    category: "hair_grooming",
    priceDkk: 249,
    durationMin: 20,
    aliases: [
      "trimming af hoved",
      "trimning af hoved",
      "head trim",
      "buzz",
      "buzz cut",
      "machine trim",
    ],
    compareKey: "head_trim",
  },
  {
    id: "frm_beard_trim",
    shopId: "fratres_vesterbrogade",
    name: "Trimming af skæg",
    category: "beard_shave",
    priceDkk: 369,
    durationMin: 30,
    aliases: [
      "trimming af skæg",
      "trimming af skaeg",
      "beard",
      "beard trim",
      "trim beard",
      "skæg",
      "skaeg",
      "skægtrim",
    ],
    compareKey: "beard_trim",
  },
  {
    id: "frm_clean_shave",
    shopId: "fratres_vesterbrogade",
    name: "Glat barbering",
    category: "beard_shave",
    priceDkk: 369,
    durationMin: 45,
    aliases: [
      "glat barbering",
      "hot towel",
      "shave",
      "hot towel shave",
      "clean shave",
      "barbering",
    ],
    compareKey: "hot_towel_shave",
  },
  {
    id: "frm_head_shave",
    shopId: "fratres_vesterbrogade",
    name: "Barbering af hoved",
    category: "beard_shave",
    priceDkk: 369,
    durationMin: 45,
    aliases: ["barbering af hoved", "head shave", "shave head"],
  },
  {
    id: "frm_hair_removal",
    shopId: "fratres_vesterbrogade",
    name: "Hårfjerning (service)",
    category: "beard_shave",
    priceDkk: 99,
    durationMin: 15,
    aliases: [
      "hårfjerning",
      "harfjerning",
      "hair removal",
      "nose wax",
      "ear wax",
      "wax",
    ],
  },
  {
    id: "frm_beard_color",
    shopId: "fratres_vesterbrogade",
    name: "Farvning af skæg",
    category: "beard_shave",
    priceDkk: 299,
    durationMin: 30,
    aliases: [
      "farvning af skæg",
      "farvning af skaeg",
      "beard color",
      "beard colour",
      "beard dye",
    ],
  },
  {
    id: "frm_signature",
    shopId: "fratres_vesterbrogade",
    name: "Signatur pakke",
    category: "packages",
    priceDkk: 749,
    durationMin: 90,
    aliases: [
      "signatur pakke",
      "signature",
      "signature package",
      "signatur",
    ],
  },
  {
    id: "frm_hair_beard",
    shopId: "fratres_vesterbrogade",
    name: "Hår & skæg",
    category: "packages",
    priceDkk: 699,
    durationMin: 75,
    aliases: [
      "hår & skæg",
      "har & skaeg",
      "hår og skæg",
      "har og skaeg",
      "haircut and beard",
      "cut and beard",
      "haircut & beard",
      "hair and beard",
      "combo",
    ],
    compareKey: "haircut_beard",
  },
  {
    id: "frm_beard_basic",
    shopId: "fratres_vesterbrogade",
    name: "Skægtrim basis",
    category: "packages",
    priceDkk: 369,
    durationMin: 30,
    aliases: [
      "skægtrim basis",
      "skaegtrim basis",
      "beard trim basic",
      "basic beard",
    ],
  },
  {
    id: "frm_beard_extra",
    shopId: "fratres_vesterbrogade",
    name: "Skægtrim ekstra",
    category: "packages",
    priceDkk: 399,
    durationMin: 45,
    aliases: [
      "skægtrim ekstra",
      "skaegtrim ekstra",
      "beard trim extra",
      "extra beard",
    ],
  },
  {
    id: "frm_facial",
    shopId: "fratres_vesterbrogade",
    name: "Ansigtsbehandling",
    category: "other",
    priceDkk: 349,
    durationMin: 45,
    aliases: ["ansigtsbehandling", "facial", "face treatment", "ansigt"],
  },
  {
    id: "frm_hair_wash",
    shopId: "fratres_vesterbrogade",
    name: "Hårvask",
    category: "other",
    priceDkk: 349,
    durationMin: 20,
    aliases: ["hårvask", "harvask", "hair wash", "wash only"],
  },
];

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  hair_grooming: "Hair & grooming",
  toner: "Toner (~5–15 min)",
  highlights: "Highlights (~1–2 hrs)",
  color: "Color (~30–50 min)",
  beard_shave: "Beard / shaving",
  packages: "Packages",
  other: "Other",
};

const COMPARE_LABELS: Record<string, string> = {
  haircut: "Haircut",
  haircut_wash: "Haircut & wash",
  beard_trim: "Beard trim",
  haircut_beard: "Haircut & beard",
  hot_towel_shave: "Shave / hot towel",
  head_trim: "Buzz / head trim",
};

const COMPARE_ORDER = [
  "haircut",
  "haircut_wash",
  "beard_trim",
  "haircut_beard",
  "hot_towel_shave",
  "head_trim",
] as const;

export function getShop(shopId: ShopId): Shop {
  return SHOPS[shopId];
}

export function servicesForShop(shopId: ShopId): Service[] {
  return SERVICES.filter((s) => s.shopId === shopId);
}

export function findServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

/** @deprecated Prefer shop.openingHours / getShop */
export const OPENING_HOURS = SHOPS.italian_barber.openingHours;

/** @deprecated Prefer shop.hoursSummary / getShop */
export const HOURS_SUMMARY = SHOPS.italian_barber.hoursSummary;

export function formatPrice(dkk: number): string {
  return `${dkk},- DKK`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `~${h} hr ${m} min` : `~${h} hr`;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[&/]/g, " and ")
    .replace(/[^a-z0-9\s+]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchShop(text: string): Shop | null {
  const n = normalize(text);
  if (!n) return null;

  // Prefer longer aliases so "italian barber" beats shorter tokens
  let best: { shop: Shop; len: number } | null = null;
  for (const id of SHOP_ORDER) {
    const shop = SHOPS[id];
    for (const alias of shop.aliases) {
      const a = normalize(alias);
      if (!a) continue;
      const numeric = /^\d+$/.test(a);
      // Digits only as whole message / word — avoid matching "1" inside "14:00"
      const hit = numeric
        ? n === a || new RegExp(`\\b${a}\\b`).test(n)
        : n === a || n.includes(a);
      if (hit && (!best || a.length > best.len)) {
        best = { shop, len: a.length };
      }
    }
  }
  return best?.shop ?? null;
}

/** Suggest which shops are available, with price/time highlights. */
export function shopChoicePrompt(): string {
  const lines = [
    "Here are the shops I can book for you right now:",
    "",
  ];

  SHOP_ORDER.forEach((id, i) => {
    const shop = SHOPS[id];
    lines.push(`${i + 1}) ${shop.name}`);
    lines.push(`   ${shop.address}`);
    lines.push(`   Hours: ${shop.hoursSummary}`);
    lines.push("   Sample prices:");
    for (const key of COMPARE_ORDER.slice(0, 4)) {
      const s = SERVICES.find((x) => x.shopId === id && x.compareKey === key);
      if (!s) continue;
      lines.push(
        `   • ${COMPARE_LABELS[key] ?? s.name}: ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
      );
    }
    lines.push("");
  });

  lines.push(
    "I can walk you through the full menu at either shop.",
  );
  lines.push(
    'Reply TOUR to see both menus, 1 or 2 (or the shop name) to book there, or name a service (e.g. "haircut") and I’ll show where it’s available.',
  );
  lines.push(
    "Tip: Italian Barber is usually cheaper; Fratres is open later on Saturdays (until 16:00).",
  );
  return lines.join("\n");
}

/** Guided walkthrough of a shop's service categories (for iMessage). */
export function shopServiceGuide(shopId: ShopId): string {
  const shop = SHOPS[shopId];
  const available = servicesForShop(shopId);
  const cats = [...new Set(available.map((s) => s.category))] as ServiceCategory[];

  const lines: string[] = [
    `Let's look at ${shop.name}:`,
    shop.address,
    `Hours: ${shop.hoursSummary}`,
    "",
  ];

  for (const cat of cats) {
    const items = available.filter((x) => x.category === cat);
    if (items.length === 0) continue;
    lines.push(`${CATEGORY_LABEL[cat]}:`);
    for (const s of items) {
      lines.push(
        `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
      );
    }
    lines.push("");
  }

  lines.push(shop.paymentNote);
  lines.push(
    `Want to book here? Reply YES or ${shop.shortName}. Or say NEXT for the other shop / SHOPS for the overview.`,
  );
  return lines.join("\n");
}

/** One message per shop for a guided tour of available locations. */
export function guideThroughAllShops(): string[] {
  return [
    "Happy to walk you through what's available at each shop.",
    ...SHOP_ORDER.map((id) => shopServiceGuide(id)),
    "Which shop would you like to book — 1) Italian Barber or 2) Fratres Vesterbrogade?",
  ];
}

/**
 * If the customer named a service before picking a shop, show where it’s offered.
 * Returns null when nothing matched.
 */
export function crossShopServiceGuide(text: string): {
  lines: string;
  compareKey?: string;
  byShop: Partial<Record<ShopId, Service>>;
} | null {
  const matched = matchServices(text);
  if (matched.length === 0) return null;

  // Prefer a comparable service when present
  const withKey = matched.find((s) => s.compareKey);
  const compareKey = withKey?.compareKey;
  const byShop: Partial<Record<ShopId, Service>> = {};

  if (compareKey) {
    for (const id of SHOP_ORDER) {
      const s = SERVICES.find((x) => x.shopId === id && x.compareKey === compareKey);
      if (s) byShop[id] = s;
    }
  } else {
    for (const s of matched) {
      if (!byShop[s.shopId]) byShop[s.shopId] = s;
    }
  }

  const label =
    (compareKey && COMPARE_LABELS[compareKey]) ||
    Object.values(byShop)[0]?.name ||
    "that service";

  const lines = [
    `"${label}" is available at:`,
    "",
  ];

  for (const id of SHOP_ORDER) {
    const s = byShop[id];
    const shop = SHOPS[id];
    const n = SHOP_ORDER.indexOf(id) + 1;
    if (!s) {
      lines.push(`${n}) ${shop.shortName} — not listed for this service`);
      continue;
    }
    lines.push(
      `${n}) ${shop.shortName} — ${s.name}: ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
    );
    lines.push(`   Hours: ${shop.hoursSummary}`);
  }

  lines.push("");
  lines.push(
    "Which shop should I book that at? Reply 1 or 2 (or the shop name). Reply TOUR to browse full menus.",
  );

  return { lines: lines.join("\n"), compareKey, byShop };
}

/** Resolve a pending cross-shop service choice once the shop is picked. */
export function serviceForShopCompareKey(
  shopId: ShopId,
  compareKey: string,
): Service | undefined {
  return SERVICES.find((s) => s.shopId === shopId && s.compareKey === compareKey);
}

export function menuSummary(
  shopId: ShopId,
  category?: ServiceCategory,
): string {
  const shop = SHOPS[shopId];
  const available = servicesForShop(shopId);
  const cats = category
    ? [category]
    : ([...new Set(available.map((s) => s.category))] as ServiceCategory[]);

  const lines: string[] = [`${shop.name} — menu (DKK):`];
  for (const cat of cats) {
    const items = available.filter((x) => x.category === cat);
    if (items.length === 0) continue;
    lines.push(`\n${CATEGORY_LABEL[cat]}:`);
    for (const s of items) {
      lines.push(
        `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
      );
    }
  }
  lines.push(`\nHours: ${shop.hoursSummary}`);
  lines.push(shop.paymentNote);
  return lines.join("\n");
}

/** Compact menu for iMessage — shop-specific popular picks. */
export function shortMenu(shopId: ShopId): string {
  const picksByShop: Record<ShopId, string[]> = {
    italian_barber: [
      "itb_haircut",
      "itb_haircut_wash",
      "itb_haircut_beard",
      "itb_beard_trim",
      "itb_kids_cut",
      "itb_buzz",
      "itb_fade",
      "itb_hot_towel_shave",
    ],
    fratres_vesterbrogade: [
      "frm_haircut",
      "frm_haircut_wash",
      "frm_hair_beard",
      "frm_beard_trim",
      "frm_clean_shave",
      "frm_head_trim",
      "frm_signature",
      "frm_facial",
    ],
  };

  const lines = [`Popular at ${SHOPS[shopId].shortName}:`];
  for (const id of picksByShop[shopId]) {
    const s = SERVICES.find((x) => x.id === id);
    if (!s) continue;
    lines.push(
      `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
    );
  }

  if (shopId === "italian_barber") {
    lines.push(
      "Also: toner, highlights, color. Reply MENU for the full list, or name a service.",
    );
  } else {
    lines.push(
      "Also: packages, beard color, hair removal. Reply MENU for the full list, or name a service.",
    );
  }
  return lines.join("\n");
}

/** Match one or more services mentioned in free text (optionally scoped to a shop). */
export function matchServices(text: string, shopId?: ShopId): Service[] {
  const n = normalize(text);
  if (!n) return [];

  const pool = shopId ? servicesForShop(shopId) : SERVICES;

  const ranked = pool
    .map((s) => {
      const names = [s.name, ...s.aliases]
        .map(normalize)
        .sort((a, b) => b.length - a.length);
      let best = 0;
      for (const alias of names) {
        if (!alias) continue;
        if (n === alias || n.includes(alias)) {
          best = Math.max(best, alias.length);
        }
      }
      return { s, best };
    })
    .filter((x) => x.best > 0)
    .sort((a, b) => b.best - a.best);

  const selected: Service[] = [];
  const coveredSpans: string[] = [];
  for (const { s, best } of ranked) {
    const names = [s.name, ...s.aliases].map(normalize);
    const hit = names.find(
      (a) => a.length === best && (n === a || n.includes(a)),
    );
    if (!hit) continue;
    if (coveredSpans.some((c) => c.includes(hit))) continue;
    selected.push(s);
    coveredSpans.push(hit);
  }

  if (selected.length === 0 && (!shopId || shopId === "italian_barber")) {
    if (/\bhighlights?\b/.test(n)) return [];
    if (/\btoners?\b/.test(n)) return [];
    if (/\b(color|colour|dye)\b/.test(n)) return [];
  }

  return selected;
}

export function totals(
  services: Service[],
): { priceDkk: number; durationMin: number } {
  return services.reduce(
    (acc, s) => ({
      priceDkk: acc.priceDkk + s.priceDkk,
      durationMin: acc.durationMin + s.durationMin,
    }),
    { priceDkk: 0, durationMin: 0 },
  );
}

export function formatServiceList(services: Service[]): string {
  return services
    .map(
      (s) =>
        `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
    )
    .join("\n");
}

function parseTimeParts(
  n: string,
): { hour: number; minute: number } | null {
  let m = n.match(/\b(\d{1,2})[:.](\d{2})\s*(am|pm)?\b/);
  if (m) {
    let hour = Number(m[1]);
    const minute = Number(m[2]);
    const ap = (m[3] || "").toLowerCase();
    if (ap === "pm" && hour < 12) hour += 12;
    if (ap === "am" && hour === 12) hour = 0;
    return { hour, minute };
  }
  m = n.match(/\b(\d{1,2})\s*(am|pm)\b/);
  if (m) {
    let hour = Number(m[1]);
    const ap = (m[2] || "").toLowerCase();
    if (ap === "pm" && hour < 12) hour += 12;
    if (ap === "am" && hour === 12) hour = 0;
    return { hour, minute: 0 };
  }
  m = n.match(/\bat\s+(\d{1,2})\b/);
  if (m) return { hour: Number(m[1]), minute: 0 };
  m = n.match(/\b([01]?\d|2[0-3])([0-5]\d)\b/);
  if (m) return { hour: Number(m[1]), minute: Number(m[2]) };
  m = n.match(/\b(\d{1,2})\b/);
  if (m) {
    const hour = Number(m[1]);
    if (hour <= 23) return { hour, minute: 0 };
  }
  return null;
}

/** Parse a user-proposed slot in Europe/Copenhagen for a given shop. */
export function parseAppointmentSlot(
  text: string,
  now = new Date(),
  shopId: ShopId = "italian_barber",
):
  | { start: Date; label: string; error?: undefined }
  | { error: string; start?: undefined; label?: undefined } {
  const shop = SHOPS[shopId];
  const n = normalize(text);
  if (!n) {
    return {
      error: 'Tell me a day and time, e.g. "Friday 14:00" or "tomorrow 10:30".',
    };
  }

  const time = parseTimeParts(n);
  if (!time) {
    return {
      error: `I need a time too. Hours: ${shop.hoursSummary}\nTry e.g. "Saturday 11:00".`,
    };
  }
  const { hour, minute } = time;
  if (minute > 59 || hour > 23) {
    return {
      error: "That time doesn't look valid. Try something like 10:30 or 14:00.",
    };
  }

  const copenhagenNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Copenhagen" }),
  );

  let dayOffset: number | null = null;
  let targetDow: number | null = null;

  if (/\btoday\b/.test(n)) dayOffset = 0;
  else if (/\btomorrow\b/.test(n)) dayOffset = 1;
  else {
    const days: Record<string, number> = {
      sunday: 0,
      sun: 0,
      monday: 1,
      mon: 1,
      tuesday: 2,
      tue: 2,
      tues: 2,
      wednesday: 3,
      wed: 3,
      thursday: 4,
      thu: 4,
      thur: 4,
      thurs: 4,
      friday: 5,
      fri: 5,
      saturday: 6,
      sat: 6,
    };
    for (const [name, dow] of Object.entries(days)) {
      if (new RegExp(`\\b${name}\\b`).test(n)) {
        targetDow = dow;
        break;
      }
    }
  }

  const iso = n.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);
  const dmy = n.match(/\b(\d{1,2})[./-](\d{1,2})(?:[./-](20\d{2}))?\b/);

  const startLocal = new Date(copenhagenNow);
  startLocal.setSeconds(0, 0);

  if (iso) {
    startLocal.setFullYear(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  } else if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    const y = dmy[3] ? Number(dmy[3]) : copenhagenNow.getFullYear();
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return {
        error:
          'Couldn\'t read that date. Try "Friday 14:00" or "2026-08-08 10:00".',
      };
    }
    startLocal.setFullYear(y, month - 1, day);
    startLocal.setHours(hour, minute, 0, 0);
    if (startLocal <= copenhagenNow && !dmy[3]) {
      startLocal.setFullYear(y + 1);
    }
  } else if (dayOffset !== null) {
    startLocal.setDate(copenhagenNow.getDate() + dayOffset);
  } else if (targetDow !== null) {
    const current = copenhagenNow.getDay();
    let delta = (targetDow - current + 7) % 7;
    if (delta === 0) {
      const probe = new Date(copenhagenNow);
      probe.setHours(hour, minute, 0, 0);
      if (probe <= copenhagenNow) delta = 7;
    }
    startLocal.setDate(copenhagenNow.getDate() + delta);
  } else {
    return {
      error: `Which day? Hours: ${shop.hoursSummary}\nExample: "Friday 14:00" or "tomorrow 10:30".`,
    };
  }

  startLocal.setHours(hour, minute, 0, 0);

  const hours = shop.openingHours[startLocal.getDay()];
  if (!hours) {
    const dayName = startLocal.toLocaleDateString("en-GB", { weekday: "long" });
    return {
      error: `${shop.shortName} is closed on ${dayName}s. ${shop.hoursSummary}`,
    };
  }

  const [openH, openM] = hours.open.split(":").map(Number) as [number, number];
  const [closeH, closeM] = hours.close.split(":").map(Number) as [
    number,
    number,
  ];
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  const slotMin = hour * 60 + minute;

  if (slotMin < openMin || slotMin >= closeMin) {
    const dayName = startLocal.toLocaleDateString("en-GB", { weekday: "long" });
    return {
      error: `${dayName} hours at ${shop.shortName} are ${hours.open}–${hours.close}. Pick a time inside that window.`,
    };
  }

  if (startLocal <= copenhagenNow) {
    return { error: "That time is in the past — pick a future slot." };
  }

  const label = startLocal.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return { start: startLocal, label };
}

export function slotFitsDuration(
  start: Date,
  durationMin: number,
  shopId: ShopId = "italian_barber",
): { ok: true } | { ok: false; error: string } {
  const shop = SHOPS[shopId];
  const hours = shop.openingHours[start.getDay()];
  if (!hours) return { ok: false, error: "Closed that day." };
  const [closeH, closeM] = hours.close.split(":").map(Number) as [
    number,
    number,
  ];
  const endMin = start.getHours() * 60 + start.getMinutes() + durationMin;
  const closeMin = closeH * 60 + closeM;
  if (endMin > closeMin) {
    return {
      ok: false,
      error: `That service needs ${formatDuration(durationMin)}, but you'd run past closing (${hours.close}). Try an earlier time.`,
    };
  }
  return { ok: true };
}
