import { renderPayments } from "./payments.js";
import { renderProjects } from "./projects.js";
import {
    renderProjectReviews
} from "./project-reviews.js";
import {
    renderBusinessNotifications
} from "./business-notifications.js";
import { renderQuotations } from "./quotations.js";
import { renderRequests } from "./requests.js";
import Auth from "/global/auth/auth-state.js";
const views = {overview:"Overview",messages:"Messages",requests:"My requests",projects:"My projects",quotations:"Quotations",payments:"Payments",files:"Files",notifications:"Notifications",reviews:"Reviews",account:"Account settings"};
const nav=document.querySelector("#workspace-nav"), extra=document.querySelector("#workspace-extra");
const panels=[...document.querySelectorAll("[data-workspace-view]")];
let generation=0;
function element(tag,text,parent){const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;}
function button(text,parent,action){const b=element("button",text,parent);b.type="button";b.addEventListener("click",async()=>{b.disabled=true;try{await action();}catch(e){element("p",e.message||"Action failed. Try again.",parent).setAttribute("role","alert");}finally{b.disabled=false;}});return b;}
function link(text,href,parent){const a=element("a",text,parent);a.href=href;return a;}
async function account(ticket){
 const state=await Auth.init(); if(ticket!==generation)return;
 if(state.error){element("p","Unable to verify your account. Reload to retry.",extra);return;}
 if(!state.authenticated){element("p","Sign in with a verified account to manage sessions. Legacy portal access does not include these controls.",extra);link("Sign in",Auth.getSignInURL(location.pathname+"#account"),extra);return;}
 element("p",state.customer.name||"Customer",extra);element("p",state.customer.email,extra);
 element("h3","Active sessions",extra);
 try{const result=await Auth.getSessions();if(ticket!==generation)return;
 for(const session of result.sessions||[]){const row=element("div","",extra);row.className="workspace-session";element("strong",session.current?"Current session":"Other session",row);element("p","Expires: "+new Date(session.expiresAt).toLocaleString(),row);if(!session.current)button("Revoke session",row,async()=>{await Auth.request("/sessions/revoke",{method:"POST",body:{sessionId:session.id}});row.remove();});}
 }catch(e){if(ticket===generation)element("p","Unable to load sessions. Try again later.",extra);}
 if(ticket===generation)button("Sign out everywhere",extra,async()=>{if(confirm("Sign out on all devices?"))await Auth.signOut({all:true});});
}
function render(){const key=location.hash.slice(1);const view=Object.hasOwn(views,key)?key:"overview";const ticket=++generation;
 for(const b of nav.querySelectorAll("button")){if(b.dataset.view===view)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");}
 for(const p of panels)p.hidden=p.dataset.workspaceView!==view;
 extra.hidden=view==="overview"||view==="messages";extra.replaceChildren();if(extra.hidden)return;
 element("h2",views[view],extra);
 if(view==="payments"){renderPayments(extra,()=>ticket===generation);return;}
 if (view === "projects") {

    renderProjects(
        extra,
        () => ticket === generation
    );

    return;
}
if (view === "reviews") {

    renderProjectReviews(
        extra,
        () => ticket === generation
    );

    return;
}
if (view === "notifications") {

    renderBusinessNotifications(
        extra,
        () => ticket === generation
    );

    return;
}
 if(view==="quotations"){renderQuotations(extra,()=>ticket===generation);return;}
 if(view==="requests"){renderRequests(extra,()=>ticket===generation);return;}
 if(view==="account"){account(ticket);return;}
 if(view==="files"){element("p","Your existing shared files are available as attachments in Messages. A dedicated file library is not yet connected.",extra);button("Open messages",extra,()=>{location.hash="messages";});return;}
 element("p","This workspace section is not yet connected to a backend. No records or actions are being simulated.",extra);
 if(view==="requests")link("Browse marketplace","/marketplace",extra);
}
for(const [i,[key,label]] of Object.entries(views).entries()){const b=element("button","",nav);b.type="button";b.className="workspace-link";b.dataset.view=key;element("span",String(i+1).padStart(2,"0"),b);b.append(document.createTextNode(label));b.addEventListener("click",()=>{location.hash=key;});}
window.addEventListener("hashchange",render);render();
