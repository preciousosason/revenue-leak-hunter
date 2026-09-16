const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");

const articlesDirectory =
    path.join(
        projectRoot,
        "articles"
    );

const dataDirectory =
    path.join(
        projectRoot,
        "data"
    );

const outputFile =
    path.join(
        dataDirectory,
        "articles.json"
    );


function decodeHtmlEntities(text) {

    return text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#39;/g, "'");

}


function getMetaValue(html, name) {

    const pattern =
        new RegExp(
            `<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`,
            "i"
        );

    const match =
        html.match(pattern);


    return match
        ? decodeHtmlEntities(
            match[1].trim()
        )
        : "";

}


function getArticleDirectories() {

    if (!fs.existsSync(articlesDirectory)) {
        return [];
    }


    return fs
        .readdirSync(
            articlesDirectory,
            { withFileTypes: true }
        )

        .filter(
            entry => entry.isDirectory()
        )

        .map(
            entry => entry.name
        );

}


function buildArticleRecord(slug) {

    const articleFile =
        path.join(
            articlesDirectory,
            slug,
            "article.html"
        );


    if (!fs.existsSync(articleFile)) {
        return null;
    }


    const html =
        fs.readFileSync(
            articleFile,
            "utf8"
        );


    const title =
        getMetaValue(
            html,
            "article-title"
        );


    const category =
        getMetaValue(
            html,
            "article-category"
        );


    const description =
        getMetaValue(
            html,
            "article-description"
        );


    const status =
        getMetaValue(
            html,
            "article-status"
        );


    const articleSlug =
        getMetaValue(
            html,
            "article-slug"
        ) || slug;


    const publishedAt =
        getMetaValue(
            html,
            "published-at"
        );


    if (!title) {

        console.warn(
            `Skipping "${slug}": article title is missing.`
        );

        return null;
    }


    return {

        title,

        category,

        description,

        slug: articleSlug,

        status: status || "draft",

        publishedAt:
            publishedAt || null,

        url:
            `/articles/${articleSlug}/article.html`

    };

}


function buildBlogData() {

    const slugs =
        getArticleDirectories();


    const articles =
        slugs
            .map(buildArticleRecord)
            .filter(Boolean);


    /*
    =================================
    NEWEST FIRST
    =================================
    */

    articles.sort((a, b) => {

        const dateA =
            a.publishedAt
                ? new Date(
                    a.publishedAt
                ).getTime()
                : 0;


        const dateB =
            b.publishedAt
                ? new Date(
                    b.publishedAt
                ).getTime()
                : 0;


        return dateB - dateA;

    });


    /*
    =================================
    PUBLISHED ARTICLES
    =================================
    */

    const publishedArticles =
        articles.filter(
            article =>
                article.status === "published"
        );


    /*
    =================================
    BLOG DATA
    =================================
    */

    const data = {

        generatedAt:
            new Date().toISOString(),

        articles,

        publishedArticles

    };


    /*
    =================================
    WRITE JSON
    =================================
    */

    fs.mkdirSync(
        dataDirectory,
        { recursive: true }
    );


    fs.writeFileSync(

        outputFile,

        JSON.stringify(
            data,
            null,
            4
        ),

        "utf8"

    );


    console.log(
        "\nBlog build complete."
    );

    console.log(
        `Total articles: ${articles.length}`
    );

    console.log(
        `Published articles: ${publishedArticles.length}`
    );

    console.log(
        `Output: data/articles.json\n`
    );

}


buildBlogData();