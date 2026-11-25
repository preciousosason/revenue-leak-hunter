import { readSessionCookie } from "../auth/cookies.js";
import { assertTrustedHost, assertSameOrigin, authJSON } from "../auth/security.js";
import { revokeCurrentSession, removeCustomerSession } from "../auth/sessions.js";

import {
    handlePortalLogin,
    handlePortalMe,
    handlePortalLogout
} from "./auth.js";

import {
    handlePortalMessages,
    handlePortalSendMessage
} from "./messages.js";

import {
    handlePortalFileUpload,
    handlePortalFileDownload,
    handlePortalFileDelete
} from "./files.js";

export async function handlePortalRoutes(
    request,
    env
) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/portal/")) return null;
    if (readSessionCookie(request)) {
        try {
            assertTrustedHost(request, env);
            if (!["GET", "HEAD"].includes(request.method)) assertSameOrigin(request, env);
        } catch (error) {
            return authJSON({ success: false, error: "Request origin is not permitted." }, error.status || 403);
        }
        if (url.pathname === "/api/portal/logout" && request.method === "POST") {
            await revokeCurrentSession(request, env);
            return removeCustomerSession(request, authJSON({ success: true }));
        }
    }

    if (
        url.pathname === "/api/portal/login" &&
        request.method === "POST"
    ) {
        return handlePortalLogin(
            request,
            env
        );
    }

    if (
        url.pathname === "/api/portal/me" &&
        request.method === "GET"
    ) {
        return handlePortalMe(
            request,
            env
        );
    }

    if (
        url.pathname === "/api/portal/logout" &&
        request.method === "POST"
    ) {
        return handlePortalLogout(
            request,
            env
        );
    }

    if (
        url.pathname === "/api/portal/messages" &&
        request.method === "GET"
    ) {
        return handlePortalMessages(
            request,
            env
        );
    }

    if (
        url.pathname === "/api/portal/messages" &&
        request.method === "POST"
    ) {
        return handlePortalSendMessage(
            request,
            env
        );
    }

    if (
        url.pathname === "/api/portal/files" &&
        request.method === "POST"
    ) {
        return handlePortalFileUpload(
            request,
            env
        );
    }

    if (
        url.pathname.startsWith(
            "/api/portal/files/"
        )
    ) {
        const fileId =
            url.pathname
                .split("/")
                .pop();

        if (
            request.method === "GET"
        ) {
            return handlePortalFileDownload(
                request,
                env,
                fileId
            );
        }

        if (
            request.method === "DELETE"
        ) {
            return handlePortalFileDelete(
                request,
                env,
                fileId
            );
        }
    }

    return null;
}