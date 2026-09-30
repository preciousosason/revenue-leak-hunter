import {
    json
} from "../utils/response.js";


/* =========================================================
   CONSTANTS
========================================================= */

export const EVENT_TYPES =
    new Set([
        "page_view",
        "cta_click",
        "form_start",
        "form_field_interaction",
        "form_submit",
        "form_error",
        "article_view",
        "external_link_click",
        "engagement",
        "scroll_depth"
    ]);


/* =========================================================
   TIME
========================================================= */

export const iso = (
    value = Date.now()
) => {

    return new Date(
        value
    ).toISOString();

};


/* =========================================================
   IDENTIFIERS
========================================================= */

export function id(
    value
) {

    if (
        typeof value !==
        "string"
    ) {
        return "";
    }


    return /^[A-Za-z0-9_-]{1,128}$/.test(
        value
    )
        ? value
        : "";

}


/* =========================================================
   SAFE LABELS
========================================================= */

export function label(
    value,
    max = 100
) {

    if (
        typeof value !==
        "string"
    ) {
        return "";
    }


    return value
        .trim()
        .replace(
            /[\u0000-\u001f<>]/g,
            ""
        )
        .slice(
            0,
            max
        );

}


/* =========================================================
   SAFE PATH
========================================================= */

export function path(
    value
) {

    try {

        const url =
            new URL(
                String(
                    value ||
                    "/"
                ),
                "https://local.invalid"
            );


        const pathname =
            url.pathname
                .slice(
                    0,
                    1500
                )
                .replace(
                    /\/{2,}/g,
                    "/"
                );


        if (
            pathname ===
            "/"
        ) {
            return "/";
        }


        return (
            pathname.replace(
                /\/$/,
                ""
            ) ||
            "/"
        );

    } catch {

        return "/";

    }

}


/* =========================================================
   SAFE METADATA
========================================================= */

export function metadata(
    value = {}
) {

    const safe = {};


    if (
        !value ||
        typeof value !==
            "object" ||
        Array.isArray(value)
    ) {

        return safe;

    }


    /*
     * Only controlled identifiers.
     *
     * Never accept arbitrary visitor text,
     * field values, message content, email,
     * phone number, etc.
     */

    for (
        const key
        of [
            "cta_id",
            "form_id",
            "attempt_id",
            "field_id",
            "error_code",
            "article_id"
        ]
    ) {

        const safeValue =
            id(
                value[key]
            );


        if (
            safeValue
        ) {

            safe[key] =
                safeValue;

        }

    }


    /*
     * Numeric measurements.
     */

    for (
        const key
        of [
            "active_ms",
            "depth"
        ]
    ) {

        const number =
            Number(
                value[key]
            );


        if (
            !Number.isFinite(
                number
            ) ||
            number < 0
        ) {
            continue;
        }


        safe[key] =
            Math.min(
                number,
                key ===
                    "depth"
                    ? 100
                    : 60000
            );

    }


    return safe;

}


/* =========================================================
   ATTRIBUTION
========================================================= */

export function attribution(
    body = {}
) {

    let referrer = "";


    try {

        if (
            body.referrer
        ) {

            referrer =
                new URL(
                    body.referrer
                ).hostname;

        }

    } catch {

        referrer = "";

    }


    const device =
        [
            "mobile",
            "desktop",
            "tablet"
        ].includes(
            body.device
        )

            ? body.device

            : "unknown";


    const source =
        label(
            body.source
        ) ||
        referrer ||
        "direct";


    const medium =
        label(
            body.medium
        ) ||
        (
            referrer
                ? "referral"
                : "none"
        );


    return {

        source,

        medium,

        campaign:
            label(
                body.campaign
            ),

        referrer,

        device

    };

}


/* =========================================================
   RESPONSE
========================================================= */

export function reply(
    data,
    status = 200
) {

    const response =
        json(
            data,
            status
        );


    response.headers.set(
        "Cache-Control",
        "no-store"
    );


    return response;

}


/* =========================================================
   REQUEST BODY
========================================================= */

export async function readBody(
    request,
    limit = 16384
) {

    const contentLength =
        Number(
            request.headers.get(
                "content-length"
            )
        );


    if (
        Number.isFinite(
            contentLength
        ) &&
        contentLength >
            limit
    ) {

        throw new Error(
            "Request is too large."
        );

    }


    const reader =
        request.body
            ?.getReader();


    if (
        !reader
    ) {

        throw new Error(
            "A JSON object is required."
        );

    }


    let size =
        0;


    const parts = [];


    while (
        true
    ) {

        const {
            done,
            value
        } =
            await reader.read();


        if (
            done
        ) {
            break;
        }


        if (
            !value
        ) {
            continue;
        }


        size +=
            value.length;


        if (
            size >
            limit
        ) {

            try {

                await reader.cancel();

            } catch {

                /* Ignore stream cancellation failure. */

            }


            throw new Error(
                "Request is too large."
            );

        }


        parts.push(
            value
        );

    }


    if (
        size ===
        0
    ) {

        throw new Error(
            "A JSON object is required."
        );

    }


    const bytes =
        new Uint8Array(
            size
        );


    let offset =
        0;


    for (
        const part
        of parts
    ) {

        bytes.set(
            part,
            offset
        );


        offset +=
            part.length;

    }


    let body;


    try {

        body =
            JSON.parse(
                new TextDecoder()
                    .decode(
                        bytes
                    )
            );

    } catch {

        throw new Error(
            "Invalid JSON."
        );

    }


    if (
        !body ||
        Array.isArray(
            body
        ) ||
        typeof body !==
            "object"
    ) {

        throw new Error(
            "A JSON object is required."
        );

    }


    return body;

}


/* =========================================================
   ORIGIN PROTECTION
========================================================= */

export function originAllowed(
    request,
    env
) {

    const configured =
        String(
            env.ANALYTICS_ALLOWED_ORIGINS ||
            ""
        )
            .split(",")
            .map(
                value =>
                    value.trim()
            )
            .filter(
                Boolean
            );


    /*
     * Preserve the existing fail-open behaviour
     * when no origins are configured.
     *
     * Production should configure the allowlist.
     */

    if (
        !configured.length
    ) {

        return true;

    }


    const requestOrigin =
        request.headers.get(
            "origin"
        );


    if (
        !requestOrigin
    ) {

        return false;

    }


    let normalizedRequestOrigin;


    try {

        normalizedRequestOrigin =
            new URL(
                requestOrigin
            ).origin;

    } catch {

        return false;

    }


    const allowedOrigins =
        configured
            .map(
                value => {

                    try {

                        return new URL(
                            value
                        ).origin;

                    } catch {

                        return "";

                    }

                }
            )
            .filter(
                Boolean
            );


    return allowedOrigins.includes(
        normalizedRequestOrigin
    );

}


/* =========================================================
   RATE LIMIT
========================================================= */

export async function rateLimit(
    request,
    env
) {

    const minute =
        Math.floor(
            Date.now() /
            60000
        );


    const address =
        request.headers.get(
            "CF-Connecting-IP"
        ) ||
        "local";


    /*
     * Hash minute + address so raw visitor IPs
     * are never stored in analytics tables.
     */

    const hash =
        await crypto.subtle.digest(
            "SHA-256",

            new TextEncoder()
                .encode(
                    `${minute}:${address}`
                )
        );


    const bucket =
        Array.from(
            new Uint8Array(
                hash
            ),
            byte =>
                byte
                    .toString(
                        16
                    )
                    .padStart(
                        2,
                        "0"
                    )
        )
            .join("");


    const row =
        await env.DB
            .prepare(
                `
                INSERT INTO analytics_v2_rate_limits (
                    bucket,
                    count,
                    expires_at
                )

                VALUES (
                    ?,
                    1,
                    ?
                )

                ON CONFLICT(bucket)
                DO UPDATE SET
                    count =
                        count + 1

                RETURNING
                    count
                `
            )
            .bind(
                bucket,
                minute * 60 +
                    120
            )
            .first();


    return (
        Number(
            row?.count ||
            0
        ) <=
        240
    );

}


/* =========================================================
   SESSION UPSERT
========================================================= */

export function sessionInsert(
    db,
    ctx,
    now = iso()
) {

    const attributionData =
        attribution(
            ctx
        );


    const currentPage =
        path(
            ctx.page
        );


    return db
        .prepare(
            `
            INSERT INTO analytics_v2_sessions (

                session_id,
                visitor_id,
                started_at,
                last_seen_at,
                landing_page,
                last_page,
                source,
                medium,
                campaign,
                referrer,
                device,
                internal

            )

            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                ?
            )

            ON CONFLICT(session_id)
            DO UPDATE SET

                last_seen_at =
                    CASE

                        WHEN excluded.last_seen_at >
                             analytics_v2_sessions.last_seen_at

                        THEN excluded.last_seen_at

                        ELSE analytics_v2_sessions.last_seen_at

                    END,

                last_page =
                    CASE

                        WHEN excluded.last_seen_at >=
                             analytics_v2_sessions.last_seen_at

                        THEN excluded.last_page

                        ELSE analytics_v2_sessions.last_page

                    END
            `
        )
        .bind(

            ctx.sessionId,

            ctx.visitorId,

            now,

            now,

            currentPage,

            currentPage,

            attributionData.source,

            attributionData.medium,

            attributionData.campaign,

            attributionData.referrer,

            attributionData.device,

            ctx.internal ===
                true
                ? 1
                : 0

        );

}


/* =========================================================
   LEAD ATTRIBUTION
========================================================= */

export function leadStatements(
    db,
    leadId,
    context
) {

    const now =
        iso();


    const ctx =
        context &&
        typeof context ===
            "object" &&
        !Array.isArray(
            context
        )

            ? context

            : {};


    const valid =
        Boolean(
            id(
                ctx.sessionId
            ) &&
            id(
                ctx.visitorId
            )
        );


    const statements =
        valid

            ? [
                  sessionInsert(
                      db,
                      ctx,
                      now
                  )
              ]

            : [];


    /*
     * Invalid or mismatched attribution must
     * never stop a legitimate enquiry from
     * being recorded.
     *
     * Session/visitor IDs are attached only
     * when the pair actually exists together.
     */

    statements.push(

        db
            .prepare(
                `
                INSERT INTO analytics_v2_leads (

                    lead_id,
                    session_id,
                    visitor_id,
                    form_id,
                    attempt_id,
                    created_at,
                    updated_at

                )

                VALUES (

                    ?,

                    (
                        SELECT
                            session_id

                        FROM analytics_v2_sessions

                        WHERE
                            session_id=?
                            AND visitor_id=?
                    ),

                    (
                        SELECT
                            visitor_id

                        FROM analytics_v2_sessions

                        WHERE
                            session_id=?
                            AND visitor_id=?
                    ),

                    ?,
                    ?,
                    ?,
                    ?
                )
                `
            )
            .bind(

                leadId,

                valid
                    ? ctx.sessionId
                    : "",

                valid
                    ? ctx.visitorId
                    : "",

                valid
                    ? ctx.sessionId
                    : "",

                valid
                    ? ctx.visitorId
                    : "",

                id(
                    ctx.form_id
                ),

                id(
                    ctx.attempt_id
                ),

                now,

                now

            )

    );


    return statements;

}