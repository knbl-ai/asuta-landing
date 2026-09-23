# Sending leads to a private Google Sheet

While Salesforce is unavailable, leads can be written to a Google Sheet instead — or to
both at once. The sheet stays **private**: it is shared with one service account, the way
you would share it with a colleague. Nothing is made public, and no API key travels to the
visitor's browser.

## Why a service account

A Google service account is a robot user with its own e-mail address, for example
`asuta-leads@my-project.iam.gserviceaccount.com`. The site signs in as that robot with a
private key held only in the server's environment variables. Access is granted by sharing
the sheet with that e-mail, and revoked by un-sharing it.

The alternative — "anyone with the link can edit" plus an API key — makes the sheet
readable by anyone who guesses the URL. Never do that with people's phone numbers.

## One-time setup (about 10 minutes)

### 1. Create the sheet

1. Create a new spreadsheet at <https://sheets.google.com>, e.g. "אסותא אשדוד – לידים".
2. Rename the first tab to **Leads** (bottom-left). Any name works if you also set
   `GOOGLE_SHEETS_TAB`.
3. Leave it empty. The header row is written automatically on the first lead:
   תאריך ושעה · שם מלא · טלפון · תחום רפואי · GCLID · מקור
4. Copy the **spreadsheet id** from the URL — the long part between `/d/` and `/edit`:
   `https://docs.google.com/spreadsheets/d/`**`1AbC…xyz`**`/edit`

### 2. Create the service account

1. Open <https://console.cloud.google.com/> and sign in with the Google account that
   should own this integration.
2. Create a project (top bar → **New project**), e.g. "asuta-landing". A free account is enough.
3. Enable the API: **APIs & Services → Library**, search for **Google Sheets API**, open
   it and press **Enable**.
4. Go to **APIs & Services → Credentials → Create credentials → Service account**.
   - Name: `asuta-leads`. Press **Create and continue**, then **Done** (no roles needed —
     access comes from sharing the sheet).
5. Open the new service account → **Keys** tab → **Add key → Create new key → JSON**.
   A `.json` file downloads. It contains the private key: treat it like a password, and do
   not commit it.

### 3. Share the sheet with the service account

1. In the JSON file, find `"client_email"`, e.g. `asuta-leads@asuta-landing.iam.gserviceaccount.com`.
2. In the sheet press **Share**, paste that e-mail, give it **Editor**, and untick
   "Notify people". A robot cannot read mail.

### 4. Configure the site

From the JSON file you need two values: `client_email` and `private_key`.

Locally, in `.env.local`:

```bash
LEAD_DESTINATION=sheets          # or: both
GOOGLE_SHEETS_ID=1AbC…xyz
GOOGLE_SHEETS_TAB=Leads
GOOGLE_SERVICE_ACCOUNT_EMAIL=asuta-leads@asuta-landing.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN…\n-----END PRIVATE KEY-----\n"
```

Copy `private_key` from the JSON exactly as it appears there, with the `\n` sequences and
the surrounding quotes.

Then check it, which appends one test row:

```bash
npm run sheets:check
```

On Vercel, add the same five variables under **Settings → Environment Variables** for
Production and Preview, then redeploy. In the Vercel dialog the key can be pasted with
real line breaks; `\n` also works.

## Switching destinations

One variable decides where leads go:

| `LEAD_DESTINATION` | Behaviour |
|---|---|
| `salesforce` (default) | Salesforce Web-to-Lead only, as before |
| `sheets` | the Google Sheet only |
| `both` | both; the lead counts as delivered if at least one accepts it, and a failure of the other is logged |

Salesforce's own mock/live switch stays in `SF_MODE`. When Assuta's Salesforce is ready,
set `LEAD_DESTINATION=both` for a while to compare the two, then `salesforce`.

## Notes

- Phone numbers are written with a leading apostrophe so Sheets keeps the `0` of `05…`.
- The timestamp is Israel local time, as text.
- "מקור" is the page the form was submitted from, which will show a `?gclid=…` campaign URL
  when the visitor came from Google Ads.
- The sheet is an interim store, not a CRM: anyone with access can see every lead's phone
  number, so keep sharing to the people who need it, and delete the sheet once Salesforce
  is live.
- To rotate the key: create a new JSON key, update the environment variables, then delete
  the old key in the Cloud console.
