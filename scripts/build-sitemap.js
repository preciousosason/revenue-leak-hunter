
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOMAIN = "https://leakendia.com";

const OUTPUT = path.join(ROOT, "sitemap.xml");
const ARTICLES_DIR = path.join(ROOT, "articles");

const EXCLUDED_PREFIXES = [
    "/pages/admin/",
    "/pages/portal/",
    "/pages/writing-portfolio/",
    "/backend/",
    "/components/",
    "/config/",
    "/data/",
    "/scripts/",
    "/assets/"
];

const EXCLUDED_FILES = new Set([
    "pages/blog/article.html"
]);

const CORE_PAGES = [
    "/",
    "/pages/about/about",
    "/pages/services/services",
    "/pages/portfolio/portfolio",
    "/pages/reviews/reviews",
    "/pages/blog/blog",
    "/pages/contact/contact",
    "/pages/conversion-leaks/conversion-leaks"
];

function isExcluded(urlPath) {
    return EXCLUDED_PREFIXES.some(prefix =>
        urlPath.startsWith(prefix)
    );
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function urlFromFile(relativeFile) {
    const normalized = relativeFile.replace(/\\/g, "/");

    if (normalized === "index.html") {
        return "/";
    }

    if (normalized.endsWith("/index.html")) {
        return "/" + normalized.slice(0, -10);
    }

    if (normalized.endsWith(".html")) {
        return "/" + normalized.slice(0, -5);
    }

    return null;
}

function discoverServices() {
    const directory = path.join(
        ROOT,
        "pages",
        "services"
    );

    if (!fs.existsSync(directory)) {
        return [];
    }

    return fs.readdirSync(directory, {
        withFileTypes: true
    })
    .filter(entry => entry.isDirectory())
    .filter(entry =>
        fs.existsSync(
            path.join(
                directory,
                entry.name,
                "index.html"
            )
        )
    )
    .map(entry =>
        `/pages/services/${entry.name}/`
    );
}

function getArticleStatus(html) {
    const match = html.match(
        /<meta\s+name=["']article-status["']\s+content=["']([^"']+)["']/i
    );

    return match
        ? match[1].trim().toLowerCase()
        : "";
}

function discoverArticles() {
    if (!fs.existsSync(ARTICLES_DIR)) {
        return [];
    }

    const urls = [];

    for (const entry of fs.readdirSync(
        ARTICLES_DIR,
        { withFileTypes: true }
    )) {
        if (!entry.isDirectory()) {
            continue;
        }

        const file = path.join(
            ARTICLES_DIR,
            entry.name,
            "article.html"
        );

        if (!fs.existsSync(file)) {
            continue;
        }

        const html = fs.readFileSync(file, "utf8");
        const status = getArticleStatus(html);

        if (status !== "published") {
            continue;
        }

        urls.push(
            `/articles/${entry.name}/article`
        );
    }

    return urls;
}

function discoverAdditionalPages() {
    const candidates = [
        "pages/privacy/privacy.html",
        "pages/terms/terms.html"
    ];

    return candidates
        .filter(file =>
            !EXCLUDED_FILES.has(file)
        )
        .filter(file =>
            fs.existsSync(path.join(ROOT, file))
        )
        .map(urlFromFile)
        .filter(Boolean);
}

function buildSitemap() {
    const paths = [
        ...CORE_PAGES,
        ...discoverServices(),
        ...discoverArticles(),
        ...discoverAdditionalPages()
    ];

    const uniquePaths = [
        ...new Set(
            paths.filter(url =>
                url &&
                !isExcluded(url)
            )
        )
    ].sort((a, b) => {
        if (a === "/") return -1;
        if (b === "/") return 1;
        return a.localeCompare(b);
    });

    const entries = uniquePaths.map(urlPath => {
        const absoluteUrl = DOMAIN + urlPath;

        return [
            "  <url>",
            `    <loc>${escapeXml(absoluteUrl)}</loc>`,
            "  </url>"
        ].join("\n");
    });

    const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        "</urlset>",
        ""
    ].join("\n");

    fs.writeFileSync(
        OUTPUT,
        sitemap,
        "utf8"
    );

    console.log("\nLEAKENDIA SITEMAP GENERATED");
    console.log(`URLs: ${uniquePaths.length}`);
    console.log(`File: ${OUTPUT}`);

    for (const urlPath of uniquePaths) {
        console.log(DOMAIN + urlPath);
    }
}

buildSitemap();
