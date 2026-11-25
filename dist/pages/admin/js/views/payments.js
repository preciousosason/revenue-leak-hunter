import {api,getAuthHeaders} from '../core/api.js';
import {API_URL} from '../core/config.js';
import {
    renderPaymentInstructions
} from './payment-instructions.js';
let generation=0;
const el=(tag,text,parent)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(parent)parent.append(n);return n;};
const money=(n,c)=>new Intl.NumberFormat('en',{style:'currency',currency:c}).format(n/100);
const button=(parent,label,fn)=>{const b=el('button',label,parent);b.type='button';b.className='analytics-btn';b.addEventListener('click',fn);return b;};
export async function loadPayments(status='pending',page=1){
 const root=document.getElementById('payments-root');if(!root)return;
 const current=++generation;root.replaceChildren();
 el('h2','Payment management',root);el('p','Verify funds independently before approving a receipt.',root);
 void renderPaymentInstructions(root);
 const controls=el('div',undefined,root);controls.className='analytics-inline';
 const select=el('select',undefined,controls);select.setAttribute('aria-label','Payment status');
 for(const value of ['pending','verified','rejected','all']){const option=el('option',value,select);option.value=value;}select.value=status;
 select.onchange=()=>loadPayments(select.value,1);button(controls,'Refresh',()=>loadPayments(status,page));
 const notice=el('p','Loading payments…',root);notice.setAttribute('role','status');
 try{
 const data=await api(`/api/admin/payments?status=${encodeURIComponent(status)}&page=${page}`);if(current!==generation)return;notice.textContent='';
 for(const t of data.totals){const card=el('article',undefined,root);card.className='analytics-panel';el('h3',t.currency+' — all accepted quotations',card);el('p',`Verified: ${money(t.verified_minor,t.currency)} | Pending: ${money(t.pending_minor,t.currency)} (${t.pending_count}) | Outstanding: ${money(t.total_minor-t.verified_minor,t.currency)}`,card);}
 if(!data.payments.length)el('p','No matching payments.',root);
 for(const p of data.payments){const card=el('article',undefined,root);card.className='analytics-panel';el('h3',`${money(p.amount_minor,p.currency)} · ${p.status}`,card);el('p',`${p.name} · ${p.email}`,card);el('p',`Reference: ${p.reference} | Quotation: ${p.quotation_id}`,card);el('p',`Submitted: ${p.created_at}`,card);if(p.reviewed_at)el('p',`Reviewed: ${p.reviewed_at} · ${p.review_note||''}`,card);
 const message=el('p','',card);message.setAttribute('role','status');
 button(card,'Download receipt',async()=>{try{const response=await fetch(`${API_URL}/api/admin/payment-evidence/${encodeURIComponent(p.id)}`,{headers:getAuthHeaders(),cache:'no-store'});if(!response.ok)throw Error('Receipt unavailable');const blob=await response.blob();const ext=blob.type==='application/pdf'?'pdf':(response.headers.get('Content-Disposition')||'').match(/receipt\.(pdf|jpg|png)/)?.[1]||'bin';const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download=`receipt-${p.id}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch(e){message.textContent=e.message;}});
 if(p.status==='pending'){const note=el('textarea',undefined,card);note.placeholder='Review note (required for rejection)';note.setAttribute('aria-label','Review note');note.maxLength=1000;let busy=false;const review=async action=>{if(busy)return;if(action==='reject'&&!note.value.trim()){message.textContent='Enter a rejection reason.';return;}if(!window.confirm(action==='approve'?'Confirm funds were received? This decision is final.':'Reject this payment? This decision is final.'))return;busy=true;approve.disabled=reject.disabled=true;try{await api(`/api/admin/payments/${encodeURIComponent(p.id)}/review`,{method:'POST',body:JSON.stringify({action,note:note.value.trim()})});await loadPayments(status,page);}catch(e){message.textContent=e.message;busy=false;approve.disabled=reject.disabled=false;}};const approve=button(card,'Approve',()=>review('approve')),reject=button(card,'Reject',()=>review('reject'));}
 }
 const pagination=el('div',undefined,root);if(page>1)button(pagination,'Previous',()=>loadPayments(status,page-1));el('span',` Page ${page} `,pagination);if(data.hasMore)button(pagination,'Next',()=>loadPayments(status,page+1));
 }catch(e){if(current===generation)notice.textContent=e.message||'Unable to load payments.';}
}
