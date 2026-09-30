import fs from "fs";
import path from "path";


/* =================================
   CONFIG
================================= */

const ROOT =
    process.cwd();


const BASE_URL =
    "https://leakendia.com";


const DEFAULT_IMAGE =
    `${BASE_URL}/assets/images/og/leakendia-social.jpg`;


const DEFAULT_SITE_NAME =
    "Leakendia";


/* =================================
   EXCLUDED DIRECTORIES
================================= */

const EXCLUDED =
    new Set([
        "node_modules",
        "backend",
        ".git",
        "pages/admin",
        "pages/admin-backup",
        "pages/portal"
    ]);


/* =================================
   WALK FILES
================================= */

function walk(
    directory
) {

    const files = [];


    for (
        const entry
        of fs.readdirSync(
            directory,
            {
                withFileTypes: true
            }
        )
    ) {

        const fullPath =
            path.join(
                directory,
                entry.name
            );


        const relativePath =
            path
                .relative(
                    ROOT,
                    fullPath
                )
                .replace(
                    /\\/g,
                    "/"
                );


        if (
            entry.isDirectory()
        ) {

            const excluded =
                Array.from(
                    EXCLUDED
                ).some(
                    item =>
                        relativePath ===
                            item ||
                        relativePath.startsWith(
                            `${item}/`
                        )
                );


            if (!excluded) {

                files.push(
                    ...walk(
                        fullPath
                    )
                );

            }


            continue;

        }


        if (
            entry.isFile() &&
            entry.name.endsWith(
                ".html"
            )
        ) {

            files.push(
                fullPath
            );

        }

    }


    return files;

}


/* =================================
   READ EXISTING TITLE
================================= */

function getTitle(
    html
) {

    const match =
        html.match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );


    if (!match) {

        return DEFAULT_SITE_NAME;

    }


    return match[1]
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =================================
   READ EXISTING DESCRIPTION
================================= */

function getDescription(
    html
) {

    const match =
        html.match(
            /<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i
        ) ||
        html.match(
            /<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i
        );


    if (!match) {

        return (
            "Find where your customer journey is leaking conversions and what needs to change."
        );

    }


    return match[1]
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =================================
   ESCAPE ATTRIBUTE
================================= */

function escapeAttribute(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =================================
   PAGE URL
================================= */

function getPageUrl(
    file
) {

    let relative =
        path
            .relative(
                ROOT,
                file
            )
            .replace(
                /\\/g,
                "/"
            );


    if (
        relative ===
        "index.html"
    ) {

        return `${BASE_URL}/`;

    }


    /*
       Cloudflare Pages normally serves
       HTML pages using clean URLs.

       Example:

       pages/about/about.html
       becomes
       /pages/about/about
    */

    relative =
        relative.replace(
            /\.html$/i,
            ""
        );


    return (
        `${BASE_URL}/${relative}`
    );

}


/* =================================
   REMOVE OLD GENERATED META
================================= */

function removeGeneratedMeta(
    html
) {

    return html.replace(
        /<!-- LEAKENDIA META START -->[\s\S]*?<!-- LEAKENDIA META END -->/gi,
        ""
    );

}


/* =================================
   BUILD META BLOCK
================================= */

function buildMetaBlock({
    title,
    description,
    url
}) {

    const safeTitle =
        escapeAttribute(
            title
        );


    const safeDescription =
        escapeAttribute(
            description
        );


    const safeUrl =
        escapeAttribute(
            url
        );


    const safeImage =
        escapeAttribute(
            DEFAULT_IMAGE
        );


    return `
    <!-- LEAKENDIA META START -->

    <link
        rel="canonical"
        href="${safeUrl}"
    >

    <meta
        property="og:type"
        content="website"
    >

    <meta
        property="og:site_name"
        content="${DEFAULT_SITE_NAME}"
    >

    <meta
        property="og:title"
        content="${safeTitle}"
    >

    <meta
        property="og:description"
        content="${safeDescription}"
    >

    <meta
        property="og:url"
        content="${safeUrl}"
    >

    <meta
        property="og:image"
        content="${safeImage}"
    >

    <meta
        property="og:image:width"
        content="1200"
    >

    <meta
        property="og:image:height"
        content="630"
    >

    <meta
        property="og:image:alt"
        content="${DEFAULT_SITE_NAME}"
    >

    <meta
        name="twitter:card"
        content="summary_large_image"
    >

    <meta
        name="twitter:title"
        content="${safeTitle}"
    >

    <meta
        name="twitter:description"
        content="${safeDescription}"
    >

    <meta
        name="twitter:image"
        content="${safeImage}"
    >

    <!-- LEAKENDIA META END -->
`;

}


/* =================================
   PROCESS FILE
================================= */

function processFile(
    file
) {

    let html =
        fs.readFileSync(
            file,
            "utf8"
        );


    html =
        removeGeneratedMeta(
            html
        );


    const title =
        getTitle(
            html
        );


    const description =
        getDescription(
            html
        );


    const url =
        getPageUrl(
            file
        );


    const meta =
        buildMetaBlock({
            title,
            description,
            url
        });


    if (
        !/<\/head>/i.test(
            html
        )
    ) {

        console.warn(
            `Skipped: no </head> found in ${file}`
        );

        return;

    }


    html =
        html.replace(
            /<\/head>/i,
            `${meta}\n</head>`
        );


    fs.writeFileSync(
        file,
        html,
        "utf8"
    );


    console.log(
        `Updated: ${path.relative(ROOT, file)}`
    );

}


/* =================================
   RUN
================================= */

const files =
    walk(
        ROOT
    );


console.log(
    `Found ${files.length} HTML files.`
);


for (
    const file
    of files
) {

    processFile(
        file
    );

}


console.log(
    "Leakendia social metadata injected."
);