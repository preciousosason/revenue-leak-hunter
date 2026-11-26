import {authenticateCustomer} from '../auth/sessions.js';
import {assertTrustedHost,authJSON} from '../auth/security.js';
export async function handleFileLibrary(request,env){
 const url=new URL(request.url);
 if(url.pathname!=='/api/marketplace/project-files/library')return null;
 try{
  assertTrustedHost(request,env);
  const user=await authenticateCustomer(request,env);
  if(!user)return authJSON({success:false,error:'Sign in required'},401);
  if(request.method!=='GET')return authJSON({success:false,error:'Method not allowed'},405);
  const offset=Number(url.searchParams.get('offset')??'0');
  if(!Number.isSafeInteger(offset)||offset<0||offset>100000)return authJSON({success:false,error:'Invalid offset'},400);
  const rows=(await env.DB.prepare(`SELECT f.id,f.filename,f.size_bytes,f.uploaded_by,f.created_at,p.title AS project_title FROM project_files f JOIN projects p ON p.id=f.project_id JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id WHERE r.client_id=? ORDER BY f.created_at DESC,f.id DESC LIMIT 51 OFFSET ?`).bind(user.client_id,offset).all()).results;
  return authJSON({success:true,files:rows.slice(0,50),nextOffset:rows.length>50?offset+50:null});
 }catch(e){return authJSON({success:false,error:'Unable to load files'},e.status||500);}
}
