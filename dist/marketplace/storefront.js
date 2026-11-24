// Leakendia Marketplace storefront v2. Server-rendered, public-data-only.
const ORIGIN = 'https://leakendia.com';
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const slugOK = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const money = (minor, currency='USD') => minor == null ? 'Request a quote' : new Intl.NumberFormat('en-US',{style:'currency',currency: /^[A-Z]{3}$/.test(currency)?currency:'USD'}).format(minor/100);
const pathFor = slug => '/marketplace/service/' + encodeURIComponent(slug);
const categoryPath = slug => '/marketplace/category/' + encodeURIComponent(slug);
const jsonScript = obj => JSON.stringify(obj).replace(/</g,'\\u003c');
function document({title,description,path,body,status=200,noindex=false,structuredData}) {
 const head = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHTML(title)}</title><meta name="description" content="${escapeHTML(description)}"><link rel="canonical" href="${ORIGIN}${escapeHTML(path)}">${noindex?'<meta name="robots" content="noindex,follow">':''}<link rel="stylesheet" href="/pages/marketplace/storefront.css">${structuredData?`<script type="application/ld+json">${jsonScript(structuredData)}</script>`:''}</head>`;
 return new Response(`${head}<body><a class="skip" href="#main">Skip to content</a><header class="site-header"><div class="shell header-inner"><a class="brand" href="/" aria-label="Leakendia home"><span class="brand-mark">L</span> LEAKENDIA</a><nav aria-label="Main navigation"><a href="/">Home</a><a href="/services">Services</a><a href="/marketplace" aria-current="page">Marketplace</a><a href="/contact" class="nav-contact">Start an investigation</a></nav></div></header><main id="main">${body}</main><footer class="site-footer"><div class="shell"><span>© ${new Date().getUTCFullYear()} Leakendia</span><a href="/contact">Contact</a><a href="/privacy-policy">Privacy</a></div></footer></body></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store',...(noindex?{'X-Robots-Tag':'noindex, follow'}:{})}});
}
function errorPage(status,title,description) {return document({title:title+' | Leakendia',description,path:'/marketplace',status,noindex:true,body:`<section class="shell error-state"><p class="eyebrow">Marketplace</p><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p><a class="button primary" href="/marketplace">Back to Marketplace</a></section>`});}
async function fetchCatalog(env, endpoint) {
 const response=await env.MARKETPLACE_API.fetch('https://internal.example/api/marketplace/'+endpoint);
 if(response.status===404)return null;
 if(!response.ok)throw new Error('Marketplace catalog request failed: '+response.status);
 const result=await response.json();if(!result?.success)throw new Error('Invalid catalog response');return result.data;
}
function priceFor(s) {return s.price_minor == null ? '<span class="price-label">Custom pricing</span>' : `<span class="price-label">From <strong>${escapeHTML(money(s.price_minor))}</strong></span>`;}
function serviceCard(s) {return `<article class="service-card"><div class="card-visual" aria-hidden="true"><span class="card-symbol">✳</span><span class="card-tag">DIGITAL SERVICE</span></div><div class="card-body"><h3><a href="${pathFor(s.slug)}">${escapeHTML(s.title)}</a></h3><p>${escapeHTML(s.summary||'Explore this Leakendia service.')}</p><div class="card-footer">${priceFor(s)}<a class="card-arrow" href="${pathFor(s.slug)}" aria-label="View ${escapeHTML(s.title)}">↗</a></div></div></article>`;}
function categoriesTree(categories,parent=null,active=null,level=0) {
 if(level>8)return '';
 const items=categories.filter(c=>c.parent_id===parent);
 if(!items.length)return '';
 return `<ul class="category-tree level-${level}">${items.map(c=>`<li><a ${c.slug===active?'aria-current="page"':''} href="${categoryPath(c.slug)}"><span>${escapeHTML(c.name)}</span><span class="category-count">${Number(c.service_count)||0}</span></a>${categoriesTree(categories,c.id,active,level+1)}</li>`).join('')}</ul>`;
}
function selected(current,value){return current===value?' selected':'';}
function numberValue(q,name){const value=q.get(name);return value!==null&&/^\d+$/.test(value)?value:'';}
function catalogPage(url, categories, result, activeCategory=null) {
 const q=url.searchParams,search=(q.get('search')||'').slice(0,120),sort=q.get('sort')||'featured';
 const title=activeCategory?activeCategory.name:'Digital services built to fix what is holding you back';
 const description=activeCategory?.description||'Explore Leakendia services for SEO, conversion optimization, customer journeys and sustainable growth.';
 const filterForm=`<form class="filter-form" method="get" action="${escapeHTML(url.pathname)}"><label class="search-field"><span>Search services</span><input type="search" name="search" placeholder="Search by service or problem…" value="${escapeHTML(search)}" maxlength="120"></label><label><span>Sort by</span><select name="sort"><option value="featured"${selected(sort,'featured')}>Featured</option><option value="newest"${selected(sort,'newest')}>Newest</option><option value="title"${selected(sort,'title')}>Name A–Z</option><option value="price"${selected(sort,'price')}>Price: low to high</option></select></label><label><span>Min price (USD)</span><input type="number" min="0" step="1" name="min" placeholder="0" value="${escapeHTML(numberValue(q,'min'))}"></label><label><span>Max price (USD)</span><input type="number" min="0" step="1" name="max" placeholder="Any" value="${escapeHTML(numberValue(q,'max'))}"></label><label><span>Delivery within days</span><input type="number" min="1" step="1" name="days" placeholder="Any" value="${escapeHTML(numberValue(q,'days'))}"></label><div class="filter-actions"><button class="button primary" type="submit">Apply filters</button><a class="clear-filters" href="${escapeHTML(url.pathname)}">Clear</a></div></form>`;
 const items=Array.isArray(result?.items)?result.items:[];
 const next=new URLSearchParams(q);next.set('page',String((Number(result.page)||1)+1));
 const previous=new URLSearchParams(q);previous.set('page',String(Math.max(1,(Number(result.page)||1)-1)));
 const page=Number(result.page)||1;
 const pagination=`<nav class="pagination" aria-label="Catalog pages">${page>1?`<a href="${escapeHTML(url.pathname+'?'+previous)}">← Previous</a>`:''}<span>Page ${page}</span>${result.hasMore?`<a href="${escapeHTML(url.pathname+'?'+next)}">Next →</a>`:''}</nav>`;
 const body=`<section class="hero shell"><div class="eyebrow"><span class="eyebrow-line"></span> LEAKENDIA MARKETPLACE</div><h1>${escapeHTML(title)}</h1><p>${escapeHTML(description)}</p><div class="hero-bottom"><span>Purpose-built services. Clear outcomes.</span><span class="hero-index">01 / EXPLORE</span></div></section><div class="shell marketplace-layout"><aside class="sidebar"><div class="sidebar-heading">EXPLORE CATEGORIES</div><a class="all-categories" ${!activeCategory?'aria-current="page"':''} href="/marketplace"><span>All services</span><span>↗</span></a>${categoriesTree(categories,null,activeCategory?.slug)}<div class="sidebar-help"><span>NEED SOMETHING SPECIFIC?</span><p>Tell us what isn't working. We'll help identify the right investigation.</p><a href="/contact">Talk to Leakendia ↗</a></div></aside><section class="catalog-main" aria-label="Service catalog"><div class="catalog-heading"><div><span class="eyebrow small">FIND YOUR SOLUTION</span><h2>Explore services</h2></div><span class="result-count">${items.length} shown</span></div><details class="filter-panel" ${q.toString()?'open':''}><summary>Search, sort &amp; filter <span>⌄</span></summary>${filterForm}</details><div class="service-grid">${items.map(serviceCard).join('')}</div>${!items.length?'<div class="empty-state"><span class="empty-icon">✳</span><h3>No services found</h3><p>Try adjusting your filters, or return when new services are published.</p><a href="/marketplace">Reset search ↗</a></div>':''}${pagination}</section></div><section class="cta-band"><div class="shell cta-inner"><div><span class="eyebrow small">NOT SURE WHERE TO START?</span><h2>Find the leak. Fix the friction.</h2></div><a class="button light" href="/contact">Start an investigation ↗</a></div></section>`;
 return document({title:activeCategory?`${activeCategory.name} Services | Leakendia`:'Marketplace | Leakendia',description,path:url.pathname,noindex:!!url.search,body,structuredData:{'@context':'https://schema.org','@type':'CollectionPage',name:title,url:ORIGIN+url.pathname,description}});
}
function detailPage(s) {
 const offers=Array.isArray(s.offers)?s.offers.filter(o=>o.active===1):[];
 const content=Array.isArray(s.content)?s.content:[];
 const groups=[['scope','What is included'],['deliverable','What you receive'],['requirement','What we need from you'],['exclusion','What is not included']];
 const sections=groups.map(([kind,title])=>{const entries=content.filter(c=>c.kind===kind);return entries.length?`<section class="detail-section"><h2>${title}</h2><div class="detail-list">${entries.map(c=>`<div class="detail-row"><span class="detail-check">↗</span><div><h3>${escapeHTML(c.title)}</h3>${c.body?`<p>${escapeHTML(c.body)}</p>`:''}</div></div>`).join('')}</div></section>`:''}).join('');
 const faqs=content.filter(c=>c.kind==='faq');
 const offerMarkup=offers.length?offers.map(o=>`<article class="offer-card"><div class="offer-top"><span class="offer-model">${escapeHTML(o.model==='weekly'?'WEEKLY':o.model==='quote'?'CUSTOM QUOTE':o.model==='package'?'PACKAGE':'ONE-TIME')}</span><h3>${escapeHTML(o.name)}</h3><div class="offer-price">${escapeHTML(money(o.price_minor,o.currency))}${o.model==='weekly'?'<small> / week</small>':''}</div>${o.delivery_days?`<p class="offer-delivery">Estimated delivery: ${Number(o.delivery_days)} days</p>`:''}</div><a class="button primary" href="/contact">Discuss this option ↗</a></article>`).join(''):'<p>Pricing is available on request. Contact us to discuss your project.</p>';
 const related=Array.isArray(s.related)?s.related.filter(x=>slugOK(x.slug)):[];
 const body=`<div class="shell detail-shell"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/marketplace">Marketplace</a><span>/</span><span>${escapeHTML(s.title)}</span></nav><section class="detail-hero"><div><span class="eyebrow"><span class="eyebrow-line"></span> LEAKENDIA SERVICE</span><h1>${escapeHTML(s.title)}</h1><p class="detail-lead">${escapeHTML(s.summary||s.description)}</p><div class="detail-actions"><a class="button primary" href="/contact">Start an investigation ↗</a><a class="text-link" href="#pricing">View pricing ↓</a></div></div><div class="detail-art" aria-hidden="true"><span>✳</span><small>INVESTIGATE / OPTIMIZE / GROW</small></div></section><div class="detail-columns"><div><section class="detail-section"><span class="eyebrow small">THE INVESTIGATION</span><h2>About this service</h2><p class="long-copy">${escapeHTML(s.description||s.summary)}</p></section>${sections}${faqs.length?`<section class="detail-section"><h2>Frequently asked questions</h2><div class="faq-list">${faqs.map(f=>`<details><summary>${escapeHTML(f.title)}</summary><p>${escapeHTML(f.body)}</p></details>`).join('')}</div></section>`:''}</div><aside class="detail-side" id="pricing"><div class="side-intro"><span class="eyebrow small">INVESTMENT OPTIONS</span><h2>Choose your approach</h2></div>${offerMarkup}</aside></div>${related.length?`<section class="related"><h2>Related services</h2><div class="related-links">${related.map(r=>`<a href="${pathFor(r.slug)}">${escapeHTML(r.title)} ↗</a>`).join('')}</div></section>`:''}</div><section class="cta-band"><div class="shell cta-inner"><div><span class="eyebrow small">LET'S FIND THE FRICTION</span><h2>Better results start with clarity.</h2></div><a class="button light" href="/contact">Start a conversation ↗</a></div></section>`;
 const structuredData={'@context':'https://schema.org','@type':'Service',name:s.title,description:s.summary||s.description,url:ORIGIN+pathFor(s.slug),provider:{'@type':'Organization',name:'Leakendia',url:ORIGIN},...(offers.length?{offers:offers.filter(o=>o.price_minor!==null).map(o=>({'@type':'Offer',name:o.name,price:(o.price_minor/100).toFixed(2),priceCurrency:o.currency,url:ORIGIN+pathFor(s.slug)}))}:{})};
 return document({title:s.seo_title||s.title+' | Leakendia',description:s.seo_description||s.summary||'Explore this Leakendia service.',path:pathFor(s.slug),body,structuredData});
}
export async function handleMarketplaceStorefront(request,env) {
 const url=new URL(request.url),path=url.pathname;
 if(path!=='/marketplace'&&!path.startsWith('/marketplace/'))return null;
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 if(!env.MARKETPLACE_API)return errorPage(503,'Marketplace temporarily unavailable','Please try again shortly.');
 let response;
 try {
  if(path.startsWith('/marketplace/service/')) {
   const slug=path.slice('/marketplace/service/'.length);
   if(!slugOK(slug))response=errorPage(404,'Service not found','This service is unavailable.');
   else {const service=await fetchCatalog(env,'services/'+encodeURIComponent(slug));response=service?detailPage(service):errorPage(404,'Service not found','This service is unavailable.');}
  } else if(path==='/marketplace'||path.startsWith('/marketplace/category/')) {
   const categories=await fetchCatalog(env,'categories');if(!Array.isArray(categories))throw new Error('Invalid categories');
   let active=null;
   if(path!=='/marketplace'){const slug=path.slice('/marketplace/category/'.length);active=categories.find(c=>c.slug===slug);if(!slugOK(slug)||!active){response=errorPage(404,'Category not found','This category is unavailable.');}}
   if(!response){const params=new URLSearchParams();for(const key of ['search','sort','page','days'])if(url.searchParams.has(key))params.set(key,url.searchParams.get(key));
    // User-facing prices are in dollars; API expects cents.
    for(const key of ['min','max'])if(url.searchParams.has(key)){const value=url.searchParams.get(key);if(/^\d+$/.test(value)&&Number.isSafeInteger(Number(value)*100))params.set(key,String(Number(value)*100));}
    if(active)params.set('category',active.slug);
    const result=await fetchCatalog(env,'services?'+params.toString());response=catalogPage(url,categories,result,active);
   }
  } else response=errorPage(404,'Page not found','This Marketplace page does not exist.');
 } catch(error){console.error('Marketplace storefront error',error);response=errorPage(503,'Marketplace temporarily unavailable','Please try again shortly.');}
 return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;
}
