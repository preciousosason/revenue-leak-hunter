# Marketplace foundation (phases 2–3)

Source inspection: root url-router.js and wrangler.jsonc, backend/src/index.js, backend/src/admin/admin.routes.js, backend/src/utils/auth.js, backend/schema.sql, package scripts and admin navigation. Existing root build syntax checks passed. Production bindings and schema have not been verified.

## Architecture contract
- Frontend Worker renders /marketplace, /marketplace/category/{slug}, /marketplace/service/{slug} using a proposed MARKETPLACE_API service binding. Existing routes untouched. Backend owns D1 writes and public reads. Public catalog APIs only return published services and active offers. Admin APIs under /api/admin/marketplace require authenticateAdmin for every method. Do not forward private authentication headers through public SSR.
- Dedicated private R2 bucket proposed (MARKETPLACE_MEDIA); only publish access through validated media routes associated with published services. No access to existing client bucket. Validate MIME, size and object keys; no SVG uploads initially.
- Category adjacency list and many-to-many service membership; recursive queries deduplicate descendant counts. Validate slugs, category cycles and depth on writes. Immutable IDs, slug history reserved transactionally, no hard deletion of published services. Update timestamps on writes. Publish atomically after validating content, category and at least one active offer. Archive or draft never publicly resolve. Featured independent of lifecycle.
- Offers use integer minor currency units, weekly cadence implicit in weekly model, quotations have null price. Scout 15000, Hunter 20000, Architect 30000 USD minor units; Wildcard quote. No customer-facing seed data until scope is defined. Future orders snapshot offer terms; no payments yet.
- SSR escapes untrusted content, HTML canonical links, unique metadata, breadcrumbs, service structured data and truthful offers. Published detail links in runtime sitemap; merge static sitemap or use sitemap index without losing existing links. Filter URLs canonicalize or noindex as appropriate. Unknown/unpublished 404; upstream outages 503; historical slugs redirect only if target published. HEAD support. Initial public cache no-store to avoid stale publication states; optimize after correctness tests.
- Admin and public modules added independently; extend active admin HTML and navigation only after checking entry points. Keep old services, blog, portal, analytics and outreach untouched.
- Existing CORS is wildcard and permits GET POST PATCH DELETE OPTIONS; new admin routes must restrict origins, use bearer authentication and validation, explicit no-store, and rate limits. CORS is not authorization.

## Installation (local only initially)
Copy backend/migrations/0001_marketplace.sql into the existing backend/migrations directory. Existing backend currently uses explicit SQL file execution scripts. From backend run:

`npx wrangler d1 execute revenue-leak-hunter --local --file=./migrations/0001_marketplace.sql --config ./wrangler.toml`

Then `npx wrangler d1 execute revenue-leak-hunter --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'marketplace_%';" --config ./wrangler.toml`

Expected: eight marketplace tables. No production deployment or existing file replacement. Before remote migration check live schema for collisions, take a recovery checkpoint, and confirm target binding. Do not run destructive rollback; additive unused tables can remain. No production deployment performed here.

Next: phase 4 public/admin APIs, validation, publication transactions and tests. This schema does not enforce every business rule; API validation is required (including immutable IDs, slug history conflicts, category depth, publish completeness and media cleanup).
