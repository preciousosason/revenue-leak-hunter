import {api} from '../core/api.js';
export async function renderPaymentInstructions(root){
 const section=document.createElement('section');section.className='analytics-panel';root.append(section);
 const add=(tag,text,parent=section)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
 add('h3','Payment instructions');add('p','Enter only verified receiving account details. Never enter passwords, PINs or private keys.');
 const notice=add('p','Loading…');notice.setAttribute('role','status');
 try{const data=await api('/api/admin/payment-instructions');notice.textContent='';
 for(const currency of ['USD','NGN','GBP','EUR']){
 const old=data.instructions.find(x=>x.currency===currency);const form=add('form','');add('h4',currency,form);
 const label=add('label','Payment methods and instructions',form);const input=add('textarea','',label);input.required=true;input.maxLength=3000;input.rows=5;input.value=old?.instructions||'';
 const activeLabel=add('label','Active ',form);const active=add('input','',activeLabel);active.type='checkbox';active.checked=old?.active===1;
 const save=add('button','Save '+currency,form);save.type='submit';const status=add('p','',form);status.setAttribute('role','status');
 form.onsubmit=async e=>{e.preventDefault();if(!confirm('Save payment instructions for '+currency+'? Verify all receiving details first.'))return;save.disabled=true;try{await api('/api/admin/payment-instructions',{method:'POST',body:JSON.stringify({currency,instructions:input.value,active:active.checked})});status.textContent='Saved.';}catch(e){status.textContent=e.message;}finally{save.disabled=false;}};
 }
 }catch(e){notice.textContent=e.message;}
}
