import {
    handleAnalyticsEvent
} from "./events.js";

import {
    handleAdminAnalyticsOverview,
    handleAdminAnalyticsJourneys,
    handleAdminAnalyticsSession,
    handleAdminAnalyticsLeads
} from "./admin.js";


/* =========================================================
   ANALYTICS ROUTES
========================================================= */

export async function handleAnalyticsRoutes(
    request,
    env
) {

    const url =
        new URL(
            request.url
        );


    const path =
        url.pathname;


    const method =
        request.method.toUpperCase();


    /* =====================================================
       PUBLIC EVENT INGESTION
    ===================================================== */

    if (
        path ===
            "/api/analytics/events" &&
        method ===
            "POST"
    ) {

        return handleAnalyticsEvent(
            request,
            env
        );

    }


    /* =====================================================
       ADMIN OVERVIEW
    ===================================================== */

    if (
        path ===
            "/api/admin/analytics/overview" &&
        method ===
            "GET"
    ) {

        return handleAdminAnalyticsOverview(
            request,
            env
        );

    }


    /* =====================================================
       ADMIN JOURNEYS
    ===================================================== */

    if (
        path ===
            "/api/admin/analytics/journeys" &&
        method ===
            "GET"
    ) {

        return handleAdminAnalyticsJourneys(
            request,
            env
        );

    }


    /* =====================================================
       ADMIN LEADS
    ===================================================== */

    if (
        path ===
            "/api/admin/analytics/leads" &&
        method ===
            "GET"
    ) {

        return handleAdminAnalyticsLeads(
            request,
            env
        );

    }


    /* =====================================================
       LEAD STAGE UPDATE
    ===================================================== */

    const leadMatch =
        path.match(
            /^\/api\/admin\/analytics\/leads\/([^/]+)$/
        );


    if (
        leadMatch &&
        method ===
            "PATCH"
    ) {

        let leadId;


        try {

            leadId =
                decodeURIComponent(
                    leadMatch[1]
                );

        } catch {

            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Invalid lead identifier."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        }


        return handleAdminAnalyticsLeads(
            request,
            env,
            leadId
        );

    }


    /* =====================================================
       SESSION JOURNEY
    ===================================================== */

    const sessionMatch =
        path.match(
            /^\/api\/admin\/analytics\/sessions\/([^/]+)$/
        );


    if (
        sessionMatch &&
        method ===
            "GET"
    ) {

        let sessionId;


        try {

            sessionId =
                decodeURIComponent(
                    sessionMatch[1]
                );

        } catch {

            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Invalid session identifier."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }
            );

        }


        return handleAdminAnalyticsSession(
            request,
            env,
            sessionId
        );

    }


    return null;

}