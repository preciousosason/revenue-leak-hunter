const ANALYTICS_API = "https://revenue-leak-hunter-api.preciousosason.workers.dev/api/analytics/events";
const VISITOR_KEY = "clh_visitor_id";
const SESSION_KEY = "clh_analytics_session";
const LAST_ACTIVITY_KEY = "clh_analytics_last_activity";
const SESSION_TIMEOUT = 30 * 60 * 1000;

function id(prefix) {
    const uuid = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${uuid.replace(/[^A-Za-z0-9_-]/g, "")}`;
}

function getVisitorId() {
    let value = localStorage.getItem(VISITOR_KEY);
    if (!value) {
        value = id("v");
        localStorage.setItem(VISITOR_KEY, value);
    }
    return value;
}

function getSessionId() {
    const now = Date.now();
    const last = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY) || 0);
    let value = sessionStorage.getItem(SESSION_KEY);
    if (!value || !last || now - last > SESSION_TIMEOUT) {
        value = id("s");
        sessionStorage.setItem(SESSION_KEY, value);
    }
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    return value;
}

function pageValue() {
    return `${location.pathname}${location.search}`.slice(0, 1500);
}

function safeMetadata(metadata = {}) {
    const blocked = /name|email|password|token|phone|message/i;
    return Object.fromEntries(Object.entries(metadata)
        .filter(([key, value]) => !blocked.test(key) && ["string", "number", "boolean"].includes(typeof value))
        .slice(0, 20));
}

export async function track(eventType, metadata = {}) {
    const payload = {
        eventId: id("e"),
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        eventType,
        page: pageValue(),
        referrer: document.referrer || null,
        metadata: safeMetadata(metadata)
    };

    try {
        await fetch(ANALYTICS_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            keepalive: true
        });
    } catch (error) {
        console.debug("Analytics unavailable", error);
    }
}

function initClicks() {
    document.addEventListener("click", event => {
        const target = event.target.closest("a, button, [data-analytics-event]");
        if (!target) return;

        const manual = target.dataset.analyticsEvent;
        if (manual) {
            track(manual, { label: target.dataset.analyticsLabel || target.textContent?.trim().slice(0, 120) || "" });
            return;
        }

        if (target.matches("a[href]")) {
            try {
                const url = new URL(target.href, location.href);
                if (url.origin !== location.origin) {
                    track("external_link_click", { destination_host: url.hostname });
                    return;
                }
            } catch {}
        }

        if (target.matches(".cta, .btn-primary, [data-cta], a[href*='contact'], a[href*='audit']")) {
            track("cta_click", { label: target.textContent?.trim().slice(0, 120) || "cta" });
        }
    });
}

function initForms() {
    const started = new WeakSet();
    document.addEventListener("focusin", event => {
        const field = event.target.closest("input, textarea, select");
        const form = field?.form;
        if (!field || !form) return;
        if (!started.has(form)) {
            started.add(form);
            track("form_start", { form_id: form.id || "unnamed" });
        }
        track("form_field_interaction", { form_id: form.id || "unnamed", field_type: field.type || field.tagName.toLowerCase() });
    });

    document.addEventListener("submit", event => {
        const form = event.target.closest("form");
        if (form) track("form_submit", { form_id: form.id || "unnamed" });
    });

    document.addEventListener("invalid", event => {
        const field = event.target;
        const form = field?.form;
        if (form) track("form_error", { form_id: form.id || "unnamed", field_type: field.type || field.tagName?.toLowerCase() || "field" });
    }, true);
}

export function initAnalyticsTracker() {
    track("page_view", { title: document.title.slice(0, 160) });
    if (document.querySelector("article, [data-article]")) {
        track("article_view", { title: document.title.slice(0, 160) });
    }
    initClicks();
    initForms();
}

window.CLeakAnalytics = { track };
initAnalyticsTracker();
