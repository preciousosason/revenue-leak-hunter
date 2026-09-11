/* =========================================
   ARTICLE SYSTEM
========================================= */


/*
 * Converts an ISO date into a clean
 * human-readable date.
 */

function formatArticleDate(dateString) {

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);
}


/*
 * Calculates a human-friendly
 * relative publication time.
 */

function getRelativeTime(dateString) {

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();

    const difference =
        now.getTime() - date.getTime();

    const seconds =
        Math.floor(difference / 1000);

    if (seconds < 60) {
        return "Just now";
    }

    const minutes =
        Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d ago`;
    }

    return formatArticleDate(dateString);
}


/*
 * Displays the article's date.
 */

function initializeArticleDate() {

    const element =
        document.querySelector(
            "[data-published-at]"
        );

    if (!element) {
        return;
    }

    const date =
        element.dataset.publishedAt;

    element.textContent =
        formatArticleDate(date);

    element.title =
        getRelativeTime(date);
}


/*
 * Automatically calculates reading time
 * based on the article's text.
 */

function calculateReadingTime() {

    const article =
        document.querySelector(
            ".article-body"
        );

    const target =
        document.querySelector(
            "[data-reading-time]"
        );

    if (!article || !target) {
        return;
    }

    const text =
        article.innerText.trim();

    const words =
        text.split(/\s+/).filter(Boolean);

    const wordsPerMinute = 200;

    const minutes =
        Math.max(
            1,
            Math.ceil(
                words.length /
                wordsPerMinute
            )
        );

    target.textContent =
        `${minutes} min read`;
}


/*
 * Share article using the native
 * Web Share API when available.
 */

function initializeSharing() {

    const shareButton =
        document.querySelector(
            "[data-share]"
        );

    if (!shareButton) {
        return;
    }

    shareButton.addEventListener(
        "click",
        async () => {

            const shareData = {

                title:
                    document.title,

                text:
                    document
                        .querySelector(
                            ".article-excerpt"
                        )
                        ?.textContent || "",

                url:
                    window.location.href

            };


            if (
                navigator.share
            ) {

                try {

                    await navigator.share(
                        shareData
                    );

                } catch (error) {

                    /*
                     * User cancelled sharing.
                     * No action required.
                     */

                }

                return;

            }


            /*
             * Fallback for browsers
             * without Web Share API.
             */

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );

                shareButton.textContent =
                    "✓";

                setTimeout(
                    () => {

                        shareButton.textContent =
                            "↗";

                    },
                    1800
                );

            } catch (error) {

                console.error(
                    "Unable to copy article URL.",
                    error
                );

            }

        }
    );
}


/*
 * Initialize everything.
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeArticleDate();

        calculateReadingTime();

        initializeSharing();

    }
);