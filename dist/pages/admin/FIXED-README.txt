ADMIN ANALYTICS V2 FIX

What was wrong:
- Legacy analytics markup remained after the Analytics v2 section in admin.html.
- That created a duplicate id="analytics-journeys" and obsolete panels such as Drop-Off Signals and Recent Activity.
- The v2 JavaScript and v2 CSS were already correct in the supplied admin package, but the HTML was mixed.

What is fixed:
- Only one Analytics v2 section remains.
- Removed legacy Visitor Trace, Drop-Off Signals and Recent Activity markup.
- Removed duplicate analytics-journeys ID.
- Preserved the v2 modular analytics JavaScript.
- Preserved the v2 analytics stylesheet and master import.
- Verified every static analytics element referenced by views/analytics.js exists in admin.html.
- Verified all modular JS files pass syntax checks.

Deploy the entire admin folder over pages/admin so HTML, JS and CSS stay in the same version.
