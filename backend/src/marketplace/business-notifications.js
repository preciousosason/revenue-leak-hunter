import {authenticateCustomer} from '../auth/sessions.js';
import {assertTrustedHost,assertSameOrigin,authJSON,readAuthJSON} from '../auth/security.js';
export async function handleBusinessNotifications(request,env){
 if(new URL(request.url).pathname!=='/api/marketplace/notifications')return null;
 try{
  assertTrustedHost(request,env);
  const customer=await authenticateCustomer(request,env);
  if(!customer)return authJSON({success:false,error:'Sign in required'},401);
  const owner=customer.client_id;
  if(request.method==='GET'){
   const rows=await env.DB.prepare(`SELECT * FROM (
    SELECT 'business:'||id AS id,kind,title,detail,created_at,read_at,NULL AS amount_minor,NULL AS currency FROM customer_business_notifications WHERE client_id=?
    UNION ALL SELECT 'payment:'||n.payment_id,'payment',CASE n.status WHEN 'verified' THEN 'Payment verified' ELSE 'Payment rejected' END,COALESCE(p.review_note,''),n.created_at,n.read_at,p.amount_minor,q.currency FROM customer_payment_notifications n JOIN payment_records p ON p.id=n.payment_id JOIN quotations q ON q.id=p.quotation_id WHERE n.client_id=?
   ) ORDER BY created_at DESC,id DESC LIMIT 100`).bind(owner,owner).all();
   return authJSON({success:true,notifications:rows.results});
  }
  if(request.method==='POST'){
   assertSameOrigin(request,env);const body=await readAuthJSON(request);
   const id=body.id;
   if(typeof id!=='string'||id.length>140)return authJSON({success:false,error:'Invalid ID'},400);
   if(/^business:[1-9][0-9]{0,15}$/.test(id))await env.DB.prepare('UPDATE customer_business_notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=? AND client_id=?').bind(Number(id.slice(9)),owner).run();
   else if(/^payment:[\w-]{1,128}$/.test(id))await env.DB.prepare('UPDATE customer_payment_notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE payment_id=? AND client_id=?').bind(id.slice(8),owner).run();
   else return authJSON({success:false,error:'Invalid ID'},400);
   return authJSON({success:true});
  }
  return authJSON({success:false,error:'Method not allowed'},405);
 }catch(e){return authJSON({success:false,error:'Unable to access notifications'},e.status||500);}
}
