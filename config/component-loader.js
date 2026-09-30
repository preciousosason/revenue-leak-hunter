/* =================================
   GLOBAL COMPONENT LOADER
================================= */


/* =================================
   SITE ROOT
================================= */

const LOADER_SCRIPT =
    document.currentScript;

const SITE_ROOT =
    LOADER_SCRIPT
        ? new URL(
              "../",
              LOADER_SCRIPT.src
          )
        : new URL(
              "./",
              window.location.href
          );


/* =================================
   SESSION ASSET VERSION
================================= */

/*
   One version per browser session.

   This avoids stale component files
   without generating a brand-new
   cache key for every single request.
*/

const ASSET_VERSION_KEY =
    "leakendiaAssetVersion";

let ASSET_VERSION =
    sessionStorage.getItem(
        ASSET_VERSION_KEY
    );

if (!ASSET_VERSION) {

    ASSET_VERSION =
        String(
            Date.now()
        );

    sessionStorage.setItem(
        ASSET_VERSION_KEY,
        ASSET_VERSION
    );

}


/* =================================
   PATH RESOLVER
================================= */

function resolveSitePath(path) {

    if (!path) {
        return "";
    }

    return new URL(
        path,
        SITE_ROOT
    ).href;

}


/* =================================
   VERSIONED URL
================================= */

function versionedUrl(path) {

    const resolved =
        resolveSitePath(path);

    if (!resolved) {
        return "";
    }

    const url =
        new URL(resolved);

    url.searchParams.set(
        "v",
        ASSET_VERSION
    );

    return url.href;

}


/* =================================
   ROUTE BUILDER
================================= */

function buildRoute(routeName) {

    if (
        typeof SITE_CONFIG ===
            "undefined" ||
        !SITE_CONFIG.routes
    ) {

        console.warn(
            "SITE_CONFIG.routes was not found."
        );

        return "#";
    }


    const route =
        SITE_CONFIG.routes[
            routeName
        ];


    if (!route) {

        console.warn(
            `Unknown site route: "${routeName}"`
        );

        return "#";
    }


    return resolveSitePath(
        route
    );

}


/* =================================
   RESOLVE ROUTES
================================= */

function resolveRoutes(
    container = document
) {

    const links =
        container.querySelectorAll(
            "[data-route]"
        );


    links.forEach(
        link => {

            const routeName =
                link.dataset.route;

            const url =
                buildRoute(
                    routeName
                );


            if (
                url !== "#"
            ) {

                link.href =
                    url;

            }

        }
    );

}


/* =================================
   LOAD STYLESHEET
================================= */

function loadStylesheet(path) {

    if (!path) {
        return Promise.resolve();
    }


    const url =
        versionedUrl(path);


    /*
       Reuse an already-loaded component
       stylesheet if one exists.
    */

    const existing =
        Array.from(
            document.querySelectorAll(
                "link[rel='stylesheet']"
            )
        ).find(
            link => {

                try {

                    const current =
                        new URL(
                            link.href
                        );

                    const target =
                        new URL(
                            url
                        );

                    return (
                        current.pathname ===
                        target.pathname
                    );

                } catch {

                    return false;

                }

            }
        );


    if (existing) {

        if (
            existing.dataset.loaded ===
            "true" ||
            existing.sheet
        ) {

            return Promise.resolve();

        }


        return new Promise(
            resolve => {

                existing.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );


                existing.addEventListener(
                    "error",
                    resolve,
                    {
                        once: true
                    }
                );

            }
        );

    }


    return new Promise(
        resolve => {

            const stylesheet =
                document.createElement(
                    "link"
                );


            stylesheet.rel =
                "stylesheet";

            stylesheet.href =
                url;

            stylesheet.dataset.componentCss =
                url;


            stylesheet.onload =
                () => {

                    stylesheet.dataset.loaded =
                        "true";

                    resolve();

                };


            stylesheet.onerror =
                () => {

                    console.warn(
                        `Failed to load stylesheet: ${url}`
                    );

                    resolve();

                };


            document.head.appendChild(
                stylesheet
            );

        }
    );

}


/* =================================
   LOAD JAVASCRIPT
================================= */

function loadScript(path) {

    if (!path) {
        return Promise.resolve();
    }


    const url =
        versionedUrl(path);


    return new Promise(
        (resolve, reject) => {

            const existing =
                Array.from(
                    document.querySelectorAll(
                        "script[src]"
                    )
                ).find(
                    script => {

                        try {

                            const current =
                                new URL(
                                    script.src
                                );

                            const target =
                                new URL(
                                    url
                                );

                            return (
                                current.pathname ===
                                target.pathname
                            );

                        } catch {

                            return false;

                        }

                    }
                );


            if (existing) {

                if (
                    existing.dataset.loaded ===
                        "true"
                ) {

                    resolve();

                    return;

                }


                existing.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );


                existing.addEventListener(
                    "error",
                    reject,
                    {
                        once: true
                    }
                );


                return;
            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                url;

            script.defer =
                true;

            script.dataset.componentJs =
                url;


            script.onload =
                () => {

                    script.dataset.loaded =
                        "true";

                    resolve();

                };


            script.onerror =
                () => {

                    reject(
                        new Error(
                            `Failed to load ${url}`
                        )
                    );

                };


            document.body.appendChild(
                script
            );

        }
    );

}


/* =================================
   LOAD MODULE SCRIPT
================================= */

function loadModuleScript(path) {

    if (!path) {
        return Promise.resolve();
    }


    const url =
        versionedUrl(path);


    return new Promise(
        (resolve, reject) => {

            const existing =
                Array.from(
                    document.querySelectorAll(
                        "script[type='module'][src]"
                    )
                ).find(
                    script => {

                        try {

                            const current =
                                new URL(
                                    script.src
                                );

                            const target =
                                new URL(
                                    url
                                );

                            return (
                                current.pathname ===
                                target.pathname
                            );

                        } catch {

                            return false;

                        }

                    }
                );


            if (existing) {

                if (
                    existing.dataset.loaded ===
                        "true"
                ) {

                    resolve();

                    return;

                }


                existing.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );


                existing.addEventListener(
                    "error",
                    reject,
                    {
                        once: true
                    }
                );


                return;
            }


            const script =
                document.createElement(
                    "script"
                );


            script.type =
                "module";

            script.src =
                url;

            script.dataset.globalModule =
                url;


            script.onload =
                () => {

                    script.dataset.loaded =
                        "true";

                    resolve();

                };


            script.onerror =
                () => {

                    reject(
                        new Error(
                            `Failed to load module ${url}`
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* =================================
   PREFETCH RESOURCE
================================= */

function prefetchResource(
    path
) {

    if (!path) {
        return;
    }


    const url =
        versionedUrl(path);


    const existing =
        Array.from(
            document.querySelectorAll(
                "link[rel='prefetch']"
            )
        ).some(
            link =>
                link.href ===
                url
        );


    if (existing) {
        return;
    }


    const link =
        document.createElement(
            "link"
        );


    link.rel =
        "prefetch";

    link.href =
        url;


    document.head.appendChild(
        link
    );

}


/* =================================
   PRELOAD STYLESHEET
================================= */

function preloadStylesheet(
    path
) {

    if (!path) {
        return;
    }


    const url =
        versionedUrl(path);


    const existing =
        Array.from(
            document.querySelectorAll(
                "link[rel='preload']"
            )
        ).some(
            link =>
                link.href ===
                url
        );


    if (existing) {
        return;
    }


    const link =
        document.createElement(
            "link"
        );


    link.rel =
        "preload";

    link.as =
        "style";

    link.href =
        url;


    document.head.appendChild(
        link
    );

}


/* =================================
   LOAD COMPONENT
================================= */

async function loadComponent({
    id,
    html,
    css = null,
    js = null
}) {

    const element =
        document.getElementById(
            id
        );


    /*
       If this page does not contain
       the mount, skip the component.
    */

    if (!element) {
        return;
    }


    try {

        const htmlUrl =
            versionedUrl(
                html
            );


        /*
           Start HTML and CSS requests
           at the same time.

           CSS must finish before the
           markup is injected.
        */

        const cssPromise =
            css
                ? loadStylesheet(
                      css
                  )
                : Promise.resolve();


        const htmlPromise =
            fetch(
                htmlUrl,
                {
                    cache:
                        "default"
                }
            );


        const [
            response
        ] =
            await Promise.all([
                htmlPromise,
                cssPromise
            ]);


        if (
            !response.ok
        ) {

            throw new Error(
                `Failed to load ${htmlUrl}`
            );

        }


        const markup =
            await response.text();


        /*
           CSS is ready now, so the browser
           should not show a naked component.
        */

        element.innerHTML =
            markup;


        /* ============================
           RESOLVE ROUTES
        ============================ */

        resolveRoutes(
            element
        );


        /* ============================
           LOAD JAVASCRIPT
        ============================ */

        /*
           Component JS should not delay
           visual rendering.
        */

        if (js) {

            void loadScript(
                js
            ).catch(
                error => {

                    console.error(
                        `Component script failed: ${js}`,
                        error
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            `Component loading error: #${id}`,
            error
        );

    }

}


/* =================================
   GLOBAL COMPONENTS
================================= */

const GLOBAL_COMPONENTS = [

    {
        id: "navbar",

        html:
            "components/navbar/navbar.html",

        css:
            "components/navbar/navbar.css",

        js:
            "components/navbar/navbar.js"
    },

    {
        id: "footer",

        html:
            "components/footer/footer.html",

        css:
            "components/footer/footer.css",

        js:
            "components/footer/footer.js"
    },

    {
        id:
            "investigation-room",

        html:
            "components/investigation-room/investigation-room.html",

        css:
            "components/investigation-room/investigation-room.css"
    }

];


/* =================================
   HOMEPAGE COMPONENTS
================================= */

const HOMEPAGE_COMPONENTS = [

    {
        id: "hero",

        html:
            "components/hero/hero.html",

        css:
            "components/hero/hero.css",

        js:
            "components/hero/hero.js"
    },

    {
        id: "problem",

        html:
            "components/problem/problem.html",

        css:
            "components/problem/problem.css"
    },

    {
        id: "leaks",

        html:
            "components/leaks/leaks.html",

        css:
            "components/leaks/leaks.css"
    },

    {
        id: "process",

        html:
            "components/process/process.html",

        css:
            "components/process/process.css"
    },

    {
        id: "services",

        html:
            "components/services/services.html",

        css:
            "components/services/services.css"
    },

    {
        id:
            "testimonials",

        html:
            "components/testimonials/testimonials.html",

        css:
            "components/testimonials/testimonials.css",

        js:
            "components/testimonials/testimonials.js"
    },

    {
        id: "faq",

        html:
            "components/faq/faq.html",

        css:
            "components/faq/faq.css",

        js:
            "components/faq/faq.js"
    },

    {
        id: "cta",

        html:
            "components/cta/cta.html",

        css:
            "components/cta/cta.css"
    }

];


/* =================================
   SERVICES PAGE COMPONENTS
================================= */

const SERVICES_COMPONENTS = [

    {
        id:
            "servicesHero",

        html:
            "components/services-page/hero.html",

        css:
            "components/services-page/hero.css",

        js:
            "components/services-page/hero.js"
    },

    {
        id:
            "servicesIntro",

        html:
            "components/services-page/intro.html",

        css:
            "components/services-page/intro.css"
    },

    {
        id:
            "servicesList",

        html:
            "components/services-page/services.html",

        css:
            "components/services-page/services.css"
    },

    {
        id:
            "serviceProcess",

        html:
            "components/services-page/process.html",

        css:
            "components/services-page/process.css"
    },

    {
        id:
            "serviceFit",

        html:
            "components/services-page/fit.html",

        css:
            "components/services-page/fit.css"
    },

    {
        id:
            "servicesCTA",

        html:
            "components/services-page/cta.html",

        css:
            "components/services-page/cta.css"
    }

];


/* =================================
   SERVICE DETAIL COMPONENTS
================================= */

const SERVICE_DETAIL_COMPONENTS = [

    {
        id:
            "serviceHero",

        html:
            "components/service-detail/hero.html",

        css:
            "components/service-detail/hero.css",

        js:
            "components/service-detail/hero.js"
    },

    {
        id:
            "serviceContent",

        html:
            "components/service-detail/content.html",

        css:
            "components/service-detail/content.css"
    },

    {
        id:
            "serviceProcess",

        html:
            "components/service-detail/process.html",

        css:
            "components/service-detail/process.css"
    },

    {
        id:
            "serviceCTA",

        html:
            "components/service-detail/cta.html",

        css:
            "components/service-detail/cta.css"
    }

];


/* =================================
   PAGE COMPONENT MAP
================================= */

const PAGE_COMPONENTS = {

    home:
        HOMEPAGE_COMPONENTS,

    services:
        SERVICES_COMPONENTS,

    "service-detail":
        SERVICE_DETAIL_COMPONENTS

};


/* =================================
   LOAD COMPONENT GROUP
================================= */

async function loadComponentGroup(
    components
) {

    if (
        !components ||
        !components.length
    ) {
        return;
    }


    await Promise.all(

        components.map(
            component =>
                loadComponent(
                    component
                )
        )

    );

}


/* =================================
   PRELOAD CRITICAL COMPONENT CSS
================================= */

function preloadCriticalComponentStyles(
    pageType
) {

    /*
       Navbar CSS should start as early
       as possible on every public page.
    */

    preloadStylesheet(
        "components/navbar/navbar.css"
    );


    /*
       Homepage hero CSS is also critical
       because it appears immediately.
    */

    if (
        pageType ===
        "home"
    ) {

        preloadStylesheet(
            "components/hero/hero.css"
        );

    }


    /*
       Services hero.
    */

    if (
        pageType ===
        "services"
    ) {

        preloadStylesheet(
            "components/services-page/hero.css"
        );

    }


    /*
       Service detail hero.
    */

    if (
        pageType ===
        "service-detail"
    ) {

        preloadStylesheet(
            "components/service-detail/hero.css"
        );

    }

}


/* =================================
   PREFETCH COMPONENT HTML
================================= */

function prefetchLikelyComponents(
    pageType
) {

    /*
       These are useful but not critical.

       Prefetch lets the browser grab them
       when network capacity is available.
    */

    prefetchResource(
        "components/footer/footer.html"
    );


    if (
        pageType ===
        "home"
    ) {

        prefetchResource(
            "components/services/services.html"
        );

        prefetchResource(
            "components/testimonials/testimonials.html"
        );

    }

}


/* =================================
   CREATE GLOBAL MOUNTS
================================= */

function createGlobalComponentMounts() {

    /*
       Investigation Room is global,
       so create its mount automatically.
    */

    if (
        !document.getElementById(
            "investigation-room"
        )
    ) {

        const investigationRoom =
            document.createElement(
                "div"
            );


        investigationRoom.id =
            "investigation-room";


        document.body.appendChild(
            investigationRoom
        );

    }

}


/* =================================
   LOAD GLOBAL ANALYTICS
================================= */

async function loadGlobalAnalytics() {

    const pathname =
        window.location.pathname
            .toLowerCase();


    /*
       Do not track private areas.
    */

    const PRIVATE_PATHS = [

        "/admin",

        "/pages/admin",

        "/portal",

        "/pages/portal"

    ];


    const isPrivateArea =
        PRIVATE_PATHS.some(
            path =>

                pathname === path ||

                pathname.startsWith(
                    `${path}/`
                )

        );


    if (isPrivateArea) {
        return;
    }


    /*
       Prevent duplicate initialization.
    */

    if (
        window.LeakAnalytics ||

        document.querySelector(
            'script[data-leak-analytics="v2"]'
        )
    ) {

        return;

    }


    /*
       Analytics v2 configuration.
    */

    window.LEAK_ANALYTICS_CONFIG = {

        apiUrl:
            "https://revenue-leak-hunter-api.preciousosason.workers.dev",

        enabled:
            true,

        internal:
            false,

        autoLinkContact:
            true

    };


    try {

        const url =
            versionedUrl(
                "assets/js/leak-analytics.js"
            );


        await new Promise(
            (resolve, reject) => {

                const existing =
                    document.querySelector(
                        'script[data-leak-analytics="v2"]'
                    );


                if (existing) {

                    if (
                        existing.dataset.loaded ===
                            "true"
                    ) {

                        resolve();

                        return;

                    }


                    existing.addEventListener(
                        "load",
                        resolve,
                        {
                            once: true
                        }
                    );


                    existing.addEventListener(
                        "error",
                        reject,
                        {
                            once: true
                        }
                    );


                    return;

                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    url;

                script.defer =
                    true;

                script.dataset.leakAnalytics =
                    "v2";


                script.onload =
                    () => {

                        script.dataset.loaded =
                            "true";

                        resolve();

                    };


                script.onerror =
                    () => {

                        reject(
                            new Error(
                                `Failed to load ${url}`
                            )
                        );

                    };


                document.head.appendChild(
                    script
                );

            }
        );


        console.log(
            "Leak Analytics v2 initialized."
        );


    } catch (error) {

        /*
           Analytics must never prevent
           the website from rendering.
        */

        console.warn(
            "Leak Analytics v2 could not be loaded.",
            error
        );

    }

}


/* =================================
   INITIALIZE
================================= */

async function initializeComponents() {

    const pageType =
        document.body.dataset.page ||
        "home";


    console.log(
        `Initializing page: ${pageType}`
    );


    /* ==============================
       CREATE GLOBAL MOUNTS
    ============================== */

    createGlobalComponentMounts();


    /* ==============================
       CRITICAL CSS PRELOAD
    ============================== */

    preloadCriticalComponentStyles(
        pageType
    );


    /* ==============================
       BACKGROUND PREFETCH
    ============================== */

    prefetchLikelyComponents(
        pageType
    );


    /* ==============================
       ANALYTICS
    ============================== */

    /*
       Do NOT await this.

       Tracking should never sit in front
       of visible website rendering.
    */

    void loadGlobalAnalytics();


    /* ==============================
       COMPONENTS
    ============================== */

    const pageComponents =
        PAGE_COMPONENTS[
            pageType
        ] ||
        [];


    if (
        !PAGE_COMPONENTS[
            pageType
        ]
    ) {

        console.warn(
            `No component configuration found for page: "${pageType}"`
        );

    }


    /*
       Global and page components
       now load concurrently.
    */

    await Promise.all([

        loadComponentGroup(
            GLOBAL_COMPONENTS
        ),

        loadComponentGroup(
            pageComponents
        )

    ]);


    /* ==============================
       FINAL ROUTE RESOLUTION
    ============================== */

    resolveRoutes(
        document
    );


    console.log(
        `Page initialized: ${pageType}`
    );

}


/* =================================
   START LOADER
================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeComponents,
        {
            once: true
        }
    );

} else {

    initializeComponents();

}