# Auction Portal Implementation Plan

## Goal
Build a stable admin-controlled auction workflow for:

- `http://localhost:5173/admin/auction` as the host control panel
- `http://localhost:5173/auction-display` as the display screen

The workflow must support:

- a captains auction round
- a regular players auction round
- fast route-to-route syncing without websockets
- admin control for captain marking
- team purse and squad-size limits
- final squad visibility inside the admin dashboard

## Core State Model
The auction state will be treated as a single canonical object with:

- `auction_type`: `captains` or `players`
- `stage`: `idle`, `live`, `sold`, `unsold`, `completed`
- `active_player_id`
- `current_bid`
- `sold_to`
- `sold_price`
- `nomination_order`
- `last_event_at`
- `display_title`

The player table remains the source of truth for:

- `is_captain`
- `sold_to`
- `bid_amount`
- `auction_status`

## Sync Strategy
No websocket layer will be introduced.

Sync will use:

- `BroadcastChannel` for instant same-browser tab updates
- `localStorage` snapshot fallback for quick boot
- existing server persistence for refresh/recovery
- lightweight polling fallback on the display route

This gives near-instant host/display sync without a socket server.

## Auction Rules

### Captains Round
- Only players marked `is_captain = true` are eligible.
- Host toggles captains round from the host panel.
- Display route shows `VPL Captains Auction`.
- Each team can buy only one captain.
- Teams that already have a captain will be hidden/disabled in the `Sold To` selector for captains round.

### Players Round
- Host toggles players round after captains are done.
- `Next Player` selects a random eligible unsold non-captain player.
- Bid updates from the host route sync live to the display route.

### Team Constraints
- Each team purse starts at `100 Cr`.
- Each team can buy at most `12` players total.
- Remaining purse is derived from sold players and visible in admin controls.
- Team eligibility in the sell dialog respects:
  - captain limit in captains round
  - squad-size limit in players round

## Admin Dashboard Changes

### Edit Details
- Keep captain toggle in the player modify modal.
- Label it clearly as captain eligibility for captains round.

### Tournament / Teams Visibility
- Show each team with:
  - captain
  - players list
  - squad count
  - total spend
  - remaining purse

## UI / UX Direction

### Host Panel
- Replace the current floating-control layout with a clearer console:
  - round selector
  - live player board
  - bid controls
  - sell / skip actions
  - roster summary
  - auction status strip

### Display Screen
- Make the presentation route cleaner and larger:
  - auction title
  - active player card
  - live bid
  - sold overlay
  - standby message when idle

## Rollout Steps
1. Normalize auction defaults and shared helper logic.
2. Rebuild `AuctionPortal.jsx` around shared derived data.
3. Add fast cross-tab sync layer.
4. Add captain/team constraints to sell flow.
5. Surface team roster summaries in admin dashboard.
6. Run lint/build and fix any regressions.
