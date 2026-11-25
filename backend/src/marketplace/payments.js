import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,authJSON,readAuthJSON,getTrustedOrigin} from '../auth/security.js';
import {json} from '../utils/response.js';
const ledger=`SELECT q.id AS quotation_id,q.request_id,q.currency,q.subtotal_minor-q.discount_minor AS total_minor,q.deposit_minor,COALESCE(SUM(CASE WHEN p.status='verified' THEN p.amount_minor ELSE 0 END),0) AS verified_minor,COALESCE(SUM(CASE WHEN p.status='pending' THEN p.amount_minor ELSE 0 END),0) AS pending_minor FROM quotations q JOIN service_requests r ON r.id=q.request_id LEFT JOIN payment_records p ON p.quotation_id=q.id WHERE q.status='accepted' AND `;
export async function getPaymentLedger(db,field,id){
 const condition=field==='customer'?'r.client_id=?':'q.id=?';
 const rows=(await db.prepare(ledger+condition+' GROUP BY q.id ORDER BY q.created_at DESC LIMIT 100').bind(id).all()).results;
 for(const row of rows){row.balance_minor=row.total_minor-row.verified_minor;row.deposit_remaining_minor=Math.max(0,row.deposit_minor-row.verified_minor);row.payments=(await db.prepare('SELECT id,amount_minor,reference,status,created_at,reviewed_at,review_note FROM payment_records WHERE quotation_id=? ORDER BY created_at DESC LIMIT 100').bind(row.quotation_id).all()).results;}
 return rows;
}
export async function handlePayments(request,env){
 const path=new URL(request.url).pathname,admin=path.match(/^\/api\/admin\/quotation-payments\/([\w-]{1,128})$/);
 const review=path.match(/^\/api\/admin\/payments\/([\w-]{1,128})\/review$/);
 if(path==='/api/admin/payments')return listPayments(request,env);
 if(review)return reviewPayment(request,env,review[1]);
 if(!admin&&path!=='/api/marketplace/payments')return null;
 const reply=admin?json:authJSON;
 try{if(admin){if(!await authenticateAdmin(request,env))return reply({success:false,error:'Unauthorized'},401);}else{assertTrustedHost(request,env);}
 if(request.method!=='GET')return reply({success:false,error:'Method not allowed'},405);
 if(admin)return reply({success:true,ledgers:await getPaymentLedger(env.DB,'quotation',admin[1])});
 const c=await authenticateCustomer(request,env);if(!c)return reply({success:false,error:'Sign in required'},401);
 return reply({success:true,ledgers:await getPaymentLedger(env.DB,'customer',c.client_id)});
 }catch(e){return reply({success:false,error:'Payment ledger unavailable'},e.status||500);}
}

// Administrative review: the database triggers enforce immutable terminal states
// and prevent verified totals from exceeding the accepted quotation.
async function reviewPayment(request,env,id){
 const reply=(data,status=200)=>authJSON(data,status,{
  'Access-Control-Allow-Origin':getTrustedOrigin(env),
  'Vary':'Origin'
 });
 try{
  const origin=request.headers.get('Origin');
  if(origin!==getTrustedOrigin(env))return reply({success:false,error:'Untrusted origin'},403);
  if(request.method!=='POST')return reply({success:false,error:'Method not allowed'},405);
  if(!await authenticateAdmin(request,env))return reply({success:false,error:'Unauthorized'},401);
  const body=await readAuthJSON(request);
  const status=body.action==='approve'?'verified':body.action==='reject'?'rejected':null;
  const note=typeof body.note==='string'?body.note.trim():'';
  if(!status||note.length>1000||(status==='rejected'&&!note))return reply({success:false,error:'Invalid action or review note; rejection requires a reason'},400);
  let row;
  try{
   row=await env.DB.prepare(`UPDATE payment_records SET status=?,reviewed_at=CURRENT_TIMESTAMP,review_note=? WHERE id=? AND status='pending' RETURNING id,quotation_id,status,reviewed_at,review_note`).bind(status,note||null,id).first();
  }catch(error){
   if(String(error.message).includes('Payment exceeds balance'))return reply({success:false,error:'Payment exceeds outstanding balance'},409);
   throw error;
  }
  if(!row){
   const existing=await env.DB.prepare('SELECT id,status FROM payment_records WHERE id=?').bind(id).first();
   return reply({success:false,error:existing?'Payment already reviewed':'Payment not found'},existing?409:404);
  }
  return reply({success:true,payment:row});
 }catch(error){
  return authJSON({success:false,error:'Payment review failed'},error.status||500,{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'});
 }
}

async function listPayments(request,env){
 const reply=(data,status=200)=>authJSON(data,status,{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'});
 try{
 if(request.method!=='GET')return reply({success:false,error:'Method not allowed'},405);
 if(!await authenticateAdmin(request,env))return reply({success:false,error:'Unauthorized'},401);
 const params=new URL(request.url).searchParams,status=params.get('status')||'all',page=Number(params.get('page')||1);
 if(!['all','pending','verified','rejected'].includes(status)||!Number.isSafeInteger(page)||page<1||page>100000)return reply({success:false,error:'Invalid filter'},400);
 const rows=(await env.DB.prepare(`SELECT p.id,p.quotation_id,p.amount_minor,p.reference,p.status,p.created_at,p.reviewed_at,p.review_note,q.currency,r.client_id,c.name,c.email FROM payment_records p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id JOIN clients c ON c.id=r.client_id WHERE (?='all' OR p.status=?) ORDER BY p.created_at DESC,p.id DESC LIMIT 51 OFFSET ?`).bind(status,status,(page-1)*50).all()).results;
 const totals=(await env.DB.prepare(`SELECT q.currency,SUM(q.subtotal_minor-q.discount_minor) AS total_minor,SUM(COALESCE(p.verified,0)) AS verified_minor,SUM(COALESCE(p.pending,0)) AS pending_minor,SUM(COALESCE(p.pending_count,0)) AS pending_count FROM quotations q LEFT JOIN (SELECT quotation_id,SUM(CASE WHEN status='verified' THEN amount_minor ELSE 0 END) verified,SUM(CASE WHEN status='pending' THEN amount_minor ELSE 0 END) pending,SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) pending_count FROM payment_records GROUP BY quotation_id) p ON p.quotation_id=q.id WHERE q.status='accepted' GROUP BY q.currency`).all()).results;
 return reply({success:true,payments:rows.slice(0,50),hasMore:rows.length>50,totals});
 }catch(e){return reply({success:false,error:'Payment queue unavailable'},500);}
}
