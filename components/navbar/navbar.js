/* =================================
   NAVBAR
================================= */

function initializeNavbar() {

    const navbar = document.querySelector(".site-navbar");

    if (!navbar) {
        return;
    }


    const menuToggle =
        navbar.querySelector(".navbar-menu-toggle");

    const mobileLinks =
        navbar.querySelectorAll(".mobile-nav-link");


    if (!menuToggle) {
        return;
    }


    /* ================================
       TOGGLE MOBILE MENU
    ================================= */

    menuToggle.addEventListener("click", () => {

        const isOpen =
            navbar.classList.toggle("menu-open");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );

    });


    /* ================================
       CLOSE AFTER CLICK
    ================================= */

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navbar.classList.remove("menu-open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

        });

    });


    /* ================================
       CLOSE WHEN RESIZING
    ================================= */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 850) {

            navbar.classList.remove("menu-open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


/* =================================
   INITIALIZE
================================= */

initializeNavbar();