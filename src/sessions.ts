import fs from "node:fs";
import path from "node:path";
import type { BookingState } from "./booking-agent.js";
import { SERVICES, type Service } from "./catalog.js";

const STORE = path.resolve(".booking-sessions.json");

/** In-memory booking sessions keyed by Linq chat id. */
const sessions = new Map<string, BookingState>();

interface StoredState {
  step: BookingState["step"];
  serviceIds: string[];
  slotLabel?: string;
  slotStart?: string;
  customerName?: string;
  customerHandle: string;
}

function hydrate(stored: StoredState): BookingState {
  const services: Service[] = stored.serviceIds
    .map((id) => SERVICES.find((s) => s.id === id))
    .filter((s): s is Service => Boolean(s));
  return {
    step: stored.step,
    services,
    slotLabel: stored.slotLabel,
    slotStart: stored.slotStart,
    customerName: stored.customerName,
    customerHandle: stored.customerHandle,
  };
}

function serialize(state: BookingState): StoredState {
  return {
    step: state.step,
    serviceIds: state.services.map((s) => s.id),
    slotLabel: state.slotLabel,
    slotStart: state.slotStart,
    customerName: state.customerName,
    customerHandle: state.customerHandle,
  };
}

function persist(): void {
  const obj: Record<string, StoredState> = {};
  for (const [id, state] of sessions) {
    obj[id] = serialize(state);
  }
  fs.writeFileSync(STORE, JSON.stringify(obj, null, 2));
}

function load(): void {
  if (!fs.existsSync(STORE)) return;
  try {
    const raw = JSON.parse(fs.readFileSync(STORE, "utf8")) as Record<
      string,
      StoredState
    >;
    for (const [id, stored] of Object.entries(raw)) {
      sessions.set(id, hydrate(stored));
    }
    console.log(`[sessions] loaded ${sessions.size} booking session(s)`);
  } catch (err) {
    console.warn("[sessions] failed to load store", err);
  }
}

load();

export function getSession(chatId: string): BookingState | undefined {
  return sessions.get(chatId);
}

export function saveSession(chatId: string, state: BookingState): void {
  sessions.set(chatId, state);
  persist();
}

export function clearSession(chatId: string): void {
  sessions.delete(chatId);
  persist();
}
