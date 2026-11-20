# Master bundle: initial modules, not a complete marketplace
No existing files are replaced. The prior migration and category module are included verbatim for fresh installs; skip identical existing copies.

## Integration deferred
- Register category and catalog handlers in backend/src/index.js after existing OPTIONS handling.
- Configure frontend Worker MARKETPLACE_API service binding; call handleMarketplacePage from url-router.js; ensure CSS is copied to dist.
- Mount admin view through existing navigation; verify API_URL prefix before calling.
- Catalog supports draft creation, edits, archive, public listings and detail retrieval. Publishing is deliberately locked. Offers/content/category assignment writes, media uploads, slug redirects, complete admin UI, structured data, sitemap, cache invalidation, orders and payments remain unimplemented. No placeholder payment endpoints.
- SSR is a minimal standalone layout, not shared site chrome. Category links and search work once integrated; full expandable sidebar, filters UI and pagination need further work.
- No production deployment. Review and integration tests required.
