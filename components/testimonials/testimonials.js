/* =================================
TESTIMONIALS
Loads approved reviews from API
================================= */

(function () {

"use strict";


/* =================================
   CONFIG
================================= */

const API_URL =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev/api/reviews";


/* =================================
   HELPERS
================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function getInitials(name) {

    if (!name) {
        return "?";
    }

    const parts =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


function renderStars(rating) {

    const number =
        Number(rating);


    if (
        !Number.isInteger(number) ||
        number < 1 ||
        number > 5
    ) {
        return "";
    }


    return (
        '<span class="testimonial-stars">' +
        ("★".repeat(number) + "☆".repeat(5 - number)) +
        '</span>'
    );
}


/* =================================
   RENDER
================================= */

function renderReviews(reviews) {

    const grid =
        document.getElementById(
            "testimonials-grid"
        );


    if (!grid) {

        console.warn(
            "Testimonials: grid not found."
        );

        return;
    }


    if (
        !Array.isArray(reviews) ||
        reviews.length === 0
    ) {

        grid.innerHTML =
            '<div class="testimonials-empty">' +
            'Client reviews will appear here once approved.' +
            '</div>';

        return;
    }


    /*
     * Homepage should stay compact.
     * Show the three most recent approved reviews.
     */

    const visibleReviews =
        reviews.slice(0, 3);


    grid.innerHTML =
        visibleReviews
            .map((review, index) => {

                const name =
                    escapeHtml(
                        review.name ||
                        "Client"
                    );


                const business =
                    escapeHtml(
                        review.business ||
                        "Client"
                    );


                const message =
                    escapeHtml(
                        review.review ||
                        ""
                    );


                const initials =
                    escapeHtml(
                        getInitials(
                            review.name
                        )
                    );


                const featured =
                    index === 1
                        ? " testimonial-card-featured"
                        : "";


                const stars =
                    renderStars(
                        review.rating
                    );


                return [
                    '<article class="testimonial-card' + featured + '">',
                    '<div class="testimonial-quote-mark" aria-hidden="true">',
                    '"',
                    '</div>',
                    '<blockquote>',
                    message,
                    '</blockquote>',
                    stars,
                    '<div class="testimonial-author">',
                    '<div class="testimonial-avatar" aria-hidden="true">',
                    initials,
                    '</div>',
                    '<div>',
                    '<strong>',
                    name,
                    '</strong>',
                    '<span>',
                    business,
                    '</span>',
                    '</div>',
                    '</div>',
                    '</article>'
                ].join("");
            })
            .join("");
}


/* =================================
   LOAD
================================= */

async function loadReviews() {

    const grid =
        document.getElementById(
            "testimonials-grid"
        );


    if (!grid) {
        return;
    }


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                (data && data.error) ||
                "Invalid reviews response."
            );

        }


        renderReviews(
            data.reviews || []
        );


    } catch (error) {

        console.error(
            "Testimonials API error:",
            error
        );


        /*
         * Don't expose technical API errors
         * to visitors.
         */

        grid.innerHTML =
            '<div class="testimonials-error">' +
            'Client feedback is temporarily unavailable.' +
            '</div>';
    }
}


/* =================================
   START
================================= */

loadReviews();

})();
