import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import {
    handleAnalyticsEvent,
    cleanupAnalytics,
} from "../src/analytics/events.js";
import {
    handleAdminAnalyticsOverview,
    handleAdminAnalyticsJourneys,
    handleAdminAnalyticsSession,
    handleAdminAnalyticsLeads,
    parseRange,
} from "../src/analytics/admin.js";
import { handleContact } from "../src/contact/contact.js";
import { leadStatements, path, metadata } from "../src/analytics/common.js";
const root = new URL("../", import.meta.url);
class D1 {
    constructor() {
        this.raw = new DatabaseSync(":memory:");
        this.raw.exec(readFileSync(new URL("schema.sql", root), "utf8"));
        this.raw.exec(readFileSync(new URL("analytics-v2.sql", root), "utf8"));
    }
    prepare(sql) {
        const db = this;
        return {
            args: [],
            bind(...args) {
                this.args = args;
                return this;
            },
            async all() {
                const results = db.raw.prepare(sql).all(...this.args);
                return {
                    results,
                    meta: {
                        changes: db.raw.prepare("SELECT changes() n").get().n,
                    },
                };
            },
            async first() {
                return db.raw.prepare(sql).get(...this.args) || null;
            },
            async run() {
                const result = db.raw.prepare(sql).run(...this.args);
                return { meta: { changes: Number(result.changes) } };
            },
        };
    }
    async batch(statements) {
        this.raw.exec("BEGIN");
        try {
            const results = [];
            for (const s of statements) results.push(await s.all());
            this.raw.exec("COMMIT");
            return results;
        } catch (e) {
            this.raw.exec("ROLLBACK");
            throw e;
        }
    }
}
function env() {
    const DB = new D1();
    DB.raw
        .prepare("INSERT INTO admin_sessions(id,expires_at) VALUES (?,?)")
        .run("admin-test", new Date(Date.now() + 86400000).toISOString());
    return { DB };
}
const now = () => new Date(Date.now() - 1000).toISOString();
const event = (overrides = {}) => ({
    eventId: crypto.randomUUID(),
    visitorId: "visitor-1",
    sessionId: "session-1",
    eventType: "page_view",
    page: "/services?email=private@example.com#token",
    occurredAt: now(),
    ...overrides,
});
const req = (body, path = "/api/analytics/events") =>
    new Request("https://api.test" + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
const admin = (path = "/api/admin/analytics/overview?days=30", options = {}) =>
    new Request("https://api.test" + path, {
        ...options,
        headers: { Authorization: "Bearer admin-test", ...options.headers },
    });
async function send(e, body) {
    return handleAnalyticsEvent(req(body), e);
}
async function json(response) {
    return (await response).json();
}
const clientData = {
    name: "Test Client",
    email: "client@example.test",
    offer: "Marketing service",
    problem: "Form conversions",
    message: "Example",
};
test("duplicate retry is idempotent including session timestamps", async () => {
    const e = env(),
        body = event();
    assert.equal((await send(e, body)).status, 201);
    const before = e.DB.raw
        .prepare("SELECT * FROM analytics_v2_sessions")
        .get();
    const retry = await json(
        send(e, {
            ...body,
            page: "/different",
            occurredAt: new Date(Date.now() + 1000).toISOString(),
        }),
    );
    assert.equal(retry.duplicate, true);
    assert.equal(
        e.DB.raw.prepare("SELECT COUNT(*) n FROM analytics_v2_events").get().n,
        1,
    );
    assert.deepEqual(
        e.DB.raw.prepare("SELECT * FROM analytics_v2_sessions").get(),
        before,
    );
});
test("session ownership and event ID collisions are rejected", async () => {
    const e = env(),
        body = event();
    await send(e, body);
    assert.equal(
        (await send(e, event({ visitorId: "visitor-2" }))).status,
        409,
    );
    assert.equal(
        (await send(e, { ...body, sessionId: "session-2" })).status,
        409,
    );
    assert.equal(
        e.DB.raw.prepare("SELECT COUNT(*) n FROM analytics_v2_sessions").get()
            .n,
        1,
    );
});
test("database constraints protect direct race-path inserts", async () => {
    const e = env(),
        body = event();
    await send(e, body);
    assert.throws(
        () =>
            e.DB.raw
                .prepare(
                    "INSERT INTO analytics_v2_events SELECT event_id,session_id,?,event_type,page,occurred_at,received_at,metadata FROM analytics_v2_events WHERE 1 ON CONFLICT(event_id) DO NOTHING",
                )
                .run("visitor-2"),
        /identity constraint/,
    );
});
test("public callers cannot claim server outcomes", async () => {
    const e = env();
    for (const type of ["lead_created", "portal_created", "portal_login"])
        assert.equal((await send(e, event({ eventType: type }))).status, 400);
});
test("PII in URLs and arbitrary metadata is removed", async () => {
    const e = env();
    await send(
        e,
        event({
            metadata: {
                email: "private@example.com",
                field_value: "secret",
                field_id: "email",
                error_code: "required",
                active_ms: 999999,
                name: "person",
                nested: { password: "secret" },
            },
        }),
    );
    const row = e.DB.raw
        .prepare("SELECT page,metadata FROM analytics_v2_events")
        .get();
    assert.equal(row.page, "/services");
    assert.deepEqual(JSON.parse(row.metadata), {
        field_id: "email",
        error_code: "required",
        active_ms: 60000,
    });
    assert.equal(path("https://test.com/a/?token=x"), "/a");
    assert.deepEqual(metadata(null), {});
});
test("invalid and oversized input receives a 400", async () => {
    const e = env();
    for (const b of [
        null,
        [],
        {},
        event({ visitorId: "bad id" }),
        { x: "a".repeat(17000) },
    ])
        assert.equal((await send(e, b)).status, 400);
});
test("origin allowlist and rate limit reject unwanted ingestion", async () => {
    const e = env();
    e.ANALYTICS_ALLOWED_ORIGINS = "https://site.test";
    assert.equal((await send(e, event())).status, 403);
    delete e.ANALYTICS_ALLOWED_ORIGINS;
    await send(e, event());
    e.DB.raw.exec("UPDATE analytics_v2_rate_limits SET count=240");
    assert.equal((await send(e, event())).status, 429);
});
test("out-of-order events retain correct landing and last page", async () => {
    const e = env();
    await send(e, event({ page: "/last" }));
    await send(
        e,
        event({
            page: "/first",
            occurredAt: new Date(Date.now() - 60000).toISOString(),
        }),
    );
    const row = e.DB.raw
        .prepare("SELECT landing_page,last_page FROM analytics_v2_sessions")
        .get();
    assert.equal(row.landing_page, "/first");
    assert.equal(row.last_page, "/last");
});
test("confirmed enquiry and contact records commit atomically", async () => {
    const e = env();
    const ctx = {
        sessionId: "session-1",
        visitorId: "visitor-1",
        page: "/contact",
        form_id: "contact",
        attempt_id: "attempt-1",
    };
    await send(
        e,
        event({
            page: "/contact",
            eventType: "form_start",
            metadata: { form_id: "contact", attempt_id: "attempt-1" },
        }),
    );
    const r = await handleContact(
        req({ ...clientData, analytics: ctx }, "/api/contact"),
        e,
    );
    assert.equal(r.status, 201);
    assert.equal(
        e.DB.raw.prepare("SELECT COUNT(*) n FROM analytics_v2_leads").get().n,
        1,
    );
    assert.equal(
        e.DB.raw.prepare("SELECT COUNT(*) n FROM conversations").get().n,
        1,
    );
    const overview = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.equal(overview.success, true);
    assert.equal(overview.summary.enquiries, 1);
    assert.equal(overview.summary.conversion_rate, 100);
    assert.equal(overview.summary.funnel_completions, 1);
    assert.equal(overview.forms[0].successes, 1);
});
test("contact failure rolls back all business and outcome writes", async () => {
    const e = env();
    e.DB.raw.exec(
        `CREATE TRIGGER fail_notification BEFORE INSERT ON notifications BEGIN SELECT RAISE(ABORT,'fixture failure'); END;`,
    );
    const r = await handleContact(req(clientData, "/api/contact"), e);
    assert.equal(r.status, 500);
    for (const table of [
        "clients",
        "conversations",
        "messages",
        "analytics_v2_leads",
    ])
        assert.equal(
            e.DB.raw.prepare(`SELECT COUNT(*) n FROM ${table}`).get().n,
            0,
        );
});
test("unattributed and mismatched enquiries remain verified without corrupting a session", async () => {
    const e = env();
    await send(e, event());
    const r = await handleContact(
        req(
            {
                ...clientData,
                analytics: { sessionId: "session-1", visitorId: "wrong" },
            },
            "/api/contact",
        ),
        e,
    );
    assert.equal(r.status, 201);
    const lead = e.DB.raw.prepare("SELECT * FROM analytics_v2_leads").get();
    assert.equal(lead.session_id, null);
    assert.equal(lead.visitor_id, null);
    const o = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.equal(o.health.unattributed_enquiries, 1);
    assert.equal(o.summary.enquiries, 0);
});
test("CTA and browser form submit never become enquiries", async () => {
    const e = env();
    await send(e, event({ eventType: "cta_click" }));
    await send(e, event({ eventType: "form_submit" }));
    const o = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.equal(o.summary.enquiries, 0);
    assert.equal(o.summary.converted_sessions, 0);
    assert.equal(o.summary.engaged_sessions, 0);
});
test("funnel requires ordered events; completion attempts must match", async () => {
    const e = env();
    await handleContact(
        req(
            {
                ...clientData,
                analytics: {
                    sessionId: "session-1",
                    visitorId: "visitor-1",
                    form_id: "contact",
                    attempt_id: "earlier",
                },
            },
            "/api/contact",
        ),
        e,
    );
    await send(
        e,
        event({
            eventType: "form_start",
            occurredAt: new Date(Date.now() + 1000).toISOString(),
            metadata: { form_id: "contact", attempt_id: "later" },
        }),
    );
    const o = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.equal(o.summary.enquiries, 1);
    assert.equal(o.summary.funnel_completions, 0);
});
test("active sessions are not reported as exits", async () => {
    const e = env();
    await send(e, event());
    const o = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.deepEqual(o.exits, []);
});
test("empty reports, zero-filled days, and strict date ranges", async () => {
    const e = env(),
        o = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.equal(o.summary.sessions, 0);
    assert.equal(o.summary.conversion_rate, 0);
    assert.equal(o.daily.length, 30);
    assert(o.daily.every((r) => r.sessions === 0));
    assert.throws(() => parseRange(new URL("https://a?start=2026-02-30")));
    assert.equal(
        (
            await handleAdminAnalyticsOverview(
                admin("/api/admin/analytics/overview?start=2026-02-30"),
                e,
            )
        ).status,
        400,
    );
    const r = parseRange(
        new URL("https://a?days=1"),
        Date.parse("2026-09-30T08:00:00Z"),
    );
    assert.equal(r.start, "2026-09-29T23:00:00.000Z");
    assert.equal(r.end, "2026-09-30T08:00:00.000Z");
});
test("internal traffic excluded by default; source/device filters apply", async () => {
    const e = env();
    await send(e, event({ internal: true }));
    await send(
        e,
        event({
            sessionId: "s2",
            visitorId: "v2",
            source: "linkedin",
            device: "mobile",
        }),
    );
    const o = await json(handleAdminAnalyticsOverview(admin(), e));
    assert.equal(o.summary.sessions, 1);
    const all = await json(
        handleAdminAnalyticsOverview(
            admin("/api/admin/analytics/overview?internal=1"),
            e,
        ),
    );
    assert.equal(all.summary.sessions, 2);
    const none = await json(
        handleAdminAnalyticsOverview(
            admin("/api/admin/analytics/overview?source=search"),
            e,
        ),
    );
    assert.equal(none.summary.sessions, 0);
});
test("journey search, pagination and bounded event pages", async () => {
    const e = env();
    for (let i = 0; i < 25; i++)
        await send(
            e,
            event({
                sessionId: "s" + i,
                visitorId: "v" + i,
                page: "/page" + i,
            }),
        );
    const first = await json(
        handleAdminAnalyticsJourneys(admin("/api/admin/analytics/journeys"), e),
    );
    assert.equal(first.journeys.length, 20);
    assert.equal(first.total, 25);
    const second = await json(
        handleAdminAnalyticsJourneys(
            admin("/api/admin/analytics/journeys?page=2"),
            e,
        ),
    );
    assert.equal(second.journeys.length, 5);
    const filtered = await json(
        handleAdminAnalyticsJourneys(
            admin("/api/admin/analytics/journeys?q=/page24"),
            e,
        ),
    );
    assert.equal(filtered.total, 1);
    const s = await json(handleAdminAnalyticsSession(admin(), e, "s0"));
    assert.equal(s.events.length, 1);
    assert.equal(s.total, 1);
});
test("lead stages are authenticated, validated and reflected in reports", async () => {
    const e = env();
    await handleContact(req(clientData, "/api/contact"), e);
    const lead = e.DB.raw
        .prepare("SELECT lead_id FROM analytics_v2_leads")
        .get().lead_id;
    const good = await handleAdminAnalyticsLeads(
        admin("/api/admin/analytics/leads/" + lead, {
            method: "PATCH",
            body: JSON.stringify({ stage: "qualified" }),
        }),
        e,
        lead,
    );
    assert.equal(good.status, 200);
    assert.equal(
        e.DB.raw.prepare("SELECT stage FROM analytics_v2_leads").get().stage,
        "qualified",
    );
    const bad = await handleAdminAnalyticsLeads(
        admin("/api/admin/analytics/leads/" + lead, {
            method: "PATCH",
            body: JSON.stringify({ stage: "fake" }),
        }),
        e,
        lead,
    );
    assert.equal(bad.status, 400);
    const list = await json(
        handleAdminAnalyticsLeads(admin("/api/admin/analytics/leads"), e),
    );
    assert.equal(list.leads.length, 1);
    assert.equal(
        (await handleAdminAnalyticsOverview(new Request("https://a"), e))
            .status,
        401,
    );
});
test("retention deletes sessions/events while preserving verified enquiries", async () => {
    const e = env();
    await handleContact(
        req(
            { ...clientData, analytics: { sessionId: "s", visitorId: "v" } },
            "/api/contact",
        ),
        e,
    );
    e.DB.raw.exec(
        `UPDATE analytics_v2_sessions SET last_seen_at='2020-01-01T00:00:00.000Z'`,
    );
    await cleanupAnalytics(e);
    assert.equal(
        e.DB.raw.prepare("SELECT COUNT(*) n FROM analytics_v2_sessions").get()
            .n,
        0,
    );
    assert.equal(
        e.DB.raw.prepare("SELECT session_id FROM analytics_v2_leads").get()
            .session_id,
        null,
    );
});
test("migration is rerunnable and preserves existing tables", () => {
    const e = env();
    e.DB.raw.exec(readFileSync(new URL("analytics-v2.sql", root), "utf8"));
    assert(
        e.DB.raw
            .prepare("SELECT name FROM sqlite_master WHERE name='clients'")
            .get(),
    );
});
