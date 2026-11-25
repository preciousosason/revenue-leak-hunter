import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,assertSameOrigin,readAuthJSON,authJSON} from '../auth/security.js';
import {json} from '../utils/response.js';
const base='/api/marketplace/requests';
const listSQL='SELECT id,conversation_id,requirements,status,created_at,updated_at FROM service_requests WHERE client_id=? ORDER BY created_at DESC LIMIT 100';
async function list(db,id){const rows=(await db.prepare(listSQL).bind(id).all()).results;for(const row of rows)row.items=(await db.prepare('SELECT * FROM service_request_items WHERE request_id=?').bind(row.id).all()).results;return rows;}
export async function handleRequests(request,env){
 const path=new URL(request.url).pathname, method=request.method,db=env.DB;
 const admin=path.match(/^\/api\/admin\/customer-requests\/([\w-]{1,128})$/);
 if(admin){if(!await authenticateAdmin(request,env))return json({success:false,error:'Unauthorized'},401);if(method!=='GET')return json({success:false,error:'Method not allowed'},405);const r=json({success:true,requests:await list(db,admin[1])});r.headers.set('Cache-Control','no-store');return r;}
 if(path!==base&&!path.startsWith(base+'/'))return null;
 try{assertTrustedHost(request,env);if(method!=='GET')assertSameOrigin(request,env);
 const customer=await authenticateCustomer(request,env);if(!customer)return authJSON({success:false,error:'Sign in required'},401);const id=customer.client_id;
 if(path===base&&method==='GET')return authJSON({success:true,requests:await list(db,id)});
 if(path===base&&method==='POST'){
 const body=await readAuthJSON(request),key=body.submissionKey,requirements=typeof body.requirements==='string'?body.requirements.trim():'';
 if(typeof key!=='string'||!/^[\w-]{16,100}$/.test(key)||requirements.length>5000)return authJSON({success:false,error:'Invalid request'},400);
 const prior=()=>db.prepare('SELECT id FROM service_requests WHERE client_id=? AND submission_key=?').bind(id,key).first();let old=await prior();if(old)return authJSON({success:true,id:old.id});
 const rid=crypto.randomUUID(),cid=crypto.randomUUID();
 const valid=`EXISTS(SELECT 1 FROM customer_cart_items WHERE client_id=?) AND NOT EXISTS(SELECT 1 FROM customer_cart_items c LEFT JOIN marketplace_offers o ON o.id=c.offer_id LEFT JOIN marketplace_services s ON s.id=o.service_id WHERE c.client_id=? AND (o.id IS NULL OR o.active<>1 OR s.status<>'published')) AND (SELECT COUNT(*) FROM customer_cart_items WHERE client_id=?)<=50`;
 try{await db.batch([
 db.prepare(`INSERT INTO conversations(id,client_id,subject,status) SELECT ?,?,?,'open' WHERE ${valid}`).bind(cid,id,'Service request '+rid,id,id,id),
 db.prepare('INSERT INTO service_requests(id,client_id,conversation_id,submission_key,requirements) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM conversations WHERE id=?)').bind(rid,id,cid,key,requirements,cid),
 db.prepare(`INSERT INTO service_request_items(request_id,offer_id,service_title,offer_name,model,price_minor,currency,quantity) SELECT ?,o.id,s.title,o.name,o.model,o.price_minor,o.currency,c.quantity FROM customer_cart_items c JOIN marketplace_offers o ON o.id=c.offer_id JOIN marketplace_services s ON s.id=o.service_id WHERE c.client_id=? AND EXISTS(SELECT 1 FROM service_requests WHERE id=?)`).bind(rid,id,rid),
 db.prepare("INSERT INTO messages(id,conversation_id,sender_type,message) SELECT ?,?,'client',? WHERE EXISTS(SELECT 1 FROM service_requests WHERE id=?)").bind(crypto.randomUUID(),cid,requirements||'Service consultation requested.',rid),
 db.prepare("INSERT INTO notifications(id,client_id,type,title,message) SELECT ?,?,'new_message','New service request',? WHERE EXISTS(SELECT 1 FROM service_requests WHERE id=?)").bind(crypto.randomUUID(),id,'Request '+rid,rid),
 db.prepare('DELETE FROM customer_cart_items WHERE client_id=? AND EXISTS(SELECT 1 FROM service_requests WHERE id=?)').bind(id,rid)
 ]);}catch(e){old=await prior();if(old)return authJSON({success:true,id:old.id});throw e;}
 if(!await prior())return authJSON({success:false,error:'Cart empty or contains unavailable offers. Review cart.'},409);return authJSON({success:true,id:rid},201);
 }
 const match=path.match(/^\/api\/marketplace\/requests\/([\w-]+)\/messages$/);if(match){const row=await db.prepare('SELECT conversation_id FROM service_requests WHERE id=? AND client_id=?').bind(match[1],id).first();if(!row)return authJSON({success:false,error:'Not found'},404);
 if(method==='GET'){const messages=(await db.prepare('SELECT id,sender_type,message,created_at FROM messages WHERE conversation_id=? ORDER BY created_at DESC,id DESC LIMIT 100').bind(row.conversation_id).all()).results.reverse();return authJSON({success:true,messages});}
 if(method==='POST'){const body=await readAuthJSON(request),message=typeof body.message==='string'?body.message.trim():'';if(!message||message.length>5000)return authJSON({success:false,error:'Invalid message'},400);await db.batch([db.prepare("INSERT INTO messages(id,conversation_id,sender_type,message) VALUES(?,?,'client',?)").bind(crypto.randomUUID(),row.conversation_id,message),db.prepare('UPDATE conversations SET updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(row.conversation_id),db.prepare("INSERT INTO notifications(id,client_id,type,title,message) VALUES(?,?,'new_message','New Client Message',?)").bind(crypto.randomUUID(),id,'Service request '+match[1])]);return authJSON({success:true},201);}}
 return authJSON({success:false,error:'Not found or method not allowed'},404);
 }catch(e){return authJSON({success:false,error:e.status?e.message:'Request operation unavailable'},e.status||500);}
}
