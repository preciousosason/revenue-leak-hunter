# Leakendia Outreach Center — Phase 1

## What is included
- New Outreach sidebar module in the existing Admin Control Room.
- Dashboard: active campaigns, due today, replies, total prospects.
- Campaign archive/list and campaign detail.
- Default 60-prospect campaign target and 15 initial prospects/day scheduling (both configurable).
- Prospect records with website, company, role and research observation.
- Automatic email health check on input using syntax + DNS/MX checks.
- Three health states: unverified, not_receivable, and future/provider-ready receivable.
- Research-ready gate before a prospect appears in Today's Queue.
- Five-follow-up maximum with default intervals: +3, +4, +5, +7, +10 days.
- Automatic sequence stop states supported by backend: replied, converted, not_interested, do_not_contact.
- Do Not Contact suppression table.
- Full per-prospect message history.
- This phase RECORDS a manually sent plain outreach email. It intentionally does not send outreach through Resend.

## 1. Database migration
From the backend folder:

    npx wrangler d1 execute revenue-leak-hunter --remote --file=outreach.sql --config ./wrangler.toml

Or:

    npm run outreach:setup

## 2. Deploy Worker

    npx wrangler deploy --config ./wrangler.toml

## 3. Deploy Admin frontend
Replace/deploy the included `admin/` folder to the same location as your current Admin Control Room.
Hard refresh after deployment.

## Important email-health limitation
DNS/MX can prove that a domain is configured to receive mail, or prove some domains cannot receive mail. It cannot reliably prove that a specific mailbox exists. Therefore the system does not falsely label an MX-only address as definitely human-owned. Those addresses are shown as UNVERIFIED with the reason displayed.

## Sending provider
No cold-outreach provider is connected in this phase. The "Mark as Sent & Schedule Next" action stores the exact subject/body you sent manually and schedules the next follow-up. This keeps Resend isolated for transactional client notifications.
