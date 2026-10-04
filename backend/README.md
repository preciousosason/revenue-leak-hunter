# Leakendia Phase 1 Email Notifications

Replace `src/admin/messages.js` and add the `src/email/` directory.

The supplied package.json already includes Resend. The Worker must have `RESEND_API_KEY` as a Wrangler secret and `leakendia.com` must be verified in Resend before using `notifications@leakendia.com`.

Deploy with:

    npx wrangler deploy --name revenue-leak-hunter-api

Optional Worker vars: `EMAIL_FROM`, `EMAIL_REPLY_TO`, `CLIENT_PORTAL_URL`.

Email failure does not roll back a saved admin reply or portal notification.
