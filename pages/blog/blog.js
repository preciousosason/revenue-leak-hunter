

/* =================================
   BLOG API
================================= */

const BLOG_API_URL =

    "https://revenue-leak-hunter-backend.onrender.com/api/blog/";


/* =================================
   FORMAT DATE
================================= */

function formatPublishedDate(dateString) {

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
            month: "short",
            day: "numeric"
        }
    ).format(date);
}


/* =================================
   GET ARTICLE URL
================================= */

function getArticleUrl(slug) {

    return `/pages/blog/article.html?slug=${encodeURIComponent(slug)}`;

}


/* =================================
   GET CATEGORY
================================= */

function getCategory(post) {

    if (post.category) {
        return post.category;
    }

    return "Conversion";

}


/* =================================
   GET READ TIME
================================= */

function getReadTime(post) {

    if (post.read_time) {
        return post.read_time;
    }

    return "5 min read";

}


/* =================================
   RENDER BLOG POSTS
================================= */

function renderBlogPosts(posts) {

    const grid =
        document.getElementById(
            "articles-grid"
        );

    if (!grid) {
        return;
    }


    if (!posts.length) {

        grid.innerHTML = `
            <div class="blog-empty">
                <p>
                    No published articles yet.
                </p>
            </div>
        `;

        return;
    }


    grid.innerHTML =
        posts.map(post => {

            const category =
                getCategory(post);

            const readTime =
                getReadTime(post);

            const publishedDate =
                formatPublishedDate(
                    post.published_at
                );

            return `

                <article class="article-card">

                    <span class="article-card-category">
                        ${category}
                    </span>

                    <h3>
                        ${post.title}
                    </h3>

                    <p>
                        ${post.excerpt}
                    </p>

                    <div class="article-card-footer">

                        <span class="article-card-meta">
                            ${readTime}
                        </span>

                        ${
                            publishedDate
                                ? `
                                    <span class="article-card-date">
                                        ${publishedDate}
                                    </span>
                                  `
                                : ""
                        }

                        <a
                            href="${getArticleUrl(post.slug)}"
                            class="article-card-link"
                            data-slug="${post.slug}"
                        >
                            Read →
                        </a>

                    </div>

                </article>

            `;

        }).join("");

}

/* =================================
   RENDER FEATURED POST
================================= */

function renderFeaturedPost(posts) {

    const featuredPost =
        posts.find(
            post => post.featured
        );


    if (!featuredPost) {
        return;
    }


    const category =
        getCategory(featuredPost);


    const readTime =
        getReadTime(featuredPost);


    const publishedDate =
        formatPublishedDate(
            featuredPost.published_at
        );


    const categoryElement =
        document.getElementById(
            "featured-category"
        );

    const title =
        document.getElementById(
            "featured-title"
        );

    const excerpt =
        document.getElementById(
            "featured-excerpt"
        );

    const categoryMeta =
        document.getElementById(
            "featured-category-meta"
        );

    const readTimeElement =
        document.getElementById(
            "featured-read-time"
        );

    const dateElement =
        document.getElementById(
            "featured-date"
        );

    const link =
        document.getElementById(
            "featured-link"
        );


    if (categoryElement) {

        categoryElement.textContent =
            category;

    }


    if (title) {

        title.textContent =
            featuredPost.title;

    }


    if (excerpt) {

        excerpt.textContent =
            featuredPost.excerpt;

    }


    if (categoryMeta) {

        categoryMeta.textContent =
            category;

    }


    if (readTimeElement) {

        readTimeElement.textContent =
            readTime;

    }


    if (dateElement) {

        dateElement.textContent =
            publishedDate;

    }


    if (link) {

        link.href =
            getArticleUrl(
                featuredPost.slug
            );

    }

}
/* =================================
   LOAD BLOG POSTS
================================= */

async function loadBlogPosts() {

    const grid =
        document.getElementById(
            "articles-grid"
        );

    if (!grid) {
        return;
    }

    try {

        grid.innerHTML = `
            <div class="blog-loading">
                <p>
                    Loading articles...
                </p>
            </div>
        `;

        const response =
            await fetch(
                BLOG_API_URL
            );

        if (!response.ok) {

            throw new Error(
                `Blog API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        const posts =
            Array.isArray(data.posts)
                ? data.posts
                : [];

        renderFeaturedPost(posts);

        renderBlogPosts(posts);

    } catch (error) {

        console.error(
            "Blog loading error:",
            error
        );

        grid.innerHTML = `
            <div class="blog-error">
                <p>
                    Unable to load articles right now.
                </p>
            </div>
        `;

    }

}

/* =================================
   INITIALIZE
================================= */

console.log("BLOG.JS LOADED");

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log("BLOG DOM READY");

        loadBlogPosts();

    }
);