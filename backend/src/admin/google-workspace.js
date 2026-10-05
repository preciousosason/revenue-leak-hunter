import { json } from "../utils/response.js";
import { authenticateAdmin } from "../utils/auth.js";
import { createId } from "../utils/ids.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const DEFAULT_SENDER = "precious@leakendia.com";
const DEFAULT_REDIRECT = "https://revenue-leak-hunter-api.preciousosason.workers.dev/api/admin/outreach/google/callback";

function clean(value, max = 5000) {
    return String(value ?? "").trim().slice(0, max);
}

async function adminOr401(request, env) {
    const admin = await authenticateAdmin(request, env);
    return admin ? null : json({ success: false, error: "Admin authentication required." }, 401);
}

function requiredConfig(env) {
    const clientId = clean(env.GOOGLE_OAUTH_CLIENT_ID, 500);
    const clientSecret = clean(env.GOOGLE_OAUTH_CLIENT_SECRET, 500);
    const encryptionSecret = clean(env.GOOGLE_TOKEN_ENCRYPTION_KEY, 1000);
    const redirectUri = clean(env.GOOGLE_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT, 1000);
    const sender = clean(env.OUTREACH_SENDER_EMAIL || DEFAULT_SENDER, 320).toLowerCase();
    if (!clientId || !clientSecret || !encryptionSecret) {
        throw new Error("Google Workspace OAuth secrets are not fully configured.");
    }
    return { clientId, clientSecret, encryptionSecret, redirectUri, sender };
}

function bytesToBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, ch => ch.charCodeAt(0));
}

function base64Url(bytes) {
    return bytesToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function encryptionKey(secret) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encryptToken(token, secret) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await encryptionKey(secret);
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token));
    return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(encrypted))}`;
}

async function decryptToken(value, secret) {
    const [ivPart, dataPart] = String(value || "").split(".");
    if (!ivPart || !dataPart) throw new Error("Stored Google authorization is invalid.");
    const key = await encryptionKey(secret);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToBytes(ivPart) },
        key,
        base64ToBytes(dataPart)
    );
    return new TextDecoder().decode(decrypted);
}

async function tokenRequest(params) {
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.error) {
        const detail = data.error_description || data.error || `Google token request failed (${response.status}).`;
        throw new Error(detail);
    }
    return data;
}

async function getConnection(env) {
    return env.DB.prepare(`SELECT * FROM outreach_google_connection WHERE id = 'primary' LIMIT 1`).first();
}

async function accessToken(env) {
    const cfg = requiredConfig(env);
    const connection = await getConnection(env);
    if (!connection?.refresh_token_encrypted) {
        throw new Error("Google Workspace is not connected. Connect precious@leakendia.com first.");
    }
    const refreshToken = await decryptToken(connection.refresh_token_encrypted, cfg.encryptionSecret);
    const tokens = await tokenRequest({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
    });
    return tokens.access_token;
}

function htmlPage(title, message, ok = true) {
    const safe = String(message).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
    return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#080808;color:#f5f5f5;font-family:Arial,sans-serif;display:grid;place-items:center;min-height:100vh"><main style="max-width:620px;background:#101010;border:1px solid rgba(255,255,255,.1);padding:32px;border-radius:14px"><div style="color:${ok ? '#32d74b' : '#ff5148'};font-weight:800;letter-spacing:.08em">${ok ? 'CONNECTED' : 'CONNECTION FAILED'}</div><h1>Leakendia Outreach</h1><p style="color:#a5a5a5;line-height:1.6">${safe}</p><p style="color:#6f6f6f">You can close this tab and return to the Control Center.</p></main></body></html>`, { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=UTF-8" } });
}

export async function handleGoogleStatus(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    let configured = true;
    try { requiredConfig(env); } catch { configured = false; }
    const connection = await getConnection(env).catch(() => null);
    return json({
        success: true,
        configured,
        connected: Boolean(connection?.refresh_token_encrypted),
        sender: clean(env.OUTREACH_SENDER_EMAIL || DEFAULT_SENDER, 320).toLowerCase(),
        connected_at: connection?.connected_at || null,
        updated_at: connection?.updated_at || null
    });
}

export async function handleGoogleConnect(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    let cfg;
    try { cfg = requiredConfig(env); } catch (error) { return json({ success: false, error: error.message }, 500); }
    const state = base64Url(crypto.getRandomValues(new Uint8Array(32)));
    const now = new Date();
    const expires = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    await env.DB.prepare(`INSERT INTO outreach_oauth_states (state, created_at, expires_at) VALUES (?, ?, ?)`).bind(state, now.toISOString(), expires).run();
    await env.DB.prepare(`DELETE FROM outreach_oauth_states WHERE expires_at < ?`).bind(now.toISOString()).run();
    const url = new URL(GOOGLE_AUTH_URL);
    url.searchParams.set("client_id", cfg.clientId);
    url.searchParams.set("redirect_uri", cfg.redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", GMAIL_SEND_SCOPE);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("login_hint", cfg.sender);
    url.searchParams.set("state", state);
    return json({ success: true, authorization_url: url.toString(), redirect_uri: cfg.redirectUri, sender: cfg.sender });
}

export async function handleGoogleCallback(request, env) {
    const url = new URL(request.url);
    const state = clean(url.searchParams.get("state"), 500);
    const code = clean(url.searchParams.get("code"), 5000);
    const oauthError = clean(url.searchParams.get("error"), 500);
    if (oauthError) return htmlPage("Google connection failed", `Google returned: ${oauthError}`, false);
    if (!state || !code) return htmlPage("Google connection failed", "The OAuth callback was missing its authorization code or state.", false);
    const stateRow = await env.DB.prepare(`SELECT * FROM outreach_oauth_states WHERE state = ? LIMIT 1`).bind(state).first();
    if (!stateRow || new Date(stateRow.expires_at).getTime() < Date.now()) {
        return htmlPage("Google connection failed", "The authorization request expired or could not be verified. Start Connect Google Workspace again.", false);
    }
    await env.DB.prepare(`DELETE FROM outreach_oauth_states WHERE state = ?`).bind(state).run();
    try {
        const cfg = requiredConfig(env);
        const tokens = await tokenRequest({
            client_id: cfg.clientId,
            client_secret: cfg.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: cfg.redirectUri
        });
        if (!tokens.refresh_token) {
            throw new Error("Google did not return a refresh token. Reconnect and grant consent again.");
        }
        const encrypted = await encryptToken(tokens.refresh_token, cfg.encryptionSecret);
        const now = new Date().toISOString();
        await env.DB.prepare(`INSERT INTO outreach_google_connection (id, sender_email, refresh_token_encrypted, scope, connected_at, updated_at) VALUES ('primary', ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET sender_email=excluded.sender_email, refresh_token_encrypted=excluded.refresh_token_encrypted, scope=excluded.scope, connected_at=excluded.connected_at, updated_at=excluded.updated_at`).bind(cfg.sender, encrypted, GMAIL_SEND_SCOPE, now, now).run();
        return htmlPage("Google Workspace connected", `${cfg.sender} is now connected to Leakendia Outreach for Gmail sending.`);
    } catch (error) {
        return htmlPage("Google connection failed", error?.message || "Google authorization could not be completed.", false);
    }
}

export async function handleGoogleDisconnect(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    await env.DB.prepare(`DELETE FROM outreach_google_connection WHERE id = 'primary'`).run();
    return json({ success: true });
}

function mimeMessage({ from, to, subject, text }) {
    const safeSubject = String(subject).replace(/[\r\n]+/g, " ");
    const safeFrom = String(from).replace(/[\r\n]+/g, " ");
    const safeTo = String(to).replace(/[\r\n]+/g, " ");
    return [
        `From: Precious <${safeFrom}>`,
        `To: ${safeTo}`,
        `Subject: ${safeSubject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 8bit",
        "",
        String(text).replace(/\r?\n/g, "\r\n")
    ].join("\r\n");
}

export async function sendGoogleOutreachEmail(env, { to, subject, text }) {
    const cfg = requiredConfig(env);
    const token = await accessToken(env);
    const raw = base64Url(new TextEncoder().encode(mimeMessage({ from: cfg.sender, to, subject, text })));
    const response = await fetch(GMAIL_SEND_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ raw })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) {
        throw new Error(data?.error?.message || `Gmail send failed (${response.status}).`);
    }
    return { id: data.id, threadId: data.threadId || null, sender: cfg.sender };
}
