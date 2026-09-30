import {
    api
} from "../core/api.js";

import state, {
    setNotifications
} from "../core/state.js";

import {
    escapeHTML,
    formatRelativeTime
} from "../core/utils.js";


let updateStatsHandler = null;
let switchViewHandler = null;


export function configureNotifications({
    updateStats,
    switchView
} = {}) {

    updateStatsHandler =
        updateStats || null;

    switchViewHandler =
        switchView || null;

}


export function isNotificationUnread(
    notification
) {

    const value =
        notification?.read;

    if (
        value === true ||
        value === "true"
    ) {
        return false;
    }

    return (
        Number(value) === 0 ||
        value === null ||
        value === undefined
    );

}


export function getNotificationCategory(
    notification
) {

    const raw =
        String(
            notification?.type ||
            notification?.category ||
            ""
        ).toLowerCase();

    if (
        raw.includes("message")
    ) {
        return "messages";
    }

    if (
        raw.includes("client")
    ) {
        return "clients";
    }

    return "activity";

}


export function getNotificationSeverity(
    notification
) {

    const raw =
        String(
            notification?.severity ||
            notification?.level ||
            notification?.type ||
            notification?.category ||
            ""
        ).toLowerCase();

    if (
        raw.includes("critical") ||
        raw.includes("error") ||
        raw.includes("danger")
    ) {
        return "critical";
    }

    if (
        raw.includes("warning") ||
        raw.includes("warn")
    ) {
        return "warning";
    }

    if (
        raw.includes("success") ||
        raw.includes("complete") ||
        raw.includes("resolved")
    ) {
        return "success";
    }

    return "info";

}


function getNotificationTypeLabel(
    severity
) {

    const labels = {
        info: "INFO",
        success: "OK",
        warning: "WARN",
        critical: "CRITICAL"
    };

    return (
        labels[severity] ||
        "INFO"
    );

}


export function getFilteredNotifications() {

    if (
        state.activeNotificationFilter ===
        "all"
    ) {
        return state.notifications;
    }

    return state.notifications.filter(
        notification => {

            if (
                state.activeNotificationFilter ===
                "unread"
            ) {

                return isNotificationUnread(
                    notification
                );

            }

            return (
                getNotificationCategory(
                    notification
                ) ===
                state.activeNotificationFilter
            );

        }
    );

}


function notificationHTML(
    notification,
    compact = false
) {

    const unread =
        isNotificationUnread(
            notification
        );

    const category =
        getNotificationCategory(
            notification
        );

    const severity =
        getNotificationSeverity(
            notification
        );

    const title =
        notification.title ||
        "System Notification";

    const description =
        notification.message ||
        notification.description ||
        "";

    const source =
        notification.source ||
        (
            category === "messages"
                ? "CLIENT COMMUNICATION"
                : category === "clients"
                    ? "CLIENT DATABASE"
                    : "SYSTEM"
        );

    return `
        <article
            class="
                notification-row
                ${unread ? "unread" : ""}
                ${severity}
            "
            data-category="${escapeHTML(category)}"
            data-severity="${escapeHTML(severity)}"
        >

            <div class="notification-type ${severity}">
                ${escapeHTML(
                    getNotificationTypeLabel(
                        severity
                    )
                )}
            </div>

            <div class="notification-content">

                <strong class="notification-title">
                    ${escapeHTML(title)}
                </strong>

                <p class="notification-description">
                    ${escapeHTML(description)}
                </p>

                <span class="notification-source">
                    ${escapeHTML(source)}
                </span>

            </div>

            <time class="notification-time">
                ${escapeHTML(
                    formatRelativeTime(
                        notification.created_at
                    )
                )}
            </time>

            <div class="notification-action">

                ${
                    !compact && unread
                        ? `
                            <button
                                class="notification-read-button"
                                data-notification="${escapeHTML(
                                    notification.id || ""
                                )}"
                                type="button"
                            >
                                MARK READ
                            </button>
                        `
                        : unread
                            ? `
                                <span class="notification-new">
                                    NEW
                                </span>
                            `
                            : ""
                }

            </div>

        </article>
    `;

}


export function renderNotifications() {

    const notificationsList =
        document.getElementById(
            "notifications-list"
        );

    if (!notificationsList) {
        return;
    }

    const filtered =
        getFilteredNotifications();

    if (!filtered.length) {

        notificationsList.innerHTML = `
            <div class="notifications-empty">

                <div class="notifications-empty-mark">
                    ◌
                </div>

                <strong class="notifications-empty-title">
                    NO SIGNALS
                </strong>

                <p class="notifications-empty-description">
                    There are no notifications matching this filter.
                </p>

            </div>
        `;

        updateNotificationSummary();

        return;

    }

    notificationsList.innerHTML =
        filtered
            .map(
                notification =>
                    notificationHTML(
                        notification
                    )
            )
            .join("");

}


export function renderRecentNotifications() {

    const recentNotifications =
        document.getElementById(
            "recent-notifications"
        );

    if (!recentNotifications) {
        return;
    }

    if (!state.notifications.length) {

        recentNotifications.innerHTML = `
            <div class="empty-state compact-empty">

                <strong class="empty-state-title">
                    No notifications
                </strong>

                <p class="empty-state-description">
                    No new system signals.
                </p>

            </div>
        `;

        return;

    }

    recentNotifications.innerHTML =
        state.notifications
            .slice(0, 5)
            .map(
                notification =>
                    notificationHTML(
                        notification,
                        true
                    )
            )
            .join("");

}


export function updateNotificationSummary() {

    const total =
        state.notifications.length;

    const unread =
        state.notifications.filter(
            notification =>
                isNotificationUnread(
                    notification
                )
        ).length;

    const critical =
        state.notifications.filter(
            notification =>
                getNotificationSeverity(
                    notification
                ) === "critical"
        ).length;


    const notificationsTotal =
        document.getElementById(
            "notifications-total"
        );

    const notificationsUnread =
        document.getElementById(
            "notifications-unread"
        );

    const notificationsCritical =
        document.getElementById(
            "notifications-critical"
        );

    const notificationsFooterCount =
        document.getElementById(
            "notifications-footer-count"
        );


    if (notificationsTotal) {
        notificationsTotal.textContent =
            total;
    }

    if (notificationsUnread) {
        notificationsUnread.textContent =
            unread;
    }

    if (notificationsCritical) {
        notificationsCritical.textContent =
            critical;
    }

    if (notificationsFooterCount) {

        const visible =
            getFilteredNotifications()
                .length;

        notificationsFooterCount.textContent =
            `${visible} SIGNAL${
                visible === 1
                    ? ""
                    : "S"
            }`;

    }

}


export async function loadNotifications() {

    const notificationsList =
        document.getElementById(
            "notifications-list"
        );

    const recentNotifications =
        document.getElementById(
            "recent-notifications"
        );

    try {

        const data =
            await api(
                "/api/admin/notifications"
            );

        setNotifications(
            Array.isArray(
                data.notifications
            )
                ? data.notifications
                : []
        );

        renderNotifications();

        renderRecentNotifications();

        updateNotificationSummary();

        updateStatsHandler?.();

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

        if (notificationsList) {

            notificationsList.innerHTML = `
                <div class="notifications-empty">

                    <div class="notifications-empty-mark">
                        !
                    </div>

                    <strong class="notifications-empty-title">
                        SIGNAL FEED UNAVAILABLE
                    </strong>

                    <p class="notifications-empty-description">
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>
            `;

        }

        if (recentNotifications) {

            recentNotifications.innerHTML = `
                <div class="empty-state error-state">
                    ${escapeHTML(
                        error.message
                    )}
                </div>
            `;

        }

    }

}


export function initNotifications() {

    const notificationsList =
        document.getElementById(
            "notifications-list"
        );


    if (notificationsList) {

        notificationsList.addEventListener(
            "click",
            async event => {

                const button =
                    event.target.closest(
                        ".notification-read-button"
                    );

                if (!button) {
                    return;
                }

                const notificationId =
                    button.dataset.notification;

                if (!notificationId) {
                    return;
                }

                button.disabled = true;

                const originalText =
                    button.textContent;

                button.textContent =
                    "UPDATING...";

                try {

                    await api(
                        "/api/admin/notifications/read",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    notificationId
                                })
                        }
                    );

                    await loadNotifications();

                } catch (error) {

                    console.error(
                        "Notification read error:",
                        error
                    );

                    button.disabled = false;

                    button.textContent =
                        originalText;

                }

            }
        );

    }


    document
        .querySelectorAll(
            ".notification-filter"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.activeNotificationFilter =
                        button.dataset.filter ||
                        "all";

                    document
                        .querySelectorAll(
                            ".notification-filter"
                        )
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });

                    renderNotifications();

                }
            );

        });


    const notificationTrigger =
        document.getElementById(
            "notification-trigger"
        );

    if (notificationTrigger) {

        notificationTrigger.addEventListener(
            "click",
            () => {

                switchViewHandler?.(
                    "notifications"
                );

            }
        );

    }


    const refreshNotifications =
        document.getElementById(
            "refresh-notifications"
        );

    if (refreshNotifications) {

        refreshNotifications.addEventListener(
            "click",
            async () => {

                refreshNotifications.disabled =
                    true;

                try {

                    await loadNotifications();

                } finally {

                    refreshNotifications.disabled =
                        false;

                }

            }
        );

    }

}