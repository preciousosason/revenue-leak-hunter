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


/* ============================================
   GLOBAL CUSTOMER AUTHENTICATION
============================================ */

async function initializeNavbarAuthentication() {

    const navbar = document.querySelector(
        ".site-navbar"
    );

    if (!navbar) {
        return;
    }

    if (navbar.dataset.authInitialized === "true") {
        return;
    }

    const authButtons = navbar.querySelectorAll(
        "[data-auth-action]"
    );

    if (!authButtons.length) {
        return;
    }

    navbar.dataset.authInitialized = "true";


    /* ========================================
       AUTHENTICATION PAGE DETECTION
    ======================================== */

    const currentPage =
        document.body.dataset.page || "";

    const currentPath =
        window.location.pathname
            .replace(/\/+$/, "")
            .toLowerCase();

    const isSignInPage =

        currentPage === "sign-in" ||

        currentPath === "/sign-in" ||

        currentPath ===
            "/pages/sign-in/sign-in.html" ||

        currentPath ===
            "/pages/sign-in/sign-in";


    /* ========================================
       AUTHENTICATION BUTTON RENDERER
    ======================================== */

    function renderAuthButtons(authState, Auth) {

        if (
            !authState.initialized ||
            authState.error
        ) {
            return;
        }

        const authenticated =
            authState.authenticated === true &&
            Boolean(authState.customer);

        const returnPath =

            window.location.pathname +

            window.location.search +

            window.location.hash;

        authButtons.forEach(button => {

            button.removeAttribute("aria-busy");

            if (authenticated) {

                button.textContent =
                    "Private Portal";

                button.href =
                    "/pages/portal/portal.html";

                button.dataset.authState =
                    "authenticated";

                button.setAttribute(
                    "aria-label",
                    "Open your private portal"
                );

                button.hidden = false;

            } else {

                button.textContent =
                    "Sign in";

                button.href =
                    Auth.getSignInURL(returnPath);

                button.dataset.authState =
                    "guest";

                button.setAttribute(
                    "aria-label",
                    "Sign in to your Leakendia account"
                );

                button.hidden = isSignInPage;

            }

        });

        navbar.dataset.customerAuthenticated =
            String(authenticated);

    }


    /* ========================================
       LOAD GLOBAL AUTHENTICATION ENGINE
    ======================================== */

    try {

        const authModule = await import(
            "/global/auth/auth-state.js"
        );

        const Auth = authModule.default;

        if (!Auth) {

            throw new Error(
                "Authentication engine unavailable."
            );

        }


        /* ====================================
           SUBSCRIBE TO SESSION CHANGES
        ==================================== */

        const unsubscribe = Auth.subscribe(

            authState => {

                if (!navbar.isConnected) {

                    unsubscribe();

                    return;

                }

                renderAuthButtons(
                    authState,
                    Auth
                );

            },

            false

        );


        /* ====================================
           INITIAL SESSION CHECK
        ==================================== */

        const authState = await Auth.init();

        if (authState.error) {

            throw authState.error;

        }

        renderAuthButtons(
            authState,
            Auth
        );

    } catch (error) {

        console.warn(

            "[Leakendia Navbar] Authentication unavailable:",

            error?.message || "Unknown error"

        );


        /* ====================================
           GRACEFUL FALLBACK
        ==================================== */

        authButtons.forEach(button => {

            button.textContent = "Sign in";

            button.href =

                "/sign-in?return=" +

                encodeURIComponent(

                    window.location.pathname +

                    window.location.search +

                    window.location.hash

                );

            button.dataset.authState =
                "unavailable";

            button.removeAttribute(
                "aria-busy"
            );

            button.hidden = isSignInPage;

        });

    }

}


/* ============================================
   INITIALIZE GLOBAL AUTHENTICATION
============================================ */

initializeNavbarAuthentication();
