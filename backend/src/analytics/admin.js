import { json } from "../utils/response.js";
import { authenticateAdmin } from "../utils/auth.js";

async function requireAdmin(request, env) {
    return authenticateAdmin(request, env);
}

function parseDays(url) {
    const value = Number(url.searchParams.get("days") || 30);
    return Number.isInteger(value) && value >= 1 && value <= 365 ? value : 30;
}

export async function handleAdminAnalyticsOverview(request, env) {
    if (!await requireAdmin(request, env)) {
        return json({ success: false, error: "Admin authentication required." }, 401);
    }

    const url = new URL(request.url);
    const days = parseDays(url);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    try {
        const [summary, topPages, eventTypes, daily, recentEvents, dropoffs] = await Promise.all([
            env.DB.prepare(`
                SELECT
                    COUNT(DISTINCT visitor_id) AS visitors,
                    COUNT(DISTINCT session_id) AS sessions,
                    COUNT(*) AS events,
                    SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
                    SUM(CASE WHEN event_type = 'cta_click' THEN 1 ELSE 0 END) AS cta_clicks,
                    SUM(CASE WHEN event_type = 'form_submit' THEN 1 ELSE 0 END) AS form_submits
                FROM analytics_events
                WHERE created_at >= ?
            `).bind(since).first(),

            env.DB.prepare(`
                SELECT page, COUNT(*) AS views
                FROM analytics_events
                WHERE created_at >= ? AND event_type = 'page_view' AND page IS NOT NULL
                GROUP BY page ORDER BY views DESC LIMIT 10
            `).bind(since).all(),

            env.DB.prepare(`
                SELECT event_type, COUNT(*) AS count
                FROM analytics_events
                WHERE created_at >= ?
                GROUP BY event_type ORDER BY count DESC
            `).bind(since).all(),

            env.DB.prepare(`
                SELECT substr(created_at, 1, 10) AS date,
                       COUNT(DISTINCT visitor_id) AS visitors,
                       COUNT(DISTINCT session_id) AS sessions,
                       COUNT(*) AS events
                FROM analytics_events
                WHERE created_at >= ?
                GROUP BY substr(created_at, 1, 10)
                ORDER BY date ASC
            `).bind(since).all(),

            env.DB.prepare(`
                SELECT event_id, event_type, page, created_at
                FROM analytics_events
                WHERE created_at >= ?
                ORDER BY created_at DESC
                LIMIT 20
            `).bind(since).all(),

            env.DB.prepare(`
                SELECT COALESCE(last_page, landing_page) AS page,
                       COUNT(*) AS sessions
                FROM analytics_sessions
                WHERE started_at >= ?
                GROUP BY COALESCE(last_page, landing_page)
                ORDER BY sessions DESC
                LIMIT 10
            `).bind(since).all()
        ]);

        return json({
            success: true,
            range: { days, since },
            summary: summary || {},
            topPages: topPages.results || [],
            eventTypes: eventTypes.results || [],
            daily: daily.results || [],
            recentEvents: recentEvents.results || [],
            dropoffs: dropoffs.results || []
        });
    } catch (error) {
        console.error("Admin analytics overview error:", error);
        return json({ success: false, error: "Unable to load analytics." }, 500);
    }
}

export async function handleAdminAnalyticsJourneys(request, env) {
    if (!await requireAdmin(request, env)) {
        return json({ success: false, error: "Admin authentication required." }, 401);
    }

    const url = new URL(request.url);
    const days = parseDays(url);
    const since = new Date(Date.now() - days * 86400000).toISOString();

    try {
        const sessions = await env.DB.prepare(`
            SELECT session_id, visitor_id, started_at, last_seen_at,
                   landing_page, referrer, last_page, event_count
            FROM analytics_sessions
            WHERE started_at >= ?
            ORDER BY last_seen_at DESC
            LIMIT 100
        `).bind(since).all();

        return json({
            success: true,
            range: { days, since },
            journeys: sessions.results || []
        });
    } catch (error) {
        console.error("Admin analytics journeys error:", error);
        return json({ success: false, error: "Unable to load journeys." }, 500);
    }
}

export async function handleAdminAnalyticsSession(request, env, sessionId) {
    if (!await requireAdmin(request, env)) {
        return json({ success: false, error: "Admin authentication required." }, 401);
    }

    if (!sessionId) {
        return json({ success: false, error: "Session ID is required." }, 400);
    }

    try {
        const session = await env.DB.prepare(`
            SELECT session_id, visitor_id, started_at, last_seen_at,
                   landing_page, referrer, last_page, event_count
            FROM analytics_sessions WHERE session_id = ? LIMIT 1
        `).bind(sessionId).first();

        if (!session) {
            return json({ success: false, error: "Analytics session not found." }, 404);
        }

        const events = await env.DB.prepare(`
            SELECT event_id, event_type, page, referrer, metadata, created_at
            FROM analytics_events
            WHERE session_id = ?
            ORDER BY created_at ASC
        `).bind(sessionId).all();

        return json({ success: true, session, events: events.results || [] });
    } catch (error) {
        console.error("Admin analytics session error:", error);
        return json({ success: false, error: "Unable to load analytics session." }, 500);
    }
}
