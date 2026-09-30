import { handleAnalyticsEvent } from "./events.js";
import {
    handleAdminAnalyticsOverview,
    handleAdminAnalyticsJourneys,
    handleAdminAnalyticsSession,
    handleAdminAnalyticsLeads,
} from "./admin.js";
export async function handleAnalyticsRoutes(request, env) {
    const p = new URL(request.url).pathname,
        m = request.method;
    if (p === "/api/analytics/events" && m === "POST")
        return handleAnalyticsEvent(request, env);
    if (p === "/api/admin/analytics/overview" && m === "GET")
        return handleAdminAnalyticsOverview(request, env);
    if (p === "/api/admin/analytics/journeys" && m === "GET")
        return handleAdminAnalyticsJourneys(request, env);
    if (p === "/api/admin/analytics/leads" && m === "GET")
        return handleAdminAnalyticsLeads(request, env);
    if (p.startsWith("/api/admin/analytics/leads/") && m === "PATCH")
        return handleAdminAnalyticsLeads(
            request,
            env,
            decodeURIComponent(p.split("/").pop()),
        );
    if (p.startsWith("/api/admin/analytics/sessions/") && m === "GET")
        return handleAdminAnalyticsSession(
            request,
            env,
            decodeURIComponent(p.split("/").pop()),
        );
    return null;
}
