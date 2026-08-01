# artisan-connect

Minimal Linq iMessage agent for the [sandbox](https://dashboard.linqapp.com/sandbox-signup).

## What it does

1. Exposes `POST /webhook` for `message.received` events
2. Subscribes that URL via `POST /v3/webhook-subscriptions`
3. Replies with `POST /v3/chats/{chat_id}/messages`
4. Optional: `npm run send` creates a chat via `POST /v3/chats` (text-only first message)

## Sandbox rules baked in

- **Inbound-first** — text your Linq number before the agent messages you
- **No links on first outbound** — first message is plain text; optional link follow-up with `SEND_FOLLOWUP_LINK=1`
- Opt-out keywords (`STOP`, etc.) stop further replies for that chat

## Setup

```bash
cp .env.example .env
# Edit .env:
#   LINQ_API_KEY=...
#   LINQ_PHONE_NUMBER=+1...
npm install
```

### One-shot (server + public tunnel + webhook subscribe)

```bash
npm run start:tunnel
```

Then text your Linq number from your phone. The agent replies automatically.

### Manual

```bash
# Terminal 1 — local server
npm run dev

# Terminal 2 — public HTTPS tunnel
cloudflared tunnel --url http://localhost:3000

# Terminal 3 — subscribe (use the trycloudflare.com URL)
npm run subscribe -- https://xxxx.trycloudflare.com
# restart npm run dev so it picks up LINQ_WEBHOOK_SECRET
```

### Optional outbound after they've texted you

```bash
npm run send -- +15551234567 "Hello from my agent!"
```

## Docs

- [Quickstart](https://docs.linqapp.com/getting-started/quickstart/)
- [Webhooks](https://docs.linqapp.com/guides/webhooks/)
