import {
    handlePublicApprovedReviews
} from "./public.js";

export async function handleReviewRoutes(
    request,
    env
) {

    const url = new URL(request.url);

    // Public review submissions are no longer permitted.
    // Customers submit reviews through the Private Portal.

    if (
        url.pathname === "/api/reviews" &&
        request.method === "POST"
    ) {

        return new Response(
            JSON.stringify({
                success: false,
                error:
                    "Submit reviews through your Private Portal."
            }),
            {
                status: 403,
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );

    }

    // Existing approved reviews remain publicly available.

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