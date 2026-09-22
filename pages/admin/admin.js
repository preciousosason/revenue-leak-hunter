const API_URL =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev";

const SESSION_KEY =
    "revenueLeakHunterAdminSession";

let adminSession = null;
let clients = [];
let notifications = [];
let currentConversationId = null;

let conversationPollingInterval = null;
let lastConversationSignature = "";


/* =========================================
   FILE CONFIGURATION
========================================= */

const MAX_FILES = 5;

const MAX_FILE_SIZE =
    10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
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

const ALLOWED_MIME_TYPES = [
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

let selectedFiles = [];


/* =========================================
   DOM
========================================= */

const loginScreen =
    document.getElementById("admin-login");

const dashboard =
    document.getElementById("admin-dashboard");

const loginForm =
    document.getElementById("admin-login-form");

const passwordInput =
    document.getElementById("admin-password");

const loginButton =
    document.getElementById("admin-login-button");

const loginError =
    document.getElementById("admin-login-error");

const pageTitle =
    document.getElementById("page-title");

const statClients =
    document.getElementById("stat-clients");

const statConversations =
    document.getElementById("stat-conversations");

const statMessages =
    document.getElementById("stat-messages");

const statUnread =
    document.getElementById("stat-unread");

const recentClients =
    document.getElementById("recent-clients");

const recentNotifications =
    document.getElementById(
        "recent-notifications"
    );

const clientsList =
    document.getElementById("clients-list");

const notificationsList =
    document.getElementById(
        "notifications-list"
    );

const notificationCount =
    document.getElementById(
        "notification-count"
    );

const adminMessages =
    document.getElementById(
        "admin-messages"
    );

const adminMessageForm =
    document.getElementById(
        "admin-message-form"
    );

const adminMessageInput =
    document.getElementById(
        "admin-message-input"
    );

const adminMessageError =
    document.getElementById(
        "admin-message-error"
    );

const adminMessageFiles =
    document.getElementById(
        "admin-message-files"
    );

const adminFileSelection =
    document.getElementById(
        "admin-file-selection"
    );

const adminSelectedFiles =
    document.getElementById(
        "admin-selected-files"
    );


/* =========================================
   HELPERS
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


function formatDate(dateString) {

    if (!dateString) {
        return "Unknown";
    }


    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

    }


    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


function getInitials(name) {

    if (!name) {
        return "?";
    }


    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part =>
                part[0]
                    ?.toUpperCase()
        )
        .join("");

}


function getAuthHeaders() {

    return {
        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${adminSession}`
    };

}


/* =========================================
   FILE HELPERS
========================================= */

function formatFileSize(bytes) {

    const size =
        Number(bytes);


    if (
        !Number.isFinite(size) ||
        size < 0
    ) {

        return "";

    }


    if (
        size < 1024
    ) {

        return `${size} B`;

    }


    if (
        size < 1024 * 1024
    ) {

        return `${(
            size / 1024
        ).toFixed(1)} KB`;

    }


    return `${(
        size /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}


function getFileLabel(file) {

    const category =
        String(
            file?.category ||
            ""
        ).toLowerCase();


    const contentType =
        String(
            file?.contentType ||
            ""
        ).toLowerCase();


    if (
        category === "image" ||
        contentType.startsWith(
            "image/"
        )
    ) {

        return "IMG";

    }


    if (
        category === "pdf" ||
        contentType ===
            "application/pdf"
    ) {

        return "PDF";

    }


    if (
        category === "document"
    ) {

        return "DOC";

    }


    if (
        category === "spreadsheet"
    ) {

        return "XLS";

    }


    if (
        category === "presentation"
    ) {

        return "PPT";

    }


    if (
        category === "text"
    ) {

        return "TXT";

    }


    return "FILE";

}


function validateFile(file) {

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


/* =========================================
   SELECTED FILES
========================================= */

function renderSelectedFiles() {

    if (!adminSelectedFiles) {
        return;
    }


    adminSelectedFiles.innerHTML =
        selectedFiles
            .map(
                (file, index) => {

                    const extension =
                        file.name
                            .split(".")
                            .pop()
                            .toUpperCase();


                    return `
                        <div
                            class="selected-file"
                            data-file-index="${index}"
                        >

                            <span
                                class="selected-file-icon"
                            >
                                ${escapeHTML(
                                    extension
                                )}
                            </span>


                            <span
                                class="selected-file-name"
                                title="${escapeHTML(
                                    file.name
                                )}"
                            >
                                ${escapeHTML(
                                    file.name
                                )}
                            </span>


                            <span
                                class="selected-file-size"
                            >
                                ${escapeHTML(
                                    formatFileSize(
                                        file.size
                                    )
                                )}
                            </span>


                            <button
                                type="button"
                                class="selected-file-remove"
                                data-file-index="${index}"
                                aria-label="Remove ${escapeHTML(
                                    file.name
                                )}"
                                title="Remove file"
                            >
                                ×
                            </button>

                        </div>
                    `;

                }
            )
            .join("");


    if (adminFileSelection) {

        if (!selectedFiles.length) {

            adminFileSelection.textContent =
                "No files selected";

        } else {

            adminFileSelection.textContent =
                `${selectedFiles.length} ${
                    selectedFiles.length === 1
                        ? "file"
                        : "files"
                } selected`;

        }

    }

}


function handleFileSelection(files) {

    hideMessageError();


    const incomingFiles =
        Array.from(
            files || []
        );


    if (!incomingFiles.length) {
        return;
    }


    const availableSlots =
        MAX_FILES -
        selectedFiles.length;


    if (
        availableSlots <= 0
    ) {

        showMessageError(
            "You can attach a maximum of 5 files to one message."
        );


        if (adminMessageFiles) {

            adminMessageFiles.value =
                "";

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
                validateFile(
                    file
                );


            if (validationError) {

                rejected.push(
                    validationError
                );

                return;

            }


            const duplicate =
                selectedFiles.some(
                    existingFile =>
                        existingFile.name ===
                            file.name &&
                        existingFile.size ===
                            file.size &&
                        existingFile.lastModified ===
                            file.lastModified
                );


            if (duplicate) {
                return;
            }


            selectedFiles.push(
                file
            );

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

        showMessageError(
            rejected.join(" ")
        );

    }


    renderSelectedFiles();


    if (adminMessageFiles) {

        adminMessageFiles.value =
            "";

    }

}


function removeSelectedFile(index) {

    if (
        index < 0 ||
        index >= selectedFiles.length
    ) {

        return;

    }


    selectedFiles.splice(
        index,
        1
    );


    renderSelectedFiles();

}


/* =========================================
   FILE INPUT
========================================= */

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


            const index =
                Number(
                    button.dataset.fileIndex
                );


            removeSelectedFile(
                index
            );

        }
    );

}


/* =========================================
   CLICKABLE LINKS + EMAILS
========================================= */

function linkifyMessage(value) {

    const escaped =
        escapeHTML(value ?? "");

    const pattern =
        /((?:https?:\/\/|www\.)[^\s<]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

    return escaped
        .replace(
            pattern,
            match => {

                let cleanMatch =
                    match;

                let trailing =
                    "";


                while (
                    /[.,!?;:)]$/.test(
                        cleanMatch
                    )
                ) {

                    trailing =
                        cleanMatch.slice(-1) +
                        trailing;

                    cleanMatch =
                        cleanMatch.slice(
                            0,
                            -1
                        );

                }


                if (
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        cleanMatch
                    )
                ) {

                    return (
                        `<a href="mailto:${cleanMatch}" ` +
                        `class="message-link message-email">` +
                        `${cleanMatch}` +
                        `</a>` +
                        trailing
                    );

                }


                const href =
                    /^https?:\/\//i.test(
                        cleanMatch
                    )
                        ? cleanMatch
                        : `https://${cleanMatch}`;


                return (
                    `<a href="${href}" ` +
                    `target="_blank" ` +
                    `rel="noopener noreferrer" ` +
                    `class="message-link">` +
                    `${cleanMatch}` +
                    `</a>` +
                    trailing
                );

            }
        )
        .replace(
            /\n/g,
            "<br>"
        );

}


/* =========================================
   API
========================================= */

async function api(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    ...getAuthHeaders(),
                    ...(options.headers || {})
                }
            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        throw new Error(
            "The server returned an invalid response."
        );

    }


    if (
        response.status === 401
    ) {

        stopConversationPolling();

        logoutLocal();


        throw new Error(
            "Your admin session has expired."
        );

    }


    if (
        !response.ok ||
        data.success === false
    ) {

        throw new Error(
            data.error ||
            "Something went wrong."
        );

    }


    return data;

}


/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        loginError.hidden =
            true;


        const password =
            passwordInput.value;


        if (!password) {

            showLoginError(
                "Enter your admin password."
            );

            return;

        }


        loginButton.disabled =
            true;


        loginButton.innerHTML =
            "<span>Signing in...</span><span>...</span>";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                password
                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.error ||
                    "Invalid admin credentials."
                );

            }


            adminSession =
                data.sessionToken;


            sessionStorage.setItem(
                SESSION_KEY,
                adminSession
            );


            passwordInput.value =
                "";


            showDashboard();


        } catch (error) {

            showLoginError(
                error.message
            );


        } finally {

            loginButton.disabled =
                false;


            loginButton.innerHTML =
                "<span>Enter Dashboard</span><span>→</span>";

        }

    }
);


function showLoginError(
    message
) {

    loginError.textContent =
        message;

    loginError.hidden =
        false;

}


/* =========================================
   SESSION
========================================= */

function logoutLocal() {

    stopConversationPolling();

    adminSession =
        null;


    sessionStorage.removeItem(
        SESSION_KEY
    );


    dashboard.hidden =
        true;


    loginScreen.hidden =
        false;

}


async function logout() {

    stopConversationPolling();


    try {

        if (adminSession) {

            await fetch(
                `${API_URL}/api/admin/logout`,
                {
                    method: "POST",

                    headers:
                        getAuthHeaders()
                }
            );

        }

    } catch {

        // Local logout still happens.

    }


    logoutLocal();

}


document
    .getElementById("admin-logout")
    .addEventListener(
        "click",
        logout
    );


async function restoreSession() {

    const stored =
        sessionStorage.getItem(
            SESSION_KEY
        );


    if (!stored) {
        return false;
    }


    adminSession =
        stored;


    try {

        await api(
            "/api/admin/me"
        );


        showDashboard();


        return true;


    } catch {

        logoutLocal();


        return false;

    }

}


/* =========================================
   DASHBOARD
========================================= */

function showDashboard() {

    loginScreen.hidden =
        true;


    dashboard.hidden =
        false;


    switchView(
        "overview"
    );


    loadDashboard();

}


async function loadDashboard() {

    try {

        await Promise.all([
            loadClients(),
            loadNotifications()
        ]);


        updateStats();


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


/* =========================================
   NAVIGATION
========================================= */

document
    .querySelectorAll(
        "[data-view]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                switchView(
                    button.dataset.view
                );

            }
        );

    });


function switchView(view) {

    if (
        view !==
        "conversation"
    ) {

        stopConversationPolling();

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.view === view
            );

        });


    document
        .querySelectorAll(".admin-view")
        .forEach(section => {

            section.hidden =
                true;

            section.classList.remove(
                "active-view"
            );

        });


    const target =
        document.getElementById(
            `view-${view}`
        );


    if (!target) {
        return;
    }


    target.hidden =
        false;


    target.classList.add(
        "active-view"
    );


    const titles = {

        overview:
            "Overview",

        clients:
            "Clients",

        conversation:
            "Conversation",

        notifications:
            "Notifications"

    };


    pageTitle.textContent =
        titles[view] ||
        "Dashboard";


    if (
        view ===
        "clients"
    ) {

        loadClients();

    }


    if (
        view ===
        "notifications"
    ) {

        loadNotifications();

    }

}


/* =========================================
   CLIENTS
========================================= */

async function loadClients() {

    try {

        const data =
            await api(
                "/api/admin/clients"
            );


        clients =
            data.clients || [];


        renderClients();

        renderRecentClients();

        updateStats();


    } catch (error) {

        clientsList.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>`;


        recentClients.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


function renderRecentClients() {

    if (!clients.length) {

        recentClients.innerHTML =
            `<div class="empty-state">
                No clients yet.
            </div>`;


        return;

    }


    recentClients.innerHTML =
        clients
            .slice(0, 5)
            .map(client => {

                return `
                    <button
                        class="client-row"
                        data-conversation="${escapeHTML(
                            client.conversation_id || ""
                        )}"
                    >

                        <span class="client-avatar">
                            ${escapeHTML(
                                getInitials(
                                    client.name
                                )
                            )}
                        </span>


                        <span class="client-row-main">

                            <strong>
                                ${escapeHTML(
                                    client.name
                                )}
                            </strong>


                            <span>
                                ${escapeHTML(
                                    client.business ||
                                    client.email
                                )}
                            </span>

                        </span>


                        <span class="client-row-action">
                            Open →
                        </span>

                    </button>
                `;

            })
            .join("");


    recentClients
        .querySelectorAll(
            "[data-conversation]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.conversation;


                    if (id) {

                        openConversation(
                            id
                        );

                    }

                }
            );

        });

}


function renderClients() {

    if (!clients.length) {

        clientsList.innerHTML =
            `<div class="empty-state">
                No clients yet.
            </div>`;


        return;

    }


    clientsList.innerHTML =
        clients
            .map(client => {

                return `
                    <article class="client-card">

                        <div class="client-card-name">

                            <span class="client-avatar">
                                ${escapeHTML(
                                    getInitials(
                                        client.name
                                    )
                                )}
                            </span>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        client.name
                                    )}
                                </strong>


                                <span>
                                    ${escapeHTML(
                                        client.email
                                    )}
                                </span>

                            </div>

                        </div>


                        <div class="client-card-detail">

                            <span>Business</span>

                            <strong>
                                ${escapeHTML(
                                    client.business ||
                                    "Not provided"
                                )}
                            </strong>

                        </div>


                        <div class="client-card-detail">

                            <span>Last activity</span>

                            <strong>
                                ${escapeHTML(
                                    formatDate(
                                        client.conversation_updated_at ||
                                        client.created_at
                                    )
                                )}
                            </strong>

                        </div>


                        <button
                            class="open-conversation"
                            data-conversation="${escapeHTML(
                                client.conversation_id || ""
                            )}"
                        >
                            Open Conversation
                        </button>

                    </article>
                `;

            })
            .join("");


    clientsList
        .querySelectorAll(
            ".open-conversation"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openConversation(
                        button.dataset.conversation
                    );

                }
            );

        });

}


/* =========================================
   CONVERSATION
========================================= */

async function openConversation(
    conversationId
) {

    if (!conversationId) {
        return;
    }


    stopConversationPolling();


    currentConversationId =
        conversationId;


    lastConversationSignature =
        "";


    selectedFiles =
        [];


    renderSelectedFiles();


    switchView(
        "conversation"
    );


    adminMessages.innerHTML =
        `<div class="empty-state">
            Loading conversation...
        </div>`;


    try {

        await loadConversation(
            conversationId,
            {
                silent: false,
                forceRender: true
            }
        );


        startConversationPolling();


    } catch (error) {

        adminMessages.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


/* =========================================
   CONVERSATION SIGNATURE
========================================= */

function getConversationSignature(
    messages
) {

    return messages
        .map(message => {

            const fileSignature =
                Array.isArray(
                    message.files
                )
                    ? message.files
                        .map(
                            file =>
                                file.id
                        )
                        .join(",")
                    : "";


            return (
                `${message.id}:` +
                `${fileSignature}`
            );

        })
        .join("|");

}


/* =========================================
   LOAD CONVERSATION
========================================= */

async function loadConversation(
    conversationId,
    options = {}
) {

    const {
        silent = false,
        forceRender = false
    } = options;


    if (
        conversationId !==
        currentConversationId
    ) {

        return;

    }


    try {

        const data =
            await api(
                `/api/admin/conversations/${encodeURIComponent(
                    conversationId
                )}`
            );


        if (
            conversationId !==
            currentConversationId
        ) {

            return;

        }


        const messages =
            data.messages || [];


        const conversationSignature =
            getConversationSignature(
                messages
            );


        const messagesChanged =
            conversationSignature !==
            lastConversationSignature;


        if (
            forceRender ||
            messagesChanged
        ) {

            renderConversation(
                data.conversation,
                messages
            );


            lastConversationSignature =
                conversationSignature;

        }


    } catch (error) {

        console.error(
            "Conversation loading error:",
            error
        );


        if (!silent) {

            adminMessages.innerHTML =
                `<div class="empty-state">
                    ${escapeHTML(
                        error.message
                    )}
                </div>`;

        }

    }

}


/* =========================================
   START CONVERSATION POLLING
========================================= */

function startConversationPolling() {

    stopConversationPolling();


    if (!currentConversationId) {
        return;
    }


    conversationPollingInterval =
        setInterval(
            () => {

                if (
                    document.hidden
                ) {

                    return;

                }


                if (
                    !currentConversationId
                ) {

                    return;

                }


                loadConversation(
                    currentConversationId,
                    {
                        silent: true,
                        forceRender: false
                    }
                );

            },
            2000
        );

}


/* =========================================
   STOP CONVERSATION POLLING
========================================= */

function stopConversationPolling() {

    if (
        conversationPollingInterval
    ) {

        clearInterval(
            conversationPollingInterval
        );

    }


    conversationPollingInterval =
        null;

}


/* =========================================
   TAB VISIBILITY
========================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden
        ) {

            return;

        }


        if (
            currentConversationId &&
            !dashboard.hidden
        ) {

            loadConversation(
                currentConversationId,
                {
                    silent: true,
                    forceRender: true
                }
            );

        }

    }
);


/* =========================================
   RENDER MESSAGE FILES
========================================= */

function renderMessageFiles(
    files
) {

    if (
        !Array.isArray(files) ||
        !files.length
    ) {

        return "";

    }


    return `
        <div class="message-attachments">

            <span class="message-attachments-label">
                Attachments
            </span>

            ${files.map(
                file => {

                    const fileId =
                        escapeHTML(
                            file.id || ""
                        );

                    const fileName =
                        escapeHTML(
                            file.name ||
                            "Attached file"
                        );

                    const label =
                        escapeHTML(
                            getFileLabel(
                                file
                            )
                        );

                    const size =
                        escapeHTML(
                            formatFileSize(
                                file.size
                            )
                        );


                    return `
                        <div
                            class="message-file"
                        >

                            <span
                                class="message-file-icon"
                                aria-hidden="true"
                            >
                                ${label}
                            </span>


                            <div
                                class="message-file-info"
                            >

                                <span
                                    class="message-file-name"
                                    title="${fileName}"
                                >
                                    ${fileName}
                                </span>


                                <span
                                    class="message-file-meta"
                                >
                                    ${label}
                                    ${
                                        size
                                            ? ` · ${size}`
                                            : ""
                                    }
                                </span>

                            </div>


                            <button
                                type="button"
                                class="message-file-download"
                                data-file-id="${fileId}"
                                data-file-name="${fileName}"
                                title="Download file"
                                aria-label="Download ${fileName}"
                            >
                                ↓
                            </button>

                        </div>
                    `;

                }
            ).join("")}

        </div>
    `;

}


/* =========================================
   RENDER CONVERSATION
========================================= */

function renderConversation(
    conversation,
    messages
) {

    document.getElementById(
        "conversation-client-name"
    ).textContent =
        conversation.name ||
        "Client";


    document.getElementById(
        "conversation-client-details"
    ).textContent =
        conversation.email ||
        "";


    document.getElementById(
        "conversation-status"
    ).textContent =
        (
            conversation.status ||
            "open"
        ).toUpperCase();


    document.getElementById(
        "client-info-name"
    ).textContent =
        conversation.name ||
        "—";


    document.getElementById(
        "client-info-email"
    ).textContent =
        conversation.email ||
        "—";


    document.getElementById(
        "client-info-business"
    ).textContent =
        conversation.business ||
        "Not provided";


    document.getElementById(
        "client-info-website"
    ).textContent =
        conversation.website ||
        "Not provided";


    if (!messages.length) {

        adminMessages.innerHTML =
            `<div class="empty-state">
                No messages yet.
            </div>`;


        return;

    }


    adminMessages.innerHTML =
        messages
            .map(message => {

                const isAdmin =
                    message.sender_type ===
                    "admin";


                return `
                    <div class="message ${
                        isAdmin
                            ? "admin"
                            : "client"
                    }">

                        <div>

                            <div class="message-bubble">
                                ${linkifyMessage(
                                    message.message
                                )}
                            </div>


                            ${renderMessageFiles(
                                message.files
                            )}


                            <div class="message-meta">

                                ${
                                    isAdmin
                                        ? "You"
                                        : escapeHTML(
                                            conversation.name ||
                                            "Client"
                                        )
                                }

                                ·

                                ${escapeHTML(
                                    formatDate(
                                        message.created_at
                                    )
                                )}

                            </div>

                        </div>

                    </div>
                `;

            })
            .join("");


    adminMessages.scrollTop =
        adminMessages.scrollHeight;

}


/* =========================================
   DOWNLOAD ADMIN ATTACHMENT
========================================= */

async function downloadAdminFile(
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

                    headers: {
                        "Authorization":
                            `Bearer ${adminSession}`
                    }
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
            }


            if (
                response.status ===
                401
            ) {

                logoutLocal();

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


        showMessageError(
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


/* =========================================
   ATTACHMENT DOWNLOAD DELEGATION
========================================= */

if (adminMessages) {

    adminMessages.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".message-file-download"
                );


            if (!button) {
                return;
            }


            downloadAdminFile(
                button.dataset.fileId,
                button.dataset.fileName ||
                    "download",
                button
            );

        }
    );

}


/* =========================================
   UPLOAD ADMIN FILE
========================================= */

async function uploadAdminFile(
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

                headers: {
                    "Authorization":
                        `Bearer ${adminSession}`
                },

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
        response.status ===
        401
    ) {

        logoutLocal();


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


/* =========================================
   SEND ADMIN MESSAGE
========================================= */

adminMessageForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        hideMessageError();


        const message =
            adminMessageInput.value.trim();


        if (!currentConversationId) {

            showMessageError(
                "No conversation selected."
            );

            return;

        }


        if (!message) {

            showMessageError(
                "Write a message first."
            );

            return;

        }


        const sendButton =
            document.getElementById(
                "admin-send-message"
            );


        const filesBeingSent =
            [...selectedFiles];


        sendButton.disabled =
            true;


        try {

            /*
             * STEP 1:
             * Send the admin message.
             */

            sendButton.textContent =
                "Sending...";


            const result =
                await api(
                    "/api/admin/messages",
                    {
                        method: "POST",

                        body:
                            JSON.stringify({
                                conversationId:
                                    currentConversationId,

                                message
                            })
                    }
                );


            /*
             * The backend should return the
             * created message. We support the
             * common response shapes.
             */

            const messageId =
                result.message?.id ||
                result.id;


            const conversationId =
                result.message?.conversation_id ||
                result.conversation?.id ||
                currentConversationId;


            if (
                filesBeingSent.length &&
                !messageId
            ) {

                throw new Error(
                    "Your reply was sent, but the server did not return the message ID needed for file uploads."
                );

            }


            adminMessageInput.value =
                "";


            /*
             * STEP 2:
             * Upload selected files.
             */

            const uploadResults = {
                successful: [],
                failed: []
            };


            for (
                let index = 0;
                index <
                filesBeingSent.length;
                index++
            ) {

                const file =
                    filesBeingSent[index];


                sendButton.textContent =
                    `Uploading ${
                        index + 1
                    }/${filesBeingSent.length}...`;


                try {

                    await uploadAdminFile(
                        file,
                        conversationId,
                        messageId
                    );


                    uploadResults.successful.push(
                        file
                    );


                } catch (error) {

                    console.error(
                        `Admin file upload failed: ${file.name}`,
                        error
                    );


                    uploadResults.failed.push({
                        file,
                        error
                    });

                }

            }


            /*
             * Clear selected files only after
             * the upload attempt has completed.
             */

            selectedFiles =
                [];


            renderSelectedFiles();


            /*
             * STEP 3:
             * Refresh conversation.
             */

            await loadConversation(
                currentConversationId,
                {
                    silent: false,
                    forceRender: true
                }
            );


            await loadNotifications();


            /*
             * Tell admin about partial upload
             * failures without pretending the
             * message itself failed.
             */

            if (
                uploadResults.failed.length
            ) {

                const failedNames =
                    uploadResults.failed
                        .map(
                            item =>
                                item.file.name
                        )
                        .join(", ");


                showMessageError(
                    `Your reply was sent, but these files could not be uploaded: ${failedNames}`
                );

            }


        } catch (error) {

            console.error(
                "Admin send message error:",
                error
            );


            showMessageError(
                error.message ||
                "Unable to send your reply."
            );


        } finally {

            sendButton.disabled =
                false;


            sendButton.textContent =
                "Send Reply →";

        }

    }
);


/* =========================================
   MESSAGE ERROR
========================================= */

function showMessageError(
    message
) {

    if (!adminMessageError) {
        return;
    }


    adminMessageError.textContent =
        message;


    adminMessageError.hidden =
        false;

}


function hideMessageError() {

    if (!adminMessageError) {
        return;
    }


    adminMessageError.textContent =
        "";


    adminMessageError.hidden =
        true;

}


/* =========================================
   BACK TO CLIENTS
========================================= */

document
    .getElementById(
        "back-to-clients"
    )
    .addEventListener(
        "click",
        () => {

            currentConversationId =
                null;


            lastConversationSignature =
                "";


            selectedFiles =
                [];


            renderSelectedFiles();


            stopConversationPolling();


            switchView(
                "clients"
            );

        }
    );


/* =========================================
   NOTIFICATIONS
========================================= */

async function loadNotifications() {

    try {

        const data =
            await api(
                "/api/admin/notifications"
            );


        notifications =
            data.notifications || [];


        renderNotifications();

        renderRecentNotifications();

        updateStats();


    } catch (error) {

        notificationsList.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>`;


        recentNotifications.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>`;

    }

}


function notificationHTML(
    notification,
    compact = false
) {

    return `
        <article class="notification-item ${
            Number(notification.read) === 0
                ? "unread"
                : ""
        }">

            <div class="notification-icon">
                ●
            </div>


            <div class="notification-content">

                <strong>
                    ${escapeHTML(
                        notification.title
                    )}
                </strong>


                <p>
                    ${escapeHTML(
                        notification.message
                    )}
                </p>


                <time>
                    ${escapeHTML(
                        formatDate(
                            notification.created_at
                        )
                    )}
                </time>

            </div>


            ${
                !compact &&
                Number(notification.read) === 0
                    ? `
                        <button
                            class="mark-read"
                            data-notification="${escapeHTML(
                                notification.id
                            )}"
                        >
                            Mark read
                        </button>
                    `
                    : ""
            }

        </article>
    `;

}


function renderNotifications() {

    if (!notifications.length) {

        notificationsList.innerHTML =
            `<div class="empty-state">
                No notifications.
            </div>`;


        return;

    }


    notificationsList.innerHTML =
        notifications
            .map(
                notification =>
                    notificationHTML(
                        notification
                    )
            )
            .join("");


    attachNotificationHandlers(
        notificationsList
    );

}


function renderRecentNotifications() {

    if (!notifications.length) {

        recentNotifications.innerHTML =
            `<div class="empty-state">
                No notifications yet.
            </div>`;


        return;

    }


    recentNotifications.innerHTML =
        notifications
            .slice(0, 5)
            .map(
                notification =>
                    notificationHTML(
                        notification,
                        true
                    )
            )
            .join("");

}


function attachNotificationHandlers(
    container
) {

    container
        .querySelectorAll(
            ".mark-read"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    try {

                        await api(
                            "/api/admin/notifications/read",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({
                                        notificationId:
                                            button.dataset.notification
                                    })
                            }
                        );


                        await loadNotifications();


                    } catch (error) {

                        console.error(
                            error
                        );

                    }

                }
            );

        });

}


/* =========================================
   STATS
========================================= */

function updateStats() {

    statClients.textContent =
        clients.length;


    statConversations.textContent =
        clients.filter(
            client =>
                client.conversation_id
        ).length;


    statMessages.textContent =
        clients.reduce(
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
        notifications.filter(
            notification =>
                Number(
                    notification.read
                ) === 0
        ).length;


    statUnread.textContent =
        unread;


    notificationCount.textContent =
        unread;


    notificationCount.hidden =
        unread === 0;

}


/* =========================================
   REFRESH BUTTONS
========================================= */

document
    .getElementById(
        "refresh-clients"
    )
    .addEventListener(
        "click",
        loadClients
    );


document
    .getElementById(
        "refresh-notifications"
    )
    .addEventListener(
        "click",
        loadNotifications
    );


/* =========================================
   INITIAL FILE UI
========================================= */

renderSelectedFiles();


/* =========================================
   INITIALIZE
========================================= */

restoreSession();