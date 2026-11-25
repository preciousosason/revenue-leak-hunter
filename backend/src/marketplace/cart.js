import { authenticateCustomer } from '../auth/sessions.js';
import { assertTrustedHost, assertSameOrigin, readAuthJSON, authJSON } from '../auth/security.js';
const base='/api/marketplace/cart';
const select=`SELECT c.offer_id,c.quantity,o.name,o.model,o.price_minor,o.currency,s.title,s.slug,
 CASE WHEN o.active=1 AND s.status='published' THEN 1 ELSE 0 END AS available
 FROM customer_cart_items c JOIN marketplace_offers o ON o.id=c.offer_id JOIN marketplace_services s ON s.id=o.service_id WHERE c.client_id=? ORDER BY c.updated_at DESC`;
export async function handleCart(request,env){
 const path=new URL(request.url).pathname;if(path!==base)return null;
 try{
 assertTrustedHost(request,env);if(request.method!=='GET')assertSameOrigin(request,env);
 const customer=await authenticateCustomer(request,env);if(!customer)return authJSON({success:false,error:'Sign in required'},401);
 const id=customer.client_id,db=env.DB;
 if(request.method==='POST'){
 const body=await readAuthJSON(request);const items=body.items;
 if(!Array.isArray(items)||items.length>50||new Set(items.map(x=>x?.offer_id)).size!==items.length||items.some(x=>!x||typeof x.offer_id!=='string'||x.offer_id.length>128||!Number.isInteger(x.quantity)||x.quantity<0||x.quantity>20))return authJSON({success:false,error:'Invalid cart items'},400);
 if(!['merge','set'].includes(body.mode))return authJSON({success:false,error:'Invalid mode'},400);
 const existing=(await db.prepare('SELECT offer_id FROM customer_cart_items WHERE client_id=?').bind(id).all()).results;
 const keys=new Set(existing.map(x=>x.offer_id));for(const x of items){if(x.quantity===0)keys.delete(x.offer_id);else keys.add(x.offer_id);}if(keys.size>50)return authJSON({success:false,error:'Cart limit reached'},400);
 const statements=[];
 for(const x of items){if(x.quantity===0){statements.push(db.prepare('DELETE FROM customer_cart_items WHERE client_id=? AND offer_id=?').bind(id,x.offer_id));continue;}
 const offer=await db.prepare("SELECT o.id FROM marketplace_offers o JOIN marketplace_services s ON s.id=o.service_id WHERE o.id=? AND o.active=1 AND s.status='published'").bind(x.offer_id).first();if(!offer)return authJSON({success:false,error:'An offer is no longer available',offer_id:x.offer_id},409);
 statements.push(db.prepare(`INSERT INTO customer_cart_items(client_id,offer_id,quantity) VALUES(?,?,?) ON CONFLICT(client_id,offer_id) DO UPDATE SET quantity=${body.mode==='merge'?'MAX(customer_cart_items.quantity,excluded.quantity)':'excluded.quantity'},updated_at=CURRENT_TIMESTAMP`).bind(id,x.offer_id,x.quantity));}
 if(statements.length)await db.batch(statements);
 }else if(request.method!=='GET')return authJSON({success:false,error:'Method not allowed'},405);
 const result=await db.prepare(select).bind(id).all();return authJSON({success:true,items:result.results});
 }catch(e){return authJSON({success:false,error:e.status?e.message:'Cart unavailable'},e.status||500);}
}
