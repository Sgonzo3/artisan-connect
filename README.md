# artisan-connect

Linq iMessage booking agent for two Copenhagen barbershops:

- [The Italian Barber](https://theitalianbarber.dk/) (Knabrostræde)
- [Fratres M Vesterbrogade](https://fratresm.dk/vesterbrogade/priser/)

## What it does

Over iMessage / RCS, the agent:

1. **Asks which shop you prefer**, with a side-by-side price and hours comparison
2. Asks which services you want (prices + estimated time from that shop’s menu)
3. Shares opening hours and collects a preferred day/time
4. Confirms a summary with you
5. Drafts a booking message and sends it to `BOOKING_NOTIFY_NUMBER` (default `+16469434074`)

## Sandbox rules

- **Inbound-first** — text the Linq number before the agent can message you
- First outbound has no links / reply_to / effects
- Opt-out keywords (`STOP`, etc.) stop further replies

## Setup

```bash
cp .env.example .env
# LINQ_API_KEY, LINQ_PHONE_NUMBER, optional BOOKING_NOTIFY_NUMBER
npm install
npm run start:tunnel
```

Then text your Linq number:

- `hi` — start; you’ll see the shop comparison first
- `1` / `Italian Barber` or `2` / `Fratres` / `Vesterbrogade` — pick a shop
- `MENU` / `HOURS` / `SHOPS` — price list / opening hours / switch shop
- e.g. `haircut & beard` → `Friday 14:00` → `YES`
- `RESTART` — start over

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start:tunnel` | Server + Cloudflare tunnel + webhook subscribe |
| `npm run dev` | Local webhook server only |
| `npm run subscribe -- <https-url>` | Register webhook |
| `npm run send -- <+E.164> [msg]` | Optional outbound after inbound |
| `npx tsx scripts/smoke-booking.ts` | Offline booking-flow smoke test |

## Shop data

Menus, durations, and hours live in `src/catalog.ts`:

- Italian Barber — https://theitalianbarber.dk/
- Fratres M Vesterbrogade — https://fratresm.dk/vesterbrogade/priser/
