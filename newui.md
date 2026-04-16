# VPL UI/UX Improvement Plan (Sporty, Premium, Not Toyish)

## 1. Design Direction

### Core intent
- Keep the current **high-energy sports feel** (dark surfaces, ember/orange accents, bold headings).
- Remove visual noise and inconsistency so it feels **premium tournament product**, not experimental UI.
- Preserve your brand cues: `Syne` for impact headings, `DM Sans` for utility/body.

### Brand tone keywords
- Competitive
- Sharp
- Broadcast-inspired
- Confident
- Technical, not playful

---

## 2. Visual System (Single Source of Truth)

### Typography scale
- Display/Hero: `clamp(3rem, 7vw, 7rem)` (`Syne`, 800–900)
- Section title: `clamp(1.6rem, 3.5vw, 2.4rem)` (`Syne`, 800)
- Card title: `1rem–1.15rem` (`Syne`, 700)
- Body: `0.9rem–1rem` (`DM Sans`, 400–500)
- Meta/labels: `0.72rem–0.82rem` uppercase with controlled letter spacing

### Spacing scale (use consistently)
- `4, 8, 12, 16, 20, 24, 32, 40, 56, 72`
- Section rhythm target:
  - Header block margin bottom: `40–56`
  - Card grid gap: `16–20`
  - Section-to-section spacing: `56–72`

### Radius, borders, depth
- Small controls: `8px`
- Cards: `14px–16px`
- Overlays/modals: `16px–20px`
- Border color baseline: `rgba(255,255,255,.08)`
- Hover border: `rgba(255,255,255,.14)`
- Shadow style: soft, directional, low blur (avoid glow overload)

### Color behavior
- Keep orange/gold as **priority accent**
- Use blue only as secondary category marker (Group B, info states)
- Status colors:
  - Live: red
  - Completed: green
  - Upcoming: amber
  - Abandoned: muted red
- Rule: accent color should guide hierarchy, not paint every element

---

## 3. Interaction + Motion Principles

- Keep motion minimal and purposeful.
- One entrance animation style per page (`fade + translateY`) with stagger.
- Hover effects:
  - max `translateY(-2px)` on cards
  - subtle border highlight
- Avoid conflicting animations on the same element.
- Respect reduced motion in future pass (`prefers-reduced-motion`).

---

## 4. Information Architecture Improvements

### Public pages
- Standardize section pattern:
  1. Eyebrow/label
  2. Strong heading
  3. One concise supporting line
  4. Content grid/table/card block
- Keep max content width consistent by page type:
  - Marketing sections: `max-width: 1100–1200`
  - Dense schedule/admin-like layouts: `1200+`

### Schedule page
- Keep current sporty style but enforce clear content hierarchy:
  - Standings block
  - League fixtures block
  - Knockout bracket block
- Maintain side-by-side fixture composition (`Team 1 VS Team 2`) with metadata line below.
- Harmonize card heights and footer behavior for mixed status states.

### Admin
- Persistent top action bars for save/reset (already directionally right).
- Form controls grouped by purpose with clear section subtitles.
- Labels on every input (no implicit field meaning).
- Ensure all dense rows wrap gracefully below 1024px.

---

## 5. Component Consistency Checklist

Apply across all pages/components:

1. Buttons
- Primary: orange gradient/solid, consistent height and radius
- Secondary: outlined neutral
- Danger: red outlined/filled only where destructive
- Same disabled state opacity + cursor across app

2. Inputs/Select/Textarea
- Same background/border/focus behavior
- Always visible labels
- Consistent placeholder tone

3. Cards
- Unified surface color and border
- Same hover behavior
- Consistent internal spacing

4. Tables
- Sticky headers only where needed
- Equal cell padding
- Numeric columns center aligned
- Truncation rules defined for narrow screens

5. Badges/Status pills
- One shape, one typographic style, state-driven colors

---

## 6. Responsive UX Plan

### Breakpoints
- Mobile: `< 640`
- Tablet: `640–1023`
- Desktop: `>= 1024`

### Rules
- No horizontal overflow on key pages (Admin + Schedule).
- Convert multi-column edit rows into stacked groups on tablet/mobile.
- Keep action buttons reachable without overlap.
- Keep nav/tab bars scrollable horizontally if needed (with visual affordance).

---

## 7. Accessibility + UX Quality Baseline

- Minimum target size: `40px` for major interactive controls.
- Visible focus state on buttons/inputs.
- Contrast review for muted gray text on dark surfaces.
- Don’t rely on color only for status; keep label text explicit (`Live`, `Ended`, etc.).

---

## 8. Implementation Roadmap (for Antigravity)

### Phase 1: Design tokens + base primitives
- Create/normalize CSS variables for:
  - colors
  - spacing
  - radii
  - borders
  - shadows
- Standardize base button/input/card classes.

### Phase 2: Public consistency pass
- Hero, section headers, card grids, schedule page spacing + hierarchy.
- Ensure fixture cards and standings use same visual system.

### Phase 3: Admin UX hardening
- Normalize panel shell, sticky top actions, form grouping, labels.
- Remove remaining ambiguous/unlabeled inputs.
- Tight responsive polish for editing-heavy screens.

### Phase 4: Final polish + QA
- Interaction consistency pass.
- Mobile QA on all major pages.
- Visual regression check across key routes.

---

## 9. Success Criteria

- UI remains recognizably VPL/sporty.
- No “toyish” impression (reduced random effects, stronger hierarchy).
- Same control patterns everywhere.
- No overlap/overflow issues on admin and schedule pages.
- Faster comprehension of content and actions for first-time users.

