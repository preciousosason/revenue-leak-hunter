# Leakendia Manual Email Notifications

## What changed

Normal admin conversation replies no longer send Resend email automatically.
Each conversation now has three manual email actions:

1. Send Notification — premium existing reply/update template.
2. Send Welcome Notification — new premium welcome template.
3. Compose Notification — custom subject + custom message inside Leakendia's branded email shell.

Every email attempt is stored in D1 with sent/failed status and shown in the conversation's email history.

## Backend files

Copy the supplied backend files into the matching locations in your backend project.
The new file is:

- src/admin/email-notifications.js

Updated files include:

- src/admin/messages.js
- src/admin/admin.routes.js
- src/email/email.js
- src/email/templates.js
- package.json

## D1 migration — RUN THIS BEFORE DEPLOYING THE WORKER

From your backend directory:

    npx wrangler d1 execute revenue-leak-hunter --remote --file=email-notifications.sql --config .\wrangler.toml

Or, because package.json now contains the setup script:

    npm run email:setup -- --config .\wrangler.toml

The migration creates `email_notifications` and its indexes. It is safe to run again because it uses IF NOT EXISTS.

## Deploy backend

    npx wrangler deploy --config .\wrangler.toml

## Admin frontend

Deploy the supplied `admin` folder to the same place your current Admin Control Room is hosted.
The live modular files changed are primarily:

- admin.html
- js/views/conversation.js
- js/core/state.js
- css/pages/conversations.css

## Test order

1. Open a test client conversation.
2. Send a normal portal reply. Confirm NO email arrives.
3. Click Send Notification. Confirm the premium update email arrives.
4. Click Send Welcome Notification. Confirm the welcome email arrives.
5. Click Compose Notification, enter subject/message, and send.
6. Confirm all three appear in Email Activity with SENT status.

The recipient is locked to the email belonging to the current conversation. Compose Notification cannot silently target another client.
