LEAKENDIA PREMIUM EMAIL UPDATE

1. Replace backend/src/email/email.js with src/email/email.js
2. Replace backend/src/email/templates.js with src/email/templates.js
3. Copy public/assets/brand/leakendia-email-mark.jpg into the matching public website path so this URL works:
   https://leakendia.com/assets/brand/leakendia-email-mark.jpg
4. Deploy your Pages site so the logo is public.
5. Deploy the Worker:
   npx wrangler deploy --config .\wrangler.toml

Optional Worker vars:
EMAIL_FROM
EMAIL_REPLY_TO
CLIENT_PORTAL_URL
EMAIL_LOGO_URL
