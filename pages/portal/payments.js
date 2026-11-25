import {
    loadPaymentInstructions,
    showPaymentInstructions
} from './payment-instructions.js';


export async function renderPayments(root,current){
 const base='/api/marketplace/payments';
 const add=(tag,text,parent=root)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
 async function load(){const response=await fetch(base,{cache:'no-store'}),data=await response.json();if(!response.ok||!data.success)throw Error(data.error||'Unable to load payments');let instructions;

try {

    instructions = await loadPaymentInstructions();

} catch {

    instructions = new Map();

}

if (!current()) return;

root.replaceChildren();;add('h2','Payments');const refreshButton = add(
    'button',
    'Refresh payment status'
);

refreshButton.type = 'button';

refreshButton.onclick = async () => {

    refreshButton.disabled = true;

    try {

        await load();

    } catch (error) {

        if (current()) {

            add(
                'p',
                error.message ||
                'Unable to refresh payments.'
            );

        }

    } finally {

        refreshButton.disabled = false;

    }
};if(!data.ledgers.length)add('p','No accepted quotations yet.');
 for(const q of data.ledgers){const section=add('section','');section.className='workspace-session';const money=n=>new Intl.NumberFormat(undefined,{style:'currency',currency:q.currency}).format(n/100);add('h3','Quotation '+q.quotation_id,section);for(const [label,value] of [['Total',q.total_minor],['Verified',q.verified_minor],['Pending',q.pending_minor],['Outstanding',q.balance_minor],['Deposit remaining',q.deposit_remaining_minor]])add('p',label+': '+money(value),section);
 for(const p of q.payments){const line=add('div','',section);add('p',money(p.amount_minor)+' · '+p.reference+' · '+p.status,line);if(p.review_note)add('p',p.review_note,line);const a=add('a','Download receipt',line);a.href='/api/marketplace/payment-evidence/'+encodeURIComponent(p.id);}
 const paymentStatus =
    q.balance_minor <= 0
        ? 'Fully paid'
        : q.deposit_remaining_minor <= 0
            ? 'Deposit satisfied'
            : q.verified_minor > 0
                ? 'Partially paid'
                : 'Awaiting payment';

const statusLabel = add(
    'strong',
    paymentStatus,
    section
);

statusLabel.style.display = 'block';
statusLabel.style.marginBottom = '12px';

if (q.balance_minor <= 0) {

    statusLabel.style.color = '#22c55e';

} else if (q.deposit_remaining_minor <= 0) {

    statusLabel.style.color = '#22c55e';

    add(
        'p',
        'Payment requirements for project activation have been satisfied.',
        section
    );

} else {

    statusLabel.style.color = '#eab308';

}if(q.balance_minor<=0)continue;
 showPaymentInstructions(
    section,
    instructions,
    q.currency
); add('p','Submit evidence only after arranging payment with Leakendia. A receipt is not confirmation of payment.',section);
 const form=add('form','',section);const field=(label,type)=>{const l=add('label',label,form);const i=add('input','',l);i.type=type;i.required=true;return i;};const amount=field('Amount ('+q.currency+')','number');amount.min='0.01';amount.step='0.01';amount.max=String(q.balance_minor/100);const reference=field('Transaction reference','text');reference.maxLength=200;const receipt=field('Receipt (PDF, PNG, JPEG; max 5 MB)','file');receipt.accept='.pdf,.png,.jpg,.jpeg';const b=add('button','Submit payment evidence',form);b.type='submit';const status=add('p','',form);status.setAttribute('role','status');form.onsubmit=async e=>{e.preventDefault();b.disabled=true;try{const f=new FormData();f.set('quotation_id',q.quotation_id);f.set('amount_minor',String(Math.round(Number(amount.value)*100)));f.set('reference',reference.value);f.set('receipt',receipt.files[0]);const r=await fetch(base+'/submit',{method:'POST',body:f});const j=await r.json();if(!r.ok||!j.success)throw Error(j.error||'Submission failed');await load();}catch(e){status.textContent=e.message;b.disabled=false;}};
 }}try{await load();}catch(e){if(current())add('p',e.message);}
}
