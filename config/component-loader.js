/* =================================
   GLOBAL COMPONENT LOADER
================================= */


/* =================================
   SITE ROOT
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
   ROUTE BUILDER
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
   LOAD STYLESHEET
================================= */

function loadStylesheet(path) {

    if (!path) {
        return;
    }


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

    if (!path) {
        return Promise.resolve();
    }


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
   LOAD COMPONENT
================================= */

async function loadComponent({
    id,
    html,
    css = null,
    js = null
}) {

    const element =
        document.getElementById(id);


    /*
       If the page doesn't contain
       this component, simply skip it.
    */

    if (!element) {
        return;
    }


    try {

        /* ============================
           LOAD HTML
        ============================ */

        const htmlUrl =
            resolveSitePath(html);


        const response =
            await fetch(htmlUrl);


        if (!response.ok) {

            throw new Error(
                `Failed to load ${htmlUrl}`
            );

        }


        const markup =
            await response.text();


        element.innerHTML = markup;


        /* ============================
           LOAD CSS
        ============================ */

        if (css) {

            loadStylesheet(css);

        }


        /* ============================
           RESOLVE ROUTES
        ============================ */

        resolveRoutes(element);


        /* ============================
           LOAD JAVASCRIPT
        ============================ */

        if (js) {

            await loadScript(js);

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

        html: "components/navbar/navbar.html",

        css: "components/navbar/navbar.css",

        js: "components/navbar/navbar.js"
    },


    {
        id: "footer",

        html: "components/footer/footer.html",

        css: "components/footer/footer.css",

        js: "components/footer/footer.js"
    },


    {
        id: "investigation-room",

        html: "components/investigation-room/investigation-room.html",

        css: "components/investigation-room/investigation-room.css"
    }

];


/* =================================
   HOMEPAGE COMPONENTS
================================= */

const HOMEPAGE_COMPONENTS = [

    {
        id: "hero",

        html: "components/hero/hero.html",

        css: "components/hero/hero.css",

        js: "components/hero/hero.js"
    },


    {
        id: "problem",

        html: "components/problem/problem.html",

        css: "components/problem/problem.css"
    },


    {
        id: "leaks",

        html: "components/leaks/leaks.html",

        css: "components/leaks/leaks.css"
    },


    {
        id: "process",

        html: "components/process/process.html",

        css: "components/process/process.css"
    },


    {
        id: "services",

        html: "components/services/services.html",

        css: "components/services/services.css"
    },


    {
        id: "proof",

        html: "components/proof/proof.html",

        css: "components/proof/proof.css"
    },


    {
        id: "testimonials",

        html: "components/testimonials/testimonials.html",

        css: "components/testimonials/testimonials.css",

        js: "components/testimonials/testimonials.js"
    },


    {
        id: "faq",

        html: "components/faq/faq.html",

        css: "components/faq/faq.css",

        js: "components/faq/faq.js"
    },


    {
        id: "cta",

        html: "components/cta/cta.html",

        css: "components/cta/cta.css"
    }

];


/* =================================
   SERVICES PAGE COMPONENTS
================================= */

const SERVICES_COMPONENTS = [

    {
        id: "servicesHero",

        html: "components/services-page/hero.html",

        css: "components/services-page/hero.css",

        js: "components/services-page/hero.js"
    },


    {
        id: "servicesIntro",

        html: "components/services-page/intro.html",

        css: "components/services-page/intro.css"
    },


    {
        id: "servicesList",

        html: "components/services-page/services.html",

        css: "components/services-page/services.css"
    },


    {
        id: "serviceProcess",

        html: "components/services-page/process.html",

        css: "components/services-page/process.css"
    },


    {
        id: "serviceFit",

        html: "components/services-page/fit.html",

        css: "components/services-page/fit.css"
    },


    {
        id: "servicesCTA",

        html: "components/services-page/cta.html",

        css: "components/services-page/cta.css"
    }

];


/* =================================
   SERVICE DETAIL COMPONENTS
================================= */

const SERVICE_DETAIL_COMPONENTS = [

    {
        id: "serviceHero",

        html: "components/service-detail/hero.html",

        css: "components/service-detail/hero.css",

        js: "components/service-detail/hero.js"
    },


    {
        id: "serviceContent",

        html: "components/service-detail/content.html",

        css: "components/service-detail/content.css"
    },


    {
        id: "serviceProcess",

        html: "components/service-detail/process.html",

        css: "components/service-detail/process.css"
    },


    {
        id: "serviceProof",

        html: "components/service-detail/proof.html",

        css: "components/service-detail/proof.css"
    },


    {
        id: "serviceCTA",

        html: "components/service-detail/cta.html",

        css: "components/service-detail/cta.css"
    }

];


/* =================================
   PAGE COMPONENT MAP
================================= */

const PAGE_COMPONENTS = {

    home: HOMEPAGE_COMPONENTS,

    services: SERVICES_COMPONENTS,

    "service-detail":
        SERVICE_DETAIL_COMPONENTS

};


/* =================================
   LOAD COMPONENT GROUP
================================= */

async function loadComponentGroup(components) {

    if (!components || !components.length) {
        return;
    }


    await Promise.all(
        components.map(component =>
            loadComponent(component)
        )
    );

}


/* =================================
   CREATE GLOBAL MOUNTS
================================= */

function createGlobalComponentMounts() {

    /*
       Investigation Room is a global
       component, so create its mount
       automatically on every page.
    */

    if (
        !document.getElementById(
            "investigation-room"
        )
    ) {

        const investigationRoom =
            document.createElement("div");


        investigationRoom.id =
            "investigation-room";


        document.body.appendChild(
            investigationRoom
        );

    }

}


/* =================================
   INITIALIZE
================================= */

async function initializeComponents() {

    /*
       Determine the page type.
    */

    const pageType =
        document.body.dataset.page ||
        "home";


    console.log(
        `Initializing page: ${pageType}`
    );


    /* ==============================
       CREATE GLOBAL COMPONENT MOUNTS
    ============================== */

    createGlobalComponentMounts();


    /* ==============================
       GLOBAL COMPONENTS
    ============================== */

    await loadComponentGroup(
        GLOBAL_COMPONENTS
    );


    /* ==============================
       PAGE COMPONENTS
    ============================== */

    const pageComponents =
        PAGE_COMPONENTS[pageType];


    if (!pageComponents) {

        console.warn(
            `No component configuration found for page: "${pageType}"`
        );

    } else {

        await loadComponentGroup(
            pageComponents
        );

    }


    /* ==============================
       FINAL ROUTE RESOLUTION
    ============================== */

    resolveRoutes(document);


    console.log(
        `Page initialized: ${pageType}`
    );

}


/* =================================
   START LOADER
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