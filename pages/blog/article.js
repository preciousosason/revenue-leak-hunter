/* =================================
   ARTICLE API
================================= */

const BLOG_API_URL =
    "https://revenue-leak-hunter-backend.onrender.com/api/blog/";


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
   ESCAPE HTML
================================= */

function escapeHtml(text) {

    const element =
        document.createElement("div");

    element.textContent =
        text || "";

    return element.innerHTML;

}


/* =================================
   SAFE URL
================================= */

function isSafeUrl(url) {

    if (!url) {
        return false;
    }

    try {

        const parsed =
            new URL(
                url,
                window.location.origin
            );

        return [
            "http:",
            "https:",
            "mailto:"
        ].includes(
            parsed.protocol
        );

    } catch {

        return false;

    }

}


/* =================================
   YOUTUBE URL
================================= */

function getYouTubeEmbedUrl(url) {

    if (!url) {
        return null;
    }

    try {

        const parsed =
            new URL(url);

        let videoId = null;

        if (
            parsed.hostname === "youtu.be"
        ) {

            videoId =
                parsed.pathname
                    .replace("/", "");

        }

        if (
            parsed.hostname === "youtube.com" ||
            parsed.hostname === "www.youtube.com" ||
            parsed.hostname === "youtube-nocookie.com" ||
            parsed.hostname === "www.youtube-nocookie.com"
        ) {

            if (
                parsed.pathname === "/watch"
            ) {

                videoId =
                    parsed.searchParams.get(
                        "v"
                    );

            }

            if (
                parsed.pathname.startsWith(
                    "/embed/"
                )
            ) {

                videoId =
                    parsed.pathname
                        .split("/embed/")[1];

            }

        }

        if (!videoId) {
            return null;
        }

        videoId =
            videoId
                .replace(
                    /[^a-zA-Z0-9_-]/g,
                    ""
                );

        if (!videoId) {
            return null;
        }

        return (
            "https://www.youtube-nocookie.com/embed/" +
            videoId
        );

    } catch {

        return null;

    }

}


/* =================================
   CREATE ELEMENT
================================= */

function createElement(
    tag,
    className = ""
) {

    const element =
        document.createElement(tag);

    if (className) {

        element.className =
            className;

    }

    return element;

}


/* =================================
   RENDER HEADING
================================= */

function renderHeading(block) {

    const level =
        [1, 2, 3].includes(
            Number(block.level)
        )
            ? Number(block.level)
            : 2;

    const heading =
        createElement(
            `h${level}`,
            `article-block-heading article-block-heading-${level}`
        );

    heading.textContent =
        block.text || "";

    return heading;

}


/* =================================
   RENDER PARAGRAPH
================================= */

function renderParagraph(block) {

    const paragraph =
        createElement(
            "p",
            "article-block-paragraph"
        );

    paragraph.textContent =
        block.text || "";

    return paragraph;

}


/* =================================
   RENDER QUOTE
================================= */

function renderQuote(block) {

    const figure =
        createElement(
            "figure",
            "article-block-quote"
        );

    const quote =
        createElement(
            "blockquote"
        );

    quote.textContent =
        block.text || "";

    figure.appendChild(
        quote
    );

    if (block.attribution) {

        const caption =
            createElement(
                "figcaption"
            );

        caption.textContent =
            block.attribution;

        figure.appendChild(
            caption
        );

    }

    return figure;

}


/* =================================
   RENDER LIST
================================= */

function renderList(block) {

    const ordered =
        block.type === "numbered_list";

    const list =
        createElement(
            ordered
                ? "ol"
                : "ul",
            ordered
                ? "article-block-list article-block-numbered-list"
                : "article-block-list article-block-bullet-list"
        );

    const items =
        Array.isArray(block.items)
            ? block.items
            : [];

    items.forEach(item => {

        const li =
            createElement("li");

        li.textContent =
            typeof item === "string"
                ? item
                : "";

        list.appendChild(
            li
        );

    });

    return list;

}


/* =================================
   RENDER IMAGE
================================= */

function renderImage(block) {

    if (!isSafeUrl(block.url)) {
        return null;
    }

    const figure =
        createElement(
            "figure",
            "article-block-image"
        );

    const image =
        document.createElement("img");

    image.src =
        block.url;

    image.alt =
        block.alt || "";

    image.loading =
        "lazy";

    image.decoding =
        "async";

    figure.appendChild(
        image
    );

    if (block.caption) {

        const caption =
            createElement(
                "figcaption"
            );

        caption.textContent =
            block.caption;

        figure.appendChild(
            caption
        );

    }

    return figure;

}


/* =================================
   RENDER LINK
================================= */

function renderLink(block) {

    if (!isSafeUrl(block.url)) {
        return null;
    }

    const wrapper =
        createElement(
            "p",
            "article-block-link-wrapper"
        );

    const link =
        document.createElement("a");

    link.href =
        block.url;

    link.textContent =
        block.text || block.url;

    link.className =
        "article-block-link";

    if (block.new_tab) {

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

    }

    wrapper.appendChild(
        link
    );

    return wrapper;

}


/* =================================
   RENDER BUTTON
================================= */

function renderButton(block) {

    if (!isSafeUrl(block.url)) {
        return null;
    }

    const wrapper =
        createElement(
            "div",
            "article-block-button-wrapper"
        );

    const link =
        document.createElement("a");

    link.href =
        block.url;

    link.textContent =
        block.text || "Learn More";

    link.className =
        "article-block-button";

    if (block.new_tab) {

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

    }

    wrapper.appendChild(
        link
    );

    return wrapper;

}


/* =================================
   RENDER CALLOUT
================================= */

function renderCallout(block) {

    const callout =
        createElement(
            "aside",
            "article-block-callout"
        );

    if (block.title) {

        const title =
            createElement(
                "h3"
            );

        title.textContent =
            block.title;

        callout.appendChild(
            title
        );

    }

    if (block.text) {

        const text =
            createElement(
                "p"
            );

        text.textContent =
            block.text;

        callout.appendChild(
            text
        );

    }

    return callout;

}


/* =================================
   RENDER DIVIDER
================================= */

function renderDivider() {

    return createElement(
        "hr",
        "article-block-divider"
    );

}


/* =================================
   RENDER SPACER
================================= */

function renderSpacer(block) {

    const spacer =
        createElement(
            "div",
            "article-block-spacer"
        );

    let height =
        Number(block.height);

    if (!Number.isFinite(height)) {
        height = 32;
    }

    height =
        Math.min(
            Math.max(height, 8),
            300
        );

    spacer.style.height =
        `${height}px`;

    spacer.setAttribute(
        "aria-hidden",
        "true"
    );

    return spacer;

}


/* =================================
   RENDER YOUTUBE
================================= */

function renderYouTube(block) {

    const embedUrl =
        getYouTubeEmbedUrl(
            block.url
        );

    if (!embedUrl) {
        return null;
    }

    const wrapper =
        createElement(
            "div",
            "article-block-video"
        );

    const iframe =
        document.createElement(
            "iframe"
        );

    iframe.src =
        embedUrl;

    iframe.title =
        block.title ||
        "YouTube video";

    iframe.loading =
        "lazy";

    iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

    iframe.allowFullscreen =
        true;

    wrapper.appendChild(
        iframe
    );

    return wrapper;

}


/* =================================
   RENDER CODE
================================= */

function renderCode(block) {

    const wrapper =
        createElement(
            "div",
            "article-block-code"
        );

    const pre =
        document.createElement(
            "pre"
        );

    const code =
        document.createElement(
            "code"
        );

    code.textContent =
        block.code || "";

    if (block.language) {

        code.className =
            `language-${block.language}`;

    }

    pre.appendChild(
        code
    );

    wrapper.appendChild(
        pre
    );

    return wrapper;

}


/* =================================
   RENDER SINGLE BLOCK
================================= */

function renderBlock(block) {

    if (
        !block ||
        typeof block !== "object"
    ) {
        return null;
    }

    switch (block.type) {

        case "heading":
            return renderHeading(block);

        case "paragraph":
            return renderParagraph(block);

        case "quote":
            return renderQuote(block);

        case "bullet_list":
            return renderList(block);

        case "numbered_list":
            return renderList(block);

        case "image":
            return renderImage(block);

        case "link":
            return renderLink(block);

        case "button":
            return renderButton(block);

        case "callout":
            return renderCallout(block);

        case "divider":
            return renderDivider();

        case "spacer":
            return renderSpacer(block);

        case "youtube":
            return renderYouTube(block);

        case "code":
            return renderCode(block);

        default:
            console.warn(
                "Unknown article block:",
                block.type
            );

            return null;

    }

}


/* =================================
   LEGACY CONTENT → BLOCKS
================================= */

function legacyContentToBlocks(
    content
) {

    if (!content) {
        return [];
    }

    return content
        .split(/\n\s*\n/)
        .map(
            paragraph =>
                paragraph.trim()
        )
        .filter(Boolean)
        .map(
            paragraph => ({
                type: "paragraph",
                text: paragraph
            })
        );

}


/* =================================
   GET ARTICLE BLOCKS
================================= */

function getArticleBlocks(post) {

    if (
        Array.isArray(post.blocks) &&
        post.blocks.length
    ) {

        return post.blocks;

    }

    return legacyContentToBlocks(
        post.content
    );

}


/* =================================
   GET ARTICLE TEXT
================================= */

function getArticleText(
    post
) {

    const blocks =
        getArticleBlocks(post);

    const textParts = [];

    blocks.forEach(block => {

        if (
            block.type === "paragraph" ||
            block.type === "heading" ||
            block.type === "quote" ||
            block.type === "callout"
        ) {

            if (block.text) {
                textParts.push(
                    block.text
                );
            }

            if (block.title) {
                textParts.push(
                    block.title
                );
            }

        }

        if (
            block.type === "bullet_list" ||
            block.type === "numbered_list"
        ) {

            if (
                Array.isArray(
                    block.items
                )
            ) {

                textParts.push(
                    ...block.items
                );

            }

        }

        if (block.type === "code") {

            if (block.code) {
                textParts.push(
                    block.code
                );
            }

        }

    });

    return textParts.join(" ");

}


/* =================================
   ESTIMATE READ TIME
================================= */

function getReadTime(post) {

    const text =
        getArticleText(post);

    if (!text.trim()) {
        return "1 min read";
    }

    const words =
        text
            .trim()
            .split(/\s+/)
            .length;

    const minutes =
        Math.max(
            1,
            Math.ceil(
                words / 200
            )
        );

    return `${minutes} min read`;

}


/* =================================
   RENDER ARTICLE CONTENT
================================= */

function renderArticleContent(
    post
) {

    const container =
        document.getElementById(
            "article-content"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const blocks =
        getArticleBlocks(post);

    blocks.forEach(block => {

        const element =
            renderBlock(block);

        if (element) {

            container.appendChild(
                element
            );

        }

    });

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
                post.category ||
                "Conversion";

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
                getReadTime(post);

        }


        renderArticleContent(
            post
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