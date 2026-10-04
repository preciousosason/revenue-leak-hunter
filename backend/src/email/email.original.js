import { Resend } from "resend";

import {
    clientReplyEmailTemplate
} from "./templates.js";

const DEFAULT_FROM =
    "Leakendia <notifications@leakendia.com>";
const DEFAULT_REPLY_TO =
    "admin@leakendia.com";
const DEFAULT_PORTAL_URL =
    "https://leakendia.com/pages/portal/portal.html";

function cleanEmail(value) {
    return typeof value === "string"
        ? value.trim().toLowerCase()
        : "";
}

function isBasicEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendClientReplyNotification(
    env,
    { email, name = "", conversationId = "", messageId = "" }
) {
    if (!env?.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY is not configured.");
    }

    const recipient = cleanEmail(email);
    if (!isBasicEmail(recipient)) {
        throw new Error("Client email address is invalid.");
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const portalUrl = String(env.CLIENT_PORTAL_URL || DEFAULT_PORTAL_URL).trim();
    const from = String(env.EMAIL_FROM || DEFAULT_FROM).trim();
    const replyTo = String(env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO).trim();
    const template = clientReplyEmailTemplate({ name, portalUrl });

    const payload = {
        from,
        to: recipient,
        subject: "You have a new reply from Leakendia",
        html: template.html,
        text: template.text
    };
    if (replyTo) payload.replyTo = replyTo;

    const idempotencyKey = messageId
        ? `admin-reply/${messageId}`
        : conversationId
            ? `admin-reply/${conversationId}/${Date.now()}`
            : undefined;

    const { data, error } = await resend.emails.send(
        payload,
        idempotencyKey ? { idempotencyKey } : undefined
    );

    if (error) {
        throw new Error(error.message || "Resend rejected the email.");
    }
    return data;
}
