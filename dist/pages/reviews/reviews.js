const REVIEWS_API =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev/api/reviews";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadReviews();

        setupReviewForm();

        setupReviewRating();

        setupCharacterCounter();

        setupReviewButton();

    }
);


/* =================================
   LOAD REVIEWS
================================= */

async function loadReviews() {

    const container =
        document.getElementById(
            "reviews-list"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                REVIEWS_API
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {
            throw new Error(
                "Unable to load reviews."
            );
        }

        const reviews =
            Array.isArray(
                data.reviews
            )
                ? data.reviews
                : [];

        renderReviews(
            reviews
        );

        updateReviewSummary(
            reviews
        );

    } catch (error) {

        console.error(
            "Review loading error:",
            error
        );

        container.innerHTML = `
            <div class="reviews-state">
                Unable to load reviews right now.
            </div>
        `;

    }

}


/* =================================
   RENDER REVIEWS
================================= */

function renderReviews(
    reviews
) {

    const container =
        document.getElementById(
            "reviews-list"
        );

    if (!reviews.length) {

        container.innerHTML = `
            <div class="reviews-state">
                No reviews have been published yet.
            </div>
        `;

        return;
    }


    container.innerHTML =
        reviews
            .map(
                (review) => {

                    const rating =
                        Number(
                            review.rating
                        );

                    const stars =
                        "★".repeat(
                            rating
                        ) +
                        "☆".repeat(
                            5 - rating
                        );

                    const business =
                        review.business
                            ? `
                                <span class="review-card-business">
                                    ${escapeHtml(
                                        review.business
                                    )}
                                </span>
                            `
                            : "";

                    const date =
                        formatReviewDate(
                            review.created_at
                        );


                    return `
                        <article class="review-card">

                            <div
                                class="review-card-stars"
                                aria-label="${rating} out of 5 stars"
                            >
                                ${stars}
                            </div>

                            <p class="review-card-text">
                                ${escapeHtml(
                                    review.review
                                )}
                            </p>

                            <div class="review-card-author">

                                <span class="review-card-name">
                                    ${escapeHtml(
                                        review.name
                                    )}
                                </span>

                                ${business}

                            </div>

                            ${
                                date
                                    ? `
                                        <div class="review-card-date">
                                            ${date}
                                        </div>
                                    `
                                    : ""
                            }

                        </article>
                    `;

                }
            )
            .join("");

}


/* =================================
   REVIEW SUMMARY
================================= */

function updateReviewSummary(
    reviews
) {

    const total =
        reviews.length;


    const average =
        total
            ? reviews.reduce(
                  (
                      sum,
                      review
                  ) =>
                      sum +
                      Number(
                          review.rating
                      ),
                  0
              ) / total
            : 0;


    const averageElement =
        document.getElementById(
            "reviews-average-rating"
        );

    const totalElement =
        document.getElementById(
            "reviews-total-count"
        );


    if (averageElement) {

        averageElement.textContent =
            average.toFixed(1);

    }


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    const counts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };


    reviews.forEach(
        (review) => {

            const rating =
                Number(
                    review.rating
                );

            if (
                counts[rating] !==
                undefined
            ) {

                counts[rating]++;

            }

        }
    );


    for (
        let rating = 1;
        rating <= 5;
        rating++
    ) {

        const count =
            counts[rating];


        const countElement =
            document.querySelector(
                `[data-rating-count="${rating}"]`
            );


        const fillElement =
            document.querySelector(
                `[data-rating-fill="${rating}"]`
            );


        if (countElement) {

            countElement.textContent =
                count;

        }


        if (fillElement) {

            const percentage =
                total
                    ? (
                          count /
                          total
                      ) * 100
                    : 0;

            fillElement.style.width =
                `${percentage}%`;

        }

    }


    const starsElement =
        document.getElementById(
            "reviews-average-stars"
        );


    if (starsElement) {

        const rounded =
            Math.round(
                average
            );

        starsElement.textContent =
            "★".repeat(
                rounded
            ) +
            "☆".repeat(
                5 - rounded
            );

    }

}


/* =================================
   REVIEW FORM
================================= */

function setupReviewForm() {

    const form =
        document.getElementById(
            "review-form"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document
                    .getElementById(
                        "review-name"
                    )
                    .value
                    .trim();


            const business =
                document
                    .getElementById(
                        "review-business"
                    )
                    .value
                    .trim();


            const review =
                document
                    .getElementById(
                        "review-text"
                    )
                    .value
                    .trim();


            const rating =
                Number(
                    document
                        .getElementById(
                            "review-rating-value"
                        )
                        .value
                );


            if (!name) {

                showFormMessage(
                    "Please enter your name.",
                    "error"
                );

                return;
            }


            if (
                !rating ||
                rating < 1 ||
                rating > 5
            ) {

                showFormMessage(
                    "Please select a rating.",
                    "error"
                );

                return;
            }


            if (
                review.length < 10
            ) {

                showFormMessage(
                    "Your review must be at least 10 characters.",
                    "error"
                );

                return;
            }


            const submitButton =
                document.getElementById(
                    "review-submit-button"
                );


            submitButton.disabled =
                true;

            submitButton.textContent =
                "Submitting...";


            try {

                const response =
                    await fetch(
                        REVIEWS_API,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    {
                                        name,
                                        business:
                                            business ||
                                            null,
                                        rating,
                                        review
                                    }
                                )
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    const message =
                        data?.errors
                            ? Object.values(
                                  data.errors
                              )[0]
                            : data?.error ||
                              "Unable to submit your review.";

                    throw new Error(
                        message
                    );

                }


                form.reset();


                document
                    .getElementById(
                        "review-rating-value"
                    )
                    .value = "";


                document
                    .querySelectorAll(
                        ".rating-star"
                    )
                    .forEach(
                        (star) => {

                            star.classList.remove(
                                "is-selected"
                            );

                        }
                    );


                document
                    .getElementById(
                        "review-character-count"
                    )
                    .textContent = "0";


                showFormMessage(
                    "Your review has been submitted and is awaiting approval.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Review submission error:",
                    error
                );


                showFormMessage(
                    error.message ||
                        "Unable to submit your review.",
                    "error"
                );


            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit review";

            }

        }
    );

}


/* =================================
   STAR RATING
================================= */

function setupReviewRating() {

    const stars =
        document.querySelectorAll(
            ".rating-star"
        );


    const ratingInput =
        document.getElementById(
            "review-rating-value"
        );


    stars.forEach(
        (star) => {

            star.addEventListener(
                "click",
                () => {

                    const rating =
                        Number(
                            star.dataset
                                .rating
                        );


                    ratingInput.value =
                        rating;


                    stars.forEach(
                        (item) => {

                            const value =
                                Number(
                                    item.dataset
                                        .rating
                                );


                            item.classList.toggle(
                                "is-selected",
                                value <=
                                    rating
                            );

                        }
                    );

                }
            );

        }
    );

}


/* =================================
   CHARACTER COUNTER
================================= */

function setupCharacterCounter() {

    const textarea =
        document.getElementById(
            "review-text"
        );


    const counter =
        document.getElementById(
            "review-character-count"
        );


    if (
        !textarea ||
        !counter
    ) {
        return;
    }


    textarea.addEventListener(
        "input",
        () => {

            counter.textContent =
                textarea.value.length;

        }
    );

}


/* =================================
   OPEN REVIEW FORM
================================= */

function setupReviewButton() {

    const button =
        document.getElementById(
            "open-review-form"
        );


    const section =
        document.getElementById(
            "review-form-section"
        );


    if (
        !button ||
        !section
    ) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            section.scrollIntoView(
                {
                    behavior:
                        "smooth",
                    block:
                        "start"
                }
            );

        }
    );

}


/* =================================
   FORM MESSAGE
================================= */

function showFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "review-form-message"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `review-form-message is-visible is-${type}`;

}


/* =================================
   HTML ESCAPING
================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =================================
   DATE FORMAT
================================= */

function formatReviewDate(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(
            value.replace(
                " ",
                "T"
            ) + "Z"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}