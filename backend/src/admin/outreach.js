import { json } from "../utils/response.js";
import { createId } from "../utils/ids.js";
import { authenticateAdmin } from "../utils/auth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUS = new Set(["draft","scheduled","contacted","opened","engaged","replied","interested","qualified","converted","not_interested","no_response","do_not_contact"]);

async function requireAdmin(request, env) {
  const session = await authenticateAdmin(request, env);
  return session || null;
}
function bad(error, status=400){ return json({success:false,error},status); }
function normalizeEmail(v){ return String(v||"").trim().toLowerCase(); }
function normalizeUrl(v){ const s=String(v||"").trim(); if(!s) return ""; return /^https?:\/\//i.test(s)?s:`https://${s}`; }
function isoDatePlus(date, days){ const d=new Date(date); d.setUTCDate(d.getUTCDate()+Number(days||0)); return d.toISOString(); }

async function dnsJson(name, type){
  const r=await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,{headers:{accept:"application/dns-json"}});
  if(!r.ok) throw new Error("DNS lookup failed");
  return r.json();
}

export async function handleEmailHealth(request, env){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  let body; try{body=await request.json();}catch{return bad("Invalid JSON request.");}
  const email=normalizeEmail(body.email);
  if(!EMAIL_RE.test(email)) return json({success:true,health:{email,status:"not_receivable",reason:"Invalid email format.",syntaxValid:false,mxFound:false}});
  const domain=email.split("@")[1];
  try{
    const [mx,a,aaaa]=await Promise.all([dnsJson(domain,"MX"),dnsJson(domain,"A"),dnsJson(domain,"AAAA")]);
    const mxAnswers=Array.isArray(mx.Answer)?mx.Answer.filter(x=>x.type===15):[];
    const nullMx=mxAnswers.some(x=>String(x.data||"").trim().endsWith(" .") || String(x.data||"").trim()==="0 .");
    const fallback=(Array.isArray(a.Answer)&&a.Answer.length)||(Array.isArray(aaaa.Answer)&&aaaa.Answer.length);
    const mxFound=mxAnswers.length>0 && !nullMx;
    const status=nullMx||(!mxFound&&!fallback)?"not_receivable":"unverified";
    const reason=nullMx?"Domain explicitly does not accept email.":mxFound?"Mail server found. Exact mailbox existence cannot be safely confirmed.":fallback?"Domain exists but has no explicit MX record. Exact mailbox is unverified.":"No usable mail server found.";
    return json({success:true,health:{email,domain,status,reason,syntaxValid:true,mxFound,checkedAt:new Date().toISOString()}});
  }catch(error){
    return json({success:true,health:{email,domain,status:"unverified",reason:"Email domain check could not be completed right now.",syntaxValid:true,mxFound:null,checkedAt:new Date().toISOString()}});
  }
}

export async function handleOutreachDashboard(request,env){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  const campaigns=await env.DB.prepare(`SELECT c.*, COUNT(p.id) prospect_count, SUM(CASE WHEN p.initial_sent_at IS NOT NULL THEN 1 ELSE 0 END) contacted_count, SUM(CASE WHEN p.opened_at IS NOT NULL THEN 1 ELSE 0 END) opened_count, SUM(CASE WHEN p.status='replied' OR p.replied_at IS NOT NULL THEN 1 ELSE 0 END) replied_count FROM outreach_campaigns c LEFT JOIN outreach_prospects p ON p.campaign_id=c.id GROUP BY c.id ORDER BY c.created_at DESC`).all();
  const today=new Date().toISOString();
  const due=await env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects WHERE status NOT IN ('replied','converted','not_interested','do_not_contact') AND ((initial_sent_at IS NULL AND scheduled_at<=?) OR (next_followup_at IS NOT NULL AND next_followup_at<=?))`).bind(today,today).first();
  const total=await env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects`).first();
  const replies=await env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects WHERE status='replied'`).first();
  return json({success:true,campaigns:campaigns.results||[],summary:{dueToday:Number(due?.count||0),totalProspects:Number(total?.count||0),replies:Number(replies?.count||0),activeCampaigns:(campaigns.results||[]).filter(c=>c.status==='active').length}});
}

export async function handleCampaigns(request,env){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  if(request.method==="GET"){
    const rows=await env.DB.prepare(`SELECT c.*, COUNT(p.id) prospect_count, SUM(CASE WHEN p.initial_sent_at IS NOT NULL THEN 1 ELSE 0 END) contacted_count, SUM(CASE WHEN p.opened_at IS NOT NULL THEN 1 ELSE 0 END) opened_count, SUM(CASE WHEN p.replied_at IS NOT NULL THEN 1 ELSE 0 END) replied_count FROM outreach_campaigns c LEFT JOIN outreach_prospects p ON p.campaign_id=c.id GROUP BY c.id ORDER BY c.created_at DESC`).all();
    return json({success:true,campaigns:rows.results||[]});
  }
  let b;try{b=await request.json();}catch{return bad("Invalid JSON request.");}
  const name=String(b.name||"").trim(); if(!name)return bad("Campaign name is required.");
  const id=createId(), now=new Date().toISOString();
  const daily=Math.min(50,Math.max(1,Number(b.dailyLimit)||15));
  const maxProspects=Math.min(500,Math.max(1,Number(b.maxProspects)||60));
  const intervals=Array.isArray(b.followupIntervals)?b.followupIntervals.slice(0,5).map(x=>Math.max(1,Number(x)||1)):[3,4,5,7,10];
  await env.DB.prepare(`INSERT INTO outreach_campaigns(id,name,status,daily_limit,max_prospects,followup_intervals,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)`).bind(id,name,"active",daily,maxProspects,JSON.stringify(intervals),now,now).run();
  return json({success:true,campaign:{id,name,status:"active",daily_limit:daily,max_prospects:maxProspects,followup_intervals:intervals}},201);
}

export async function handleCampaignDetail(request,env,campaignId){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  const campaign=await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=?`).bind(campaignId).first();
  if(!campaign)return bad("Campaign not found.",404);
  const prospects=await env.DB.prepare(`SELECT * FROM outreach_prospects WHERE campaign_id=? ORDER BY queue_position ASC, created_at ASC`).bind(campaignId).all();
  return json({success:true,campaign:{...campaign,followup_intervals:JSON.parse(campaign.followup_intervals||"[]")},prospects:prospects.results||[]});
}

export async function handleAddProspect(request,env,campaignId){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  let b;try{b=await request.json();}catch{return bad("Invalid JSON request.");}
  const campaign=await env.DB.prepare(`SELECT * FROM outreach_campaigns WHERE id=?`).bind(campaignId).first(); if(!campaign)return bad("Campaign not found.",404);
  const count=await env.DB.prepare(`SELECT COUNT(*) count FROM outreach_prospects WHERE campaign_id=?`).bind(campaignId).first();
  if(Number(count?.count||0)>=campaign.max_prospects)return bad(`This campaign has reached its ${campaign.max_prospects} prospect limit.`);
  const email=normalizeEmail(b.email), name=String(b.name||"").trim(); if(!name||!EMAIL_RE.test(email))return bad("A valid name and email are required.");
  const suppressed=await env.DB.prepare(`SELECT email FROM outreach_suppressions WHERE email=?`).bind(email).first(); if(suppressed)return bad("This email is on the Do Not Contact list.",409);
  const duplicate=await env.DB.prepare(`SELECT id,campaign_id FROM outreach_prospects WHERE email=?`).bind(email).first(); if(duplicate)return bad("This prospect email already exists in Outreach.",409);
  const pos=Number(count?.count||0)+1; const dayOffset=Math.floor((pos-1)/campaign.daily_limit); const scheduled=isoDatePlus(new Date(),dayOffset);
  const id=createId(),now=new Date().toISOString();
  await env.DB.prepare(`INSERT INTO outreach_prospects(id,campaign_id,name,email,website,company,role,notes,observation,email_health,email_health_reason,email_checked_at,research_ready,status,queue_position,scheduled_at,followup_step,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,campaignId,name,email,normalizeUrl(b.website),String(b.company||"").trim(),String(b.role||"").trim(),String(b.notes||"").trim(),String(b.observation||"").trim(),String(b.emailHealth||"unverified"),String(b.emailHealthReason||""),b.emailCheckedAt||now,b.researchReady?1:0,"scheduled",pos,scheduled,0,now,now).run();
  return json({success:true,prospect:{id,campaign_id:campaignId,name,email,queue_position:pos,scheduled_at:scheduled}},201);
}

export async function handleProspectDetail(request,env,prospectId){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  const p=await env.DB.prepare(`SELECT p.*,c.name campaign_name,c.followup_intervals FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.id=?`).bind(prospectId).first(); if(!p)return bad("Prospect not found.",404);
  const messages=await env.DB.prepare(`SELECT * FROM outreach_messages WHERE prospect_id=? ORDER BY created_at ASC`).bind(prospectId).all();
  const events=await env.DB.prepare(`SELECT * FROM outreach_events WHERE prospect_id=? ORDER BY created_at DESC`).bind(prospectId).all();
  return json({success:true,prospect:p,messages:messages.results||[],events:events.results||[]});
}

export async function handleUpdateProspect(request,env,prospectId){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  let b;try{b=await request.json();}catch{return bad("Invalid JSON request.");}
  const p=await env.DB.prepare(`SELECT * FROM outreach_prospects WHERE id=?`).bind(prospectId).first(); if(!p)return bad("Prospect not found.",404);
  const status=ALLOWED_STATUS.has(b.status)?b.status:p.status; const now=new Date().toISOString();
  await env.DB.prepare(`UPDATE outreach_prospects SET company=?,role=?,website=?,notes=?,observation=?,research_ready=?,status=?,updated_at=? WHERE id=?`).bind(String(b.company??p.company??""),String(b.role??p.role??""),normalizeUrl(b.website??p.website??""),String(b.notes??p.notes??""),String(b.observation??p.observation??""),b.researchReady===undefined?p.research_ready:(b.researchReady?1:0),status,now,prospectId).run();
  if(status==="do_not_contact") await env.DB.prepare(`INSERT OR IGNORE INTO outreach_suppressions(id,email,reason,created_at) VALUES(?,?,?,?)`).bind(createId(),p.email,"Marked Do Not Contact in Outreach",now).run();
  return json({success:true});
}

export async function handleRecordOutreachMessage(request,env,prospectId){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  let b;try{b=await request.json();}catch{return bad("Invalid JSON request.");}
  const p=await env.DB.prepare(`SELECT p.*,c.followup_intervals FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE p.id=?`).bind(prospectId).first(); if(!p)return bad("Prospect not found.",404);
  if(["replied","converted","not_interested","do_not_contact"].includes(p.status))return bad("Follow-up sequence is stopped for this prospect.",409);
  const subject=String(b.subject||"").trim(), body=String(b.body||"").trim(); if(!subject||!body)return bad("Subject and message are required.");
  const kind=p.initial_sent_at?"followup":"initial"; const step=kind==="initial"?0:Math.min(5,Number(p.followup_step||0)+1); if(step>5)return bad("Maximum of five follow-ups reached.");
  const now=new Date().toISOString(), id=createId();
  await env.DB.prepare(`INSERT INTO outreach_messages(id,prospect_id,campaign_id,kind,followup_number,subject,body,status,created_at,sent_at) VALUES(?,?,?,?,?,?,?,?,?,?)`).bind(id,prospectId,p.campaign_id,kind,step,subject,body,"recorded",now,now).run();
  let next=null; const intervals=JSON.parse(p.followup_intervals||"[3,4,5,7,10]"); if(step<5){ const interval=Number(intervals[step]??intervals[Math.min(step,intervals.length-1)]??3); next=isoDatePlus(now,interval); }
  await env.DB.prepare(`UPDATE outreach_prospects SET initial_sent_at=COALESCE(initial_sent_at,?),last_contacted_at=?,followup_step=?,next_followup_at=?,status='contacted',updated_at=? WHERE id=?`).bind(now,now,step,next,now,prospectId).run();
  await env.DB.prepare(`INSERT INTO outreach_events(id,prospect_id,campaign_id,event_type,detail,created_at) VALUES(?,?,?,?,?,?)`).bind(createId(),prospectId,p.campaign_id,kind==="initial"?"contacted":`followup_${step}`,subject,now).run();
  return json({success:true,message:{id,kind,followupNumber:step,nextFollowupAt:next}});
}

export async function handleDueQueue(request,env){
  if(!await requireAdmin(request,env)) return bad("Admin authentication required.",401);
  const now=new Date().toISOString();
  const rows=await env.DB.prepare(`SELECT p.*,c.name campaign_name FROM outreach_prospects p JOIN outreach_campaigns c ON c.id=p.campaign_id WHERE c.status='active' AND p.research_ready=1 AND p.email_health!='not_receivable' AND p.status NOT IN ('replied','converted','not_interested','do_not_contact') AND ((p.initial_sent_at IS NULL AND p.scheduled_at<=?) OR (p.initial_sent_at IS NOT NULL AND p.next_followup_at IS NOT NULL AND p.next_followup_at<=? AND p.followup_step<5)) ORDER BY COALESCE(p.next_followup_at,p.scheduled_at) ASC LIMIT 100`).bind(now,now).all();
  return json({success:true,queue:rows.results||[]});
}
