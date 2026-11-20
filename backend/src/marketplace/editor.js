import {authenticateAdmin} from '../utils/auth.js';
import {CORS_HEADERS} from '../config/cors.js';
const base='/api/admin/marketplace/editor/';
const reply=(data,status=200)=>Response.json(data,{status,headers:{...CORS_HEADERS,'Cache-Control':'no-store'}});
const fail=(error,status=400)=>reply({success:false,error},status);
const idOk=v=>typeof v==='string'&&/^[a-f0-9]{32}$/.test(v);
const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const uid=()=>crypto.randomUUID().replaceAll('-','');
export async function handleMarketplaceEditorRoutes(request,env){
 const path=new URL(request.url).pathname;if(!path.startsWith(base))return null;
 const session=await authenticateAdmin(request,env);if(!session||!(Date.parse(session.expires_at)>Date.now()))return fail('Unauthorized',401);
 const [id,extra]=path.slice(base.length).split('/');if(!idOk(id)||extra!==undefined)return fail('Not found',404);
 if(request.method!=='PUT')return fail('Method not allowed',405);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return fail('JSON required',415);
 const reader=request.body?.getReader();if(!reader)return fail('Body required');let raw='',size=0;const decoder=new TextDecoder();let b;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();return fail('Body too large',413);}raw+=decoder.decode(value,{stream:true});}b=JSON.parse(raw+decoder.decode());}catch{return fail('Invalid JSON');}
 if(!b||!Array.isArray(b.categories)||!Array.isArray(b.offers)||!Array.isArray(b.content)||b.categories.length>30||b.offers.length>20||b.content.length>40)return fail('Invalid editor data');
 const db=env.DB;const service=await db.prepare('SELECT * FROM marketplace_services WHERE id=?').bind(id).first();if(!service)return fail('Not found',404);if(service.status!=='draft')return fail('Only drafts can be configured',409);
 const cats=[...new Set(b.categories)];if(!cats.every(idOk))return fail('Invalid category');
 for(const c of cats)if(!await db.prepare('SELECT id FROM marketplace_categories WHERE id=?').bind(c).first())return fail('Category not found',404);
 for(const o of b.offers){if(!o||!text(o.name,120)||!['task','package','weekly','quote'].includes(o.model)||o.currency!=='USD'||!([0,1].includes(o.active))||(o.model==='quote'?o.price_minor!==null:!Number.isSafeInteger(o.price_minor)||o.price_minor<0||o.price_minor>100000000)||!(o.delivery_days===null||Number.isInteger(o.delivery_days)&&o.delivery_days>0&&o.delivery_days<=365))return fail('Invalid offer');}
 for(const c of b.content)if(!c||!['scope','deliverable','exclusion','requirement','faq'].includes(c.kind)||!text(c.title,160)||typeof c.body!=='string'||c.body.length>10000)return fail('Invalid content');
 // Preserve existing offer identifiers; removed offers are deactivated, never deleted.
 const existing=(await db.prepare('SELECT id FROM marketplace_offers WHERE service_id=?').bind(id).all()).results.map(o=>o.id);
 const supplied=b.offers.filter(o=>o.id).map(o=>o.id);if(new Set(supplied).size!==supplied.length||supplied.some(x=>!existing.includes(x)))return fail('Invalid offer ID');
 const guard="EXISTS (SELECT 1 FROM marketplace_services WHERE id=? AND status='draft')";
 const stmts=[db.prepare(`DELETE FROM marketplace_service_categories WHERE service_id=? AND ${guard}`).bind(id,id),db.prepare(`DELETE FROM marketplace_service_content WHERE service_id=? AND ${guard}`).bind(id,id),db.prepare(`UPDATE marketplace_offers SET active=0 WHERE service_id=? AND ${guard}`).bind(id,id)];
 for(const c of cats)stmts.push(db.prepare(`INSERT INTO marketplace_service_categories(service_id,category_id) SELECT ?,? WHERE ${guard}`).bind(id,c,id));
 for(const o of b.offers)stmts.push(o.id?db.prepare(`UPDATE marketplace_offers SET name=?,model=?,price_minor=?,currency=?,delivery_days=?,active=? WHERE id=? AND service_id=? AND ${guard}`).bind(o.name.trim(),o.model,o.price_minor,o.currency,o.delivery_days,o.active,o.id,id,id):db.prepare(`INSERT INTO marketplace_offers(id,service_id,name,model,price_minor,currency,delivery_days,active) SELECT ?,?,?,?,?,?,?,? WHERE ${guard}`).bind(uid(),id,o.name.trim(),o.model,o.price_minor,o.currency,o.delivery_days,o.active,id));
 for(const [i,c] of b.content.entries())stmts.push(db.prepare(`INSERT INTO marketplace_service_content(id,service_id,kind,title,body,sort_order) SELECT ?,?,?,?,?,? WHERE ${guard}`).bind(uid(),id,c.kind,c.title.trim(),c.body,i,id));
 stmts.push(db.prepare(`UPDATE marketplace_services SET updated_at=? WHERE id=? AND status='draft'`).bind(new Date().toISOString(),id));
 const result=await db.batch(stmts);if(!result.at(-1).meta.changes)return fail('Draft status changed',409);return reply({success:true,data:{id}});
}
