#!/usr/bin/env bash
# Start the agent + a Cloudflare quick tunnel, then subscribe the webhook.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env — copy .env.example and add LINQ_API_KEY + LINQ_PHONE_NUMBER"
  exit 1
fi

# shellcheck disable=SC1091
set -a; source .env; set +a

if [[ -z "${LINQ_API_KEY:-}" && -z "${LINQ_API_V3_API_KEY:-}" ]]; then
  echo "LINQ_API_KEY is not set in .env"
  exit 1
fi
if [[ -z "${LINQ_PHONE_NUMBER:-}" ]]; then
  echo "LINQ_PHONE_NUMBER is not set in .env"
  exit 1
fi

PORT="${PORT:-3000}"
LOG_DIR="${TMPDIR:-/tmp}/linq-agent"
mkdir -p "$LOG_DIR"

echo "==> Starting webhook server on :$PORT"
npx tsx src/server.ts >"$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" "${TUNNEL_PID:-}" 2>/dev/null || true
}
trap cleanup EXIT

for i in {1..30}; do
  if curl -sf "http://127.0.0.1:$PORT/health" >/dev/null; then
    break
  fi
  sleep 0.2
done

if ! curl -sf "http://127.0.0.1:$PORT/health" >/dev/null; then
  echo "Server failed to start. Log:"
  cat "$LOG_DIR/server.log"
  exit 1
fi

echo "==> Opening Cloudflare quick tunnel"
cloudflared tunnel --url "http://127.0.0.1:$PORT" >"$LOG_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!

PUBLIC_URL=""
for i in {1..60}; do
  PUBLIC_URL="$(grep -oE 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" | head -n1 || true)"
  if [[ -n "$PUBLIC_URL" ]]; then
    break
  fi
  sleep 0.5
done

if [[ -z "$PUBLIC_URL" ]]; then
  echo "Could not parse tunnel URL. Log:"
  cat "$LOG_DIR/tunnel.log"
  exit 1
fi

echo "==> Public URL: $PUBLIC_URL"
echo "==> Subscribing webhook to $PUBLIC_URL/webhook?version=2026-02-03"
PUBLIC_WEBHOOK_URL="$PUBLIC_URL" npx tsx src/subscribe.ts

echo
echo "Ready."
echo "  1. Text your Linq number first: $LINQ_PHONE_NUMBER"
echo "  2. The agent replies via POST /v3/chats/{chat_id}/messages"
echo "  3. Server log:  $LOG_DIR/server.log"
echo "  4. Tunnel log:  $LOG_DIR/tunnel.log"
echo
echo "Streaming server logs (Ctrl+C to stop)..."
tail -n +1 -f "$LOG_DIR/server.log"
