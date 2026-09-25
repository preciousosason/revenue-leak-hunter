(function () {

    "use strict";


    const API_URL =
        "https://revenue-leak-hunter-api.preciousosason.workers.dev/api/reviews";


    const CHANGE_INTERVAL = 5000;


    let reviews = [];

    let currentIndex = 0;

    let timer = null;

    let isPaused = false;

    let isRendering = false;


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
                .split(/\s+/);


        if (parts.length === 1) {

            return parts[0]
                .slice(0, 2)
                .toUpperCase();

        }


        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();

    }


    function renderStars(rating) {

        const value =
            Number(rating);


        if (
            !Number.isInteger(value) ||
            value < 1 ||
            value > 5
        ) {
            return "";
        }


        return `
            <div
                class="testimonial-rating"
                aria-label="${value} out of 5 stars"
            >
                ${"★".repeat(value)}
                ${"☆".repeat(5 - value)}
            </div>
        `;

    }


    /* =================================
       DOM
    ================================= */

    function getElements() {

        return {

            stage:
                document.getElementById(
                    "testimonials-stage"
                ),

            progress:
                document.getElementById(
                    "testimonial-progress"
                ),

            previous:
                document.getElementById(
                    "testimonial-prev"
                ),

            next:
                document.getElementById(
                    "testimonial-next"
                )

        };

    }


    /* =================================
       RENDER REVIEW
    ================================= */

    function renderReview() {

        const {
            stage,
            progress
        } = getElements();


        if (!stage || !progress) {
            return;
        }


        if (!reviews.length) {
            return;
        }


        const review =
            reviews[currentIndex];


        if (!review) {
            return;
        }


        isRendering = true;


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


        stage.innerHTML = `

            <article
                class="testimonial-card"
                tabindex="0"
                aria-label="Client review"
            >

                <div
                    class="testimonial-quote-mark"
                    aria-hidden="true"
                >
                    “
                </div>


                <blockquote>
                    ${message}
                </blockquote>


                ${renderStars(review.rating)}


                <div class="testimonial-author">

                    <div
                        class="testimonial-avatar"
                        aria-hidden="true"
                    >
                        ${initials}
                    </div>


                    <div>

                        <strong>
                            ${name}
                        </strong>

                        <span>
                            ${business}
                        </span>

                    </div>

                </div>

            </article>

        `;


        progress.innerHTML =
            reviews
                .map(
                    (item, index) => `
                        <button
                            type="button"
                            class="${
                                index === currentIndex
                                    ? "active"
                                    : ""
                            }"
                            aria-label="Show review ${
                                index + 1
                            }"
                            aria-current="${
                                index === currentIndex
                                    ? "true"
                                    : "false"
                            }"
                            data-review-index="${index}"
                        ></button>
                    `
                )
                .join("");


        progress
            .querySelectorAll(
                "button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.reviewIndex
                            );


                        if (
                            Number.isInteger(index)
                        ) {

                            currentIndex =
                                index;

                            renderReview();

                            restartTimer();

                        }

                    }
                );

            });


        const card =
            stage.querySelector(
                ".testimonial-card"
            );


        if (card) {

            card.addEventListener(
                "pointerdown",
                pauseRotation
            );

            card.addEventListener(
                "pointerup",
                resumeRotation
            );

            card.addEventListener(
                "pointercancel",
                resumeRotation
            );

            card.addEventListener(
                "pointerleave",
                resumeRotation
            );

            card.addEventListener(
                "focus",
                pauseRotation
            );

            card.addEventListener(
                "blur",
                resumeRotation
            );

        }


        isRendering = false;

    }


    /* =================================
       NAVIGATION
    ================================= */

    function nextReview() {

        if (!reviews.length) {
            return;
        }


        currentIndex =
            (currentIndex + 1) %
            reviews.length;


        renderReview();

    }


    function previousReview() {

        if (!reviews.length) {
            return;
        }


        currentIndex =
            (
                currentIndex -
                1 +
                reviews.length
            ) %
            reviews.length;


        renderReview();

    }


    /* =================================
       AUTO ROTATION
    ================================= */

    function startTimer() {

        stopTimer();


        if (
            reviews.length <= 1 ||
            isPaused
        ) {
            return;
        }


        timer =
            setInterval(
                function () {

                    if (!isPaused) {
                        nextReview();
                    }

                },
                CHANGE_INTERVAL
            );

    }


    function stopTimer() {

        if (timer) {

            clearInterval(timer);

            timer = null;

        }

    }


    function restartTimer() {

        stopTimer();

        startTimer();

    }


    function pauseRotation() {

        isPaused = true;

        stopTimer();

    }


    function resumeRotation() {

        isPaused = false;

        restartTimer();

    }


    /* =================================
       LOAD REVIEWS
    ================================= */

    async function loadTestimonials() {

        const {
            stage,
            previous,
            next
        } = getElements();


        if (!stage) {

            console.error(
                "[Testimonials] Stage not found."
            );

            return;

        }


        console.log(
            "[Testimonials] JavaScript loaded."
        );


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


            console.log(
                "[Testimonials] API status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    `API returned ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.error ||
                    "Unable to load reviews."
                );

            }


            reviews =
                Array.isArray(data.reviews)
                    ? data.reviews
                    : [];


            if (!reviews.length) {

                stage.innerHTML = `
                    <div class="testimonials-empty">
                        No approved client reviews yet.
                    </div>
                `;

                return;

            }


            /*
             * Keep the homepage focused.
             * The full reviews page can show everything.
             */
            reviews =
                reviews.slice(0, 10);


            currentIndex = 0;


            renderReview();


            if (previous) {

                previous.addEventListener(
                    "click",
                    function () {

                        previousReview();

                        restartTimer();

                    }
                );

            }


            if (next) {

                next.addEventListener(
                    "click",
                    function () {

                        nextReview();

                        restartTimer();

                    }
                );

            }


            /*
             * Pause when the visitor's pointer
             * enters the review area.
             */
            stage.addEventListener(
                "mouseenter",
                pauseRotation
            );


            stage.addEventListener(
                "mouseleave",
                resumeRotation
            );


            /*
             * Pause while the visitor is
             * pressing/holding the review.
             */
            stage.addEventListener(
                "pointerdown",
                pauseRotation
            );


            stage.addEventListener(
                "pointerup",
                resumeRotation
            );


            stage.addEventListener(
                "pointercancel",
                resumeRotation
            );


            /*
             * Keyboard accessibility.
             */
            stage.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "ArrowLeft"
                    ) {

                        previousReview();

                        restartTimer();

                    }


                    if (
                        event.key === "ArrowRight"
                    ) {

                        nextReview();

                        restartTimer();

                    }

                }
            );


            startTimer();


            console.log(
                "[Testimonials] Reviews loaded:",
                reviews.length
            );

        } catch (error) {

            console.error(
                "[Testimonials] Failed:",
                error
            );


            stage.innerHTML = `
                <div class="testimonials-error">
                    Client feedback could not be loaded.
                </div>
            `;

        }

    }


    /* =================================
       INITIALIZE
    ================================= */

    loadTestimonials();

})();