
export const MAX_FILE_SIZE =
    10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",

    "application/pdf": "pdf",

    "text/plain": "txt",
    "text/csv": "csv",

    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",

    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        "xlsx",

    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx"
};