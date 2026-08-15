# Vignan Premier League (VPL)


Official platform for the **Vignan Premier League** — an 8 Over cricket tournament with an IPL-style live player auction, faculty-owned teams, and real-time public display. This repo contains the public site, admin dashboard, and the full live auction system.

---

## Features

### Public Site
- Hero with live auction CTA ("View Live Auction →") that swaps to Register when registrations are open
- Scrolling marquee announcements (admin-editable)
- Teams, schedules, rules, points table, registration, and contact pages

### Live Auction Display (`/auction-display`)
- Real-time player auction screen for big displays, phones, and tablets
- **3-breakpoint responsive layout:**
  - `< 640px` — Phone: full-bleed tabbed layout (Live / Up Next / Teams)
  - `640–1023px` — Tablet: sidebar + player card
  - `≥ 1024px` — Desktop: sidebar + player card + team tracker panel
- Round badge shows current auction category with role-matched color
- Animated "Sold" banner with team + price reveal
- Persists current player across browser refreshes

### Admin Auction Control Desk (`/admin/auction`)
- **5-category draft workflow:** Captains → All Rounders → Batsmen → Bowlers → Wicket Keepers
- Colored round indicators per category (matches player card role colors)
- Bid steps: **0.25 / 0.50 / 0.75 / 1 Cr**
- Captain base price: **2 Cr**
- Non-scrolling control sidebar — all actions visible without scroll
- Sold stamp animation in the control desk

### Admin Dashboard (`/admin`)
- Player registration verification with device fingerprinting
- Site CMS — hero text, marquee, timeline, coordinators, winners
- Schedule & fixtures manager with live match result updates

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Framer Motion, Lucide React, Vanilla CSS |
| Styling | Inline styles + Tailwind v4 (utility layer) |
| Backend | Node.js / Express, JWT auth |
| Database | Supabase (PostgreSQL `numeric(10,2)` for bid amounts) |
| Real-time | Supabase Realtime Broadcasts + BroadcastChannel API |

---

## Database Migration

If upgrading from an earlier version, run this once in your **Supabase Dashboard → SQL Editor** to enable decimal bid amounts:

```sql
ALTER TABLE vpl_players
  ALTER COLUMN bid_amount TYPE numeric(10,2);
