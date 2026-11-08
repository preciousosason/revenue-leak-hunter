import { json } from "../utils/response.js";
import { authenticateAdmin } from "../utils/auth.js";
import { createId } from "../utils/ids.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const DEFAULT_SENDER = "precious@leakendia.com";
const DEFAULT_REDIRECT =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev/api/admin/outreach/google/callback";

function clean(value, max = 5000) {
    return String(value ?? "").trim().slice(0, max);
}

async function adminOr401(request, env) {
    const admin = await authenticateAdmin(request, env);

    return admin
        ? null
        : json(
              {
                  success: false,
                  error: "Admin authentication required."
              },
              401
          );
}

function requiredConfig(env) {
    const clientId = clean(env.GOOGLE_OAUTH_CLIENT_ID, 500);
    const clientSecret = clean(env.GOOGLE_OAUTH_CLIENT_SECRET, 500);
    const encryptionSecret = clean(
        env.GOOGLE_TOKEN_ENCRYPTION_KEY,
        1000
    );

    const redirectUri = clean(
        env.GOOGLE_OAUTH_REDIRECT_URI || DEFAULT_REDIRECT,
        1000
    );

    const sender = clean(
        env.OUTREACH_SENDER_EMAIL || DEFAULT_SENDER,
        320
    ).toLowerCase();

    if (!clientId || !clientSecret || !encryptionSecret) {
        throw new Error(
            "Google Workspace OAuth secrets are not fully configured."
        );
    }

    return {
        clientId,
        clientSecret,
        encryptionSecret,
        redirectUri,
        sender
    };
}

function bytesToBase64(bytes) {
    let binary = "";

    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(
            ...bytes.subarray(i, i + 0x8000)
        );
    }

    return btoa(binary);
}

function base64ToBytes(value) {
    const binary = atob(value);

    return Uint8Array.from(
        binary,
        char => char.charCodeAt(0)
    );
}

function base64Url(bytes) {
    return bytesToBase64(bytes)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

async function encryptionKey(secret) {
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(secret)
    );

    return crypto.subtle.importKey(
        "raw",
        digest,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

async function encryptToken(token, secret) {
    const iv = crypto.getRandomValues(
        new Uint8Array(12)
    );

    const key = await encryptionKey(secret);

    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv
        },
        key,
        new TextEncoder().encode(token)
    );

    return `${bytesToBase64(iv)}.${bytesToBase64(
        new Uint8Array(encrypted)
    )}`;
}

async function decryptToken(value, secret) {
    const [ivPart, dataPart] = String(
        value || ""
    ).split(".");

    if (!ivPart || !dataPart) {
        throw new Error(
            "Stored Google authorization is invalid."
        );
    }

    const key = await encryptionKey(secret);

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: base64ToBytes(ivPart)
        },
        key,
        base64ToBytes(dataPart)
    );

    return new TextDecoder().decode(decrypted);
}

async function tokenRequest(params) {
    const response = await fetch(
        GOOGLE_TOKEN_URL,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(params)
        }
    );

    const data = await response
        .json()
        .catch(() => ({}));

    if (!response.ok || data.error) {
        const detail =
            data.error_description ||
            data.error ||
            `Google token request failed (${response.status}).`;

        throw new Error(detail);
    }

    return data;
}

async function getConnection(env) {
    return env.DB.prepare(`
        SELECT *
        FROM outreach_google_connection
        WHERE id = 'primary'
        LIMIT 1
    `).first();
}

async function accessToken(env) {
    const cfg = requiredConfig(env);

    const connection =
        await getConnection(env);

    if (!connection?.refresh_token_encrypted) {
        throw new Error(
            "Google Workspace is not connected. Connect precious@leakendia.com first."
        );
    }

    const refreshToken =
        await decryptToken(
            connection.refresh_token_encrypted,
            cfg.encryptionSecret
        );

    const tokens = await tokenRequest({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token"
    });

    return tokens.access_token;
}

function htmlPage(
    title,
    message,
    ok = true
) {
    const safe = String(message).replace(
        /[&<>"']/g,
        char =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[char]
    );

    return new Response(
        `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta
    name="viewport"
    content="width=device-width,initial-scale=1"
>
<title>${title}</title>
</head>

<body style="
    margin:0;
    background:#080808;
    color:#f5f5f5;
    font-family:Arial,sans-serif;
    display:grid;
    place-items:center;
    min-height:100vh;
">

<main style="
    max-width:620px;
    background:#101010;
    border:1px solid rgba(255,255,255,.1);
    padding:32px;
    border-radius:14px;
">

<div style="
    color:${ok ? "#32d74b" : "#ff5148"};
    font-weight:800;
    letter-spacing:.08em;
">
${ok ? "CONNECTED" : "CONNECTION FAILED"}
</div>

<h1>Leakendia Outreach</h1>

<p style="
    color:#a5a5a5;
    line-height:1.6;
">
${safe}
</p>

<p style="color:#6f6f6f">
You can close this tab and return to the Control Center.
</p>

</main>
</body>
</html>`,
        {
            status: ok ? 200 : 400,
            headers: {
                "Content-Type":
                    "text/html; charset=UTF-8"
            }
        }
    );
}

export async function handleGoogleStatus(
    request,
    env
) {
    const auth =
        await adminOr401(request, env);

    if (auth) return auth;

    let configured = true;

    try {
        requiredConfig(env);
    } catch {
        configured = false;
    }

    const connection =
        await getConnection(env).catch(
            () => null
        );

    return json({
        success: true,
        configured,
        connected: Boolean(
            connection?.refresh_token_encrypted
        ),
        sender: clean(
            env.OUTREACH_SENDER_EMAIL ||
                DEFAULT_SENDER,
            320
        ).toLowerCase(),
        connected_at:
            connection?.connected_at || null,
        updated_at:
            connection?.updated_at || null
    });
}

export async function handleGoogleConnect(
    request,
    env
) {
    const auth =
        await adminOr401(request, env);

    if (auth) return auth;

    let cfg;

    try {
        cfg = requiredConfig(env);
    } catch (error) {
        return json(
            {
                success: false,
                error: error.message
            },
            500
        );
    }

    const state = base64Url(
        crypto.getRandomValues(
            new Uint8Array(32)
        )
    );

    const now = new Date();

    const expires = new Date(
        now.getTime() + 10 * 60 * 1000
    ).toISOString();

    await env.DB.prepare(`
        INSERT INTO outreach_oauth_states
        (state, created_at, expires_at)
        VALUES (?, ?, ?)
    `)
        .bind(
            state,
            now.toISOString(),
            expires
        )
        .run();

    await env.DB.prepare(`
        DELETE FROM outreach_oauth_states
        WHERE expires_at < ?
    `)
        .bind(now.toISOString())
        .run();

    const url = new URL(
        GOOGLE_AUTH_URL
    );

    url.searchParams.set(
        "client_id",
        cfg.clientId
    );

    url.searchParams.set(
        "redirect_uri",
        cfg.redirectUri
    );

    url.searchParams.set(
        "response_type",
        "code"
    );

    url.searchParams.set(
        "scope",
        GMAIL_SEND_SCOPE
    );

    url.searchParams.set(
        "access_type",
        "offline"
    );

    url.searchParams.set(
        "include_granted_scopes",
        "true"
    );

    url.searchParams.set(
        "prompt",
        "consent"
    );

    url.searchParams.set(
        "login_hint",
        cfg.sender
    );

    url.searchParams.set(
        "state",
        state
    );

    return json({
        success: true,
        authorization_url:
            url.toString(),
        redirect_uri:
            cfg.redirectUri,
        sender:
            cfg.sender
    });
}

export async function handleGoogleCallback(
    request,
    env
) {
    const url =
        new URL(request.url);

    const state = clean(
        url.searchParams.get("state"),
        500
    );

    const code = clean(
        url.searchParams.get("code"),
        5000
    );

    const oauthError = clean(
        url.searchParams.get("error"),
        500
    );

    if (oauthError) {
        return htmlPage(
            "Google connection failed",
            `Google returned: ${oauthError}`,
            false
        );
    }

    if (!state || !code) {
        return htmlPage(
            "Google connection failed",
            "The OAuth callback was missing its authorization code or state.",
            false
        );
    }

    const stateRow =
        await env.DB.prepare(`
            SELECT *
            FROM outreach_oauth_states
            WHERE state = ?
            LIMIT 1
        `)
            .bind(state)
            .first();

    if (
        !stateRow ||
        new Date(
            stateRow.expires_at
        ).getTime() < Date.now()
    ) {
        return htmlPage(
            "Google connection failed",
            "The authorization request expired or could not be verified. Start Connect Google Workspace again.",
            false
        );
    }

    await env.DB.prepare(`
        DELETE FROM outreach_oauth_states
        WHERE state = ?
    `)
        .bind(state)
        .run();

    try {
        const cfg =
            requiredConfig(env);

        const tokens =
            await tokenRequest({
                client_id:
                    cfg.clientId,
                client_secret:
                    cfg.clientSecret,
                code,
                grant_type:
                    "authorization_code",
                redirect_uri:
                    cfg.redirectUri
            });

        if (!tokens.refresh_token) {
            throw new Error(
                "Google did not return a refresh token. Reconnect and grant consent again."
            );
        }

        const encrypted =
            await encryptToken(
                tokens.refresh_token,
                cfg.encryptionSecret
            );

        const now =
            new Date().toISOString();

        await env.DB.prepare(`
            INSERT INTO outreach_google_connection
            (
                id,
                sender_email,
                refresh_token_encrypted,
                scope,
                connected_at,
                updated_at
            )
            VALUES (
                'primary',
                ?, ?, ?, ?, ?
            )
            ON CONFLICT(id)
            DO UPDATE SET
                sender_email =
                    excluded.sender_email,
                refresh_token_encrypted =
                    excluded.refresh_token_encrypted,
                scope =
                    excluded.scope,
                connected_at =
                    excluded.connected_at,
                updated_at =
                    excluded.updated_at
        `)
            .bind(
                cfg.sender,
                encrypted,
                GMAIL_SEND_SCOPE,
                now,
                now
            )
            .run();

        return htmlPage(
            "Google Workspace connected",
            `${cfg.sender} is now connected to Leakendia Outreach for Gmail sending.`
        );
    } catch (error) {
        return htmlPage(
            "Google connection failed",
            error?.message ||
                "Google authorization could not be completed.",
            false
        );
    }
}

export async function handleGoogleDisconnect(
    request,
    env
) {
    const auth =
        await adminOr401(request, env);

    if (auth) return auth;

    await env.DB.prepare(`
        DELETE FROM outreach_google_connection
        WHERE id = 'primary'
    `).run();

    return json({
        success: true
    });
}


/* =========================================================
   OUTREACH MIME
   ========================================================= */

function encodeHeaderUtf8(value) {
    const input = String(
        value ?? ""
    )
        .replace(/[\r\n]+/g, " ")
        .trim();

    /*
     * Normal ASCII subjects do not need
     * MIME encoded-word syntax.
     */
    if (!/[^\x20-\x7E]/.test(input)) {
        return input;
    }

    const encoded =
        bytesToBase64(
            new TextEncoder().encode(
                input
            )
        );

    return `=?UTF-8?B?${encoded}?=`;
}


/*
 * Encode the body as quoted-printable.
 *
 * This keeps the message strictly text/plain
 * while safely transporting UTF-8 characters.
 */
function quotedPrintableUtf8(value) {
    const normalized =
        String(value ?? "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");

    const encodeLine = line => {
        const bytes =
            new TextEncoder().encode(
                line
            );

        let output = "";
        let lineLength = 0;

        for (
            let i = 0;
            i < bytes.length;
            i++
        ) {
            const byte = bytes[i];

            /*
             * RFC 2045 printable characters.
             * "=" must always be encoded.
             */
            const safe =
                (byte >= 33 &&
                    byte <= 60) ||
                (byte >= 62 &&
                    byte <= 126);

            const token = safe
                ? String.fromCharCode(
                      byte
                  )
                : `=${byte
                      .toString(16)
                      .toUpperCase()
                      .padStart(2, "0")}`;

            /*
             * Keep encoded lines comfortably
             * below the 76-character QP limit.
             */
            if (
                lineLength +
                    token.length >
                72
            ) {
                output += "=\r\n";
                lineLength = 0;
            }

            output += token;
            lineLength +=
                token.length;
        }

        return output;
    };

    return normalized
        .split("\n")
        .map(encodeLine)
        .join("\r\n");
}


/*
 * Build a deliberately simple outreach email.
 *
 * IMPORTANT:
 * - text/plain only
 * - no HTML
 * - no tracking pixel
 * - no automatic links
 * - no automatic signature
 * - no URL rewriting
 *
 * Whatever is typed into Leakendia is the
 * content sent to Gmail.
 */

function escapeOutreachHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


const OUTREACH_LOGO_URL =
    "https://leakendia.com/assets/brand/leakendia-email-mark.jpg";

function brandedOutreachHtml(message) {
    const paragraphs = String(message ?? "")
        .trim()
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map(block => {
            const content = escapeOutreachHtml(block)
                .replace(/\r?\n/g, "<br>");

            return `<p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#dedede;">${content}</p>`;
        })
        .join("");

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Message from Leakendia</title>
</head>

<body style="margin:0;padding:0;background-color:#080808;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#080808" style="background-color:#080808;">
<tr>
<td align="center" style="padding:32px 14px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#111111" style="width:100%;max-width:600px;background-color:#111111;border:1px solid #303030;border-radius:16px;">

<!-- ACTUAL LEAKENDIA LOGO -->
<tr>
<td align="center" style="padding:34px 26px 10px;">
<img
    src="${OUTREACH_LOGO_URL}"
    width="100"
    height="100"
    alt="Leakendia logo"
    style="display:block;width:100px;height:100px;object-fit:contain;border:0;"
/>
</td>
</tr>

<!-- BRAND HEADER -->
<tr>
<td align="center" style="padding:0 24px;">

<div style="font-size:25px;line-height:1.3;font-weight:800;letter-spacing:4px;color:#f5f5f5;">
LEAKENDI<span style="color:#ff3b30;">A</span>
</div>

<div style="font-size:10px;line-height:1.7;letter-spacing:2px;color:#aaaaaa;padding-top:7px;">
CONVERSION LEAK INVESTIGATION
</div>

</td>
</tr>

<!-- RED DIVIDER -->
<tr>
<td style="padding:25px 28px 0;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>
<td width="48%" style="border-top:1px solid #383838;font-size:0;line-height:0;">&nbsp;</td>
<td width="4%" style="border-top:2px solid #ff3b30;font-size:0;line-height:0;">&nbsp;</td>
<td width="48%" style="border-top:1px solid #383838;font-size:0;line-height:0;">&nbsp;</td>
</tr>
</table>

</td>
</tr>

<!-- YOUR EDITABLE MESSAGE -->
<tr>
<td style="padding:32px 28px 12px;font-size:15px;line-height:1.8;color:#dedede;">

${paragraphs}

</td>
</tr>

<!-- FOUNDER SIGNATURE -->
<tr>
<td style="padding:12px 28px 30px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
<tr>

<td width="3" bgcolor="#ff3b30" style="background-color:#ff3b30;font-size:0;">&nbsp;</td>

<td style="padding-left:16px;">

<div style="font-size:17px;font-weight:700;line-height:1.5;color:#ffffff;">
Precious
</div>

<div style="font-size:13px;line-height:1.7;color:#b8b8b8;">
Founder, Leakendia
</div>

<a href="https://leakendia.com/" style="font-size:13px;line-height:1.9;color:#ff6259;text-decoration:underline;">
leakendia.com
</a>

</td>
</tr>
</table>

</td>
</tr>

<!-- BRAND FOOTER -->
<tr>
<td style="border-top:1px solid #303030;padding:21px 28px 25px;">

<div style="font-size:11px;line-height:1.8;letter-spacing:1.2px;font-weight:700;color:#b8b8b8;">
LEAKENDIA <span style="color:#ff3b30;">/</span> WHERE CONVERSION LEAKS END
</div>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>`;
}

function brandedOutreachText(message) {
    return [
        String(message ?? "").trim(),
        "",
        "Precious",
        "Founder, Leakendia",
        "https://leakendia.com/",
        "",
        "LEAKENDIA / WHERE CONVERSION LEAKS END"
    ].join("\n");
}

function mimeMessage({ from, to, subject, text, mode = "plain" }) {
    const safeFrom = String(from).replace(/[\r\n]+/g, " ").trim();
    const safeTo = String(to).replace(/[\r\n]+/g, " ").trim();
    const safeSubject = encodeHeaderUtf8(subject);

    const headers = [
        `From: Precious <${safeFrom}>`,
        `To: ${safeTo}`,
        `Subject: ${safeSubject}`,
        `Date: ${new Date().toUTCString()}`,
        "MIME-Version: 1.0"
    ];

    if (mode !== "signature") {
        return [
            ...headers,
            'Content-Type: text/plain; charset="UTF-8"',
            "Content-Transfer-Encoding: quoted-printable",
            "",
            quotedPrintableUtf8(text)
        ].join("\r\n");
    }

    const boundary = `leakendia_${crypto.randomUUID().replace(/-/g, "")}`;

    return [
        ...headers,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: quoted-printable",
        "",
        quotedPrintableUtf8(brandedOutreachText(text)),
        "",
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: quoted-printable",
        "",
        quotedPrintableUtf8(brandedOutreachHtml(text)),
        "",
        `--${boundary}--`,
        ""
    ].join("\r\n");
}


/* =========================================================
   GMAIL SEND
   ========================================================= */

export async function sendGoogleOutreachEmail(
    env,
    { to, subject, text, mode = "plain" }
) {
    const cfg = requiredConfig(env);
    const token = await accessToken(env);

    const message = mimeMessage({
        from: cfg.sender,
        to,
        subject,
        text,
        mode
    });

    // Keep the existing const raw = ... and all remaining code below.

    const raw =
        base64Url(
            new TextEncoder().encode(
                message
            )
        );

    const response =
        await fetch(
            GMAIL_SEND_URL,
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${token}`,

                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    raw
                })
            }
        );

    const data =
        await response
            .json()
            .catch(() => ({}));

    if (
        !response.ok ||
        !data.id
    ) {
        throw new Error(
            data?.error?.message ||
                `Gmail send failed (${response.status}).`
        );
    }

    return {
        id: data.id,
        threadId:
            data.threadId || null,
        sender:
            cfg.sender
    };
}