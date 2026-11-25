import {api} from '../core/api.js';
import {
    renderAdminProjectFiles
} from './project-files.js';
let generation=0;
const el=(parent,tag,text='')=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};
export async function loadProjects(page=1){const root=document.getElementById('projects-root');if(!root)return;const ticket=++generation;root.replaceChildren();el(root,'h2','Project management');const notice=el(root,'p','Loading…');notice.setAttribute('role','status');let busy=false;
 const button=(parent,label,fn)=>{const b=el(parent,'button',label);b.type='button';b.className='analytics-btn';b.onclick=async()=>{if(busy)return;busy=true;b.disabled=true;try{await fn();}catch(e){notice.textContent=e.message;}finally{busy=false;b.disabled=false;}};return b;};
 const act=async body=>{await api('/api/admin/projects',{method:'POST',body:JSON.stringify(body)});await loadProjects(page);};
 try{const data=await api('/api/admin/projects?page='+page);if(ticket!==generation)return;notice.textContent='';el(root,'h3','Eligible quotations');if(!data.eligible.length)el(root,'p','No eligible quotations.');for(const q of data.eligible){const card=el(root,'article');card.className='analytics-panel';el(card,'p',q.name+' · '+q.email+' · '+q.id);const input=el(card,'input');input.placeholder='Project title';input.maxLength=200;input.setAttribute('aria-label','Project title');button(card,'Activate',async()=>{if(!input.value.trim())throw Error('Enter a title');if(confirm('Activate this project?'))await act({action:'activate',quotation_id:q.id,title:input.value});});}
 el(root,'h3','Projects');for(const p of data.projects){const card=el(root,'article');card.className='analytics-panel';el(card,'h3',p.title);el(card,'p',`${p.name} · ${p.status} · ${p.progress}% complete`);el(card,'p','Quotation: '+p.quotation_id);const filesPanel = el(card, 'div');

filesPanel.hidden = true;

button(card, 'Manage project files', async () => {

    filesPanel.hidden = !filesPanel.hidden;

    if (!filesPanel.hidden) {

        await renderAdminProjectFiles(
            filesPanel,
            p,
            () => ticket === generation
        );

    }

});const terminal=['completed','cancelled'].includes(p.status);if(!terminal){for(const status of ['active','paused','completed','cancelled'].filter(s=>s!==p.status))button(card,status,async()=>{if(confirm('Change project status to '+status+'?'))await act({action:'status',project_id:p.id,status});});}for(const m of p.milestones){const row=el(card,'div');el(row,'p',m.title+' · '+m.status);if(p.status==='active')for(const status of ['pending','in_progress','completed'].filter(s=>s!==m.status))button(row,status,()=>act({action:'milestone_status',project_id:p.id,milestone_id:m.id,status}));}if(p.status==='active'){const input=el(card,'input');input.maxLength=200;input.placeholder='Milestone title';input.setAttribute('aria-label','Milestone title');button(card,'Add milestone',()=>{if(!input.value.trim())throw Error('Enter a milestone title');return act({action:'add_milestone',project_id:p.id,title:input.value});});}}
 if(page>1)button(root,'Previous',()=>loadProjects(page-1));if(data.hasMore)button(root,'Next',()=>loadProjects(page+1));button(root,'Refresh',()=>loadProjects(page));}catch(e){if(ticket===generation)notice.textContent=e.message;}}
