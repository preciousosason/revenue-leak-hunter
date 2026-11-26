import {authenticateAdmin} from '../utils/auth.js';
import {authJSON,getTrustedOrigin} from '../auth/security.js';
import {createRateKey,consumeRateLimit} from '../auth/rate-limit.js';
export async function handleStorageAudit(request,env){
 const url=new URL(request.url);
 if(url.pathname!=='/api/admin/storage-audit')return null;
 const reply=(body,status=200)=>authJSON(body,status,{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'});
 try{
  if(!await authenticateAdmin(request,env))return reply({success:false,error:'Unauthorized'},401);
  if(request.method!=='GET')return reply({success:false,error:'Method not allowed'},405);
  if(request.headers.get('Origin')!==getTrustedOrigin(env))return reply({success:false,error:'Untrusted origin'},403);
  const rate=await consumeRateLimit(env.DB,await createRateKey(env.AUTH_SECRET,'storage-audit','admin'),{limit:60,windowSeconds:3600});
  if(!rate.allowed)return reply({success:false,error:'Rate limit'},429);
  const cursor=url.searchParams.get('cursor')||undefined;
  if(cursor&&cursor.length>4096)return reply({success:false,error:'Invalid cursor'},400);
  const page=await env.FILES.list({prefix:'project-files/',limit:50,...(cursor?{cursor}:{})});
  const candidates=[];
  for(const obj of page.objects){
   if(!/^project-files\/[0-9a-f-]{36}\.(pdf|png|jpg|docx|xlsx|csv|zip)$/i.test(obj.key))continue;
   if(Date.now()-new Date(obj.uploaded).getTime()<86400000)continue;
   const row=await env.DB.prepare('SELECT id FROM project_files WHERE object_key=?').bind(obj.key).first();
   if(!row)candidates.push({key:obj.key,size:obj.size,uploaded:obj.uploaded});
  }
  return reply({success:true,mode:'report-only',scanned:page.objects.length,candidates,next_cursor:page.truncated?page.cursor:null});
 }catch(e){return reply({success:false,error:'Storage audit failed'},500);}
}
