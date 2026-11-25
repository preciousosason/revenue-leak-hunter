export async function loadPaymentInstructions(){
 const r=await fetch('/api/marketplace/payment-instructions',{credentials:'same-origin',cache:'no-store'});const d=await r.json();if(!r.ok||!d.success)throw Error(d.error||'Payment instructions unavailable');return new Map(d.instructions.map(i=>[i.currency,i.instructions]));
}
export function showPaymentInstructions(section,instructions,currency){
 const heading=document.createElement('h4');heading.textContent='Payment instructions ('+currency+')';section.append(heading);
 const p=document.createElement('p');p.style.whiteSpace='pre-wrap';p.textContent=instructions.get(currency)||'No active payment instructions. Contact Leakendia before sending funds.';section.append(p);
}
