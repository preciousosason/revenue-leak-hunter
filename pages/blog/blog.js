document.addEventListener("DOMContentLoaded", () => {

    const featuredPost = document.getElementById("featured-post");
    const articlesGrid = document.getElementById("articles-grid");

    if (!featuredPost || !articlesGrid) {
        return;
    }


    /*
    =================================
    LOAD BLOG DATA
    =================================
    */

    fetch("../../data/articles.json")
        .then(response => {

            if (!response.ok) {
                throw new Error("Could not load article data.");
            }

            return response.json();
        })

        .then(data => {

            const publishedArticles =
                data.publishedArticles || [];

            if (publishedArticles.length === 0) {

                showEmptyState();

                return;
            }


            /*
            =================================
            FEATURED ARTICLE
            =================================
            */

            const featuredArticle =
                publishedArticles[0];

            renderFeaturedArticle(
                featuredArticle
            );


            /*
            =================================
            RECENT ARTICLES
            =================================
            */

            const recentArticles =
                publishedArticles.slice(1);

            renderRecentArticles(
                recentArticles
            );


            /*
            =================================
            RELATIVE TIME
            =================================
            */

            updateRelativeTimes();

            setInterval(
                updateRelativeTimes,
                30000
            );

        })

        .catch(error => {

            console.error(
                "Blog loading error:",
                error
            );

            featuredPost.innerHTML = `
                <div class="featured-post-content">

                    <span class="post-category">
                        Blog
                    </span>

                    <h2>
                        Articles unavailable
                    </h2>

                    <p>
                        The article registry could not be loaded.
                    </p>

                </div>

                <div class="featured-post-visual">

                    <div class="leak-diagram">

                        <div class="diagram-node">
                            BLOG
                        </div>

                        <div class="diagram-line"></div>

                        <div class="diagram-node diagram-warning">
                            ERROR
                        </div>

                    </div>

                </div>
            `;

        });


    /*
    =================================
    FEATURED ARTICLE
    =================================
    */

    function renderFeaturedArticle(article) {

        featuredPost.innerHTML = `

            <div class="featured-post-content">

                <p class="post-category">
                    ${escapeHtml(article.category)}
                </p>

                <h2>
                    ${escapeHtml(article.title)}
                </h2>

                <p>
                    ${escapeHtml(
                        article.description ||
                        "An investigation into the friction, leaks, and missed opportunities hiding inside the customer journey."
                    )}
                </p>

                <div class="post-meta">

                    <span class="post-date">
                        ${formatDate(article.publishedAt)}
                    </span>

                    <span>•</span>

                    <span
                        class="post-time"
                        data-published-at="${article.publishedAt}"
                    >
                        ${formatRelativeTime(
                            article.publishedAt
                        )}
                    </span>

                </div>

                <a
                    href="${article.url}"
                    class="post-link"
                >
                    Read article
                    <span>→</span>
                </a>

            </div>


            <div class="featured-post-visual">

                <div class="leak-diagram">

                    <div class="diagram-node">
                        VISITORS
                    </div>

                    <div class="diagram-line"></div>

                    <div class="diagram-node diagram-warning">
                        LEAK
                    </div>

                    <div class="diagram-line"></div>

                    <div class="diagram-node">
                        CUSTOMERS
                    </div>

                </div>

            </div>

        `;
    }


    /*
    =================================
    RECENT ARTICLES
    =================================
    */

    function renderRecentArticles(articles) {

        articlesGrid.innerHTML = "";


        if (articles.length === 0) {

            articlesGrid.innerHTML = `
                <p>
                    No other published articles yet.
                </p>
            `;

            return;
        }


        articles.forEach(article => {

            const card =
                document.createElement("article");

            card.className = "article-card";


            card.innerHTML = `

                <p class="article-card-category">
                    ${escapeHtml(article.category)}
                </p>

                <h3>
                    ${escapeHtml(article.title)}
                </h3>

                <p>
                    ${escapeHtml(
                        article.description ||
                        "An investigation into a problem that may be quietly costing businesses customers."
                    )}
                </p>

                <div class="article-card-footer">

                    <div class="article-card-meta">

                        <span>
                            ${formatDate(
                                article.publishedAt
                            )}
                        </span>

                        <br>

                        <span
                            class="article-relative-time"
                            data-published-at="${article.publishedAt}"
                        >
                            ${formatRelativeTime(
                                article.publishedAt
                            )}
                        </span>

                    </div>

                    <a
                        href="${article.url}"
                        class="article-card-link"
                    >
                        Read →
                    </a>

                </div>

            `;


            articlesGrid.appendChild(card);

        });

    }


    /*
    =================================
    RELATIVE TIME
    =================================
    */

    function updateRelativeTimes() {

        const elements =
            document.querySelectorAll(
                "[data-published-at]"
            );


        elements.forEach(element => {

            const publishedAt =
                element.dataset.publishedAt;

            element.textContent =
                formatRelativeTime(
                    publishedAt
                );

        });

    }


    function formatRelativeTime(dateString) {

        if (!dateString) {
            return "";
        }


        const published =
            new Date(dateString);

        const now =
            new Date();

        const seconds =
            Math.floor(
                (now - published) / 1000
            );


        if (seconds < 60) {

            return `Published ${
                Math.max(seconds, 0)
            } seconds ago`;

        }


        const minutes =
            Math.floor(seconds / 60);


        if (minutes < 60) {

            return `Published ${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }


        const hours =
            Math.floor(minutes / 60);


        if (hours < 24) {

            return `Published ${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }


        const days =
            Math.floor(hours / 24);


        if (days < 7) {

            return `Published ${days} ${
                days === 1
                    ? "day"
                    : "days"
            } ago`;

        }


        const weeks =
            Math.floor(days / 7);


        if (weeks < 5) {

            return `Published ${weeks} ${
                weeks === 1
                    ? "week"
                    : "weeks"
            } ago`;

        }


        const months =
            Math.floor(days / 30);


        if (months < 12) {

            return `Published ${months} ${
                months === 1
                    ? "month"
                    : "months"
            } ago`;

        }


        const years =
            Math.floor(days / 365);


        return `Published ${years} ${
            years === 1
                ? "year"
                : "years"
        } ago`;

    }


    /*
    =================================
    PUBLICATION DATE
    =================================
    */

    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }


        const date =
            new Date(dateString);


        return date.toLocaleDateString(
            "en-GB",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }


    /*
    =================================
    EMPTY BLOG
    =================================
    */

    function showEmptyState() {

        featuredPost.innerHTML = `

            <div class="featured-post-content">

                <p class="post-category">
                    The Hunt
                </p>

                <h2>
                    The hunt begins soon.
                </h2>

                <p>
                    No published articles are available yet.
                </p>

            </div>

            <div class="featured-post-visual">

                <div class="leak-diagram">

                    <div class="diagram-node">
                        TRAFFIC
                    </div>

                    <div class="diagram-line"></div>

                    <div class="diagram-node diagram-warning">
                        ?
                    </div>

                    <div class="diagram-line"></div>

                    <div class="diagram-node">
                        GROWTH
                    </div>

                </div>

            </div>

        `;


        articlesGrid.innerHTML = "";

    }


    /*
    =================================
    HTML SAFETY
    =================================
    */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

});