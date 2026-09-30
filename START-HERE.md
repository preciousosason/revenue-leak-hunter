# Conversion Leak Hunter — Analytics v2

This is a complete replacement admin folder and backend folder, plus a new public-site tracker. The files preserve your existing API URL, D1 database binding, R2 binding, and unrelated admin modules.

**Install in this order: database → backend → admin → public tracker.** Uploading only the admin folder will not install the analytics system.

## 1. Back up and apply the schema

Keep a copy of your current project. Open a terminal in the updated `backend` folder. Use Node.js 24 or newer for the included regression tests.

```powershell
npm ci
npx wrangler d1 export revenue-leak-hunter --remote --output=before-analytics-v2.sql
npx wrangler d1 execute revenue-leak-hunter --remote --file=analytics-v2.sql
```

These commands use your own Cloudflare login. `analytics-v2.sql` is additive and safe to run again. It does not drop, rename, or rewrite your old analytics, clients, conversations, or messages. For a fresh database, apply the original project schemas first; this upgrade assumes the existing application database.

The new contact handler writes confirmed lead records into the v2 tables. **Apply the schema before deploying that handler.**

## 2. Configure and deploy the backend

In `backend/wrangler.toml`, keep your existing database/bucket values. Under `[vars]`, uncomment and edit this line with your actual public website origins:

```toml
ANALYTICS_ALLOWED_ORIGINS = "https://your-domain.com,https://www.your-domain.com"
```

Use origins only: no paths or trailing slash. Include your local development origin when testing locally. The API permits origins when this setting is omitted, so configure it for production. This is an ingestion filter, not a replacement for rate limiting or admin authentication.

Then run:

```powershell
npm test
npx wrangler deploy --dry-run
npm run deploy
```

The package pins Wrangler to the version already present in your original lockfile. Existing Cloudflare secrets remain managed in your account. No new secrets are required for analytics.

A daily scheduled job removes sessions and their events after 180 days by default. Edit `ANALYTICS_RETENTION_DAYS` to change this (30–730 days). Verified lead records remain, with expired session attribution detached. The scheduled job also removes expired rate-limit buckets. Disable or adjust this retention setting before deploying if you need a longer observation window.

## 3. Replace the admin folder

Replace your website's `admin` folder with the complete updated `admin` folder in this package. Keep the same folder name and relative location. The loaded entry point remains `admin/admin.html`, which imports `admin/js/admin.js` and `admin/css/admin.css`.

Your existing API address is retained in `admin/js/core/config.js`. Update it only if your backend URL changes. Upload the entire folder and refresh the browser cache so old CSS/JavaScript is not mixed with the new HTML.

## 4. Install the public website tracker

Copy `website/leak-analytics.js` to `/assets/js/leak-analytics.js` in your public website. Remove the previous analytics collector if you already have one. Running two collectors would double-count page views because they generate different event IDs.

Add this once in the `<head>` of every public page, before the scripts that submit your contact form:

```html
<script>
  window.LEAK_ANALYTICS_CONFIG = {
    apiUrl: "https://revenue-leak-hunter-api.preciousosason.workers.dev",
    enabled: true,
    internal: false,
    autoLinkContact: true
  };
</script>
<script defer src="/assets/js/leak-analytics.js"></script>
```

`enabled: true` starts collection immediately except when the visitor opts out, has Do Not Track/Global Privacy Control enabled, or is on `/admin`. If your site waits for a consent choice, start with `enabled: false`, then call `LeakAnalytics.grantConsent()` when granted. Call `LeakAnalytics.revokeConsent()` when withdrawn. It stops future collection and clears local queued analytics; it does not delete records already stored on the server.

Use `internal: true` for your testing so the admin can exclude your traffic by default. This is a visitor-declared flag, not proof that traffic is internal. Changing it requires a new session (clear this tracker's sessionStorage entry or use a fresh browser session).

### Label the important elements

```html
<a href="/pages/leak-audit/" data-analytics-cta="start-leak-hunt">
  Start a Leak Hunt
</a>

<form id="leak-audit-form" data-analytics-form="leak-audit">
  <input name="email" type="email" required>
  <!-- Your existing fields and submit button -->
</form>
```

CTA IDs, form IDs, field names and attempt IDs are recorded; field values are not. Use consistent IDs across pages. Add `data-analytics-ignore` to forms/elements you do not want automatically observed.

### Connect successful enquiries

The tracker includes a narrow adapter for ordinary `fetch(API_URL + "/api/contact", { method: "POST", body: JSON.stringify(payload) })` calls. It adds the current session/form-attempt context. Your existing backend response and frontend success UI stay the same.

**Your actual public contact JavaScript was not included in the two supplied ZIPs.** The adapter was tested with a real JSON `fetch()` submission, but your live form still needs the smoke test below. Requests using XHR, `FormData`, a preconstructed `Request`, a different URL, or a saved reference to `fetch` from before this tracker loads need explicit integration.

For explicit integration, set `autoLinkContact: false` and change the JSON body in your existing submit handler:

```js
const form = document.getElementById("leak-audit-form");
const payload = { /* your existing name, email, offer, problem, etc. */ };

const body = window.LeakAnalytics
  ? window.LeakAnalytics.enrichContact(payload, form)
  : payload;

const response = await fetch(`${API_URL}/api/contact`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
```

Do not emit a browser `lead_created` or `portal_created` event. Only a successful backend contact transaction creates a verified enquiry. An enquiry can still succeed without tracking and appears as unattributed in the lead list.

For custom JavaScript validation that does not use native HTML validation:

```js
window.LeakAnalytics?.formError(form, "website", "invalid_url");
```

Pass a categorical error code, never the visitor's entered value or full server error message.

For client-side navigation, call `LeakAnalytics.pageView()` after the path changes for immediate tracking. Ordinary page navigation works automatically; a 10-second path check also covers missed changes. Avoid calling it twice for the same navigation. For an article view, you can call `LeakAnalytics.track("article_view", {article_id: "your-article-slug"})` once when it is displayed.

## 5. Verify on your website

1. Open a public page with `?utm_source=installation-test&utm_medium=manual` in a fresh browser session, with tracking enabled.
2. Click a labelled CTA, focus a form field, and trigger one required-field error.
3. Submit a genuine test enquiry using an email address not already registered.
4. Open the admin analytics page and apply the date range. If testing with `internal: true`, check **Include test traffic**.
5. Confirm the source, journey events, form attempt, validation error, and verified enquiry appear. A click or failed submission must not increase verified enquiries.
6. Change the lead stage to Qualified. Confirm it remains after refreshing.
7. Check the Network panel: analytics requests should succeed, while requests from an unlisted origin should be rejected. `429` means the rate limit was reached; queued events retry later.
8. Check a phone-width viewport and export CSV. If data is missing, check tracker installation, origin settings, consent/opt-out, blockers, and the API URL.

## What the metrics mean

- A session is a browser-generated ID, renewed after 30 minutes without tracked activity. Visitors are browser IDs; they are not verified people or cross-device identities.
- Main reports select sessions **started** within the range and use events/enquiries before its exclusive end. Cross-midnight sessions remain in their starting cohort. Historical reports do not include future conversions.
- Enquiry rate = sessions with a backend-confirmed enquiry / sessions. Multiple events and CTA clicks never count as enquiries.
- Engagement rate = sessions with at least 10 seconds of measured foreground activity, two page views, or a verified enquiry / sessions. Time is an estimate based on visible, focused pages, not proof of attention.
- The direct funnel counts ordered session progression. Its last step requires a form start followed by a verified enquiry. Form diagnostics additionally match the same form and attempt IDs.
- Lead stage counts use the **current** stage, not a historical snapshot. The lead table uses enquiry creation dates, unlike the session-cohort summary.
- Dates default to Africa/Lagos. UTC is available. Comparison periods have equal elapsed duration; today is partial. Incomplete retained history is flagged.
- Sources and campaigns are session-entry, browser-supplied attribution. Source conversion is an association, not causal proof. First-touch, cross-device attribution, visual session replay, payments, and experiment significance are not implemented.
- Last-page exits exclude converted sessions and sessions active in the preceding 30 minutes. They are observations, not a diagnosis.
- Insights use explicit rules and show counts. They are not AI-generated claims of causation or estimated lost revenue.
- Old v1 tables remain in the database but are not mixed into the new definitions. Existing pre-upgrade clients are not retroactively labelled as tracked conversions. Fresh v2 data starts after installation.

## Files changed

| Location | Purpose |
|---|---|
| `admin/admin.html` | Complete analytics view markup |
| `admin/js/views/analytics.js` | Filters, metrics, SVG trends, independent panels, pagination, lead stages, export, session dialog |
| `admin/css/pages/analytics.css` | Responsive analytics design |
| `backend/analytics-v2.sql` | Additive schema, indexes, identity guard and session trigger |
| `backend/src/analytics/common.js` | Validation, redaction, session and lead statements, rate limits |
| `backend/src/analytics/events.js` | Idempotent collector and retention cleanup |
| `backend/src/analytics/admin.js` | Cohort reports, funnel, form diagnostics, lead/journey APIs |
| `backend/src/analytics/analytics.routes.js` | Analytics routes |
| `backend/src/contact/contact.js` | Atomic contact + verified enquiry transaction |
| `backend/src/config/cors.js` | PATCH support for authenticated lead-stage changes |
| `backend/src/index.js` | Scheduled analytics cleanup |
| `backend/wrangler.toml` | Retention configuration and daily schedule |
| `backend/package.json`, `package-lock.json` | Test/setup commands, module type and pinned existing Wrangler version |
| `backend/tests/analytics.test.mjs` | Regression tests using real SQLite queries |
| `website/leak-analytics.js` | Public collector, form diagnostics and contact adapter |

The other project files are included so these are full folders, not isolated snippets. Original credential/test JSON files, if present in your source, are not needed for installation; keep backend files out of your public static website directory.

## Verification performed

- 20 backend regression checks passed: retry idempotency, ownership, identity constraints, redaction, malformed/oversized input, origin/rate limits, ordered events, contact transactions/rollback, attribution, conversion definitions, range validation, empty reports, filtering, pagination, lead stages, retention and rerunnable migration.
- The Cloudflare Worker dry-run build passed.
- Local Cloudflare workerd/D1 passed schema creation, ingestion, duplicate retry, atomic contact creation and analytics/report queries.
- Chromium checks exercised dashboard loading, source filtering, journey pagination/dialog, lead-stage saving, CSV export, and document overflow at 768, 390 and 320px.
- The public tracker was tested through a real form/JSON fetch submission into the updated backend. Session/form/source attribution succeeded, input values were absent from event payloads, and opt-out stopped new events.
- Desktop and mobile screenshots were visually inspected. No live Cloudflare database or deployed website was changed during preparation.

## Rollback

Restore your saved original admin and backend files, then redeploy that original backend. The old analytics tables are still present. The additive v2 tables can remain unused; do not delete them as part of a rushed rollback. Restore the old collector only after removing the new one.

Platform references: [D1 batch transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/), [D1 SQL support](https://developers.cloudflare.com/d1/sql-api/sql-statements/).
