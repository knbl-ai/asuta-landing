# Sending leads to a private Google Sheet

While Salesforce is unavailable, leads can be written to a Google Sheet instead — or to
both at once.

There are two ways to connect the sheet. Both keep it **private** — neither requires
sharing it publicly, and an API key cannot be used at all, because the Sheets API does not
accept API keys for writes whatever the sharing settings say.

| | Apps Script web app | Service account |
|---|---|---|
| Setup | ~3 minutes, inside the sheet | ~10 minutes, Google Cloud console |
| Credentials | one URL + a shared secret | a private key to store and rotate |
| Good for | the interim period until Salesforce is live | a permanent integration |

## Option A — Apps Script web app (quickest)

1. Open the leads spreadsheet → **Extensions → Apps Script**.
2. Replace the contents of `Code.gs` with [`docs/apps-script/Code.gs`](apps-script/Code.gs)
   from this repository.
3. At the top of the script set `SECRET` to a long random string of your own, for example
   the output of `openssl rand -hex 16`. Keep it: it goes into the site's environment too.
4. **Deploy → New deployment → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy, approve the permission prompt, and copy the `/exec` URL.

   "Anyone" means anyone who knows that URL can call the script — not that the spreadsheet
   is public. The `SECRET` check is what stops a stranger who finds the URL from writing rows.
5. Set two variables (`.env.local` locally, Vercel's Environment Variables for the site):

```bash
LEAD_DESTINATION=sheets            # or: both
GOOGLE_SHEETS_WEBAPP_URL=https://script.google.com/macros/s/AKfy…/exec
GOOGLE_SHEETS_WEBAPP_TOKEN=<the same SECRET>
```

6. Check it, which appends one test row:

```bash
npm run sheets:check
```

To change the script later, edit it and use **Deploy → Manage deployments → Edit → New
version**; editing alone does not update the live URL.

## Option B — service account

Use this for a permanent setup, or if a script deployment is not acceptable.

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

```bash
LEAD_DESTINATION=sheets          # or: both
GOOGLE_SHEETS_ID=1AbC…xyz
GOOGLE_SHEETS_TAB=Leads
GOOGLE_SERVICE_ACCOUNT_EMAIL=asuta-leads@asuta-landing.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN…\n-----END PRIVATE KEY-----\n"
```

Copy `private_key` from the JSON exactly as it appears there, with the `\n` sequences and
the surrounding quotes. On Vercel the key can also be pasted with real line breaks.
`npm run sheets:check` verifies it the same way.

If both transports are configured, the web app wins.

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
