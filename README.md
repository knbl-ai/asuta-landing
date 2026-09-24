# Asuta Ashdod — landing page

Hebrew (RTL) landing page for בית החולים הציבורי אסותא אשדוד, built 1:1 from the InDesign design
(`ASUTA_LandingPage_8.pdf`: desktop frame 1600pt, mobile frame 375pt). Leads from the form go to
Assuta's Salesforce (Web-to-Lead) along with the Google Ads click id (GCLID), and the visitor is then
sent to `/thank-you`.

Stack: Next.js 16 (App Router), React 19, plain CSS modules. No UI framework.
Accessibility: WCAG 2.1 AA / IS 5568, with a preference panel and a published statement.

## Run locally

```bash
npm install
cp .env.example .env.local   # SF_MODE=mock by default: leads are logged, not sent
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run lint             # ESLint with the full jsx-a11y ruleset
# accessibility checks, against a production server (npm run build && npm run start)
npm run a11y             # axe-core over every route x width x interactive state
npm run a11y:behaviour   # keyboard, dialogs, panel, marquee, forms, reflow
npm run sheets:check     # appends one test row to the configured Google Sheet
```

In mock mode every lead is printed to the console and appended to `leads.dev.log`.
Open `http://localhost:3000/?gclid=TEST12345` to check that the GCLID is captured.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, used for metadata and Salesforce `retURL` |
| `NEXT_BASE_PATH` | Optional sub-path when served under assuta.co.il (e.g. `/ashdod`) |
| `SF_MODE` | `mock` (log only) or `live` (POST to Salesforce) |
| `SF_ENDPOINT` | Web-to-Lead URL. UAT: `https://test.salesforce.com/...`, prod: `https://webto.salesforce.com/...` |
| `SF_OID` | Salesforce org id (UAT: `00D7E000000FWtK`) |
| `SF_GCLID_FIELD` | Custom Lead field id for the GCLID (UAT: `00NWl000000Q9E9`) |
| `SF_CAMPAIGN_ID` | Campaign the lead is attached to (UAT test campaign: `7017E000000edePQAQ`) |
| `SF_LEAD_SOURCE` | `lead_source` value, default `Web` |
| `SF_RETURL` | Optional fixed `retURL`; defaults to the site's own `/thank-you` |
| `SF_DEBUG` / `SF_DEBUG_EMAIL` | Salesforce debug mode (emails a field-mapping report). Never enable in production |
| `LEAD_DESTINATION` | `salesforce` (default), `sheets` or `both` |
| `GOOGLE_SHEETS_WEBAPP_URL` / `GOOGLE_SHEETS_WEBAPP_TOKEN` | Apps Script web app bound to the leads sheet (quickest setup) |
| `GOOGLE_SHEETS_ID` / `GOOGLE_SHEETS_TAB` | The private sheet, when using a service account instead |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` | Service account the sheet is shared with |

The production org id and GCLID field id still need to be confirmed with Assuta.

## Lead flow

1. `lib/gclid.js` keeps the `gclid` URL parameter for 90 days (cookie and localStorage), following the
   Salesforce test page Assuta provided.
2. `components/LeadForm.jsx` validates the form and POSTs JSON to `/api/lead`.
3. `app/api/lead/route.js` validates again, drops honeypot submissions, and calls `lib/salesforce.js`.
   That code maps the fields to Web-to-Lead:
   - full name → `first_name` (first word) and `last_name` (the rest)
   - phone → `phone`, normalised to digits (`+972` → `0`)
   - medical field → `description` (`תחום רפואי: …`), the field Assuta confirmed
   - gclid → `SF_GCLID_FIELD`, never shown to the visitor
   - `lead_source` and `Campaign_ID` from the environment
Where the lead goes is `LEAD_DESTINATION`: `salesforce` (default), `sheets`, or `both`
while one of them is being set up. See [`docs/google-sheets.md`](docs/google-sheets.md) for
the Google Sheet setup and `npm run sheets:check` to verify it.

4. On success the browser goes to `/thank-you` (a clean URL for the Google Ads conversion; noindex).

## Analytics

Assuta's Google Tag Manager container (`GTM-TD2ZS74`) is loaded from `app/layout.js` on
every route, so it also covers `/thank-you` where the Google Ads conversion fires. The
container id is in the code, not an environment variable — it ships in the page anyway.
The `<noscript>` iframe is the second half of Google's snippet, for visitors without
JavaScript.

The site's own GCLID capture (`lib/gclid.js`) is independent of GTM: it is what puts the
click id on the lead itself.

## Layout system

The root font-size is tied to the viewport so that `1rem` = 10 design points. Component styles
therefore use the design coordinates directly (`design pt / 10`):

- below 1100px: mobile layout, 375pt frame (capped at 480px wide and centred)
- from 1100px: desktop layout, 1600pt frame (capped at 1600px, backgrounds stay full-bleed)

Line breaks that exist in only one layout use `<br className="br-desktop" />` / `br-mobile`.

`npm run shots -- http://localhost:3000 screenshots` saves full-page screenshots at both design widths
(needs Google Chrome), for comparing against the PDF.

## Hero slideshow

The hero cycles through one slide per medical field every 6 seconds, changing both
photos and both captions together: נשים ויולדות, אורתופדיה, קרדיולוגיה. The slides are
listed in `components/Hero.jsx`; add or reorder entries there. `components/HeroRotator.jsx`
only flips a data attribute. The rotation stops under `prefers-reduced-motion`, on the
accessibility panel's "stop animations" switch, and while the tab is in the background.

## Accessibility

Built to **IS 5568** (WCAG 2.1 AA), which binds any organisation serving the Israeli
public. Compliance rests on the markup: landmarks, skip link, focus indicators, a real
modal dialog for the mobile menu, a pause control for the moving departments strip,
accessible form errors, reduced-motion support and AA contrast.
`components/A11yPanel.jsx` is a **user-preference panel, not an accessibility overlay**:
it sets `data-a11y-*` attributes on `<html>` and touches nothing in the accessibility tree.

Two deliberate visual changes from the PDF, both contrast fixes: the turquoise end of the
hero/footer gradient is darker (`#15809A` instead of `#1A94B2`), and the hero photos have
a soft dark fade behind their captions. The mobile footer is 33px taller for the
accessibility statement link.

See [`docs/accessibility.md`](docs/accessibility.md) for the measurements, implementation
notes and open items.

## Deploy (Vercel)

Import the repository in Vercel and set the environment variables above (`SF_MODE=live`).

## Open items

- The production Salesforce org id and GCLID field id.
- The card photos in the design are stock previews with "Magnific" watermarks. They need to be
  replaced with licensed images before launch (`assets/images/card-*`).
- The hero photos were supplied at 384x884 (desktop crop), which is about the frame's size
  at 1x. Higher-resolution versions would look sharper on retina screens.
