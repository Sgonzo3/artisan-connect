import {
  crossShopServiceGuide,
  formatDuration,
  formatPrice,
  formatServiceList,
  getShop,
  guideThroughAllShops,
  matchServices,
  matchShop,
  menuSummary,
  parseAppointmentSlot,
  serviceForShopCompareKey,
  shopChoicePrompt,
  shopServiceGuide,
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
  /** After a guided tour, YES books this shop */
  browsingShopId?: ShopId;
  /** Service compare key chosen before a shop (e.g. haircut) */
  pendingCompareKey?: string;
  services: Service[];
  slotLabel?: string;
  slotStart?: string;
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

function wantsTour(text: string): boolean {
  return (
    /^(tour|browse|both|show (me )?both|walk (me )?through|guide)\b/i.test(
      text.trim(),
    ) ||
    /\b(tour|walk me through|show (me )?(both|all) (shops?|menus?)|what('s| is) available)\b/i.test(
      text,
    )
  );
}

function wantsNextShop(text: string): boolean {
  return /^(next|other|other shop)\b/i.test(text.trim());
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
    state: {
      ...state,
      step: "collect_shop",
      shopId: undefined,
      browsingShopId: undefined,
      pendingCompareKey: undefined,
      services: [],
      slotLabel: undefined,
      slotStart: undefined,
    },
    replies: [...(intro ? [intro] : []), shopChoicePrompt()],
  };
}

function afterShopSelected(
  state: BookingState,
  shopId: ShopId,
  opts?: { pendingCompareKey?: string },
): AgentTurn {
  const shop = getShop(shopId);
  const pendingKey = opts?.pendingCompareKey ?? state.pendingCompareKey;
  const pendingService = pendingKey
    ? serviceForShopCompareKey(shopId, pendingKey)
    : undefined;

  if (pendingService) {
    const next: BookingState = {
      ...state,
      step: "collect_datetime",
      shopId,
      browsingShopId: undefined,
      pendingCompareKey: undefined,
      services: [pendingService],
      slotLabel: undefined,
      slotStart: undefined,
    };
    return {
      state: next,
      replies: [
        `Great — I'll book ${pendingService.name} at ${shop.name}.`,
        servicesSummary([pendingService]),
        `When would you like to come in?\n${shop.hoursSummary}`,
      ],
    };
  }

  const next: BookingState = {
    ...state,
    step: "collect_services",
    shopId,
    browsingShopId: undefined,
    pendingCompareKey: undefined,
    services: [],
    slotLabel: undefined,
    slotStart: undefined,
  };
  return {
    state: next,
    replies: [
      `Great — let's book at ${shop.name}. I'll guide you through their services.`,
      shopServiceGuide(shopId),
      "Name a service from the list above to continue.",
    ],
  };
}

function browseShop(state: BookingState, shopId: ShopId): AgentTurn {
  return {
    state: {
      ...state,
      step: "collect_shop",
      browsingShopId: shopId,
      shopId: undefined,
    },
    replies: [shopServiceGuide(shopId)],
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
    return startShopSelection(
      newBookingState(state.customerHandle),
      "Starting fresh — here are the shops I can book.",
    );
  }

  if (wantsChangeShop(trimmed)) {
    return startShopSelection(
      state,
      "Sure — here are the shops available again.",
    );
  }

  // ── Shop selection + guided tour ───────────────────────────────────
  if (state.step === "welcome" || state.step === "collect_shop") {
    const pureGreeting =
      /^(help|hi|hello|hey|ciao|book|booking)\s*[!.]*$/i.test(trimmed);

    if (pureGreeting || (state.step === "welcome" && pureGreeting)) {
      return {
        state: { ...state, step: "collect_shop" },
        replies: [
          "Hi! I can help you book at these available shops — I'll suggest options and walk you through their services.",
          shopChoicePrompt(),
        ],
      };
    }

    // First message that isn't only a greeting still gets a short intro,
    // then we handle shop/service/tour below.
    const withIntro =
      state.step === "welcome"
        ? [
            "Hi! I can help you book at The Italian Barber or Fratres M Vesterbrogade.",
          ]
        : [];

    if (state.step === "welcome") {
      state = { ...state, step: "collect_shop" };
    }

    if (wantsTour(trimmed)) {
      return {
        state: {
          ...state,
          step: "collect_shop",
          browsingShopId: undefined,
        },
        replies: [...withIntro, ...guideThroughAllShops()],
      };
    }

    // After a single-shop guide, YES books that shop
    if (state.browsingShopId && isYes(trimmed)) {
      return afterShopSelected(state, state.browsingShopId);
    }

    if (state.browsingShopId && wantsNextShop(trimmed)) {
      const other: ShopId =
        state.browsingShopId === "italian_barber"
          ? "fratres_vesterbrogade"
          : "italian_barber";
      return browseShop(state, other);
    }

    // "about 1", "menu at fratres", "services italian" → guide that shop
    const aboutMatch = trimmed.match(
      /^(?:about|show|menu|services?|tour)\s+(?:at\s+|for\s+)?(.+)$/i,
    );
    if (aboutMatch?.[1]) {
      const target = matchShop(aboutMatch[1]);
      if (target) {
        const turn = browseShop(state, target.id);
        return withIntro.length
          ? { ...turn, replies: [...withIntro, ...turn.replies] }
          : turn;
      }
    }

    const shop = matchShop(trimmed);
    if (shop) {
      // "tour 1" / "show fratres" without needing the about prefix
      if (/^(tour|show|menu|services?)\b/i.test(trimmed)) {
        const turn = browseShop(state, shop.id);
        return withIntro.length
          ? { ...turn, replies: [...withIntro, ...turn.replies] }
          : turn;
      }
      const turn = afterShopSelected(state, shop.id, {
        pendingCompareKey: state.pendingCompareKey,
      });
      return withIntro.length
        ? { ...turn, replies: [...withIntro, ...turn.replies] }
        : turn;
    }

    // Named a service before picking a shop → guide across locations
    const cross = crossShopServiceGuide(trimmed);
    if (cross) {
      return {
        state: {
          ...state,
          step: "collect_shop",
          pendingCompareKey: cross.compareKey,
          browsingShopId: undefined,
        },
        replies: [
          ...withIntro,
          "I can book that — here's where it's available and what it costs/takes:",
          cross.lines,
        ],
      };
    }

    return {
      state: { ...state, step: "collect_shop" },
      replies: [
        ...withIntro,
        "I can book these shops and guide you through each menu:",
        shopChoicePrompt(),
      ],
    };
  }

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
          : "Want me to guide you through services next? (Or reply SHOPS / TOUR.)",
      ],
    };
  }

  if (wantsMenu(trimmed) || wantsTour(trimmed)) {
    if (state.shopId === "italian_barber" && /^toner$/i.test(trimmed)) {
      // fall through to category handlers below
    } else if (wantsTour(trimmed) && !wantsMenu(trimmed)) {
      return {
        state: { ...state, step: "collect_services" },
        replies: [
          shopServiceGuide(state.shopId),
          "Name a service to continue, or SHOPS to switch location.",
        ],
      };
    } else if (state.shopId === "italian_barber") {
      return {
        state,
        replies: [
          menuSummary(state.shopId, "hair_grooming"),
          "Reply TONER, HIGHLIGHTS, or COLOR for those lists — or name a service to book.",
        ],
      };
    } else {
      return {
        state,
        replies: [
          shopServiceGuide(state.shopId),
          "Name a service to book, or reply SHOPS to switch location.",
        ],
      };
    }
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
        "Happy to book another — here are the shops available.",
      );
    }
    return {
      state,
      replies: [
        "Your request is already sent. Text RESTART to book something else, or HOURS / MENU / SHOPS / TOUR anytime.",
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
    if (
      /\b(service|cut|beard|change service|klip|skæg|skaeg)\b/i.test(trimmed)
    ) {
      return {
        state: {
          ...state,
          step: "collect_services",
          services: [],
          slotLabel: undefined,
          slotStart: undefined,
        },
        replies: [
          "Okay, let's re-pick services. Here's what this shop offers:",
          shortMenu(state.shopId),
          "Which service would you like?",
        ],
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
          "I couldn't match a service — let me guide you through this shop again.",
          shortMenu(state.shopId),
          state.shopId === "fratres_vesterbrogade"
            ? 'Try e.g. "klipning", "hår & skæg", or "glat barbering". Reply TOUR for the full walkthrough.'
            : 'Try e.g. "haircut", "beard trim", or "haircut & beard". Reply TOUR for the full walkthrough.',
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
        "Didn't catch a new service. Name another, say DONE to pick a time, TOUR, MENU, or SHOPS.",
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
    "Hi! I can help you book at these available shops — I'll suggest options and walk you through their services.",
  );
}
