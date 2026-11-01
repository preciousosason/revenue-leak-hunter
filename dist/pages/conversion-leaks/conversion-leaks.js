/* =================================
   CONVERSION LEAKS PAGE
================================= */


/* =================================
   INITIALIZE PAGE
================================= */

function initConversionLeaks() {

    /*
     * Resolve internal routes after
     * the page and components exist.
     */

    if (
        typeof resolveRoutes === "function"
    ) {

        resolveRoutes(document);

    }


    /*
     * Smooth scrolling for internal
     * section links.
     */

    const sectionLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    sectionLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {

                    return;

                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    /*
     * Reveal cards when they enter
     * the viewport.
     */

    const revealElements =
        document.querySelectorAll(
            ".leak-card, .analysis-item, .journey-step"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            element => {

                observer.observe(
                    element
                );

            }
        );

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
        initConversionLeaks
    );

} else {

    initConversionLeaks();

}