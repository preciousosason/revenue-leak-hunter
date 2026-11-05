
/**
 * ============================================================
 * LEAKENDIA — CENTRAL URL ROUTER
 * ============================================================
 *
 * Supports:
 *
 * 1. Clean public page URLs
 * 2. Existing HTML/CSS/JS files
 * 3. Dynamic blog article URLs from articles.json
 * 4. Dynamic individual service pages
 * 5. Legacy physical URL redirects
 * 6. Trailing-slash normalization
 * 7. Public URL aliases
 * 8. Relative asset compatibility
 * 9. Query parameter preservation
 * 10. Static asset fallback
 *
 * No changes required to blog.js or articles.json.
 *
 * IMPORTANT:
 * Dynamic article routes use:
 *
 * /articles/{slug}/article
 *   -> /articles/{slug}/article.html
 *
 * Dynamic service routes use:
 *
 * /services/{slug}
 *   -> /pages/services/{slug}/index.html
 *
 * ============================================================
 */


/* ============================================================
   1. REGISTERED PUBLIC ROUTES
============================================================ */

const ROUTES = {
  "/": "/index.html",

  "/about": "/pages/about/about.html",

  "/services": "/pages/services/services.html",

  "/case-studies": "/pages/portfolio/portfolio.html",

  "/blog": "/pages/blog/blog.html",

  "/contact": "/pages/contact/contact.html",

  "/reviews": "/pages/reviews/reviews.html",

  "/blog/7-silent-conversion-leaks":
  "/articles/silent-conversion-leaks/article.html",

    "/blog/find-revenue-leaks-before-scaling":
  "/articles/find-revenue-leaks-before-scaling/article.html",
};


/* ============================================================
   2. ALIASES
============================================================ */

const ALIASES = {

  "/portfolio":
    "/case-studies",

    "/articles/silent-conversion-leaks/article":
  "/blog/7-silent-conversion-leaks",

  
    "/articles/find-revenue-leaks-before-scaling/article":
  "/blog/find-revenue-leaks-before-scaling",
};


/* ============================================================
   3. CONFIGURATION
============================================================ */

const SAFE_METHODS = new Set([
  "GET",
  "HEAD"
]);

const REDIRECT_STATUS = 302;

const PRIVATE_PREFIXES = [
  "/api",
  "/admin",
  "/portal",
  "/client-portal",
  "/pages/admin",
  "/pages/portal",
  "/pages/client-portal"
];

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;


/* ============================================================
   4. HELPERS
============================================================ */

function hasOwn(object, key) {

  return Object.prototype.hasOwnProperty.call(
    object,
    key
  );

}


function normalizePath(pathname) {

  if (pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";

}


function isReserved(pathname) {

  return PRIVATE_PREFIXES.some(prefix =>
    pathname === prefix ||
    pathname.startsWith(prefix + "/")
  );

}


function redirect(request, destination) {

  const url = new URL(request.url);

  url.pathname = destination;

  return Response.redirect(
    url.toString(),
    REDIRECT_STATUS
  );

}


function getPhysicalDirectory(physicalPath) {

  return physicalPath.substring(
    0,
    physicalPath.lastIndexOf("/") + 1
  );

}


function isValidSlug(slug) {

  return SLUG_PATTERN.test(slug);

}


/* ============================================================
   5. REVERSE ROUTE MAPS
============================================================ */

const PHYSICAL_ROUTES = new Map();

const PHYSICAL_DIRECTORIES = new Map();


for (const [publicPath, physicalPath] of Object.entries(ROUTES)) {

  PHYSICAL_ROUTES.set(
    physicalPath,
    publicPath
  );

  if (physicalPath.endsWith("/index.html")) {

    const directory = physicalPath.slice(
      0,
      -"/index.html".length
    );

    PHYSICAL_DIRECTORIES.set(
      directory,
      publicPath
    );

  }

}


/* ============================================================
   6. HTML BASE PATH HANDLER
============================================================ */

/**
 * Restores relative resource paths.
 *
 * Example:
 *
 * Public URL:
 * /articles/silent-conversion-leaks/article
 *
 * Physical HTML:
 * /articles/silent-conversion-leaks/article.html
 *
 * Relative CSS:
 * article.css
 *
 * Resolved CSS:
 * /articles/silent-conversion-leaks/article.css
 */

class BasePathHandler {

  constructor(directory) {
    this.directory = directory;
  }

  element(element) {

    element.prepend(
      `<base href="${this.directory}">`,
      { html: true }
    );

  }

}


/* ============================================================
   7. HTML RESPONSE PROCESSING
============================================================ */

function processHTML(response, physicalPath) {

  if (!response.ok) {
    return response;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (
    !contentType.toLowerCase().includes("text/html")
  ) {
    return response;
  }

  const directory =
    getPhysicalDirectory(physicalPath);

  return new HTMLRewriter()
    .on(
      "head",
      new BasePathHandler(directory)
    )
    .transform(response);

}


/* ============================================================
   8. SERVE PHYSICAL HTML
============================================================ */

async function servePage(request, env, physicalPath) {

  const internalURL = new URL(request.url);

  internalURL.pathname = physicalPath;

  const internalRequest = new Request(
    internalURL.toString(),
    request
  );

  const response = await env.ASSETS.fetch(
    internalRequest
  );

  // Do not return an unrelated fallback page for a
  // missing dynamic article or service.
  if (response.status === 404) {
    return new Response(
      "404 — Page not found",
      {
        status: 404,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-robots-tag": "noindex"
        }
      }
    );
  }

  return processHTML(
    response,
    physicalPath
  );

}


/* ============================================================
   9. DYNAMIC ARTICLE ROUTING
============================================================ */

/**
 * Supports article URLs already generated by
 * your existing articles.json.
 *
 * Example:
 *
 * /articles/silent-conversion-leaks/article
 *
 * maps internally to:
 *
 * /articles/silent-conversion-leaks/article.html
 *
 * No article-specific route registration required.
 */

function resolveArticleRoute(pathname) {

  const match = pathname.match(
    /^\/articles\/([^/]+)\/article$/
  );

  if (!match) {
    return null;
  }

  const slug = match[1];

  if (!isValidSlug(slug)) {
    return null;
  }

  return `/articles/${slug}/article.html`;

}


/* ============================================================
   10. DYNAMIC SERVICE ROUTING
============================================================ */

/**
 * Supports:
 *
 * /services/conversion-leak-hunting
 * /services/ai-visibility
 * /services/websites
 *
 * maps internally to:
 *
 * /pages/services/{slug}/index.html
 *
 * No manual route registration required.
 */

function resolveServiceRoute(pathname) {

  const match = pathname.match(
    /^\/services\/([^/]+)$/
  );

  if (!match) {
    return null;
  }

  const slug = match[1];

  if (!isValidSlug(slug)) {
    return null;
  }

  return `/pages/services/${slug}/index.html`;

}


/* ============================================================
   11. DYNAMIC LEGACY SERVICE DIRECTORIES
============================================================ */

/**
 * Example:
 *
 * /pages/services/ai-visibility/
 *
 * redirects to:
 *
 * /services/ai-visibility
 */

function resolveLegacyServiceDirectory(pathname) {

  const match = pathname.match(
    /^\/pages\/services\/([^/]+)\/?$/
  );

  if (!match) {
    return null;
  }

  const slug = match[1];

  if (!isValidSlug(slug)) {
    return null;
  }

  return `/services/${slug}`;

}


/* ============================================================
   12. LEGACY SERVICE HTML REDIRECTS
============================================================ */

/**
 * Example:
 *
 * /pages/services/ai-visibility/index.html
 *
 * redirects to:
 *
 * /services/ai-visibility
 */

function resolveLegacyServiceFile(pathname) {

  const match = pathname.match(
    /^\/pages\/services\/([^/]+)\/index\.html$/
  );

  if (!match) {
    return null;
  }

  const slug = match[1];

  if (!isValidSlug(slug)) {
    return null;
  }

  return `/services/${slug}`;

}


/* ============================================================
   13. MAIN CLOUDFLARE WORKER
============================================================ */

export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    const pathname = url.pathname;

    const normalized = normalizePath(pathname);


    /* --------------------------------------------------------
       A. PRIVATE / API AREAS
    --------------------------------------------------------- */

    if (isReserved(pathname)) {

      return env.ASSETS.fetch(request);

    }


    /* --------------------------------------------------------
       B. NON-GET / HEAD REQUESTS
    --------------------------------------------------------- */

    if (!SAFE_METHODS.has(request.method)) {

      return env.ASSETS.fetch(request);

    }


    /* --------------------------------------------------------
       C. REGISTERED PHYSICAL DIRECTORY REDIRECTS
    --------------------------------------------------------- */

    const directoryRoute =
      PHYSICAL_DIRECTORIES.get(normalized);

    if (directoryRoute !== undefined) {

      return redirect(
        request,
        directoryRoute
      );

    }


    /* --------------------------------------------------------
       D. REGISTERED PHYSICAL HTML REDIRECTS
    --------------------------------------------------------- */

    const physicalRoute =
      PHYSICAL_ROUTES.get(pathname);

    if (
      physicalRoute !== undefined &&
      physicalRoute !== pathname
    ) {

      return redirect(
        request,
        physicalRoute
      );

    }


    /* --------------------------------------------------------
       E. LEGACY SERVICE DIRECTORY REDIRECTS
    --------------------------------------------------------- */

    const legacyServiceDirectory =
      resolveLegacyServiceDirectory(pathname);

    if (legacyServiceDirectory) {

      return redirect(
        request,
        legacyServiceDirectory
      );

    }


    /* --------------------------------------------------------
       F. LEGACY SERVICE HTML REDIRECTS
    --------------------------------------------------------- */

    const legacyServiceFile =
      resolveLegacyServiceFile(pathname);

    if (legacyServiceFile) {

      return redirect(
        request,
        legacyServiceFile
      );

    }


    /* --------------------------------------------------------
       G. NORMALIZE MANAGED PUBLIC URLS
    --------------------------------------------------------- */

    if (normalized !== pathname) {

      const isRegistered =
        hasOwn(ROUTES, normalized);

      const isAlias =
        hasOwn(ALIASES, normalized);

      const isArticle =
        resolveArticleRoute(normalized) !== null;

      const isService =
        resolveServiceRoute(normalized) !== null;

      if (
        isRegistered ||
        isAlias ||
        isArticle ||
        isService
      ) {

        return redirect(
          request,
          normalized
        );

      }

    }


    /* --------------------------------------------------------
       H. PUBLIC ALIASES
    --------------------------------------------------------- */

    if (hasOwn(ALIASES, pathname)) {

      return redirect(
        request,
        ALIASES[pathname]
      );

    }


    /* --------------------------------------------------------
       I. REGISTERED PUBLIC ROUTES
    --------------------------------------------------------- */

    if (hasOwn(ROUTES, pathname)) {

      return servePage(
        request,
        env,
        ROUTES[pathname]
      );

    }


    /* --------------------------------------------------------
       J. DYNAMIC BLOG ARTICLE ROUTES
    --------------------------------------------------------- */

    const articlePath =
      resolveArticleRoute(pathname);

    if (articlePath) {

      return servePage(
        request,
        env,
        articlePath
      );

    }


    /* --------------------------------------------------------
       K. DYNAMIC SERVICE DETAIL ROUTES
    --------------------------------------------------------- */

    const servicePath =
      resolveServiceRoute(pathname);

    if (servicePath) {

      return servePage(
        request,
        env,
        servicePath
      );

    }


    /* --------------------------------------------------------
       L. STATIC ASSET FALLBACK
    --------------------------------------------------------- */

    return env.ASSETS.fetch(request);

  }

};
