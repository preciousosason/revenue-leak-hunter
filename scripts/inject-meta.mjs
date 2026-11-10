
import fs from "node:fs";
import path from "node:path";

/* =================================
   CONFIGURATION
================================= */

const ROOT = process.cwd();
const PUBLIC_ROOT = path.join(ROOT, "dist");

const BASE_URL = "https://leakendia.com";
const SITE_NAME = "Leakendia";

const DEFAULT_DESCRIPTION =
    "Find where your customer journey is leaking conversions and what needs to change.";

const DEFAULT_IMAGE =
    `${BASE_URL}/assets/images/og/leakendia-social.jpg`;

const START_MARKER = "<!-- LEAKENDIA META START -->";
const END_MARKER = "<!-- LEAKENDIA META END -->";

/* =================================
   EXCLUSIONS
================================= */

const EXCLUDED_DIRECTORIES = [
    "components",
    "config",
    "data",
    "assets",
    "pages/admin",
    "pages/admin-backup",
    "pages/portal",
    "pages/writing-portfolio"
];

const EXCLUDED_FILES = new Set([
    "pages/blog/article.html"
]);

function normalizePath(value) {
    return value.replace(/\\/g, "/");
}

function isExcluded(relativePath) {
    const normalized = normalizePath(relativePath);

    if (EXCLUDED_FILES.has(normalized)) {
        return true;
    }

    return EXCLUDED_DIRECTORIES.some(directory =>
        normalized === directory ||
        normalized.startsWith(`${directory}/`)
    );
}

/* =================================
   DISCOVER PUBLIC HTML FILES
================================= */

function walk(directory) {
    const files = [];

    for (const entry of fs.readdirSync(directory, {
        withFileTypes: true
    })) {
        const fullPath = path.join(directory, entry.name);

        const relativePath = normalizePath(
            path.relative(PUBLIC_ROOT, fullPath)
        );

        if (isExcluded(relativePath)) {
            continue;
        }

        if (entry.isDirectory()) {
            files.push(...walk(fullPath));
            continue;
        }

        if (
            entry.isFile() &&
            entry.name.toLowerCase().endsWith(".html") &&
            !/^google[^/]*\.html$/i.test(relativePath)
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

/* =================================
   HTML UTILITIES
================================= */

function escapeAttribute(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function getAttribute(tag, name) {
    const escaped = name.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const pattern = new RegExp(
        `\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
        "i"
    );

    const match = tag.match(pattern);

    return match
        ? match[1] ?? match[2] ?? match[3]
        : null;
}

function findTags(html, name) {
    return html.match(
        new RegExp(`<${name}\\b[^>]*>`, "gi")
    ) || [];
}

function findMeta(html, attribute, value) {
    return findTags(html, "meta").find(tag => {
        const actual = getAttribute(tag, attribute);

        return actual?.toLowerCase() === value.toLowerCase();
    });
}

function hasMeta(html, attribute, value) {
    return Boolean(findMeta(html, attribute, value));
}

function getCanonicalTag(html) {
    return findTags(html, "link").find(tag => {
        const rel = getAttribute(tag, "rel");

        return rel
            ?.toLowerCase()
            .split(/\s+/)
            .includes("canonical");
    });
}

function getTitle(html) {
    const match = html.match(
        /<title\b[^>]*>([\s\S]*?)<\/title>/i
    );

    return match
        ? match[1].replace(/\s+/g, " ").trim()
        : SITE_NAME;
}

function getDescription(html) {
    const tag = findMeta(
        html,
        "name",
        "description"
    );

    return tag
        ? getAttribute(tag, "content") || DEFAULT_DESCRIPTION
        : DEFAULT_DESCRIPTION;
}


const CANONICAL_ROUTES = {
    "index.html": "/",

    "pages/about/about.html": "/about",
    "pages/services/services.html": "/services",
    "pages/portfolio/portfolio.html": "/case-studies",
    "pages/reviews/reviews.html": "/reviews",
    "pages/blog/blog.html": "/blog",
    "pages/contact/contact.html": "/contact",

    "pages/privacy/privacy.html": "/privacy-policy",
    "pages/terms/terms.html": "/terms-policy",

    "articles/silent-conversion-leaks/article.html":
        "/blog/7-silent-conversion-leaks",

    "articles/find-revenue-leaks-before-scaling/article.html":
        "/blog/find-revenue-leaks-before-scaling"
};

function getApprovedCanonical(file) {
    const relative = normalizePath(
        path.relative(PUBLIC_ROOT, file)
    );

    if (
        relative.startsWith("../") ||
        relative === ".."
    ) {
        throw new Error("File outside public directory.");
    }

    if (Object.hasOwn(CANONICAL_ROUTES, relative)) {
        return BASE_URL + CANONICAL_ROUTES[relative];
    }

    const serviceMatch = relative.match(
        /^pages\/services\/([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.html$/
    );

    if (serviceMatch) {
        return `${BASE_URL}/services/${serviceMatch[1]}`;
    }

    return null;
}


/* =================================
   PUBLIC CANONICAL URL GENERATION
================================= */

function getPageUrl(file) {
    const relative = normalizePath(
        path.relative(PUBLIC_ROOT, file)
    );

    if (
        relative.startsWith("../") ||
        relative === ".."
    ) {
        throw new Error(
            `File is outside the public build: ${file}`
        );
    }

    if (relative === "index.html") {
        return `${BASE_URL}/`;
    }

    if (relative.endsWith("/index.html")) {
        return (
            BASE_URL +
            "/" +
            relative.slice(0, -"index.html".length)
        );
    }

    return (
        BASE_URL +
        "/" +
        relative.replace(/\.html$/i, "")
    );
}

/* =================================
   REMOVE PREVIOUS GENERATED BLOCK
================================= */

function removeGeneratedMeta(html) {
    return html.replace(
        /\s*<!-- LEAKENDIA META START -->[\s\S]*?<!-- LEAKENDIA META END -->\s*/gi,
        "\n"
    );
}

/* =================================
   GENERATE MISSING METADATA
================================= */

function buildMissingMeta(html, file) {
    const generated = [];

    const title = getTitle(html);
    const description = getDescription(html);

const existingCanonical = getCanonicalTag(html);

const canonical =
    getApprovedCanonical(file) ||
    (existingCanonical
        ? getAttribute(existingCanonical, "href")
        : null) ||
    getPageUrl(file);

    const existingOgImage = findMeta(
        html,
        "property",
        "og:image"
    );

    const image = existingOgImage
        ? getAttribute(existingOgImage, "content") ||
          DEFAULT_IMAGE
        : DEFAULT_IMAGE;

    function addMeta(attribute, name, content) {
        if (hasMeta(html, attribute, name)) {
            return;
        }

        generated.push(
            `<meta ${attribute}="${escapeAttribute(name)}" content="${escapeAttribute(content)}">`
        );
    }

    if (!existingCanonical) {
        generated.push(
            `<link rel="canonical" href="${escapeAttribute(canonical)}">`
        );
    }

    addMeta("property", "og:type", "website");
    addMeta("property", "og:site_name", SITE_NAME);
    addMeta("property", "og:title", title);
    addMeta("property", "og:description", description);
    addMeta("property", "og:url", canonical);
    addMeta("property", "og:image", image);

    if (image === DEFAULT_IMAGE) {
        addMeta("property", "og:image:width", "1200");
        addMeta("property", "og:image:height", "630");
    }

    addMeta("property", "og:image:alt", SITE_NAME);

    addMeta("name", "twitter:card", "summary_large_image");
    addMeta("name", "twitter:title", title);
    addMeta("name", "twitter:description", description);
    addMeta("name", "twitter:image", image);

    if (!generated.length) {
        return "";
    }

    return [
        START_MARKER,
        ...generated,
        END_MARKER
    ].join("\n");
}

/* =================================
   PROCESS PUBLIC PAGE
================================= */

function processFile(file) {
    const original = fs.readFileSync(
        file,
        "utf8"
    );

    if (!/<\/head\s*>/i.test(original)) {
        console.warn(
            `SKIPPED: Missing </head> in ${normalizePath(path.relative(PUBLIC_ROOT, file))}`
        );

        return "skipped";
    }

    let html = removeGeneratedMeta(original);

    const approvedCanonical = getApprovedCanonical(file);

if (approvedCanonical) {
    const canonicalTag = getCanonicalTag(html);

    if (canonicalTag) {
        html = html.replace(
            canonicalTag,
            `<link rel="canonical" href="${escapeAttribute(approvedCanonical)}">`
        );
    }

    const ogUrlTag = findMeta(
        html,
        "property",
        "og:url"
    );

    if (ogUrlTag) {
        html = html.replace(
            ogUrlTag,
            `<meta property="og:url" content="${escapeAttribute(approvedCanonical)}">`
        );
    }
}

    const metadata = buildMissingMeta(html, file);

    if (metadata) {
        html = html.replace(
            /<\/head\s*>/i,
            `${metadata}\n</head>`
        );
    }

    if (html === original) {
        return "unchanged";
    }

    fs.writeFileSync(
        file,
        html,
        "utf8"
    );

    console.log(
        `UPDATED: ${normalizePath(path.relative(PUBLIC_ROOT, file))}`
    );

    return "updated";
}

/* =================================
   EXECUTION
================================= */

function main() {
    if (!fs.existsSync(PUBLIC_ROOT)) {
        throw new Error(
            "Public dist/ directory not found. Run npm run build-site first."
        );
    }

    const files = walk(PUBLIC_ROOT);

    const results = {
        updated: 0,
        unchanged: 0,
        skipped: 0
    };

    console.log(
        `Found ${files.length} eligible public HTML files.`
    );

    for (const file of files) {
        const result = processFile(file);
        results[result]++;
    }

    console.log("\nLEAKENDIA SEO INJECTION COMPLETE");
    console.log(`Updated: ${results.updated}`);
    console.log(`Unchanged: ${results.unchanged}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log("Admin, portal, components, and writing portfolio excluded.");
}

main();
