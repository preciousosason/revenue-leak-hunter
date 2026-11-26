export async function renderFileLibrary(root,current=()=>true){
 const el=(tag,text,parent=root)=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
 const messages=el('a','Message attachments');messages.href='#messages';
 const notice=el('p','Loading project files…');notice.setAttribute('role','status');
 const list=el('div','');const next=el('button','Load more');next.type='button';next.hidden=true;
 let offset=0;
 async function load(){next.disabled=true;try{
  const r=await fetch('/api/marketplace/project-files/library?offset='+offset,{credentials:'same-origin',cache:'no-store'});
  if(!r.ok)throw Error('Unable to load files ('+r.status+')');const data=await r.json();if(!current())return;
  notice.textContent=data.files.length?'':'No more project files.';
  for(const f of data.files){const row=el('div','',list);el('strong',f.filename,row);el('p',`${f.project_title} · ${Math.ceil(f.size_bytes/1024)} KB · ${f.uploaded_by}`,row);const a=el('a','Download',row);a.href='/api/marketplace/project-files/'+encodeURIComponent(f.id);}
  offset=data.nextOffset;next.hidden=offset===null;
 }catch(e){if(current()){notice.textContent=e.message;next.hidden=false;next.textContent='Retry';}}finally{next.disabled=false;}}
 next.onclick=load;await load();
}
