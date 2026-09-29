import { api } from "../core/api.js";
import { escapeHTML, formatRelativeTime } from "../core/utils.js";

let analyticsDays = 30;
let loading = false;

function number(value) {
    return new Intl.NumberFormat().format(Number(value || 0));
}

function stateHTML(title, description, error = false) {
    return `<div class="system-state ${error ? "error" : "empty"}"><div class="system-state-mark"></div><div class="system-state-content"><h3 class="system-state-title">${escapeHTML(title)}</h3><p class="system-state-description">${escapeHTML(description)}</p></div></div>`;
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function renderOverview(data) {
    const summary = data.summary || {};
    const eventTypes = Array.isArray(data.eventTypes) ? data.eventTypes : [];
    const topPages = Array.isArray(data.topPages) ? data.topPages : [];
    const recentEvents = Array.isArray(data.recentEvents) ? data.recentEvents : [];
    const dropoffs = Array.isArray(data.dropoffs) ? data.dropoffs : [];

    const engaged = eventTypes
        .filter(item => item.event_type !== "page_view")
        .reduce((total, item) => total + Number(item.count || 0), 0);

    const actions = Number(summary.cta_clicks || 0) + Number(summary.form_submits || 0);

    setText("analytics-stat-visitors", number(summary.visitors));
    setText("analytics-stat-sessions", number(summary.sessions));
    setText("analytics-stat-engaged", number(engaged));
    setText("analytics-stat-actions", number(actions));

    const system = document.querySelector(".analytics-readout-value");
    if (system) system.textContent = Number(summary.events || 0) ? "RECEIVING DATA" : "AWAITING DATA";

    const activity = document.getElementById("analytics-activity");
    if (activity) {
        activity.innerHTML = topPages.length ? `
            <div class="analytics-table">
                <div class="analytics-table-head"><span>PAGE</span><span>VIEWS</span></div>
                ${topPages.map(item => `<div class="analytics-table-row"><span class="analytics-path">${escapeHTML(item.page || "Unknown")}</span><strong>${number(item.views)}</strong></div>`).join("")}
            </div>` : stateHTML("No visitor data", "Page activity will appear after the tracker records visits.");
    }

    const dropoffBox = document.getElementById("analytics-dropoffs");
    if (dropoffBox) {
        dropoffBox.innerHTML = dropoffs.length ? `
            <div class="analytics-table">
                <div class="analytics-table-head"><span>LAST PAGE</span><span>SESSIONS</span></div>
                ${dropoffs.map(item => `<div class="analytics-table-row"><span class="analytics-path">${escapeHTML(item.page || "Unknown")}</span><strong>${number(item.sessions)}</strong></div>`).join("")}
            </div>` : stateHTML("No signals detected", "Drop-off patterns need recorded sessions before they can be calculated.");
    }

    const eventsBox = document.getElementById("analytics-events");
    if (eventsBox) {
        eventsBox.innerHTML = recentEvents.length ? recentEvents.map(event => `
            <div class="analytics-event-row">
                <span class="analytics-event-type">${escapeHTML(event.event_type || "event")}</span>
                <span class="analytics-event-page">${escapeHTML(event.page || "Unknown page")}</span>
                <time>${escapeHTML(formatRelativeTime(event.created_at))}</time>
            </div>`).join("") : stateHTML("Event stream empty", "Tracked events will appear here.");
    }
}

function renderJourneys(data) {
    const box = document.getElementById("analytics-journeys");
    if (!box) return;
    const journeys = Array.isArray(data.journeys) ? data.journeys : [];

    box.innerHTML = journeys.length ? journeys.slice(0, 12).map(journey => `
        <button class="analytics-journey-row" type="button" data-analytics-session="${escapeHTML(journey.session_id || "")}">
            <span><strong>${escapeHTML(journey.landing_page || "Unknown landing page")}</strong><small>${escapeHTML(journey.last_page || journey.landing_page || "")}</small></span>
            <span class="analytics-journey-events">${number(journey.event_count)} EVENTS</span>
            <time>${escapeHTML(formatRelativeTime(journey.last_seen_at))}</time>
        </button>`).join("") : stateHTML("Awaiting journeys", "Visitor paths will appear once sessions are recorded.");
}

async function showSession(sessionId) {
    if (!sessionId) return;
    const box = document.getElementById("analytics-journeys");
    if (!box) return;
    try {
        const data = await api(`/api/admin/analytics/sessions/${encodeURIComponent(sessionId)}`);
        const events = Array.isArray(data.events) ? data.events : [];
        box.innerHTML = `<button type="button" class="analytics-back" id="analytics-back-journeys">← BACK TO JOURNEYS</button><div class="analytics-session-trace">${events.map((event, index) => `<div class="analytics-trace-event"><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHTML(event.event_type)}</strong><small>${escapeHTML(event.page || "Unknown page")}</small></div><time>${escapeHTML(formatRelativeTime(event.created_at))}</time></div>`).join("") || stateHTML("No events", "This session has no recorded events.")}</div>`;
        document.getElementById("analytics-back-journeys")?.addEventListener("click", () => loadAnalytics());
    } catch (error) {
        box.innerHTML = stateHTML("Unable to load journey", error.message, true);
    }
}

export async function loadAnalytics() {
    if (loading) return;
    loading = true;
    try {
        const [overview, journeys] = await Promise.all([
            api(`/api/admin/analytics/overview?days=${analyticsDays}`),
            api(`/api/admin/analytics/journeys?days=${analyticsDays}`)
        ]);
        renderOverview(overview);
        renderJourneys(journeys);
    } catch (error) {
        const message = error.message || "Unable to load analytics.";
        ["analytics-activity", "analytics-journeys", "analytics-dropoffs", "analytics-events"].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.innerHTML = stateHTML("Analytics unavailable", message, true);
        });
    } finally {
        loading = false;
    }
}

export function initAnalytics() {
    document.getElementById("analytics-journeys")?.addEventListener("click", event => {
        const row = event.target.closest("[data-analytics-session]");
        if (row) showSession(row.dataset.analyticsSession);
    });
}
