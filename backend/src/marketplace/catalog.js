import {authenticateAdmin} from '../utils/auth.js';
import {CORS_HEADERS} from '../config/cors.js';
const reply=(data,status=200)=>Response.json(data,{status,headers:{...CORS_HEADERS,'Cache-Control':'no-store'}});
const ok=data=>reply({success:true,data});
const fail=(error,status=400)=>reply({success:false,error},status);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const id=/^[a-f0-9]{32}$/;
const all=async(db,q,...args)=>(await db.prepare(q).bind(...args).all()).results;
const first=(db,q,...args)=>db.prepare(q).bind(...args).first();
async function detail(db,s,publicOnly){
 if(!s)return null;
 const [offers,content,categories,media,related]=await Promise.all([
 all(db,'SELECT * FROM marketplace_offers WHERE service_id=?'+(publicOnly?' AND active=1':''),s.id),
 all(db,'SELECT * FROM marketplace_service_content WHERE service_id=? ORDER BY sort_order,id',s.id),
 all(db,'SELECT c.* FROM marketplace_categories c JOIN marketplace_service_categories m ON m.category_id=c.id WHERE m.service_id=?',s.id),
 all(db,'SELECT id,alt_text,role,sort_order FROM marketplace_media WHERE service_id=? ORDER BY sort_order',s.id),
 all(db,"SELECT s.id,s.slug,s.title FROM marketplace_related_services r JOIN marketplace_services s ON s.id=r.related_id WHERE r.service_id=?"+(publicOnly?" AND s.status='published'":''),s.id)]);
 return {...s,offers,content,categories,media,related};
}
export async function handleMarketplaceCatalogRoutes(request,env){
 const u=new URL(request.url), p=u.pathname, admin='/api/admin/marketplace/services', pub='/api/marketplace/services';
 const a=p===admin||p.startsWith(admin+'/'), b=p===pub||p.startsWith(pub+'/');
 if(!a&&!b)return null;
 const db=env.DB,m=request.method,key=p.slice((a?admin:pub).length+1);
 if(a){const session=await authenticateAdmin(request,env);if(!session||!(Date.parse(session.expires_at)>Date.now()))return fail('Unauthorized',401);}
 if(m==='GET'&&key){const s=await first(db,`SELECT * FROM marketplace_services WHERE ${a?'id':'slug'}=?`+(a?'':" AND status='published'"),key);return s?ok(await detail(db,s,b)):fail('Not found',404);}
 if(m==='GET'){
 const where=[a?'1=1':"s.status='published'"],args=[];
 const search=u.searchParams.get('search')?.slice(0,120);if(search){where.push('(instr(lower(s.title),lower(?))>0 OR instr(lower(s.summary),lower(?))>0)');args.push(search,search);}
 const cat=u.searchParams.get('category');if(cat){where.push('EXISTS (WITH RECURSIVE tree(id) AS (SELECT id FROM marketplace_categories WHERE slug=? UNION SELECT c.id FROM marketplace_categories c JOIN tree t ON c.parent_id=t.id) SELECT 1 FROM marketplace_service_categories m JOIN tree t ON t.id=m.category_id WHERE m.service_id=s.id)');args.push(cat);}
 const offer=['o.service_id=s.id','o.active=1'];for(const [param,field,op] of [['min','price_minor','>='],['max','price_minor','<='],['days','delivery_days','<=']]){if(u.searchParams.has(param)){const n=Number(u.searchParams.get(param));if(!Number.isSafeInteger(n)||n<0)return fail('Invalid filter');offer.push(`o.${field}${op}?`);args.push(n);}}
 if(offer.length>2)where.push('EXISTS (SELECT 1 FROM marketplace_offers o WHERE '+offer.join(' AND ')+')');
 const order=({price:'price_minor IS NULL,price_minor ASC',newest:'s.published_at DESC',title:'s.title ASC'})[u.searchParams.get('sort')]||'s.featured DESC,s.created_at DESC';
 const page=Math.max(1,Math.min(10000,Number(u.searchParams.get('page'))||1));if(!Number.isInteger(page))return fail('Invalid page');
 const rows=await all(db,`SELECT s.*, (SELECT MIN(price_minor) FROM marketplace_offers WHERE service_id=s.id AND active=1 AND currency='USD') price_minor,
(SELECT id FROM marketplace_media WHERE service_id=s.id AND role='thumbnail' LIMIT 1) thumbnail_id FROM marketplace_services s WHERE ${where.join(' AND ')} ORDER BY ${order},s.id LIMIT 25 OFFSET ?`,...args,(page-1)*24);
 return ok({items:rows.slice(0,24),hasMore:rows.length>24,page});}
 if(!a||!['POST','PATCH'].includes(m)|| (m==='POST'&&key)||(m==='PATCH'&&!id.test(key)))return fail('Method not allowed',405);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return fail('JSON required',415);
 const reader=request.body?.getReader();if(!reader)return fail('Body required');let raw='',size=0;const decoder=new TextDecoder();while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();return fail('Body too large',413);}raw+=decoder.decode(value,{stream:true});}let body;try{body=JSON.parse(raw+decoder.decode());}catch{return fail('Invalid JSON');}
 if(!body||Array.isArray(body)||typeof body!=='object')return fail('Invalid body');
 const old=key?await first(db,'SELECT * FROM marketplace_services WHERE id=?',key):null;if(key&&!old)return fail('Not found',404);
 const fields=['title','slug','summary','description','seo_title','seo_description','status','featured'];if(Object.keys(body).some(k=>!fields.includes(k)))return fail('Unsupported field');
 const s={summary:'',description:'',seo_title:null,seo_description:null,status:'draft',featured:0,...old,...body};
 if(typeof s.title!=='string'||!s.title.trim()||s.title.length>160||typeof s.slug!=='string'||!slug.test(s.slug)||s.slug.length>120)return fail('Invalid title or slug');
 for(const k of ['summary','description','seo_title','seo_description'])if(s[k]!==null&&(typeof s[k]!=='string'||s[k].length>20000))return fail('Invalid text');
 if(!['draft','published','archived'].includes(s.status)||![0,1].includes(s.featured))return fail('Invalid status');
 if(old&&old.slug!==s.slug)return fail('Slug changes disabled pending redirect integration',409);
 if(s.status==='published')return fail('Publishing locked until offer and content validation is integrated',409);
 const target=key||crypto.randomUUID().replaceAll('-','');
 try{if(old)await db.prepare('UPDATE marketplace_services SET title=?,summary=?,description=?,seo_title=?,seo_description=?,status=?,featured=?,updated_at=? WHERE id=?').bind(s.title,s.summary,s.description,s.seo_title,s.seo_description,s.status,s.featured,new Date().toISOString(),target).run();else await db.prepare('INSERT INTO marketplace_services(id,title,slug,summary,description,seo_title,seo_description,status,featured) VALUES(?,?,?,?,?,?,?,?,?)').bind(target,s.title,s.slug,s.summary,s.description,s.seo_title,s.seo_description,s.status,s.featured).run();}catch(e){if(String(e).includes('UNIQUE'))return fail('Slug conflict',409);throw e;}
 return ok(await detail(db,await first(db,'SELECT * FROM marketplace_services WHERE id=?',target),false));
}
