import type { BookingState } from "./booking-agent.js";

/** In-memory booking sessions keyed by Linq chat id. */
const sessions = new Map<string, BookingState>();

export function getSession(chatId: string): BookingState | undefined {
  return sessions.get(chatId);
}

export function saveSession(chatId: string, state: BookingState): void {
  sessions.set(chatId, state);
}

export function clearSession(chatId: string): void {
  sessions.delete(chatId);
}
