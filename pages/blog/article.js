document.addEventListener("DOMContentLoaded", () => {

    const article =
        document.querySelector(".article-page");

    if (!article) {
        return;
    }

    const publishedAt =
        article.dataset.publishedAt;

    const dateElement =
        article.querySelector(".article-date");

    const relativeTimeElement =
        article.querySelector(
            ".article-relative-time"
        );

    if (!publishedAt) {

        if (dateElement) {
            dateElement.textContent = "Draft";
        }

        if (relativeTimeElement) {
            relativeTimeElement.textContent = "";
        }

        return;
    }

    updatePublicationTime();

    setInterval(
        updatePublicationTime,
        30000
    );


    function updatePublicationTime() {

        if (dateElement) {

            dateElement.textContent =
                formatDate(
                    publishedAt
                );

        }

        if (relativeTimeElement) {

            relativeTimeElement.textContent =
                formatRelativeTime(
                    publishedAt
                );

        }

    }


    function formatDate(dateString) {

        const date =
            new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatRelativeTime(dateString) {

        const published =
            new Date(dateString);

        if (Number.isNaN(published.getTime())) {
            return "";
        }

        const now =
            new Date();

        const seconds =
            Math.max(
                0,
                Math.floor(
                    (now - published) / 1000
                )
            );

        if (seconds < 60) {

            return `Published ${seconds} ${
                seconds === 1
                    ? "second"
                    : "seconds"
            } ago`;

        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        if (minutes < 60) {

            return `Published ${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {

            return `Published ${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }

        const days =
            Math.floor(
                hours / 24
            );

        if (days < 7) {

            return `Published ${days} ${
                days === 1
                    ? "day"
                    : "days"
            } ago`;

        }

        const weeks =
            Math.floor(
                days / 7
            );

        if (weeks < 5) {

            return `Published ${weeks} ${
                weeks === 1
                    ? "week"
                    : "weeks"
            } ago`;

        }

        const months =
            Math.floor(
                days / 30
            );

        if (months < 12) {

            return `Published ${months} ${
                months === 1
                    ? "month"
                    : "months"
            } ago`;

        }

        const years =
            Math.floor(
                days / 365
            );

        return `Published ${years} ${
            years === 1
                ? "year"
                : "years"
        } ago`;

    }

});