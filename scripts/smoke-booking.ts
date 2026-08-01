import {
  handleBookingMessage,
  newBookingState,
} from "../src/booking-agent.js";
import {
  matchServices,
  matchShop,
  parseAppointmentSlot,
  shopChoicePrompt,
} from "../src/catalog.js";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(matchShop("2")?.id === "fratres_vesterbrogade", "shop 2");
assert(matchShop("vesterbrogade")?.id === "fratres_vesterbrogade", "vesterbro");
assert(matchShop("italian barber")?.id === "italian_barber", "italian");
assert(matchShop("Friday 14:00") === null, "time is not a shop");

assert(
  matchServices("haircut & beard", "italian_barber").some(
    (s) => s.id === "itb_haircut_beard",
  ),
  "itb combo match",
);
assert(
  matchServices("hår & skæg", "fratres_vesterbrogade").some(
    (s) => s.id === "frm_hair_beard",
  ),
  "frm combo match",
);
assert(
  matchServices("klipning inkl. vask", "fratres_vesterbrogade")[0]?.id ===
    "frm_haircut_wash",
  "frm wash cut",
);
assert(
  matchServices("buzz cut", "italian_barber")[0]?.id === "itb_buzz",
  "buzz match",
);

const fridayItb = parseAppointmentSlot(
  "Friday 14:00",
  new Date("2026-08-01T12:00:00Z"),
  "italian_barber",
);
assert(!fridayItb.error && fridayItb.label, `friday itb: ${fridayItb.error}`);

const satLateFrm = parseAppointmentSlot(
  "Saturday 15:00",
  new Date("2026-08-01T12:00:00Z"),
  "fratres_vesterbrogade",
);
assert(
  !satLateFrm.error,
  `fratres sat 15:00 should be open: ${satLateFrm.error}`,
);

const satLateItb = parseAppointmentSlot(
  "Saturday 15:00",
  new Date("2026-08-01T12:00:00Z"),
  "italian_barber",
);
assert(
  satLateItb.error && /hours/i.test(satLateItb.error),
  "itb sat 15 closed",
);

const sunday = parseAppointmentSlot(
  "Sunday 11:00",
  new Date("2026-08-01T12:00:00Z"),
  "fratres_vesterbrogade",
);
assert(sunday.error && /closed/i.test(sunday.error), "sunday closed");

assert(
  shopChoicePrompt().includes("Fratres M Vesterbrogade"),
  "prompt has fratres",
);
assert(
  shopChoicePrompt().includes("399,-"),
  "prompt shows fratres haircut price",
);

// Full flow — Italian Barber
let state = newBookingState("+15551234567");
let turn = handleBookingMessage(state, "hi");
assert(turn.state.step === "collect_shop", "ask shop first");
assert(turn.replies.some((r) => /which shop/i.test(r)), "shop comparison");
state = turn.state;

turn = handleBookingMessage(state, "1");
assert(turn.state.shopId === "italian_barber", "picked italian");
assert(turn.state.step === "collect_services", "services next");
state = turn.state;

turn = handleBookingMessage(state, "haircut and beard");
assert(turn.state.services.length === 1, "one combo service");
assert(turn.state.step === "collect_datetime", "ask datetime");
state = turn.state;

turn = handleBookingMessage(state, "Friday 14:00");
assert(turn.state.step === "confirm", "confirm step");
state = turn.state;

turn = handleBookingMessage(state, "yes");
assert(turn.state.step === "done", "done");
assert(
  turn.notifyDraft && turn.notifyDraft.includes("Haircut & beard"),
  "draft",
);
assert(turn.notifyDraft!.includes("The Italian Barber"), "draft shop");
const italianDraft = turn.notifyDraft!;

// Full flow — Fratres Vesterbrogade
state = newBookingState("+15557654321");
turn = handleBookingMessage(state, "hi");
state = turn.state;
turn = handleBookingMessage(state, "fratres");
assert(turn.state.shopId === "fratres_vesterbrogade", "picked fratres");
state = turn.state;
turn = handleBookingMessage(state, "hår & skæg");
assert(
  turn.state.services.some((s) => s.id === "frm_hair_beard"),
  "frm service",
);
assert(turn.state.services[0]?.priceDkk === 699, "frm price");
state = turn.state;
turn = handleBookingMessage(state, "Saturday 14:00");
assert(turn.state.step === "confirm", "frm confirm sat 14");
assert(
  turn.replies.some((r) => /Vesterbrogade 30/i.test(r)),
  "frm address",
);
state = turn.state;
turn = handleBookingMessage(state, "yes");
assert(turn.notifyDraft?.includes("Fratres M Vesterbrogade"), "frm draft");
assert(turn.notifyDraft?.includes("Hår & skæg"), "frm draft service");

console.log("smoke-booking OK");
console.log("--- italian draft ---");
console.log(italianDraft);
console.log("--- fratres draft ---");
console.log(turn.notifyDraft);
