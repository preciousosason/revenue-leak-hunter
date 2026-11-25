import {authenticateAdmin} from '../utils/auth.js';
import {authenticateCustomer} from '../auth/sessions.js';
import {assertTrustedHost,getTrustedOrigin,authJSON,readAuthJSON} from '../auth/security.js';
const currencies=['USD','NGN','GBP','EUR'];
export async function handlePaymentInstructions(request,env){
 const path=new URL(request.url).pathname;
 const admin=path==='/api/admin/payment-instructions';
 if(!admin&&path!=='/api/marketplace/payment-instructions')return null;
 const reply=(data,status=200)=>authJSON(data,status,admin?{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'}:{});
 try{
 if(admin){
  if(!await authenticateAdmin(request,env))return reply({success:false,error:'Unauthorized'},401);
  if(request.method==='GET')return reply({success:true,instructions:(await env.DB.prepare('SELECT currency,instructions,active,updated_at FROM payment_instructions ORDER BY currency').all()).results});
  if(request.method!=='POST')return reply({success:false,error:'Method not allowed'},405);
  if(request.headers.get('Origin')!==getTrustedOrigin(env))return reply({success:false,error:'Untrusted origin'},403);
  const b=await readAuthJSON(request),instructions=typeof b.instructions==='string'?b.instructions.trim():'';
  if(!currencies.includes(b.currency)||!instructions||instructions.length>3000||typeof b.active!=='boolean')return reply({success:false,error:'Invalid payment instructions'},400);
  await env.DB.prepare('INSERT INTO payment_instructions(currency,instructions,active) VALUES(?,?,?) ON CONFLICT(currency) DO UPDATE SET instructions=excluded.instructions,active=excluded.active,updated_at=CURRENT_TIMESTAMP').bind(b.currency,instructions,b.active?1:0).run();
  return reply({success:true});
 }
 assertTrustedHost(request,env);
 if(request.method!=='GET')return reply({success:false,error:'Method not allowed'},405);
 const c=await authenticateCustomer(request,env);if(!c)return reply({success:false,error:'Sign in required'},401);
 const rows=(await env.DB.prepare("SELECT i.currency,i.instructions FROM payment_instructions i WHERE i.active=1 AND EXISTS(SELECT 1 FROM quotations q JOIN service_requests r ON r.id=q.request_id WHERE r.client_id=? AND q.status='accepted' AND q.currency=i.currency)").bind(c.client_id).all()).results;
 return reply({success:true,instructions:rows});
 }catch(e){return reply({success:false,error:'Payment instructions unavailable'},e.status||500);}
}
