const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
};


/* =========================================================
   RESPONSE HELPERS
========================================================= */

function json(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: CORS_HEADERS
        }
    );

}


/* =========================================================
   UUID
========================================================= */

function createId() {

    return crypto.randomUUID();

}


/* =========================================================
   SECURE TOKEN GENERATION
========================================================= */

function generatePortalToken() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const randomValues =
        new Uint32Array(16);

    crypto.getRandomValues(randomValues);

    const groups = [];

    for (let group = 0; group < 4; group++) {

        let value = "";

        for (let i = 0; i < 4; i++) {

            const index =
                randomValues[
                    group * 4 + i
                ] % characters.length;

            value += characters[index];

        }

        groups.push(value);

    }

    return `LH-${groups.join("-")}`;

}


/* =========================================================
   HASH TOKEN
========================================================= */

async function hashToken(token) {

    const encoder =
        new TextEncoder();

    const data =
        encoder.encode(token);

    const hashBuffer =
        await crypto.subtle.digest(
            "SHA-256",
            data
        );

    const hashArray =
        Array.from(
            new Uint8Array(hashBuffer)
        );

    return hashArray
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");

}


/* =========================================================
   VALIDATION
========================================================= */

function validateContact(data) {

    const errors = {};

    if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length < 2
    ) {

        errors.name =
            "Please provide your name.";

    }


    if (
        !data.email ||
        typeof data.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            data.email.trim()
        )
    ) {

        errors.email =
            "Please provide a valid email address.";

    }


    if (
        !data.offer ||
        typeof data.offer !== "string" ||
        data.offer.trim().length < 3
    ) {

        errors.offer =
            "Please describe what you sell.";

    }


    if (
        !data.problem ||
        typeof data.problem !== "string"
    ) {

        errors.problem =
            "Please select where you think the leak is.";

    }


    if (
        data.website &&
        (
            typeof data.website !== "string" ||
            data.website.length > 500
        )
    ) {

        errors.website =
            "Please provide a valid website.";

    }


    if (
        data.message &&
        (
            typeof data.message !== "string" ||
            data.message.length > 5000
        )
    ) {

        errors.message =
            "Your message is too long.";

    }


    return errors;

}


/* =========================================================
   CREATE CLIENT + CONVERSATION
========================================================= */

async function createContact(data, env) {

    const name =
        data.name.trim();

    const email =
        data.email.trim().toLowerCase();

    const business =
        data.business
            ? data.business.trim()
            : null;

    const website =
        data.website
            ? data.website.trim()
            : null;

    const offer =
        data.offer.trim();

    const problem =
        data.problem.trim();

    const message =
        data.message
            ? data.message.trim()
            : "";


    /*
     * Generate the portal token.
     *
     * The raw token is NEVER stored
     * in the database.
     */

    const portalToken =
        generatePortalToken();

    const tokenHash =
        await hashToken(portalToken);


    const clientId =
        createId();

    const conversationId =
        createId();

    const messageId =
        createId();


    /*
     * Check whether the email already
     * belongs to an existing client.
     */

    const existingClient =
        await env.DB
            .prepare(
                `SELECT id
                 FROM clients
                 WHERE email = ?`
            )
            .bind(email)
            .first();


    if (existingClient) {

        return {
            error:
                "An account already exists for this email address.",
            status: 409
        };

    }


    /*
     * Create client.
     */

    await env.DB
        .prepare(
            `INSERT INTO clients (
                id,
                name,
                email,
                business,
                website,
                token_hash
            )
            VALUES (?, ?, ?, ?, ?, ?)`
        )
        .bind(
            clientId,
            name,
            email,
            business,
            website,
            tokenHash
        )
        .run();


    /*
     * Create conversation.
     */

    await env.DB
        .prepare(
            `INSERT INTO conversations (
                id,
                client_id,
                subject,
                status
            )
            VALUES (?, ?, ?, ?)`
        )
        .bind(
            conversationId,
            clientId,
            "Leak Hunt Investigation",
            "open"
        )
        .run();


    /*
     * Create the first message.
     *
     * This gives the admin/client portal
     * an initial record of what the client
     * submitted.
     */

    const firstMessage = [
        `Business: ${business || "Not provided"}`,
        `Website: ${website || "Not provided"}`,
        `What they sell: ${offer}`,
        `Suspected leak: ${problem}`,
        "",
        "Client message:",
        message || "No additional message provided."
    ].join("\n");


    await env.DB
        .prepare(
            `INSERT INTO messages (
                id,
                conversation_id,
                sender_type,
                message
            )
            VALUES (?, ?, ?, ?)`
        )
        .bind(
            messageId,
            conversationId,
            "client",
            firstMessage
        )
        .run();


    /*
     * Create notification for future
     * admin dashboard.
     */

    await env.DB
        .prepare(
            `INSERT INTO notifications (
                id,
                client_id,
                type,
                title,
                message
            )
            VALUES (?, ?, ?, ?, ?)`
        )
        .bind(
            createId(),
            clientId,
            "new_client",
            "New Leak Hunt Request",
            `${name} submitted a new Leak Hunt request.`
        )
        .run();


    /*
     * IMPORTANT:
     *
     * The raw token is returned only once.
     * The database only contains the hash.
     */

    return {
        success: true,
        status: 201,
        data: {
            clientId,
            conversationId,
            portalToken
        }
    };

}


/* =========================================================
   CONTACT ENDPOINT
========================================================= */

async function handleContact(request, env) {

    let data;

    try {

        data =
            await request.json();

    } catch {

        return json(
            {
                success: false,
                error: "Invalid JSON request."
            },
            400
        );

    }


    const errors =
        validateContact(data);


    if (Object.keys(errors).length > 0) {

        return json(
            {
                success: false,
                errors
            },
            422
        );

    }


    try {

        const result =
            await createContact(
                data,
                env
            );


        if (result.error) {

            return json(
                {
                    success: false,
                    error: result.error
                },
                result.status
            );

        }


        return json(
            result.data,
            result.status
        );

    } catch (error) {

        console.error(
            "Contact submission error:",
            error
        );


        return json(
            {
                success: false,
                error:
                    "Something went wrong while creating your portal."
            },
            500
        );

    }

}


/* =========================================================
   MAIN WORKER
========================================================= */

export default {

    async fetch(request, env) {

        const url =
            new URL(request.url);


        /*
         * CORS preflight
         */

        if (
            request.method === "OPTIONS"
        ) {

            return new Response(
                null,
                {
                    status: 204,
                    headers: CORS_HEADERS
                }
            );

        }


        /*
         * Health check
         */

        if (
            url.pathname === "/"
            &&
            request.method === "GET"
        ) {

            return json({
                success: true,
                service:
                    "Revenue Leak Hunter API",
                status:
                    "online"
            });

        }


        /*
         * Contact submission
         */

        if (
            url.pathname === "/api/contact"
            &&
            request.method === "POST"
        ) {

            return handleContact(
                request,
                env
            );

        }


        /*
         * Unknown route
         */

        return json(
            {
                success: false,
                error: "Route not found."
            },
            404
        );

    }

};