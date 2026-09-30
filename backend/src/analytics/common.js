import { json } from "../utils/response.js";
export const EVENT_TYPES = new Set([
    "page_view",
    "cta_click",
    "form_start",
    "form_field_interaction",
    "form_submit",
    "form_error",
    "article_view",
    "external_link_click",
    "engagement",
    "scroll_depth",
]);
export const iso = (value = Date.now()) => new Date(value).toISOString();
export function id(value) {
    return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value)
        ? value
        : "";
}
export function label(value, max = 100) {
    return typeof value === "string"
        ? value
              .trim()
              .replace(/[\u0000-\u001f<>]/g, "")
              .slice(0, max)
        : "";
}
export function path(value) {
    try {
        const u = new URL(String(value || "/"), "https://local.invalid");
        return (
            u.pathname
                .slice(0, 1500)
                .replace(/\/{2,}/g, "/")
                .replace(/\/$/, "") || "/"
        );
    } catch {
        return "/";
    }
}
export function metadata(value = {}) {
    const safe = {};
    // Only identifiers, categorised errors, and numeric measurements. Never arbitrary text/values.
    for (const key of [
        "cta_id",
        "form_id",
        "attempt_id",
        "field_id",
        "error_code",
        "article_id",
    ]) {
        if (id(value?.[key])) safe[key] = value[key];
    }
    for (const key of ["active_ms", "depth"]) {
        const n = Number(value?.[key]);
        if (Number.isFinite(n) && n >= 0)
            safe[key] = Math.min(n, key === "depth" ? 100 : 60000);
    }
    return safe;
}
export function attribution(body = {}) {
    let referrer = "";
    try {
        referrer = new URL(body.referrer).hostname;
    } catch {}
    const device = ["mobile", "desktop", "tablet"].includes(body.device)
        ? body.device
        : "unknown";
    return {
        source: label(body.source) || referrer || "direct",
        medium: label(body.medium) || (referrer ? "referral" : "none"),
        campaign: label(body.campaign),
        referrer,
        device,
    };
}
export function reply(data, status = 200) {
    const response = json(data, status);
    response.headers.set("Cache-Control", "no-store");
    return response;
}
export async function readBody(request, limit = 16384) {
    if (Number(request.headers.get("content-length")) > limit)
        throw new Error("Request is too large.");
    const reader = request.body?.getReader();
    if (!reader) throw new Error("A JSON object is required.");
    let size = 0;
    const parts = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > limit) {
            await reader.cancel();
            throw new Error("Request is too large.");
        }
        parts.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of parts) {
        bytes.set(part, offset);
        offset += part.length;
    }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || Array.isArray(body) || typeof body !== "object")
        throw new Error("A JSON object is required.");
    return body;
}
export function originAllowed(request, env) {
    const origins = String(env.ANALYTICS_ALLOWED_ORIGINS || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    return !origins.length || origins.includes(request.headers.get("origin"));
}
export async function rateLimit(request, env) {
    const minute = Math.floor(Date.now() / 60000);
    const address = request.headers.get("CF-Connecting-IP") || "local";
    const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(`${minute}:${address}`),
    );
    const bucket = Array.from(new Uint8Array(hash), (b) =>
        b.toString(16).padStart(2, "0"),
    ).join("");
    const row = await env.DB.prepare(
        `INSERT INTO analytics_v2_rate_limits(bucket,count,expires_at) VALUES (?,1,?)
 ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count`,
    )
        .bind(bucket, minute * 60 + 120)
        .first();
    return row.count <= 240;
}
export function sessionInsert(db, ctx, now = iso()) {
    const a = attribution(ctx);
    return db
        .prepare(
            `INSERT INTO analytics_v2_sessions
 (session_id,visitor_id,started_at,last_seen_at,landing_page,last_page,source,medium,campaign,referrer,device,internal)
 VALUES (?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(session_id) DO NOTHING`,
        )
        .bind(
            ctx.sessionId,
            ctx.visitorId,
            now,
            now,
            path(ctx.page),
            path(ctx.page),
            a.source,
            a.medium,
            a.campaign,
            a.referrer,
            a.device,
            ctx.internal === true ? 1 : 0,
        );
}
export function leadStatements(db, leadId, context) {
    const now = iso();
    const ctx = context && typeof context === "object" ? context : {};
    const valid = id(ctx.sessionId) && id(ctx.visitorId);
    const statements = valid ? [sessionInsert(db, ctx, now)] : [];
    // Invalid/mismatched attribution never prevents a legitimate enquiry from being recorded.
    statements.push(
        db
            .prepare(
                `INSERT INTO analytics_v2_leads(lead_id,session_id,visitor_id,form_id,attempt_id,created_at,updated_at)
 VALUES (?,(SELECT session_id FROM analytics_v2_sessions WHERE session_id=? AND visitor_id=?),
 (SELECT visitor_id FROM analytics_v2_sessions WHERE session_id=? AND visitor_id=?),?,?,?,?)`,
            )
            .bind(
                leadId,
                valid ? ctx.sessionId : "",
                valid ? ctx.visitorId : "",
                valid ? ctx.sessionId : "",
                valid ? ctx.visitorId : "",
                id(ctx.form_id),
                id(ctx.attempt_id),
                now,
                now,
            ),
    );
    return statements;
}
