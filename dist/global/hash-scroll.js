
/*
 * LEAKENDIA — HASH NAVIGATION FIX
 *
 * Handles same-page fragment links even when
 * the Cloudflare router injects a <base> element.
 *
 * Does not modify scripts, CSS, images, or routing.
 */

(function () {
    "use strict";

    if (window.__leakendiaHashScrollInitialized) {
        return;
    }

    window.__leakendiaHashScrollInitialized = true;

    document.addEventListener("click", function (event) {
        if (event.defaultPrevented) return;

        const link = event.target.closest("a[href]");

        if (!link) return;

        const href = link.getAttribute("href");

        if (!href || !href.startsWith("#") || href === "#") {
            return;
        }

        let targetId;

        try {
            targetId = decodeURIComponent(href.slice(1));
        } catch {
            return;
        }

        const target = document.getElementById(targetId);

        if (!target) return;

        event.preventDefault();

        history.pushState(
            null,
            "",
            window.location.pathname +
            window.location.search +
            href
        );

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
})();
