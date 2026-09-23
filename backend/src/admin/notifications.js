import {
    json
} from "../utils/response.js";

import {
    authenticateAdmin
} from "../utils/auth.js";

export async function handleAdminNotifications(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    try {
        const notifications =
            await env.DB
                .prepare(
                    `SELECT
                        notifications.id,
                        notifications.client_id,
                        notifications.type,
                        notifications.title,
                        notifications.message,
                        notifications.read,
                        notifications.created_at,
                        clients.name AS client_name
                     FROM notifications
                     LEFT JOIN clients
                        ON clients.id =
                           notifications.client_id
                     ORDER BY
                        notifications.created_at DESC
                     LIMIT 100`
                )
                .all();

        return json({
            success: true,
            notifications:
                notifications.results || []
        });
    } catch (error) {
        console.error(
            "Admin notifications error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to load notifications."
            },
            500
        );
    }
}

export async function handleAdminMarkNotificationRead(
    request,
    env
) {
    const admin =
        await authenticateAdmin(
            request,
            env
        );

    if (!admin) {
        return json(
            {
                success: false,
                error:
                    "Admin authentication required."
            },
            401
        );
    }

    let data;

    try {
        data =
            await request.json();
    } catch {
        return json(
            {
                success: false,
                error:
                    "Invalid JSON request."
            },
            400
        );
    }

    if (
        !data.notificationId ||
        typeof data.notificationId !==
            "string"
    ) {
        return json(
            {
                success: false,
                error:
                    "Notification ID is required."
            },
            400
        );
    }

    try {
        await env.DB
            .prepare(
                `UPDATE notifications
                 SET read = 1
                 WHERE id = ?`
            )
            .bind(
                data.notificationId
            )
            .run();

        return json({
            success: true
        });
    } catch (error) {
        console.error(
            "Mark notification error:",
            error
        );

        return json(
            {
                success: false,
                error:
                    "Unable to update notification."
            },
            500
        );
    }
}