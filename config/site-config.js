
const SITE_CONFIG = {
    name: "Leakendia",

    title: "Conversion Leak Intelligence",

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
        home: "/",

        about: "/pages/about/about",

        services: "/pages/services/services",

        portfolio: "/pages/portfolio/portfolio",

        blog: "/pages/blog/blog",

        reviews: "/pages/reviews/reviews",

        contact: "/pages/contact/contact",

        audit: "/pages/contact/contact"
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
            href: "/#process",
            homepageOnly: true
        },

        {
            label: "Reviews",
            route: "reviews"
        },

        {
            label: "Services",
            href: "/#services",
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
        label: "Begin Investigation",
        route: "audit"
    }
};
