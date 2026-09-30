import { api } from "../core/api.js";
import { escapeHTML } from "../core/utils.js";
const $ = (id) => document.getElementById(id),
    esc = (value) => escapeHTML(String(value ?? ""));
const fmt = (value) => new Intl.NumberFormat().format(Number(value) || 0),
    pct = (value) => `${(Number(value) || 0).toFixed(1)}%`;
let initialized = false,
    controller = null,
    report = null,
    journeyPage = 1,
    leadPage = 1,
    sessionToken = 0,
    activeQuery = "",
    journeyRequest = 0,
    leadRequest = 0;
const empty = (text = "No matching data yet.") =>
    `<div class="analytics-empty">${esc(text)}</div>`;
const errorHTML = (error) =>
    `<div class="analytics-empty analytics-error" role="alert">${esc(error.message || "Unable to load this panel.")} Use Apply filters to retry.</div>`;
function dateText(value) {
    if (!value) return "—";
    return new Date(value).toLocaleString("en-GB", {
        timeZone: $("analytics-timezone")?.value || "Africa/Lagos",
        dateStyle: "medium",
        timeStyle: "short",
    });
}
function setDates() {
    const days = Number($("analytics-period").value);
    if (!days) return;
    const offset = $("analytics-timezone").value === "UTC" ? 0 : 3600000;
    const end = new Date(Date.now() + offset),
        start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days + 1);
    $("analytics-start").value = start.toISOString().slice(0, 10);
    $("analytics-end").value = end.toISOString().slice(0, 10);
}
function query() {
    const p = new URLSearchParams({
        start: $("analytics-start").value,
        end: $("analytics-end").value,
        timezone: $("analytics-timezone").value,
    });
    for (const name of ["source", "device", "landing"])
        if ($(`analytics-${name}`).value.trim())
            p.set(name, $(`analytics-${name}`).value.trim());
    if ($("analytics-internal").checked) p.set("internal", "1");
    return p.toString();
}
function table(headers, rows) {
    if (!rows.length) return empty();
    return `<div class="analytics-table-scroll"><table class="analytics-table"><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function change(now, before, rate = false) {
    if (rate)
        return `${now >= before ? "+" : ""}${(now - before).toFixed(1)} pp`;
    if (!before) return now ? "No previous baseline" : "No change";
    const delta = ((now - before) / before) * 100;
    return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}
function renderMetrics(data) {
    const s = data.summary,
        p = data.comparison;
    const cards = [
        ["sessions", "Sessions", "Tracked visits"],
        ["enquiries", "Verified enquiries", "Linked to this session cohort"],
        ["conversion_rate", "Enquiry rate", "Converted sessions / sessions"],
        [
            "qualified_leads",
            "Qualified leads",
            "Current qualified, proposal or won stage",
        ],
        [
            "engagement_rate",
            "Engagement rate",
            "10s active, 2 pages, or enquiry",
        ],
        ["errors", "Form errors", "Events, not affected visitors"],
    ];
    $("analytics-metrics").innerHTML = cards
        .map(
            ([key, title, note], i) =>
                `<article class="analytics-metric"><div class="analytics-metric-label">${esc(title)}<span>0${i + 1}</span></div><strong>${key.endsWith("rate") ? pct(s[key]) : fmt(s[key])}</strong><div class="analytics-metric-change">${esc(key.endsWith("rate") && !p.sessions ? "No previous baseline" : change(s[key], p[key], key.endsWith("rate")))} <span>vs previous period</span></div><small>${esc(note)}</small></article>`,
        )
        .join("");
}
function trend(data) {
    const rows = data.daily,
        max = Math.max(1, ...rows.map((r) => Number(r.sessions))),
        w = 760,
        h = 210,
        pad = 30;
    const x = (i) =>
        pad + (w - 2 * pad) * (rows.length === 1 ? 0.5 : i / (rows.length - 1));
    const y = (v) => h - pad - ((h - 2 * pad) * v) / max;
    const points = (key) =>
        rows.map((r, i) => `${x(i)},${y(r[key])}`).join(" ");
    const grid = [0, 0.5, 1]
        .map(
            (n) =>
                `<line x1="${pad}" y1="${y(max * n)}" x2="${w - pad}" y2="${y(max * n)}" class="analytics-gridline"/><text x="5" y="${y(max * n) - 5}" class="analytics-axis">${Math.round(max * n)}</text>`,
        )
        .join("");
    $("analytics-trend").innerHTML =
        `<div class="analytics-chart-legend"><span><i></i>Sessions</span><span><i class="green"></i>Sessions with an enquiry</span></div><svg class="analytics-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Daily sessions and sessions with a verified enquiry. Exact values are in the table below.">${grid}<polyline points="${points("sessions")}" class="analytics-line sessions"/><polyline points="${points("conversions")}" class="analytics-line conversions"/>${rows.map((r, i) => `<circle cx="${x(i)}" cy="${y(r.sessions)}" r="3" class="analytics-point"><title>${esc(r.date)}: ${fmt(r.sessions)} sessions, ${fmt(r.conversions)} converted sessions</title></circle>`).join("")}</svg><div class="analytics-chart-dates"><span>${esc(rows[0]?.date || "")}</span><span>${esc(rows.at(-1)?.date || "")}</span></div><details class="analytics-chart-data"><summary>View daily values</summary>${table(
            ["Date", "Sessions", "Converted sessions", "Enquiries"],
            rows.map((r) => [
                esc(r.date),
                fmt(r.sessions),
                fmt(r.conversions),
                fmt(r.enquiries),
            ]),
        )}</details>`;
}
function renderOverview(data) {
    report = data;
    $("analytics-export").disabled = false;
    renderMetrics(data);
    trend(data);
    $("analytics-range-note").textContent =
        `${data.range.startDate} → ${data.range.endDate} · ${data.range.timezone} · Compared with the preceding equal interval. Session-cohort reporting.`;
    $("analytics-updated").textContent =
        `Updated ${dateText(data.generatedAt)}`;
    const last = data.health.last_received_at,
        age = last ? Date.now() - Date.parse(last) : Infinity;
    $("analytics-health").textContent = !last
        ? "Awaiting first event"
        : age < 300000
          ? "Recent events received"
          : "No event in last 5 minutes";
    $("analytics-health-dot").classList.toggle("fresh", age < 300000);
    $("analytics-coverage").textContent =
        `Oldest retained v2 session: ${dateText(data.health.tracking_since)}. Latest received event: ${dateText(last)}. Unattributed verified enquiries in these dates: ${fmt(data.health.unattributed_enquiries)} (not affected by source/device filters).`;
    const source = $("analytics-source"),
        selected = source.value;
    const options = [
        ...new Set([
            ...data.options.map((x) => x.source),
            ...(selected ? [selected] : []),
        ]),
    ].sort();
    source.innerHTML =
        '<option value="">All sources</option>' +
        options
            .map((x) => `<option value="${esc(x)}">${esc(x)}</option>`)
            .join("");
    source.value = selected;
    $("analytics-insights").innerHTML = data.insights.length
        ? data.insights
              .map(
                  (i) =>
                      `<div class="analytics-insight ${esc(i.level)}"><strong>${esc(i.title)}</strong><p>${esc(i.detail)}</p></div>`,
              )
              .join("")
        : empty(
              "No rule-based alerts in this range. Review the funnel and sources for opportunities.",
          );
    const s = data.summary,
        stages = [
            ["Sessions", s.sessions],
            ["Form started", s.form_starts],
            ["Later verified enquiry", s.funnel_completions],
        ];
    $("analytics-funnel").innerHTML = stages
        .map(([title, count], i) => {
            const previous = i ? stages[i - 1][1] : count;
            return `<div class="analytics-funnel-step"><div><span>${esc(title)}</span><strong>${fmt(count)}</strong></div><div class="analytics-bar"><i style="width:${s.sessions ? Math.max(0, Math.min(100, (count / s.sessions) * 100)) : 0}%"></i></div><small>${i ? `${pct(previous ? (count / previous) * 100 : 0)} progressed · ${fmt(Math.max(0, previous - count))} did not reach this step in the window` : "Session cohort · each session counted once per step"}</small></div>`;
        })
        .join("");
    $("analytics-sources").innerHTML = table(
        ["Source / campaign", "Sessions", "Enquiries", "Rate"],
        data.sources.map((r) => [
            `<strong>${esc(r.source)}</strong><small>${esc(r.medium)}${r.campaign ? " · " + esc(r.campaign) : ""}</small>`,
            fmt(r.sessions),
            fmt(r.enquiries),
            pct(r.sessions ? (r.conversions / r.sessions) * 100 : 0),
        ]),
    );
    $("analytics-landings").innerHTML = table(
        ["Landing page", "Sessions", "Enquiries", "Rate"],
        data.landings.map((r) => [
            esc(r.page),
            fmt(r.sessions),
            fmt(r.enquiries),
            pct(r.sessions ? (r.conversions / r.sessions) * 100 : 0),
        ]),
    );
    $("analytics-devices").innerHTML = table(
        ["Device", "Sessions", "Converted", "Rate"],
        data.devices.map((r) => [
            esc(r.device),
            fmt(r.sessions),
            fmt(r.conversions),
            pct(r.sessions ? (r.conversions / r.sessions) * 100 : 0),
        ]),
    );
    $("analytics-exits").innerHTML = table(
        ["Last observed page", "Sessions"],
        data.exits.map((r) => [esc(r.page), fmt(r.sessions)]),
    );
    $("analytics-forms").innerHTML = table(
        ["Form", "Attempts started", "Completed", "Rate", "Avg. completion"],
        data.forms.map((r) => [
            esc(r.form_id),
            fmt(r.starts),
            fmt(r.successes),
            pct(r.starts ? (r.successes / r.starts) * 100 : 0),
            r.completion_seconds === null
                ? "—"
                : `${Math.round(r.completion_seconds)}s`,
        ]),
    );
    $("analytics-errors").innerHTML = table(
        ["Form / field", "Error", "Events", "Sessions"],
        data.errors.map((r) => [
            `${esc(r.form_id)}<small>${esc(r.field_id)}</small>`,
            esc(r.error_code),
            fmt(r.count),
            fmt(r.sessions),
        ]),
    );
}
function pagination(id, data, type) {
    $(id).innerHTML =
        `<span>${fmt(data.total)} records · Page ${data.page} of ${Math.max(1, Math.ceil(data.total / data.limit))}</span><div><button class="analytics-btn" type="button" data-${type}-page="${data.page - 1}" ${data.page <= 1 ? "disabled" : ""}>Previous</button><button class="analytics-btn" type="button" data-${type}-page="${data.page + 1}" ${data.page * data.limit >= data.total ? "disabled" : ""}>Next</button></div>`;
}
async function journeys(signal) {
    const request = ++journeyRequest;
    const p = new URLSearchParams(activeQuery);
    p.set("page", journeyPage);
    p.set("q", $("analytics-search").value);
    p.set("outcome", $("analytics-outcome").value);
    const data = await api(`/api/admin/analytics/journeys?${p}`, { signal });
    if (request !== journeyRequest) return;
    $("analytics-journeys").innerHTML = table(
        [
            "Landing / session",
            "Source",
            "Device",
            "Events",
            "Outcome",
            "Started",
        ],
        data.journeys.map((r) => [
            `<button class="analytics-path-button" type="button" data-session="${esc(r.session_id)}">${esc(r.landing_page)}<small>${esc(r.session_id.slice(0, 12))}…</small></button>`,
            esc(r.source),
            esc(r.device),
            fmt(r.event_count),
            `<span class="analytics-pill ${r.lead_count ? "success" : ""}">${r.lead_count ? "Verified enquiry" : "No enquiry"}</span>`,
            esc(dateText(r.started_at)),
        ]),
    );
    pagination("analytics-journey-pages", data, "journey");
}
async function leads(signal) {
    const request = ++leadRequest;
    const data = await api(
        `/api/admin/analytics/leads?${activeQuery}&page=${leadPage}`,
        { signal },
    );
    if (request !== leadRequest) return;
    $("analytics-leads").innerHTML = table(
        ["Client", "Source", "Created", "Current stage"],
        data.leads.map((r) => [
            `<strong>${esc(r.name)}</strong><small>${esc(r.business || "")}</small>`,
            esc(r.source || "Unattributed"),
            esc(dateText(r.created_at)),
            `<select aria-label="Stage for ${esc(r.name)}" data-lead="${esc(r.lead_id)}" data-previous="${esc(r.stage)}">${["enquiry", "qualified", "proposal", "won", "lost"].map((stage) => `<option value="${stage}" ${r.stage === stage ? "selected" : ""}>${stage[0].toUpperCase() + stage.slice(1)}</option>`).join("")}</select>`,
        ]),
    );
    pagination("analytics-lead-pages", data, "lead");
}
export async function loadAnalytics() {
    if (!initialized) initAnalytics();
    controller?.abort();
    controller = new AbortController();
    const current = controller;
    activeQuery = query();
    report = null;
    $("analytics-export").disabled = true;
    $("analytics-refresh").disabled = true;
    $("analytics-refresh").textContent = "Loading…";
    $("analytics-notice").textContent = "";
    const results = await Promise.allSettled([
        api(`/api/admin/analytics/overview?${activeQuery}`, {
            signal: current.signal,
        }).then(renderOverview),
        journeys(current.signal),
        leads(current.signal),
    ]);
    if (current !== controller) return;
    results.forEach((r, i) => {
        if (r.status === "rejected" && r.reason.name !== "AbortError") {
            if (i === 0) {
                $("analytics-notice").innerHTML = errorHTML(r.reason);
                $("analytics-metrics").innerHTML = empty("Report unavailable.");
                for (const id of [
                    "trend",
                    "insights",
                    "funnel",
                    "sources",
                    "landings",
                    "devices",
                    "exits",
                    "forms",
                    "errors",
                ])
                    $(`analytics-${id}`).innerHTML = empty(
                        "Report unavailable.",
                    );
                $("analytics-health").textContent = "Report unavailable";
                $("analytics-health-dot").classList.remove("fresh");
            } else
                $(`analytics-${i === 1 ? "journeys" : "leads"}`).innerHTML =
                    errorHTML(r.reason);
        }
    });
    $("analytics-refresh").disabled = false;
    $("analytics-refresh").textContent = "Apply filters";
}
async function showSession(sessionId, page = 1) {
    const token = ++sessionToken,
        dialog = $("analytics-session-dialog");
    if (!dialog.open) dialog.showModal();
    $("analytics-session-content").innerHTML = empty("Loading journey…");
    try {
        const data = await api(
            `/api/admin/analytics/sessions/${encodeURIComponent(sessionId)}?page=${page}`,
        );
        if (token !== sessionToken) return;
        const s = data.session;
        $("analytics-session-content").innerHTML =
            `<div class="analytics-session-meta"><strong>${esc(s.landing_page)}</strong><p>${esc(s.source)} · ${esc(s.device)} · ${esc(dateText(s.started_at))}</p><small>Full session history, independent of the selected report end.</small></div>${data.leads.map((l) => `<div class="analytics-insight"><strong>Verified enquiry · ${esc(l.stage)}</strong><p>${esc(dateText(l.created_at))} · ${esc(l.form_id || "Form not identified")}</p></div>`).join("")}<ol class="analytics-timeline">${data.events
                .map((e, i) => {
                    const gap = i
                        ? (Date.parse(e.occurred_at) -
                              Date.parse(data.events[i - 1].occurred_at)) /
                          1000
                        : null;
                    return `<li><span class="analytics-timeline-index">${(page - 1) * 100 + i + 1}</span><div><strong>${esc(e.event_type.replaceAll("_", " "))}</strong><p>${esc(e.page)}</p><small>${esc(dateText(e.occurred_at))}${gap !== null ? ` · +${Math.round(gap)}s` : ""}</small>${
                        Object.keys(e.metadata).length
                            ? `<dl>${Object.entries(e.metadata)
                                  .map(
                                      ([k, v]) =>
                                          `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`,
                                  )
                                  .join("")}</dl>`
                            : ""
                    }</div></li>`;
                })
                .join(
                    "",
                )}</ol><div class="analytics-pagination"><span>${fmt(data.total)} events · Page ${page}</span><div>${page > 1 ? `<button class="analytics-btn" data-session="${esc(sessionId)}" data-event-page="${page - 1}">Previous</button>` : ""}${page * 100 < data.total ? `<button class="analytics-btn" data-session="${esc(sessionId)}" data-event-page="${page + 1}">Next</button>` : ""}</div></div>`;
    } catch (error) {
        if (token === sessionToken)
            $("analytics-session-content").innerHTML = errorHTML(error);
    }
}
function exportCSV() {
    if (!report) return;
    const rows = [
        ["Analytics v2", "Session cohort report"],
        ["Start", report.range.start],
        ["End exclusive", report.range.end],
        ["Timezone", report.range.timezone],
        ["Filters", JSON.stringify(report.filters)],
        [],
        ["Metric", "Current", "Previous"],
        ...Object.keys(report.summary).map((k) => [
            k,
            report.summary[k],
            report.comparison[k],
        ]),
        [],
        ["Date", "Sessions", "Converted sessions", "Enquiries"],
        ...report.daily.map((r) => [
            r.date,
            r.sessions,
            r.conversions,
            r.enquiries,
        ]),
        [],
        [
            "Source",
            "Medium",
            "Campaign",
            "Sessions",
            "Enquiries",
            "Converted sessions",
        ],
        ...report.sources.map((r) => [
            r.source,
            r.medium,
            r.campaign,
            r.sessions,
            r.enquiries,
            r.conversions,
        ]),
    ];
    const cell = (v) => {
        let s = String(v ?? "");
        if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
        return '"' + s.replaceAll('"', '""') + '"';
    };
    const url = URL.createObjectURL(
        new Blob(
            ["\uFEFF" + rows.map((r) => r.map(cell).join(",")).join("\r\n")],
            { type: "text/csv;charset=utf-8" },
        ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${report.range.startDate}-${report.range.endDate}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function initAnalytics() {
    if (initialized) return;
    initialized = true;
    setDates();
    $("analytics-filters").addEventListener("submit", (e) => {
        e.preventDefault();
        journeyPage = leadPage = 1;
        void loadAnalytics();
    });
    $("analytics-period").addEventListener("change", setDates);
    $("analytics-timezone").addEventListener("change", setDates);
    for (const id of ["analytics-start", "analytics-end"])
        $(id).addEventListener("change", () => {
            $("analytics-period").value = "custom";
        });
    $("analytics-export").addEventListener("click", exportCSV);
    $("analytics-dialog-close").addEventListener("click", () => {
        sessionToken++;
        $("analytics-session-dialog").close();
    });
    $("analytics-session-dialog").addEventListener("close", () => {
        sessionToken++;
    });
    $("analytics-journey-filter").addEventListener("submit", (e) => {
        e.preventDefault();
        journeyPage = 1;
        void journeys().catch((error) => {
            $("analytics-journeys").innerHTML = errorHTML(error);
        });
    });
    $("view-analytics").addEventListener("click", (e) => {
        const session = e.target.closest("[data-session]");
        if (session) {
            void showSession(
                session.dataset.session,
                Number(session.dataset.eventPage) || 1,
            );
            return;
        }
        const j = e.target.closest("[data-journey-page]"),
            l = e.target.closest("[data-lead-page]");
        if (j) {
            journeyPage = Number(j.dataset.journeyPage);
            void journeys().catch((error) => {
                $("analytics-journeys").innerHTML = errorHTML(error);
            });
        }
        if (l) {
            leadPage = Number(l.dataset.leadPage);
            void leads().catch((error) => {
                $("analytics-leads").innerHTML = errorHTML(error);
            });
        }
    });
    $("analytics-leads").addEventListener("change", async (e) => {
        const select = e.target.closest("[data-lead]");
        if (!select) return;
        select.disabled = true;
        try {
            await api(
                `/api/admin/analytics/leads/${encodeURIComponent(select.dataset.lead)}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ stage: select.value }),
                },
            );
            await loadAnalytics();
        } catch (error) {
            select.value = select.dataset.previous;
            $("analytics-notice").innerHTML = errorHTML(error);
            select.disabled = false;
        }
    });
}
