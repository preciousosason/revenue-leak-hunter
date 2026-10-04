function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function clientReplyEmailTemplate({ name = "", portalUrl }) {
    const safeName = escapeHtml(name.trim());
    const safePortalUrl = escapeHtml(portalUrl);
    const greeting = safeName ? `Hi ${safeName},` : "Hello,";

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>New reply from Leakendia</title></head>
<body style="margin:0;padding:0;background:#080808;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#080808;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#101010;border:1px solid rgba(255,255,255,.10);border-radius:18px;overflow:hidden;"><tr><td style="padding:32px;">
<div style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#ff3b30;margin-bottom:20px;">LEAKENDIA</div>
<h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#f5f5f5;">You have a new reply.</h1>
<p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#a5a5a5;">${greeting}</p>
<p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#a5a5a5;">Precious has replied to your Leakendia investigation.</p>
<p style="margin:0 0 26px;font-size:16px;line-height:1.7;color:#a5a5a5;">Your conversation has been updated in your private client portal.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#ff3b30" style="border-radius:10px;"><a href="${safePortalUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">View Private Portal</a></td></tr></table>
<p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6f6f6f;">For privacy, the reply and investigation details are kept inside your client portal. This email does not contain your portal access token.</p>
</td></tr></table></td></tr></table></body></html>`;

    const text = [
        "LEAKENDIA", "", "You have a new reply.", "",
        name.trim() ? `Hi ${name.trim()},` : "Hello,", "",
        "Precious has replied to your Leakendia investigation.",
        "Your conversation has been updated in your private client portal.", "",
        `Open your private portal: ${portalUrl}`, "",
        "For privacy, the reply and investigation details are kept inside your client portal. This email does not contain your portal access token."
    ].join("\n");

    return { html, text };
}
