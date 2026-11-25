export async function renderPaymentNotifications(root,current){
 const endpoint='/api/marketplace/payment-notifications';
 const add=(tag,text,parent=root)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
 const panel=add('section','');
 async function load(){
  const r=await fetch(endpoint,{cache:'no-store'}),data=await r.json();
  if(!r.ok||!data.success)throw Error(data.error||'Unable to load notifications');
  if(!current())return;
  panel.replaceChildren();
  const refresh=add('button','Refresh',panel);refresh.type='button';refresh.onclick=()=>run();
  if(!data.notifications.length)add('p','No payment notifications yet.',panel);
  for(const n of data.notifications){
   const row=add('section','',panel);row.className='workspace-session';
   add('h3',n.status==='verified'?'Payment verified':'Payment rejected',row);
   add('p',new Intl.NumberFormat(undefined,{style:'currency',currency:n.currency}).format(n.amount_minor/100),row);
   add('p',n.created_at,row);if(n.review_note)add('p',n.review_note,row);
   if(!n.read_at){const b=add('button','Mark as read',row);b.type='button';b.onclick=async()=>{b.disabled=true;try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({paymentId:n.payment_id})});if(!r.ok)throw Error('Unable to mark as read');if(current())b.remove();}catch(e){if(current()){add('p',e.message,row);b.disabled=false;}}};}
  }
  const a=add('a','View current payment balances',panel);a.href='#payments';
 }
 async function run(){try{await load();}catch(e){if(current()){panel.replaceChildren();add('p',e.message,panel);const b=add('button','Retry',panel);b.type='button';b.onclick=run;}}}
 await run();
}
