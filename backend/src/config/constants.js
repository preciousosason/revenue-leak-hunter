export const MAX_FILE_SIZE =
    10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES =
    new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",

        "application/pdf",

        "text/plain",
        "text/csv",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "application/vnd.ms-powerpoint",

        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ]);