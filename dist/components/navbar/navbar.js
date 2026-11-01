/* =================================
   NAVBAR
================================= */

function initializeNavbar() {

    const navbar =
        document.querySelector(
            ".site-navbar"
        );


    if (!navbar) {
        return;
    }


    const menuToggle =
        navbar.querySelector(
            ".navbar-menu-toggle"
        );


    const mobileNavigation =
        navbar.querySelector(
            ".mobile-navigation"
        );


    const mobileLinks =
        navbar.querySelectorAll(
            ".mobile-nav-link, .mobile-nav-cta"
        );


    const logo =
        navbar.querySelector(
            ".navbar-logo"
        );


    if (!menuToggle) {
        return;
    }


    /* ================================
       HELPERS
    ================================= */

    function openMenu() {

        navbar.classList.add(
            "menu-open"
        );


        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );


        if (mobileNavigation) {

            mobileNavigation.setAttribute(
                "aria-hidden",
                "false"
            );

        }

    }


    function closeMenu() {

        navbar.classList.remove(
            "menu-open"
        );


        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        if (mobileNavigation) {

            mobileNavigation.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    }


    function toggleMenu() {

        const isOpen =
            navbar.classList.contains(
                "menu-open"
            );


        if (isOpen) {

            closeMenu();

        } else {

            openMenu();

        }

    }


    /* ================================
       INITIAL STATE
    ================================= */

    closeMenu();


    /* ================================
       TOGGLE MOBILE MENU
    ================================= */

    menuToggle.addEventListener(
        "click",
        toggleMenu
    );


    /* ================================
       CLOSE AFTER MOBILE LINK CLICK
    ================================= */

    mobileLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                closeMenu
            );

        }
    );


    /* ================================
       LOGO CLICK
    ================================= */

    if (logo) {

        logo.addEventListener(
            "click",
            () => {

                closeMenu();

            }
        );

    }


    /* ================================
       CLOSE WITH ESCAPE KEY
    ================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                    "Escape" &&
                navbar.classList.contains(
                    "menu-open"
                )
            ) {

                closeMenu();

                menuToggle.focus();

            }

        }
    );


    /* ================================
       CLOSE WHEN RESIZING
    ================================= */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                850
            ) {

                closeMenu();

            }

        }
    );


    /* ================================
       CLOSE WHEN CLICKING OUTSIDE
    ================================= */

    document.addEventListener(
        "click",
        (event) => {

            if (
                !navbar.contains(
                    event.target
                ) &&
                navbar.classList.contains(
                    "menu-open"
                )
            ) {

                closeMenu();

            }

        }
    );

}


/* =================================
   INITIALIZE
================================= */

initializeNavbar();