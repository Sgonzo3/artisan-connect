import {
  HOURS_SUMMARY,
  SHOP,
  formatDuration,
  formatPrice,
  formatServiceList,
  matchServices,
  menuSummary,
  parseAppointmentSlot,
  shortMenu,
  slotFitsDuration,
  totals,
  type Service,
} from "./catalog.js";

export type Step =
  | "welcome"
  | "collect_services"
  | "collect_datetime"
  | "confirm"
  | "done";

export interface BookingState {
  step: Step;
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
  return /^(menu|prices?|prisliste|price list)\b/i.test(text.trim()) || /\bfull menu\b/i.test(text);
}

function wantsHours(text: string): boolean {
  return /^(hours|opening hours|open|horario)\b/i.test(text.trim()) || /\bwhen are you open\b/i.test(text);
}

function wantsRestart(text: string): boolean {
  return /^(restart|start over|reset|new booking)\b/i.test(text.trim());
}

function clarifyCategory(text: string): string | null {
  const n = text.toLowerCase();
  if (/\bhighlights?\b/.test(n) && matchServices(text).length === 0) {
    return "Highlights depend on length. Which fits?\n• half head (850,-)\n• short / around ears (1000,-)\n• medium to shoulders (1100,-)\n• over shoulders (1250,-)\n• to breast (1350,-)\n• over breast (1500,-)\n• extra long (1650,-)\n~1–2 hours";
  }
  if (/\btoners?\b/.test(n) && matchServices(text).length === 0) {
    return "Toner depends on length (~5–15 min):\n• short / around ears — 280,-\n• medium to shoulders — 310,-\n• over shoulders — 410,-\n• extra long — 560,-";
  }
  if (/\b(color|colour|dye)\b/.test(n) && matchServices(text).length === 0) {
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

function buildNotifyDraft(state: BookingState): string {
  const t = totals(state.services);
  const lines = [
    `New booking request — ${SHOP.name}`,
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
    `Location: ${SHOP.address}`,
    "",
    "(Drafted by artisan-connect booking agent — please confirm with the customer.)",
  ];
  return lines.filter((x) => x !== null).join("\n");
}

export function handleBookingMessage(
  state: BookingState,
  text: string,
): AgentTurn {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      state,
      replies: ["I didn't catch that — what service would you like to book?"],
    };
  }

  if (wantsRestart(trimmed)) {
    const next = newBookingState(state.customerHandle);
    next.step = "collect_services";
    return {
      state: next,
      replies: [
        "Starting fresh.",
        shortMenu(),
        "Which service(s) would you like?",
      ],
    };
  }

  if (wantsHours(trimmed)) {
    return {
      state,
      replies: [
        HOURS_SUMMARY,
        state.step === "collect_datetime"
          ? "What day and time work for you?"
          : "Want to pick a service next?",
      ],
    };
  }

  if (wantsMenu(trimmed)) {
    // Full menu is long for iMessage — send grooming + tip for categories
    return {
      state: {
        ...state,
        step: state.step === "welcome" ? "collect_services" : state.step,
      },
      replies: [
        menuSummary("hair_grooming"),
        "Reply TONER, HIGHLIGHTS, or COLOR for those lists — or name a service to book.",
      ],
    };
  }

  if (/^toner$/i.test(trimmed)) {
    return { state, replies: [menuSummary("toner"), "Which toner length?"] };
  }
  if (/^highlights?$/i.test(trimmed)) {
    return {
      state,
      replies: [menuSummary("highlights"), "Which highlights option?"],
    };
  }
  if (/^(color|colour)$/i.test(trimmed)) {
    return { state, replies: [menuSummary("color"), "Which color option?"] };
  }

  if (/^(help|hi|hello|hey|ciao)\b/i.test(trimmed) && state.step === "welcome") {
    const next = { ...state, step: "collect_services" as const };
    return {
      state: next,
      replies: [
        `Ciao! I'm the booking assistant for ${SHOP.name} in Copenhagen.`,
        shortMenu(),
        `Hours: ${HOURS_SUMMARY}`,
        "Which service(s) are you looking for?",
      ],
    };
  }

  if (state.step === "welcome") {
    // Fall through into service collection on first real message
    state = { ...state, step: "collect_services" };
    if (/^(help|hi|hello|hey|ciao)\b/i.test(trimmed)) {
      return {
        state,
        replies: [
          `Ciao! I'm the booking assistant for ${SHOP.name}.`,
          shortMenu(),
          "Which service(s) would you like?",
        ],
      };
    }
  }

  if (state.step === "done") {
    if (/^(book|another|again|new)\b/i.test(trimmed)) {
      const next = newBookingState(state.customerHandle);
      next.step = "collect_services";
      return {
        state: next,
        replies: ["Happy to book another.", shortMenu(), "What service?"],
      };
    }
    return {
      state,
      replies: [
        "Your request is already sent. Text RESTART to book something else, or HOURS / MENU anytime.",
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
          "Someone will follow up to confirm. Grazie!",
        ],
      };
    }
    if (isNo(trimmed) || /\b(time|date|day|when)\b/i.test(trimmed)) {
      return {
        state: { ...state, step: "collect_datetime", slotLabel: undefined, slotStart: undefined },
        replies: [
          `No problem — what day and time instead?\n${HOURS_SUMMARY}`,
        ],
      };
    }
    if (/\b(service|cut|beard|change service)\b/i.test(trimmed)) {
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
        "Reply YES to send the booking request, or tell me what to change (services or time).",
      ],
    };
  }

  if (state.step === "collect_datetime") {
    if (matchServices(trimmed).length && !/\d/.test(trimmed)) {
      // User is changing services
      const matched = matchServices(trimmed);
      const next = { ...state, services: matched };
      return {
        state: next,
        replies: [
          "Updated services:\n" + servicesSummary(matched),
          `When would you like to come in?\n${HOURS_SUMMARY}`,
        ],
      };
    }

    const parsed = parseAppointmentSlot(trimmed);
    if (parsed.error || !parsed.start || !parsed.label) {
      return { state, replies: [parsed.error || "Could not read that time."] };
    }
    const t = totals(state.services);
    const fit = slotFitsDuration(parsed.start, t.durationMin);
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
          `\nWhere: ${SHOP.address}` +
          `\n\n${SHOP.cancellationNote}` +
          "\n\nReply YES to send this booking request, or tell me what to change.",
      ],
    };
  }

  // collect_services
  const categoryHint = clarifyCategory(trimmed);
  if (categoryHint) {
    return { state, replies: [categoryHint] };
  }

  const matched = matchServices(trimmed);
  if (matched.length === 0) {
    if (state.services.length === 0) {
      return {
        state,
        replies: [
          "I couldn't match a service in that message.",
          shortMenu(),
          "Try e.g. \"haircut\", \"beard trim\", or \"haircut & beard\".",
        ],
      };
    }
    // Maybe they're saying "that's all" / moving on
    if (/^(done|thats all|that's all|next|continue|book|ok|okay)\b/i.test(trimmed)) {
      return {
        state: { ...state, step: "collect_datetime" },
        replies: [
          "Services so far:\n" + servicesSummary(state.services),
          `What date/time works?\n${HOURS_SUMMARY}`,
        ],
      };
    }
    return {
      state,
      replies: [
        "Didn't catch a new service. Name another, say DONE to pick a time, or MENU.",
      ],
    };
  }

  // Merge uniquely by id
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
        HOURS_SUMMARY,
    ],
  };
}

export function greetingIfEmptyHistory(handle: string): AgentTurn {
  const state = newBookingState(handle);
  state.step = "collect_services";
  return {
    state,
    replies: [
      `Ciao! Booking assistant for ${SHOP.name}.`,
      shortMenu(),
      `Hours: ${HOURS_SUMMARY}`,
      "Which service(s) would you like to book?",
    ],
  };
}
