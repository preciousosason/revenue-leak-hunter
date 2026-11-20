import { authenticateAdmin } from '../utils/auth.js';
import { CORS_HEADERS } from '../config/cors.js';
const base='/api/admin/marketplace/categories';
const pub='/api/marketplace/categories';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...CORS_HEADERS,'Content-Type':'application/json','Cache-Control':'no-store'}});
const fail=(error,status=400)=>reply({success:false,error},status);
const ok=(data,status=200)=>reply({success:true,data},status);
const idPattern=/^[a-f0-9]{32}$/;
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const listSQL=`WITH RECURSIVE descendants(root,id) AS (
 SELECT id,id FROM marketplace_categories UNION
 SELECT d.root,c.id FROM descendants d JOIN marketplace_categories c ON c.parent_id=d.id
), counts AS (
 SELECT d.root,COUNT(DISTINCT s.id) AS service_count FROM descendants d
 JOIN marketplace_service_categories m ON m.category_id=d.id
 JOIN marketplace_services s ON s.id=m.service_id AND s.status='published' GROUP BY d.root
) SELECT c.*,COALESCE(counts.service_count,0) AS service_count FROM marketplace_categories c
 LEFT JOIN counts ON counts.root=c.id ORDER BY c.sort_order,c.name,c.id`;
export async function handleMarketplaceCategoryRoutes(request,env){
 const path=new URL(request.url).pathname;
 const method=request.method;
 const isPublic=path===pub;
 if(!isPublic && path!==base && !path.startsWith(base+'/')) return null;
 if(!isPublic){
  const session=await authenticateAdmin(request,env);
  if(!session || !Number.isFinite(Date.parse(session.expires_at)) || Date.parse(session.expires_at)<=Date.now()) return fail('Unauthorized',401);
 }
 const db=env.DB;
 const id=path.startsWith(base+'/')?path.slice(base.length+1):null;
 if(id!==null&&!idPattern.test(id)) return fail('Category not found',404);
 if(method==='GET' && id===null) return ok((await db.prepare(listSQL).all()).results);
 if(isPublic) return fail('Method not allowed',405);
 const existing=id?await db.prepare('SELECT * FROM marketplace_categories WHERE id=?').bind(id).first():null;
 if(id&&!existing) return fail('Category not found',404);
 if(method==='GET'&&id) return ok(existing);
 if(method==='DELETE'&&id){
  const result=await db.prepare(`DELETE FROM marketplace_categories WHERE id=? AND NOT EXISTS (SELECT 1 FROM marketplace_categories WHERE parent_id=?) AND NOT EXISTS (SELECT 1 FROM marketplace_service_categories WHERE category_id=?)`).bind(id,id,id).run();
  return result.meta.changes?ok({id}):fail('Category has children or service assignments',409);
 }
 if(!((method==='POST'&&!id)||(method==='PATCH'&&id))) return fail('Method not allowed',405);
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return fail('JSON required',415);
 let body;
 try {const reader=request.body?.getReader(); if(!reader) return fail('Body required'); const decoder=new TextDecoder(); let raw='',size=0; while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();return fail('Body too large',413);}raw+=decoder.decode(value,{stream:true});}raw+=decoder.decode();body=JSON.parse(raw);}catch{return fail('Invalid JSON');}
 if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['name','slug','description','parent_id','sort_order'].includes(k))) return fail('Invalid category fields');
 const data={description:'',parent_id:null,sort_order:0,...existing,...body};
 if(typeof data.name!=='string'||!data.name.trim()||data.name.trim().length>120) return fail('Name must contain 1–120 characters');
 data.name=data.name.trim();
 if(!id&&!Object.hasOwn(body,'slug')) data.slug=data.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 if(typeof data.slug!=='string'||data.slug.length>120||!slugPattern.test(data.slug)) return fail('Invalid slug');
 if(typeof data.description!=='string'||data.description.length>2000||!Number.isInteger(data.sort_order)||Math.abs(data.sort_order)>100000) return fail('Invalid description or sort order');
 if(data.parent_id!==null&& (typeof data.parent_id!=='string'||!idPattern.test(data.parent_id)||data.parent_id===id)) return fail('Invalid parent');
 if(id&&data.slug!==existing.slug) return fail('Category slugs are immutable in this phase',409);
 if(data.parent_id && !await db.prepare('SELECT id FROM marketplace_categories WHERE id=?').bind(data.parent_id).first()) return fail('Parent not found',404);
 // Atomic depth check includes the entire moved subtree. Maximum 8 levels.
 const guard=`WITH RECURSIVE ancestors(id,depth) AS (SELECT ?,1 WHERE ? IS NOT NULL UNION ALL SELECT c.parent_id,a.depth+1 FROM ancestors a JOIN marketplace_categories c ON c.id=a.id WHERE c.parent_id IS NOT NULL AND a.depth<9), subtree(id,depth) AS (SELECT ?,1 UNION ALL SELECT c.id,s.depth+1 FROM subtree s JOIN marketplace_categories c ON c.parent_id=s.id WHERE s.depth<9)`;
 const condition=`(SELECT COALESCE(MAX(depth),0) FROM ancestors)+(SELECT MAX(depth) FROM subtree)<=8 AND NOT EXISTS(SELECT 1 FROM ancestors WHERE id=?)`;
 const target=id??crypto.randomUUID().replaceAll('-','');
 try {
 const stmt=id?db.prepare(`${guard} UPDATE marketplace_categories SET name=?,description=?,parent_id=?,sort_order=? WHERE id=? AND ${condition}`).bind(data.parent_id,data.parent_id,target,data.name,data.description,data.parent_id,data.sort_order,target,target):db.prepare(`${guard} INSERT INTO marketplace_categories(id,name,slug,description,parent_id,sort_order) SELECT ?,?,?,?,?,? WHERE ${condition}`).bind(data.parent_id,data.parent_id,target,target,data.name,data.slug,data.description,data.parent_id,data.sort_order,target);
 const result=await stmt.run();if(!result.meta.changes)return fail('Category hierarchy exceeds eight levels or contains a cycle',409);
 }catch(e){if(/unique constraint|foreign key constraint|category cycle/i.test(String(e)))return fail('Category conflicts with existing data',409);throw e;}
 return ok(await db.prepare('SELECT * FROM marketplace_categories WHERE id=?').bind(target).first(),id?200:201);
}
