import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,authJSON,readAuthJSON,getTrustedOrigin} from '../auth/security.js';
const base=`SELECT p.*,q.request_id,q.currency,r.client_id,c.name,c.email FROM projects p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id JOIN clients c ON c.id=r.client_id`;
const title=v=>typeof v==='string'&&v.trim().length<=200?v.trim():'';
export async function handleProjects(request,env){
 const url=new URL(request.url),admin=url.pathname==='/api/admin/projects',customer=url.pathname==='/api/marketplace/projects';if(!admin&&!customer)return null;
 const reply=(data,status=200)=>authJSON(data,status,admin?{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'}:{});
 const fail=(error,status=400)=>reply({success:false,error},status);
 try{
 let account;if(admin){if(!await authenticateAdmin(request,env))return fail('Unauthorized',401);}else{assertTrustedHost(request,env);account=await authenticateCustomer(request,env);if(!account)return fail('Sign in required',401);}
 const db=env.DB;
 if(request.method==='GET'){
 const page=Number(url.searchParams.get('page')||1);if(!Number.isSafeInteger(page)||page<1||page>10000)return fail('Invalid page');
 const stmt=db.prepare(base+(admin?'':' WHERE r.client_id=?')+' ORDER BY p.created_at DESC,p.id LIMIT 51 OFFSET ?');const rows=(await (admin?stmt.bind((page-1)*50):stmt.bind(account.client_id,(page-1)*50)).all()).results;const hasMore=rows.length>50;const projects=rows.slice(0,50);
 for(const p of projects){p.milestones=(await db.prepare('SELECT id,title,status FROM project_milestones WHERE project_id=? ORDER BY created_at,id').bind(p.id).all()).results;p.progress=p.milestones.length?Math.floor(100*p.milestones.filter(m=>m.status==='completed').length/p.milestones.length):0;if(!admin){delete p.email;delete p.name;delete p.client_id;}}
 let eligible=[];if(admin)eligible=(await db.prepare(`SELECT q.id,q.request_id,q.currency,q.deposit_minor,c.name,c.email FROM quotations q JOIN service_requests r ON r.id=q.request_id JOIN clients c ON c.id=r.client_id JOIN customer_accounts a ON a.client_id=r.client_id WHERE q.status='accepted' AND r.status NOT IN ('closed','cancelled') AND a.status='active' AND NOT EXISTS(SELECT 1 FROM projects WHERE quotation_id=q.id) AND q.deposit_minor<=COALESCE((SELECT SUM(amount_minor) FROM payment_records WHERE quotation_id=q.id AND status='verified'),0) ORDER BY q.created_at DESC LIMIT 100`).all()).results;
 return reply({success:true,projects,eligible,hasMore});}
 if(!admin||request.method!=='POST')return fail('Method not allowed',405);
 if(request.headers.get('Origin')!==getTrustedOrigin(env))return fail('Untrusted origin',403);
 const b=await readAuthJSON(request);let result;
 if(b.action==='activate'&&title(b.title)&&typeof b.quotation_id==='string'){result=await db.prepare('INSERT INTO projects(id,quotation_id,title) VALUES(?,?,?) RETURNING id').bind(crypto.randomUUID(),b.quotation_id,title(b.title)).first();}
 else if(b.action==='status'&&['active','paused','completed','cancelled'].includes(b.status)){result=await db.prepare('UPDATE projects SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status NOT IN (\'completed\',\'cancelled\') RETURNING id').bind(b.status,b.project_id||'').first();}
 else if(b.action==='add_milestone'&&title(b.title)){result=await db.prepare('INSERT INTO project_milestones(id,project_id,title) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM project_milestones WHERE project_id=?)<100 RETURNING id').bind(crypto.randomUUID(),b.project_id||'',title(b.title),b.project_id||'').first();}
 else if(b.action==='milestone_status'&&['pending','in_progress','completed'].includes(b.status)){result=await db.prepare('UPDATE project_milestones SET status=? WHERE id=? AND project_id=? RETURNING id').bind(b.status,b.milestone_id||'',b.project_id||'').first();}
 else return fail('Invalid project action');
 return result?reply({success:true,id:result.id}):fail('Record unavailable or limit reached',409);
 }catch(e){if(/Project not eligible|Invalid project transition|Project not active|UNIQUE constraint|FOREIGN KEY constraint/i.test(String(e.message)))return fail('Project action conflicts with current records or eligibility',409);return fail('Project operation failed',e.status||500);}
}
