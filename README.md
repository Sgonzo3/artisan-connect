# artisan-connect

Linq iMessage booking agent for two Copenhagen barbershops:

- [The Italian Barber](https://theitalianbarber.dk/) (Knabrostræde)
- [Fratres M Vesterbrogade](https://fratresm.dk/vesterbrogade/priser/)

## What it does

Over iMessage / RCS, the agent:

1. **Suggests which shops are available** (Italian Barber + Fratres Vesterbrogade), with sample prices and hours
2. **Guides you through services** at each shop (`TOUR`, or browse one shop, or name a service to see where it’s offered)
3. Collects a preferred day/time for the chosen shop
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

- `hi` — start; agent suggests available shops
- `TOUR` — walk through both shops’ full service menus
- `1` / `Italian Barber` or `2` / `Fratres` / `Vesterbrogade` — book at that shop
- `haircut` (before picking a shop) — see price/time at each location, then choose
- `MENU` / `HOURS` / `SHOPS` — price list / opening hours / switch shop
- e.g. `haircut & beard` → `Friday 14:00` → `YES`
- `RESTART` — start over

## Landing site

Minimal static site in `site/` (Tomo-style CTA, warm styling).

### Local

```bash
npm run site
# open http://localhost:5173 — "Text to book" → Messages with hi to +1 (415) 568-0726
```

### GitHub Pages

`site/` is published to the `gh-pages` branch (workflow: `.github/workflows/pages.yml`).

**One-time enable** (repo admin):

1. Open [Settings → Pages](https://github.com/Sgonzo3/artisan-connect/settings/pages)
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `gh-pages` / `/ (root)` → Save

Live URL: https://sgonzo3.github.io/artisan-connect/

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run start:tunnel` | Server + Cloudflare tunnel + webhook subscribe |
| `npm run dev` | Local webhook server only |
| `npm run subscribe -- <https-url>` | Register webhook |
| `npm run send -- <+E.164> [msg]` | Optional outbound after inbound |
| `npx tsx scripts/smoke-booking.ts` | Offline booking-flow smoke test |
| `npm run site` | Serve the static landing page |

## Shop data

Menus, durations, and hours live in `src/catalog.ts`:

- Italian Barber — https://theitalianbarber.dk/
- Fratres M Vesterbrogade — https://fratresm.dk/vesterbrogade/priser/
