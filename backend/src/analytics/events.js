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
    sessionInsert
} from "./common.js";


const DAY =
    86400000;


/* =========================================================
   BOT DETECTION
========================================================= */

function isBot(
    request
) {

    const userAgent =
        request.headers.get(
            "user-agent"
        ) || "";


    return /bot|crawler|spider|headless/i.test(
        userAgent
    );

}


/* =========================================================
   EVENT INGESTION
========================================================= */

export async function handleAnalyticsEvent(
    request,
    env
) {

    /* =====================================================
       ORIGIN PROTECTION
    ===================================================== */

    if (
        !originAllowed(
            request,
            env
        )
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Origin is not allowed."
            },
            403
        );

    }


    /* =====================================================
       IGNORE BASIC BOT TRAFFIC
    ===================================================== */

    if (
        isBot(
            request
        )
    ) {

        return reply({
            success:
                true,

            ignored:
                true
        });

    }


    /* =====================================================
       REQUEST BODY
    ===================================================== */

    let body;


    try {

        body =
            await readBody(
                request
            );

    } catch (error) {

        return reply(
            {
                success:
                    false,

                error:
                    error?.message ||
                    "Invalid request body."
            },
            400
        );

    }


    if (
        !body ||
        typeof body !==
            "object" ||
        Array.isArray(body)
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Invalid analytics payload."
            },
            400
        );

    }


    /* =====================================================
       NORMALIZE IDENTIFIERS
    ===================================================== */

    const eventId =
        id(
            body.eventId ||
            body.event_id
        );


    const visitorId =
        id(
            body.visitorId ||
            body.visitor_id
        );


    const sessionId =
        id(
            body.sessionId ||
            body.session_id
        );


    const eventType =
        String(
            body.eventType ||
            body.event_type ||
            ""
        ).trim();


    /* =====================================================
       VALIDATE EVENT
    ===================================================== */

    if (
        !eventId ||
        !visitorId ||
        !sessionId ||
        !EVENT_TYPES.has(
            eventType
        )
    ) {

        return reply(
            {
                success:
                    false,

                error:
                    "Invalid event. Outcomes are recorded by the server."
            },
            400
        );

    }


    try {

        /* =================================================
           IDEMPOTENCY CHECK
        ================================================= */

        /*
         * Check for an already-recorded event before applying
         * the rate limit.
         *
         * Browser retries should remain idempotent instead of
         * consuming additional event allowance.
         */

        const existing =
            await env.DB
                .prepare(
                    `
                    SELECT
                        visitor_id,
                        session_id

                    FROM analytics_v2_events

                    WHERE
                        event_id=?
                    `
                )
                .bind(
                    eventId
                )
                .first();


        if (
            existing
        ) {

            if (
                existing.visitor_id ===
                    visitorId &&
                existing.session_id ===
                    sessionId
            ) {

                return reply({
                    success:
                        true,

                    duplicate:
                        true
                });

            }


            return reply(
                {
                    success:
                        false,

                    error:
                        "Event ID conflict."
                },
                409
            );

        }


        /* =================================================
           RATE LIMIT
        ================================================= */

        if (
            !(
                await rateLimit(
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
                        "Event rate limit exceeded."
                },
                429
            );

        }


        /* =================================================
           SESSION OWNERSHIP
        ================================================= */

        const owner =
            await env.DB
                .prepare(
                    `
                    SELECT
                        visitor_id

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
            owner &&
            owner.visitor_id !==
                visitorId
        ) {

            return reply(
                {
                    success:
                        false,

                    error:
                        "Session ownership mismatch."
                },
                409
            );

        }


        /* =================================================
           EVENT TIME
        ================================================= */

        const received =
            Date.now();


        const submittedValue =
            body.occurredAt ||
            body.occurred_at ||
            null;


        const submitted =
            submittedValue
                ? Date.parse(
                      submittedValue
                  )
                : NaN;


        /*
         * Accept client event timestamps only when they are:
         *
         * - not more than 24 hours old
         * - not more than 5 minutes into the future
         *
         * Otherwise the server receipt time becomes canonical.
         */

        const occurred =
            Number.isFinite(
                submitted
            ) &&
            submitted >=
                received -
                    DAY &&
            submitted <=
                received +
                    300000

                ? submitted

                : received;


        /* =================================================
           NORMALIZE VALUES
        ================================================= */

        const eventPage =
            path(
                body.page
            );


        const eventMetadata =
            metadata(
                body.metadata
            );


        const occurredAt =
            iso(
                occurred
            );


        const receivedAt =
            iso(
                received
            );


        /* =================================================
           WRITE SESSION + EVENT
        ================================================= */

        const results =
            await env.DB.batch([

                sessionInsert(
                    env.DB,

                    {
                        ...body,

                        visitorId,

                        sessionId
                    },

                    occurredAt
                ),


                env.DB
                    .prepare(
                        `
                        INSERT INTO analytics_v2_events (

                            event_id,
                            session_id,
                            visitor_id,
                            event_type,
                            page,
                            occurred_at,
                            received_at,
                            metadata

                        )

                        VALUES (
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?
                        )

                        ON CONFLICT(event_id)
                        DO NOTHING
                        `
                    )
                    .bind(
                        eventId,
                        sessionId,
                        visitorId,
                        eventType,
                        eventPage,
                        occurredAt,
                        receivedAt,
                        JSON.stringify(
                            eventMetadata
                        )
                    )

            ]);


        const inserted =
            Number(
                results?.[1]?.meta
                    ?.changes ||
                0
            ) >
            0;


        /*
         * A concurrent retry may have inserted the event
         * after our first duplicate lookup.
         */

        return reply(
            {
                success:
                    true,

                duplicate:
                    !inserted
            },

            inserted
                ? 201
                : 200
        );

    } catch (error) {

        /* =================================================
           CONSTRAINT CONFLICT
        ================================================= */

        if (
            /FOREIGN KEY|constraint/i.test(
                error?.message ||
                ""
            )
        ) {

            return reply(
                {
                    success:
                        false,

                    error:
                        "Event/session conflict."
                },
                409
            );

        }


        /* =================================================
           INTERNAL FAILURE
        ================================================= */

        console.error(
            "Analytics ingestion failed",
            error
        );


        return reply(
            {
                success:
                    false,

                error:
                    "Unable to record analytics event."
            },
            500
        );

    }

}


/* =========================================================
   RETENTION CLEANUP
========================================================= */

export async function cleanupAnalytics(
    env
) {

    /*
     * Retention:
     *
     * minimum 30 days
     * default 180 days
     * maximum 730 days
     */

    const days =
        Math.max(
            30,
            Math.min(
                730,
                Number(
                    env.ANALYTICS_RETENTION_DAYS
                ) ||
                180
            )
        );


    const cutoff =
        iso(
            Date.now() -
            days *
                DAY
        );


    const rateLimitCutoff =
        Math.floor(
            Date.now() /
            1000
        );


    await env.DB.batch([

        env.DB
            .prepare(
                `
                DELETE FROM
                    analytics_v2_sessions

                WHERE
                    last_seen_at < ?
                `
            )
            .bind(
                cutoff
            ),


        env.DB
            .prepare(
                `
                DELETE FROM
                    analytics_v2_rate_limits

                WHERE
                    expires_at < ?
                `
            )
            .bind(
                rateLimitCutoff
            )

    ]);

}