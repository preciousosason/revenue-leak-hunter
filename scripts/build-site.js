
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

const PUBLIC_EXTENSIONS = new Set([
    ".html",
    ".css",
    ".js",
    ".mjs",
    ".json",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".ico",
    ".avif",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".webmanifest",
    ".webm",
    ".mp4",
    ".mp3",
    ".pdf",
    ".txt",
    ".xml"
]);

const PUBLIC_DIRECTORIES = [
    "articles",
    "assets",
    "components",
    "config",
    "data",
    "global",
    "pages"
];

const PUBLIC_ROOT_FILES = [
    "index.html",
    "robots.txt",
    "sitemap.xml",
    "favicon.ico",
    "favicon.png",
    "google14fb9e0cf7c6fd61.html"
];

const EXCLUDED_PATHS = [
    "pages/writing-portfolio",
    "pages/admin-backup"
];

const PRIVATE_NAME_PATTERN =
    /(^\.|backup|original|secret|credential|private|\.test\.|\.spec\.|\.map$|\.sql$|\.zip$|\.bak$)/i;

let copied = 0;
let skipped = 0;

function normalize(value) {
    return value.replace(/\\/g, "/");
}

function isExcluded(relativePath) {
    const relative = normalize(relativePath);
    const segments = relative.split("/");

    if (EXCLUDED_PATHS.some(item =>
        relative === item ||
        relative.startsWith(item + "/")
    )) {
        return true;
    }

    if (segments.some(segment =>
        PRIVATE_NAME_PATTERN.test(segment)
    )) {
        return true;
    }

    return false;
}

function isAllowedFile(relativePath) {
    const relative = normalize(relativePath);

    if (isExcluded(relative)) {
        return false;
    }

    const extension = path.extname(relative).toLowerCase();

    if (!PUBLIC_EXTENSIONS.has(extension)) {
        return false;
    }

    // Only public runtime modules from config.
    if (relative.startsWith("config/")) {
        return extension === ".js" ||
               extension === ".mjs";
    }

    // Only public registries from data.
    if (relative.startsWith("data/")) {
        return extension === ".js" ||
               extension === ".json";
    }

    return true;
}

function copyFile(relativePath) {
    const source = path.join(ROOT, relativePath);
    const destination = path.join(DIST, relativePath);

    if (!fs.existsSync(source)) {
        throw new Error(
            `Required public file missing: ${relativePath}`
        );
    }

    fs.mkdirSync(path.dirname(destination), {
        recursive: true
    });

    fs.copyFileSync(source, destination);
    copied++;
}

function copyDirectory(relativeDirectory) {
    const sourceDirectory = path.join(
        ROOT,
        relativeDirectory
    );

    if (!fs.existsSync(sourceDirectory)) {
        throw new Error(
            `Required directory missing: ${relativeDirectory}`
        );
    }

    function visit(directory) {
        for (const entry of fs.readdirSync(directory, {
            withFileTypes: true
        })) {
            const source = path.join(
                directory,
                entry.name
            );

            const relative = normalize(
                path.relative(ROOT, source)
            );

            if (isExcluded(relative)) {
                skipped++;
                continue;
            }

            if (entry.isDirectory()) {
                visit(source);
                continue;
            }

            if (!entry.isFile() || !isAllowedFile(relative)) {
                skipped++;
                continue;
            }

            copyFile(relative);
        }
    }

    visit(sourceDirectory);
}

function verifyBuild() {
    const required = [
        "index.html",
        "robots.txt",
        "sitemap.xml",
        "config/site-config.js",
        "config/component-loader.js",
        "data/articles.json",
        "pages/services/services.html"
    ];

    for (const relative of required) {
        if (!fs.existsSync(path.join(DIST, relative))) {
            throw new Error(
                `Build verification failed: ${relative}`
            );
        }
    }

    const forbidden = [
        "backend",
        "node_modules",
        "venv",
        "scripts",
        "package.json",
        "wrangler.jsonc",
        "outreach-backup.sql",
        "pages/writing-portfolio",
        "pages/admin-backup"
    ];

    for (const relative of forbidden) {
        if (fs.existsSync(path.join(DIST, relative))) {
            throw new Error(
                `Private content detected in dist: ${relative}`
            );
        }
    }
}

function build() {
    console.log("\nLEAKENDIA PUBLIC SITE BUILD");

    // Never remove the project root.
    if (DIST === ROOT || !DIST.startsWith(ROOT + path.sep)) {
        throw new Error("Unsafe output directory.");
    }

    fs.rmSync(DIST, {
        recursive: true,
        force: true
    });

    fs.mkdirSync(DIST, {
        recursive: true
    });

    for (const directory of PUBLIC_DIRECTORIES) {
        copyDirectory(directory);
    }

    for (const file of PUBLIC_ROOT_FILES) {
        copyFile(file);
    }

    verifyBuild();

    console.log(`Copied files: ${copied}`);
    console.log(`Skipped entries: ${skipped}`);
    console.log(`Output: ${DIST}`);
    console.log("Private development folders excluded.");
    console.log("Admin and portal frontends retained.");
    console.log("Writing portfolio excluded.");
    console.log("\nBuild completed. Not deployed.\n");
}

build();
