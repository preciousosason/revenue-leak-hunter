import { json } from "../utils/response.js";
import { authenticateAdmin } from "../utils/auth.js";
import { createId } from "../utils/ids.js";
import {
    handleGoogleStatus,
    handleGoogleConnect,
    handleGoogleCallback,
    handleGoogleDisconnect,
    sendGoogleOutreachEmail
} from "./google-workspace.js";

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
        env.DB.prepare(`SELECT status, COUNT(*) count FROM outreach_campaigns WHERE deleted_at IS NULL GROUP BY status`).all(),
        env.DB.prepare(`SELECT status, COUNT(*) count FROM outreach_prospects WHERE deleted_at IS NULL GROUP BY status`).all(),
        env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE c.deleted_at IS NULL AND p.deleted_at IS NULL AND c.status='active' AND c.deleted_at IS NULL AND p.deleted_at IS NULL AND p.research_ready=1 AND p.email_health='mail_ready' AND p.sequence_complete=0 AND p.status NOT IN ('replied','interested','qualified','converted','not_interested','do_not_contact') AND ((p.last_sent_at IS NULL AND p.initial_due_date <= ?) OR (p.last_sent_at IS NOT NULL AND p.next_followup_date IS NOT NULL AND p.next_followup_date <= ?))`).bind(today, today).first(),
        env.DB.prepare(`SELECT e.*, p.name prospect_name, p.email prospect_email, c.name campaign_name FROM outreach_events e LEFT JOIN outreach_prospects p ON p.id=e.prospect_id LEFT JOIN outreach_campaigns c ON c.id=e.campaign_id ORDER BY e.created_at DESC LIMIT 20`).all()
    ]);
    const map = rows => Object.fromEntries((rows.results || []).map(r => [r.status, Number(r.count)]));
    return json({ success: true, summary: { campaigns: map(campaigns), prospects: map(prospects), due_today: Number(due?.count || 0) }, activity: activity.results || [] });
}

async function listCampaigns(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const rows = await env.DB.prepare(`SELECT c.*, COUNT(p.id) prospect_count, SUM(CASE WHEN p.last_sent_at IS NOT NULL THEN 1 ELSE 0 END) contacted_count, SUM(CASE WHEN p.status IN ('replied','interested','qualified','converted') THEN 1 ELSE 0 END) reply_count, SUM(CASE WHEN p.status='converted' THEN 1 ELSE 0 END) converted_count FROM outreach_campaigns c LEFT JOIN outreach_prospects p ON p.campaign_id=c.id AND p.deleted_at IS NULL WHERE c.deleted_at IS NULL GROUP BY c.id ORDER BY c.created_at DESC`).all();
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
    const campaign = await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=? AND deleted_at IS NULL`).bind(id).first();
    if (!campaign) return json({success:false,error:"Campaign not found."},404);
    const prospects = await env.DB.prepare(`SELECT * FROM outreach_prospects WHERE campaign_id=? AND deleted_at IS NULL AND deleted_at IS NULL ORDER BY sequence_no`).bind(id).all();
    return json({success:true,campaign:rowCampaign(campaign),prospects:prospects.results||[]});
}

async function patchCampaign(request, env, id) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const data = await body(request); if (!data) return json({success:false,error:"Invalid JSON request."},400);
    const current = await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=? AND deleted_at IS NULL`).bind(id).first(); if (!current) return json({success:false,error:"Campaign not found."},404);
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
    const campaign=await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=? AND deleted_at IS NULL`).bind(clean(data.campaign_id,80)).first(); if(!campaign)return json({success:false,error:"Campaign not found."},404);
    const count=await env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects WHERE campaign_id=? AND deleted_at IS NULL`).bind(campaign.id).first(); const sequence=Number(count?.count||0)+1;
    if(sequence>Number(campaign.max_prospects))return json({success:false,error:`This campaign is limited to ${campaign.max_prospects} prospects.`},400);
    const address=email(data.email); const validation=await validateOutreachEmailAddress(env,address); if(!validation.can_outreach)return json({success:false,error:validation.reason,validation},400);
    const duplicate=await env.DB.prepare(`SELECT id,campaign_id FROM outreach_prospects WHERE email=? LIMIT 1`).bind(address).first(); if(duplicate)return json({success:false,error:"This email already exists in Outreach.",duplicate},409);
    const dayOffset=Math.floor((sequence-1)/Number(campaign.daily_limit)); const due=addDays(campaign.start_date,dayOffset); const now=isoNow(), id=createId();
    await env.DB.prepare(`INSERT INTO outreach_prospects (id,campaign_id,sequence_no,name,email,website,company,role,observation,notes,email_health,email_health_reason,email_checked_at,research_ready,status,initial_due_date,followup_step,sequence_complete,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,campaign.id,sequence,clean(data.name,160),address,clean(data.website,500),clean(data.company,160),clean(data.role,160),clean(data.observation,3000),clean(data.notes,5000),validation.status,validation.reason,now,data.research_ready?1:0,"scheduled",due,0,0,now,now).run();
    await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),campaign.id,id,"prospect_added",address,now).run();
    return json({success:true,prospect_id:id,validation,initial_due_date:due},201);
}

async function getProspect(request,env,id){const auth=await adminOr401(request,env);if(auth)return auth;const p=await env.DB.prepare(`SELECT p.*,c.name campaign_name,c.followup_intervals FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.id=? AND p.deleted_at IS NULL AND c.deleted_at IS NULL AND p.deleted_at IS NULL AND c.deleted_at IS NULL`).bind(id).first();if(!p)return json({success:false,error:"Prospect not found."},404);const [messages,events]=await Promise.all([env.DB.prepare(`SELECT * FROM outreach_messages WHERE prospect_id=? ORDER BY created_at`).bind(id).all(),env.DB.prepare(`SELECT * FROM outreach_events WHERE prospect_id=? ORDER BY created_at DESC`).bind(id).all()]);return json({success:true,prospect:p,messages:messages.results||[],events:events.results||[]});}

async function patchProspect(request,env,id){const auth=await adminOr401(request,env);if(auth)return auth;const data=await body(request);if(!data)return json({success:false,error:"Invalid JSON request."},400);const p=await env.DB.prepare(`SELECT * FROM outreach_prospects WHERE id=? AND deleted_at IS NULL`).bind(id).first();if(!p)return json({success:false,error:"Prospect not found."},404);let status=PROSPECT_STATES.has(data.status)?data.status:p.status;const now=isoNow();let complete=STOP_STATUSES.has(status)?1:p.sequence_complete;let next=STOP_STATUSES.has(status)?null:p.next_followup_date;
    if(status==="do_not_contact"){await env.DB.prepare(`INSERT OR REPLACE INTO outreach_suppressions (email,reason,source,created_at) VALUES (?,?,?,?)`).bind(p.email,clean(data.suppression_reason,500)||"Marked Do Not Contact","admin",now).run();}
    await env.DB.prepare(`UPDATE outreach_prospects SET name=?,website=?,company=?,role=?,observation=?,notes=?,research_ready=?,status=?,sequence_complete=?,next_followup_date=?,updated_at=? WHERE id=?`).bind(data.name!==undefined?clean(data.name,160):p.name,data.website!==undefined?clean(data.website,500):p.website,data.company!==undefined?clean(data.company,160):p.company,data.role!==undefined?clean(data.role,160):p.role,data.observation!==undefined?clean(data.observation,3000):p.observation,data.notes!==undefined?clean(data.notes,5000):p.notes,data.research_ready!==undefined?(data.research_ready?1:0):p.research_ready,status,complete,next,now,id).run();
    if(status!==p.status)await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),p.campaign_id,id,"status_changed",`${p.status} → ${status}`,now).run(); return json({success:true});}

async function dueToday(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const today=dateOnly();const rows=await env.DB.prepare(`SELECT p.*,c.name campaign_name FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE c.deleted_at IS NULL AND p.deleted_at IS NULL AND c.status='active' AND c.deleted_at IS NULL AND p.deleted_at IS NULL AND p.research_ready=1 AND p.email_health='mail_ready' AND p.sequence_complete=0 AND p.status NOT IN ('replied','interested','qualified','converted','not_interested','do_not_contact') AND ((p.last_sent_at IS NULL AND p.initial_due_date<=?) OR (p.last_sent_at IS NOT NULL AND p.next_followup_date IS NOT NULL AND p.next_followup_date<=?)) ORDER BY COALESCE(p.next_followup_date,p.initial_due_date),c.created_at,p.sequence_no`).bind(today,today).all();return json({success:true,date:today,prospects:rows.results||[]});}

async function sendOutreachMessage(request,env){
    const auth=await adminOr401(request,env);if(auth)return auth;
    const data=await body(request);if(!data)return json({success:false,error:"Invalid JSON request."},400);
    const p=await env.DB.prepare(`SELECT p.*,c.status campaign_status,c.followup_intervals FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.id=? AND p.deleted_at IS NULL AND c.deleted_at IS NULL AND p.deleted_at IS NULL AND c.deleted_at IS NULL`).bind(clean(data.prospect_id,80)).first();
    if(!p)return json({success:false,error:"Prospect not found."},404);
    if(p.campaign_status!=="active")return json({success:false,error:"Campaign is not active."},409);
    if(STOP_STATUSES.has(p.status)||p.sequence_complete)return json({success:false,error:"This outreach sequence is stopped or complete."},400);
    if(p.email_health!=="mail_ready")return json({success:false,error:"This prospect is not Mail Ready."},400);
    if(!p.research_ready)return json({success:false,error:"Research must be marked complete before sending."},400);
    const step=p.last_sent_at===null?0:Number(p.followup_step)+1;
    if(step>5)return json({success:false,error:"Maximum of five follow-ups reached."},400);
    const subject=clean(data.subject,300),message=clean(data.message,20000);
    if(!subject||!message)return json({success:false,error:"Subject and message are required."},400);
    const existing=await env.DB.prepare(`SELECT id,status FROM outreach_messages WHERE prospect_id=? AND sequence_step=? AND status IN ('sending','sent') ORDER BY created_at DESC LIMIT 1`).bind(p.id,step).first();
    if(existing)return json({success:false,error:"This sequence step has already been sent or is currently sending."},409);
    const now=isoNow(),messageId=createId(),type=step===0?"initial":`followup_${step}`;
    await env.DB.prepare(`INSERT INTO outreach_messages (id,campaign_id,prospect_id,sequence_step,type,subject,body,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)`).bind(messageId,p.campaign_id,p.id,step,type,subject,message,"sending",now).run();
    try{
        const sent=await sendGoogleOutreachEmail(env,{to:p.email,subject,text:message});
        const sentAt=isoNow(),intervals=parseIntervals(p.followup_intervals),complete=step===5?1:0,next=complete?null:addDays(sentAt,intervals[step]);
        await env.DB.prepare(`UPDATE outreach_messages SET status='sent',provider_message_id=?,sent_at=? WHERE id=?`).bind(sent.id,sentAt,messageId).run();
        await env.DB.prepare(`UPDATE outreach_prospects SET status=CASE WHEN status='scheduled' THEN 'contacted' ELSE status END,last_sent_at=?,followup_step=?,next_followup_date=?,sequence_complete=?,updated_at=? WHERE id=?`).bind(sentAt,step,next,complete,sentAt,p.id).run();
        await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),p.campaign_id,p.id,"email_sent",`${type} via Google Workspace`,sentAt).run();
        return json({success:true,provider:"google_workspace",provider_message_id:sent.id,sequence_step:step,next_followup_date:next,sequence_complete:!!complete});
    }catch(error){
        const failedAt=isoNow();
        await env.DB.prepare(`UPDATE outreach_messages SET status='failed' WHERE id=?`).bind(messageId).run();
        await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),p.campaign_id,p.id,"email_failed",clean(error?.message||"Gmail send failed",1000),failedAt).run();
        return json({success:false,error:error?.message||"Gmail send failed."},502);
    }
}

async function listTemplates(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const rows=await env.DB.prepare(`SELECT * FROM outreach_templates ORDER BY sequence_step`).all();return json({success:true,templates:rows.results||[]});}
async function saveTemplate(request,env){const auth=await adminOr401(request,env);if(auth)return auth;const data=await body(request);if(!data)return json({success:false,error:"Invalid JSON request."},400);const step=Math.max(0,Math.min(5,parseInt(data.sequence_step,10)||0));const existing=await env.DB.prepare(`SELECT id FROM outreach_templates WHERE sequence_step=? LIMIT 1`).bind(step).first();const id=existing?.id||createId(),now=isoNow();if(existing)await env.DB.prepare(`UPDATE outreach_templates SET name=?,subject=?,body=?,updated_at=? WHERE id=?`).bind(clean(data.name,120),clean(data.subject,300),clean(data.body,20000),now,id).run();else await env.DB.prepare(`INSERT INTO outreach_templates (id,sequence_step,name,subject,body,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`).bind(id,step,clean(data.name,120)||`Step ${step}`,clean(data.subject,300),clean(data.body,20000),now,now).run();return json({success:true,id});}


// Reversible deletion. Existing message history and suppressions are retained.
async function softDelete(request, env, kind, id) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const table = kind === "campaign" ? "outreach_campaigns" : "outreach_prospects";
    const row = await env.DB.prepare(`SELECT id, deleted_at FROM ${table} WHERE id=?`).bind(id).first();
    if (!row) return json({success:false,error:"Record not found."},404);
    if (row.deleted_at) return json({success:true,already_deleted:true});
    const now=isoNow();
    await env.DB.prepare(`UPDATE ${table} SET deleted_at=?,deleted_by='admin',deleted_reason='Manual deletion',updated_at=? WHERE id=? AND deleted_at IS NULL`).bind(now,now,id).run();
    await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),kind==='campaign'?id:null,kind==='prospect'?id:null,kind+'_trashed','Moved to trash',now).run();
    return json({success:true,deleted_at:now});
}
async function restoreRecord(request, env, kind, id) {
    const auth=await adminOr401(request,env);if(auth)return auth;
    const table=kind==='campaign'?'outreach_campaigns':'outreach_prospects';
    const row=await env.DB.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(id).first();
    if(!row)return json({success:false,error:'Record not found.'},404);
    if(kind==='prospect'){
        const parent=await env.DB.prepare(`SELECT deleted_at FROM outreach_campaigns WHERE id=?`).bind(row.campaign_id).first();
        if(!parent||parent.deleted_at)return json({success:false,error:'Restore the parent campaign first.'},409);
    }
    const now=isoNow();
    await env.DB.prepare(`UPDATE ${table} SET deleted_at=NULL,deleted_reason=NULL,deleted_by=NULL,updated_at=? WHERE id=?`).bind(now,id).run();
    if(kind==='campaign')await env.DB.prepare(`UPDATE outreach_campaigns SET status='paused',updated_at=? WHERE id=?`).bind(now,id).run();
    await env.DB.prepare(`INSERT INTO outreach_events (id,campaign_id,prospect_id,type,detail,created_at) VALUES (?,?,?,?,?,?)`).bind(createId(),kind==='campaign'?id:null,kind==='prospect'?id:null,kind+'_restored','Restored; review schedule before resuming',now).run();
    return json({success:true,requires_review:true});
}
async function listTrash(request,env){
    const auth=await adminOr401(request,env);if(auth)return auth;
    const [c,p]=await Promise.all([
        env.DB.prepare(`SELECT id,name,status,deleted_at FROM outreach_campaigns WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`).all(),
        env.DB.prepare(`SELECT p.id,p.name,p.email,p.company,p.campaign_id,p.deleted_at,c.name campaign_name,c.deleted_at campaign_deleted_at FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.deleted_at IS NOT NULL ORDER BY p.deleted_at DESC`).all()
    ]);
    return json({success:true,campaigns:c.results||[],prospects:p.results||[]});
}


async function intelligence(request, env) {
    const auth = await adminOr401(request, env); if (auth) return auth;
    const [funnel, campaigns, timeline] = await Promise.all([
        env.DB.prepare(`SELECT p.status, COUNT(*) AS total, SUM(CASE WHEN p.last_sent_at IS NOT NULL THEN 1 ELSE 0 END) AS contacted FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.deleted_at IS NULL AND c.deleted_at IS NULL GROUP BY p.status`).all(),
        env.DB.prepare(`SELECT c.id,c.name,c.status,c.daily_limit,COUNT(p.id) AS prospects,SUM(CASE WHEN p.last_sent_at IS NOT NULL THEN 1 ELSE 0 END) AS contacted,SUM(CASE WHEN p.status IN ('replied','interested','qualified','converted') THEN 1 ELSE 0 END) AS positive,SUM(CASE WHEN p.status='converted' THEN 1 ELSE 0 END) AS converted FROM outreach_campaigns c LEFT JOIN outreach_prospects p ON p.campaign_id=c.id AND p.deleted_at IS NULL WHERE c.deleted_at IS NULL GROUP BY c.id ORDER BY c.created_at DESC LIMIT 100`).all(),
        env.DB.prepare(`SELECT substr(sent_at,1,10) AS day,COUNT(*) AS sent FROM outreach_messages WHERE sent_at IS NOT NULL AND status IN ('sent','delivered','opened','clicked','replied') AND sent_at >= ? GROUP BY substr(sent_at,1,10) ORDER BY day DESC LIMIT 30`).bind(addDays(dateOnly(),-30)).all()
    ]);
    const rows = funnel.results || [];
    const total = rows.reduce((n,r)=>n+Number(r.total||0),0);
    const contacted = rows.reduce((n,r)=>n+Number(r.contacted||0),0);
    const positive = rows.filter(r=>['replied','interested','qualified','converted'].includes(r.status)).reduce((n,r)=>n+Number(r.total||0),0);
    const converted = rows.filter(r=>r.status==='converted').reduce((n,r)=>n+Number(r.total||0),0);
    return json({success:true,summary:{total,contacted,positive,converted,positive_rate:contacted?Math.round(positive/contacted*1000)/10:0,conversion_rate:contacted?Math.round(converted/contacted*1000)/10:0},statuses:rows,campaigns:campaigns.results||[],daily_sends:(timeline.results||[]).reverse()});
}

export async function handleAdminOutreachRoutes(request,env){const url=new URL(request.url),p=url.pathname,m=request.method;
    if(p==="/api/admin/outreach/google/callback"&&m==="GET")return handleGoogleCallback(request,env);
    if(p==="/api/admin/outreach/google/status"&&m==="GET")return handleGoogleStatus(request,env);
    if(p==="/api/admin/outreach/google/connect"&&m==="POST")return handleGoogleConnect(request,env);
    if(p==="/api/admin/outreach/google/disconnect"&&m==="POST")return handleGoogleDisconnect(request,env);
    if(p==="/api/admin/outreach/trash"&&m==="GET")return listTrash(request,env);
    const action=p.match(/^\/api\/admin\/outreach\/(campaigns|prospects)\/([^/]+)(?:\/(restore))?$/);
    if(action&&((m==="DELETE"&&!action[3])||(m==="POST"&&action[3]==="restore"))){
        const kind=action[1]==="campaigns"?"campaign":"prospect";
        return m==="DELETE"?softDelete(request,env,kind,action[2]):restoreRecord(request,env,kind,action[2]);
    }
    if(p==="/api/admin/outreach/intelligence"&&m==="GET")return intelligence(request,env);
    if(p==="/api/admin/outreach/dashboard"&&m==="GET")return dashboard(request,env);
    if(p==="/api/admin/outreach/campaigns"&&m==="GET")return listCampaigns(request,env);
    if(p==="/api/admin/outreach/campaigns"&&m==="POST")return createCampaign(request,env);
    if(p.startsWith("/api/admin/outreach/campaigns/")&&(m==="GET"||m==="PATCH")){const id=p.split("/").pop();return m==="GET"?getCampaign(request,env,id):patchCampaign(request,env,id);}
    if(p==="/api/admin/outreach/validate-email"&&m==="POST")return validateEmail(request,env);
    if(p==="/api/admin/outreach/prospects"&&m==="POST")return addProspect(request,env);
    if(p.startsWith("/api/admin/outreach/prospects/")&&(m==="GET"||m==="PATCH")){const id=p.split("/").pop();return m==="GET"?getProspect(request,env,id):patchProspect(request,env,id);}
    if(p==="/api/admin/outreach/due"&&m==="GET")return dueToday(request,env);
    if(p==="/api/admin/outreach/messages"&&m==="POST")return sendOutreachMessage(request,env);
    if(p==="/api/admin/outreach/templates"&&m==="GET")return listTemplates(request,env);
    if(p==="/api/admin/outreach/templates"&&m==="POST")return saveTemplate(request,env);
    return null;
}
