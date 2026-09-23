import {
    handlePublicReviewCreate,
    handlePublicApprovedReviews
} from "./public.js";

export async function handleReviewRoutes(
    request,
    env
) {
    const url = new URL(request.url);

    if (
        url.pathname === "/api/reviews" &&
        request.method === "POST"
    ) {
        return handlePublicReviewCreate(
            request,
            env
        );
    }

    if (
        url.pathname === "/api/reviews" &&
        request.method === "GET"
    ) {
        return handlePublicApprovedReviews(
            request,
            env
        );
    }

    return null;
}