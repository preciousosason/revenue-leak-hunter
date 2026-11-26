import {
    renderProjectFiles
} from './project-files.js';
import {
    attachProjectActivity
} from './customer-insights.js';


export async function renderProjects(root,current,page=1){const el=(parent,tag,text='')=>{const n=document.createElement(tag);n.textContent=text;parent.append(n);return n;};try{const r=await fetch('/api/marketplace/projects?page='+page,{cache:'no-store',credentials:'same-origin'}),data=await r.json();if(!r.ok||!data.success)throw Error(data.error||'Unable to load projects');if(!current())return;root.replaceChildren();el(root,'h2','My projects');if(!data.projects.length)el(root,'p','No activated projects yet.');for(const p of data.projects){const card=el(root,'section');card.className='workspace-session';el(card,'h3',p.title);el(card,'p',p.status+' · '+p.progress+'% complete');const progress=el(card,'progress');progress.max=100;progress.value=p.progress;progress.setAttribute('aria-label','Milestone completion');el(card,'p','Request: '+p.request_id);attachProjectActivity(
    card,
    p,
    current
);

filesPanel.hidden = true;

const filesButton = el(
    card,
    'button',
    'View project files'
);

filesButton.type = 'button';

filesButton.onclick = async () => {

    filesPanel.hidden = !filesPanel.hidden;

    if (!filesPanel.hidden) {

        filesButton.textContent = 'Hide project files';

        await renderProjectFiles(
            filesPanel,
            p,
            current
        );

    } else {

        filesButton.textContent = 'View project files';

    }

};for(const m of p.milestones)el(card,'p',m.title+' · '+m.status.replace('_',' '));}const button=(label,n)=>{const b=el(root,'button',label);b.type='button';b.onclick=()=>{b.disabled=true;renderProjects(root,current,n).finally(()=>{b.disabled=false;});};};if(page>1)button('Previous',page-1);if(data.hasMore)button('Next',page+1);button('Refresh',page);}catch(e){if(current())el(root,'p',e.message).setAttribute('role','alert');}}
