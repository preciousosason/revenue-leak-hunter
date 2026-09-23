export function getFileExtension(filename) {
    const parts =
        filename
            .split(".")
            .filter(Boolean);

    if (!parts.length) {
        return "";
    }

    return parts[
        parts.length - 1
    ]
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        );
}

export function sanitizeFilename(filename) {
    return String(
        filename || "file"
    )
        .replace(
            /[\r\n"]/g,
            ""
        )
        .replace(
            /[^a-zA-Z0-9._()\- ]/g,
            "_"
        )
        .trim()
        .slice(0, 180) ||
        "file";
}

export function getFileCategory(
    contentType
) {
    if (
        contentType.startsWith(
            "image/"
        )
    ) {
        return "image";
    }

    if (
        contentType ===
        "application/pdf"
    ) {
        return "pdf";
    }

    if (
        contentType.startsWith(
            "text/"
        )
    ) {
        return "text";
    }

    return "document";
}

export async function getMessageFiles(
    env,
    messageIds
) {
    if (!messageIds.length) {
        return [];
    }

    const placeholders =
        messageIds
            .map(() => "?")
            .join(",");

    const result =
        await env.DB
            .prepare(
                `SELECT
                    id,
                    message_id,
                    original_name,
                    content_type,
                    file_size,
                    uploaded_by,
                    created_at
                 FROM files
                 WHERE message_id IN (${placeholders})
                 ORDER BY created_at ASC`
            )
            .bind(
                ...messageIds
            )
            .all();

    return result.results || [];
}

export async function attachFilesToMessages(
    env,
    messages
) {
    if (!messages.length) {
        return messages;
    }

    const messageIds =
        messages.map(
            message => message.id
        );

    const files =
        await getMessageFiles(
            env,
            messageIds
        );

    const filesByMessage =
        new Map();

    for (const file of files) {
        if (
            !filesByMessage.has(
                file.message_id
            )
        ) {
            filesByMessage.set(
                file.message_id,
                []
            );
        }

        filesByMessage
            .get(file.message_id)
            .push({
                id: file.id,
                name:
                    file.original_name,
                contentType:
                    file.content_type,
                size:
                    file.file_size,
                category:
                    getFileCategory(
                        file.content_type
                    ),
                uploadedBy:
                    file.uploaded_by,
                createdAt:
                    file.created_at
            });
    }

    return messages.map(
        message => ({
            ...message,
            files:
                filesByMessage.get(
                    message.id
                ) || []
        })
    );
}