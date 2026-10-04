import { leadStatements } from "../analytics/common.js";
import { json } from "../utils/response.js";
import { createId, generatePortalToken } from "../utils/ids.js";
import { hashToken } from "../utils/security.js";


/* =========================================================
   CONTACT CONFIGURATION
========================================================= */

const MAX_SERVICES = 12;

/*
 * Minimum amount of time a real visitor should spend
 * on the form before it can be submitted.
 *
 * This is a lightweight anti-bot signal, not a security
 * boundary. Three seconds catches absurdly fast automated
 * submissions without annoying normal visitors.
 */


/* =========================================================
   SERVICE VALIDATION
========================================================= */

function validateServices(services) {

    if (!Array.isArray(services)) {
        return "Invalid service selection.";
    }


    if (services.length > MAX_SERVICES) {
        return "Too many services selected.";
    }


    for (const service of services) {

        if (
            !service ||
            typeof service !== "object" ||
            Array.isArray(service)
        ) {
            return "Invalid service selection.";
        }


        for (const key of ["id", "slug", "title"]) {

            if (
                !service[key] ||
                typeof service[key] !== "string"
            ) {
                return "Invalid service selection.";
            }

        }


        if (
            service.id.length > 160 ||
            service.slug.length > 160 ||
            service.title.length > 200 ||
            String(service.number || "").length > 20 ||
            String(service.category || "").length > 100 ||
            String(service.type || "").length > 120
        ) {
            return "Invalid service selection.";
        }

    }


    return null;
}


/* =========================================================
   CONTACT VALIDATION
========================================================= */

function validateContact(data) {

    const errors = {};


    /*
     * Request body must be a plain object.
     */

    if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
    ) {
        return {
            form: "Invalid contact data."
        };
    }


    /* =====================================================
       HONEYPOT
    ===================================================== */

    /*
     * Real visitors never fill this field.
     * Bots commonly do.
     */

    if (data.companyWebsiteConfirm) {

        errors.form =
            "Unable to submit this request.";

        return errors;

    }




    /* =====================================================
       BUSINESS
    ===================================================== */

    if (
        data.business &&
        (
            typeof data.business !== "string" ||
            data.business.length > 300
        )
    ) {

        errors.business =
            "Invalid business name.";

    }


    /* =====================================================
       NAME
    ===================================================== */

    if (
        !data.name ||
        typeof data.name !== "string" ||
        data.name.trim().length < 2
    ) {

        errors.name =
            "Please provide your name.";

    }


    /* =====================================================
       EMAIL
    ===================================================== */

    if (
        !data.email ||
        typeof data.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(data.email.trim())
    ) {

        errors.email =
            "Please provide a valid email address.";

    }


    /* =====================================================
       OFFER
    ===================================================== */

    if (
        !data.offer ||
        typeof data.offer !== "string" ||
        data.offer.trim().length < 3
    ) {

        errors.offer =
            "Please describe what you sell.";

    }


    /* =====================================================
       SUSPECTED PROBLEM
    ===================================================== */

    if (
        !data.problem ||
        typeof data.problem !== "string"
    ) {

        errors.problem =
            "Please select where you think the leak is.";

    }


    /* =====================================================
       WEBSITE
    ===================================================== */

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


    /* =====================================================
       MESSAGE
    ===================================================== */

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


    /* =====================================================
       SERVICES
    ===================================================== */

    const services =
        Array.isArray(data.services)
            ? data.services
            : [];


    const serviceError =
        validateServices(
            data.services || []
        );


    if (serviceError) {

        errors.services =
            serviceError;

    }


    /*
     * Visitor must either choose at least one service
     * or explicitly say they are unsure.
     */

    if (
        services.length === 0 &&
        data.serviceUnknown !== true
    ) {

        errors.services =
            "Choose at least one service, or tell me you're not sure yet.";

    }


    return errors;
}


/* =========================================================
   CREATE CONTACT
========================================================= */

async function createContact(data, env) {

    const name =
        data.name.trim();


    const email =
        data.email
            .trim()
            .toLowerCase();


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


    const services =
        Array.isArray(data.services)
            ? data.services
            : [];


    const serviceUnknown =
        data.serviceUnknown === true;


    /* =====================================================
       PORTAL IDENTITY
    ===================================================== */

    const portalToken =
        generatePortalToken();


    const tokenHash =
        await hashToken(
            portalToken
        );


    const clientId =
        createId();


    const conversationId =
        createId();


    const messageId =
        createId();


    /* =====================================================
       EXISTING CLIENT CHECK
    ===================================================== */

    const existingClient =
        await env.DB.prepare(
            `
            SELECT id
            FROM clients
            WHERE email = ?
            `
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


    /* =====================================================
       DATABASE TRANSACTION
    ===================================================== */

    const statements = [];


    /* =====================================================
       CLIENT
    ===================================================== */

    statements.push(

        env.DB.prepare(
            `
            INSERT INTO clients
            (
                id,
                name,
                email,
                business,
                website,
                token_hash
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `
        )
        .bind(
            clientId,
            name,
            email,
            business,
            website,
            tokenHash
        )

    );


    /* =====================================================
       CONVERSATION
    ===================================================== */

    statements.push(

        env.DB.prepare(
            `
            INSERT INTO conversations
            (
                id,
                client_id,
                subject,
                status
            )
            VALUES (?, ?, ?, ?)
            `
        )
        .bind(
            conversationId,
            clientId,
            "Leak Hunt Investigation",
            "open"
        )

    );


    /* =====================================================
       SERVICE INTERESTS
    ===================================================== */

    for (const service of services) {

        statements.push(

            env.DB.prepare(
                `
                INSERT INTO client_service_interests
                (
                    id,
                    client_id,
                    service_id,
                    service_slug,
                    service_title,
                    service_number,
                    service_category,
                    service_type
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `
            )
            .bind(
                createId(),
                clientId,
                service.id.trim(),
                service.slug.trim(),
                service.title.trim(),
                String(
                    service.number || ""
                ).trim() || null,
                String(
                    service.category || ""
                ).trim() || null,
                String(
                    service.type || ""
                ).trim() || null
            )

        );

    }


    /* =====================================================
       SERVICE SUMMARY
    ===================================================== */

    const serviceLines =
        services.length
            ? services
                .map(
                    service =>
                        `${service.number || "--"} — ${service.title}`
                )
                .join(", ")
            : "Not sure yet — diagnosis requested";


    /* =====================================================
       FIRST CLIENT MESSAGE
    ===================================================== */

    const firstMessage = [

        `Business: ${business || "Not provided"}`,

        `Website: ${website || "Not provided"}`,

        `Interested services: ${serviceLines}`,

        `Service selection uncertain: ${
            serviceUnknown
                ? "Yes"
                : "No"
        }`,

        `What they sell: ${offer}`,

        `Suspected leak: ${problem}`,

        "",

        "Client message:",

        message ||
            "No additional message provided."

    ].join("\n");


    statements.push(

        env.DB.prepare(
            `
            INSERT INTO messages
            (
                id,
                conversation_id,
                sender_type,
                message
            )
            VALUES (?, ?, ?, ?)
            `
        )
        .bind(
            messageId,
            conversationId,
            "client",
            firstMessage
        )

    );


    /* =====================================================
       ADMIN NOTIFICATION
    ===================================================== */

    const notificationMessage =
        services.length
            ? `${name} submitted a new Leak Hunt request for ${services
                .map(service => service.title)
                .join(", ")}.`
            : `${name} submitted a new Leak Hunt request and needs help choosing a service.`;


    statements.push(

        env.DB.prepare(
            `
            INSERT INTO notifications
            (
                id,
                client_id,
                type,
                title,
                message
            )
            VALUES (?, ?, ?, ?, ?)
            `
        )
        .bind(
            createId(),
            clientId,
            "new_client",
            "New Leak Hunt Request",
            notificationMessage
        )

    );


    /* =====================================================
       ANALYTICS
    ===================================================== */

    statements.push(
        ...leadStatements(
            env.DB,
            clientId,
            data.analytics
        )
    );


    /* =====================================================
       COMMIT
    ===================================================== */

    await env.DB.batch(
        statements
    );


    /* =====================================================
       RESPONSE
    ===================================================== */

    return {

        success: true,

        status: 201,

        data: {

            success: true,

            clientId,

            conversationId,

            portalToken,

            services,

            serviceUnknown

        }

    };

}


/* =========================================================
   CONTACT REQUEST HANDLER
========================================================= */

export async function handleContact(
    request,
    env
) {

    let data;


    /* =====================================================
       PARSE REQUEST
    ===================================================== */

    try {

        data =
            await request.json();

    } catch {

        return json(
            {
                success: false,
                error:
                    "Invalid JSON request."
            },
            400
        );

    }


    /* =====================================================
       VALIDATE REQUEST
    ===================================================== */

    const errors =
        validateContact(data);


    if (
        Object.keys(errors).length > 0
    ) {

        return json(
            {
                success: false,
                errors
            },
            422
        );

    }


    /* =====================================================
       CREATE CLIENT + PORTAL
    ===================================================== */

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
            {
                success: true,
                ...result.data
            },
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