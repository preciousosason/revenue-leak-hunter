import { Resend } from "resend";

import {
    clientReplyEmailTemplate,
    clientWelcomeEmailTemplate,
    clientCustomEmailTemplate
} from "./templates.js";

const DEFAULT_FROM = "Leakendia <notifications@leakendia.com>";
const DEFAULT_REPLY_TO = "precious@leakendia.com";
const DEFAULT_PORTAL_URL = "https://leakendia.com/pages/portal/portal.html";
const DEFAULT_LOGO_URL = "https://leakendia.com/assets/brand/leakendia-email-mark.jpg";

function cleanEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isBasicEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function config(env) {
    return {
        portalUrl: String(env.CLIENT_PORTAL_URL || DEFAULT_PORTAL_URL).trim(),
        logoUrl: String(env.EMAIL_LOGO_URL || DEFAULT_LOGO_URL).trim(),
        from: String(env.EMAIL_FROM || DEFAULT_FROM).trim(),
        replyTo: String(env.EMAIL_REPLY_TO || DEFAULT_REPLY_TO).trim()
    };
}

async function deliver(env, { email, subject, html, text, idempotencyKey }) {
    if (!env?.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");

    const recipient = cleanEmail(email);
    if (!isBasicEmail(recipient)) throw new Error("Client email address is invalid.");

    const resend = new Resend(env.RESEND_API_KEY);
    const { from, replyTo } = config(env);
    const payload = { from, to: recipient, subject, html, text };
    if (replyTo) payload.replyTo = replyTo;

    const { data, error } = await resend.emails.send(
        payload,
        idempotencyKey ? { idempotencyKey } : undefined
    );

    if (error) throw new Error(error.message || "Resend rejected the email.");
    return data;
}

export async function sendClientReplyNotification(env, { email, name = "", notificationId }) {
    const { portalUrl, logoUrl } = config(env);
    const template = clientReplyEmailTemplate({ name, portalUrl, logoUrl });
    return deliver(env, {
        email,
        subject: "Your investigation just moved forward.",
        ...template,
        idempotencyKey: notificationId ? `reply-notification/${notificationId}` : undefined
    });
}

export async function sendClientWelcomeNotification(env, { email, name = "", notificationId }) {
    const { portalUrl, logoUrl } = config(env);
    const template = clientWelcomeEmailTemplate({ name, portalUrl, logoUrl });
    return deliver(env, {
        email,
        subject: "Welcome to Leakendia. Your investigation starts here.",
        ...template,
        idempotencyKey: notificationId ? `welcome-notification/${notificationId}` : undefined
    });
}

export async function sendClientCustomNotification(env, { email, name = "", subject, message, notificationId }) {
    const cleanSubject = String(subject || "").trim();
    const cleanMessage = String(message || "").trim();
    if (!cleanSubject) throw new Error("Email subject is required.");
    if (!cleanMessage) throw new Error("Email message is required.");

    const { portalUrl, logoUrl } = config(env);
    const template = clientCustomEmailTemplate({ name, message: cleanMessage, portalUrl, logoUrl });
    return deliver(env, {
        email,
        subject: cleanSubject,
        ...template,
        idempotencyKey: notificationId ? `custom-notification/${notificationId}` : undefined
    });
}
