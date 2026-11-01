/* =========================================================
   ADMIN CONFIGURATION
   ========================================================= */

export const API_URL =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev";

export const SESSION_KEY =
    "revenueLeakHunterAdminSession";

export const MAX_FILES = 5;

export const MAX_FILE_SIZE =
    10 * 1024 * 1024;

export const ALLOWED_EXTENSIONS = [
    "pdf",
    "png",
    "jpg",
    "jpeg",
    "webp",
    "gif",
    "txt",
    "csv",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx"
];

export const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];