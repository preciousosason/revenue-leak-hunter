const fs = require("fs");
const path = require("path");
const readline = require("readline");

const projectRoot = path.join(__dirname, "..");
const servicesPagesDirectory = path.join(projectRoot, "pages", "services");
const servicesDataDirectory = path.join(projectRoot, "data", "services");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
    return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function slugify(text) {
    return text.toLowerCase().trim().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeHtml(text) {
    return String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function decodeHtml(text) {
    return String(text || "").replace(/&quot;/g, '"').replace(/&#(?:039|39);/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function readMeta(html, name) {
    for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
        const attrs = {};
        for (const m of tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)) attrs[m[1].toLowerCase()] = decodeHtml(m[3]);
        if (attrs.name === name) return attrs.content || "";
    }
    return "";
}

function existingServices() {
    const found = new Map();

    if (fs.existsSync(servicesPagesDirectory)) {
        for (const entry of fs.readdirSync(servicesPagesDirectory, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const slug = entry.name;
            const htmlFile = path.join(servicesPagesDirectory, slug, "index.html");
            let title = slug;
            if (fs.existsSync(htmlFile)) {
                const html = fs.readFileSync(htmlFile, "utf8");
                title = readMeta(html, "service-title") || (html.match(/<title>(.*?)\s*\|\s*Leakendia<\/title>/i) || [])[1] || slug;
            }
            found.set(slug, { slug, title, hasPage: true, hasData: fs.existsSync(path.join(servicesDataDirectory, slug)) });
        }
    }

    if (fs.existsSync(servicesDataDirectory)) {
        for (const entry of fs.readdirSync(servicesDataDirectory, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const slug = entry.name;
            if (!found.has(slug)) found.set(slug, { slug, title: slug, hasPage: false, hasData: true });
        }
    }

    return [...found.values()].sort((a, b) => a.title.localeCompare(b.title));
}

async function createService() {
    console.log("\n=== Create Leakendia Service ===\n");

    const title = await ask("Service title: ");
    if (!title) return console.log("Service title cannot be empty.");

    const type = await ask("Service type: ");
    if (!type) return console.log("Service type cannot be empty.");

    const categoryInput = await ask("Service category (Enter to use service type): ");
    const category = categoryInput || type;

    const description = await ask("Short description: ");
    if (!description) return console.log("Description cannot be empty.");

    const enteredSlug = await ask("SEO URL/slug (Enter to generate from title): ");
    const slug = slugify(enteredSlug || title);
    if (!slug) return console.log("A valid slug is required.");

    const serviceDirectory = path.join(servicesPagesDirectory, slug);
    const htmlFile = path.join(serviceDirectory, "index.html");
    const cssFile = path.join(serviceDirectory, `${slug}.css`);

    if (fs.existsSync(serviceDirectory) || fs.existsSync(path.join(servicesDataDirectory, slug))) {
        return console.log(`\nA service with the slug "${slug}" already exists.`);
    }

    fs.mkdirSync(serviceDirectory, { recursive: true });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${escapeHtml(title)} | Leakendia</title>
    <meta name="description" content="${escapeHtml(description)}">

    <!-- SERVICE DATA: automation reads these values -->
    <meta name="service-title" content="${escapeHtml(title)}">
    <meta name="service-type" content="${escapeHtml(type)}">
    <meta name="service-category" content="${escapeHtml(category)}">
    <meta name="service-description" content="${escapeHtml(description)}">

    <!-- Rich service data: edit these in HTML whenever the service positioning changes -->
    <meta name="service-focus" content="${escapeHtml(description)}">
    <meta name="service-problem" content="${escapeHtml(description)}">
    <meta name="service-situation" content="${escapeHtml(description)}">
    <meta name="service-impact" content="">
    <meta name="service-conclusion" content="">

    <meta name="service-slug" content="${escapeHtml(slug)}">
    <meta name="service-status" content="published">

    <link rel="stylesheet" href="../../../global/variables.css">
    <link rel="stylesheet" href="../../../global/global.css">
    <link rel="stylesheet" href="../../../global/responsive.css">
    <link rel="stylesheet" href="./${escapeHtml(slug)}.css">
</head>
<body data-page="${escapeHtml(slug)}">

    <div id="navbar"></div>

    <main id="service-content" class="service-page" data-service="${escapeHtml(slug)}">
        <!-- Edit this service's unique HTML here. -->
    </main>

    <div id="footer"></div>

    <script src="../../../config/site-config.js"></script>
    <script src="../../../config/component-loader.js"></script>
</body>
</html>
`;

    const css = `/* =========================================================\n   ${title.toUpperCase()}\n   Page-specific styles only.\n   ========================================================= */\n\n/* Add only styles unique to this service page. */\n`;

    fs.writeFileSync(htmlFile, html, "utf8");
    fs.writeFileSync(cssFile, css, "utf8");

    require("./build-services.js").buildServices();

    console.log("\nService created successfully.");
    console.log(`HTML: pages/services/${slug}/index.html`);
    console.log(`CSS:  pages/services/${slug}/${slug}.css`);
    console.log("\nFrom here, edit only the HTML and CSS.\n");
}

async function deleteService() {
    const services = existingServices();
    if (!services.length) return console.log("\nNo services found.\n");

    console.log("\n=== Delete Leakendia Service ===\n");
    services.forEach((service, index) => console.log(`${String(index + 1).padStart(2, "0")}. ${service.title}  [${service.slug}]`));

    const choice = await ask("\nService number or slug to delete (Enter to cancel): ");
    if (!choice) return console.log("Deletion cancelled.");

    let service;
    if (/^\d+$/.test(choice)) service = services[Number(choice) - 1];
    else service = services.find(item => item.slug === slugify(choice));

    if (!service) return console.log("Service not found. Nothing was deleted.");

    const pageDir = path.join(servicesPagesDirectory, service.slug);
    const dataDir = path.join(servicesDataDirectory, service.slug);

    console.log(`\nThis will permanently delete: ${service.title}`);
    if (fs.existsSync(pageDir)) console.log(`- pages/services/${service.slug}/`);
    if (fs.existsSync(dataDir)) console.log(`- data/services/${service.slug}/`);
    console.log("- its entry from data/services/services.js");

    const confirmation = await ask('\nType DELETE to confirm: ');
    if (confirmation !== "DELETE") return console.log("Deletion cancelled. Nothing was changed.");

    if (fs.existsSync(pageDir)) fs.rmSync(pageDir, { recursive: true, force: true });
    if (fs.existsSync(dataDir)) fs.rmSync(dataDir, { recursive: true, force: true });

    require("./build-services.js").buildServices();
    console.log(`\nDeleted "${service.title}" and synchronized the service registry.\n`);
}

function syncServices() {
    console.log("\n=== Sync Leakendia Services ===\n");
    require("./build-services.js").buildServices();
    console.log("Sync complete.\n");
}

async function manager() {
    console.log("\n=================================");
    console.log("   LEAKENDIA SERVICE MANAGER");
    console.log("=================================\n");
    console.log("1. Create service");
    console.log("2. Delete service");
    console.log("3. Sync services");
    console.log("4. Exit\n");

    const choice = await ask("Choose an option: ");
    if (choice === "1") await createService();
    else if (choice === "2") await deleteService();
    else if (choice === "3") syncServices();
    else if (choice === "4" || !choice) console.log("Exited.");
    else console.log("Invalid option.");
}

async function main() {
    try {
        if (process.argv.includes("--sync")) syncServices();
        else if (process.argv.includes("--delete")) await deleteService();
        else if (process.argv.includes("--create")) await createService();
        else await manager();
    } catch (error) {
        console.error("\nService manager failed:", error.message);
        process.exitCode = 1;
    } finally {
        rl.close();
    }
}

main();
