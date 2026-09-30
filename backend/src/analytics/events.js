import {
    EVENT_TYPES,
    id,
    path,
    metadata,
    iso,
    readBody,
    reply,
    originAllowed,
    rateLimit,
    sessionInsert,
} from "./common.js";
export async function handleAnalyticsEvent(request, env) {
    if (!originAllowed(request, env))
        return reply({ success: false, error: "Origin is not allowed." }, 403);
    if (
        /bot|crawler|spider|headless/i.test(
            request.headers.get("user-agent") || "",
        )
    )
        return reply({ success: true, ignored: true });
    let body;
    try {
        body = await readBody(request);
    } catch (error) {
        return reply({ success: false, error: error.message }, 400);
    }
    const eventId = id(body.eventId || body.event_id),
        visitorId = id(body.visitorId || body.visitor_id),
        sessionId = id(body.sessionId || body.session_id);
    const eventType = body.eventType || body.event_type;
    if (!eventId || !visitorId || !sessionId || !EVENT_TYPES.has(eventType))
        return reply(
            {
                success: false,
                error: "Invalid event. Outcomes are recorded by the server.",
            },
            400,
        );
    try {
        if (!(await rateLimit(request, env)))
            return reply(
                { success: false, error: "Event rate limit exceeded." },
                429,
            );
        const existing = await env.DB.prepare(
            "SELECT visitor_id, session_id FROM analytics_v2_events WHERE event_id=?",
        )
            .bind(eventId)
            .first();
        if (existing)
            return existing.visitor_id === visitorId &&
                existing.session_id === sessionId
                ? reply({ success: true, duplicate: true })
                : reply({ success: false, error: "Event ID conflict." }, 409);
        const owner = await env.DB.prepare(
            "SELECT visitor_id FROM analytics_v2_sessions WHERE session_id=?",
        )
            .bind(sessionId)
            .first();
        if (owner && owner.visitor_id !== visitorId)
            return reply(
                { success: false, error: "Session ownership mismatch." },
                409,
            );
        const received = Date.now();
        const submitted = Date.parse(body.occurredAt);
        const occurred =
            Number.isFinite(submitted) &&
            submitted >= received - 86400000 &&
            submitted <= received + 300000
                ? submitted
                : received;
        const results = await env.DB.batch([
            sessionInsert(
                env.DB,
                { ...body, visitorId, sessionId },
                iso(occurred),
            ),
            env.DB.prepare(
                `INSERT INTO analytics_v2_events(event_id,session_id,visitor_id,event_type,page,occurred_at,received_at,metadata)
    VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(event_id) DO NOTHING`,
            ).bind(
                eventId,
                sessionId,
                visitorId,
                eventType,
                path(body.page),
                iso(occurred),
                iso(received),
                JSON.stringify(metadata(body.metadata)),
            ),
        ]);
        return reply(
            { success: true, duplicate: results[1].meta.changes === 0 },
            201,
        );
    } catch (error) {
        if (/FOREIGN KEY|constraint/i.test(error.message))
            return reply(
                { success: false, error: "Event/session conflict." },
                409,
            );
        console.error("Analytics ingestion failed", error.message);
        return reply(
            { success: false, error: "Unable to record analytics event." },
            500,
        );
    }
}
export async function cleanupAnalytics(env) {
    const days = Math.max(
        30,
        Math.min(730, Number(env.ANALYTICS_RETENTION_DAYS) || 180),
    );
    await env.DB.batch([
        env.DB.prepare(
            "DELETE FROM analytics_v2_sessions WHERE last_seen_at < ?",
        ).bind(iso(Date.now() - days * 86400000)),
        env.DB.prepare(
            "DELETE FROM analytics_v2_rate_limits WHERE expires_at < ?",
        ).bind(Math.floor(Date.now() / 1000)),
    ]);
}
