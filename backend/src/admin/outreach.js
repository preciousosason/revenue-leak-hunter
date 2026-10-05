import { json } from "../utils/response.js";
import { authenticateAdmin } from "../utils/auth.js";
import { createId } from "../utils/ids.js";

const DEFAULT_INTERVALS = [3, 4, 5, 7, 10];
const STOP_STATUSES = new Set(["replied", "interested", "qualified", "converted", "not_interested", "do_not_contact"]);
const CAMPAIGN_STATES = new Set(["draft", "active", "paused", "completed", "archived"]);
const PROSPECT_STATES = new Set(["scheduled", "contacted", "replied", "interested", "qualified", "converted", "not_interested", "no_response", "do_not_contact"]);

function clean(value, max = 5000) { return String(value ?? "").trim().slice(0, max); }
function email(value) { return clean(value, 320).toLowerCase(); }
function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function isoNow() { return new Date().toISOString(); }
function dateOnly(value = new Date()) { return new Date(value).toISOString().slice(0, 10); }
function addDays(date, days) { const d = new Date(`${dateOnly(date)}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + Number(days || 0)); return d.toISOString().slice(0, 10); }
function parseIntervals(value) {
    let input = value;
    if (typeof value === "string") { try { input = JSON.parse(value); } catch { input = null; } }
    if (!Array.isArray(input) || input.length !== 5) return [...DEFAULT_INTERVALS];
    const out = input.map(v => Math.max(1, Math.min(30, Number.parseInt(v, 10) || 1)));
    return out;
}
function rowCampaign(row) { return { ...row, followup_intervals: parseIntervals(row.followup_intervals) }; }
async function adminOr401(request, env) {
    const admin = await authenticateAdmin(request, env);
    return admin ? null : json({ success: false, error: "Admin authentication required." }, 401);
}
async function body(request) { try { return await request.json(); } catch { return null; } }

async function mxLookup(domain) {
    try {
        const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, { headers: { Accept: "application/dns-json" } });
        if (!r.ok) return { ok: false, reason: "Mail-server lookup failed." };
        const data = await r.json();
        const answers = Array.isArray(data.Answer) ? data.Answer.filter(a => a.type === 15 && clean(a.data)) : [];
        return answers.length ? { ok: true, mx: answers.map(a => a.data) } : { ok: false, reason: "No usable MX mail server was found for this domain." };
    } catch { return { ok: false, reason: "Mail-server lookup could not be completed." }; }
}

export async function validateOutreachEmailAddress(env, rawEmail) {
    const address = email(rawEmail);
    if (!isEmail(address)) return { email: address, status: "invalid", label: "INVALID", reason: "Email format is invalid.", can_outreach: false };
    const domain = address.split("@")[1];
    const suppressed = await env.DB.prepare(`SELECT reason, created_at FROM outreach_suppressions WHERE email = ? LIMIT 1`).bind(address).first();
    if (suppressed) return { email: address, status: "suppressed", label: "DO NOT CONTACT", reason: suppressed.reason || "This address is suppressed.", can_outreach: false };
    const mx = await mxLookup(domain);
    if (!mx.ok) return { email: address, status: "not_receivable", label: "NOT RECEIVABLE", reason: mx.reason, can_outreach: false };
    return { email: address, status: "mail_ready", label: "MAIL READY", reason: "Valid format and working domain mail infrastructure found. Exact mailbox existence is confirmed only by real delivery.", can_outreach: true, mx_count: mx.mx.length };
}

async function dashboard(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const today = dateOnly();
    const [campaigns, prospects, due, activity] = await Promise.all([
        env.DB.prepare(`SELECT status, COUNT(*) count FROM outreach_campaigns GROUP BY status`).all(),
        env.DB.prepare(`SELECT status, COUNT(*) count FROM outreach_prospects GROUP BY status`).all(),
        env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE c.status='active' AND p.research_ready=1 AND p.email_health='mail_ready' AND p.sequence_complete=0 AND p.status NOT IN ('replied','interested','qualified','converted','not_interested','do_not_contact') AND ((p.last_sent_at IS NULL AND p.initial_due_date <= ?) OR (p.last_sent_at IS NOT NULL AND p.next_followup_date IS NOT NULL AND p.next_followup_date <= ?))`).bind(today, today).first(),
        env.DB.prepare(`SELECT e.*, p.name prospect_name, p.email prospect_email, c.name campaign_name FROM outreach_events e LEFT JOIN outreach_prospects p ON p.id=e.prospect_id LEFT JOIN outreach_campaigns c ON c.id=e.campaign_id ORDER BY e.created_at DESC LIMIT 20`).all()
    ]);
    const map = rows => Object.fromEntries((rows.results || []).map(r => [r.status, Number(r.count)]));
    return json({ success: true, summary: { campaigns: map(campaigns), prospects: map(prospects), due_today: Number(due?.count || 0) }, activity: activity.results || [] });
}

async function listCampaigns(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const rows = await env.DB.prepare(`SELECT c.*, COUNT(p.id) prospect_count, SUM(CASE WHEN p.last_sent_at IS NOT NULL THEN 1 ELSE 0 END) contacted_count, SUM(CASE WHEN p.status IN ('replied','interested','qualified','converted') THEN 1 ELSE 0 END) reply_count, SUM(CASE WHEN p.status='converted' THEN 1 ELSE 0 END) converted_count FROM outreach_campaigns c LEFT JOIN outreach_prospects p ON p.campaign_id=c.id GROUP BY c.id ORDER BY c.created_at DESC`).all();
    return json({ success: true, campaigns: (rows.results || []).map(rowCampaign) });
}

async function createCampaign(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const data = await body(request); if (!data) return json({ success:false,error:"Invalid JSON request."},400);
    const name = clean(data.name, 160); if (!name) return json({success:false,error:"Campaign name is required."},400);
    const daily = Math.max(1, Math.min(50, Number.parseInt(data.daily_limit,10)||15));
    const max = Math.max(1, Math.min(500, Number.parseInt(data.max_prospects,10)||60));
    const start = /^\d{4}-\d{2}-\d{2}$/.test(clean(data.start_date,10)) ? clean(data.start_date,10) : dateOnly();
    const intervals = parseIntervals(data.followup_intervals);
    const id = createId(), now = isoNow();
    await env.DB.prepare(`INSERT INTO outreach_campaigns (id,name,description,status,start_date,daily_limit,max_prospects,followup_intervals,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(id,name,clean(data.description,1000),data.status==="draft"?"draft":"active",start,daily,max,JSON.stringify(intervals),now,now).run();
    await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,type,detail,created_at) VALUES (?,?,?,?,?)`).bind(createId(),id,"campaign_created",name,now).run();
    return json({success:true,campaign_id:id},201);
}

async function getCampaign(request, env, id) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const campaign = await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=?`).bind(id).first();
    if (!campaign) return json({success:false,error:"Campaign not found."},404);
    const prospects = await env.DB.prepare(`SELECT * FROM outreach_prospects WHERE campaign_id=? ORDER BY sequence_no`).bind(id).all();
    return json({success:true,campaign:rowCampaign(campaign),prospects:prospects.results||[]});
}

async function patchCampaign(request, env, id) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const data = await body(request); if (!data) return json({success:false,error:"Invalid JSON request."},400);
    const current = await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=?`).bind(id).first(); if (!current) return json({success:false,error:"Campaign not found."},404);
    const status = CAMPAIGN_STATES.has(data.status) ? data.status : current.status;
    const name = data.name !== undefined ? clean(data.name,160) : current.name;
    const daily = data.daily_limit !== undefined ? Math.max(1,Math.min(50,parseInt(data.daily_limit,10)||15)) : current.daily_limit;
    const max = data.max_prospects !== undefined ? Math.max(1,Math.min(500,parseInt(data.max_prospects,10)||60)) : current.max_prospects;
    const intervals = data.followup_intervals !== undefined ? parseIntervals(data.followup_intervals) : parseIntervals(current.followup_intervals);
    await env.DB.prepare(`UPDATE outreach_campaigns SET name=?,description=?,status=?,daily_limit=?,max_prospects=?,followup_intervals=?,updated_at=? WHERE id=?`).bind(name,data.description!==undefined?clean(data.description,1000):current.description,status,daily,max,JSON.stringify(intervals),isoNow(),id).run();
    return json({success:true});
}

async function validateEmail(request, env) { const auth=await adminOr401(request,env); if(auth)return auth; const data=await body(request); if(!data)return json({success:false,error:"Invalid JSON request."},400); return json({success:true,validation:await validateOutreachEmailAddress(env,data.email)}); }

async function addProspect(request, env) {
    const auth=await adminOr401(request,env); if(auth)return auth; const data=await body(request); if(!data)return json({success:false,error:"Invalid JSON request."},400);
    const campaign=await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=?`).bind(clean(data.campaign_id,80)).first(); if(!campaign)return json({success:false,error:"Campaign not found."},404);
    const count=await env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects WHERE campaign_id=?`).bind(campaign.id).first(); const sequence=Number(count?.count||0)+1;
    if(sequence>Number(campaign.max_prospects))return json({success:false,error:`This campaign is limited to ${campaign.max_prospects} prospects.`},400);
    const address=email(data.email); const validation=await validateOutreachEmailAddress(env,address); if(!validation.can_outreach)return json({success:false,error:validation.reason,validation},400);
    const duplicate=await env.DB.prepare(`SELECT id,campaign_id FROM outreach_prospects WHERE email=? LIMIT 1`).bind(address).first(); if(duplicate)return json({success:false,error:"This email already exists in Outreach.",duplicate},409);
    const dayOffset=Math.floor((sequence-1)/Number(campaign.daily_limit)); const due=addDays(campaign.start_date,dayOffset); const now=isoNow(), id=createId();
    await env.DB.prepare(`INSERT INTO outreach_prospects (id,campaign_id,sequence_no,name,email,website,company,role,observation,notes,email_health,email_health_reason,email_checked_at,research_ready,status,initial_due_date,followup_step,sequence_complete,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,campaign.id,sequence,clean(data.name,160),address,clean(data.website,500),clean(data.company,160),clean(data.role,160),clean(data.observation,3000),clean(data.notes,5000),validation.status,validation.reason,now,data.research_ready?1:0,"scheduled",due,0,0,now,now).run();
    await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),campaign.id,id,"prospect_added",address,now).run();
    return json({success:true,prospect_id:id,validation,initial_due_date:due},201);
}

async function getProspect(request,env,id){const auth=await adminOr401(request,env);if(auth)return auth;const p=await env.DB.prepare(`SELECT p.*,c.name campaign_name,c.followup_intervals FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.id=?`).bind(id).first();if(!p)return json({success:false,error:"Prospect not found."},404);const [messages,events]=await Promise.all([env.DB.prepare(`SELECT * FROM outreach_messages WHERE prospect_id=? ORDER BY created_at`).bind(id).all(),env.DB.prepare(`SELECT * FROM outreach_events WHERE prospect_id=? ORDER BY created_at DESC`).bind(id).all()]);return json({success:true,prospect:p,messages:messages.results||[],events:events.results||[]});}

async function patchProspect(request,env,id){const auth=await adminOr401(request,env);if(auth)return auth;const data=await body(request);if(!data)return json({success:false,error:"Invalid JSON request."},400);const p=await env.DB.prepare(`SELECT * FROM outreach_prospects WHERE id=?`).bind(id).first();if(!p)return json({success:false,error:"Prospect not found."},404);let status=PROSPECT_STATES.has(data.status)?data.status:p.status;const now=isoNow();let complete=STOP_STATUSES.has(status)?1:p.sequence_complete;let next=STOP_STATUSES.has(status)?null:p.next_followup_date;
    if(status==="do_not_contact"){await env.DB.prepare(`INSERT OR REPLACE INTO outreach_suppressions (email,reason,source,created_at) VALUES (?,?,?,?)`).bind(p.email,clean(data.suppression_reason,500)||"Marked Do Not Contact","admin",now).run();}
    await env.DB.prepare(`UPDATE outreach_prospects SET name=?,website=?,company=?,role=?,observation=?,notes=?,research_ready=?,status=?,sequence_complete=?,next_followup_date=?,updated_at=? WHERE id=?`).bind(data.name!==undefined?clean(data.name,160):p.name,data.website!==undefined?clean(data.website,500):p.website,data.company!==undefined?clean(data.company,160):p.company,data.role!==undefined?clean(data.role,160):p.role,data.observation!==undefined?clean(data.observation,3000):p.observation,data.notes!==undefined?clean(data.notes,5000):p.notes,data.research_ready!==undefined?(data.research_ready?1:0):p.research_ready,status,complete,next,now,id).run();
    if(status!==p.status)await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),p.campaign_id,id,"status_changed",`${p.status} → ${status}`,now).run(); return json({success:true});}

async function dueToday(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const today=dateOnly();const rows=await env.DB.prepare(`SELECT p.*,c.name campaign_name FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE c.status='active' AND p.research_ready=1 AND p.email_health='mail_ready' AND p.sequence_complete=0 AND p.status NOT IN ('replied','interested','qualified','converted','not_interested','do_not_contact') AND ((p.last_sent_at IS NULL AND p.initial_due_date<=?) OR (p.last_sent_at IS NOT NULL AND p.next_followup_date IS NOT NULL AND p.next_followup_date<=?)) ORDER BY COALESCE(p.next_followup_date,p.initial_due_date),c.created_at,p.sequence_no`).bind(today,today).all();return json({success:true,date:today,prospects:rows.results||[]});}

async function recordMessage(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const data=await body(request);if(!data)return json({success:false,error:"Invalid JSON request."},400);const p=await env.DB.prepare(`SELECT p.*,c.followup_intervals FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.id=?`).bind(clean(data.prospect_id,80)).first();if(!p)return json({success:false,error:"Prospect not found."},404);if(STOP_STATUSES.has(p.status)||p.sequence_complete)return json({success:false,error:"This outreach sequence is stopped or complete."},400);const step=p.last_sent_at===null?0:Number(p.followup_step)+1;if(step>5)return json({success:false,error:"Maximum of five follow-ups reached."},400);const subject=clean(data.subject,300),message=clean(data.message,20000);if(!subject||!message)return json({success:false,error:"Subject and message are required."},400);const now=isoNow();const intervals=parseIntervals(p.followup_intervals);const complete=step===5?1:0;const next=complete?null:addDays(now,intervals[step]);const type=step===0?"initial":`followup_${step}`;
    await env.DB.prepare(`INSERT INTO outreach_messages (id,campaign_id,prospect_id,sequence_step,type,subject,body,status,created_at,sent_at) VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(createId(),p.campaign_id,p.id,step,type,subject,message,"recorded",now,now).run();
    await env.DB.prepare(`UPDATE outreach_prospects SET status=CASE WHEN status='scheduled' THEN 'contacted' ELSE status END,last_sent_at=?,followup_step=?,next_followup_date=?,sequence_complete=?,updated_at=? WHERE id=?`).bind(now,step,next,complete,now,p.id).run();
    await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),p.campaign_id,p.id,"message_recorded",type,now).run();return json({success:true,sequence_step:step,next_followup_date:next,sequence_complete:!!complete});}

async function listTemplates(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const rows=await env.DB.prepare(`SELECT * FROM outreach_templates ORDER BY sequence_step`).all();return json({success:true,templates:rows.results||[]});}
async function saveTemplate(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const data=await body(request);if(!data)return json({success:false,error:"Invalid JSON request."},400);const step=Math.max(0,Math.min(5,parseInt(data.sequence_step,10)||0));const existing=await env.DB.prepare(`SELECT id FROM outreach_templates WHERE sequence_step=? LIMIT 1`).bind(step).first();const id=existing?.id||createId(),now=isoNow();if(existing)await env.DB.prepare(`UPDATE outreach_templates SET name=?,subject=?,body=?,updated_at=? WHERE id=?`).bind(clean(data.name,120),clean(data.subject,300),clean(data.body,20000),now,id).run();else await env.DB.prepare(`INSERT INTO outreach_templates (id,sequence_step,name,subject,body,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`).bind(id,step,clean(data.name,120)||`Step ${step}`,clean(data.subject,300),clean(data.body,20000),now,now).run();return json({success:true,id});}

export async function handleAdminOutreachRoutes(request,env){const url=new URL(request.url),p=url.pathname,m=request.method;
    if(p==="/api/admin/outreach/dashboard"&&m==="GET")return dashboard(request,env);
    if(p==="/api/admin/outreach/campaigns"&&m==="GET")return listCampaigns(request,env);
    if(p==="/api/admin/outreach/campaigns"&&m==="POST")return createCampaign(request,env);
    if(p.startsWith("/api/admin/outreach/campaigns/")&&(m==="GET"||m==="PATCH")){const id=p.split("/").pop();return m==="GET"?getCampaign(request,env,id):patchCampaign(request,env,id);}
    if(p==="/api/admin/outreach/validate-email"&&m==="POST")return validateEmail(request,env);
    if(p==="/api/admin/outreach/prospects"&&m==="POST")return addProspect(request,env);
    if(p.startsWith("/api/admin/outreach/prospects/")&&(m==="GET"||m==="PATCH")){const id=p.split("/").pop();return m==="GET"?getProspect(request,env,id):patchProspect(request,env,id);}
    if(p==="/api/admin/outreach/due"&&m==="GET")return dueToday(request,env);
    if(p==="/api/admin/outreach/messages"&&m==="POST")return recordMessage(request,env);
    if(p==="/api/admin/outreach/templates"&&m==="GET")return listTemplates(request,env);
    if(p==="/api/admin/outreach/templates"&&m==="POST")return saveTemplate(request,env);
    return null;
}
