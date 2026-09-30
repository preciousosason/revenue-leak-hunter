import state from "../core/state.js";

import {
    isNotificationUnread
} from "./notifications.js";


let notificationSummaryHandler = null;


export function configureOverview({
    updateNotificationSummary
} = {}) {

    notificationSummaryHandler =
        updateNotificationSummary || null;

}


export function updateStats() {

    const totalClients =
        state.clients.length;

    const totalConversations =
        state.clients.filter(
            client =>
                client.conversation_id
        ).length;

    const totalMessages =
        state.clients.reduce(
            (
                total,
                client
            ) =>
                total +
                Number(
                    client.message_count ||
                    0
                ),
            0
        );

    const unread =
        state.notifications.filter(
            notification =>
                isNotificationUnread(
                    notification
                )
        ).length;


    const statClients =
        document.getElementById(
            "stat-clients"
        );

    const statConversations =
        document.getElementById(
            "stat-conversations"
        );

    const statMessages =
        document.getElementById(
            "stat-messages"
        );

    const statUnread =
        document.getElementById(
            "stat-unread"
        );

    const notificationCount =
        document.getElementById(
            "notification-count"
        );

    const headerNotificationCount =
        document.getElementById(
            "header-notification-count"
        );


    if (statClients) {
        statClients.textContent =
            totalClients;
    }

    if (statConversations) {
        statConversations.textContent =
            totalConversations;
    }

    if (statMessages) {
        statMessages.textContent =
            totalMessages;
    }

    if (statUnread) {
        statUnread.textContent =
            unread;
    }

    if (notificationCount) {

        notificationCount.textContent =
            unread;

        notificationCount.hidden =
            unread === 0;

    }

    if (headerNotificationCount) {

        headerNotificationCount.textContent =
            unread;

        headerNotificationCount.hidden =
            unread === 0;

    }

    notificationSummaryHandler?.();

}