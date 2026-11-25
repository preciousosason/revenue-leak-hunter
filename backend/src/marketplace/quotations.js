import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,assertSameOrigin,readAuthJSON,authJSON} from '../auth/security.js';
import {json} from '../utils/response.js';
const base='/api/marketplace/quotations';
async function list(db,where,id){const rows=(await db.prepare(`SELECT q.*,q.subtotal_minor-q.discount_minor AS total_minor FROM quotations q JOIN service_requests r ON r.id=q.request_id WHERE ${where}=? ORDER BY q.created_at DESC,q.revision DESC LIMIT 100`).bind(id).all()).results;for(const q of rows)q.items=(await db.prepare('SELECT description,quantity,unit_minor FROM quotation_items WHERE quotation_id=? ORDER BY position').bind(q.id).all()).results;return rows;}
export async function handleQuotations(request,env){
 const path=new URL(request.url).pathname,method=request.method,db=env.DB;
 const admin=path.match(/^\/api\/admin\/request-quotations\/([\w-]{1,128})$/);
 if(!admin&&path!==base&&!path.startsWith(base+'/'))return null;
 const reply=admin?json:authJSON;const fail=(error,status=400)=>reply({success:false,error},status);
 try{
 if(admin){if(!await authenticateAdmin(request,env))return fail('Unauthorized',401);
 const rid=admin[1];if(method==='GET')return reply({success:true,quotations:await list(db,'q.request_id',rid)});
 if(method!=='POST')return fail('Method not allowed',405);
 const req=await db.prepare('SELECT id,status FROM service_requests WHERE id=?').bind(rid).first();if(!req)return fail('Request not found',404);if(['closed','cancelled'].includes(req.status))return fail('Request is closed',409);
 if(await db.prepare("SELECT id FROM quotations WHERE request_id=? AND status='accepted'").bind(rid).first())return fail('Accepted quotation already exists',409);
 const b=await readAuthJSON(request);const items=b.items,currency=b.currency,terms=b.terms,discount=b.discountMinor,deposit=b.depositMinor,days=b.validDays;
 const money=x=>Number.isSafeInteger(x)&&x>=0&&x<=100000000000;
 if(!Array.isArray(items)||!items.length||items.length>30||!['USD','NGN','GBP','EUR'].includes(currency)||typeof terms!=='string'||terms.length>4000||!money(discount)||!money(deposit)||!Number.isInteger(days)||days<1||days>90)return fail('Invalid quotation fields');
 let subtotal=0;for(const i of items){if(!i||typeof i.description!=='string'||!i.description.trim()||i.description.length>300||!Number.isInteger(i.quantity)||i.quantity<1||i.quantity>100||!money(i.unitMinor))return fail('Invalid quotation item');subtotal+=i.quantity*i.unitMinor;}
 if(!money(subtotal)||discount>subtotal||deposit>subtotal-discount)return fail('Invalid totals');
 const id=crypto.randomUUID(),expires=new Date(Date.now()+days*86400000).toISOString();
 await db.batch([db.prepare("UPDATE quotations SET status='superseded' WHERE request_id=? AND status='sent'").bind(rid),db.prepare('INSERT INTO quotations(id,request_id,revision,currency,subtotal_minor,discount_minor,deposit_minor,terms,expires_at) SELECT ?,?,COALESCE(MAX(revision),0)+1,?,?,?,?,?,? FROM quotations WHERE request_id=?').bind(id,rid,currency,subtotal,discount,deposit,terms,expires,rid),...items.map((i,n)=>db.prepare('INSERT INTO quotation_items(quotation_id,position,description,quantity,unit_minor) VALUES(?,?,?,?,?)').bind(id,n,i.description.trim(),i.quantity,i.unitMinor))]);return reply({success:true,id},201);
 }
 assertTrustedHost(request,env);if(method!=='GET')assertSameOrigin(request,env);const c=await authenticateCustomer(request,env);if(!c)return fail('Sign in required',401);
 if(path===base&&method==='GET')return reply({success:true,quotations:await list(db,'r.client_id',c.client_id)});
 const m=path.match(/^\/api\/marketplace\/quotations\/([\w-]+)\/respond$/);if(!m||method!=='POST')return fail('Not found',404);
 const b=await readAuthJSON(request);if(!['accepted','declined','revision_requested'].includes(b.status)||typeof b.note!=='string'||b.note.length>4000)return fail('Invalid response');
 const result=await db.prepare("UPDATE quotations SET status=?,response_note=?,responded_at=CURRENT_TIMESTAMP WHERE id=? AND status='sent' AND julianday(expires_at)>julianday('now') AND EXISTS(SELECT 1 FROM service_requests r WHERE r.id=quotations.request_id AND r.client_id=? AND r.status NOT IN ('closed','cancelled'))").bind(b.status,b.note,m[1],c.client_id).run();if(!result.meta.changes)return fail('Quotation unavailable or expired',409);return reply({success:true});
 }catch(e){return fail(e.status?e.message:'Quotation operation unavailable',e.status||500);}
}
