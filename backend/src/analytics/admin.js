import {
    authenticateAdmin
} from "../utils/auth.js";

import {
    reply,
    iso,
    id,
    readBody,
    label
} from "./common.js";


const DAY = 86400000;


/* =========================================================
   RANGE
========================================================= */

export function parseRange(
    url,
    now = Date.now()
) {

    const offset =
        url.searchParams.get("timezone") === "UTC"
            ? 0
            : 60;


    const day =
        new Date(
            now +
            offset * 60000
        )
            .toISOString()
            .slice(
                0,
                10
            );


    const days =
        Number(
            url.searchParams.get("days") ||
            30
        );


    const parse = (
        value
    ) => {

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                value ||
                ""
            )
        ) {

            throw new Error(
                "Dates must use YYYY-MM-DD."
            );

        }


        const time =
            Date.parse(
                value +
                "T00:00:00Z"
            );


        if (
            !Number.isFinite(time) ||
            new Date(time)
                .toISOString()
                .slice(
                    0,
                    10
                ) !==
                value
        ) {

            throw new Error(
                "Invalid date."
            );

        }


        return (
            time -
            offset * 60000
        );

    };


    const endDate =
        url.searchParams.get("end") ||
        day;


    const end =
        Math.min(
            parse(endDate) +
            DAY,
            now
        );


    const start =
        url.searchParams.has(
            "start"
        )

            ? parse(
                  url.searchParams.get(
                      "start"
                  )
              )

            : parse(day) -
              (
                  Math.max(
                      1,
                      Math.min(
                          365,
                          Number.isInteger(
                              days
                          )
                              ? days
                              : 30
                      )
                  ) -
                  1
              ) *
                  DAY;


    if (
        start >= end ||
        end - start >
            366 * DAY
    ) {

        throw new Error(
            "Choose a past or current range of up to 366 days."
        );

    }


    return {

        start:
            iso(start),

        end:
            iso(end),

        previousStart:
            iso(
                start -
                (
                    end -
                    start
                )
            ),

        previousEnd:
            iso(start),

        timezone:
            offset
                ? "Africa/Lagos"
                : "UTC",

        offset,

        startDate:
            new Date(
                start +
                offset * 60000
            )
                .toISOString()
                .slice(
                    0,
                    10
                ),

        endDate:
            new Date(
                (
                    end === now
                        ? end
                        : end - 1
                ) +
                offset * 60000
            )
                .toISOString()
                .slice(
                    0,
                    10
                ),

        now:
            iso(now)

    };

}


/* =========================================================
   FILTERS
========================================================= */

function filters(
    url
) {

    return {

        source:
            label(
                url.searchParams.get(
                    "source"
                )
            ),

        device:
            label(
                url.searchParams.get(
                    "device"
                )
            ),

        landing:
            label(
                url.searchParams.get(
                    "landing"
                ),
                1500
            ),

        internal:
            url.searchParams.get(
                "internal"
            ) ===
            "1"

    };

}


/* =========================================================
   COHORT
========================================================= */

function cohort(
    range,
    filters
) {

    const args = [
        range.start,
        range.end
    ];


    let where =
        "s.started_at >= ? AND s.started_at < ?";


    if (
        !filters.internal
    ) {

        where +=
            " AND s.internal=0";

    }


    for (
        const [
            key,
            column
        ] of [
            [
                "source",
                "source"
            ],
            [
                "device",
                "device"
            ],
            [
                "landing",
                "landing_page"
            ]
        ]
    ) {

        if (
            filters[key]
        ) {

            where +=
                ` AND s.${column}=?`;


            args.push(
                filters[key]
            );

        }

    }


    /*
     * These are used by:
     *
     * event cutoff
     * lead cutoff
     */

    args.push(
        range.end,
        range.end
    );


    return {

        args,

        sql: `
WITH cohort AS (

    SELECT
        s.*

    FROM analytics_v2_sessions s

    WHERE ${where}
),

ev AS (

    SELECT
        e.session_id,

        COUNT(*) event_count,

        SUM(
            e.event_type='page_view'
        ) page_views,

        SUM(
            e.event_type='cta_click'
        ) cta_clicks,

        SUM(
            e.event_type='form_error'
        ) errors,

        SUM(
            CASE
                WHEN e.event_type='engagement'
                THEN COALESCE(
                    json_extract(
                        e.metadata,
                        '$.active_ms'
                    ),
                    0
                )
                ELSE 0
            END
        ) active_ms,

        MIN(
            CASE
                WHEN e.event_type='form_start'
                THEN e.occurred_at
            END
        ) form_started_at,

        MAX(
            e.occurred_at
        ) last_event_at

    FROM analytics_v2_events e

    JOIN cohort c
        ON c.session_id =
           e.session_id

    WHERE
        e.occurred_at < ?

    GROUP BY
        e.session_id
),

leads AS (

    SELECT
        l.session_id,

        COUNT(*) lead_count,

        MIN(
            l.created_at
        ) converted_at,

        SUM(
            l.stage IN (
                'qualified',
                'proposal',
                'won'
            )
        ) qualified_count,

        SUM(
            l.stage='won'
        ) won_count

    FROM analytics_v2_leads l

    JOIN cohort c
        ON c.session_id =
           l.session_id

    WHERE
        l.created_at < ?

    GROUP BY
        l.session_id
),

rollup AS (

    SELECT
        c.*,

        COALESCE(
            ev.event_count,
            0
        ) event_count,

        COALESCE(
            ev.page_views,
            0
        ) page_views,

        COALESCE(
            ev.cta_clicks,
            0
        ) cta_clicks,

        COALESCE(
            ev.errors,
            0
        ) errors,

        COALESCE(
            ev.active_ms,
            0
        ) active_ms,

        ev.form_started_at,

        COALESCE(
            leads.lead_count,
            0
        ) lead_count,

        leads.converted_at,

        COALESCE(
            leads.qualified_count,
            0
        ) qualified_count,

        COALESCE(
            leads.won_count,
            0
        ) won_count,

        CASE
            WHEN
                COALESCE(
                    ev.active_ms,
                    0
                ) >= 10000

                OR

                COALESCE(
                    ev.page_views,
                    0
                ) >= 2

                OR

                COALESCE(
                    leads.lead_count,
                    0
                ) > 0

            THEN 1

            ELSE 0
        END engaged

    FROM cohort c

    LEFT JOIN ev
        ON ev.session_id =
           c.session_id

    LEFT JOIN leads
        ON leads.session_id =
           c.session_id
)
`

    };

}


/* =========================================================
   METRICS
========================================================= */

function metrics(
    row = {}
) {

    const result =
        Object.fromEntries(

            Object
                .entries(
                    row ||
                    {}
                )
                .map(
                    (
                        [
                            key,
                            value
                        ]
                    ) => [

                        key,

                        Number(
                            value ||
                            0
                        )

                    ]
                )

        );


    result.conversion_rate =
        result.sessions

            ? (
                result.converted_sessions /
                result.sessions
              ) *
              100

            : 0;


    result.engagement_rate =
        result.sessions

            ? (
                result.engaged_sessions /
                result.sessions
              ) *
              100

            : 0;


    return result;

}


/* =========================================================
   SUMMARY QUERY
========================================================= */

const summarySQL = `
SELECT

    COUNT(*) sessions,

    COUNT(
        DISTINCT visitor_id
    ) visitors,

    SUM(
        page_views
    ) page_views,

    SUM(
        event_count
    ) events,

    SUM(
        cta_clicks
    ) cta_clicks,

    SUM(
        errors
    ) errors,

    SUM(
        engaged
    ) engaged_sessions,

    SUM(
        lead_count > 0
    ) converted_sessions,

    SUM(
        lead_count
    ) enquiries,

    SUM(
        qualified_count
    ) qualified_leads,

    SUM(
        won_count
    ) won_leads,

    SUM(
        form_started_at IS NOT NULL
    ) form_starts,

    SUM(

        form_started_at IS NOT NULL

        AND

        EXISTS(

            SELECT 1

            FROM analytics_v2_leads l

            WHERE
                l.session_id =
                    rollup.session_id

                AND
                l.created_at >=
                    rollup.form_started_at

                AND
                l.created_at < ?
        )

    ) funnel_completions

FROM rollup
`;


/* =========================================================
   DATABASE HELPERS
========================================================= */

async function all(
    db,
    sql,
    args = []
) {

    const result =
        await db
            .prepare(
                sql
            )
            .bind(
                ...args
            )
            .all();


    return (
        result.results ||
        []
    );

}


/* =========================================================
   SAFE EVENT METADATA
========================================================= */

function parseMetadata(
    value
) {

    if (!value) {
        return {};
    }


    if (
        typeof value ===
            "object" &&
        !Array.isArray(value)
    ) {

        return value;

    }


    try {

        const parsed =
            JSON.parse(
                value
            );


        if (
            parsed &&
            typeof parsed ===
                "object" &&
            !Array.isArray(parsed)
        ) {

            return parsed;

        }

    } catch {

        /*
         * Broken historical metadata
         * must never break the entire
         * session journey.
         */

    }


    return {};

}


/* =========================================================
   OVERVIEW
========================================================= */

export async function handleAdminAnalyticsOverview(
    request,
    env
) {

    if (
        !(
            await authenticateAdmin(
                request,
                env
            )
        )
    ) {

        return reply(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );

    }


    const url =
        new URL(
            request.url
        );


    const filtersUsed =
        filters(
            url
        );


    let range;


    try {

        range =
            parseRange(
                url
            );

    } catch (error) {

        return reply(
            {
                success: false,
                error:
                    error.message
            },
            400
        );

    }


    try {

        const currentCohort =
            cohort(
                range,
                filtersUsed
            );


        const previousCohort =
            cohort(
                {
                    ...range,

                    start:
                        range.previousStart,

                    end:
                        range.previousEnd
                },
                filtersUsed
            );


        const rows = (
            suffix,
            extra = []
        ) => {

            return all(
                env.DB,

                `${currentCohort.sql} ${suffix}`,

                [
                    ...currentCohort.args,
                    ...extra
                ]
            );

        };


        /*
         * A session must be inactive
         * for at least 30 minutes before
         * we treat its last page as an
         * observed exit.
         */

        const closedBefore =
            iso(
                Math.min(
                    Date.parse(
                        range.end
                    ),
                    Date.now()
                ) -
                1800000
            );


        const [

            current,
            previous,
            daily,
            sources,
            landings,
            devices,
            forms,
            errors,
            exits,
            health,
            options

        ] =
            await Promise.all([


                /* CURRENT SUMMARY */

                env.DB
                    .prepare(
                        `${currentCohort.sql} ${summarySQL}`
                    )
                    .bind(
                        ...currentCohort.args,
                        range.end
                    )
                    .first(),


                /* PREVIOUS SUMMARY */

                env.DB
                    .prepare(
                        `${previousCohort.sql} ${summarySQL}`
                    )
                    .bind(
                        ...previousCohort.args,
                        range.previousEnd
                    )
                    .first(),


                /* DAILY PERFORMANCE */

                rows(
                    `
                    SELECT

                        date(
                            started_at,
                            '+${range.offset} minutes'
                        ) date,

                        COUNT(*) sessions,

                        SUM(
                            lead_count > 0
                        ) conversions,

                        SUM(
                            lead_count
                        ) enquiries

                    FROM rollup

                    GROUP BY
                        date

                    ORDER BY
                        date
                    `
                ),


                /* SOURCES */

                rows(
                    `
                    SELECT

                        source,
                        medium,
                        campaign,

                        COUNT(*) sessions,

                        SUM(
                            lead_count > 0
                        ) conversions,

                        SUM(
                            lead_count
                        ) enquiries

                    FROM rollup

                    GROUP BY
                        source,
                        medium,
                        campaign

                    ORDER BY
                        enquiries DESC,
                        sessions DESC

                    LIMIT 20
                    `
                ),


                /* LANDING PAGES */

                rows(
                    `
                    SELECT

                        landing_page page,

                        COUNT(*) sessions,

                        SUM(
                            engaged
                        ) engaged,

                        SUM(
                            lead_count > 0
                        ) conversions,

                        SUM(
                            lead_count
                        ) enquiries

                    FROM rollup

                    GROUP BY
                        landing_page

                    ORDER BY
                        sessions DESC

                    LIMIT 20
                    `
                ),


                /* DEVICES */

                rows(
                    `
                    SELECT

                        device,

                        COUNT(*) sessions,

                        SUM(
                            lead_count > 0
                        ) conversions

                    FROM rollup

                    GROUP BY
                        device

                    ORDER BY
                        sessions DESC
                    `
                ),


                /* FORM HEALTH */

                rows(
                    `
                    ,
                    attempts AS (

                        SELECT

                            e.session_id,

                            json_extract(
                                e.metadata,
                                '$.form_id'
                            ) form_id,

                            json_extract(
                                e.metadata,
                                '$.attempt_id'
                            ) attempt_id,

                            MIN(
                                CASE
                                    WHEN e.event_type='form_start'
                                    THEN e.occurred_at
                                END
                            ) started_at,

                            SUM(
                                e.event_type='form_error'
                            ) errors

                        FROM analytics_v2_events e

                        JOIN cohort c
                            ON c.session_id =
                               e.session_id

                        WHERE

                            e.occurred_at < ?

                            AND

                            json_extract(
                                e.metadata,
                                '$.attempt_id'
                            ) IS NOT NULL

                        GROUP BY
                            e.session_id,
                            form_id,
                            attempt_id
                    ),

                    completed AS (

                        SELECT

                            a.*,

                            (
                                SELECT
                                    MIN(
                                        l.created_at
                                    )

                                FROM analytics_v2_leads l

                                WHERE

                                    l.session_id =
                                        a.session_id

                                    AND

                                    l.form_id =
                                        a.form_id

                                    AND

                                    l.attempt_id =
                                        a.attempt_id

                                    AND

                                    l.created_at >=
                                        a.started_at

                                    AND

                                    l.created_at < ?

                            ) completed_at

                        FROM attempts a

                        WHERE
                            a.started_at IS NOT NULL
                    )

                    SELECT

                        COALESCE(
                            form_id,
                            'unknown'
                        ) form_id,

                        COUNT(*) starts,

                        SUM(
                            completed_at IS NOT NULL
                        ) successes,

                        SUM(
                            errors
                        ) errors,

                        AVG(
                            CASE
                                WHEN completed_at IS NOT NULL
                                THEN
                                    (
                                        julianday(
                                            completed_at
                                        ) -
                                        julianday(
                                            started_at
                                        )
                                    ) *
                                    86400
                            END
                        ) completion_seconds

                    FROM completed

                    GROUP BY
                        form_id

                    ORDER BY
                        starts DESC

                    LIMIT 20
                    `,
                    [
                        range.end,
                        range.end
                    ]
                ),


                /* FORM ERRORS */

                rows(
                    `
                    SELECT

                        COALESCE(
                            json_extract(
                                e.metadata,
                                '$.form_id'
                            ),
                            'unknown'
                        ) form_id,

                        COALESCE(
                            json_extract(
                                e.metadata,
                                '$.field_id'
                            ),
                            'form'
                        ) field_id,

                        COALESCE(
                            json_extract(
                                e.metadata,
                                '$.error_code'
                            ),
                            'unknown'
                        ) error_code,

                        COUNT(*) count,

                        COUNT(
                            DISTINCT e.session_id
                        ) sessions

                    FROM analytics_v2_events e

                    JOIN cohort c
                        ON c.session_id =
                           e.session_id

                    WHERE

                        e.event_type =
                            'form_error'

                        AND

                        e.occurred_at < ?

                    GROUP BY

                        form_id,
                        field_id,
                        error_code

                    ORDER BY
                        count DESC

                    LIMIT 15
                    `,
                    [
                        range.end
                    ]
                ),


                /* OBSERVED EXITS */

                rows(
                    `
                    SELECT

                        COALESCE(

                            (
                                SELECT
                                    e.page

                                FROM analytics_v2_events e

                                WHERE

                                    e.session_id =
                                        r.session_id

                                    AND

                                    e.occurred_at < ?

                                ORDER BY

                                    e.occurred_at DESC,
                                    e.event_id DESC

                                LIMIT 1
                            ),

                            landing_page

                        ) page,

                        COUNT(*) sessions

                    FROM rollup r

                    WHERE

                        last_seen_at < ?

                        AND

                        lead_count = 0

                    GROUP BY
                        page

                    ORDER BY
                        sessions DESC

                    LIMIT 10
                    `,
                    [
                        range.end,
                        closedBefore
                    ]
                ),


                /* TRACKING HEALTH */

                env.DB
                    .prepare(
                        `
                        SELECT

                            (
                                SELECT
                                    MAX(
                                        received_at
                                    )

                                FROM analytics_v2_events

                            ) last_received_at,

                            (
                                SELECT
                                    COUNT(*)

                                FROM analytics_v2_leads

                                WHERE

                                    created_at >= ?

                                    AND

                                    created_at < ?

                                    AND

                                    session_id IS NULL

                            ) unattributed_enquiries,

                            (
                                SELECT
                                    MIN(
                                        started_at
                                    )

                                FROM analytics_v2_sessions

                            ) tracking_since
                        `
                    )
                    .bind(
                        range.start,
                        range.end
                    )
                    .first(),


                /* FILTER OPTIONS */

                all(
                    env.DB,
                    `
                    SELECT DISTINCT

                        source,
                        device

                    FROM analytics_v2_sessions

                    WHERE

                        started_at >= ?

                        AND

                        started_at < ?

                        ${
                            filtersUsed.internal
                                ? ""
                                : "AND internal = 0"
                        }

                    ORDER BY
                        source

                    LIMIT 300
                    `,
                    [
                        range.previousStart,
                        range.end
                    ]
                )

            ]);


        /* =================================================
           FILL EMPTY CALENDAR DAYS
        ================================================= */

        const byDay =
            new Map(
                daily.map(
                    item => [
                        item.date,
                        item
                    ]
                )
            );


        const filled = [];


        for (

            let time =
                Date.parse(
                    range.start
                );

            time <
                Date.parse(
                    range.end
                );

            time += DAY

        ) {

            const date =
                new Date(
                    time +
                    range.offset *
                        60000
                )
                    .toISOString()
                    .slice(
                        0,
                        10
                    );


            filled.push(

                byDay.get(
                    date
                ) || {

                    date,

                    sessions:
                        0,

                    conversions:
                        0,

                    enquiries:
                        0

                }

            );

        }


        const summary =
            metrics(
                current
            );


        const comparison =
            metrics(
                previous
            );


        /* =================================================
           RULE-BASED INSIGHTS
        ================================================= */

        const insights = [];


        if (
            health?.tracking_since &&
            range.previousStart <
                health.tracking_since
        ) {

            insights.push({

                level:
                    "info",

                title:
                    "Comparison coverage is incomplete",

                detail:
                    "The previous period starts before the oldest retained v2 session. A change may reflect missing history rather than a change in performance."

            });

        }


        if (
            !summary.sessions
        ) {

            insights.push({

                level:
                    "info",

                title:
                    "No tracked sessions in this range",

                detail:
                    "Install the v2 tracker, check consent and origin settings, or expand the dates."

            });

        }


        if (
            summary.sessions &&
            summary.sessions <
                30
        ) {

            insights.push({

                level:
                    "info",

                title:
                    "Small sample",

                detail:
                    `Only ${summary.sessions} sessions. Treat conversion differences as directional, not proof.`

            });

        }


        if (
            summary.errors
        ) {

            insights.push({

                level:
                    "warning",

                title:
                    "Form errors recorded",

                detail:
                    `${summary.errors} errors across the selected session cohort. Inspect the field breakdown before changing the form.`

            });

        }


        if (
            summary.form_starts >
            summary.funnel_completions
        ) {

            insights.push({

                level:
                    "info",

                title:
                    "Form starts without a later enquiry",

                detail:
                    `${summary.form_starts - summary.funnel_completions} sessions started a form without a later verified enquiry inside the reporting window. Some may still be active.`

            });

        }


        if (
            health?.unattributed_enquiries
        ) {

            insights.push({

                level:
                    "warning",

                title:
                    "Enquiries missing attribution",

                detail:
                    `${health.unattributed_enquiries} verified enquiries could not be linked to tracking. Check contact integration; visitors may also decline tracking.`

            });

        }


        return reply({

            success:
                true,

            range,

            filters:
                filtersUsed,

            summary,

            comparison,

            daily:
                filled,

            sources,

            landings,

            devices,

            forms,

            errors,

            exits,

            health:
                health ||
                {},

            options,

            insights,

            generatedAt:
                iso()

        });

    } catch (error) {

        console.error(
            "Analytics overview",
            error
        );


        return reply(
            {
                success:
                    false,

                error:
                    "Analytics unavailable. Confirm analytics-v2.sql has been applied."
            },
            500
        );

    }

}


/* =========================================================
   JOURNEYS
========================================================= */

export async function handleAdminAnalyticsJourneys(
    request,
    env
) {

    if (
        !(
            await authenticateAdmin(
                request,
                env
            )
        )
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Admin authentication required."
            },
            401
        );

    }


    const url =
        new URL(
            request.url
        );


    let range;


    try {

        range =
            parseRange(
                url
            );

    } catch (error) {

        return reply(
            {
                success:
                    false,

                error:
                    error.message
            },
            400
        );

    }


    try {

        const currentCohort =
            cohort(
                range,
                filters(
                    url
                )
            );


        const limit =
            20;


        const page =
            Math.max(
                1,
                Math.min(
                    10000,

                    parseInt(
                        url.searchParams.get(
                            "page"
                        ) ||
                        "1",
                        10
                    ) ||
                    1
                )
            );


        const search =
            label(
                url.searchParams.get(
                    "q"
                ),
                128
            );


        const outcome =
            url.searchParams.get(
                "outcome"
            );


        let where =
            "WHERE 1=1";


        const extra = [];


        if (
            search
        ) {

            where +=
                " AND (session_id LIKE ? ESCAPE '\\' OR landing_page LIKE ? ESCAPE '\\')";


            const term =
                "%" +
                search.replace(
                    /[\\%_]/g,
                    "\\$&"
                ) +
                "%";


            extra.push(
                term,
                term
            );

        }


        if (
            outcome ===
            "converted"
        ) {

            where +=
                " AND lead_count>0";

        }


        if (
            outcome ===
            "unconverted"
        ) {

            where +=
                " AND lead_count=0";

        }


        const [
            journeys,
            total
        ] =
            await Promise.all([

                all(
                    env.DB,

                    `
                    ${currentCohort.sql}

                    SELECT
                        *

                    FROM rollup

                    ${where}

                    ORDER BY
                        started_at DESC,
                        session_id DESC

                    LIMIT ?
                    OFFSET ?
                    `,

                    [
                        ...currentCohort.args,
                        ...extra,
                        limit,
                        (
                            page -
                            1
                        ) *
                            limit
                    ]
                ),


                env.DB
                    .prepare(
                        `
                        ${currentCohort.sql}

                        SELECT
                            COUNT(*) total

                        FROM rollup

                        ${where}
                        `
                    )
                    .bind(
                        ...currentCohort.args,
                        ...extra
                    )
                    .first()

            ]);


        return reply({

            success:
                true,

            journeys,

            page,

            limit,

            total:
                Number(
                    total?.total ||
                    0
                ),

            range

        });

    } catch (error) {

        console.error(
            "Analytics journeys",
            error
        );


        return reply(
            {
                success:
                    false,

                error:
                    "Analytics journeys are temporarily unavailable."
            },
            500
        );

    }

}


/* =========================================================
   SESSION JOURNEY
========================================================= */

export async function handleAdminAnalyticsSession(
    request,
    env,
    sessionId
) {

    if (
        !(
            await authenticateAdmin(
                request,
                env
            )
        )
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Admin authentication required."
            },
            401
        );

    }


    if (
        !id(
            sessionId
        )
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Invalid session."
            },
            400
        );

    }


    try {

        const session =
            await env.DB
                .prepare(
                    `
                    SELECT
                        *

                    FROM analytics_v2_sessions

                    WHERE
                        session_id=?
                    `
                )
                .bind(
                    sessionId
                )
                .first();


        if (
            !session
        ) {

            return reply(
                {
                    success:
                        false,

                    error:
                        "Session not found."
                },
                404
            );

        }


        const url =
            new URL(
                request.url
            );


        const page =
            Math.max(
                1,
                Math.min(
                    10000,

                    parseInt(
                        url.searchParams.get(
                            "page"
                        ) ||
                        "1",
                        10
                    ) ||
                    1
                )
            );


        const [
            events,
            total,
            leads
        ] =
            await Promise.all([

                all(
                    env.DB,

                    `
                    SELECT
                        *

                    FROM analytics_v2_events

                    WHERE
                        session_id=?

                    ORDER BY
                        occurred_at,
                        event_id

                    LIMIT 100
                    OFFSET ?
                    `,

                    [
                        sessionId,

                        (
                            page -
                            1
                        ) *
                            100
                    ]
                ),


                env.DB
                    .prepare(
                        `
                        SELECT
                            COUNT(*) total

                        FROM analytics_v2_events

                        WHERE
                            session_id=?
                        `
                    )
                    .bind(
                        sessionId
                    )
                    .first(),


                all(
                    env.DB,

                    `
                    SELECT

                        lead_id,
                        stage,
                        form_id,
                        created_at

                    FROM analytics_v2_leads

                    WHERE
                        session_id=?

                    ORDER BY
                        created_at
                    `,

                    [
                        sessionId
                    ]
                )

            ]);


        return reply({

            success:
                true,

            session,

            events:
                events.map(
                    event => ({
                        ...event,

                        metadata:
                            parseMetadata(
                                event.metadata
                            )
                    })
                ),

            leads,

            total:
                Number(
                    total?.total ||
                    0
                ),

            page,

            limit:
                100

        });

    } catch (error) {

        console.error(
            "Analytics session",
            error
        );


        return reply(
            {
                success:
                    false,

                error:
                    "Session analytics are temporarily unavailable."
            },
            500
        );

    }

}


/* =========================================================
   LEADS
========================================================= */

export async function handleAdminAnalyticsLeads(
    request,
    env,
    leadId
) {

    if (
        !(
            await authenticateAdmin(
                request,
                env
            )
        )
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Admin authentication required."
            },
            401
        );

    }


    /* =====================================================
       UPDATE LEAD STAGE
    ===================================================== */

    if (
        request.method ===
        "PATCH"
    ) {

        let body;


        try {

            body =
                await readBody(
                    request,
                    2048
                );

        } catch {

            return reply(
                {
                    success:
                        false,

                    error:
                        "Invalid request."
                },
                400
            );

        }


        const allowedStages = [
            "enquiry",
            "qualified",
            "proposal",
            "won",
            "lost"
        ];


        if (
            !id(
                leadId
            ) ||
            !allowedStages.includes(
                body.stage
            )
        ) {

            return reply(
                {
                    success:
                        false,

                    error:
                        "Invalid stage."
                },
                400
            );

        }


        try {

            const result =
                await env.DB
                    .prepare(
                        `
                        UPDATE
                            analytics_v2_leads

                        SET
                            stage=?,
                            updated_at=?

                        WHERE
                            lead_id=?
                        `
                    )
                    .bind(
                        body.stage,
                        iso(),
                        leadId
                    )
                    .run();


            return result.meta.changes

                ? reply({
                      success:
                          true
                  })

                : reply(
                      {
                          success:
                              false,

                          error:
                              "Lead not found."
                      },
                      404
                  );

        } catch (error) {

            console.error(
                "Analytics lead update",
                error
            );


            return reply(
                {
                    success:
                        false,

                    error:
                        "Unable to update the lead stage."
                },
                500
            );

        }

    }


    /* =====================================================
       LIST LEADS
    ===================================================== */

    const url =
        new URL(
            request.url
        );


    let range;


    try {

        range =
            parseRange(
                url
            );

    } catch (error) {

        return reply(
            {
                success:
                    false,

                error:
                    error.message
            },
            400
        );

    }


    try {

        const filtersUsed =
            filters(
                url
            );


        const page =
            Math.max(
                1,
                Math.min(
                    10000,

                    parseInt(
                        url.searchParams.get(
                            "page"
                        ) ||
                        "1",
                        10
                    ) ||
                    1
                )
            );


        let where =
            "l.created_at>=? AND l.created_at<?";


        const args = [
            range.start,
            range.end
        ];


        if (
            !filtersUsed.internal
        ) {

            where +=
                " AND (s.internal=0 OR s.internal IS NULL)";

        }


        for (
            const [
                key,
                column
            ] of [
                [
                    "source",
                    "source"
                ],
                [
                    "device",
                    "device"
                ],
                [
                    "landing",
                    "landing_page"
                ]
            ]
        ) {

            if (
                filtersUsed[key]
            ) {

                where +=
                    ` AND s.${column}=?`;


                args.push(
                    filtersUsed[key]
                );

            }

        }


        const from = `
            FROM analytics_v2_leads l

            JOIN clients c
                ON c.id =
                   l.lead_id

            LEFT JOIN analytics_v2_sessions s
                ON s.session_id =
                   l.session_id

            WHERE
                ${where}
        `;


        const [
            leads,
            total
        ] =
            await Promise.all([

                all(
                    env.DB,

                    `
                    SELECT

                        l.*,
                        c.name,
                        c.business,
                        s.source

                    ${from}

                    ORDER BY

                        l.created_at DESC,
                        l.lead_id

                    LIMIT 20
                    OFFSET ?
                    `,

                    [
                        ...args,

                        (
                            page -
                            1
                        ) *
                            20
                    ]
                ),


                env.DB
                    .prepare(
                        `
                        SELECT
                            COUNT(*) total

                        ${from}
                        `
                    )
                    .bind(
                        ...args
                    )
                    .first()

            ]);


        return reply({

            success:
                true,

            leads,

            total:
                Number(
                    total?.total ||
                    0
                ),

            page,

            limit:
                20

        });

    } catch (error) {

        console.error(
            "Analytics leads",
            error
        );


        return reply(
            {
                success:
                    false,

                error:
                    "Analytics leads are temporarily unavailable."
            },
            500
        );

    }

}