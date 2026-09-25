const fs = require("fs");
const path = require("path");
const readline = require("readline");

const projectRoot = path.join(__dirname, "..");
const articlesDirectory = path.join(projectRoot, "articles");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function createArticle() {

    console.log("\n=== New Article ===\n");

    const title = await ask("Title: ");

    if (!title) {
        console.log("Title cannot be empty.");
        rl.close();
        return;
    }

    const category = await ask("Category: ");

    if (!category) {
        console.log("Category cannot be empty.");
        rl.close();
        return;
    }

    const description = await ask("Description: ");

    if (!description) {
        console.log("Description cannot be empty.");
        rl.close();
        return;
    }

    const publishStatus =
        await ask("Publish status (draft/published): ");

    const normalizedStatus =
        publishStatus.toLowerCase();

    if (!["draft", "published"].includes(normalizedStatus)) {

        console.log(
            "Publish status must be either 'draft' or 'published'."
        );

        rl.close();
        return;
    }

    const enteredSlug =
        await ask("SEO URL/slug: ");

    const slug =
        slugify(enteredSlug || title);

    if (!slug) {

        console.log(
            "A valid SEO URL/slug is required."
        );

        rl.close();
        return;
    }

    const articleDirectory =
        path.join(
            articlesDirectory,
            slug
        );

    const articleFile =
        path.join(
            articleDirectory,
            "article.html"
        );

    if (fs.existsSync(articleDirectory)) {

        console.log(
            `\nAn article with the slug "${slug}" already exists.`
        );

        rl.close();
        return;
    }

    fs.mkdirSync(
        articleDirectory,
        { recursive: true }
    );

    const publishedAt =
        normalizedStatus === "published"
            ? new Date().toISOString()
            : "";

    const articleHtml = `<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        ${escapeHtml(title)} | Conversion Leak Hunter
    </title>

    <meta
        name="description"
        content="${escapeHtml(description)}"
    >

    <meta
        name="article-title"
        content="${escapeHtml(title)}"
    >

    <meta
        name="article-category"
        content="${escapeHtml(category)}"
    >

    <meta
        name="article-description"
        content="${escapeHtml(description)}"
    >

    <meta
        name="article-status"
        content="${normalizedStatus}"
    >

    <meta
        name="article-slug"
        content="${escapeHtml(slug)}"
    >

    <meta
        name="published-at"
        content="${publishedAt}"
    >

    <!-- Global Styles -->
    <link
        rel="stylesheet"
        href="../../global/variables.css"
    >

    <link
        rel="stylesheet"
        href="../../global/global.css"
    >

    <link
        rel="stylesheet"
        href="../../global/responsive.css"
    >

    <!-- Components -->
    <link
        rel="stylesheet"
        href="../../components/navbar/navbar.css"
    >

    <link
        rel="stylesheet"
        href="../../components/footer/footer.css"
    >

    <!-- Article -->
    <link
        rel="stylesheet"
        href="../../pages/blog/article.css"
    >

</head>

<body>

    <!-- NAVBAR -->
    <div id="navbar"></div>

    <main>

        <article
            class="article-page"

            data-title="${escapeHtml(title)}"

            data-category="${escapeHtml(category)}"

            data-description="${escapeHtml(description)}"

            data-status="${normalizedStatus}"

            data-slug="${escapeHtml(slug)}"

            data-published-at="${publishedAt}"
        >

            <header class="article-header">

                <div class="container">

                    <div class="article-header-content">

                        <p class="article-category">
                            ${escapeHtml(category)}
                        </p>

                        <h1 class="article-title">
                            ${escapeHtml(title)}
                        </h1>

                        <p class="article-description">
                            ${escapeHtml(description)}
                        </p>

                        <div class="article-meta">

                            <span class="article-date">
                                —
                            </span>

                            <span>•</span>

                            <span
                                class="article-relative-time"
                            >
                                —
                            </span>

                        </div>

                    </div>

                </div>

            </header>

            <section class="article-body">

                <div class="container">

                    <div class="article-content">

                        <!-- =================================
                             WRITE YOUR ARTICLE BELOW
                        ================================= -->

                        <p>
                            Start writing your article here.
                        </p>

                    </div>

                </div>

            </section>

        </article>

    </main>

    <!-- FOOTER -->
    <div id="footer"></div>

    <!-- Component Loader -->
    <script src="../../config/component-loader.js"></script>

    <!-- Article -->
    <script src="../../pages/blog/article.js"></script>

</body>

</html>
`;

    fs.writeFileSync(
        articleFile,
        articleHtml,
        "utf8"
    );

    console.log("\nArticle created successfully.");

    console.log(
        `Location: articles/${slug}/article.html`
    );

    if (normalizedStatus === "published") {

        console.log(
            `Published at: ${publishedAt}`
        );

    } else {

        console.log("Status: Draft");

    }

    console.log("");

    rl.close();
}

createArticle();