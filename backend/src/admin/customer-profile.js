import { authenticateAdmin } from "../utils/auth.js";
import { json } from "../utils/response.js";
import { createId } from "../utils/ids.js";
const reply = (data, status=200) => { const r=json(data,status); r.headers.set("Cache-Control","no-store"); return r; };
export async function handleCustomerProfile(request, env) {
 const match = new URL(request.url).pathname.match(/^\/api\/admin\/customer-profile\/([a-zA-Z0-9_-]{1,128})(?:\/(status|revoke|conversation|notes|activity))?$/);
 if (!match) return null;
 if (!await authenticateAdmin(request,env)) return reply({success:false,error:"Admin authentication required."},401);
 const [,id,action]=match;
 const db=env.DB;
 const customer=await db.prepare(`SELECT c.id,c.name,c.email,c.business,c.website,c.created_at,a.status,a.registered_at,a.last_login_at,a.email_verified_at FROM clients c LEFT JOIN customer_accounts a ON a.client_id=c.id WHERE c.id=?`).bind(id).first();
 if (!customer) return reply({success:false,error:"Customer not found."},404);
 if (!action && request.method==="GET") {
  const conversations=await db.prepare("SELECT id,subject,status,updated_at FROM conversations WHERE client_id=? ORDER BY updated_at DESC LIMIT 100").bind(id).all();
  const sessions=await db.prepare("SELECT COUNT(*) AS count FROM customer_sessions WHERE client_id=? AND revoked_at IS NULL AND expires_at>?").bind(id,new Date().toISOString()).first();
  return reply({success:true,customer,conversations:conversations.results||[],activeSessions:sessions.count});
 }
 if(action==="notes" && request.method==="GET") {
  const rows=await db.prepare("SELECT id,note,created_at FROM customer_internal_notes WHERE client_id=? ORDER BY created_at DESC,id DESC LIMIT 100").bind(id).all();
  return reply({success:true,notes:rows.results||[]});
 }
 if(action==="activity" && request.method==="GET") {
  const rows=await db.prepare(`SELECT kind, detail, created_at FROM (
 SELECT 'registration' AS kind, 'Verified account registered' AS detail, registered_at AS created_at FROM customer_accounts WHERE client_id=?
 UNION ALL SELECT 'authentication', event_type || CASE WHEN provider IS NULL THEN '' ELSE ' (' || provider || ')' END, created_at FROM auth_events WHERE client_id=?
 UNION ALL SELECT 'conversation', subject, created_at FROM conversations WHERE client_id=?
 UNION ALL SELECT 'note', 'Internal note added', created_at FROM customer_internal_notes WHERE client_id=?
) ORDER BY julianday(created_at) DESC, kind, detail LIMIT 100`).bind(id,id,id,id).all();
  return reply({success:true,activity:rows.results||[]});
 }
 if(request.method!=="POST") return reply({success:false,error:"Method not allowed."},405);
 const now=new Date().toISOString();
 if(action==="notes") {
  const body=await request.json().catch(()=>null);
  const note=typeof body?.note==="string"?body.note.trim():"";
  if(!note || note.length>4000) return reply({success:false,error:"Note must contain 1–4000 characters."},400);
  await db.prepare("INSERT INTO customer_internal_notes(id,client_id,note,created_at) VALUES(?,?,?,?)").bind(createId(),id,note,now).run();
  return reply({success:true},201);
 }
 if(action==="status" || action==="revoke") {
  if(!customer.status) return reply({success:false,error:"No registered account."},409);
  let status=customer.status;
  if(action==="status") {
   const body=await request.json().catch(()=>null);
   status=body?.status;
   if(!["active","suspended","disabled"].includes(status)) return reply({success:false,error:"Invalid status."},400);
  }
  const statements=[];
  if(action==="status") statements.push(db.prepare("UPDATE customer_accounts SET status=?,updated_at=? WHERE client_id=?").bind(status,now,id));
  if(action==="revoke" || status!=="active") {
   statements.push(db.prepare("UPDATE customer_sessions SET revoked_at=? WHERE client_id=? AND revoked_at IS NULL").bind(now,id));
   statements.push(db.prepare("DELETE FROM sessions WHERE client_id=?").bind(id));
  }
  statements.push(db.prepare("INSERT INTO auth_events(id,client_id,event_type,created_at) VALUES(?,?,?,?)").bind(createId(),id,action==="revoke"?"admin_sessions_revoked":"admin_status_"+status,now));
  await db.batch(statements);
  return reply({success:true});
 }
 if(action==="conversation") {
  await db.prepare("INSERT INTO conversations(id,client_id,subject,status,created_at,updated_at) SELECT ?,?,'Customer conversation','open',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE client_id=?)").bind(createId(),id,id).run();
  const conversation=await db.prepare("SELECT id FROM conversations WHERE client_id=? ORDER BY updated_at DESC,id DESC LIMIT 1").bind(id).first();
  return reply({success:true,conversationId:conversation.id});
 }
 return reply({success:false,error:"Unknown action."},404);
}
