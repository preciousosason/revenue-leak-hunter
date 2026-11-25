import { mountQuotations } from "./quotations.js";
import { api } from "../core/api.js";
export async function openCustomerProfile(id, openConversation, refresh) {
 const dialog=document.createElement("dialog");
 Object.assign(dialog.style,{background:"#141414",color:"#eee",border:"1px solid #555",borderRadius:"12px",padding:"24px",width:"min(560px,90vw)",maxHeight:"85vh",overflow:"auto"});
 const endpoint="/api/admin/customer-profile/"+encodeURIComponent(id);
 const add=(tag,text,parent=dialog)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el;};
 const button=(label,fn)=>{const b=add("button",label);b.type="button";Object.assign(b.style,{padding:"9px",margin:"5px",cursor:"pointer"});b.onclick=async()=>{b.disabled=true;try{await fn();}catch(e){alert(e.message);}finally{b.disabled=false;}};return b;};
 const load=async()=>{
  const data=await api(endpoint); if(!dialog.open)return;
  dialog.replaceChildren(); const c=data.customer;
  add("h2",c.name||"Customer");
  for(const [k,v] of Object.entries({Email:c.email,Business:c.business,Website:c.website,Account:c.status||"Legacy contact",Registered:c.registered_at,Verified:c.email_verified_at,"Last sign-in":c.last_login_at,"Active registered sessions":data.activeSessions}))add("p",k+": "+(v??"Not available"));
  const action=async(path,body)=>{await api(endpoint+"/"+path,{method:"POST",body:JSON.stringify(body||{})});await load();await refresh?.();};
  if(c.status){for(const status of ["active","suspended","disabled"])if(status!==c.status)button("Set "+status,async()=>{if(confirm("Change account status to "+status+"?"))await action("status",{status});});button("Revoke all sessions",async()=>{if(confirm("Sign this customer out everywhere?"))await action("revoke");});}
  add("h3","Conversations");
  for(const conv of data.conversations)button((conv.subject||"Conversation")+" · "+conv.status,()=>{dialog.close();openConversation?.(conv.id);});
  if(!data.conversations.length)button("Start conversation",async()=>{const r=await api(endpoint+"/conversation",{method:"POST",body:"{}"});await refresh?.();dialog.close();openConversation?.(r.conversationId);});
  add("h3","Service requests");
  const requestsPanel=add("div","");
  api('/api/admin/customer-requests/'+encodeURIComponent(id)).then(r=>{if(!dialog.open)return;for(const req of r.requests){add('p',req.id+' · '+req.status,requestsPanel);add('p',req.requirements,requestsPanel);for(const item of req.items)add('p',item.service_title+' / '+item.offer_name+' × '+item.quantity,requestsPanel);const quotePanel=add('details','',requestsPanel);add('summary','Manage quotations',quotePanel);quotePanel.addEventListener('toggle',()=>{if(quotePanel.open&&!quotePanel.dataset.loaded){quotePanel.dataset.loaded='1';mountQuotations(quotePanel,req.id);}});const b=add('button','Open request conversation',requestsPanel);b.onclick=()=>{dialog.close();openConversation?.(req.conversation_id);};}if(!r.requests.length)add('p','No requests.',requestsPanel);}).catch(e=>add('p',e.message,requestsPanel));
  add("h3","Internal notes (admin only)");
  const notesPanel=add("div","");
  const input=add("textarea","",notesPanel);input.maxLength=4000;input.placeholder="Private customer note";input.setAttribute("aria-label","Internal customer note");Object.assign(input.style,{width:"100%",minHeight:"90px",boxSizing:"border-box"});
  button("Save internal note",async()=>{const note=input.value.trim();if(!note)throw new Error("Enter a note first.");await api(endpoint+"/notes",{method:"POST",body:JSON.stringify({note})});await load();});
  const notesList=add("div","");
  add("h3","Customer activity (latest 100)");
  const activityList=add("div","");
  button("Close",()=>dialog.close());
  await Promise.all([
   api(endpoint+"/notes").then(r=>{if(!dialog.open)return; if(!r.notes.length)add("p","No internal notes yet.",notesList);for(const n of r.notes){const p=add("p",n.note,notesList);p.style.whiteSpace="pre-wrap";add("small",n.created_at,notesList);}}).catch(e=>add("p",e.message,notesList)),
   api(endpoint+"/activity").then(r=>{if(!dialog.open)return;if(!r.activity.length)add("p","No recorded activity.",activityList);for(const a of r.activity)add("p",a.created_at+" · "+a.kind+" · "+a.detail,activityList);}).catch(e=>add("p",e.message,activityList))
  ]);
 };
 document.body.append(dialog);dialog.addEventListener("close",()=>dialog.remove(),{once:true});dialog.showModal();add("p","Loading customer…");button("Close",()=>dialog.close());try{await load();}catch(e){if(dialog.open)add("p",e.message);}
}
