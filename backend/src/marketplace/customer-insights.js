import {authenticateCustomer} from '../auth/sessions.js';
import {assertTrustedHost,assertSameOrigin,authJSON,readAuthJSON} from '../auth/security.js';
export async function handleCustomerInsights(request,env){
 const url=new URL(request.url), activity=url.pathname==='/api/marketplace/project-activity';
 if(!activity&&url.pathname!=='/api/marketplace/notification-center')return null;
 try{
  assertTrustedHost(request,env);
  const user=await authenticateCustomer(request,env);
  if(!user)return authJSON({success:false,error:'Sign in required'},401);
  const owner=user.client_id;
  if(request.method==='GET'){
   const offset=Number(url.searchParams.get('offset')||0);
   if(!Number.isSafeInteger(offset)||offset<0||offset>1000000)return authJSON({success:false,error:'Invalid offset'},400);
   if(activity){
    const project=url.searchParams.get('project_id');
    const owned=await env.DB.prepare('SELECT p.id FROM projects p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id WHERE p.id=? AND r.client_id=?').bind(project||'',owner).first();
    if(!owned)return authJSON({success:false,error:'Project not found'},404);
    const rows=await env.DB.prepare("SELECT title,detail,created_at FROM customer_business_notifications WHERE client_id=? AND subject_id=? AND kind IN ('project','milestone','file') ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?").bind(owner,project,offset).all();
    return authJSON({success:true,events:rows.results.slice(0,50),hasMore:rows.results.length>50});
   }
   const results=await env.DB.batch([
    env.DB.prepare(`SELECT * FROM (SELECT 'business:'||id AS id,kind,title,detail,created_at,read_at FROM customer_business_notifications WHERE client_id=? UNION ALL SELECT 'payment:'||payment_id,'payment',CASE status WHEN 'verified' THEN 'Payment verified' ELSE 'Payment rejected' END,'',created_at,read_at FROM customer_payment_notifications WHERE client_id=?) ORDER BY created_at DESC,id DESC LIMIT 51 OFFSET ?`).bind(owner,owner,offset),
    env.DB.prepare('SELECT (SELECT count(*) FROM customer_business_notifications WHERE client_id=? AND read_at IS NULL)+(SELECT count(*) FROM customer_payment_notifications WHERE client_id=? AND read_at IS NULL) AS unread').bind(owner,owner)
   ]);
   return authJSON({success:true,notifications:results[0].results.slice(0,50),hasMore:results[0].results.length>50,unread:results[1].results[0].unread});
  }
  if(!activity&&request.method==='POST'){
   assertSameOrigin(request,env);const body=await readAuthJSON(request);
   if(body.action!=='mark_all_read')return authJSON({success:false,error:'Invalid action'},400);
   await env.DB.batch(['customer_business_notifications','customer_payment_notifications'].map(table=>env.DB.prepare(`UPDATE ${table} SET read_at=CURRENT_TIMESTAMP WHERE client_id=? AND read_at IS NULL`).bind(owner)));
   return authJSON({success:true});
  }
  return authJSON({success:false,error:'Method not allowed'},405);
 }catch(e){return authJSON({success:false,error:'Unable to access customer insights'},e.status||500);}
}
