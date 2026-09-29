let stopConversationPollingHandler = null;

let loadClientsHandler = null;

let loadReviewsHandler = null;

let loadNotificationsHandler = null;


export function configureNavigation({
    stopConversationPolling,
    loadClients,
    loadReviews,
    loadNotifications
} = {}) {

    stopConversationPollingHandler =
        stopConversationPolling || null;

    loadClientsHandler =
        loadClients || null;

    loadReviewsHandler =
        loadReviews || null;

    loadNotificationsHandler =
        loadNotifications || null;

}


export function openSidebar() {

    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebar-overlay"
        );

    if (!sidebar) {
        return;
    }

    sidebar.classList.add(
        "is-open"
    );

    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

    }

}


export function closeSidebar() {

    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebar-overlay"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "is-open"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

}


export function switchView(view) {

    if (
        view !==
        "conversation"
    ) {

        stopConversationPollingHandler?.();

    }

    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.view === view
            );

        });


    document
        .querySelectorAll(
            ".admin-view"
        )
        .forEach(section => {

            section.hidden = true;

            section.classList.remove(
                "active-view"
            );

        });


    const target =
        document.getElementById(
            `view-${view}`
        );

    if (!target) {
        return;
    }

    target.hidden =
        false;

    target.classList.add(
        "active-view"
    );


    const titles = {

        overview:
            "Overview",

        clients:
            "Clients",

        reviews:
            "Reviews",

        analytics:
            "Analytics",

        conversation:
            "Conversation",

        notifications:
            "Notifications"

    };


    const pageTitle =
        document.getElementById(
            "page-title"
        );

    if (pageTitle) {

        pageTitle.textContent =
            titles[view] ||
            "Dashboard";

    }


    if (
        view ===
        "clients"
    ) {

        loadClientsHandler?.();

    }


    if (
        view ===
        "reviews"
    ) {

        loadReviewsHandler?.();

    }


    if (
        view ===
        "notifications"
    ) {

        loadNotificationsHandler?.();

    }

}


export function initNavigation() {

    document
        .querySelectorAll(
            "[data-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    switchView(
                        button.dataset.view
                    );

                    closeSidebar();

                }
            );

        });


    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );

    const sidebarToggle =
        document.getElementById(
            "sidebar-toggle"
        );

    const sidebarOverlay =
        document.getElementById(
            "sidebar-overlay"
        );


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            () => {

                if (
                    sidebar?.classList.contains(
                        "is-open"
                    )
                ) {

                    closeSidebar();

                } else {

                    openSidebar();

                }

            }
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }

}