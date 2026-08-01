/**
 * Service menu + hours scraped from https://theitalianbarber.dk/ (Prices + Booking info).
 * Prices in DKK. Durations are shop estimates where listed; category defaults otherwise.
 */

export type ServiceCategory =
  | "hair_grooming"
  | "toner"
  | "highlights"
  | "color";

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  priceDkk: number;
  /** Approximate duration in minutes */
  durationMin: number;
  aliases: string[];
}

export const SHOP = {
  name: "The Italian Barber",
  address: "Knabrostræde 8A, st, 1210 København K",
  phone: "40 15 89 57",
  website: "https://theitalianbarber.dk/",
  paymentNote: "MobilePay and cash only — no credit cards.",
  cancellationNote:
    "Cancel at least 24h ahead. No-show / late cancel = 50% charge. 10+ min late = appointment cancelled.",
} as const;

/** Local shop hours (Europe/Copenhagen). */
export const OPENING_HOURS: Record<
  number,
  { open: string; close: string } | null
> = {
  0: null, // Sunday
  1: { open: "09:00", close: "18:00" },
  2: { open: "09:00", close: "18:00" },
  3: { open: "09:00", close: "18:00" },
  4: { open: "09:00", close: "18:00" },
  5: { open: "09:00", close: "18:00" },
  6: { open: "09:00", close: "14:00" }, // Saturday
};

export const HOURS_SUMMARY =
  "Mon–Fri 9:00–18:00, Sat 9:00–14:00, Sun closed (Copenhagen time).";

export const SERVICES: Service[] = [
  // Hair and grooming
  {
    id: "bangs",
    name: "Bangs / Pandehår",
    category: "hair_grooming",
    priceDkk: 110,
    durationMin: 15,
    aliases: ["bangs", "pandehår", "pandehar", "fringe"],
  },
  {
    id: "haircut",
    name: "Haircut",
    category: "hair_grooming",
    priceDkk: 390,
    durationMin: 30,
    aliases: ["haircut", "cut", "hair cut", "klip", "klipning"],
  },
  {
    id: "haircut_long",
    name: "Haircut LONG HAIR",
    category: "hair_grooming",
    priceDkk: 390,
    durationMin: 60,
    aliases: ["long haircut", "long hair", "haircut long", "long cut"],
  },
  {
    id: "haircut_wash",
    name: "Haircut & wash",
    category: "hair_grooming",
    priceDkk: 410,
    durationMin: 30,
    aliases: ["haircut and wash", "cut and wash", "haircut & wash", "wash and cut"],
  },
  {
    id: "kids_cut",
    name: "Kids cut (0–8)",
    category: "hair_grooming",
    priceDkk: 290,
    durationMin: 30,
    aliases: ["kids", "kid", "kids cut", "child", "children"],
  },
  {
    id: "kids_cut_wash",
    name: "Kids cut & wash (0–8)",
    category: "hair_grooming",
    priceDkk: 310,
    durationMin: 30,
    aliases: ["kids wash", "kids cut and wash", "kids cut & wash"],
  },
  {
    id: "beard_trim",
    name: "Beard trim",
    category: "hair_grooming",
    priceDkk: 230,
    durationMin: 30,
    aliases: ["beard", "beard trim", "trim beard", "skæg", "skægtrim"],
  },
  {
    id: "hot_towel_shave",
    name: "Hot towel shave",
    category: "hair_grooming",
    priceDkk: 290,
    durationMin: 60,
    aliases: ["hot towel", "shave", "hot towel shave", "barber shave"],
  },
  {
    id: "haircut_beard",
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
    ],
  },
  {
    id: "haircut_shave",
    name: "Haircut & hot towel shave",
    category: "hair_grooming",
    priceDkk: 550,
    durationMin: 60,
    aliases: ["haircut and shave", "cut and shave", "haircut & shave"],
  },
  {
    id: "wash_blowdry",
    name: "Wash & blowdry",
    category: "hair_grooming",
    priceDkk: 420,
    durationMin: 30,
    aliases: ["wash and blowdry", "blowdry", "blow dry", "wash & blowdry"],
  },
  {
    id: "wash_cut_blowdry",
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
    id: "buzz",
    name: "Buzz cut (machine only, no fade)",
    category: "hair_grooming",
    priceDkk: 200,
    durationMin: 20,
    aliases: ["buzz", "buzz cut", "buzzcut"],
  },
  {
    id: "fade",
    name: "Fade (sides only)",
    category: "hair_grooming",
    priceDkk: 250,
    durationMin: 25,
    aliases: ["fade", "sides", "fade sides"],
  },

  // Toner (~5–15 min)
  {
    id: "toner_short",
    name: "Toner — short (around the ears)",
    category: "toner",
    priceDkk: 280,
    durationMin: 15,
    aliases: ["toner short", "toner", "toner ears"],
  },
  {
    id: "toner_medium",
    name: "Toner — medium (to shoulders)",
    category: "toner",
    priceDkk: 310,
    durationMin: 15,
    aliases: ["toner medium", "toner shoulders"],
  },
  {
    id: "toner_over_shoulders",
    name: "Toner — over the shoulders",
    category: "toner",
    priceDkk: 410,
    durationMin: 15,
    aliases: ["toner long", "toner over shoulders"],
  },
  {
    id: "toner_extra_long",
    name: "Toner — extra long",
    category: "toner",
    priceDkk: 560,
    durationMin: 15,
    aliases: ["toner extra long", "toner xlong"],
  },

  // Highlights (~1–2 hours)
  {
    id: "highlights_half",
    name: "Highlights — half head",
    category: "highlights",
    priceDkk: 850,
    durationMin: 90,
    aliases: ["highlights half", "half head highlights", "half highlights"],
  },
  {
    id: "highlights_short",
    name: "Highlights — short (around the ears)",
    category: "highlights",
    priceDkk: 1000,
    durationMin: 90,
    aliases: ["highlights short", "highlights ears"],
  },
  {
    id: "highlights_medium",
    name: "Highlights — medium (to shoulders)",
    category: "highlights",
    priceDkk: 1100,
    durationMin: 105,
    aliases: ["highlights medium", "highlights shoulders"],
  },
  {
    id: "highlights_over_shoulders",
    name: "Highlights — over the shoulders",
    category: "highlights",
    priceDkk: 1250,
    durationMin: 120,
    aliases: ["highlights over shoulders"],
  },
  {
    id: "highlights_to_breast",
    name: "Highlights — long (to breast)",
    category: "highlights",
    priceDkk: 1350,
    durationMin: 120,
    aliases: ["highlights breast", "highlights long"],
  },
  {
    id: "highlights_over_breast",
    name: "Highlights — long (over the breast)",
    category: "highlights",
    priceDkk: 1500,
    durationMin: 120,
    aliases: ["highlights over breast"],
  },
  {
    id: "highlights_extra_long",
    name: "Highlights — extra long",
    category: "highlights",
    priceDkk: 1650,
    durationMin: 120,
    aliases: ["highlights extra long", "highlights xlong"],
  },

  // Color (~30–50 min)
  {
    id: "color_short",
    name: "Color — short (to the ears)",
    category: "color",
    priceDkk: 760,
    durationMin: 40,
    aliases: ["color short", "colour short", "dye short"],
  },
  {
    id: "color_medium",
    name: "Color — medium (to shoulders)",
    category: "color",
    priceDkk: 850,
    durationMin: 45,
    aliases: ["color medium", "colour medium", "dye medium"],
  },
  {
    id: "color_over_shoulders",
    name: "Color — over the shoulders",
    category: "color",
    priceDkk: 950,
    durationMin: 45,
    aliases: ["color over shoulders", "colour over shoulders"],
  },
  {
    id: "color_to_breast",
    name: "Color — long (to breast)",
    category: "color",
    priceDkk: 990,
    durationMin: 50,
    aliases: ["color long", "colour long", "color breast"],
  },
  {
    id: "color_to_breast_alt",
    name: "Color — long (to breast, alt)",
    category: "color",
    priceDkk: 1000,
    durationMin: 50,
    aliases: ["color 1000"],
  },
  {
    id: "color_extra_long",
    name: "Color — extra long (over the breast)",
    category: "color",
    priceDkk: 1200,
    durationMin: 50,
    aliases: ["color extra long", "colour extra long"],
  },
  {
    id: "full_bleach",
    name: "Full bleach (from)",
    category: "color",
    priceDkk: 1000,
    durationMin: 90,
    aliases: ["bleach", "full bleach", "bleaching"],
  },
];

const CATEGORY_LABEL: Record<ServiceCategory, string> = {
  hair_grooming: "Hair & grooming",
  toner: "Toner (~5–15 min)",
  highlights: "Highlights (~1–2 hrs)",
  color: "Color (~30–50 min)",
};

export function formatPrice(dkk: number): string {
  return `${dkk},- DKK`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `~${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `~${h} hr ${m} min` : `~${h} hr`;
}

export function menuSummary(category?: ServiceCategory): string {
  const cats: ServiceCategory[] = category
    ? [category]
    : ["hair_grooming", "toner", "highlights", "color"];

  const lines: string[] = ["The Italian Barber — menu (DKK):"];
  for (const cat of cats) {
    lines.push(`\n${CATEGORY_LABEL[cat]}:`);
    for (const s of SERVICES.filter((x) => x.category === cat)) {
      lines.push(
        `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
      );
    }
  }
  lines.push(`\nHours: ${HOURS_SUMMARY}`);
  lines.push(SHOP.paymentNote);
  return lines.join("\n");
}

/** Compact menu for iMessage (grooming first — most common). */
export function shortMenu(): string {
  const picks = [
    "haircut",
    "haircut_wash",
    "haircut_beard",
    "beard_trim",
    "kids_cut",
    "buzz",
    "fade",
    "hot_towel_shave",
  ];
  const lines = ["Popular services:"];
  for (const id of picks) {
    const s = SERVICES.find((x) => x.id === id);
    if (!s) continue;
    lines.push(
      `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
    );
  }
  lines.push(
    "Also: toner, highlights, color. Reply MENU for the full list, or name a service.",
  );
  return lines.join("\n");
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

/** Match one or more services mentioned in free text. Prefer longer / more specific names. */
export function matchServices(text: string): Service[] {
  const n = normalize(text);
  if (!n) return [];

  const ranked = SERVICES.map((s) => {
    const names = [s.name, ...s.aliases].map(normalize).sort((a, b) => b.length - a.length);
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

  // Drop services whose match is fully covered by a longer, already-selected match
  // (e.g. "haircut" inside "haircut & beard trim").
  const selected: Service[] = [];
  const coveredSpans: string[] = [];
  for (const { s, best } of ranked) {
    const names = [s.name, ...s.aliases].map(normalize);
    const hit = names.find((a) => a.length === best && (n === a || n.includes(a)));
    if (!hit) continue;
    if (coveredSpans.some((c) => c.includes(hit))) continue;
    selected.push(s);
    coveredSpans.push(hit);
  }

  // Category-only asks ("highlights", "toner", "color") → empty so agent can clarify length
  if (selected.length === 0) {
    if (/\bhighlights?\b/.test(n)) return [];
    if (/\btoners?\b/.test(n)) return [];
    if (/\b(color|colour|dye)\b/.test(n)) return [];
  }

  return selected;
}

export function totals(services: Service[]): { priceDkk: number; durationMin: number } {
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

/** Parse a user-proposed slot in Europe/Copenhagen. */
export function parseAppointmentSlot(
  text: string,
  now = new Date(),
): { start: Date; label: string; error?: undefined } | { error: string; start?: undefined; label?: undefined } {
  const n = normalize(text);
  if (!n) {
    return {
      error: 'Tell me a day and time, e.g. "Friday 14:00" or "tomorrow 10:30".',
    };
  }

  const time = parseTimeParts(n);
  if (!time) {
    return {
      error: `I need a time too. Hours: ${HOURS_SUMMARY}\nTry e.g. "Saturday 11:00".`,
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
      error: `Which day? Hours: ${HOURS_SUMMARY}\nExample: "Friday 14:00" or "tomorrow 10:30".`,
    };
  }

  startLocal.setHours(hour, minute, 0, 0);

  const hours = OPENING_HOURS[startLocal.getDay()];
  if (!hours) {
    return { error: `We're closed on Sundays. ${HOURS_SUMMARY}` };
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
      error: `${dayName} hours are ${hours.open}–${hours.close}. Pick a time inside that window.`,
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
): { ok: true } | { ok: false; error: string } {
  const hours = OPENING_HOURS[start.getDay()];
  if (!hours) return { ok: false, error: "Closed that day." };
  const [closeH, closeM] = hours.close.split(":").map(Number) as [number, number];
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
