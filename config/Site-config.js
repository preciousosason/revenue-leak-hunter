const SITE_CONFIG = {

    name: "Precious",

    title: "Conversion Leak Hunter",

    tagline:
        "Find the leaks. Fix the journey. Improve the conversion.",

    description:
        "I help businesses uncover hidden conversion leaks, funnel friction, weak messaging, and customer journey problems that quietly kill growth.",

    email: "",

    linkedin: "",


    /* =================================
       ROUTES
    ================================= */

    routes: {

        home: "index.html",

        about: "pages/about/about.html",

        services: "pages/services/services.html",

        portfolio: "pages/portfolio/portfolio.html",

        blog: "pages/blog/blog.html",

        reviews: "pages/reviews/reviews.html",

        contact: "pages/contact/contact.html",

        audit: "pages/contact/contact.html"

    },


    /* =================================
       NAVIGATION
    ================================= */

    navigation: [

        {
            label: "Home",
            route: "home"
        },

        {
            label: "How It Works",
            href: "index.html#process",
            homepageOnly: true
        },

        {
    label: "Reviews",
    route: "reviews"
},

        {
            label: "Services",
            href: "index.html#services",
            homepageOnly: true
        },

        {
            label: "Case Studies",
            route: "portfolio"
        },

        {
            label: "About",
            route: "about"
        },

        {
            label: "Blog",
            route: "blog"
        },

        {
            label: "Contact",
            route: "contact"
        }

    ],


    /* =================================
       PRIMARY CTA
    ================================= */

    primaryCTA: {

        label: "Start a Leak Hunt",

        route: "audit"

    }

};