import {authenticateCustomer} from '../auth/sessions.js';
import {assertTrustedHost,assertSameOrigin,readAuthJSON,authJSON} from '../auth/security.js';
export async function handleProjectReviews(request,env){
 if(new URL(request.url).pathname!='/api/marketplace/project-reviews')return null;
 try{
  assertTrustedHost(request,env);
  const user=await authenticateCustomer(request,env);
  if(!user)return authJSON({success:false,error:'Sign in required'},401);
  if(request.method==='GET'){
   const rows=await env.DB.prepare(`SELECT p.id,p.title,c.review_id,v.rating,v.review,CASE WHEN c.review_id IS NULL THEN 'eligible' WHEN v.id IS NULL THEN 'removed' WHEN v.approved=1 THEN 'approved' ELSE 'pending' END AS review_status FROM projects p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id LEFT JOIN project_review_claims c ON c.project_id=p.id LEFT JOIN reviews v ON v.id=c.review_id WHERE r.client_id=? AND p.status='completed' ORDER BY p.created_at DESC LIMIT 100`).bind(user.client_id).all();
   return authJSON({success:true,projects:rows.results});
  }
  if(request.method!=='POST')return authJSON({success:false,error:'Method not allowed'},405);
  assertSameOrigin(request,env);
  const b=await readAuthJSON(request), review=typeof b.review==='string'?b.review.trim():'';
  if(typeof b.project_id!=='string'||b.project_id.length>128||!Number.isInteger(b.rating)||b.rating<1||b.rating>5||review.length<10||review.length>2000)return authJSON({success:false,error:'Invalid review'},400);
  const id=crypto.randomUUID();
  try{await env.DB.batch([
   env.DB.prepare(`INSERT INTO reviews(id,client_id,name,business,rating,review,approved) SELECT ?,c.id,substr(c.name,1,100),substr(c.business,1,200),?,?,0 FROM clients c WHERE c.id=?`).bind(id,b.rating,review,user.client_id),
   env.DB.prepare('INSERT INTO project_review_claims(project_id,review_id,client_id) VALUES(?,?,?)').bind(b.project_id,id,user.client_id)
  ]);}catch(e){if(/Review not eligible|UNIQUE constraint failed/.test(String(e.message)))return authJSON({success:false,error:'Project not eligible or already reviewed'},409);throw e;}
  return authJSON({success:true},201);
 }catch(e){return authJSON({success:false,error:'Unable to process project review'},e.status||500);}
}
