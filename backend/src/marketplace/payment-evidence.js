import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,assertSameOrigin,authJSON,secureAuthHeaders} from '../auth/security.js';
import {createRateKey,consumeRateLimit} from '../auth/rate-limit.js';
const MAX=5*1024*1024;
async function bounded(request){const reader=request.body?.getReader();if(!reader)throw Error('Missing receipt');let size=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX+16384){await reader.cancel();throw Object.assign(Error('Receipt too large'),{status:413});}chunks.push(value);}}finally{reader.releaseLock();}return new Response(new Blob(chunks),{headers:{'Content-Type':request.headers.get('Content-Type')}}).formData();}
export async function handlePaymentEvidence(request,env){
 const response=await paymentEvidence(request,env);
 if(!response||!new URL(request.url).pathname.startsWith('/api/admin/payment-evidence/'))return response;
 const headers=new Headers(response.headers);
 headers.set('Access-Control-Allow-Origin',env.AUTH_PUBLIC_ORIGIN||'null');
 headers.set('Vary','Origin');
 headers.set('Access-Control-Expose-Headers','Content-Disposition');
 return new Response(response.body,{status:response.status,headers});
}
async function paymentEvidence(request,env){
 const path=new URL(request.url).pathname;
 const submit=path==='/api/marketplace/payments/submit';
 const download=path.match(/^\/api\/(marketplace|admin)\/payment-evidence\/([\w-]{1,128})$/);
 if(!submit&&!download)return null;
 try{
 const admin=download?.[1]==='admin';let customer;
 if(admin){if(!await authenticateAdmin(request,env))return authJSON({success:false,error:'Unauthorized'},401);}else{assertTrustedHost(request,env);customer=await authenticateCustomer(request,env);if(!customer)return authJSON({success:false,error:'Sign in required'},401);}
 if(download){if(request.method!=='GET')return authJSON({success:false,error:'Method not allowed'},405);
 const sql='SELECT p.evidence_key FROM payment_records p JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id WHERE p.id=?'+(admin?'':' AND r.client_id=?');
 const row=await env.DB.prepare(sql).bind(...(admin?[download[2]]:[download[2],customer.client_id])).first();if(!row)return authJSON({success:false,error:'Not found'},404);
 const object=await env.FILES.get(row.evidence_key);if(!object)return authJSON({success:false,error:'Receipt unavailable'},404);
 return new Response(object.body,{headers:secureAuthHeaders({'Content-Type':'application/octet-stream','Content-Disposition':'attachment; filename="receipt.'+(row.evidence_key.split('.').pop())+'"'})});}
 if(request.method!=='POST')return authJSON({success:false,error:'Method not allowed'},405);assertSameOrigin(request,env);
 const rate=await consumeRateLimit(env.DB,await createRateKey(env.AUTH_SECRET,'payment-submit',customer.client_id),{limit:10,windowSeconds:3600});if(!rate.allowed)return authJSON({success:false,error:'Too many submissions'},429);
 if(!/^multipart\/form-data;/i.test(request.headers.get('Content-Type')||''))return authJSON({success:false,error:'Multipart form required'},415);
 const form=await bounded(request),quote=form.get('quotation_id'),amount=Number(form.get('amount_minor')),reference=String(form.get('reference')||'').trim().toUpperCase(),file=form.get('receipt');
 if(typeof quote!=='string'||!Number.isSafeInteger(amount)||amount<1||amount>100000000000||!reference||reference.length>200||!file||typeof file.arrayBuffer!=='function'||file.size<5||file.size>MAX)return authJSON({success:false,error:'Invalid payment details or receipt'},400);
 const row=await env.DB.prepare("SELECT q.subtotal_minor-q.discount_minor-COALESCE((SELECT SUM(amount_minor) FROM payment_records WHERE quotation_id=q.id AND status='verified'),0) AS balance FROM quotations q JOIN service_requests r ON r.id=q.request_id WHERE q.id=? AND r.client_id=? AND q.status='accepted'").bind(quote,customer.client_id).first();if(!row)return authJSON({success:false,error:'Quotation not found'},404);if(amount>row.balance)return authJSON({success:false,error:'Amount exceeds outstanding balance'},409);
 const bytes=new Uint8Array(await file.arrayBuffer());const ext=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'jpg':bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10'?'png':String.fromCharCode(...bytes.slice(0,5))==='%PDF-'?'pdf':null;if(!ext)return authJSON({success:false,error:'Only PDF, PNG and JPEG receipts are accepted'},415);
 const id=crypto.randomUUID(),key='payment-evidence/'+id+'.'+ext;
 await env.FILES.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
 try{await env.DB.prepare('INSERT INTO payment_records(id,quotation_id,amount_minor,reference,evidence_key) VALUES(?,?,?,?,?)').bind(id,quote,amount,reference,key).run();}catch(e){/* Preserve evidence if commit outcome is uncertain. */return authJSON({success:false,error:'Payment could not be confirmed. Check your ledger before retrying.'},409);}
 return authJSON({success:true,id},201);
 }catch(e){return authJSON({success:false,error:e.status===413?'Receipt too large':'Payment operation failed'},e.status||500);}
}
