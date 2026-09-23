import {
    json
} from "../utils/response.js";

import {
    authenticateAdmin
} from "../utils/auth.js";

export async function handleAdminReviews(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    try {
        const reviews =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        client_id,
                        name,
                        business,
                        rating,
                        review,
                        approved,
                        created_at
                     FROM reviews
                     ORDER BY
                        approved ASC,
                        created_at DESC`
                )
                .all();

        return json({
            success: true,
            reviews:
                reviews.results || []
        });
    } catch (error) {
        console.error(
            "Admin reviews error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to load reviews."
            },
            500
        );
    }
}

export async function handleAdminApproveReview(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    let data;

    try {
        data =
            await request.json();
    } catch {
        return json(
            {
                success: false,
                error:
                    "Invalid JSON request."
            },
            400
        );
    }

    if (
        !data.reviewId ||
        typeof data.reviewId !== "string"
    ) {
        return json(
            {
                success: false,
                error:
                    "Review ID is required."
            },
            400
        );
    }

    try {
        const review =
            await env.DB
                .prepare(
                    `SELECT id
                     FROM reviews
                     WHERE id = ?
                     LIMIT 1`
                )
                .bind(
                    data.reviewId
                )
                .first();

        if (!review) {
            return json(
                {
                    success: false,
                    error:
                        "Review not found."
                },
                404
            );
        }

        await env.DB
            .prepare(
                `UPDATE reviews
                 SET approved = 1
                 WHERE id = ?`
            )
            .bind(
                data.reviewId
            )
            .run();

        return json({
            success: true
        });
    } catch (error) {
        console.error(
            "Approve review error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to approve review."
            },
            500
        );
    }
}

export async function handleAdminRejectReview(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    let data;

    try {
        data =
            await request.json();
    } catch {
        return json(
            {
                success: false,
                error:
                    "Invalid JSON request."
            },
            400
        );
    }

    if (
        !data.reviewId ||
        typeof data.reviewId !== "string"
    ) {
        return json(
            {
                success: false,
                error:
                    "Review ID is required."
            },
            400
        );
    }

    try {
        const result =
            await env.DB
                .prepare(
                    `DELETE FROM reviews
                     WHERE id = ?`
                )
                .bind(
                    data.reviewId
                )
                .run();

        if (!result.success) {
            return json(
                {
                    success: false,
                    error:
                        "Unable to reject review."
                },
                500
            );
        }

        return json({
            success: true
        });
    } catch (error) {
        console.error(
            "Reject review error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to reject review."
            },
            500
        );
    }
}

export async function handleAdminDeleteReview(
    request,
    env,
    reviewId
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    if (!reviewId) {
        return json(
            {
                success: false,
                error:
                    "Review ID is required."
            },
            400
        );
    }

    try {
        await env.DB
            .prepare(
                `DELETE FROM reviews
                 WHERE id = ?`
            )
            .bind(reviewId)
            .run();

        return json({
            success: true
        });
    } catch (error) {
        console.error(
            "Delete review error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to delete review."
            },
            500
        );
    }
}