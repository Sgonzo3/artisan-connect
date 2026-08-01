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
: >"$LOG_DIR/server.log"
: >"$LOG_DIR/tunnel.log"

cleanup() {
  # Keep processes alive on normal exit so the agent stays online.
  # Only clean up if we failed before reaching the ready state.
  if [[ "${READY:-0}" != "1" ]]; then
    kill "${SERVER_PID:-}" "${TUNNEL_PID:-}" 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo "==> Starting webhook server on :$PORT"
npx tsx src/server.ts >>"$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!

for i in {1..50}; do
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
cloudflared tunnel --url "http://127.0.0.1:$PORT" >>"$LOG_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!

PUBLIC_URL=""
for i in {1..90}; do
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
echo "==> Waiting until tunnel is publicly reachable..."
TUNNEL_OK=0
for i in {1..90}; do
  if curl -sf "$PUBLIC_URL/health" >/dev/null; then
    TUNNEL_OK=1
    break
  fi
  # Some environments cannot resolve *.trycloudflare.com locally even when
  # the tunnel is registered. Linq can still deliver webhooks via Cloudflare.
  if grep -q 'Registered tunnel connection' "$LOG_DIR/tunnel.log" \
    && curl -sf "http://127.0.0.1:$PORT/health" >/dev/null; then
    echo "==> Public DNS not resolvable here; tunnel is registered and local health is OK"
    TUNNEL_OK=1
    break
  fi
  sleep 1
done

if [[ "$TUNNEL_OK" != "1" ]]; then
  echo "Tunnel URL never became reachable: $PUBLIC_URL"
  cat "$LOG_DIR/tunnel.log"
  exit 1
fi

echo "==> Health check OK (tunnel registered)"
echo "==> Subscribing webhook to $PUBLIC_URL/webhook?version=2026-02-03"
PUBLIC_WEBHOOK_URL="$PUBLIC_URL" npx tsx src/subscribe.ts

# Reload server so it picks up LINQ_WEBHOOK_SECRET written by subscribe.
echo "==> Restarting server with webhook signing secret"
kill "$SERVER_PID" 2>/dev/null || true
wait "$SERVER_PID" 2>/dev/null || true
npx tsx src/server.ts >>"$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!

for i in {1..50}; do
  if curl -sf "http://127.0.0.1:$PORT/health" >/dev/null; then
    break
  fi
  sleep 0.2
done

READY=1
echo
echo "Ready."
echo "  1. Text your Linq number first: $LINQ_PHONE_NUMBER"
echo "  2. The agent replies via POST /v3/chats/{chat_id}/messages"
echo "  3. Public webhook: $PUBLIC_URL/webhook?version=2026-02-03"
echo "  4. Server log:  $LOG_DIR/server.log"
echo "  5. Tunnel log:  $LOG_DIR/tunnel.log"
echo
echo "SERVER_PID=$SERVER_PID TUNNEL_PID=$TUNNEL_PID"
echo "Streaming server logs (Ctrl+C stops the log stream only)..."
tail -n +1 -f "$LOG_DIR/server.log"
