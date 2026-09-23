import {
    json
} from "../utils/response.js";

import {
    createId,
    generatePortalToken
} from "../utils/ids.js";

import { hashToken } from "../utils/security.js";

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

async function createContact(
    data,
    env
) {
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

    await env.DB
        .prepare(
            `INSERT INTO clients
            (
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

    await env.DB
        .prepare(
            `INSERT INTO conversations
            (
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

    const firstMessage = [
        `Business: ${business || "Not provided"}`,
        `Website: ${website || "Not provided"}`,
        `What they sell: ${offer}`,
        `Suspected leak: ${problem}`,
        "",
        "Client message:",
        message ||
            "No additional message provided."
    ].join("\n");

    await env.DB
        .prepare(
            `INSERT INTO messages
            (
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

    await env.DB
        .prepare(
            `INSERT INTO notifications
            (
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

    return {
        success: true,
        status: 201,
        data: {
            success: true,
            clientId,
            conversationId,
            portalToken
        }
    };
}

export async function handleContact(
    request,
    env
) {
    let data;

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