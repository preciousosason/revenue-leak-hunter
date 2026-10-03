const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const pages = path.join(root, 'pages/services');
const data = path.join(root, 'data/services');
const registry = path.join(data, 'services.js');
const decode = s => String(s || '').replace(/&quot;/g, '"').replace(/&#(?:039|39);/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function meta(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs = {};
    for (const m of tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)) attrs[m[1].toLowerCase()] = decode(m[3]);
    if (attrs.name === name) return attrs.content || '';
  }
  return '';
}
function buildServices() {
  fs.mkdirSync(data, {recursive:true});
  // Keep existing services even when they have no dedicated HTML page yet.
  const existing = fs.existsSync(registry) ? fs.readFileSync(registry, 'utf8') : '';
  const slugs = new Set([...existing.matchAll(/\bslug\s*:\s*["']([a-z0-9-]+)["']/g)].map(m => m[1]));
  const dirs = fs.existsSync(pages) ? fs.readdirSync(pages, {withFileTypes:true}).filter(e=>e.isDirectory()) : [];
  let generated = 0;
  for (const dir of dirs) {
    const slug = dir.name;
    const file = path.join(pages, slug, 'index.html');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const title = meta(html,'service-title');
    if (!title || meta(html,'service-status') === 'draft') continue;
    const type = meta(html,'service-type') || 'SERVICE';
    const summary = meta(html,'service-description') || '';
    const category = meta(html,'service-category') || type;
    const focus = meta(html,'service-focus') || summary;
    const primaryProblem = meta(html,'service-problem') || summary;
    const situation = meta(html,'service-situation') || summary;
    const impact = meta(html,'service-impact') || '';
    const conclusion = meta(html,'service-conclusion') || '';
    const folder = path.join(data,slug);
    const moduleFile = path.join(folder,'service.js');
    // Do not overwrite rich hand-authored legacy modules. Generated ones carry a marker.
    const old = fs.existsSync(moduleFile) ? fs.readFileSync(moduleFile,'utf8') : '';
    if (!old || old.startsWith('// LEAKENDIA GENERATED SERVICE')) {
      fs.mkdirSync(folder,{recursive:true});
      const record = {
        id: `service-${slug}`, slug, number: meta(html,'service-number') || String(slugs.size+1).padStart(2,'0'),
        type, category,
        title, icon: '◇', summary, description: summary, featured: false,
        badge: type, listLabel: 'Explore', bullets: [], focus,
        primaryProblem, situation, impact, conclusion,
        pageUrl: `/pages/services/${slug}/`, linkText: 'Explore Full Service'
      };
      fs.writeFileSync(moduleFile, '// LEAKENDIA GENERATED SERVICE: edit the HTML metadata, not this file.\nexport default ' + JSON.stringify(record,null,4) + ';\n');
      generated++;
    }
    slugs.add(slug);
  }
  // Include legacy service folders even if an old registry is absent.
  for (const entry of fs.readdirSync(data,{withFileTypes:true})) {
    if (entry.isDirectory() && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) && fs.existsSync(path.join(data,entry.name,'service.js'))) slugs.add(entry.name);
  }
  const entries = [...slugs].filter(s => fs.existsSync(path.join(data,s,'service.js')));
  const output = '/* AUTO-GENERATED. Run node scripts/new-service.js for new services. */\nexport const services = [\n' + entries.map(slug => `    { slug: ${JSON.stringify(slug)}, module: ${JSON.stringify(`./${slug}/service.js`)} }`).join(',\n') + '\n];\n';
  fs.writeFileSync(registry,output);
  console.log(`Service registry ready: ${entries.length} services; ${generated} generated modules refreshed.`);
  return entries.length;
}
if (require.main === module) buildServices();
module.exports = {buildServices};
