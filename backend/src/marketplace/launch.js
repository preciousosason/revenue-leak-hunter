import {authenticateAdmin} from '../utils/auth.js';
import {CORS_HEADERS} from '../config/cors.js';

const admin='/api/admin/marketplace/launch/';
const publicMedia='/api/marketplace/media/';
const idOK=x=>typeof x==='string'&&/^[a-f0-9]{32}$/.test(x);
const reply=(data,status=200)=>Response.json({success:status<400,...(status<400?{data}:{error:data})},{status,headers:{...CORS_HEADERS,'Cache-Control':'no-store'}});
const error=(message,status=400)=>reply(message,status);
const dbGet=(db,sql,...args)=>db.prepare(sql).bind(...args).first();
async function eligible(db,id){
 const service=await dbGet(db,'SELECT id,title,summary,description,status FROM marketplace_services WHERE id=?',id);
 if(!service)return {error:'Service not found',status:404};
 const checks=await Promise.all([
  dbGet(db,'SELECT COUNT(*) n FROM marketplace_service_categories WHERE service_id=?',id),
  dbGet(db,"SELECT COUNT(*) n FROM marketplace_offers WHERE service_id=? AND active=1 AND (model='quote' OR price_minor>=0)",id),
  dbGet(db,"SELECT COUNT(*) n FROM marketplace_service_content WHERE service_id=? AND kind='deliverable'",id),
  dbGet(db,"SELECT COUNT(*) n FROM marketplace_media WHERE service_id=? AND role='thumbnail'",id)
 ]);
 const issues=[];
 if(!service.title?.trim()||!service.summary?.trim()||!service.description?.trim())issues.push('Title, summary and description are required');
 if(!checks[0].n)issues.push('Assign at least one category');
 if(!checks[1].n)issues.push('Add an active offer');
 if(!checks[2].n)issues.push('Add at least one deliverable');
 if(!checks[3].n)issues.push('Upload a thumbnail');
 return {service,issues};
}
export async function handleMarketplaceLaunchRoutes(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(path.startsWith(publicMedia)){
  if(request.method!=='GET'&&request.method!=='HEAD')return error('Method not allowed',405);
  const id=path.slice(publicMedia.length);if(!idOK(id))return error('Not found',404);
  const media=await dbGet(env.DB,`SELECT m.object_key,m.alt_text FROM marketplace_media m JOIN marketplace_services s ON s.id=m.service_id WHERE m.id=? AND s.status='published'`,id);
  if(!media)return error('Not found',404);
  const object=await env.FILES.get(media.object_key);if(!object)return error('Not found',404);
  const headers=new Headers({'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'});
  return new Response(request.method==='HEAD'?null:object.body,{headers});
 }
 if(!path.startsWith(admin))return null;
 const session=await authenticateAdmin(request,env);
 if(!session||Date.parse(session.expires_at)<=Date.now())return error('Unauthorized',401);
 const parts=path.slice(admin.length).split('/');const [action,id,extra]=parts;
 if(!idOK(id)||extra!==undefined)return error('Not found',404);
 if(action==='validate'&&request.method==='GET'){
  const v=await eligible(env.DB,id);return v.error?error(v.error,v.status):reply({ready:v.issues.length===0,issues:v.issues,status:v.service.status});
 }
 if(action==='publish'&&request.method==='POST'){
  const v=await eligible(env.DB,id);if(v.error)return error(v.error,v.status);
  if(v.issues.length)return error('Publishing blocked: '+v.issues.join('; '),409);
  await env.DB.prepare("UPDATE marketplace_services SET status='published',published_at=COALESCE(published_at,?),updated_at=? WHERE id=? AND status IN ('draft','published')").bind(new Date().toISOString(),new Date().toISOString(),id).run();
  return reply({status:'published'});
 }
 if(action==='unpublish'&&request.method==='POST'){
  await env.DB.prepare("UPDATE marketplace_services SET status='draft',updated_at=? WHERE id=? AND status='published'").bind(new Date().toISOString(),id).run();return reply({status:'draft'});
 }
 if(action==='media'&&request.method==='GET'){
  const rows=(await env.DB.prepare('SELECT id,alt_text,role,sort_order FROM marketplace_media WHERE service_id=? ORDER BY sort_order,id').bind(id).all()).results;
  return reply(rows);
 }
 if(action==='media'&&request.method==='POST'){
  const service=await dbGet(env.DB,'SELECT status FROM marketplace_services WHERE id=?',id);
  if(!service)return error('Service not found',404);
  if(service.status!=='draft')return error('Unpublish before editing media',409);
  const size=Number(request.headers.get('content-length')||0);if(size>6*1024*1024)return error('Upload too large (maximum 5 MB)',413);
  const form=await request.formData(),file=form.get('file'),role=form.get('role'),alt=String(form.get('alt_text')||'').trim();
  if(!(file instanceof File)||file.size===0||file.size>5*1024*1024)return error('Image must be between 1 byte and 5 MB');
  const mime=file.type.toLowerCase();if(!['image/jpeg','image/png','image/webp','image/avif'].includes(mime))return error('Only JPEG, PNG, WebP and AVIF are allowed');
  if(!['thumbnail','gallery'].includes(role)||!alt||alt.length>200)return error('Image role and alt text are required');
  const count=await dbGet(env.DB,'SELECT COUNT(*) n FROM marketplace_media WHERE service_id=?',id);if(count.n>=12)return error('Maximum 12 images per service',409);
  const mediaId=crypto.randomUUID().replaceAll('-',''),key=`marketplace/${id}/${mediaId}`;
  // The MIME allowlist is checked before storage. Browser-provided MIME is not proof of file contents.
  const bytes=await file.arrayBuffer();await env.FILES.put(key,bytes,{httpMetadata:{contentType:mime}});
  try{
   if(role==='thumbnail')await env.DB.prepare("DELETE FROM marketplace_media WHERE service_id=? AND role='thumbnail'").bind(id).run();
   await env.DB.prepare('INSERT INTO marketplace_media(id,service_id,object_key,alt_text,role,sort_order) VALUES(?,?,?,?,?,?)').bind(mediaId,id,key,alt,role,count.n).run();
  }catch(e){await env.FILES.delete(key);throw e;}
  return reply({id:mediaId,url:'/api/marketplace/media/'+mediaId},201);
 }
 if(action==='media'&&request.method==='DELETE'){
  const mediaId=url.searchParams.get('media_id');if(!idOK(mediaId))return error('Invalid media ID');
  const media=await dbGet(env.DB,'SELECT m.object_key,s.status FROM marketplace_media m JOIN marketplace_services s ON s.id=m.service_id WHERE m.id=? AND m.service_id=?',mediaId,id);
  if(!media)return error('Image not found',404);if(media.status!=='draft')return error('Unpublish before editing media',409);
  await env.DB.prepare('DELETE FROM marketplace_media WHERE id=? AND service_id=?').bind(mediaId,id).run();
  await env.FILES.delete(media.object_key);return reply({deleted:true});
 }
 return error('Method not allowed',405);
}
