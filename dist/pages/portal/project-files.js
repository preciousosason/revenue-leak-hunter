export async function renderProjectFiles(root,project,current=()=>true,options={}){
 const base=options.base||'/api/marketplace/project-files',headers=options.headers||(()=>({}));const el=(tag,text,parent=root)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 const request=async(path,init={})=>{const r=await fetch(base+path,{credentials:'same-origin',cache:'no-store',...init,headers:headers()});if(!r.ok)throw Error('File operation failed ('+r.status+')');return r;};
 let revisionTarget = null;

const canUpload = [
    'active',
    'paused'
].includes(project.status);

const uploaderRole = base.startsWith('/api/admin/') ||
    base.includes('/api/admin/')
    ? 'admin'
    : 'customer';
    root.replaceChildren();el('h4','Project files');const notice=el('p','Loading files…');notice.setAttribute('role','status');const list=el('div','');
 async function refresh(){const data=await (await request('?project_id='+encodeURIComponent(project.id))).json();if(!current())return;list.replaceChildren();notice.textContent='';if(!data.files.length)el('p','No files yet.',list);for(const f of data.files){const row=el('div','',list);el(
    'p',
    `${f.filename} · ` +
    `Version ${f.version_number || 1} · ` +
    `${Math.ceil(f.size_bytes / 1024)} KB · ` +
    `${f.uploaded_by} · ` +
    `${f.is_latest ? 'Latest' : 'Previous version'}`,
    row
);

if (
    canUpload &&
    f.is_latest &&
    f.uploaded_by === uploaderRole
) {

    const revise = el(
        'button',
        'Upload revision',
        row
    );

    revise.type = 'button';

    revise.onclick = () => {

        revisionTarget = f.id;

        notice.textContent =
            `Select a replacement file for ${f.filename}. ` +
            `The previous version will be retained.`;

        root.querySelector('input[type="file"]')?.focus();

    };

}const b=el('button','Download',row);b.type='button';b.onclick=async()=>{b.disabled=true;try{const blob=await(await request('/'+encodeURIComponent(f.id))).blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=f.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}catch(e){notice.textContent=e.message;}finally{b.disabled=false;}};}}
 if(['active','paused'].includes(project.status)){const input=el('input','');input.type='file';input.accept='.pdf,.png,.jpg,.jpeg,.docx,.xlsx,.csv,.zip';el(
    'p',
    'Accepted formats: PDF, PNG, JPG, DOCX, XLSX, CSV and ZIP. Maximum size: 10 MB.'
);input.setAttribute('aria-label','Choose project file');const cancelRevision = el(
    'button',
    'Upload as new file instead'
);

cancelRevision.type = 'button';

cancelRevision.onclick = () => {

    revisionTarget = null;

    notice.textContent =
        'The next upload will be registered as a new file.';

};
const b=el('button','Upload file');b.type='button';b.onclick=async()=>{const file=input.files[0];if(!file||file.size>10485760){notice.textContent='Choose a file up to 10 MB.';return;}b.disabled=true;try{const form=new FormData();form.append('project_id',project.id);if (revisionTarget) {

    form.append(
        'previous_file_id',
        revisionTarget
    );

}
form.append('file',file);await request('',{method:'POST',body:form});input.value='';
revisionTarget = null;
await refresh();}catch(e){notice.textContent=e.message;}finally{b.disabled=false;}};}
 try{await refresh();}catch(e){if(current())notice.textContent=e.message;}
}
