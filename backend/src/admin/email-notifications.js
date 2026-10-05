import { authenticateAdmin } from "../utils/auth.js";
import { createId } from "../utils/ids.js";
import { json } from "../utils/response.js";
import {
    sendClientReplyNotification,
    sendClientWelcomeNotification,
    sendClientCustomNotification
} from "../email/email.js";

async function getTarget(env, conversationId) {
    return env.DB.prepare(`SELECT c.id AS conversation_id, c.client_id, c.subject, cl.name, cl.email FROM conversations c INNER JOIN clients cl ON cl.id = c.client_id WHERE c.id = ?`)
        .bind(conversationId).first();
}

function clean(value, max) {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function handleAdminSendEmailNotification(request, env) {
    const admin = await authenticateAdmin(request, env);
    if (!admin) return json({ success: false, error: "Admin authentication required." }, 401);

    let data;
    try { data = await request.json(); }
    catch { return json({ success: false, error: "Invalid JSON request." }, 400); }

    const conversationId = clean(data.conversationId, 128);
    const type = clean(data.type, 32).toLowerCase();
    const subject = clean(data.subject, 180);
    const message = clean(data.message, 10000);

    if (!conversationId) return json({ success: false, error: "Conversation ID is required." }, 400);
    if (!["reply", "welcome", "custom"].includes(type)) return json({ success: false, error: "Invalid notification type." }, 422);
    if (type === "custom" && !subject) return json({ success: false, error: "Subject is required." }, 422);
    if (type === "custom" && !message) return json({ success: false, error: "Message is required." }, 422);

    try {
        const target = await getTarget(env, conversationId);
        if (!target) return json({ success: false, error: "Conversation not found." }, 404);
        if (!target.email) return json({ success: false, error: "This client does not have an email address." }, 422);

        const notificationId = createId();
        const finalSubject = type === "reply"
            ? "Your investigation just moved forward."
            : type === "welcome"
                ? "Welcome to Leakendia. Your investigation starts here."
                : subject;

        await env.DB.prepare(`INSERT INTO email_notifications (id, conversation_id, client_id, type, recipient_email, subject, custom_message, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`)
            .bind(notificationId, conversationId, target.client_id, type, target.email, finalSubject, type === "custom" ? message : null).run();

        try {
            let result;
            if (type === "reply") result = await sendClientReplyNotification(env, { email: target.email, name: target.name || "", notificationId });
            if (type === "welcome") result = await sendClientWelcomeNotification(env, { email: target.email, name: target.name || "", notificationId });
            if (type === "custom") result = await sendClientCustomNotification(env, { email: target.email, name: target.name || "", subject, message, notificationId });

            await env.DB.prepare(`UPDATE email_notifications SET status = 'sent', provider_message_id = ?, sent_at = CURRENT_TIMESTAMP, error_message = NULL WHERE id = ?`)
                .bind(result?.id || null, notificationId).run();

            return json({ success: true, notification: { id: notificationId, type, subject: finalSubject, recipient: target.email, status: "sent" } });
        } catch (sendError) {
            await env.DB.prepare(`UPDATE email_notifications SET status = 'failed', error_message = ? WHERE id = ?`)
                .bind(String(sendError?.message || "Email delivery failed.").slice(0, 1000), notificationId).run();
            console.error("Admin email notification failed:", sendError);
            return json({ success: false, error: "The notification could not be delivered. Your conversation was not affected." }, 502);
        }
    } catch (error) {
        console.error("Admin email notification error:", error);
        return json({ success: false, error: "Unable to process the email notification." }, 500);
    }
}

export async function handleAdminEmailNotificationHistory(request, env, conversationId) {
    const admin = await authenticateAdmin(request, env);
    if (!admin) return json({ success: false, error: "Admin authentication required." }, 401);
    if (!conversationId) return json({ success: false, error: "Conversation ID is required." }, 400);

    try {
        const { results } = await env.DB.prepare(`SELECT id, type, recipient_email, subject, status, provider_message_id, error_message, created_at, sent_at FROM email_notifications WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 50`)
            .bind(conversationId).all();
        return json({ success: true, notifications: results || [] });
    } catch (error) {
        console.error("Email notification history error:", error);
        return json({ success: false, error: "Unable to load email notification history." }, 500);
    }
}
