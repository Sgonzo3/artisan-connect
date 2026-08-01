import {
  formatDuration,
  formatPrice,
  formatServiceList,
  getShop,
  matchServices,
  matchShop,
  menuSummary,
  parseAppointmentSlot,
  shopChoicePrompt,
  shortMenu,
  slotFitsDuration,
  totals,
  type Service,
  type ShopId,
} from "./catalog.js";

export type Step =
  | "welcome"
  | "collect_shop"
  | "collect_services"
  | "collect_datetime"
  | "confirm"
  | "done";

export interface BookingState {
  step: Step;
  shopId?: ShopId;
  services: Service[];
  slotLabel?: string;
  slotStart?: string; // ISO-ish local label storage
  customerName?: string;
  customerHandle: string;
}

export interface AgentTurn {
  replies: string[];
  /** When set, server should send this draft to the notify number. */
  notifyDraft?: string;
  state: BookingState;
}

function isYes(text: string): boolean {
  return /^(y|yes|yeah|yep|confirm|ok|okay|book it|sounds good|perfect|do it|send it|please)\b/i.test(
    text.trim(),
  );
}

function isNo(text: string): boolean {
  return /^(n|no|nope|nah|change|wait|edit|cancel)\b/i.test(text.trim());
}

function wantsMenu(text: string): boolean {
  return (
    /^(menu|prices?|prisliste|price list)\b/i.test(text.trim()) ||
    /\bfull menu\b/i.test(text)
  );
}

function wantsHours(text: string): boolean {
  return (
    /^(hours|opening hours|open|horario)\b/i.test(text.trim()) ||
    /\bwhen are you open\b/i.test(text)
  );
}

function wantsRestart(text: string): boolean {
  return /^(restart|start over|reset|new booking)\b/i.test(text.trim());
}

function wantsChangeShop(text: string): boolean {
  return (
    /^(change shop|other shop|switch shop|shops?)\b/i.test(text.trim()) ||
    /\b(different shop|another shop|which shop)\b/i.test(text)
  );
}

function clarifyCategory(text: string, shopId: ShopId): string | null {
  if (shopId !== "italian_barber") return null;
  const n = text.toLowerCase();
  if (/\bhighlights?\b/.test(n) && matchServices(text, shopId).length === 0) {
    return "Highlights depend on length. Which fits?\n• half head (850,-)\n• short / around ears (1000,-)\n• medium to shoulders (1100,-)\n• over shoulders (1250,-)\n• to breast (1350,-)\n• over breast (1500,-)\n• extra long (1650,-)\n~1–2 hours";
  }
  if (/\btoners?\b/.test(n) && matchServices(text, shopId).length === 0) {
    return "Toner depends on length (~5–15 min):\n• short / around ears — 280,-\n• medium to shoulders — 310,-\n• over shoulders — 410,-\n• extra long — 560,-";
  }
  if (
    /\b(color|colour|dye)\b/.test(n) &&
    matchServices(text, shopId).length === 0
  ) {
    return "Color depends on length (~30–50 min):\n• short to ears — 760,-\n• medium to shoulders — 850,-\n• over shoulders — 950,-\n• to breast — 990,-\n• extra long — 1200,-\n• full bleach from 1000,-";
  }
  return null;
}

export function newBookingState(customerHandle: string): BookingState {
  return {
    step: "welcome",
    services: [],
    customerHandle,
  };
}

function servicesSummary(services: Service[]): string {
  const t = totals(services);
  return `${formatServiceList(services)}\n\nTotal: ${formatPrice(t.priceDkk)} · ${formatDuration(t.durationMin)}`;
}

function requireShop(state: BookingState) {
  if (!state.shopId) throw new Error("shopId required");
  return getShop(state.shopId);
}

function buildNotifyDraft(state: BookingState): string {
  const shop = requireShop(state);
  const t = totals(state.services);
  const lines = [
    `New booking request — ${shop.name}`,
    "",
    `Customer: ${state.customerHandle}`,
    state.customerName ? `Name: ${state.customerName}` : null,
    `When: ${state.slotLabel}`,
    "",
    "Services:",
    ...state.services.map(
      (s) =>
        `• ${s.name} — ${formatPrice(s.priceDkk)} (${formatDuration(s.durationMin)})`,
    ),
    "",
    `Total: ${formatPrice(t.priceDkk)} · Est. ${formatDuration(t.durationMin)}`,
    `Location: ${shop.address}`,
    "",
    "(Drafted by artisan-connect booking agent — please confirm with the customer.)",
  ];
  return lines.filter((x) => x !== null).join("\n");
}

function startShopSelection(state: BookingState, intro?: string): AgentTurn {
  return {
    state: { ...state, step: "collect_shop", shopId: undefined, services: [] },
    replies: [
      ...(intro ? [intro] : []),
      shopChoicePrompt(),
    ],
  };
}

function afterShopSelected(state: BookingState, shopId: ShopId): AgentTurn {
  const shop = getShop(shopId);
  const next: BookingState = {
    ...state,
    step: "collect_services",
    shopId,
    services: [],
    slotLabel: undefined,
    slotStart: undefined,
  };
  return {
    state: next,
    replies: [
      `Great — booking at ${shop.name}.`,
      shortMenu(shopId),
      `Hours: ${shop.hoursSummary}`,
      "Which service(s) are you looking for?",
    ],
  };
}

export function handleBookingMessage(
  state: BookingState,
  text: string,
): AgentTurn {
  const trimmed = text.trim();
  if (!trimmed) {
    if (state.step === "collect_shop" || state.step === "welcome") {
      return startShopSelection(state, "I didn't catch that.");
    }
    return {
      state,
      replies: ["I didn't catch that — what service would you like to book?"],
    };
  }

  if (wantsRestart(trimmed)) {
    return startShopSelection(newBookingState(state.customerHandle), "Starting fresh.");
  }

  if (wantsChangeShop(trimmed)) {
    return startShopSelection(state, "Sure — let's pick a shop again.");
  }

  // ── Shop selection (upfront) ───────────────────────────────────────
  if (state.step === "welcome" || state.step === "collect_shop") {
    const shop = matchShop(trimmed);
    const greetingOnly =
      /^(help|hi|hello|hey|ciao|book|booking)\b/i.test(trimmed) &&
      !shop;

    if (shop) {
      return afterShopSelected(state, shop.id);
    }

    const intro =
      state.step === "welcome" || greetingOnly
        ? "Hi! I can book you at The Italian Barber or Fratres M Vesterbrogade."
        : "I didn't catch which shop — pick one based on price and opening hours:";

    return {
      state: { ...state, step: "collect_shop" },
      replies: [intro, shopChoicePrompt()],
    };
  }

  // From here a shop should be selected
  if (!state.shopId) {
    return startShopSelection(state);
  }

  const shop = getShop(state.shopId);

  if (wantsHours(trimmed)) {
    return {
      state,
      replies: [
        `${shop.name}: ${shop.hoursSummary}`,
        state.step === "collect_datetime"
          ? "What day and time work for you?"
          : "Want to pick a service next? (Or reply SHOPS to compare locations.)",
      ],
    };
  }

  if (wantsMenu(trimmed)) {
    if (state.shopId === "italian_barber") {
      return {
        state,
        replies: [
          menuSummary(state.shopId, "hair_grooming"),
          "Reply TONER, HIGHLIGHTS, or COLOR for those lists — or name a service to book.",
        ],
      };
    }
    return {
      state,
      replies: [
        menuSummary(state.shopId),
        "Name a service to book, or reply SHOPS to switch location.",
      ],
    };
  }

  if (state.shopId === "italian_barber") {
    if (/^toner$/i.test(trimmed)) {
      return {
        state,
        replies: [menuSummary(state.shopId, "toner"), "Which toner length?"],
      };
    }
    if (/^highlights?$/i.test(trimmed)) {
      return {
        state,
        replies: [
          menuSummary(state.shopId, "highlights"),
          "Which highlights option?",
        ],
      };
    }
    if (/^(color|colour)$/i.test(trimmed)) {
      return {
        state,
        replies: [menuSummary(state.shopId, "color"), "Which color option?"],
      };
    }
  }

  if (state.step === "done") {
    if (/^(book|another|again|new)\b/i.test(trimmed)) {
      return startShopSelection(
        newBookingState(state.customerHandle),
        "Happy to book another.",
      );
    }
    return {
      state,
      replies: [
        "Your request is already sent. Text RESTART to book something else, or HOURS / MENU / SHOPS anytime.",
      ],
    };
  }

  if (state.step === "confirm") {
    if (isYes(trimmed)) {
      const draft = buildNotifyDraft(state);
      return {
        state: { ...state, step: "done" },
        notifyDraft: draft,
        replies: [
          "Perfect — I've drafted this booking summary and sent it for confirmation:",
          draft,
          "Someone will follow up to confirm. Thanks!",
        ],
      };
    }
    if (isNo(trimmed) || /\b(time|date|day|when)\b/i.test(trimmed)) {
      return {
        state: {
          ...state,
          step: "collect_datetime",
          slotLabel: undefined,
          slotStart: undefined,
        },
        replies: [
          `No problem — what day and time instead?\n${shop.hoursSummary}`,
        ],
      };
    }
    if (/\b(service|cut|beard|change service|klip|skæg|skaeg)\b/i.test(trimmed)) {
      return {
        state: {
          ...state,
          step: "collect_services",
          services: [],
          slotLabel: undefined,
          slotStart: undefined,
        },
        replies: ["Okay, let's re-pick services. What would you like?"],
      };
    }
    return {
      state,
      replies: [
        "Reply YES to send the booking request, or tell me what to change (services, time, or SHOPS).",
      ],
    };
  }

  if (state.step === "collect_datetime") {
    if (matchServices(trimmed, state.shopId).length && !/\d/.test(trimmed)) {
      const matched = matchServices(trimmed, state.shopId);
      const next = { ...state, services: matched };
      return {
        state: next,
        replies: [
          "Updated services:\n" + servicesSummary(matched),
          `When would you like to come in?\n${shop.hoursSummary}`,
        ],
      };
    }

    const parsed = parseAppointmentSlot(trimmed, new Date(), state.shopId);
    if (parsed.error || !parsed.start || !parsed.label) {
      return { state, replies: [parsed.error || "Could not read that time."] };
    }
    const t = totals(state.services);
    const fit = slotFitsDuration(parsed.start, t.durationMin, state.shopId);
    if (!fit.ok) {
      return { state, replies: [fit.error] };
    }

    const next: BookingState = {
      ...state,
      step: "confirm",
      slotLabel: parsed.label,
      slotStart: parsed.start.toISOString(),
    };
    return {
      state: next,
      replies: [
        "Here's your appointment draft:\n\n" +
          servicesSummary(state.services) +
          `\nWhen: ${parsed.label}` +
          `\nWhere: ${shop.address}` +
          `\n\n${shop.cancellationNote}` +
          "\n\nReply YES to send this booking request, or tell me what to change.",
      ],
    };
  }

  // collect_services
  const categoryHint = clarifyCategory(trimmed, state.shopId);
  if (categoryHint) {
    return { state, replies: [categoryHint] };
  }

  const matched = matchServices(trimmed, state.shopId);
  if (matched.length === 0) {
    if (state.services.length === 0) {
      return {
        state,
        replies: [
          "I couldn't match a service in that message.",
          shortMenu(state.shopId),
          state.shopId === "fratres_vesterbrogade"
            ? 'Try e.g. "klipning", "hår & skæg", or "glat barbering".'
            : 'Try e.g. "haircut", "beard trim", or "haircut & beard".',
        ],
      };
    }
    if (
      /^(done|thats all|that's all|next|continue|book|ok|okay)\b/i.test(trimmed)
    ) {
      return {
        state: { ...state, step: "collect_datetime" },
        replies: [
          "Services so far:\n" + servicesSummary(state.services),
          `What date/time works?\n${shop.hoursSummary}`,
        ],
      };
    }
    return {
      state,
      replies: [
        "Didn't catch a new service. Name another, say DONE to pick a time, MENU, or SHOPS.",
      ],
    };
  }

  const byId = new Map<string, Service>();
  for (const s of [...state.services, ...matched]) byId.set(s.id, s);
  const services = [...byId.values()];
  const next: BookingState = {
    ...state,
    step: "collect_datetime",
    services,
  };

  return {
    state: next,
    replies: [
      "Got it:\n" + servicesSummary(services),
      "Want to add another service? If not, tell me a day and time you'd like.\n" +
        shop.hoursSummary,
    ],
  };
}

export function greetingIfEmptyHistory(handle: string): AgentTurn {
  return startShopSelection(
    newBookingState(handle),
    "Hi! I can book you at The Italian Barber or Fratres M Vesterbrogade.",
  );
}
