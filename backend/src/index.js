import { handlePaymentEvidence } from "./marketplace/payment-evidence.js";
import { handlePayments } from "./marketplace/payments.js";
import { handleProjects } from "./marketplace/projects.js";
import {
    handleProjectReviews
} from "./marketplace/project-reviews.js";
import {
    handleProjectFiles
} from "./marketplace/project-files.js";
import {
    handlePaymentNotifications
} from "./marketplace/payment-notifications.js";
import {
    handleBusinessNotifications
} from "./marketplace/business-notifications.js";
import { handlePaymentInstructions } from "./marketplace/payment-instructions.js";
import { handleQuotations } from "./marketplace/quotations.js";
import { handleRequests } from "./marketplace/requests.js";
import {
    handleAuthRoutes
} from "./auth/auth.routes.js";

import { handleCart } from "./marketplace/cart.js";
import { handleMarketplaceLaunchRoutes } from "./marketplace/launch.js";

import {
    handleMarketplaceCategoryRoutes
} from "./marketplace/categories.js";

import {
    handleMarketplaceCatalogRoutes
} from "./marketplace/catalog.js";

import {
    handleMarketplaceEditorRoutes
} from "./marketplace/editor.js";

import { cleanupAnalytics } from "./analytics/events.js";
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

import {
    handleAnalyticsRoutes
} from "./analytics/analytics.routes.js";


export default {
    async scheduled(event, env, ctx) { ctx.waitUntil(cleanupAnalytics(env)); },
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const method = request.method;
// ========================================================
// UNIFIED CUSTOMER AUTHENTICATION
// ========================================================

const authPath = new URL(request.url).pathname;

if (
    authPath === "/api/auth" ||
    authPath.startsWith("/api/auth/")
) {
    return handleAuthRoutes(request, env);
}
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
            const projectFilesResponse =
    await handleProjectFiles(request, env);

if (projectFilesResponse) {
    return projectFilesResponse;
}
const projectReviewsResponse =
    await handleProjectReviews(request, env);

if (projectReviewsResponse) {
    return projectReviewsResponse;
}
            const projectResponse =
    await handleProjects(request, env);

if (projectResponse) {
    return projectResponse;
}
            const evidenceResponse = await handlePaymentEvidence(request, env);
            if (evidenceResponse) return evidenceResponse;
            const businessNotificationsResponse =
    await handleBusinessNotifications(request, env);

if (businessNotificationsResponse) {
    return businessNotificationsResponse;
}
            const paymentNotificationsResponse =
    await handlePaymentNotifications(request, env);

if (paymentNotificationsResponse) {
    return paymentNotificationsResponse;
}
            const paymentResponse = await handlePayments(request, env);
            if (paymentResponse) return paymentResponse;
            const paymentInstructionsResponse =
    await handlePaymentInstructions(request, env);

if (paymentInstructionsResponse) {
    return paymentInstructionsResponse;
}
            const quotationResponse = await handleQuotations(request, env);
            if (quotationResponse) return quotationResponse;
            const requestResponse = await handleRequests(request, env);
            if (requestResponse) return requestResponse;
            const cartResponse = await handleCart(request, env);
            if (cartResponse) return cartResponse;

                        // --------------------------------------------------
            // MARKETPLACE CATEGORY ROUTES
            // --------------------------------------------------

            const marketplaceCategoryResponse =
                await handleMarketplaceCategoryRoutes(
                    request,
                    env
                );

            if (marketplaceCategoryResponse) {
                return marketplaceCategoryResponse;
            }

            // --------------------------------------------------
            // MARKETPLACE CATALOG ROUTES
            // --------------------------------------------------

const marketplaceCatalogResponse =
    await handleMarketplaceCatalogRoutes(
        request,
        env
    );

if (marketplaceCatalogResponse) {
    return marketplaceCatalogResponse;
}

            /* =========================================================
   MARKETPLACE EDITOR ROUTES
========================================================= */

const marketplaceEditorResponse =
    await handleMarketplaceEditorRoutes(
        request,
        env
    );
const marketplaceLaunchResponse =
    await handleMarketplaceLaunchRoutes(request, env);

if (marketplaceLaunchResponse) {
    return marketplaceLaunchResponse;
}
if (marketplaceEditorResponse) {
    return marketplaceEditorResponse;
}

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
            // ANALYTICS ROUTES
            // --------------------------------------------------

            const analyticsResponse =
                await handleAnalyticsRoutes(
                    request,
                    env
                );

            if (analyticsResponse) {
                return analyticsResponse;
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