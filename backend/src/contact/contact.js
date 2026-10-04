import { leadStatements } from "../analytics/common.js";
import { json } from "../utils/response.js";
import { createId, generatePortalToken } from "../utils/ids.js";
import { hashToken } from "../utils/security.js";

const MAX_SERVICES = 12;
const MIN_FORM_TIME_MS = 1200;

function validateServices(services) {
    if (!Array.isArray(services)) return "Invalid service selection.";
    if (services.length > MAX_SERVICES) return "Too many services selected.";

    for (const service of services) {
        if (!service || typeof service !== "object" || Array.isArray(service)) {
            return "Invalid service selection.";
        }

        for (const key of ["id", "slug", "title"]) {
            if (!service[key] || typeof service[key] !== "string") {
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

function validateContact(data) {
    const errors = {};

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return { form: "Invalid contact data." };
    }

    // Honeypot. Real visitors never fill this field.
    if (data.companyWebsiteConfirm) {
        errors.form = "Unable to submit this request.";
        return errors;
    }

    const startedAt = Number(data.formStartedAt || 0);
    if (!Number.isFinite(startedAt) || startedAt <= 0 || Date.now() - startedAt < MIN_FORM_TIME_MS) {
        errors.form = "Please wait a moment and try again.";
    }

    if (data.business && (typeof data.business !== "string" || data.business.length > 300)) {
        errors.business = "Invalid business name.";
    }

    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
        errors.name = "Please provide your name.";
    }

    if (
        !data.email ||
        typeof data.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
    ) {
        errors.email = "Please provide a valid email address.";
    }

    if (!data.offer || typeof data.offer !== "string" || data.offer.trim().length < 3) {
        errors.offer = "Please describe what you sell.";
    }

    if (!data.problem || typeof data.problem !== "string") {
        errors.problem = "Please select where you think the leak is.";
    }

    if (data.website && (typeof data.website !== "string" || data.website.length > 500)) {
        errors.website = "Please provide a valid website.";
    }

    if (data.message && (typeof data.message !== "string" || data.message.length > 5000)) {
        errors.message = "Your message is too long.";
    }

    const serviceError = validateServices(data.services || []);
    if (serviceError) errors.services = serviceError;

    if ((data.services || []).length === 0 && data.serviceUnknown !== true) {
        errors.services = "Choose at least one service, or tell me you're not sure yet.";
    }

    return errors;
}

async function createContact(data, env) {
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const business = data.business ? data.business.trim() : null;
    const website = data.website ? data.website.trim() : null;
    const offer = data.offer.trim();
    const problem = data.problem.trim();
    const message = data.message ? data.message.trim() : "";
    const services = Array.isArray(data.services) ? data.services : [];
    const serviceUnknown = data.serviceUnknown === true;

    const portalToken = generatePortalToken();
    const tokenHash = await hashToken(portalToken);
    const clientId = createId();
    const conversationId = createId();
    const messageId = createId();

    const existingClient = await env.DB.prepare(
        `SELECT id FROM clients WHERE email = ?`
    ).bind(email).first();

    if (existingClient) {
        return {
            error: "An account already exists for this email address.",
            status: 409,
        };
    }

    const statements = [];

    statements.push(
        env.DB.prepare(
            `INSERT INTO clients (id, name, email, business, website, token_hash)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(clientId, name, email, business, website, tokenHash)
    );

    statements.push(
        env.DB.prepare(
            `INSERT INTO conversations (id, client_id, subject, status)
             VALUES (?, ?, ?, ?)`
        ).bind(conversationId, clientId, "Leak Hunt Investigation", "open")
    );

    for (const service of services) {
        statements.push(
            env.DB.prepare(
                `INSERT INTO client_service_interests
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
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                createId(),
                clientId,
                service.id.trim(),
                service.slug.trim(),
                service.title.trim(),
                String(service.number || "").trim() || null,
                String(service.category || "").trim() || null,
                String(service.type || "").trim() || null
            )
        );
    }

    const serviceLines = services.length
        ? services.map(service => `${service.number || "--"} — ${service.title}`).join(", ")
        : "Not sure yet — diagnosis requested";

    const firstMessage = [
        `Business: ${business || "Not provided"}`,
        `Website: ${website || "Not provided"}`,
        `Interested services: ${serviceLines}`,
        `Service selection uncertain: ${serviceUnknown ? "Yes" : "No"}`,
        `What they sell: ${offer}`,
        `Suspected leak: ${problem}`,
        "",
        "Client message:",
        message || "No additional message provided.",
    ].join("\n");

    statements.push(
        env.DB.prepare(
            `INSERT INTO messages (id, conversation_id, sender_type, message)
             VALUES (?, ?, ?, ?)`
        ).bind(messageId, conversationId, "client", firstMessage)
    );

    statements.push(
        env.DB.prepare(
            `INSERT INTO notifications (id, client_id, type, title, message)
             VALUES (?, ?, ?, ?, ?)`
        ).bind(
            createId(),
            clientId,
            "new_client",
            "New Leak Hunt Request",
            `${name} submitted a new Leak Hunt request${services.length ? ` for ${services.map(s => s.title).join(", ")}` : " and needs help choosing a service"}.`
        )
    );

    statements.push(...leadStatements(env.DB, clientId, data.analytics));
    await env.DB.batch(statements);

    return {
        success: true,
        status: 201,
        data: {
            success: true,
            clientId,
            conversationId,
            portalToken,
            services,
            serviceUnknown,
        },
    };
}

export async function handleContact(request, env) {
    let data;

    try {
        data = await request.json();
    } catch {
        return json({ success: false, error: "Invalid JSON request." }, 400);
    }

    const errors = validateContact(data);

    if (Object.keys(errors).length > 0) {
        return json({ success: false, errors }, 422);
    }

    try {
        const result = await createContact(data, env);

        if (result.error) {
            return json({ success: false, error: result.error }, result.status);
        }

        return json({ success: true, ...result.data }, result.status);
    } catch (error) {
        console.error("Contact submission error:", error);
        return json(
            { success: false, error: "Something went wrong while creating your portal." },
            500
        );
    }
}
