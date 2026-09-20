/* =========================================================
   SERVICES PAGE
========================================================= */


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initServicesPage() {

    /*
     * Resolve project routes if the global
     * routing system is available.
     */

    if (
        typeof resolveRoutes === "function"
    ) {

        resolveRoutes(document);

    }


    /*
     * -----------------------------------------------------
     * SERVICE CARD REVEAL
     * -----------------------------------------------------
     */

    const revealElements =
        document.querySelectorAll(
            ".service-card, .method-card, .fit-item"
        );


    if (!revealElements.length) {

        return;

    }


    /*
     * Respect reduced-motion preferences.
     */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (prefersReducedMotion) {

        revealElements.forEach(element => {

            element.classList.add(
                "is-visible"
            );

        });

    } else {

        /*
         * Add staggered reveal delays.
         */

        revealElements.forEach(
            (element, index) => {

                element.style.transitionDelay =
                    `${Math.min(index * 60, 360)}ms`;

            }
        );


        /*
         * Reveal elements when they
         * enter the viewport.
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
                    threshold: 0.12,
                    rootMargin: "0px 0px -40px 0px"
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


    /*
     * -----------------------------------------------------
     * SERVICE CARD INTERACTION
     * -----------------------------------------------------
     *
     * Adds a small pointer-aware effect without
     * changing the actual card layout.
     */

    const serviceCards =
        document.querySelectorAll(
            ".service-card"
        );


    serviceCards.forEach(card => {

        card.addEventListener(
            "pointermove",
            event => {

                if (
                    window.matchMedia(
                        "(hover: none)"
                    ).matches
                ) {

                    return;

                }


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const rotateX =
                    ((y / rect.height) - 0.5) * -2;


                const rotateY =
                    ((x / rect.width) - 0.5) * 2;


                card.style.transform =
                    `translateY(-7px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            }
        );


        card.addEventListener(
            "pointerleave",
            () => {

                card.style.transform =
                    "";

            }
        );

    });


    /*
     * -----------------------------------------------------
     * KEYBOARD ACCESSIBILITY
     * -----------------------------------------------------
     *
     * Because the entire card is now an anchor,
     * keyboard users can navigate naturally.
     */

    serviceCards.forEach(card => {

        card.addEventListener(
            "focus",
            () => {

                card.classList.add(
                    "is-focused"
                );

            }
        );


        card.addEventListener(
            "blur",
            () => {

                card.classList.remove(
                    "is-focused"
                );

            }
        );

    });


    /*
     * -----------------------------------------------------
     * SCANNER STAGE INTERACTION
     * -----------------------------------------------------
     *
     * Gives the hero scanner a subtle active-state
     * sequence rather than leaving it completely static.
     */

    const funnelStages =
        document.querySelectorAll(
            ".funnel-stage"
        );


    if (
        funnelStages.length &&
        !prefersReducedMotion
    ) {

        let activeStage = 0;


        const activateStage = () => {

            funnelStages.forEach(
                stage => {

                    stage.classList.remove(
                        "scanner-active"
                    );

                }
            );


            if (
                funnelStages[activeStage]
            ) {

                funnelStages[activeStage]
                    .classList.add(
                        "scanner-active"
                    );

            }


            activeStage =
                (activeStage + 1) %
                funnelStages.length;

        };


        activateStage();


        setInterval(
            activateStage,
            2200
        );

    }


    /*
     * -----------------------------------------------------
     * SERVICE CARD CLICK FEEDBACK
     * -----------------------------------------------------
     *
     * Adds a short pressed state before navigation.
     */

    serviceCards.forEach(card => {

        card.addEventListener(
            "pointerdown",
            () => {

                card.classList.add(
                    "is-pressed"
                );

            }
        );


        card.addEventListener(
            "pointerup",
            () => {

                card.classList.remove(
                    "is-pressed"
                );

            }
        );


        card.addEventListener(
            "pointercancel",
            () => {

                card.classList.remove(
                    "is-pressed"
                );

            }
        );

    });

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

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

/* =================================
   LEAK AUDIT NOTIFICATION
================================= */

document.addEventListener("DOMContentLoaded", () => {

    const notification =
        document.getElementById("auditNotification");

    const actionButton =
        document.getElementById("auditNotificationAction");

    const closeButton =
        document.getElementById("auditNotificationClose");

    const auditSection =
        document.getElementById("leak-audit");


    /* =================================
       SAFETY CHECK
    ================================= */

    if (!notification || !auditSection) {
        return;
    }


    /* =================================
       SHOW AFTER 10 SECONDS
    ================================= */

    const showTimer = setTimeout(() => {

        notification.classList.add("is-visible");

        notification.setAttribute(
            "aria-hidden",
            "false"
        );

    }, 10000);


    /* =================================
       GO TO LEAK AUDIT
    ================================= */

    if (actionButton) {

        actionButton.addEventListener("click", () => {

            auditSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            notification.classList.remove(
                "is-visible"
            );

            notification.setAttribute(
                "aria-hidden",
                "true"
            );

        });

    }


    /* =================================
       CLOSE NOTIFICATION
    ================================= */

    if (closeButton) {

        closeButton.addEventListener("click", () => {

            clearTimeout(showTimer);

            notification.classList.remove(
                "is-visible"
            );

            notification.setAttribute(
                "aria-hidden",
                "true"
            );

        });

    }

});