import {
    CORS_HEADERS
} from "./config/cors.js";

import {
    json
} from "./utils/response.js";

import {
    handleContactRoutes
} from "./contact/contact.routes.js";

import {
    handleReviewRoutes
} from "./reviews/reviews.routes.js";

import {
    handlePortalRoutes
} from "./portal/portal.routes.js";

import {
    handleAdminRoutes
} from "./admin/admin.routes.js";


export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const method = request.method;

        // --------------------------------------------------
        // CORS
        // --------------------------------------------------

        if (method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: CORS_HEADERS
            });
        }

        try {
            // --------------------------------------------------
            // ROOT
            // --------------------------------------------------

            if (
                pathname === "/" &&
                method === "GET"
            ) {
                return json({
                    success: true,
                    message:
                        "Conversion Leak Hunter API is running."
                });
            }

            // --------------------------------------------------
            // CONTACT ROUTES
            // --------------------------------------------------

            const contactResponse =
                await handleContactRoutes(
                    request,
                    env
                );

            if (contactResponse) {
                return contactResponse;
            }

            // --------------------------------------------------
            // REVIEW ROUTES
            // --------------------------------------------------

            const reviewResponse =
                await handleReviewRoutes(
                    request,
                    env
                );

            if (reviewResponse) {
                return reviewResponse;
            }

            // --------------------------------------------------
            // PORTAL ROUTES
            // --------------------------------------------------

            const portalResponse =
                await handlePortalRoutes(
                    request,
                    env
                );

            if (portalResponse) {
                return portalResponse;
            }

            // --------------------------------------------------
            // ADMIN ROUTES
            // --------------------------------------------------

            const adminResponse =
                await handleAdminRoutes(
                    request,
                    env
                );

            if (adminResponse) {
                return adminResponse;
            }

            // --------------------------------------------------
            // 404
            // --------------------------------------------------

            return json(
                {
                    success: false,
                    error: "Route not found."
                },
                404
            );

        } catch (error) {
    console.error(
        "WORKER ERROR:",
        error?.stack || error
    );

    return json(
        {
            success: false,
            error: "Internal server error."
        },
        500
    );
}
    }
};