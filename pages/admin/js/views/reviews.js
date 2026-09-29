import {
    api
} from "../core/api.js";

import state, {
    setReviews
} from "../core/state.js";

import {
    escapeHTML,
    formatRelativeTime,
    getInitials
} from "../core/utils.js";


export async function loadReviews() {

    const reviewsList =
        document.getElementById(
            "reviews-list"
        );

    try {

        const data =
            await api(
                "/api/admin/reviews"
            );

        setReviews(
            Array.isArray(data.reviews)
                ? data.reviews
                : []
        );

        renderReviews();
        updateReviewSummary();

    } catch (error) {

        console.error(
            "Review loading error:",
            error
        );

        if (reviewsList) {

            reviewsList.innerHTML = `
                <div class="reviews-empty">
                    <div class="reviews-empty-mark">!</div>

                    <strong class="reviews-empty-title">
                        REVIEW DATABASE UNAVAILABLE
                    </strong>

                    <p class="reviews-empty-description">
                        ${escapeHTML(error.message)}
                    </p>
                </div>
            `;

        }

    }

}


function getFilteredReviews() {

    if (
        state.activeReviewFilter ===
        "pending"
    ) {

        return state.reviews.filter(
            review =>
                Number(review.approved) !== 1
        );

    }

    if (
        state.activeReviewFilter ===
        "approved"
    ) {

        return state.reviews.filter(
            review =>
                Number(review.approved) === 1
        );

    }

    return state.reviews;

}


function reviewStars(rating) {

    const value =
        Number(rating) || 0;

    return `
        <span class="review-stars">
            ${[1, 2, 3, 4, 5]
                .map(
                    star => `
                        <span
                            class="${
                                star <= value
                                    ? "filled"
                                    : ""
                            }"
                        >
                            ★
                        </span>
                    `
                )
                .join("")}
        </span>
    `;

}


function renderReview(review) {

    const approved =
        Number(review.approved) === 1;

    const name =
        review.name ||
        "Anonymous Client";

    const business =
        review.business ||
        "No business provided";

    const rating =
        Number(review.rating) || 0;

    const text =
        review.review || "";

    return `
        <article
            class="review-row ${
                approved
                    ? "approved"
                    : "pending"
            }"
            data-review-id="${escapeHTML(
                review.id || ""
            )}"
        >

            <div class="review-client">

                <span class="review-avatar">
                    ${escapeHTML(
                        getInitials(name)
                    )}
                </span>

                <div class="review-client-info">

                    <strong class="review-client-name">
                        ${escapeHTML(name)}
                    </strong>

                    <span class="review-client-business">
                        ${escapeHTML(business)}
                    </span>

                    <span class="review-client-date">
                        ${escapeHTML(
                            formatRelativeTime(
                                review.created_at
                            )
                        )}
                    </span>

                </div>

            </div>

            <div class="review-rating">
                ${reviewStars(rating)}

                <span class="review-rating-number">
                    ${rating}/5
                </span>
            </div>

            <div class="review-content">
                <p>${escapeHTML(text)}</p>
            </div>

            <div class="review-status">

                <span
                    class="review-status-badge ${
                        approved
                            ? "approved"
                            : "pending"
                    }"
                >
                    ${
                        approved
                            ? "APPROVED"
                            : "PENDING"
                    }
                </span>

            </div>

            <div class="review-actions">

                ${
                    !approved
                        ? `
                            <button
                                type="button"
                                class="review-action approve"
                                data-review-action="approve"
                                data-review-id="${escapeHTML(
                                    review.id || ""
                                )}"
                            >
                                APPROVE
                            </button>

                            <button
                                type="button"
                                class="review-action reject"
                                data-review-action="reject"
                                data-review-id="${escapeHTML(
                                    review.id || ""
                                )}"
                            >
                                REJECT
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="review-action delete"
                    data-review-action="delete"
                    data-review-id="${escapeHTML(
                        review.id || ""
                    )}"
                >
                    DELETE
                </button>

            </div>

        </article>
    `;

}


export function renderReviews() {

    const reviewsList =
        document.getElementById(
            "reviews-list"
        );

    if (!reviewsList) {
        return;
    }

    const filtered =
        getFilteredReviews();

    if (!filtered.length) {

        const message =
            state.activeReviewFilter === "pending"
                ? "There are no reviews awaiting approval."
                : state.activeReviewFilter === "approved"
                    ? "There are no approved reviews yet."
                    : "No client reviews have been submitted yet.";

        reviewsList.innerHTML = `
            <div class="reviews-empty">
                <div class="reviews-empty-mark">◌</div>

                <strong class="reviews-empty-title">
                    NO REVIEWS
                </strong>

                <p class="reviews-empty-description">
                    ${escapeHTML(message)}
                </p>
            </div>
        `;

        updateReviewSummary();

        return;

    }

    reviewsList.innerHTML =
        filtered
            .map(renderReview)
            .join("");

    updateReviewSummary();

}


export function updateReviewSummary() {

    const total =
        state.reviews.length;

    const pending =
        state.reviews.filter(
            review =>
                Number(review.approved) !== 1
        ).length;

    const approved =
        state.reviews.filter(
            review =>
                Number(review.approved) === 1
        ).length;

    const reviewsTotal =
        document.getElementById(
            "reviews-total"
        );

    const reviewsPending =
        document.getElementById(
            "reviews-pending"
        );

    const reviewsApproved =
        document.getElementById(
            "reviews-approved"
        );

    const reviewsFooterCount =
        document.getElementById(
            "reviews-footer-count"
        );

    if (reviewsTotal) {
        reviewsTotal.textContent = total;
    }

    if (reviewsPending) {
        reviewsPending.textContent = pending;
    }

    if (reviewsApproved) {
        reviewsApproved.textContent = approved;
    }

    if (reviewsFooterCount) {

        const visible =
            getFilteredReviews().length;

        reviewsFooterCount.textContent =
            `${visible} REVIEW${
                visible === 1 ? "" : "S"
            }`;

    }

}


async function handleReviewAction(
    action,
    reviewId,
    button
) {

    if (!action || !reviewId) {
        return;
    }

    const originalText =
        button?.textContent || "";

    if (button) {

        button.disabled = true;

        button.textContent =
            action === "approve"
                ? "APPROVING..."
                : action === "reject"
                    ? "REJECTING..."
                    : "DELETING...";

    }

    try {

        if (action === "approve") {

            await api(
                "/api/admin/reviews/approve",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            reviewId
                        })
                }
            );

        } else if (action === "reject") {

            await api(
                "/api/admin/reviews/reject",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            reviewId
                        })
                }
            );

        } else if (action === "delete") {

            await api(
                `/api/admin/reviews/${encodeURIComponent(
                    reviewId
                )}`,
                {
                    method: "DELETE"
                }
            );

        } else {
            return;
        }

        await loadReviews();

    } catch (error) {

        console.error(
            `Review ${action} error:`,
            error
        );

        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }

        alert(
            error.message ||
            `Unable to ${action} review.`
        );

    }

}


export function initReviews() {

    const reviewsList =
        document.getElementById(
            "reviews-list"
        );

    if (reviewsList) {

        reviewsList.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        "[data-review-action]"
                    );

                if (!button) {
                    return;
                }

                const action =
                    button.dataset.reviewAction;

                const reviewId =
                    button.dataset.reviewId;

                if (!action || !reviewId) {
                    return;
                }

                if (
                    action === "delete" ||
                    action === "reject"
                ) {

                    const confirmed =
                        window.confirm(
                            action === "reject"
                                ? "Reject and remove this review?"
                                : "Permanently delete this review?"
                        );

                    if (!confirmed) {
                        return;
                    }

                }

                await handleReviewAction(
                    action,
                    reviewId,
                    button
                );

            }
        );

    }


    document
        .querySelectorAll(
            ".review-filter"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.activeReviewFilter =
                        button.dataset.reviewFilter ||
                        "all";

                    document
                        .querySelectorAll(
                            ".review-filter"
                        )
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });

                    renderReviews();

                }
            );

        });


    const refreshReviews =
        document.getElementById(
            "refresh-reviews"
        );

    if (refreshReviews) {

        refreshReviews.addEventListener(
            "click",
            async () => {

                refreshReviews.disabled =
                    true;

                const originalText =
                    refreshReviews.textContent;

                refreshReviews.textContent =
                    "Refreshing...";

                try {

                    await loadReviews();

                } finally {

                    refreshReviews.disabled =
                        false;

                    refreshReviews.textContent =
                        originalText;

                }

            }
        );

    }

}