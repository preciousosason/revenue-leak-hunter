import {authenticateCustomer} from '../auth/sessions.js';
import {assertTrustedHost,assertSameOrigin,authJSON,readAuthJSON} from '../auth/security.js';
export async function handlePaymentNotifications(request,env){
 const path=new URL(request.url).pathname;
 if(path!=='/api/marketplace/payment-notifications')return null;
 try{
  assertTrustedHost(request,env);
  const customer=await authenticateCustomer(request,env);
  if(!customer)return authJSON({success:false,error:'Sign in required'},401);
  if(request.method==='GET'){
   const rows=await env.DB.prepare(`SELECT n.payment_id,n.status,n.created_at,n.read_at,p.amount_minor,p.review_note,q.currency FROM customer_payment_notifications n JOIN payment_records p ON p.id=n.payment_id JOIN quotations q ON q.id=p.quotation_id WHERE n.client_id=? ORDER BY n.created_at DESC,n.payment_id DESC LIMIT 100`).bind(customer.client_id).all();
   return authJSON({success:true,notifications:rows.results});
  }
  if(request.method==='POST'){
   assertSameOrigin(request,env);
   const body=await readAuthJSON(request);
   if(typeof body.paymentId!=='string'||body.paymentId.length>128||!body.paymentId)return authJSON({success:false,error:'Invalid payment ID'},400);
   await env.DB.prepare('UPDATE customer_payment_notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE payment_id=? AND client_id=?').bind(body.paymentId,customer.client_id).run();
   return authJSON({success:true});
  }
  return authJSON({success:false,error:'Method not allowed'},405);
 }catch(e){return authJSON({success:false,error:'Unable to access payment notifications'},e.status||500);}
}
