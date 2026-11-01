/* =========================================================
   ADMIN CONTROL SYSTEM
   APPLICATION ENTRY POINT
   ========================================================= */

import {
    startSystemClock
} from "./core/clock.js";

import {
    initNavigation,
    configureNavigation,
    switchView,
    closeSidebar
} from "./core/navigation.js";

import {
    initLogin
} from "./auth/login.js";

import {
    configureSession,
    restoreSession,
    logout,
    handleExpiredSession
} from "./auth/session.js";

import {
    initClients,
    configureClients,
    loadClients
} from "./views/clients.js";

import {
    initReviews,
    loadReviews
} from "./views/reviews.js";

import {
    initNotifications,
    configureNotifications,
    loadNotifications,
    updateNotificationSummary
} from "./views/notifications.js";

import {
    configureOverview,
    updateStats
} from "./views/overview.js";

import {
    initConversation,
    configureConversation,
    openConversation,
    stopConversationPolling,
    closeConversationContextPanel,
    showMessageError,
    hideMessageError
} from "./views/conversation.js";

import {
    initFiles,
    configureFiles
} from "./components/files.js";
import {
    initAnalytics,
    loadAnalytics
} from "./views/analytics.js";

import { initOutreach, loadOutreach } from "./views/outreach.js";



/* =========================================================
   DASHBOARD
   ========================================================= */

export async function loadDashboard() {

    await Promise.all([
        loadClients(),
        loadNotifications()
    ]);

    updateStats();

}


export function showDashboard() {

    const loginScreen =
        document.getElementById(
            "admin-login"
        );

    const dashboard =
        document.getElementById(
            "admin-dashboard"
        );

    if (loginScreen) {
        loginScreen.hidden = true;
    }

    if (dashboard) {
        dashboard.hidden = false;
    }

    switchView(
        "overview"
    );

    loadDashboard();

}


/* =========================================================
   MODULE CONNECTIONS
   ========================================================= */

configureNavigation({

    stopConversationPolling,

    loadClients,

    loadReviews,

    loadNotifications,

    loadAnalytics,

    loadOutreach

});


configureClients({

    openConversation,

    updateStats

});


configureNotifications({

    updateStats,

    switchView

});


configureOverview({

    updateNotificationSummary

});


configureConversation({

    switchView,

    closeSidebar,

    loadNotifications,

    loadAnalytics,

    loadOutreach

});


configureFiles({

    showMessageError,

    hideMessageError,

    onExpiredSession:
        handleExpiredSession

});


configureSession({

    stopConversationPolling,

    closeSidebar,

    closeConversationContextPanel,

    showDashboard

});


/* =========================================================
   INITIALIZE FEATURES
   ========================================================= */

initNavigation();

initClients();

initReviews();

initNotifications();

initAnalytics();

initOutreach();

initConversation();

initFiles();

startSystemClock();


/* =========================================================
   LOGIN
   ========================================================= */

initLogin({

    onLoginSuccess:
        showDashboard

});


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutButton =
    document.getElementById(
        "admin-logout"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }

        closeSidebar();
        closeConversationContextPanel();

    }
);


/* =========================================================
   INITIAL UI
   ========================================================= */

updateNotificationSummary();


/* =========================================================
   RESTORE EXISTING SESSION
   ========================================================= */

restoreSession();