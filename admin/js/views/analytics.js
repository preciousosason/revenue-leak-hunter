import { api } from "../core/api.js";
import { escapeHTML } from "../core/utils.js";


/* =========================================================
   HELPERS
========================================================= */

const $ = (id) =>
    document.getElementById(id);


const esc = (value) =>
    escapeHTML(
        String(
            value ?? ""
        )
    );


const number = (value) => {

    const parsed =
        Number(value);

    return Number.isFinite(parsed)
        ? parsed
        : 0;

};


const fmt = (value) =>
    new Intl.NumberFormat()
        .format(
            number(value)
        );


const pct = (value) =>
    `${number(value).toFixed(1)}%`;


const array = (value) =>
    Array.isArray(value)
        ? value
        : [];


const object = (value) => {

    if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
    ) {
        return value;
    }

    return {};

};


/* =========================================================
   STATE
========================================================= */

let initialized = false;

let controller = null;

let report = null;

let journeyPage = 1;

let leadPage = 1;

let sessionToken = 0;

let activeQuery = "";

let journeyRequest = 0;

let leadRequest = 0;


/* =========================================================
   BASIC UI STATES
========================================================= */

const empty = (
    text = "No matching data yet."
) => {

    return `
        <div class="analytics-empty">
            ${esc(text)}
        </div>
    `;

};


const errorHTML = (error) => {

    const message =
        error?.message ||
        "Unable to load this panel.";

    return `
        <div
            class="analytics-empty analytics-error"
            role="alert"
        >
            ${esc(message)}

            Use Apply filters to retry.
        </div>
    `;

};


/* =========================================================
   DATE FORMATTING
========================================================= */

function dateText(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }


    try {

        return date.toLocaleString(
            "en-GB",
            {
                timeZone:
                    $("analytics-timezone")?.value ||
                    "Africa/Lagos",

                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );

    } catch {

        return date.toLocaleString(
            "en-GB",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        );

    }

}


/* =========================================================
   DATE RANGE
========================================================= */

function setDates() {

    const period =
        $("analytics-period");

    const timezone =
        $("analytics-timezone");

    const startInput =
        $("analytics-start");

    const endInput =
        $("analytics-end");


    if (
        !period ||
        !timezone ||
        !startInput ||
        !endInput
    ) {
        return;
    }


    const days =
        Number(
            period.value
        );


    /*
     * "custom" becomes NaN.
     *
     * In that case we intentionally
     * preserve the user's dates.
     */

    if (
        !Number.isFinite(days) ||
        days <= 0
    ) {
        return;
    }


    /*
     * The dashboard currently supports:
     *
     * Africa/Lagos = UTC+1
     * UTC          = UTC+0
     *
     * Lagos does not observe DST.
     */

    const offset =
        timezone.value === "UTC"
            ? 0
            : 60 * 60 * 1000;


    const end =
        new Date(
            Date.now() + offset
        );


    const start =
        new Date(end);


    start.setUTCDate(
        start.getUTCDate() -
        days +
        1
    );


    startInput.value =
        start
            .toISOString()
            .slice(0, 10);


    endInput.value =
        end
            .toISOString()
            .slice(0, 10);

}


/* =========================================================
   QUERY BUILDER
========================================================= */

function query() {

    const start =
        $("analytics-start")?.value || "";

    const end =
        $("analytics-end")?.value || "";

    const timezone =
        $("analytics-timezone")?.value ||
        "Africa/Lagos";


    const params =
        new URLSearchParams({
            start,
            end,
            timezone
        });


    for (
        const name
        of [
            "source",
            "device",
            "landing"
        ]
    ) {

        const element =
            $(`analytics-${name}`);


        const value =
            element?.value?.trim() ||
            "";


        if (value) {
            params.set(
                name,
                value
            );
        }

    }


    if (
        $("analytics-internal")?.checked
    ) {

        params.set(
            "internal",
            "1"
        );

    }


    return params.toString();

}


/* =========================================================
   TABLE RENDERER
========================================================= */

function table(
    headers,
    rows
) {

    rows =
        array(rows);


    if (!rows.length) {

        return empty();

    }


    return `
        <div class="analytics-table-scroll">

            <table class="analytics-table">

                <thead>
                    <tr>
                        ${headers
                            .map(
                                (header) =>
                                    `
                                    <th scope="col">
                                        ${esc(header)}
                                    </th>
                                    `
                            )
                            .join("")}
                    </tr>
                </thead>

                <tbody>

                    ${rows
                        .map(
                            (row) =>
                                `
                                <tr>
                                    ${array(row)
                                        .map(
                                            (cell) =>
                                                `
                                                <td>
                                                    ${cell}
                                                </td>
                                                `
                                        )
                                        .join("")}
                                </tr>
                                `
                        )
                        .join("")}

                </tbody>

            </table>

        </div>
    `;

}


/* =========================================================
   COMPARISON
========================================================= */

function change(
    now,
    before,
    rate = false
) {

    now =
        number(now);

    before =
        number(before);


    if (rate) {

        const difference =
            now - before;


        return `
            ${difference >= 0 ? "+" : ""}
            ${difference.toFixed(1)} pp
        `.trim();

    }


    if (before === 0) {

        return now
            ? "No previous baseline"
            : "No change";

    }


    const delta =
        (
            (now - before) /
            before
        ) * 100;


    return `
        ${delta >= 0 ? "+" : ""}
        ${delta.toFixed(1)}%
    `.trim();

}


/* =========================================================
   METRIC CARDS
========================================================= */

function renderMetrics(data) {

    const summary =
        object(
            data?.summary
        );


    const comparison =
        object(
            data?.comparison
        );


    const cards = [

        [
            "sessions",
            "Sessions",
            "Tracked visits"
        ],

        [
            "enquiries",
            "Verified enquiries",
            "Linked to this session cohort"
        ],

        [
            "conversion_rate",
            "Enquiry rate",
            "Converted sessions / sessions"
        ],

        [
            "qualified_leads",
            "Qualified leads",
            "Current qualified, proposal or won stage"
        ],

        [
            "engagement_rate",
            "Engagement rate",
            "10s active, 2 pages, or enquiry"
        ],

        [
            "errors",
            "Form errors",
            "Events, not affected visitors"
        ]

    ];


    const container =
        $("analytics-metrics");


    if (!container) {
        return;
    }


    container.innerHTML =
        cards
            .map(
                (
                    [
                        key,
                        title,
                        note
                    ],
                    index
                ) => {

                    const isRate =
                        key.endsWith(
                            "rate"
                        );


                    const current =
                        number(
                            summary[key]
                        );


                    const previous =
                        number(
                            comparison[key]
                        );


                    const comparisonText =
                        isRate &&
                        number(
                            comparison.sessions
                        ) === 0

                            ? "No previous baseline"

                            : change(
                                  current,
                                  previous,
                                  isRate
                              );


                    return `
                        <article class="analytics-metric">

                            <div class="analytics-metric-label">

                                ${esc(title)}

                                <span>
                                    ${String(index + 1).padStart(2, "0")}
                                </span>

                            </div>

                            <strong>
                                ${
                                    isRate
                                        ? pct(current)
                                        : fmt(current)
                                }
                            </strong>

                            <div class="analytics-metric-change">

                                ${esc(comparisonText)}

                                <span>
                                    vs previous period
                                </span>

                            </div>

                            <small>
                                ${esc(note)}
                            </small>

                        </article>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   TREND GRAPH
========================================================= */

function trend(data) {

    const container =
        $("analytics-trend");


    if (!container) {
        return;
    }


    const rows =
        array(
            data?.daily
        );


    if (!rows.length) {

        container.innerHTML =
            empty(
                "No traffic recorded in this period."
            );

        return;

    }


    const normalized =
        rows.map(
            (row) => ({
                ...row,

                sessions:
                    number(
                        row.sessions
                    ),

                conversions:
                    number(
                        row.conversions
                    ),

                enquiries:
                    number(
                        row.enquiries
                    )
            })
        );


    const max =
        Math.max(
            1,
            ...normalized.map(
                (row) =>
                    row.sessions
            )
        );


    const width =
        760;

    const height =
        210;

    const padding =
        30;


    const x = (index) => {

        if (
            normalized.length === 1
        ) {

            return width / 2;

        }


        return (
            padding +
            (
                width -
                2 * padding
            ) *
                (
                    index /
                    (
                        normalized.length -
                        1
                    )
                )
        );

    };


    const y = (value) => {

        return (
            height -
            padding -
            (
                (
                    height -
                    2 * padding
                ) *
                number(value)
            ) /
                max
        );

    };


    const points =
        (key) =>
            normalized
                .map(
                    (row, index) =>
                        `${x(index)},${y(row[key])}`
                )
                .join(" ");


    const grid =
        [
            0,
            0.5,
            1
        ]
            .map(
                (position) => {

                    const value =
                        max *
                        position;


                    return `
                        <line
                            x1="${padding}"
                            y1="${y(value)}"
                            x2="${width - padding}"
                            y2="${y(value)}"
                            class="analytics-gridline"
                        ></line>

                        <text
                            x="5"
                            y="${y(value) - 5}"
                            class="analytics-axis"
                        >
                            ${Math.round(value)}
                        </text>
                    `;

                }
            )
            .join("");


    container.innerHTML = `

        <div class="analytics-chart-legend">

            <span>
                <i></i>
                Sessions
            </span>

            <span>
                <i class="green"></i>
                Sessions with an enquiry
            </span>

        </div>


        <svg
            class="analytics-chart"
            viewBox="0 0 ${width} ${height}"
            role="img"
            aria-label="Daily sessions and sessions with a verified enquiry. Exact values are in the table below."
        >

            ${grid}

            <polyline
                points="${points("sessions")}"
                class="analytics-line sessions"
            ></polyline>

            <polyline
                points="${points("conversions")}"
                class="analytics-line conversions"
            ></polyline>


            ${normalized
                .map(
                    (row, index) =>
                        `
                        <circle
                            cx="${x(index)}"
                            cy="${y(row.sessions)}"
                            r="3"
                            class="analytics-point"
                        >
                            <title>
                                ${esc(row.date)}:
                                ${fmt(row.sessions)} sessions,
                                ${fmt(row.conversions)} converted sessions
                            </title>
                        </circle>
                        `
                )
                .join("")}

        </svg>


        <div class="analytics-chart-dates">

            <span>
                ${esc(normalized[0]?.date || "")}
            </span>

            <span>
                ${esc(normalized.at(-1)?.date || "")}
            </span>

        </div>


        <details class="analytics-chart-data">

            <summary>
                View daily values
            </summary>

            ${table(
                [
                    "Date",
                    "Sessions",
                    "Converted sessions",
                    "Enquiries"
                ],

                normalized.map(
                    (row) => [
                        esc(row.date),
                        fmt(row.sessions),
                        fmt(row.conversions),
                        fmt(row.enquiries)
                    ]
                )
            )}

        </details>
    `;

}


/* =========================================================
   OVERVIEW
========================================================= */

function renderOverview(data) {

    data =
        object(data);


    report =
        data;


    const exportButton =
        $("analytics-export");


    if (exportButton) {
        exportButton.disabled = false;
    }


    renderMetrics(
        data
    );


    trend(
        data
    );


    const range =
        object(
            data.range
        );


    const summary =
        object(
            data.summary
        );


    const health =
        object(
            data.health
        );


    const rangeNote =
        $("analytics-range-note");


    if (rangeNote) {

        rangeNote.textContent =
            `${range.startDate || "—"} → ${range.endDate || "—"} · ${range.timezone || "—"} · Compared with the preceding equal interval. Session-cohort reporting.`;

    }


    const updated =
        $("analytics-updated");


    if (updated) {

        updated.textContent =
            `Updated ${dateText(data.generatedAt)}`;

    }


    const last =
        health.last_received_at ||
        null;


    const parsedLast =
        last
            ? Date.parse(last)
            : NaN;


    const age =
        Number.isFinite(parsedLast)
            ? Date.now() -
              parsedLast
            : Infinity;


    const healthText =
        $("analytics-health");


    if (healthText) {

        healthText.textContent =
            !last

                ? "Awaiting first event"

                : age < 300000

                  ? "Recent events received"

                  : "No event in last 5 minutes";

    }


    $("analytics-health-dot")
        ?.classList
        .toggle(
            "fresh",
            age < 300000
        );


    const coverage =
        $("analytics-coverage");


    if (coverage) {

        coverage.textContent =
            `Oldest retained v2 session: ${dateText(health.tracking_since)}. Latest received event: ${dateText(last)}. Unattributed verified enquiries in these dates: ${fmt(health.unattributed_enquiries)} (not affected by source/device filters).`;

    }


    /* =====================================================
       SOURCE FILTER OPTIONS
    ===================================================== */

    const source =
        $("analytics-source");


    if (source) {

        const selected =
            source.value;


        const options =
            [
                ...new Set(
                    array(
                        data.options
                    )
                        .map(
                            (item) =>
                                String(
                                    item?.source ||
                                    ""
                                ).trim()
                        )
                        .filter(Boolean)
                        .concat(
                            selected
                                ? [selected]
                                : []
                        )
                )
            ]
                .sort(
                    (
                        first,
                        second
                    ) =>
                        first.localeCompare(
                            second
                        )
                );


        source.innerHTML =
            `
                <option value="">
                    All sources
                </option>
            ` +
            options
                .map(
                    (value) =>
                        `
                        <option value="${esc(value)}">
                            ${esc(value)}
                        </option>
                        `
                )
                .join("");


        source.value =
            selected;

    }


    /* =====================================================
       INSIGHTS
    ===================================================== */

    const insights =
        array(
            data.insights
        );


    $("analytics-insights").innerHTML =
        insights.length

            ? insights
                  .map(
                      (insight) =>
                          `
                          <div
                              class="analytics-insight ${esc(
                                  insight?.level ||
                                  ""
                              )}"
                          >

                              <strong>
                                  ${esc(
                                      insight?.title ||
                                      "Observation"
                                  )}
                              </strong>

                              <p>
                                  ${esc(
                                      insight?.detail ||
                                      ""
                                  )}
                              </p>

                          </div>
                          `
                  )
                  .join("")

            : empty(
                  "No rule-based alerts in this range. Review the funnel and sources for opportunities."
              );


    /* =====================================================
       FUNNEL
    ===================================================== */

    const stages = [

        [
            "Sessions",
            number(
                summary.sessions
            )
        ],

        [
            "Form started",
            number(
                summary.form_starts
            )
        ],

        [
            "Later verified enquiry",
            number(
                summary.funnel_completions
            )
        ]

    ];


    $("analytics-funnel").innerHTML =
        stages
            .map(
                (
                    [
                        title,
                        count
                    ],
                    index
                ) => {

                    const previous =
                        index
                            ? stages[index - 1][1]
                            : count;


                    const progression =
                        index

                            ? (
                                previous
                                    ? (
                                        count /
                                        previous
                                    ) *
                                      100

                                    : 0
                              )

                            : 100;


                    const width =
                        number(
                            summary.sessions
                        )
                            ? Math.max(
                                  0,
                                  Math.min(
                                      100,
                                      (
                                          count /
                                          number(
                                              summary.sessions
                                          )
                                      ) *
                                          100
                                  )
                              )
                            : 0;


                    return `
                        <div class="analytics-funnel-step">

                            <div>

                                <span>
                                    ${esc(title)}
                                </span>

                                <strong>
                                    ${fmt(count)}
                                </strong>

                            </div>

                            <div class="analytics-bar">

                                <i
                                    style="width:${width}%"
                                ></i>

                            </div>

                            <small>

                                ${
                                    index

                                        ? `${pct(progression)} progressed · ${fmt(
                                              Math.max(
                                                  0,
                                                  previous -
                                                      count
                                              )
                                          )} did not reach this step in the window`

                                        : "Session cohort · each session counted once per step"
                                }

                            </small>

                        </div>
                    `;

                }
            )
            .join("");


    /* =====================================================
       SOURCES
    ===================================================== */

    $("analytics-sources").innerHTML =
        table(
            [
                "Source / campaign",
                "Sessions",
                "Enquiries",
                "Rate"
            ],

            array(
                data.sources
            ).map(
                (row) => [

                    `
                    <strong>
                        ${esc(
                            row?.source ||
                            "Direct / unknown"
                        )}
                    </strong>

                    <small>
                        ${esc(
                            row?.medium ||
                            ""
                        )}
                        ${
                            row?.campaign
                                ? ` · ${esc(
                                      row.campaign
                                  )}`
                                : ""
                        }
                    </small>
                    `,

                    fmt(
                        row?.sessions
                    ),

                    fmt(
                        row?.enquiries
                    ),

                    pct(
                        number(
                            row?.sessions
                        )
                            ? (
                                number(
                                    row?.conversions
                                ) /
                                number(
                                    row?.sessions
                                )
                              ) *
                              100
                            : 0
                    )

                ]
            )
        );


    /* =====================================================
       LANDING PAGES
    ===================================================== */

    $("analytics-landings").innerHTML =
        table(
            [
                "Landing page",
                "Sessions",
                "Enquiries",
                "Rate"
            ],

            array(
                data.landings
            ).map(
                (row) => [

                    esc(
                        row?.page ||
                        "Unknown"
                    ),

                    fmt(
                        row?.sessions
                    ),

                    fmt(
                        row?.enquiries
                    ),

                    pct(
                        number(
                            row?.sessions
                        )
                            ? (
                                number(
                                    row?.conversions
                                ) /
                                number(
                                    row?.sessions
                                )
                              ) *
                              100
                            : 0
                    )

                ]
            )
        );


    /* =====================================================
       DEVICES
    ===================================================== */

    $("analytics-devices").innerHTML =
        table(
            [
                "Device",
                "Sessions",
                "Converted",
                "Rate"
            ],

            array(
                data.devices
            ).map(
                (row) => [

                    esc(
                        row?.device ||
                        "unknown"
                    ),

                    fmt(
                        row?.sessions
                    ),

                    fmt(
                        row?.conversions
                    ),

                    pct(
                        number(
                            row?.sessions
                        )
                            ? (
                                number(
                                    row?.conversions
                                ) /
                                number(
                                    row?.sessions
                                )
                              ) *
                              100
                            : 0
                    )

                ]
            )
        );


    /* =====================================================
       OBSERVED EXITS
    ===================================================== */

    $("analytics-exits").innerHTML =
        table(
            [
                "Last observed page",
                "Sessions"
            ],

            array(
                data.exits
            ).map(
                (row) => [

                    esc(
                        row?.page ||
                        "Unknown"
                    ),

                    fmt(
                        row?.sessions
                    )

                ]
            )
        );


    /* =====================================================
       FORM HEALTH
    ===================================================== */

    $("analytics-forms").innerHTML =
        table(
            [
                "Form",
                "Attempts started",
                "Completed",
                "Rate",
                "Avg. completion"
            ],

            array(
                data.forms
            ).map(
                (row) => {

                    const starts =
                        number(
                            row?.starts
                        );


                    const successes =
                        number(
                            row?.successes
                        );


                    const completionSeconds =
                        row?.completion_seconds;


                    return [

                        esc(
                            row?.form_id ||
                            "Unknown form"
                        ),

                        fmt(
                            starts
                        ),

                        fmt(
                            successes
                        ),

                        pct(
                            starts
                                ? (
                                    successes /
                                    starts
                                ) *
                                  100
                                : 0
                        ),

                        completionSeconds === null ||
                        completionSeconds === undefined

                            ? "—"

                            : `${Math.round(
                                  number(
                                      completionSeconds
                                  )
                              )}s`

                    ];

                }
            )
        );


    /* =====================================================
       FORM ERRORS
    ===================================================== */

    $("analytics-errors").innerHTML =
        table(
            [
                "Form / field",
                "Error",
                "Events",
                "Sessions"
            ],

            array(
                data.errors
            ).map(
                (row) => [

                    `
                    ${esc(
                        row?.form_id ||
                        "Unknown form"
                    )}

                    <small>
                        ${esc(
                            row?.field_id ||
                            "Unknown field"
                        )}
                    </small>
                    `,

                    esc(
                        row?.error_code ||
                        "unknown"
                    ),

                    fmt(
                        row?.count
                    ),

                    fmt(
                        row?.sessions
                    )

                ]
            )
        );

}


/* =========================================================
   PAGINATION
========================================================= */

function pagination(
    id,
    data,
    type
) {

    const container =
        $(id);


    if (!container) {
        return;
    }


    data =
        object(data);


    const total =
        Math.max(
            0,
            number(
                data.total
            )
        );


    const limit =
        Math.max(
            1,
            number(
                data.limit
            ) ||
            20
        );


    const page =
        Math.max(
            1,
            number(
                data.page
            ) ||
            1
        );


    const pages =
        Math.max(
            1,
            Math.ceil(
                total /
                limit
            )
        );


    container.innerHTML = `

        <span>
            ${fmt(total)} records ·
            Page ${page} of ${pages}
        </span>

        <div>

            <button
                class="analytics-btn"
                type="button"
                data-${type}-page="${page - 1}"
                ${page <= 1 ? "disabled" : ""}
            >
                Previous
            </button>

            <button
                class="analytics-btn"
                type="button"
                data-${type}-page="${page + 1}"
                ${
                    page >= pages
                        ? "disabled"
                        : ""
                }
            >
                Next
            </button>

        </div>
    `;

}


/* =========================================================
   JOURNEYS
========================================================= */

async function journeys(
    signal
) {

    const request =
        ++journeyRequest;


    const params =
        new URLSearchParams(
            activeQuery
        );


    params.set(
        "page",
        Math.max(
            1,
            journeyPage
        )
    );


    const search =
        $("analytics-search")
            ?.value
            ?.trim() ||
        "";


    const outcome =
        $("analytics-outcome")
            ?.value ||
        "";


    if (search) {

        params.set(
            "q",
            search
        );

    }


    if (outcome) {

        params.set(
            "outcome",
            outcome
        );

    }


    const data =
        await api(
            `/api/admin/analytics/journeys?${params.toString()}`,
            {
                signal
            }
        );


    if (
        request !==
        journeyRequest
    ) {
        return;
    }


    const rows =
        array(
            data?.journeys
        );


    $("analytics-journeys").innerHTML =
        table(
            [
                "Landing / session",
                "Source",
                "Device",
                "Events",
                "Outcome",
                "Started"
            ],

            rows.map(
                (row) => {

                    const sessionId =
                        String(
                            row?.session_id ||
                            ""
                        );


                    return [

                        `
                        <button
                            class="analytics-path-button"
                            type="button"
                            data-session="${esc(
                                sessionId
                            )}"
                            ${!sessionId ? "disabled" : ""}
                        >

                            ${esc(
                                row?.landing_page ||
                                "Unknown landing page"
                            )}

                            <small>
                                ${
                                    sessionId
                                        ? `${esc(
                                              sessionId.slice(
                                                  0,
                                                  12
                                              )
                                          )}…`
                                        : "No session ID"
                                }
                            </small>

                        </button>
                        `,

                        esc(
                            row?.source ||
                            "Direct / unknown"
                        ),

                        esc(
                            row?.device ||
                            "unknown"
                        ),

                        fmt(
                            row?.event_count
                        ),

                        `
                        <span
                            class="analytics-pill ${
                                number(
                                    row?.lead_count
                                )
                                    ? "success"
                                    : ""
                            }"
                        >
                            ${
                                number(
                                    row?.lead_count
                                )
                                    ? "Verified enquiry"
                                    : "No enquiry"
                            }
                        </span>
                        `,

                        esc(
                            dateText(
                                row?.started_at
                            )
                        )

                    ];

                }
            )
        );


    pagination(
        "analytics-journey-pages",
        data,
        "journey"
    );

}


/* =========================================================
   LEADS
========================================================= */

async function leads(
    signal
) {

    const request =
        ++leadRequest;


    const params =
        new URLSearchParams(
            activeQuery
        );


    params.set(
        "page",
        Math.max(
            1,
            leadPage
        )
    );


    const data =
        await api(
            `/api/admin/analytics/leads?${params.toString()}`,
            {
                signal
            }
        );


    if (
        request !==
        leadRequest
    ) {
        return;
    }


    const stages = [
        "enquiry",
        "qualified",
        "proposal",
        "won",
        "lost"
    ];


    $("analytics-leads").innerHTML =
        table(
            [
                "Client",
                "Source",
                "Created",
                "Current stage"
            ],

            array(
                data?.leads
            ).map(
                (row) => {

                    const stage =
                        stages.includes(
                            row?.stage
                        )
                            ? row.stage
                            : "enquiry";


                    return [

                        `
                        <strong>
                            ${esc(
                                row?.name ||
                                "Unnamed enquiry"
                            )}
                        </strong>

                        <small>
                            ${esc(
                                row?.business ||
                                ""
                            )}
                        </small>
                        `,

                        esc(
                            row?.source ||
                            "Unattributed"
                        ),

                        esc(
                            dateText(
                                row?.created_at
                            )
                        ),

                        `
                        <select
                            aria-label="Stage for ${esc(
                                row?.name ||
                                "enquiry"
                            )}"
                            data-lead="${esc(
                                row?.lead_id ||
                                ""
                            )}"
                            data-previous="${esc(
                                stage
                            )}"
                            ${
                                !row?.lead_id
                                    ? "disabled"
                                    : ""
                            }
                        >

                            ${stages
                                .map(
                                    (
                                        optionStage
                                    ) =>
                                        `
                                        <option
                                            value="${optionStage}"
                                            ${
                                                stage ===
                                                optionStage
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${
                                                optionStage[0].toUpperCase() +
                                                optionStage.slice(1)
                                            }
                                        </option>
                                        `
                                )
                                .join("")}

                        </select>
                        `

                    ];

                }
            )
        );


    pagination(
        "analytics-lead-pages",
        data,
        "lead"
    );

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

export async function loadAnalytics() {

    if (!initialized) {
        initAnalytics();
    }


    controller?.abort();


    controller =
        new AbortController();


    const current =
        controller;


    activeQuery =
        query();


    report =
        null;


    const exportButton =
        $("analytics-export");

    const refreshButton =
        $("analytics-refresh");

    const notice =
        $("analytics-notice");


    if (exportButton) {
        exportButton.disabled =
            true;
    }


    if (refreshButton) {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "Loading…";

    }


    if (notice) {
        notice.textContent = "";
    }


    $("view-analytics")
        ?.setAttribute(
            "aria-busy",
            "true"
        );


    try {

        const results =
            await Promise.allSettled([

                api(
                    `/api/admin/analytics/overview?${activeQuery}`,
                    {
                        signal:
                            current.signal
                    }
                )
                    .then(
                        renderOverview
                    ),

                journeys(
                    current.signal
                ),

                leads(
                    current.signal
                )

            ]);


        if (
            current !==
            controller
        ) {
            return;
        }


        results.forEach(
            (
                result,
                index
            ) => {

                if (
                    result.status !==
                    "rejected"
                ) {
                    return;
                }


                if (
                    result.reason?.name ===
                    "AbortError"
                ) {
                    return;
                }


                if (index === 0) {

                    if (notice) {

                        notice.innerHTML =
                            errorHTML(
                                result.reason
                            );

                    }


                    const metrics =
                        $("analytics-metrics");


                    if (metrics) {

                        metrics.innerHTML =
                            empty(
                                "Report unavailable."
                            );

                    }


                    for (
                        const id
                        of [
                            "trend",
                            "insights",
                            "funnel",
                            "sources",
                            "landings",
                            "devices",
                            "exits",
                            "forms",
                            "errors"
                        ]
                    ) {

                        const element =
                            $(
                                `analytics-${id}`
                            );


                        if (element) {

                            element.innerHTML =
                                empty(
                                    "Report unavailable."
                                );

                        }

                    }


                    const health =
                        $("analytics-health");


                    if (health) {

                        health.textContent =
                            "Report unavailable";

                    }


                    $("analytics-health-dot")
                        ?.classList
                        .remove(
                            "fresh"
                        );

                } else {

                    const target =
                        $(
                            `analytics-${
                                index === 1
                                    ? "journeys"
                                    : "leads"
                            }`
                        );


                    if (target) {

                        target.innerHTML =
                            errorHTML(
                                result.reason
                            );

                    }

                }

            }
        );

    } finally {

        if (
            current ===
            controller
        ) {

            if (refreshButton) {

                refreshButton.disabled =
                    false;

                refreshButton.textContent =
                    "Apply filters";

            }


            $("view-analytics")
                ?.removeAttribute(
                    "aria-busy"
                );

        }

    }

}


/* =========================================================
   SESSION JOURNEY
========================================================= */

async function showSession(
    sessionId,
    page = 1
) {

    if (!sessionId) {
        return;
    }


    page =
        Math.max(
            1,
            number(page) ||
            1
        );


    const token =
        ++sessionToken;


    const dialog =
        $("analytics-session-dialog");


    if (!dialog) {
        return;
    }


    if (!dialog.open) {

        dialog.showModal();

    }


    const content =
        $("analytics-session-content");


    if (!content) {
        return;
    }


    content.innerHTML =
        empty(
            "Loading journey…"
        );


    try {

        const data =
            await api(
                `/api/admin/analytics/sessions/${encodeURIComponent(
                    sessionId
                )}?page=${page}`
            );


        if (
            token !==
            sessionToken
        ) {
            return;
        }


        const session =
            object(
                data?.session
            );


        const events =
            array(
                data?.events
            );


        const sessionLeads =
            array(
                data?.leads
            );


        const total =
            number(
                data?.total
            );


        content.innerHTML = `

            <div class="analytics-session-meta">

                <strong>
                    ${esc(
                        session.landing_page ||
                        "Unknown landing page"
                    )}
                </strong>

                <p>
                    ${esc(
                        session.source ||
                        "Direct / unknown"
                    )}
                    ·
                    ${esc(
                        session.device ||
                        "unknown"
                    )}
                    ·
                    ${esc(
                        dateText(
                            session.started_at
                        )
                    )}
                </p>

                <small>
                    Full session history,
                    independent of the
                    selected report end.
                </small>

            </div>


            ${sessionLeads
                .map(
                    (lead) =>
                        `
                        <div class="analytics-insight">

                            <strong>
                                Verified enquiry ·
                                ${esc(
                                    lead?.stage ||
                                    "enquiry"
                                )}
                            </strong>

                            <p>
                                ${esc(
                                    dateText(
                                        lead?.created_at
                                    )
                                )}
                                ·
                                ${esc(
                                    lead?.form_id ||
                                    "Form not identified"
                                )}
                            </p>

                        </div>
                        `
                )
                .join("")}


            ${
                events.length

                    ? `
                    <ol class="analytics-timeline">

                        ${events
                            .map(
                                (
                                    event,
                                    index
                                ) => {

                                    const metadata =
                                        object(
                                            event?.metadata
                                        );


                                    const previousEvent =
                                        index
                                            ? events[index - 1]
                                            : null;


                                    const currentTime =
                                        Date.parse(
                                            event?.occurred_at ||
                                            ""
                                        );


                                    const previousTime =
                                        Date.parse(
                                            previousEvent?.occurred_at ||
                                            ""
                                        );


                                    const gap =
                                        index &&
                                        Number.isFinite(
                                            currentTime
                                        ) &&
                                        Number.isFinite(
                                            previousTime
                                        )

                                            ? (
                                                currentTime -
                                                previousTime
                                              ) /
                                              1000

                                            : null;


                                    const eventType =
                                        String(
                                            event?.event_type ||
                                            "event"
                                        )
                                            .replaceAll(
                                                "_",
                                                " "
                                            );


                                    return `
                                        <li>

                                            <span class="analytics-timeline-index">
                                                ${
                                                    (
                                                        page -
                                                        1
                                                    ) *
                                                        100 +
                                                    index +
                                                    1
                                                }
                                            </span>

                                            <div>

                                                <strong>
                                                    ${esc(
                                                        eventType
                                                    )}
                                                </strong>

                                                <p>
                                                    ${esc(
                                                        event?.page ||
                                                        "—"
                                                    )}
                                                </p>

                                                <small>
                                                    ${esc(
                                                        dateText(
                                                            event?.occurred_at
                                                        )
                                                    )}
                                                    ${
                                                        gap !== null

                                                            ? ` · +${Math.max(
                                                                  0,
                                                                  Math.round(
                                                                      gap
                                                                  )
                                                              )}s`

                                                            : ""
                                                    }
                                                </small>


                                                ${
                                                    Object.keys(
                                                        metadata
                                                    ).length

                                                        ? `
                                                        <dl>

                                                            ${Object.entries(
                                                                metadata
                                                            )
                                                                .map(
                                                                    (
                                                                        [
                                                                            key,
                                                                            value
                                                                        ]
                                                                    ) =>
                                                                        `
                                                                        <div>

                                                                            <dt>
                                                                                ${esc(
                                                                                    key
                                                                                )}
                                                                            </dt>

                                                                            <dd>
                                                                                ${esc(
                                                                                    typeof value ===
                                                                                        "object"

                                                                                        ? JSON.stringify(
                                                                                              value
                                                                                          )

                                                                                        : value
                                                                                )}
                                                                            </dd>

                                                                        </div>
                                                                        `
                                                                )
                                                                .join("")}

                                                        </dl>
                                                        `

                                                        : ""
                                                }

                                            </div>

                                        </li>
                                    `;

                                }
                            )
                            .join("")}

                    </ol>
                    `

                    : empty(
                          "No events were recorded for this session."
                      )
            }


            <div class="analytics-pagination">

                <span>
                    ${fmt(total)}
                    events ·
                    Page ${page}
                </span>

                <div>

                    ${
                        page > 1

                            ? `
                            <button
                                class="analytics-btn"
                                type="button"
                                data-session="${esc(
                                    sessionId
                                )}"
                                data-event-page="${
                                    page -
                                    1
                                }"
                            >
                                Previous
                            </button>
                            `

                            : ""
                    }

                    ${
                        page *
                            100 <
                        total

                            ? `
                            <button
                                class="analytics-btn"
                                type="button"
                                data-session="${esc(
                                    sessionId
                                )}"
                                data-event-page="${
                                    page +
                                    1
                                }"
                            >
                                Next
                            </button>
                            `

                            : ""
                    }

                </div>

            </div>
        `;

    } catch (error) {

        if (
            token ===
            sessionToken
        ) {

            content.innerHTML =
                errorHTML(error);

        }

    }

}


/* =========================================================
   CSV EXPORT
========================================================= */

function exportCSV() {

    if (!report) {
        return;
    }


    const range =
        object(
            report.range
        );


    const filters =
        object(
            report.filters
        );


    const summary =
        object(
            report.summary
        );


    const comparison =
        object(
            report.comparison
        );


    const rows = [

        [
            "Analytics v2",
            "Session cohort report"
        ],

        [
            "Start",
            range.start
        ],

        [
            "End exclusive",
            range.end
        ],

        [
            "Timezone",
            range.timezone
        ],

        [
            "Filters",
            JSON.stringify(
                filters
            )
        ],

        [],


        [
            "Metric",
            "Current",
            "Previous"
        ],

        ...Object.keys(
            summary
        ).map(
            (key) => [
                key,
                summary[key],
                comparison[key]
            ]
        ),

        [],


        [
            "Date",
            "Sessions",
            "Converted sessions",
            "Enquiries"
        ],

        ...array(
            report.daily
        ).map(
            (row) => [
                row.date,
                row.sessions,
                row.conversions,
                row.enquiries
            ]
        ),

        [],


        [
            "Source",
            "Medium",
            "Campaign",
            "Sessions",
            "Enquiries",
            "Converted sessions"
        ],

        ...array(
            report.sources
        ).map(
            (row) => [
                row.source,
                row.medium,
                row.campaign,
                row.sessions,
                row.enquiries,
                row.conversions
            ]
        ),

        [],


        [
            "Landing page",
            "Sessions",
            "Enquiries",
            "Converted sessions"
        ],

        ...array(
            report.landings
        ).map(
            (row) => [
                row.page,
                row.sessions,
                row.enquiries,
                row.conversions
            ]
        ),

        [],


        [
            "Device",
            "Sessions",
            "Converted sessions"
        ],

        ...array(
            report.devices
        ).map(
            (row) => [
                row.device,
                row.sessions,
                row.conversions
            ]
        ),

        [],


        [
            "Observed exit page",
            "Sessions"
        ],

        ...array(
            report.exits
        ).map(
            (row) => [
                row.page,
                row.sessions
            ]
        ),

        [],


        [
            "Form",
            "Starts",
            "Completed",
            "Average completion seconds"
        ],

        ...array(
            report.forms
        ).map(
            (row) => [
                row.form_id,
                row.starts,
                row.successes,
                row.completion_seconds
            ]
        ),

        [],


        [
            "Form",
            "Field",
            "Error",
            "Events",
            "Sessions"
        ],

        ...array(
            report.errors
        ).map(
            (row) => [
                row.form_id,
                row.field_id,
                row.error_code,
                row.count,
                row.sessions
            ]
        )

    ];


    const cell = (value) => {

        let string =
            String(
                value ??
                ""
            );


        /*
         * Prevent spreadsheet formula injection.
         */

        if (
            /^[=+@\-\t\r]/.test(
                string
            )
        ) {

            string =
                "'" +
                string;

        }


        return (
            '"' +
            string.replaceAll(
                '"',
                '""'
            ) +
            '"'
        );

    };


    const csv =
        "\uFEFF" +
        rows
            .map(
                (row) =>
                    row
                        .map(cell)
                        .join(",")
            )
            .join("\r\n");


    const url =
        URL.createObjectURL(
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8"
                }
            )
        );


    const anchor =
        document.createElement(
            "a"
        );


    anchor.href =
        url;


    anchor.download =
        `analytics-${range.startDate || "start"}-${range.endDate || "end"}.csv`;


    document.body.appendChild(
        anchor
    );


    anchor.click();


    anchor.remove();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

export function initAnalytics() {

    if (initialized) {
        return;
    }


    /*
     * The script normally runs after
     * admin.html has been parsed.
     *
     * Do not permanently initialize if
     * the Analytics v2 markup is absent.
     */

    if (
        !$("view-analytics") ||
        !$("analytics-filters")
    ) {

        console.error(
            "Analytics v2 markup was not found."
        );

        return;
    }


    initialized =
        true;


    setDates();


    /* =====================================================
       MAIN FILTERS
    ===================================================== */

    $("analytics-filters")
        .addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                journeyPage =
                    1;

                leadPage =
                    1;

                void loadAnalytics();

            }
        );


    $("analytics-period")
        ?.addEventListener(
            "change",
            setDates
        );


    $("analytics-timezone")
        ?.addEventListener(
            "change",
            setDates
        );


    for (
        const id
        of [
            "analytics-start",
            "analytics-end"
        ]
    ) {

        $(id)
            ?.addEventListener(
                "change",
                () => {

                    const period =
                        $("analytics-period");


                    if (period) {

                        period.value =
                            "custom";

                    }

                }
            );

    }


    /* =====================================================
       EXPORT
    ===================================================== */

    $("analytics-export")
        ?.addEventListener(
            "click",
            exportCSV
        );


    /* =====================================================
       SESSION DIALOG
    ===================================================== */

    $("analytics-dialog-close")
        ?.addEventListener(
            "click",
            () => {

                sessionToken++;

                $("analytics-session-dialog")
                    ?.close();

            }
        );


    $("analytics-session-dialog")
        ?.addEventListener(
            "close",
            () => {

                sessionToken++;

            }
        );


    /* =====================================================
       JOURNEY SEARCH
    ===================================================== */

    $("analytics-journey-filter")
        ?.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                journeyPage =
                    1;


                void journeys()
                    .catch(
                        (error) => {

                            const target =
                                $("analytics-journeys");


                            if (target) {

                                target.innerHTML =
                                    errorHTML(
                                        error
                                    );

                            }

                        }
                    );

            }
        );


    /* =====================================================
       PAGE / SESSION CLICK DELEGATION
    ===================================================== */

    $("view-analytics")
        ?.addEventListener(
            "click",
            (event) => {

                const target =
                    event.target;


                if (
                    !(target instanceof Element)
                ) {
                    return;
                }


                const session =
                    target.closest(
                        "[data-session]"
                    );


                if (session) {

                    void showSession(
                        session.dataset.session,
                        Number(
                            session.dataset.eventPage
                        ) ||
                        1
                    );

                    return;

                }


                const journeyButton =
                    target.closest(
                        "[data-journey-page]"
                    );


                const leadButton =
                    target.closest(
                        "[data-lead-page]"
                    );


                if (
                    journeyButton &&
                    !journeyButton.disabled
                ) {

                    journeyPage =
                        Math.max(
                            1,
                            Number(
                                journeyButton.dataset.journeyPage
                            ) ||
                            1
                        );


                    void journeys()
                        .catch(
                            (error) => {

                                $("analytics-journeys").innerHTML =
                                    errorHTML(
                                        error
                                    );

                            }
                        );

                }


                if (
                    leadButton &&
                    !leadButton.disabled
                ) {

                    leadPage =
                        Math.max(
                            1,
                            Number(
                                leadButton.dataset.leadPage
                            ) ||
                            1
                        );


                    void leads()
                        .catch(
                            (error) => {

                                $("analytics-leads").innerHTML =
                                    errorHTML(
                                        error
                                    );

                            }
                        );

                }

            }
        );


    /* =====================================================
       LEAD STAGE
    ===================================================== */

    $("analytics-leads")
        ?.addEventListener(
            "change",
            async (event) => {

                const target =
                    event.target;


                if (
                    !(target instanceof Element)
                ) {
                    return;
                }


                const select =
                    target.closest(
                        "[data-lead]"
                    );


                if (
                    !select ||
                    !select.dataset.lead
                ) {
                    return;
                }


                const previous =
                    select.dataset.previous;


                select.disabled =
                    true;


                try {

                    await api(
                        `/api/admin/analytics/leads/${encodeURIComponent(
                            select.dataset.lead
                        )}`,
                        {
                            method:
                                "PATCH",

                            body:
                                JSON.stringify({
                                    stage:
                                        select.value
                                })
                        }
                    );


                    await loadAnalytics();

                } catch (error) {

                    select.value =
                        previous;


                    const notice =
                        $("analytics-notice");


                    if (notice) {

                        notice.innerHTML =
                            errorHTML(
                                error
                            );

                    }


                    select.disabled =
                        false;

                }

            }
        );

}