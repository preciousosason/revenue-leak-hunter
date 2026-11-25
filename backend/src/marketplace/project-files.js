import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,assertSameOrigin,authJSON,secureAuthHeaders,getTrustedOrigin} from '../auth/security.js';
import {createRateKey,consumeRateLimit} from '../auth/rate-limit.js';
const MAX=10485760;
async function readForm(request){const reader=request.body?.getReader();if(!reader)throw Object.assign(Error('Missing body'),{status:400});let size=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX+16384){await reader.cancel();throw Object.assign(Error('Too large'),{status:413});}chunks.push(value);}}finally{reader.releaseLock();}return new Response(new Blob(chunks),{headers:{'Content-Type':request.headers.get('Content-Type')}}).formData();}
export async function handleProjectFiles(request,env){
 const url=new URL(request.url),match=url.pathname.match(/^\/api\/(admin|marketplace)\/project-files(?:\/([\w-]{1,128}))?$/);if(!match)return null;
 const admin=match[1]==='admin',id=match[2],cors=admin?{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'}:{};
 const reply=(data,status=200)=>authJSON(data,status,cors),fail=(error,status=400)=>reply({success:false,error},status);
 try{let account;if(admin){if(!await authenticateAdmin(request,env))return fail('Unauthorized',401);}else{assertTrustedHost(request,env);account=await authenticateCustomer(request,env);if(!account)return fail('Sign in required',401);}
 const owner=admin?'':' AND r.client_id=?',args=admin?[]:[account.client_id],join=' JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id';
 if(id){if(request.method!=='GET')return fail('Method not allowed',405);const row=await env.DB.prepare('SELECT f.* FROM project_files f JOIN projects p ON p.id=f.project_id'+join+' WHERE f.id=?'+owner).bind(id,...args).first();if(!row)return fail('Not found',404);const obj=await env.FILES.get(row.object_key);if(!obj)return fail('File unavailable',404);return new Response(obj.body,{headers:secureAuthHeaders({...cors,'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="${row.filename}"`,'X-Content-Type-Options':'nosniff'})});}
 if(request.method==='GET'){const project=url.searchParams.get('project_id')||'';const p=await env.DB.prepare('SELECT p.id FROM projects p'+join+' WHERE p.id=?'+owner).bind(project,...args).first();if(!p)return fail('Not found',404);const files=(await env.DB.prepare('SELECT id,filename,size_bytes,uploaded_by,created_at FROM project_files WHERE project_id=? ORDER BY created_at DESC,id LIMIT 200').bind(project).all()).results;return reply({success:true,files});}
 if(request.method!=='POST')return fail('Method not allowed',405);if(admin){if(request.headers.get('Origin')!==getTrustedOrigin(env))return fail('Untrusted origin',403);}else assertSameOrigin(request,env);
 const rate=await consumeRateLimit(env.DB,await createRateKey(env.AUTH_SECRET,'project-upload',admin?'admin':account.client_id),{limit:30,windowSeconds:3600});if(!rate.allowed)return fail('Upload limit reached',429);
 if(!/^multipart\/form-data;/i.test(request.headers.get('Content-Type')||''))return fail('Multipart required',415);
 const form=await readForm(request),project=form.get('project_id'),file=form.get('file');if(typeof project!=='string'||!file||typeof file.arrayBuffer!=='function'||file.size<1||file.size>MAX)return fail('Invalid file');
 const p=await env.DB.prepare('SELECT p.status FROM projects p'+join+' WHERE p.id=?'+owner).bind(project,...args).first();if(!p)return fail('Not found',404);if(!['active','paused'].includes(p.status))return fail('Project closed',409);
 const bytes=new Uint8Array(await file.arrayBuffer()),ext=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10'?'png':String.fromCharCode(...bytes.slice(0,5))==='%PDF-'?'pdf':null;if(!ext)return fail('Only PDF, PNG and JPEG accepted',415);
 const filename=(String(file.name).replace(/\.[^.]*$/,'').replace(/[^a-zA-Z0-9 _-]/g,'_').slice(0,170)||'file')+'.'+ext;
 const fid=crypto.randomUUID(),key='project-files/'+fid+'.'+ext;await env.FILES.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
 await env.DB.prepare('INSERT INTO project_files(id,project_id,object_key,filename,size_bytes,uploaded_by) VALUES(?,?,?,?,?,?)').bind(fid,project,key,filename,bytes.length,admin?'admin':'customer').run();return reply({success:true,id:fid},201);
 }catch(e){return fail(e.status===413?'File too large':'Project file operation failed',e.status||(/Project file limit/.test(String(e.message))?409:500));}
}
