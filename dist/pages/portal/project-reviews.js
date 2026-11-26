const endpoint='/api/marketplace/project-reviews';
async function call(body){const r=await fetch(endpoint,{credentials:'same-origin',cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok||!d.success)throw Error(d.error||'Request failed');return d;}
function el(parent,tag,text=''){const e=document.createElement(tag);e.textContent=text;parent.append(e);return e;}
export async function renderProjectReviews(root,current){
 try{const d=await call();if(!current())return;root.replaceChildren();el(root,'h2','Project reviews');el(root,'p','Reviews are public after moderation, including your account name and business name.');if(!d.projects.length)el(root,'p','No completed projects yet.');
 for(const p of d.projects){const card=el(root,'section');el(card,'h3',p.title);el(card,'p',p.review_status);if(p.review_status!=='eligible'){if(p.review)el(card,'p',`${p.rating}/5 — ${p.review}`);continue;}
 const form=el(card,'form'),label=el(form,'label','Rating (1–5) '),rating=el(label,'select');for(let i=1;i<=5;i++){const o=el(rating,'option',String(i));o.value=String(i);}const text=el(el(form,'label','Review '),'textarea');text.required=true;text.minLength=10;text.maxLength=2000;const consent=el(form,'label',' I agree to public display of my review, name and business name. ');const check=el(consent,'input');check.type='checkbox';check.required=true;const button=el(form,'button','Submit review');button.type='submit';const msg=el(form,'p');msg.setAttribute('role','status');form.onsubmit=async e=>{e.preventDefault();button.disabled=true;try{await call({project_id:p.id,rating:Number(rating.value),review:text.value,publication_consent:check.checked});if(current())await renderProjectReviews(root,current);}catch(e){msg.textContent=e.message;}finally{button.disabled=false;}};
 }
 }catch(e){if(current()){root.replaceChildren();el(root,'p',e.message);}}
}
