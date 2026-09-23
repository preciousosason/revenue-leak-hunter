import {
    json
} from "../utils/response.js";

import {
    createId
} from "../utils/ids.js";


function validateReview(data) {
    const errors = {};

    if (
        !data ||
        typeof data !== "object"
    ) {
        errors.review =
            "Invalid review data.";
        return errors;
    }

    if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length < 2 ||
        data.name.trim().length > 100
    ) {
        errors.name =
            "Please provide your name.";
    }

    if (
        data.business &&
        (
            typeof data.business !== "string" ||
            data.business.trim().length > 200
        )
    ) {
        errors.business =
            "Business name is too long.";
    }

    const rating =
        Number(data.rating);

    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
    ) {
        errors.rating =
            "Please select a rating from 1 to 5.";
    }

    if (
        !data.review ||
        typeof data.review !== "string" ||
        data.review.trim().length < 10 ||
        data.review.trim().length > 2000
    ) {
        errors.review =
            "Your review must be between 10 and 2000 characters.";
    }

    return errors;
}


/*
|--------------------------------------------------------------------------
| CREATE PUBLIC REVIEW
|--------------------------------------------------------------------------
*/

export async function handlePublicReviewCreate(
    request,
    env
) {
    try {
        const rawBody =
            await request.text();

        if (!rawBody) {
            return json(
                {
                    success: false,
                    error:
                        "Request body is empty."
                },
                400
            );
        }

        let data;

        try {
            data =
                JSON.parse(rawBody);
        } catch (error) {
            console.error(
                "Review JSON parse error:",
                error?.stack || error
            );

            return json(
                {
                    success: false,
                    error:
                        "Invalid JSON request."
                },
                400
            );
        }

        const errors =
            validateReview(data);

        if (
            Object.keys(errors).length > 0
        ) {
            return json(
                {
                    success: false,
                    errors
                },
                422
            );
        }

        const id =
            createId();

        await env.DB
            .prepare(
                `INSERT INTO reviews
                (
                    id,
                    client_id,
                    name,
                    business,
                    rating,
                    review,
                    approved
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .bind(
                id,
                null,
                data.name.trim(),
                data.business
                    ? data.business.trim()
                    : null,
                Number(data.rating),
                data.review.trim(),
                0
            )
            .run();

        return json(
            {
                success: true,
                message:
                    "Your review has been submitted and is awaiting approval."
            },
            201
        );

    } catch (error) {
        console.error(
            "Public review creation error:",
            error?.stack || error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to submit your review."
            },
            500
        );
    }
}


/*
|--------------------------------------------------------------------------
| GET APPROVED PUBLIC REVIEWS
|--------------------------------------------------------------------------
*/

export async function handlePublicApprovedReviews(
    request,
    env
) {
    try {
        const result =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        name,
                        business,
                        rating,
                        review,
                        created_at
                     FROM reviews
                     WHERE approved = 1
                     ORDER BY created_at DESC
                     LIMIT 50`
                )
                .all();

        return json({
            success: true,
            reviews:
                result.results || []
        });

    } catch (error) {
        console.error(
            "Approved reviews error:",
            error?.stack || error
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