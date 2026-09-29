import { json } from "../utils/response.js";

const ALLOWED_EVENT_TYPES = new Set([
    "page_view",
    "cta_click",
    "form_start",
    "form_field_interaction",
    "form_submit",
    "form_error",
    "portal_created",
    "portal_login",
    "article_view",
    "external_link_click"
]);

function cleanId(value, max = 128) {
    const text = String(value || "").trim();
    return /^[A-Za-z0-9_-]+$/.test(text) && text.length <= max
        ? text
        : "";
}

function cleanText(value, max = 1000) {
    if (value === null || value === undefined) return null;
    return String(value).trim().slice(0, max) || null;
}

function cleanMetadata(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const blocked = new Set([
        "name", "email", "password", "token", "sessiontoken",
        "portal_token", "message", "phone", "telephone"
    ]);

    const safe = {};
    for (const [key, raw] of Object.entries(value).slice(0, 30)) {
        if (blocked.has(String(key).toLowerCase())) continue;
        if (["string", "number", "boolean"].includes(typeof raw)) {
            safe[String(key).slice(0, 80)] =
                typeof raw === "string" ? raw.slice(0, 500) : raw;
        }
    }

    const encoded = JSON.stringify(safe);
    return encoded.length <= 5000 ? encoded : null;
}

export async function handleAnalyticsEvent(request, env) {
    let body;
    try {
        body = await request.json();
    } catch {
        return json({ success: false, error: "Invalid JSON request." }, 400);
    }

    const eventId = cleanId(body.eventId || body.event_id);
    const visitorId = cleanId(body.visitorId || body.visitor_id);
    const sessionId = cleanId(body.sessionId || body.session_id);
    const eventType = String(body.eventType || body.event_type || "").trim();

    if (!eventId || !visitorId || !sessionId || !ALLOWED_EVENT_TYPES.has(eventType)) {
        return json({ success: false, error: "Invalid analytics event." }, 400);
    }

    const page = cleanText(body.page, 1500);
    const referrer = cleanText(body.referrer, 1500);
    const metadata = cleanMetadata(body.metadata);
    const now = new Date().toISOString();

    try {
        await env.DB.batch([
            env.DB.prepare(`
                INSERT INTO analytics_visitors
                    (visitor_id, first_seen_at, last_seen_at, first_referrer,
                     first_landing_page, last_page, session_count, event_count)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1)
                ON CONFLICT(visitor_id) DO UPDATE SET
                    last_seen_at = excluded.last_seen_at,
                    last_page = excluded.last_page,
                    event_count = analytics_visitors.event_count + 1,
                    session_count = analytics_visitors.session_count +
                        CASE WHEN NOT EXISTS (
                            SELECT 1 FROM analytics_sessions WHERE session_id = ?
                        ) THEN 1 ELSE 0 END
            `).bind(visitorId, now, now, referrer, page, page, sessionId),

            env.DB.prepare(`
                INSERT INTO analytics_sessions
                    (session_id, visitor_id, started_at, last_seen_at,
                     landing_page, referrer, last_page, event_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(session_id) DO UPDATE SET
                    last_seen_at = excluded.last_seen_at,
                    last_page = excluded.last_page,
                    event_count = analytics_sessions.event_count + 1
            `).bind(sessionId, visitorId, now, now, page, referrer, page),

            env.DB.prepare(`
                INSERT OR IGNORE INTO analytics_events
                    (event_id, visitor_id, session_id, event_type,
                     page, referrer, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(eventId, visitorId, sessionId, eventType, page, referrer, metadata, now)
        ]);

        return json({ success: true }, 201);
    } catch (error) {
        console.error("Analytics event error:", error);
        return json({ success: false, error: "Unable to record analytics event." }, 500);
    }
}
