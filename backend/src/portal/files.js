import {
    json,
    textResponse
} from "../utils/response.js";

import {
    createId
} from "../utils/ids.js";

import {
    authenticateSession
} from "../utils/auth.js";

import {
    getFileExtension,
    sanitizeFilename,
    getFileCategory
} from "../utils/files.js";

import {
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES
} from "../config/constants.js";

export async function handlePortalFileUpload(
    request,
    env
) {
    try {
        const session =
            await authenticateSession(
                request,
                env
            );

        if (!session) {
            return json(
                {
                    success: false,
                    error:
                        "Authentication required."
                },
                401
            );
        }

        const formData =
            await request.formData();

        const file =
            formData.get("file");

        const conversationId =
            String(
                formData.get(
                    "conversationId"
                ) || ""
            ).trim();

        const messageId =
            String(
                formData.get(
                    "messageId"
                ) || ""
            ).trim();

        if (!(file instanceof File)) {
            return json(
                {
                    success: false,
                    error:
                        "No file was provided."
                },
                400
            );
        }

        if (!conversationId) {
            return json(
                {
                    success: false,
                    error:
                        "Conversation ID is required."
                },
                400
            );
        }

        if (!messageId) {
            return json(
                {
                    success: false,
                    error:
                        "Message ID is required."
                },
                400
            );
        }

        if (file.size <= 0) {
            return json(
                {
                    success: false,
                    error:
                        "The selected file is empty."
                },
                400
            );
        }

        if (
            file.size >
            MAX_FILE_SIZE
        ) {
            return json(
                {
                    success: false,
                    error:
                        "File is too large. Maximum size is 10 MB."
                },
                413
            );
        }

        const contentType =
            (
                file.type ||
                "application/octet-stream"
            ).toLowerCase();

        if (
            !ALLOWED_FILE_TYPES.has(
                contentType
            )
        ) {
            return json(
                {
                    success: false,
                    error:
                        "This file type is not supported."
                },
                415
            );
        }

        const conversation =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        client_id
                     FROM conversations
                     WHERE id = ?
                       AND client_id = ?
                     LIMIT 1`
                )
                .bind(
                    conversationId,
                    session.client_id
                )
                .first();

        if (!conversation) {
            return json(
                {
                    success: false,
                    error:
                        "Conversation not found."
                },
                404
            );
        }

        const message =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        conversation_id
                     FROM messages
                     WHERE id = ?
                       AND conversation_id = ?
                     LIMIT 1`
                )
                .bind(
                    messageId,
                    conversationId
                )
                .first();

        if (!message) {
            return json(
                {
                    success: false,
                    error:
                        "Message not found."
                },
                404
            );
        }

        const fileId =
            createId();

        const extension =
            getFileExtension(
                file.name
            );

        const storageKey = [
            "clients",
            session.client_id,
            "conversations",
            conversationId,
            `${fileId}${
                extension
                    ? `.${extension}`
                    : ""
            }`
        ].join("/");

        await env.FILES.put(
            storageKey,
            file.stream(),
            {
                httpMetadata: {
                    contentType
                },
                customMetadata: {
                    originalName:
                        sanitizeFilename(
                            file.name
                        ),
                    clientId:
                        session.client_id,
                    conversationId,
                    messageId
                }
            }
        );

        try {
            await env.DB
                .prepare(
                    `INSERT INTO files
                    (
                        id,
                        client_id,
                        conversation_id,
                        message_id,
                        original_name,
                        storage_key,
                        content_type,
                        file_size,
                        uploaded_by
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
                )
                .bind(
                    fileId,
                    session.client_id,
                    conversationId,
                    messageId,
                    sanitizeFilename(
                        file.name
                    ),
                    storageKey,
                    contentType,
                    file.size,
                    "client"
                )
                .run();
        } catch (databaseError) {
            try {
                await env.FILES.delete(
                    storageKey
                );
            } catch (cleanupError) {
                console.error(
                    "R2 cleanup error:",
                    cleanupError
                );
            }

            throw databaseError;
        }

        await env.DB
            .prepare(
                `UPDATE conversations
                 SET updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`
            )
            .bind(conversationId)
            .run();

        const client =
            await env.DB
                .prepare(
                    `SELECT name
                     FROM clients
                     WHERE id = ?`
                )
                .bind(
                    session.client_id
                )
                .first();

        await env.DB
            .prepare(
                `INSERT INTO notifications
                (
                    id,
                    client_id,
                    type,
                    title,
                    message
                )
                VALUES (?, ?, ?, ?, ?)`
            )
            .bind(
                createId(),
                session.client_id,
                "file_upload",
                "New Client File",
                `${client?.name || "A client"} uploaded ${sanitizeFilename(file.name)}.`
            )
            .run();

        return json({
            success: true,
            file: {
                id: fileId,
                name:
                    sanitizeFilename(
                        file.name
                    ),
                contentType,
                size: file.size,
                category:
                    getFileCategory(
                        contentType
                    )
            }
        });
    } catch (error) {
        console.error(
            "Portal file upload error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to upload the file."
            },
            500
        );
    }
}

export async function handlePortalFileDownload(
    request,
    env,
    fileId
) {
    try {
        const session =
            await authenticateSession(
                request,
                env
            );

        if (!session) {
            return textResponse(
                "Authentication required.",
                401
            );
        }

        const file =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        client_id,
                        original_name,
                        storage_key,
                        content_type,
                        file_size
                     FROM files
                     WHERE id = ?
                       AND client_id = ?
                     LIMIT 1`
                )
                .bind(
                    fileId,
                    session.client_id
                )
                .first();

        if (!file) {
            return textResponse(
                "File not found.",
                404
            );
        }

        const object =
            await env.FILES.get(
                file.storage_key
            );

        if (!object) {
            return textResponse(
                "Stored file not found.",
                404
            );
        }

        const headers =
            new Headers();

        object.writeHttpMetadata(
            headers
        );

        headers.set(
            "Access-Control-Allow-Origin",
            "*"
        );

        headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, DELETE, OPTIONS"
        );

        headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );

        headers.set(
            "Content-Type",
            file.content_type
        );

        headers.set(
            "Content-Length",
            String(file.file_size)
        );

        headers.set(
            "Content-Disposition",
            `inline; filename="${sanitizeFilename(file.original_name)}"`
        );

        headers.set(
            "Cache-Control",
            "private, no-store"
        );

        return new Response(
            object.body,
            {
                status: 200,
                headers
            }
        );
    } catch (error) {
        console.error(
            "Portal file download error:",
            error
        );

        return textResponse(
            "Unable to retrieve file.",
            500
        );
    }
}

export async function handlePortalFileDelete(
    request,
    env,
    fileId
) {
    try {
        const session =
            await authenticateSession(
                request,
                env
            );

        if (!session) {
            return json(
                {
                    success: false,
                    error:
                        "Authentication required."
                },
                401
            );
        }

        const file =
            await env.DB
                .prepare(
                    `SELECT
                        id,
                        client_id,
                        storage_key
                     FROM files
                     WHERE id = ?
                       AND client_id = ?
                     LIMIT 1`
                )
                .bind(
                    fileId,
                    session.client_id
                )
                .first();

        if (!file) {
            return json(
                {
                    success: false,
                    error:
                        "File not found."
                },
                404
            );
        }

        await env.FILES.delete(
            file.storage_key
        );

        await env.DB
            .prepare(
                `DELETE FROM files
                 WHERE id = ?
                   AND client_id = ?`
            )
            .bind(
                fileId,
                session.client_id
            )
            .run();

        return json({
            success: true
        });
    } catch (error) {
        console.error(
            "Portal file delete error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to delete the file."
            },
            500
        );
    }
}