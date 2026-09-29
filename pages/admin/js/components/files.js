import {
    API_URL,
    MAX_FILES,
    MAX_FILE_SIZE,
    ALLOWED_EXTENSIONS,
    ALLOWED_MIME_TYPES
} from "../core/config.js";

import state from "../core/state.js";

import {
    getAuthHeaders
} from "../core/api.js";

import {
    escapeHTML,
    formatFileSize
} from "../core/utils.js";


let showMessageErrorHandler = null;
let hideMessageErrorHandler = null;
let expiredSessionHandler = null;


/* =========================================================
   CONFIGURATION
   ========================================================= */

export function configureFiles({
    showMessageError,
    hideMessageError,
    onExpiredSession
} = {}) {

    showMessageErrorHandler =
        showMessageError || null;

    hideMessageErrorHandler =
        hideMessageError || null;

    expiredSessionHandler =
        onExpiredSession || null;

}


/* =========================================================
   VALIDATION
   ========================================================= */

export function validateFile(file) {

    if (!file) {
        return "Invalid file.";
    }

    if (
        file.size >
        MAX_FILE_SIZE
    ) {

        return (
            `"${file.name}" is larger than 10 MB.`
        );

    }

    const extension =
        String(
            file.name || ""
        )
            .split(".")
            .pop()
            .toLowerCase();

    if (
        !ALLOWED_EXTENSIONS.includes(
            extension
        )
    ) {

        return (
            `"${file.name}" is not a supported file type.`
        );

    }

    if (
        file.type &&
        !ALLOWED_MIME_TYPES.includes(
            file.type
        )
    ) {

        return (
            `"${file.name}" has an unsupported file format.`
        );

    }

    return null;

}


/* =========================================================
   SELECTED FILES
   ========================================================= */

export function renderSelectedFiles() {

    const adminSelectedFiles =
        document.getElementById(
            "admin-selected-files"
        );

    const adminFileSelection =
        document.getElementById(
            "admin-file-selection"
        );

    if (!adminSelectedFiles) {
        return;
    }

    if (!state.selectedFiles.length) {

        adminSelectedFiles.innerHTML =
            "";

    } else {

        adminSelectedFiles.innerHTML =
            state.selectedFiles
                .map(
                    (file, index) => {

                        const extension =
                            file.name
                                .split(".")
                                .pop()
                                .toUpperCase();

                        return `
                            <div
                                class="selected-file attachment-card"
                                data-file-index="${index}"
                            >

                                <span
                                    class="selected-file-icon attachment-icon"
                                >
                                    ${escapeHTML(
                                        extension
                                    )}
                                </span>

                                <span
                                    class="selected-file-name attachment-name"
                                    title="${escapeHTML(
                                        file.name
                                    )}"
                                >
                                    ${escapeHTML(
                                        file.name
                                    )}
                                </span>

                                <span
                                    class="selected-file-size attachment-meta"
                                >
                                    ${escapeHTML(
                                        formatFileSize(
                                            file.size
                                        )
                                    )}
                                </span>

                                <button
                                    type="button"
                                    class="selected-file-remove attachment-remove"
                                    data-file-index="${index}"
                                    aria-label="Remove ${escapeHTML(
                                        file.name
                                    )}"
                                >
                                    ×
                                </button>

                            </div>
                        `;

                    }
                )
                .join("");

    }

    if (adminFileSelection) {

        adminFileSelection.textContent =
            state.selectedFiles.length
                ? `${state.selectedFiles.length} ${
                    state.selectedFiles.length === 1
                        ? "file"
                        : "files"
                } selected`
                : "No files selected";

    }

}


/* =========================================================
   HANDLE FILE SELECTION
   ========================================================= */

export function handleFileSelection(files) {

    hideMessageErrorHandler?.();

    const adminMessageFiles =
        document.getElementById(
            "admin-message-files"
        );

    const incomingFiles =
        Array.from(
            files || []
        );

    if (!incomingFiles.length) {
        return;
    }

    const availableSlots =
        MAX_FILES -
        state.selectedFiles.length;

    if (
        availableSlots <= 0
    ) {

        showMessageErrorHandler?.(
            "You can attach a maximum of 5 files to one message."
        );

        if (adminMessageFiles) {
            adminMessageFiles.value = "";
        }

        return;

    }

    const filesToAdd =
        incomingFiles.slice(
            0,
            availableSlots
        );

    const rejected = [];

    filesToAdd.forEach(
        file => {

            const validationError =
                validateFile(file);

            if (validationError) {

                rejected.push(
                    validationError
                );

                return;

            }

            const duplicate =
                state.selectedFiles.some(
                    existingFile =>
                        existingFile.name ===
                            file.name &&
                        existingFile.size ===
                            file.size &&
                        existingFile.lastModified ===
                            file.lastModified
                );

            if (!duplicate) {

                state.selectedFiles.push(
                    file
                );

            }

        }
    );

    if (
        incomingFiles.length >
        availableSlots
    ) {

        rejected.push(
            "Only 5 files can be attached to one message."
        );

    }

    if (rejected.length) {

        showMessageErrorHandler?.(
            rejected.join(" ")
        );

    }

    renderSelectedFiles();

    if (adminMessageFiles) {
        adminMessageFiles.value = "";
    }

}


/* =========================================================
   REMOVE FILE
   ========================================================= */

export function removeSelectedFile(index) {

    if (
        index < 0 ||
        index >=
            state.selectedFiles.length
    ) {
        return;
    }

    state.selectedFiles.splice(
        index,
        1
    );

    renderSelectedFiles();

}


export function clearSelectedFiles() {

    state.selectedFiles = [];

    renderSelectedFiles();

}


/* =========================================================
   UPLOAD ADMIN FILE
   ========================================================= */

export async function uploadAdminFile(
    file,
    conversationId,
    messageId
) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "conversationId",
        conversationId
    );

    formData.append(
        "messageId",
        messageId
    );

    const response =
        await fetch(
            `${API_URL}/api/admin/files`,
            {
                method: "POST",

                headers:
                    getAuthHeaders(),

                body:
                    formData
            }
        );

    let result = null;

    try {

        result =
            await response.json();

    } catch {

        result = null;

    }

    if (
        response.status === 401
    ) {

        expiredSessionHandler?.();

        throw new Error(
            "Your admin session has expired."
        );

    }

    if (
        !response.ok ||
        !result?.success
    ) {

        throw new Error(
            result?.error ||
            `Unable to upload ${file.name}.`
        );

    }

    return result;

}


/* =========================================================
   DOWNLOAD ADMIN FILE
   ========================================================= */

export async function downloadAdminFile(
    fileId,
    fileName,
    button
) {

    if (!fileId) {
        return;
    }

    const originalContent =
        button
            ? button.innerHTML
            : "";

    try {

        if (button) {

            button.disabled =
                true;

            button.innerHTML =
                "…";

        }

        const response =
            await fetch(
                `${API_URL}/api/admin/files/${encodeURIComponent(
                    fileId
                )}`,
                {
                    method: "GET",

                    headers:
                        getAuthHeaders()
                }
            );

        if (!response.ok) {

            let errorMessage =
                "Unable to download file.";

            try {

                const result =
                    await response.json();

                errorMessage =
                    result.error ||
                    errorMessage;

            } catch {
                // Ignore malformed error body.
            }

            if (
                response.status === 401
            ) {

                expiredSessionHandler?.();

            }

            throw new Error(
                errorMessage
            );

        }

        const blob =
            await response.blob();

        const url =
            URL.createObjectURL(
                blob
            );

        const anchor =
            document.createElement(
                "a"
            );

        anchor.href =
            url;

        anchor.download =
            fileName ||
            "download";

        document.body.appendChild(
            anchor
        );

        anchor.click();

        anchor.remove();

        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            1000
        );

    } catch (error) {

        console.error(
            "Admin file download error:",
            error
        );

        showMessageErrorHandler?.(
            error.message ||
            "Unable to download file."
        );

    } finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalContent;

        }

    }

}


/* =========================================================
   FILE EVENTS
   ========================================================= */

export function initFiles() {

    const adminMessageFiles =
        document.getElementById(
            "admin-message-files"
        );

    const adminSelectedFiles =
        document.getElementById(
            "admin-selected-files"
        );


    if (adminMessageFiles) {

        adminMessageFiles.addEventListener(
            "change",
            event => {

                handleFileSelection(
                    event.target.files
                );

            }
        );

    }


    if (adminSelectedFiles) {

        adminSelectedFiles.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".selected-file-remove"
                    );

                if (!button) {
                    return;
                }

                removeSelectedFile(
                    Number(
                        button.dataset.fileIndex
                    )
                );

            }
        );

    }


    renderSelectedFiles();

}