import {
    API_URL,
    SESSION_KEY
} from "../core/config.js";

import {
    getAdminSession,
    setAdminSession
} from "../core/state.js";

import {
    api,
    setExpiredSessionHandler
} from "../core/api.js";


let stopConversationPollingHandler = null;

let closeSidebarHandler = null;

let closeConversationContextHandler = null;

let showDashboardHandler = null;


export function configureSession({
    stopConversationPolling,
    closeSidebar,
    closeConversationContextPanel,
    showDashboard
} = {}) {

    stopConversationPollingHandler =
        stopConversationPolling || null;

    closeSidebarHandler =
        closeSidebar || null;

    closeConversationContextHandler =
        closeConversationContextPanel || null;

    showDashboardHandler =
        showDashboard || null;

}


export function handleExpiredSession() {

    stopConversationPollingHandler?.();

    setAdminSession(
        null
    );

    sessionStorage.removeItem(
        SESSION_KEY
    );

    const dashboard =
        document.getElementById(
            "admin-dashboard"
        );

    const loginScreen =
        document.getElementById(
            "admin-login"
        );

    if (dashboard) {
        dashboard.hidden = true;
    }

    if (loginScreen) {
        loginScreen.hidden = false;
    }

    closeSidebarHandler?.();

    closeConversationContextHandler?.();

}


setExpiredSessionHandler(
    handleExpiredSession
);


export function logoutLocal() {

    handleExpiredSession();

}


export async function logout() {

    stopConversationPollingHandler?.();

    const session =
        getAdminSession();

    try {

        if (session) {

            await fetch(
                `${API_URL}/api/admin/logout`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${session}`
                    }
                }
            );

        }

    } catch {
        // Local logout still happens.
    }

    logoutLocal();

}


export async function restoreSession() {

    const stored =
        sessionStorage.getItem(
            SESSION_KEY
        );

    if (!stored) {
        return false;
    }

    setAdminSession(
        stored
    );

    try {

        await api(
            "/api/admin/me"
        );

        showDashboardHandler?.();

        return true;

    } catch (error) {

        console.warn(
            "Stored admin session could not be restored:",
            error
        );

        logoutLocal();

        return false;

    }

}