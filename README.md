# Asuta Ashdod — landing page

Hebrew (RTL) landing page for בית החולים הציבורי אסותא אשדוד, built 1:1 from the InDesign design
(`ASUTA_LandingPage_8.pdf`: desktop frame 1600pt, mobile frame 375pt). Leads from the form go to
Assuta's Salesforce (Web-to-Lead) along with the Google Ads click id (GCLID), and the visitor is then
sent to `/thank-you`.

Stack: Next.js 16 (App Router), React 19, plain CSS modules. No UI framework.

## Run locally

```bash
npm install
cp .env.example .env.local   # SF_MODE=mock by default: leads are logged, not sent
npm run dev                  # http://localhost:3000
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
| `SF_DEBUG` / `SF_DEBUG_EMAIL` | Salesforce debug mode (emails a field-mapping report). Never enable in production |

The production org id and GCLID field id still need to be confirmed with Assuta.

## Lead flow

1. `lib/gclid.js` keeps the `gclid` URL parameter for 90 days (cookie and localStorage), following the
   Salesforce test page Assuta provided.
2. `components/LeadForm.jsx` validates the form and POSTs JSON to `/api/lead`.
3. `app/api/lead/route.js` validates again, drops honeypot submissions, and calls `lib/salesforce.js`.
   That code maps the fields to Web-to-Lead:
   - full name → `first_name` (first word) and `last_name` (the rest)
   - phone → `phone`, normalised to digits (`+972` → `0`)
   - medical field → `description` (`תחום רפואי: …`)
   - gclid → `SF_GCLID_FIELD`
4. On success the browser goes to `/thank-you` (a clean URL for the Google Ads conversion; noindex).

## Layout system

The root font-size is tied to the viewport so that `1rem` = 10 design points. Component styles
therefore use the design coordinates directly (`design pt / 10`):

- below 1100px: mobile layout, 375pt frame (capped at 480px wide and centred)
- from 1100px: desktop layout, 1600pt frame (capped at 1600px, backgrounds stay full-bleed)

Line breaks that exist in only one layout use `<br className="br-desktop" />` / `br-mobile`.

`npm run shots -- http://localhost:3000 screenshots` saves full-page screenshots at both design widths
(needs Google Chrome), for comparing against the PDF.

## Deploy (Vercel)

Import the repository in Vercel and set the environment variables above (`SF_MODE=live`).

## Open items

- Social links and the privacy / terms pages (`lib/site.js` has `#` placeholders).
- The production Salesforce org id and GCLID field id.
- The card photos in the design are stock previews with "Magnific" watermarks. They need to be
  replaced with licensed images before launch (`assets/images/card-*`).
- Accessibility (WCAG 2.1 AA / IS 5568) is planned as the next phase.
