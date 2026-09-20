/* =================================
   GLOBAL COMPONENT LOADER
================================= */

const LOADER_SCRIPT = document.currentScript;

const SITE_ROOT = LOADER_SCRIPT
    ? new URL("../", LOADER_SCRIPT.src)
    : new URL("./", window.location.href);


/* =================================
   PATH RESOLVER
================================= */

function resolveSitePath(path) {

    if (!path) {
        return "";
    }

    return new URL(path, SITE_ROOT).href;
}


/* =================================
   BUILD ROUTE
================================= */

function buildRoute(routeName) {

    if (
        typeof SITE_CONFIG === "undefined" ||
        !SITE_CONFIG.routes
    ) {

        console.warn(
            "SITE_CONFIG.routes was not found."
        );

        return "#";
    }


    const route =
        SITE_CONFIG.routes[routeName];


    if (!route) {

        console.warn(
            `Unknown site route: "${routeName}"`
        );

        return "#";
    }


    return resolveSitePath(route);

}


/* =================================
   RESOLVE ROUTES
================================= */

function resolveRoutes(container = document) {

    const links =
        container.querySelectorAll(
            "[data-route]"
        );


    links.forEach(link => {

        const routeName =
            link.dataset.route;


        const url =
            buildRoute(routeName);


        if (url !== "#") {

            link.href = url;

        }

    });

}


/* =================================
   LOAD COMPONENT
================================= */

async function loadComponent(
    elementId,
    componentPath,
    cssPath = null,
    jsPath = null
) {

    const element =
        document.getElementById(elementId);


    if (!element) {

        console.warn(
            `Component container #${elementId} was not found.`
        );

        return;

    }


    try {

        /* ============================
           LOAD HTML
        ============================ */

        const htmlUrl =
            resolveSitePath(componentPath);


        const response =
            await fetch(htmlUrl);


        if (!response.ok) {

            throw new Error(
                `Failed to load ${htmlUrl}`
            );

        }


        const html =
            await response.text();


        element.innerHTML = html;


        /* ============================
           LOAD CSS
        ============================ */

        if (cssPath) {

            loadStylesheet(cssPath);

        }


        /* ============================
           RESOLVE ROUTES
        ============================ */

        resolveRoutes(element);


        /* ============================
           LOAD JAVASCRIPT
        ============================ */

        if (jsPath) {

            await loadScript(jsPath);

        }


    } catch (error) {

        console.error(
            `Component loading error for #${elementId}:`,
            error
        );

    }

}


/* =================================
   LOAD STYLESHEET
================================= */

function loadStylesheet(path) {

    const url =
        resolveSitePath(path);


    const existing =
        document.querySelector(
            `link[data-component-css="${url}"]`
        );


    if (existing) {

        return;

    }


    const stylesheet =
        document.createElement("link");


    stylesheet.rel = "stylesheet";

    stylesheet.href = url;

    stylesheet.dataset.componentCss = url;


    document.head.appendChild(stylesheet);

}


/* =================================
   LOAD JAVASCRIPT
================================= */

function loadScript(path) {

    return new Promise(
        (resolve, reject) => {

            const url =
                resolveSitePath(path);


            const existing =
                document.querySelector(
                    `script[data-component-js="${url}"]`
                );


            if (existing) {

                resolve();

                return;

            }


            const script =
                document.createElement("script");


            script.src = url;

            script.dataset.componentJs = url;


            script.onload = () => {

                resolve();

            };


            script.onerror = () => {

                reject(
                    new Error(
                        `Failed to load ${url}`
                    )
                );

            };


            document.body.appendChild(script);

        }
    );

}


/* =================================
   LOAD FAQ
================================= */

async function loadFAQ() {

    try {

        await loadScript(
            "data/faq.js"
        );


        await loadComponent(
            "faq",
            "components/faq/faq.html",
            "components/faq/faq.css",
            "components/faq/faq.js"
        );


    } catch (error) {

        console.error(
            "FAQ loading error:",
            error
        );

    }

}


/* =================================
   GLOBAL COMPONENTS
   ---------------------------------
   These are safe to load on
   every page.
================================= */

async function initializeGlobalComponents() {

    await Promise.all([

        /* NAVBAR */

        loadComponent(
            "navbar",
            "components/navbar/navbar.html",
            "components/navbar/navbar.css",
            "components/navbar/navbar.js"
        ),


        /* FOOTER */

        loadComponent(
            "footer",
            "components/footer/footer.html",
            "components/footer/footer.css",
            "components/footer/footer.js"
        )

    ]);


    resolveRoutes(document);

}


/* =================================
   HOMEPAGE COMPONENTS
================================= */

async function initializeHomepageComponents() {

    await Promise.all([

        /* HERO */

        loadComponent(
            "hero",
            "components/hero/hero.html",
            "components/hero/hero.css",
            "components/hero/hero.js"
        ),


        /* PROBLEM */

        loadComponent(
            "problem",
            "components/problem/problem.html",
            "components/problem/problem.css"
        ),


        /* LEAKS */

        loadComponent(
            "leaks",
            "components/leaks/leaks.html",
            "components/leaks/leaks.css"
        ),


        /* PROCESS */

        loadComponent(
            "process",
            "components/process/process.html",
            "components/process/process.css"
        ),


        /* SERVICES */

        loadComponent(
            "services",
            "components/services/services.html",
            "components/services/services.css"
        ),


        /* PROOF */

        loadComponent(
            "proof",
            "components/proof/proof.html",
            "components/proof/proof.css"
        ),


        /* TESTIMONIALS */

        loadComponent(
            "testimonials",
            "components/testimonials/testimonials.html",
            "components/testimonials/testimonials.css"
        ),


        /* FAQ */

        loadFAQ(),


        /* CTA */

        loadComponent(
            "cta",
            "components/cta/cta.html",
            "components/cta/cta.css"
        )

    ]);

}


/* =================================
   INITIALIZE
================================= */

async function initializeComponents() {

    /*
       Global components first.
       These belong everywhere.
    */

    await initializeGlobalComponents();


    /*
       Only load homepage sections
       when this is actually the homepage.
    */

    const isHomepage =
        document.body.dataset.page === "home";


    if (isHomepage) {

        await initializeHomepageComponents();

    }

}


/* =================================
   START
================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeComponents
    );

} else {

    initializeComponents();

}