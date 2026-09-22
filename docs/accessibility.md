# Accessibility

## Obligation

**IS 5568** (תקן ישראלי 5568), in force since October 2017 under תקנות שוויון זכויות
לאנשים עם מוגבלות (התאמות נגישות לשירות), **סעיף 35**. Adopts **WCAG 2.1 Level AA**.
Binds public bodies and any organisation serving the public, which includes a public
hospital. Enforced by נציבות שוויון זכויות לאנשים עם מוגבלות; up to ~₪50,000 per claim
without proof of damages. A published accessibility statement naming a contact is a
separate requirement.

## Approach: panel, not overlay

`components/A11yPanel.jsx` is a **user-preference panel**. Each control sets one
`data-a11y-*` attribute on `<html>`; one rule in `app/globals.css` responds. It injects
nothing into the accessibility tree and repairs nothing at runtime.

Overlay products (accessiBe, UserWay, EqualWeb, נגיש בקליק) claim to *produce*
conformance. They do not: the FTC settled with accessiBe for $1M over that claim in
January 2025, and 22.6% of H1-2025 US accessibility filings targeted sites that already
had a widget installed. Compliance rests on the markup below.

## What was added

| Criterion | Change |
|---|---|
| 1.3.1 Info and Relationships | `<header role="banner">`, `<nav aria-label>`, `<main id="content">`, `<section aria-labelledby>`, `<footer role="contentinfo">` |
| 2.4.1 Bypass Blocks | skip link to `#content` on every page |
| 2.4.7 Focus Visible | `:focus-visible` ring (Maccabi blue with a white halo, readable on the gradient) |
| 4.1.2 Name, Role, Value | `aria-expanded` + `aria-controls` on the hamburger, the panel button and the marquee toggle; `role="switch"` + `aria-checked` in the panel |
| 2.1.2 / 2.4.3 | mobile menu as a real dialog: focus trap, Escape, focus restore, `inert` page behind it, scroll lock, visible close button (`lib/useFocusTrap.js`) |
| 2.2.2 Pause, Stop, Hide | pause/play button for the moving departments strip (`components/MarqueeToggle.jsx`) |
| 2.3.3 / reduced motion | `prefers-reduced-motion` and the panel switch stop the strip, the drawer animation and all transitions |
| 1.4.3 Contrast | gradient and caption fixes, below |
| 1.4.4 Resize Text | panel text size up to 200% (technique G178) |
| 2.1.1 Keyboard | the mobile testimonials carousel is focusable so arrow keys scroll it |
| 3.3.1 / 3.3.2 Forms | labels on every field, `aria-required`, `aria-invalid`, errors announced (`role="alert"`) and linked with `aria-describedby`, focus moves to the first invalid field |
| 1.1.1 Non-text Content | photos have Hebrew alt text; decorative SVG (curves, arcs, quote marks, connector dots) hidden |
| — | "נפתח בחלון חדש" announced on links that open a new window |

Plus `/accessibility`, the statement page (הצהרת נגישות), linked from the footer of every
page and from the panel.

## Contrast fixes

Measured on rendered pixels, not estimated. axe cannot compute contrast over a gradient
(it reports those nodes as "needs review", not as violations), so the white-on-gradient
text was checked by sampling the background under each text element.

| Where | Was | Ratio | Now | Ratio |
|---|---|---|---|---|
| White text on the gradient's turquoise end (hero body, footer paragraph, phones, form labels) | `#1A94B2` | 3.55 | `#15809A` | 4.6 |
| White labels on turquoise department pills, mobile only (17.7px bold is below large text) | `#1A94B2` | 3.55 | `#15809A` | 4.6 |
| Photo captions (large text, 3:1) on bright parts of the photos | photo only | down to 1.8 | soft dark fade + stronger shadow | ≥ 3 |

Not changed: desktop turquoise pills. 27px bold is large text, and 3.55:1 clears 3:1. The
gradient keeps the design's Maccabi-blue end; only stops whose luminance was too high
for 4.5:1 were darkened (`--brand-gradient` in `app/globals.css`).

## Verification

Needs a production server (`npm run build && npm run start`):

```bash
npm run a11y             # axe-core, 15 scans (3 routes x 2 widths x up to 4 states) — clean
npm run a11y:behaviour   # keyboard, dialogs, panel, marquee, forms, reflow — 35/35
npm run lint             # 31 jsx-a11y rules (eslint-config-next enables only a few)
```

**A clean axe run is a floor, not a pass**: automated tooling catches roughly a third of
WCAG issues. A screen-reader pass (NVDA + Chrome, VoiceOver + Safari on iOS) is still owed.

## Implementation notes

- `zoom` and `filter` go on `<html>`, never `<body>`. A filter on `<body>` makes it the
  containing block for fixed descendants and detaches the panel button.
- Text scaling uses `zoom` because the layout is measured in viewport-linked rem (see
  `globals.css`); a root font-size scale would fight it. The page gets wider than the
  viewport when zoomed, so `overflow-x` is released while a zoom level is set.
- Browser zoom enlarges text only once the viewport crosses the 1100px breakpoint,
  because the design scales with the viewport. The panel's 200% control covers WCAG 1.4.4.
- "Readable font" is Arial, **not** OpenDyslexic, which has no Hebrew glyphs.
- The "stop animations" switch shortens animations instead of pausing them: pausing would
  freeze the mobile drawer off-screen mid slide-in.
- `devIndicators: false` in `next.config.mjs`. Next's dev badge has no focus indicator and
  shows up as a phantom keyboard failure.
- Saved preferences are applied before first paint by the inline script in
  `app/layout.js`, which mirrors `applyPrefs` in the panel. Keep the two in sync.

## Not required

**Text-to-speech / "read aloud" is not required** by IS 5568 or WCAG 2.1 AA. What is
required is compatibility with the user's *own* screen reader. Captions and audio
description (1.2.x) apply only to video, of which the site has none.

## Open items

1. **Accessibility coordinator details.** `lib/accessibility.js` holds `{{ }}`
   placeholders for name, email and phone. The statement page shows a visible warning
   until they are filled. **Required before launch.**
2. **Placeholder links.** Social links and the privacy / terms pages are `#`
   (`lib/site.js`). A link that goes nowhere is itself an accessibility defect.
3. **Screen-reader pass** by hand, as above.
