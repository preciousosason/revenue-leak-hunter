import {authenticateAdmin} from '../utils/auth.js';
import {authJSON,getTrustedOrigin} from '../auth/security.js';
export async function handleAdminQueues(request,env){
 const url=new URL(request.url),kind=url.pathname.match(/^\/api\/admin\/work-queue\/(requests|inbox)$/)?.[1];if(!kind)return null;
 const headers={'Access-Control-Allow-Origin':getTrustedOrigin(env),'Vary':'Origin'};
 const reply=(data,status=200)=>authJSON(data,status,headers);
 try{if(!await authenticateAdmin(request,env))return reply({success:false,error:'Unauthorized'},401);
 if(request.method!=='GET')return reply({success:false,error:'Method not allowed'},405);
 const offset=Number(url.searchParams.get('offset')??'0');if(!Number.isSafeInteger(offset)||offset<0||offset>100000)return reply({success:false,error:'Invalid offset'},400);
 const sql=kind==='requests'?`SELECT r.id,r.client_id,r.conversation_id,r.status,r.created_at,c.name,c.email FROM service_requests r JOIN clients c ON c.id=r.client_id ORDER BY r.created_at DESC,r.id DESC LIMIT 51 OFFSET ?`:`SELECT v.id,v.client_id,v.subject,v.status,v.updated_at,c.name,c.email FROM conversations v JOIN clients c ON c.id=v.client_id ORDER BY v.updated_at DESC,v.id DESC LIMIT 51 OFFSET ?`;
 const rows=(await env.DB.prepare(sql).bind(offset).all()).results;return reply({success:true,rows:rows.slice(0,50),nextOffset:rows.length>50?offset+50:null});
 }catch(e){return reply({success:false,error:'Unable to load queue'},500);}
}
