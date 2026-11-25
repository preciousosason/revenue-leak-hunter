let stopConversationPollingHandler = null;

let loadClientsHandler = null;

let loadReviewsHandler = null;

let loadNotificationsHandler = null;

let loadAnalyticsHandler = null;
let loadOutreachHandler = null;
let loadMarketplaceHandler = null;
let loadPaymentsHandler = null;
let loadProjectsHandler = null;


export function configureNavigation({
    stopConversationPolling,
    loadClients,
    loadReviews,
    loadNotifications,
    loadAnalytics,
    loadOutreach,
    loadMarketplace, loadPayments,loadProjects
} = {}) {

    stopConversationPollingHandler =
        stopConversationPolling || null;

    loadClientsHandler =
        loadClients || null;

    loadReviewsHandler =
        loadReviews || null;

    loadNotificationsHandler =
        loadNotifications || null;

    loadAnalyticsHandler =
        loadAnalytics || null;

    loadOutreachHandler = loadOutreach || null;

    loadMarketplaceHandler =
    loadMarketplace || null;
    loadPaymentsHandler = loadPayments || null;
    loadProjectsHandler = loadProjects || null;

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

        payments: "Payments",
        projects: "Projects",
        overview:
            "Overview",

        clients:
            "Clients",

        reviews:
            "Reviews",

        analytics:
            "Analytics",

        outreach:
            "Outreach",

            marketplace:
    "Marketplace",

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


    if (
        view ===
        "analytics"
    ) {

        loadAnalyticsHandler?.();

    }

    if (view === "outreach") {
        loadOutreachHandler?.();
    }
    
if (view === "payments") loadPaymentsHandler?.();
if (view === "projects") {
    loadProjectsHandler?.();
}
if (view === "marketplace") {
    loadMarketplaceHandler?.();
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