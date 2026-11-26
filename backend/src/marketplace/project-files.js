import {authenticateCustomer} from '../auth/sessions.js';
import {authenticateAdmin} from '../utils/auth.js';
import {assertTrustedHost,assertSameOrigin,authJSON,secureAuthHeaders,getTrustedOrigin} from '../auth/security.js';
import {createRateKey,consumeRateLimit} from '../auth/rate-limit.js';
import {
    detectProjectFile
} from './file-policy.js';
const MAX=10485760;
async function readForm(request){const reader=request.body?.getReader();if(!reader)throw Object.assign(Error('Missing body'),{status:400});let size=0;const chunks=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX+16384){await reader.cancel();throw Object.assign(Error('Too large'),{status:413});}chunks.push(value);}}finally{reader.releaseLock();}return new Response(new Blob(chunks),{headers:{'Content-Type':request.headers.get('Content-Type')}}).formData();}
export async function handleProjectFiles(request,env){
 const url=new URL(request.url),match=url.pathname.match(/^\/api\/(admin|marketplace)\/project-files(?:\/([\w-]{1,128}))?$/);if(!match)return null;
 const admin=match[1]==='admin',id=match[2],cors=admin?{'Access-Control-Allow-Origin':env.AUTH_PUBLIC_ORIGIN||'null','Vary':'Origin'}:{};
 const reply=(data,status=200)=>authJSON(data,status,cors),fail=(error,status=400)=>reply({success:false,error},status);
 try{let account;if(admin){if(!await authenticateAdmin(request,env))return fail('Unauthorized',401);}else{assertTrustedHost(request,env);account=await authenticateCustomer(request,env);if(!account)return fail('Sign in required',401);}
 const owner=admin?'':' AND r.client_id=?',args=admin?[]:[account.client_id],join=' JOIN quotations q ON q.id=p.quotation_id JOIN service_requests r ON r.id=q.request_id';
 if(id){if(request.method!=='GET')return fail('Method not allowed',405);const row=await env.DB.prepare('SELECT f.* FROM project_files f JOIN projects p ON p.id=f.project_id'+join+' WHERE f.id=?'+owner).bind(id,...args).first();if(!row)return fail('Not found',404);const obj=await env.FILES.get(row.object_key);if(!obj)return fail('File unavailable',404);return new Response(obj.body,{headers:secureAuthHeaders({...cors,'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="${row.filename}"`,'X-Content-Type-Options':'nosniff'})});}
 if(request.method==='GET'){const project=url.searchParams.get('project_id')||'';const p=await env.DB.prepare('SELECT p.id FROM projects p'+join+' WHERE p.id=?'+owner).bind(project,...args).first();if(!p)return fail('Not found',404);const files=(await env.DB.prepare(`
        SELECT
            f.id,
            f.filename,
            f.size_bytes,
            f.uploaded_by,
            f.created_at,
            COALESCE(v.version_number, 1) AS version_number,
            v.previous_file_id,
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM project_file_versions next
                    WHERE next.previous_file_id = f.id
                ) THEN 0
                ELSE 1
            END AS is_latest
        FROM project_files f
        LEFT JOIN project_file_versions v ON v.file_id = f.id
        WHERE f.project_id = ?
        ORDER BY f.created_at DESC, f.id
        LIMIT 200
    `).bind(project).all()).results;return reply({success:true,files});}
 if(request.method!=='POST')return fail('Method not allowed',405);if(admin){if(request.headers.get('Origin')!==getTrustedOrigin(env))return fail('Untrusted origin',403);}else assertSameOrigin(request,env);
 const rate=await consumeRateLimit(env.DB,await createRateKey(env.AUTH_SECRET,'project-upload',admin?'admin':account.client_id),{limit:30,windowSeconds:3600});if(!rate.allowed)return fail('Upload limit reached',429);
 if(!/^multipart\/form-data;/i.test(request.headers.get('Content-Type')||''))return fail('Multipart required',415);
 const form=await readForm(request),project=form.get('project_id'),file=form.get('file');if(typeof project!=='string'||!file||typeof file.arrayBuffer!=='function'||file.size<1||file.size>MAX)return fail('Invalid file');
 const p=await env.DB.prepare('SELECT p.status FROM projects p'+join+' WHERE p.id=?'+owner).bind(project,...args).first();if(!p)return fail('Not found',404);if(!['active','paused'].includes(p.status))return fail('Project closed',409);
const bytes = new Uint8Array(
    await file.arrayBuffer()
);

const ext = detectProjectFile(
    bytes,
    file.name
);

if (!ext) {

    return fail(
        'Unsupported, invalid or unsafe file format. ' +
        'Accepted formats: PDF, PNG, JPG, DOCX, XLSX, CSV and ZIP.',
        415
    );

}
 const filename=(String(file.name).replace(/\.[^.]*$/,'').replace(/[^a-zA-Z0-9 _-]/g,'_').slice(0,170)||'file')+'.'+ext;
 const previousFileId = form.get('previous_file_id');

const uploaderRole = admin
    ? 'admin'
    : 'customer';

let previousVersion = null;

if (previousFileId !== null) {

    if (
        typeof previousFileId !== 'string' ||
        !/^[\w-]{1,128}$/.test(previousFileId)
    ) {
        return fail('Invalid previous file');
    }

    previousVersion = await env.DB.prepare(`
        SELECT
            f.id,
            COALESCE(v.version_number, 1)
                AS version_number
        FROM project_files f
        LEFT JOIN project_file_versions v
            ON v.file_id = f.id
        WHERE f.id = ?
          AND f.project_id = ?
          AND f.uploaded_by = ?
          AND NOT EXISTS (
              SELECT 1
              FROM project_file_versions next
              WHERE next.previous_file_id = f.id
          )
    `).bind(
        previousFileId,
        project,
        uploaderRole
    ).first();

    if (!previousVersion) {

        return fail(
            'File is not eligible for revision',
            409
        );

    }

}
 const fid=crypto.randomUUID(),key='project-files/'+fid+'.'+ext;await env.FILES.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
const statements = [

    env.DB.prepare(`
        INSERT INTO project_files (
            id,
            project_id,
            object_key,
            filename,
            size_bytes,
            uploaded_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
        fid,
        project,
        key,
        filename,
        bytes.length,
        uploaderRole
    )

];

const versionNumber = previousVersion
    ? Number(previousVersion.version_number) + 1
    : 1;

if (previousVersion) {

    statements.push(

        env.DB.prepare(`
            INSERT INTO project_file_versions (
                file_id,
                previous_file_id,
                version_number
            )
            VALUES (?, ?, ?)
        `).bind(
            fid,
            previousVersion.id,
            versionNumber
        )

    );

}

await env.DB.batch(statements);

return reply({
    success: true,
    id: fid,
    version_number: versionNumber
}, 201);
 }catch(e){return fail(e.status===413?'File too large':'Project file operation failed',e.status||(/Project file limit/.test(String(e.message))?409:500));}
}
