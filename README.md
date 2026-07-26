# SoCal Strategy & OT Workshop

Live at <https://socalstrategyot.github.io>.

Static site for the annual SoCal Strategy & Organization Theory Workshop.
Plain HTML/CSS/JS — no build step, no dependencies.

- [index.html](index.html) — all page content
- [style.css](style.css) — styles
- [signup.js](signup.js) — email sign-up form handler
- [google-apps-script.gs](google-apps-script.gs) — the Google Sheets collector

## Editing content

Everything is in `index.html`. To add next year's workshop, copy an `<article
class="year">` block into the "Past workshops" section and update the hero.

## Wiring the sign-up form to Google Sheets

**Already wired** — `ENDPOINT` in `signup.js` points at a deployed Apps Script
web app, and submissions append to the `Signups` tab of the linked Sheet. The
steps below are for reference, or if the endpoint ever needs replacing.

The form posts to a Google Apps Script web app, which appends a row to a Sheet
you own. Ten-minute, one-time setup:

1. Create a new Google Sheet (name it e.g. "SoCal Workshop Signups").
2. In that Sheet: **Extensions → Apps Script**. Delete the starter code and
   paste in the contents of `google-apps-script.gs`. Save.
3. **Deploy → New deployment → Web app**:
   - Description: `signups`
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click Deploy and authorize when prompted (you'll click through a "Google
   hasn't verified this app" screen — it's your own script).
4. Copy the **Web app URL** (ends in `/exec`).
5. Paste it into `ENDPOINT` at the top of `signup.js`, commit, and push.

Test by submitting the live form; a row should appear in the `Signups` tab.

Optional: **Tools → Notification settings** in the Sheet to get an email on each
new response.

If you re-edit the Apps Script later, use **Deploy → Manage deployments → Edit →
New version**, or the URL will keep serving the old code.

### Before it's wired up

While `ENDPOINT` is empty the form falls back to opening a pre-filled `mailto:`
to the address in `FALLBACK_EMAIL`. Nothing breaks; sign-ups just arrive as
email.

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment

GitHub Pages, served from the `main` branch root of an organization-owned
`*.github.io` repo, so the URL survives the annual host rotation. To hand the
site to next year's organizers, add them as org owners — no URL change, no
migration.
