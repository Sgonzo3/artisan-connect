import {
  handleBookingMessage,
  newBookingState,
} from "../src/booking-agent.js";
import { matchServices, parseAppointmentSlot } from "../src/catalog.js";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

assert(matchServices("haircut & beard").some((s) => s.id === "haircut_beard"), "combo match");
assert(matchServices("buzz cut")[0]?.id === "buzz", "buzz match");

const friday = parseAppointmentSlot("Friday 14:00", new Date("2026-08-01T12:00:00Z"));
assert(!friday.error && friday.label, `friday parse: ${friday.error}`);

const sunday = parseAppointmentSlot("Sunday 11:00", new Date("2026-08-01T12:00:00Z"));
assert(sunday.error && /closed/i.test(sunday.error), "sunday closed");

let state = newBookingState("+15551234567");
let turn = handleBookingMessage(state, "hi");
assert(turn.replies.length >= 2, "greeting");
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
assert(turn.notifyDraft && turn.notifyDraft.includes("Haircut & beard"), "draft");

console.log("smoke-booking OK");
console.log("--- draft ---");
console.log(turn.notifyDraft);
