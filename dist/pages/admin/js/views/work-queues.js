import {api} from '../core/api.js';
import {openConversation} from './conversation.js';
import {openCustomerProfile} from './customer-profile.js';
import {loadClients} from './clients.js';
const generations = {requests:0,inbox:0};
function add(parent,tag,text=''){const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;}
function button(parent,label,action){const b=add(parent,'button',label);b.type='button';b.className='analytics-btn';b.addEventListener('click',async()=>{b.disabled=true;try{await action();}catch(e){const p=add(parent,'p',e.message||'Action failed');p.setAttribute('role','alert');}finally{b.disabled=false;}});return b;}
async function load(kind,offset=0){
 const root=document.getElementById(kind+'-root');if(!root)return;
 const ticket=++generations[kind];root.replaceChildren();
 add(root,'h2',kind==='requests'?'Service requests':'Customer inbox');
 const status=add(root,'p','Loading…');status.setAttribute('role','status');
 try{
  const data=await api('/api/admin/work-queue/'+kind+'?offset='+offset);
  if(ticket!==generations[kind])return;
  status.textContent=data.rows.length?`Showing ${offset+1}–${offset+data.rows.length}`:'No records on this page.';
  for(const row of data.rows){
   const card=add(root,'article');card.className='analytics-panel';
   add(card,'h3',kind==='requests'?'Request '+row.id:row.subject||'Conversation');
   add(card,'p',`${row.name||'Customer'} · ${row.email||''}`);
   add(card,'p',`${row.status||'Unknown'} · ${kind==='requests'?row.created_at:row.updated_at}`);
   button(card,'Open conversation',()=>openConversation(kind==='requests'?row.conversation_id:row.id));
   button(card,'Customer profile',()=>openCustomerProfile(row.client_id,openConversation,loadClients));
  }
  if(offset>0)button(root,'Previous',()=>load(kind,Math.max(0,offset-50)));
  if(Number.isSafeInteger(data.nextOffset)&&data.nextOffset>offset)button(root,'Next',()=>load(kind,data.nextOffset));
 }catch(e){if(ticket===generations[kind])status.textContent=e.message||'Unable to load queue.';}
 if(ticket===generations[kind])button(root,'Refresh',()=>load(kind,offset));
}
export const loadRequestQueue=()=>load('requests');
export const loadInboxQueue=()=>load('inbox');
