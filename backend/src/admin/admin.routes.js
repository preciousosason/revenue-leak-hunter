import {
    handleAdminLogin,
    handleAdminMe,
    handleAdminLogout
} from "./auth.js";

import {
    handleAdminClients
} from "./clients.js";

import {
    handleAdminConversation
} from "./conversations.js";

import {
    handleAdminSendMessage
} from "./messages.js";

import {
    handleAdminFileUpload,
    handleAdminFileDownload,
    handleAdminFileDelete
} from "./files.js";

import {
    handleAdminNotifications,
    handleAdminMarkNotificationRead
} from "./notifications.js";

import {
    handleAdminReviews,
    handleAdminApproveReview,
    handleAdminRejectReview,
    handleAdminDeleteReview
} from "./reviews.js";

export async function handleAdminRoutes(
    request,
    env
) {
    const url =
        new URL(request.url);

    if (
        url.pathname ===
            "/api/admin/login" &&
        request.method === "POST"
    ) {
        return handleAdminLogin(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/me" &&
        request.method === "GET"
    ) {
        return handleAdminMe(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/logout" &&
        request.method === "POST"
    ) {
        return handleAdminLogout(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/clients" &&
        request.method === "GET"
    ) {
        return handleAdminClients(
            request,
            env
        );
    }

    if (
        url.pathname.startsWith(
            "/api/admin/conversations/"
        ) &&
        request.method === "GET"
    ) {
        const conversationId =
            url.pathname
                .split("/")
                .pop();

        return handleAdminConversation(
            request,
            env,
            conversationId
        );
    }

    if (
        url.pathname ===
            "/api/admin/messages" &&
        request.method === "POST"
    ) {
        return handleAdminSendMessage(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/files" &&
        request.method === "POST"
    ) {
        return handleAdminFileUpload(
            request,
            env
        );
    }

    if (
        url.pathname.startsWith(
            "/api/admin/files/"
        )
    ) {
        const fileId =
            url.pathname
                .split("/")
                .pop();

        if (
            request.method === "GET"
        ) {
            return handleAdminFileDownload(
                request,
                env,
                fileId
            );
        }

        if (
            request.method === "DELETE"
        ) {
            return handleAdminFileDelete(
                request,
                env,
                fileId
            );
        }
    }

    if (
        url.pathname ===
            "/api/admin/notifications" &&
        request.method === "GET"
    ) {
        return handleAdminNotifications(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/notifications/read" &&
        request.method === "POST"
    ) {
        return handleAdminMarkNotificationRead(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/reviews" &&
        request.method === "GET"
    ) {
        return handleAdminReviews(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/reviews/approve" &&
        request.method === "POST"
    ) {
        return handleAdminApproveReview(
            request,
            env
        );
    }

    if (
        url.pathname ===
            "/api/admin/reviews/reject" &&
        request.method === "POST"
    ) {
        return handleAdminRejectReview(
            request,
            env
        );
    }

    if (
        url.pathname.startsWith(
            "/api/admin/reviews/"
        ) &&
        request.method === "DELETE"
    ) {
        const reviewId =
            url.pathname
                .split("/")
                .pop();

        return handleAdminDeleteReview(
            request,
            env,
            reviewId
        );
    }

    return null;
}