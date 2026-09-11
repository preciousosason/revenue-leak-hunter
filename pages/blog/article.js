/* =================================
   ARTICLE API
================================= */

const BLOG_API_URL =
    "http://127.0.0.1:8000/api/blog/";
    "http://192.168.57.31:8000/api/blog/";
    "http://192.168.57.31:3000";


/* =================================
   GET SLUG
================================= */

function getArticleSlug() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("slug");

}


/* =================================
   FORMAT DATE
================================= */

function formatArticleDate(
    dateString
) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(date);

}


/* =================================
   ESTIMATE READ TIME
================================= */

function getReadTime(content) {

    if (!content) {
        return "1 min read";
    }

    const words =
        content.trim().split(/\s+/).length;

    const minutes =
        Math.max(
            1,
            Math.ceil(words / 200)
        );

    return `${minutes} min read`;

}


/* =================================
   RENDER CONTENT
================================= */

function renderArticleContent(
    content
) {

    const container =
        document.getElementById(
            "article-content"
        );

    if (!container) {
        return;
    }

    if (!content) {
        container.innerHTML = "";
        return;
    }

    const paragraphs =
        content
            .split(/\n\s*\n/)
            .map(
                paragraph =>
                    paragraph.trim()
            )
            .filter(Boolean);


    container.innerHTML =
        paragraphs
            .map(
                paragraph => `
                    <p>
                        ${escapeHtml(paragraph)}
                    </p>
                `
            )
            .join("");

}


/* =================================
   ESCAPE HTML
================================= */

function escapeHtml(text) {

    const element =
        document.createElement("div");

    element.textContent = text;

    return element.innerHTML;

}


/* =================================
   LOAD ARTICLE
================================= */

async function loadArticle() {

    const slug =
        getArticleSlug();


    const loading =
        document.getElementById(
            "article-loading"
        );

    const container =
        document.getElementById(
            "article-container"
        );

    const error =
        document.getElementById(
            "article-error"
        );


    if (!slug) {

        if (loading) {
            loading.hidden = true;
        }

        if (error) {
            error.hidden = false;
        }

        return;
    }


    try {

        const response =
            await fetch(
                `${BLOG_API_URL}${encodeURIComponent(slug)}/`
            );


        if (!response.ok) {
            throw new Error(
                `Article API returned ${response.status}`
            );
        }


        const data =
            await response.json();


        const post =
            data.post;


        if (!post) {
            throw new Error(
                "Article data was missing."
            );
        }


        document.title =
            `${post.title} | Precious`;


        const description =
            document.getElementById(
                "article-description"
            );

        if (description) {
            description.content =
                post.excerpt || "";
        }


        const category =
            document.getElementById(
                "article-category"
            );

        if (category) {
            category.textContent =
                post.category || "Conversion";
        }


        const heading =
            document.getElementById(
                "article-heading"
            );

        if (heading) {
            heading.textContent =
                post.title;
        }


        const excerpt =
            document.getElementById(
                "article-excerpt"
            );

        if (excerpt) {
            excerpt.textContent =
                post.excerpt || "";
        }


        const date =
            document.getElementById(
                "article-date"
            );

        if (date) {
            date.textContent =
                formatArticleDate(
                    post.published_at
                );
        }


        const readTime =
            document.getElementById(
                "article-read-time"
            );

        if (readTime) {
            readTime.textContent =
                getReadTime(
                    post.content
                );
        }


        renderArticleContent(
            post.content
        );


        if (loading) {
            loading.hidden = true;
        }

        if (container) {
            container.hidden = false;
        }


    } catch (articleError) {

        console.error(
            "Article loading error:",
            articleError
        );


        if (loading) {
            loading.hidden = true;
        }

        if (error) {
            error.hidden = false;
        }

    }

}


/* =================================
   INITIALIZE
================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadArticle();

    }
);