import { api } from "../core/api.js";

let loaded=false, activeCampaignId=null, emailTimer=null, lastHealth=null;
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const fmt=v=>v?new Date(v).toLocaleString():"—";

export function initOutreach(){
  $("outreach-refresh")?.addEventListener("click",loadOutreach);
  $("outreach-create-toggle")?.addEventListener("click",()=>$("outreach-create-panel")?.toggleAttribute("hidden"));
  $("outreach-create-form")?.addEventListener("submit",createCampaign);
  $("prospect-email")?.addEventListener("input",scheduleEmailCheck);
  $("prospect-form")?.addEventListener("submit",addProspect);
  $("outreach-back")?.addEventListener("click",()=>{activeCampaignId=null;$("outreach-campaign-detail").hidden=true;$("outreach-dashboard-body").hidden=false;});
  $("outreach-message-form")?.addEventListener("submit",recordMessage);
  $("outreach-close-prospect")?.addEventListener("click",()=>$("outreach-prospect-modal").hidden=true);
}

export async function loadOutreach(){
  try{
    const [d,q]=await Promise.all([api("/api/admin/outreach/dashboard"),api("/api/admin/outreach/queue")]);
    $("outreach-active-count").textContent=d.summary.activeCampaigns;
    $("outreach-due-count").textContent=d.summary.dueToday;
    $("outreach-replies-count").textContent=d.summary.replies;
    $("outreach-prospects-count").textContent=d.summary.totalProspects;
    renderCampaigns(d.campaigns||[]); renderQueue(q.queue||[]); loaded=true;
  }catch(e){setStatus(e.message,"error");}
}
function renderCampaigns(items){
  const el=$("outreach-campaign-list"); if(!el)return;
  if(!items.length){el.innerHTML='<div class="outreach-empty">No campaigns yet. Create the first one.</div>';return;}
  el.innerHTML=items.map(c=>`<button class="outreach-campaign-card" data-campaign="${esc(c.id)}"><div><span class="outreach-kicker">${esc(c.status)}</span><h3>${esc(c.name)}</h3></div><div class="outreach-campaign-metrics"><span><b>${c.contacted_count||0}</b> / ${c.prospect_count||0} contacted</span><span>${c.opened_count||0} opened</span><span>${c.replied_count||0} replied</span></div><div class="outreach-progress"><i style="width:${Math.min(100,((c.contacted_count||0)/Math.max(1,c.prospect_count||1))*100)}%"></i></div></button>`).join("");
  el.querySelectorAll("[data-campaign]").forEach(b=>b.onclick=()=>openCampaign(b.dataset.campaign));
}
function renderQueue(items){
  const el=$("outreach-due-list"); if(!el)return;
  if(!items.length){el.innerHTML='<div class="outreach-empty">Nothing due right now.</div>';return;}
  el.innerHTML=items.slice(0,12).map(p=>`<button class="outreach-queue-row" data-prospect="${esc(p.id)}"><div><strong>${esc(p.name)}</strong><span>${esc(p.company||p.email)}</span></div><span>${p.initial_sent_at?`Follow-up ${Number(p.followup_step||0)+1}`:"Initial"}</span></button>`).join("");
  el.querySelectorAll("[data-prospect]").forEach(b=>b.onclick=()=>openProspect(b.dataset.prospect));
}
async function createCampaign(e){
  e.preventDefault(); const fd=new FormData(e.currentTarget);
  try{await api("/api/admin/outreach/campaigns",{method:"POST",body:JSON.stringify({name:fd.get("name"),dailyLimit:Number(fd.get("dailyLimit")),maxProspects:Number(fd.get("maxProspects")),followupIntervals:[3,4,5,7,10]})}); e.currentTarget.reset(); $("campaign-daily-limit").value=15; $("campaign-max-prospects").value=60; $("outreach-create-panel").hidden=true; setStatus("Campaign created.","success"); loadOutreach();}catch(err){setStatus(err.message,"error");}
}
async function openCampaign(id){
  try{const d=await api(`/api/admin/outreach/campaigns/${id}`); activeCampaignId=id; $("outreach-dashboard-body").hidden=true; $("outreach-campaign-detail").hidden=false; $("outreach-campaign-name").textContent=d.campaign.name; $("outreach-campaign-meta").textContent=`${d.prospects.length} / ${d.campaign.max_prospects} prospects · ${d.campaign.daily_limit}/day · follow-ups ${d.campaign.followup_intervals.join(" / ")} days`; renderProspects(d.prospects);}catch(e){setStatus(e.message,"error");}
}
function renderProspects(items){
 const el=$("outreach-prospect-list"); if(!items.length){el.innerHTML='<div class="outreach-empty">No prospects yet.</div>';return;}
 el.innerHTML=items.map(p=>`<button class="prospect-row" data-prospect="${esc(p.id)}"><span class="prospect-position">${String(p.queue_position).padStart(2,"0")}</span><div><strong>${esc(p.name)}</strong><small>${esc(p.email)} ${p.company?`· ${esc(p.company)}`:""}</small></div><span class="health-pill ${esc(p.email_health)}">${esc(p.email_health).replace("_"," ")}</span><span class="prospect-status">${esc(p.status)}</span><span class="prospect-date">${fmt(p.scheduled_at)}</span></button>`).join("");
 el.querySelectorAll("[data-prospect]").forEach(b=>b.onclick=()=>openProspect(b.dataset.prospect));
}
function scheduleEmailCheck(e){clearTimeout(emailTimer);lastHealth=null;const email=e.target.value.trim();const out=$("email-health-result");if(!email){out.textContent="";return;} out.className="email-health checking";out.textContent="Checking…";emailTimer=setTimeout(()=>checkEmail(email),450);}
async function checkEmail(email){
 try{const d=await api("/api/admin/outreach/email-health",{method:"POST",body:JSON.stringify({email})});lastHealth=d.health;const out=$("email-health-result");out.className=`email-health ${d.health.status}`;out.innerHTML=`<strong>${esc(d.health.status.replace("_"," "))}</strong><span>${esc(d.health.reason)}</span>`;}catch(e){$("email-health-result").textContent=e.message;}
}
async function addProspect(e){
 e.preventDefault(); if(!activeCampaignId)return; const fd=new FormData(e.currentTarget); if(!lastHealth||lastHealth.email!==String(fd.get("email")).trim().toLowerCase()){await checkEmail(String(fd.get("email")));}
 if(lastHealth?.status==="not_receivable"){setStatus("This address is not receivable, so it was not added.","error");return;}
 try{await api(`/api/admin/outreach/campaigns/${activeCampaignId}/prospects`,{method:"POST",body:JSON.stringify({name:fd.get("name"),email:fd.get("email"),website:fd.get("website"),company:fd.get("company"),role:fd.get("role"),observation:fd.get("observation"),researchReady:fd.get("researchReady")==="on",emailHealth:lastHealth?.status||"unverified",emailHealthReason:lastHealth?.reason||"",emailCheckedAt:lastHealth?.checkedAt})});e.currentTarget.reset();lastHealth=null;$("email-health-result").textContent="";setStatus("Prospect added and scheduled.","success");openCampaign(activeCampaignId);loadOutreach();}catch(err){setStatus(err.message,"error");}
}
async function openProspect(id){
 try{const d=await api(`/api/admin/outreach/prospects/${id}`),p=d.prospect; const modal=$("outreach-prospect-modal");modal.hidden=false;modal.dataset.prospect=id;$("prospect-modal-name").textContent=p.name;$("prospect-modal-meta").textContent=`${p.email} · ${p.campaign_name}`;$("prospect-modal-observation").textContent=p.observation||"No research observation added.";$("prospect-message-history").innerHTML=(d.messages||[]).length?d.messages.map(m=>`<article class="outreach-message"><header><strong>${m.kind}${m.followup_number?` #${m.followup_number}`:""}</strong><span>${fmt(m.sent_at)}</span></header><b>${esc(m.subject)}</b><p>${esc(m.body).replace(/\n/g,"<br>")}</p></article>`).join(""):'<div class="outreach-empty">No outreach recorded yet.</div>';$("outreach-message-subject").value="";$("outreach-message-body").value="";}catch(e){setStatus(e.message,"error");}
}
async function recordMessage(e){e.preventDefault();const id=$("outreach-prospect-modal").dataset.prospect;try{const fd=new FormData(e.currentTarget);await api(`/api/admin/outreach/prospects/${id}/messages`,{method:"POST",body:JSON.stringify({subject:fd.get("subject"),body:fd.get("body")})});setStatus("Outreach recorded. This build does not send through Resend.","success");await openProspect(id);loadOutreach();if(activeCampaignId)openCampaign(activeCampaignId);}catch(err){setStatus(err.message,"error");}}
function setStatus(msg,type){const el=$("outreach-status");if(!el)return;el.textContent=msg;el.className=`outreach-status ${type}`;el.hidden=false;setTimeout(()=>el.hidden=true,5000);}
