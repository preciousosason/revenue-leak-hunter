export async function renderBusinessNotifications(root,current){
 const endpoint='/api/marketplace/notifications';
 const panel=document.createElement('section');root.append(panel);
 const add=(tag,text,parent=panel)=>{const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;};
 let busy=false;
 async function load(){
  if(busy||!current())return;busy=true;
  try{
   const r=await fetch(endpoint,{cache:'no-store',credentials:'same-origin'}),data=await r.json();
   if(!r.ok||!data.success)throw Error(data.error||'Unable to load notifications');
   if(!current())return;panel.replaceChildren();
   const refresh=add('button','Refresh notifications');refresh.type='button';refresh.onclick=load;
   add('p',`${data.notifications.filter(n=>!n.read_at).length} unread in latest 100 notifications`);
   if(!data.notifications.length)add('p','No notifications yet.');
   for(const n of data.notifications){
    const row=add('section','');row.className='workspace-session';add('h3',n.title,row);add('p',n.created_at,row);
    if(n.detail)add('p',n.detail,row);
    if(n.amount_minor!==null)add('p',new Intl.NumberFormat(undefined,{style:'currency',currency:n.currency}).format(n.amount_minor/100),row);
    if(!n.read_at){const b=add('button','Mark as read',row);b.type='button';b.onclick=async()=>{b.disabled=true;try{const r=await fetch(endpoint,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:n.id})});const d=await r.json();if(!r.ok||!d.success)throw Error('Unable to mark as read');await load();}catch(e){if(current()){add('p',e.message,row);b.disabled=false;}}};}
   }
  }catch(e){if(current()){panel.replaceChildren();add('p',e.message);const b=add('button','Retry');b.type='button';b.onclick=load;}}
  finally{busy=false;}
 }
 await load();
}
