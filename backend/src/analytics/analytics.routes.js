import { handleAnalyticsEvent } from "./events.js";
import {
    handleAdminAnalyticsOverview,
    handleAdminAnalyticsJourneys,
    handleAdminAnalyticsSession
} from "./admin.js";

export async function handleAnalyticsRoutes(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/analytics/events" && request.method === "POST") {
        return handleAnalyticsEvent(request, env);
    }

    if (url.pathname === "/api/admin/analytics/overview" && request.method === "GET") {
        return handleAdminAnalyticsOverview(request, env);
    }

    if (url.pathname === "/api/admin/analytics/journeys" && request.method === "GET") {
        return handleAdminAnalyticsJourneys(request, env);
    }

    if (url.pathname.startsWith("/api/admin/analytics/sessions/") && request.method === "GET") {
        const sessionId = decodeURIComponent(url.pathname.split("/").pop() || "");
        return handleAdminAnalyticsSession(request, env, sessionId);
    }

    return null;
}
