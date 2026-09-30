/* Conversion Leak Hunter Analytics v2. Load once with defer on public pages. */

(() => {

    "use strict";


    /* =================================
       PREVENT DUPLICATE INITIALIZATION
    ================================= */

    if (window.LeakAnalytics) {
        return;
    }


    /* =================================
       CONFIGURATION
    ================================= */

    const config =
        window.LEAK_ANALYTICS_CONFIG || {};


    const api =
        String(

            config.apiUrl ||

            "https://revenue-leak-hunter-api.preciousosason.workers.dev"

        ).replace(/\/$/, "");


    const nativeFetch =
        window.fetch.bind(window);


    /* =================================
       SAFE STORAGE ACCESS
    ================================= */

    const storage = (name) => {

        try {

            return window[name];

        } catch {

            return {

                getItem: () => null,

                setItem: () => {},

                removeItem: () => {}

            };

        }

    };


    const localStorage =
        storage("localStorage");


    const sessionStorage =
        storage("sessionStorage");


    /* =================================
       STORAGE KEYS
    ================================= */

    const KEY =
        "clh.analytics.v2";


    const SESSION =
        "clh.analytics.session.v2";


    const QUEUE =
        "clh.analytics.queue.v2";


    /* =================================
       HELPERS
    ================================= */

    const uid = () =>
        crypto.randomUUID();


    const get = (
        store,
        key,
        fallback
    ) => {

        try {

            return (
                JSON.parse(
                    store.getItem(key)
                ) ?? fallback
            );

        } catch {

            return fallback;

        }

    };


    const put = (
        store,
        key,
        value
    ) => {

        try {

            store.setItem(
                key,
                JSON.stringify(value)
            );

        } catch {}

    };


    const safeId = (value) =>

        String(value || "")

            .replace(
                /[^A-Za-z0-9_-]/g,
                "_"
            )

            .slice(
                0,
                128
            );


    /* =================================
       PRIVACY + TRACKING STATE
    ================================= */

    let enabled =

        config.enabled !== false &&

        !get(
            localStorage,
            KEY + ".optout",
            false
        ) &&

        navigator.doNotTrack !== "1" &&

        !navigator.globalPrivacyControl &&

        !/^\/admin(?:\/|$)/.test(
            location.pathname
        );


    /* =================================
       VISITOR + SESSION STATE
    ================================= */

    let visitor =

        get(
            localStorage,
            KEY,
            null
        ) ||

        uid();


    let session =

        get(
            sessionStorage,
            SESSION,
            null
        );


    let queue =

        get(
            sessionStorage,
            QUEUE,
            []
        );


    let sending =
        false;


    if (!Array.isArray(queue)) {

        queue = [];

    }


    let activeAt =
        performance.now();


    let activeTotal =
        0;


    let currentPath =
        "";


    let lastForm =
        null;


    const attempts =
        new WeakMap();


    const fields =
        new WeakMap();


    const depths =
        new Set();


    /* =================================
       SESSION MANAGEMENT
    ================================= */

    function ensureSession() {

        const now =
            Date.now();


        /*
           Start a new session after
           30 minutes of inactivity.
        */

        if (

            !session ||

            now - session.lastActivity >
                1800000

        ) {

            const utm =
                new URLSearchParams(
                    location.search
                );


            let ref =
                "";


            try {

                const r =
                    new URL(
                        document.referrer
                    );


                if (
                    r.origin !==
                    location.origin
                ) {

                    ref =
                        r.origin;

                }

            } catch {}


            session = {

                sessionId:
                    uid(),

                visitorId:
                    visitor,

                lastActivity:
                    now,

                source:
                    utm.get(
                        "utm_source"
                    ) || "",

                medium:
                    utm.get(
                        "utm_medium"
                    ) || "",

                campaign:
                    utm.get(
                        "utm_campaign"
                    ) || "",

                referrer:
                    ref,

                device:

                    /iPad|Tablet/i.test(
                        navigator.userAgent
                    )

                        ? "tablet"

                        : /Mobi|Android/i.test(
                            navigator.userAgent
                        )

                            ? "mobile"

                            : "desktop",

                internal:
                    config.internal === true

            };

        }


        session.lastActivity =
            now;


        put(
            sessionStorage,
            SESSION,
            session
        );


        put(
            localStorage,
            KEY,
            visitor
        );


        return {

            ...session,

            page:
                location.pathname

        };

    }


    /* =================================
       PERSIST EVENT QUEUE
    ================================= */

    function persist() {

        put(
            sessionStorage,
            QUEUE,
            queue.slice(-100)
        );

    }


    /* =================================
       TRACK EVENT
    ================================= */

    function track(
        eventType,
        metadata = {}
    ) {

        if (!enabled) {
            return;
        }


        queue.push({

            ...ensureSession(),

            eventId:
                uid(),

            eventType,

            metadata,

            occurredAt:
                new Date()
                    .toISOString()

        });


        /*
           Prevent queue growth from
           becoming ridiculous.
        */

        queue =
            queue.slice(-100);


        persist();


        void flush();

    }


    /* =================================
       SEND EVENTS
    ================================= */

    async function flush() {

        if (

            sending ||

            !enabled ||

            !navigator.onLine

        ) {

            return;

        }


        sending =
            true;


        try {


            while (
                queue.length &&
                enabled
            ) {


                const event =
                    queue[0];


                /*
                   Remove events older
                   than 24 hours.
                */

                if (

                    Date.now() -

                    Date.parse(
                        event.occurredAt
                    ) >

                    86400000

                ) {

                    queue.shift();

                    persist();

                    continue;

                }


                let response;


                try {

                    response =
                        await nativeFetch(

                            api +
                                "/api/analytics/events",

                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        event
                                    ),

                                keepalive:
                                    true,

                                credentials:
                                    "omit",

                                signal:
                                    AbortSignal.timeout(
                                        8000
                                    )

                            }

                        );


                } catch {

                    /*
                       Connection issue.
                       Keep the event queued.
                    */

                    break;

                }


                /*
                   Retry later when rate
                   limited or server fails.
                */

                if (

                    response.status ===
                        429 ||

                    response.status >=
                        500

                ) {

                    break;

                }


                /*
                   Successful or non-retryable
                   event leaves queue.
                */

                queue.shift();


                persist();

            }


        } finally {


            sending =
                false;


        }

    }


    /* =================================
       FORM CONTEXT
    ================================= */

    function formContext(form) {

        if (!enabled) {
            return null;
        }


        const ctx =
            ensureSession();


        if (!form) {

            return ctx;

        }


        const formId =
            safeId(

                form.dataset.analyticsForm ||

                form.id ||

                `form_${
                    Array.from(
                        document.forms
                    ).indexOf(form) + 1
                }`

            );


        let attempt =
            attempts.get(form);


        if (

            !attempt ||

            attempt.sessionId !==
                ctx.sessionId

        ) {

            attempt = {

                id:
                    uid(),

                sessionId:
                    ctx.sessionId

            };


            attempts.set(
                form,
                attempt
            );


            fields.set(
                form,
                new Set()
            );


            track(
                "form_start",
                {

                    form_id:
                        formId,

                    attempt_id:
                        attempt.id

                }
            );

        }


        lastForm =
            form;


        return {

            ...ctx,

            form_id:
                formId,

            attempt_id:
                attempt.id

        };

    }


    /* =================================
       CONTACT ENRICHMENT
    ================================= */

    function enrichContact(
        payload,
        form = lastForm
    ) {

        const ctx =
            formContext(form);


        return ctx

            ? {

                ...payload,

                analytics:
                    ctx

            }

            : payload;

    }


    /* =================================
       PAGE VIEW
    ================================= */

    function page() {

        if (!enabled) {
            return;
        }


        currentPath =
            location.pathname;


        depths.clear();


        activeTotal =
            0;


        activeAt =
            performance.now();


        track(
            "page_view"
        );

    }


    /* =================================
       ENGAGEMENT TIME
    ================================= */

    function engagement() {

        const now =
            performance.now();


        const elapsed =
            Math.min(
                now - activeAt,
                15000
            );


        activeAt =
            now;


        if (

            !enabled ||

            document.visibilityState !==
                "visible" ||

            !document.hasFocus()

        ) {

            return;

        }


        activeTotal +=
            elapsed;


        /*
           Record meaningful activity
           after 10 active seconds.
        */

        if (
            activeTotal >=
            10000
        ) {

            track(
                "engagement",
                {

                    active_ms:
                        Math.round(
                            activeTotal
                        )

                }
            );


            activeTotal =
                0;

        }

    }


    /* =================================
       FORM START
    ================================= */

    document.addEventListener(
        "focusin",
        (e) => {

            const form =
                e.target.closest?.(
                    "form"
                );


            if (

                form &&

                !form.matches(
                    "[data-analytics-ignore]"
                )

            ) {

                formContext(form);

            }

        }
    );


    /* =================================
       FORM FIELD INTERACTION
    ================================= */

    document.addEventListener(
        "change",
        (e) => {

            const form =
                e.target.closest?.(
                    "form"
                );


            if (

                !form ||

                form.matches(
                    "[data-analytics-ignore]"
                ) ||

                !enabled

            ) {

                return;

            }


            const ctx =
                formContext(form);


            const fieldId =
                safeId(

                    e.target
                        .dataset
                        .analyticsField ||

                    e.target.name ||

                    e.target.id

                );


            if (!fieldId) {
                return;
            }


            const seen =
                fields.get(form);


            if (
                seen.has(fieldId)
            ) {

                return;

            }


            seen.add(
                fieldId
            );


            track(
                "form_field_interaction",
                {

                    form_id:
                        ctx.form_id,

                    attempt_id:
                        ctx.attempt_id,

                    field_id:
                        fieldId

                }
            );

        }
    );


    /* =================================
       FORM VALIDATION ERRORS
    ================================= */

    document.addEventListener(

        "invalid",

        (e) => {

            const form =
                e.target.form;


            if (

                !form ||

                form.matches(
                    "[data-analytics-ignore]"
                ) ||

                !enabled

            ) {

                return;

            }


            const ctx =
                formContext(form);


            const v =
                e.target.validity;


            const error_code =

                v.valueMissing

                    ? "required"

                    : v.typeMismatch

                        ? "type"

                        : v.patternMismatch

                            ? "pattern"

                            : v.tooShort

                                ? "too_short"

                                :

                                v.rangeUnderflow ||
                                v.rangeOverflow

                                    ? "range"

                                    : "invalid";


            track(
                "form_error",
                {

                    form_id:
                        ctx.form_id,

                    attempt_id:
                        ctx.attempt_id,

                    field_id:
                        safeId(

                            e.target.name ||

                            e.target.id

                        ),

                    error_code

                }
            );

        },

        true

    );


    /* =================================
       FORM SUBMISSION
    ================================= */

    document.addEventListener(

        "submit",

        (e) => {

            if (

                !enabled ||

                e.target.matches(
                    "[data-analytics-ignore]"
                )

            ) {

                return;

            }


            const ctx =
                formContext(
                    e.target
                );


            track(
                "form_submit",
                {

                    form_id:
                        ctx.form_id,

                    attempt_id:
                        ctx.attempt_id

                }
            );

        },

        true

    );


    /* =================================
       CTA + EXTERNAL LINK TRACKING
    ================================= */

    document.addEventListener(
        "click",
        (e) => {

            const el =
                e.target.closest?.(
                    "[data-analytics-cta],a"
                );


            if (

                !el ||

                el.closest(
                    "[data-analytics-ignore]"
                )

            ) {

                return;

            }


            /*
               Explicit CTA
            */

            if (
                el.dataset.analyticsCta
            ) {

                track(
                    "cta_click",
                    {

                        cta_id:
                            safeId(
                                el.dataset.analyticsCta
                            )

                    }
                );

            }


            /*
               External link
            */

            else if (
                el.tagName === "A"
            ) {

                try {

                    if (

                        new URL(
                            el.href
                        ).origin !==
                        location.origin

                    ) {

                        track(
                            "external_link_click"
                        );

                    }

                } catch {}

            }

        }
    );


    /* =================================
       SCROLL DEPTH
    ================================= */

    window.addEventListener(

        "scroll",

        () => {


            const height =

                document.documentElement
                    .scrollHeight -

                innerHeight;


            if (
                height <= 0
            ) {

                return;

            }


            const percent =
                Math.min(

                    100,

                    Math.round(

                        (
                            scrollY /
                            height
                        ) *

                        100

                    )

                );


            for (
                const depth of
                [
                    25,
                    50,
                    75,
                    100
                ]
            ) {

                if (

                    percent >=
                        depth &&

                    !depths.has(
                        depth
                    )

                ) {

                    depths.add(
                        depth
                    );


                    track(
                        "scroll_depth",
                        {
                            depth
                        }
                    );

                }

            }

        },

        {
            passive:
                true
        }

    );


    /* =================================
       CONTACT FORM AUTO-LINKING
    ================================= */

    /*
       Narrow adapter.

       Only JSON POST requests to
       this backend's /api/contact
       endpoint are enriched.

       It does not modify responses,
       consume bodies or intercept
       unrelated requests.
    */

    if (
        config.autoLinkContact !==
        false
    ) {

        window.fetch =
            function (
                input,
                init
            ) {


                let url;


                try {

                    url =
                        new URL(

                            typeof input ===
                                "string" ||

                            input instanceof URL

                                ? input

                                : input.url,

                            location.href

                        );


                } catch {

                    return nativeFetch(
                        input,
                        init
                    );

                }


                if (

                    enabled &&

                    url.href ===
                        api +
                        "/api/contact" &&

                    String(
                        init?.method ||
                        "GET"
                    ).toUpperCase() ===
                        "POST" &&

                    typeof init?.body ===
                        "string"

                ) {

                    try {


                        const body =
                            JSON.parse(
                                init.body
                            );


                        if (

                            body &&

                            typeof body ===
                                "object" &&

                            !Array.isArray(
                                body
                            )

                        ) {


                            const form =
                                lastForm;


                            const enriched =
                                enrichContact(
                                    body,
                                    form
                                );


                            return nativeFetch(

                                input,

                                {

                                    ...init,

                                    body:
                                        JSON.stringify(
                                            enriched
                                        )

                                }

                            ).then(
                                (response) => {


                                    /*
                                       Successful lead.
                                    */

                                    if (

                                        response.ok &&

                                        form

                                    ) {

                                        attempts.delete(
                                            form
                                        );


                                        fields.delete(
                                            form
                                        );

                                    }


                                    /*
                                       Server-side form
                                       errors.
                                    */

                                    else if (

                                        response.status ===
                                            422 ||

                                        response.status >=
                                            500

                                    ) {

                                        const ctx =
                                            enriched.analytics;


                                        track(
                                            "form_error",
                                            {

                                                form_id:
                                                    ctx?.form_id,

                                                attempt_id:
                                                    ctx?.attempt_id,

                                                error_code:

                                                    response.status ===
                                                        422

                                                        ? "server_validation"

                                                        : "server_error"

                                            }
                                        );

                                    }


                                    return response;

                                }
                            );

                        }


                    } catch {}

                }


                return nativeFetch(
                    input,
                    init
                );

            };

    }


    /* =================================
       PUBLIC ANALYTICS API
    ================================= */

    window.LeakAnalytics = {


        /* =============================
           CUSTOM EVENT
        ============================= */

        track,


        /* =============================
           ATTACH ANALYTICS TO CONTACT
        ============================= */

        enrichContact,


        /* =============================
           ENABLE TRACKING
        ============================= */

        grantConsent() {

            if (

                navigator.doNotTrack ===
                    "1" ||

                navigator.globalPrivacyControl

            ) {

                return;

            }


            enabled =
                true;


            put(
                localStorage,
                KEY + ".optout",
                false
            );


            page();

        },


        /* =============================
           DISABLE TRACKING
        ============================= */

        revokeConsent() {

            enabled =
                false;


            queue =
                [];


            session =
                null;


            visitor =
                uid();


            persist();


            try {

                localStorage.removeItem(
                    KEY
                );


                sessionStorage.removeItem(
                    SESSION
                );


            } catch {}


            put(
                localStorage,
                KEY + ".optout",
                true
            );

        },


        /* =============================
           GET CURRENT CONTEXT
        ============================= */

        getContext(form) {

            return enabled

                ? formContext(form)

                : null;

        },


        /* =============================
           MANUAL PAGE VIEW
        ============================= */

        pageView:
            page,


        /* =============================
           MANUAL FORM ERROR
        ============================= */

        formError(
            form,
            fieldId,
            errorCode
        ) {

            if (!enabled) {
                return;
            }


            const ctx =
                formContext(form);


            track(
                "form_error",
                {

                    form_id:
                        ctx?.form_id,

                    attempt_id:
                        ctx?.attempt_id,

                    field_id:
                        safeId(
                            fieldId
                        ),

                    error_code:
                        safeId(
                            errorCode
                        )

                }
            );

        }

    };


    /* =================================
       PERIODIC ACTIVITY LOOP
    ================================= */

    setInterval(
        () => {


            /*
               Detect SPA/history-style
               URL path changes.
            */

            if (
                location.pathname !==
                currentPath
            ) {

                page();

            }


            engagement();


            void flush();


        },

        10000
    );


    /* =================================
       NETWORK RECOVERY
    ================================= */

    window.addEventListener(
        "online",
        flush
    );


    /* =================================
       PAGE VISIBILITY
    ================================= */

    document.addEventListener(
        "visibilitychange",
        () => {


            activeAt =
                performance.now();


            if (

                document.visibilityState ===
                "hidden"

            ) {

                void flush();

            }

        }
    );


    /* =================================
       PAGE EXIT
    ================================= */

    window.addEventListener(
        "pagehide",
        () => {

            void flush();

        }
    );


    /* =================================
       INITIAL PAGE VIEW
    ================================= */

    page();


})();