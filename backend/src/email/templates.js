function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getFirstName(value) {
    const cleaned = String(value ?? "").trim().replace(/\s+/g, " ");
    return cleaned ? cleaned.split(" ")[0] : "";
}

export function clientReplyEmailTemplate({ name = "", portalUrl, logoUrl }) {
    const clientFirstName = getFirstName(name);
    const safeName = escapeHtml(clientFirstName);
    const safePortalUrl = escapeHtml(portalUrl);
    const safeLogoUrl = escapeHtml(logoUrl);
    const greeting = safeName ? `Hi ${safeName},` : "Hello,";
    const preheader = "Precious left a new response inside your private Leakendia workspace.";

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Your Leakendia investigation has an update</title>
<style>
@media only screen and (max-width:620px){
.email-shell{width:100%!important}.email-pad{padding-left:22px!important;padding-right:22px!important}
.hero-title{font-size:36px!important;line-height:1.04!important;letter-spacing:-1.2px!important}
.logo-image{width:82px!important;height:82px!important}.brand-name{font-size:19px!important;letter-spacing:6px!important}
.status-cell{display:block!important;width:100%!important;text-align:left!important;padding-top:14px!important}.cta-link{display:block!important;text-align:center!important}}
@media (prefers-color-scheme:dark){body,.body-table{background:#080808!important}.email-shell{background:#101010!important}}
</style>
</head>
<body style="margin:0;padding:0;background:#080808;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;font-size:1px;color:#080808;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}&#847;&zwnj;&nbsp;&#8199;&#65279;&#847;&zwnj;&nbsp;&#8199;&#65279;</div>
<table class="body-table" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#080808" style="width:100%;margin:0;padding:0;background:#080808;">
<tr><td align="center" style="padding:36px 14px;">
<table class="email-shell" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" bgcolor="#101010" style="width:600px;max-width:600px;background:#101010;border:1px solid #292929;border-radius:24px;overflow:hidden;">
<tr><td height="3" bgcolor="#ff3b30" style="height:3px;background:#ff3b30;font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td class="email-pad" align="center" style="padding:38px 42px 24px;">
<img class="logo-image" src="${safeLogoUrl}" width="96" height="96" alt="Leakendia" style="display:block;width:96px;height:96px;border:0;outline:none;text-decoration:none;border-radius:20px;">
<div class="brand-name" style="margin-top:18px;color:#f5f5f5;font-size:21px;line-height:1.2;font-weight:700;letter-spacing:8px;text-transform:uppercase;">LEAKENDIA</div>
<div style="margin-top:8px;color:#6f6f6f;font-size:10px;line-height:1.5;font-weight:700;letter-spacing:2.1px;text-transform:uppercase;">Find the leak. Fix what’s costing you.</div>
</td></tr>
<tr><td class="email-pad" style="padding:6px 42px 0;"><table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td style="border:1px solid #ff3b30;border-radius:999px;padding:8px 13px;color:#ff5148;font-size:10px;line-height:1;font-weight:800;letter-spacing:2px;text-transform:uppercase;">PRIVATE UPDATE</td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:24px 42px 10px;"><h1 class="hero-title" style="margin:0;color:#f5f5f5;font-size:46px;line-height:1.02;font-weight:800;letter-spacing:-2px;">Your investigation<br><span style="color:#ff5148;">just moved forward.</span></h1></td></tr>
<tr><td class="email-pad" style="padding:22px 42px 8px;">
<p style="margin:0 0 18px;color:#f5f5f5;font-size:18px;line-height:1.6;font-weight:700;">${greeting}</p>
<p style="margin:0 0 15px;color:#a5a5a5;font-size:16px;line-height:1.75;">I’ve reviewed your investigation and left a new response for you.</p>
<p style="margin:0;color:#a5a5a5;font-size:16px;line-height:1.75;">Rather than putting potentially sensitive business details inside an email, your full response is waiting securely inside your private Leakendia workspace.</p>
</td></tr>
<tr><td class="email-pad" style="padding:26px 42px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#151515" style="width:100%;background:#151515;border:1px solid #2a2a2a;border-radius:16px;"><tr><td style="padding:20px 20px 18px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
<td valign="top" style="color:#6f6f6f;font-size:10px;line-height:1.4;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">INVESTIGATION<div style="margin-top:7px;color:#f5f5f5;font-size:15px;line-height:1.45;font-weight:700;letter-spacing:0;text-transform:none;">Leak Hunt Investigation</div><div style="margin-top:5px;color:#a5a5a5;font-size:12px;line-height:1.5;font-weight:400;letter-spacing:0;text-transform:none;">New response from Precious</div></td>
<td class="status-cell" align="right" valign="top" style="white-space:nowrap;"><span style="display:inline-block;padding:7px 10px;border-radius:999px;background:#241311;color:#ff5148;font-size:10px;line-height:1;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;">● NEW</span></td>
</tr></table></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:24px 42px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td bgcolor="#ff3b30" align="center" style="background:#ff3b30;border-radius:12px;"><a class="cta-link" href="${safePortalUrl}" target="_blank" style="display:block;padding:17px 22px;color:#ffffff;text-decoration:none;font-size:14px;line-height:1.2;font-weight:800;letter-spacing:.5px;">OPEN YOUR INVESTIGATION&nbsp;&nbsp;→</a></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:28px 42px 0;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="border-top:1px solid #252525;padding-top:22px;"><div style="color:#f5f5f5;font-size:10px;line-height:1.4;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;">PRIVATE BY DESIGN</div><p style="margin:8px 0 0;color:#6f6f6f;font-size:12px;line-height:1.7;">Your investigation details, private response and portal credentials are never exposed in this notification email.</p></td></tr></table></td></tr>
<tr><td class="email-pad" style="padding:28px 42px 34px;"><p style="margin:0;color:#a5a5a5;font-size:13px;line-height:1.7;">Until the next leak,<br><strong style="color:#f5f5f5;">Precious</strong><br><span style="color:#6f6f6f;">Leakendia</span></p></td></tr>
<tr><td class="email-pad" bgcolor="#0c0c0c" style="padding:24px 42px;background:#0c0c0c;border-top:1px solid #202020;"><div style="color:#6f6f6f;font-size:10px;line-height:1.7;"><strong style="color:#a5a5a5;letter-spacing:1.5px;">LEAKENDIA</strong><br>Find where growth is leaking. Fix what deserves fixing.</div><div style="padding-top:12px;color:#555555;font-size:9px;line-height:1.6;">You received this transactional notification because a Leakendia investigation was opened using this email address.</div></td></tr>
</table>
<div style="max-width:600px;margin:16px auto 0;color:#444444;font-size:9px;line-height:1.5;text-align:center;">Private client communication · Leakendia</div>
</td></tr></table>
</body></html>`;

    const text = [
        "LEAKENDIA", "PRIVATE UPDATE", "", "Your investigation just moved forward.", "",
        clientFirstName ? `Hi ${clientFirstName},` : "Hello,", "",
        "I've left a new response for you.", "",
     "",
        "INVESTIGATION", "Leak Hunt Investigation", "New response from Precious", "",
        `Open your investigation: ${portalUrl}`, "", "PRIVATE BY DESIGN",
        "Your investigation details, private response and portal credentials are never exposed in this notification email.", "",
        "Until the next leak,", "Precious", "Leakendia", "", "Find where growth is leaking. Fix what deserves fixing."
    ].join("\n");

    return { html, text };
}
