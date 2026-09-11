/* =================================
   SERVICES PAGE
================================= */


/* =================================
   INITIALIZE PAGE
================================= */

function initServicesPage() {

    /*
     * Resolve any links that were added
     * directly inside this page.
     */

    if (
        typeof resolveRoutes === "function"
    ) {

        resolveRoutes(document);

    }


    /*
     * Add subtle reveal animation
     * to service cards and process cards.
     */

    const revealElements =
        document.querySelectorAll(
            ".service-card, .method-card, .fit-item"
        );


    if (!revealElements.length) {

        return;

    }


    /*
     * Respect users who prefer
     * reduced motion.
     */

    if (
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        revealElements.forEach(element => {

            element.classList.add(
                "is-visible"
            );

        });

        return;

    }


    /*
     * Intersection Observer lets the
     * elements reveal themselves as
     * they enter the viewport.
     */

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        !entry.isIntersecting
                    ) {

                        return;

                    }


                    entry.target.classList.add(
                        "is-visible"
                    );


                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(
        (element, index) => {

            element.style.transitionDelay =
                `${Math.min(index * 60, 300)}ms`;


            observer.observe(element);

        }
    );

}


/* =================================
   PAGE INITIALIZATION
================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initServicesPage
    );

} else {

    initServicesPage();

}