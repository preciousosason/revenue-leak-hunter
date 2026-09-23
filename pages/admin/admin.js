/* =========================================================
   CONVERSION LEAK HUNTER
   ADMIN CONTROL SYSTEM
   ========================================================= */


/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_URL =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev";

const SESSION_KEY =
    "revenueLeakHunterAdminSession";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let adminSession = null;

let clients = [];

let notifications = [];

let reviews = [];

let activeReviewFilter = "all";

let currentConversationId = null;

let conversationPollingInterval = null;

let lastConversationSignature = "";

let selectedFiles = [];

let activeClientFilter = "all";

let activeNotificationFilter = "all";


/* =========================================================
   FILE CONFIGURATION
   ========================================================= */

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


/* =========================================================
   DOM
   ========================================================= */

   const reviewsList =
    document.getElementById(
        "reviews-list"
    );

const reviewsTotal =
    document.getElementById(
        "reviews-total"
    );

const reviewsPending =
    document.getElementById(
        "reviews-pending"
    );

const reviewsApproved =
    document.getElementById(
        "reviews-approved"
    );

const reviewsFooterCount =
    document.getElementById(
        "reviews-footer-count"
    );

const refreshReviews =
    document.getElementById(
        "refresh-reviews"
    );

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
    document.getElementById("recent-notifications");

const clientsList =
    document.getElementById("clients-list");

const notificationsList =
    document.getElementById("notifications-list");

const notificationCount =
    document.getElementById("notification-count");

const headerNotificationCount =
    document.getElementById("header-notification-count");

const adminMessages =
    document.getElementById("admin-messages");

const adminMessageForm =
    document.getElementById("admin-message-form");

const adminMessageInput =
    document.getElementById("admin-message-input");

const adminMessageError =
    document.getElementById("admin-message-error");

const adminMessageFiles =
    document.getElementById("admin-message-files");

const adminFileSelection =
    document.getElementById("admin-file-selection");

const adminSelectedFiles =
    document.getElementById("admin-selected-files");

const sidebar =
    document.getElementById("admin-sidebar");

const sidebarOverlay =
    document.getElementById("sidebar-overlay");

const sidebarToggle =
    document.getElementById("sidebar-toggle");

const contextToggle =
    document.getElementById("conversation-context-toggle");

const conversationContext =
    document.querySelector(".conversation-context");

const conversationWorkspace =
    document.querySelector(".conversation-workspace");

const closeConversationContext =
    document.getElementById("close-conversation-context");

const characterCount =
    document.getElementById("character-count");

const clientSearch =
    document.getElementById("client-search");

const systemClock =
    document.getElementById("system-clock");

const notificationsTotal =
    document.getElementById("notifications-total");

const notificationsUnread =
    document.getElementById("notifications-unread");

const notificationsCritical =
    document.getElementById("notifications-critical");

const notificationsFooterCount =
    document.getElementById(
        "notifications-footer-count"
    );

const conversationClientName =
    document.getElementById(
        "conversation-client-name"
    );

const conversationClientDetails =
    document.getElementById(
        "conversation-client-details"
    );

const conversationStatus =
    document.getElementById(
        "conversation-status"
    );

const clientInfoName =
    document.getElementById(
        "client-info-name"
    );

const clientInfoEmail =
    document.getElementById(
        "client-info-email"
    );

const clientInfoBusiness =
    document.getElementById(
        "client-info-business"
    );

const clientInfoWebsite =
    document.getElementById(
        "client-info-website"
    );

const logoutButton =
    document.getElementById(
        "admin-logout"
    );

const backToClients =
    document.getElementById(
        "back-to-clients"
    );

const notificationTrigger =
    document.getElementById(
        "notification-trigger"
    );

const refreshClients =
    document.getElementById(
        "refresh-clients"
    );

const refreshNotifications =
    document.getElementById(
        "refresh-notifications"
    );


/* =========================================================
   HELPERS
   ========================================================= */

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


function formatRelativeTime(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }

    const difference =
        Date.now() -
        date.getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days < 7) {
        return `${days}d ago`;
    }

    return formatDate(
        dateString
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
                part[0]?.toUpperCase()
        )
        .join("");

}


function getAuthHeaders() {

    const headers = {
        "Authorization":
            `Bearer ${adminSession}`
    };

    return headers;

}


function getJSONHeaders() {

    return {
        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${adminSession}`
    };

}


/* =========================================================
   FILE HELPERS
   ========================================================= */

function formatFileSize(bytes) {

    const size =
        Number(bytes);

    if (
        !Number.isFinite(size) ||
        size < 0
    ) {

        return "";

    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (
        size <
        1024 * 1024
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
            file?.category || ""
        ).toLowerCase();

    const contentType =
        String(
            file?.contentType || ""
        ).toLowerCase();

    if (
        category === "image" ||
        contentType.startsWith("image/")
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


/* =========================================================
   SELECTED FILES
   ========================================================= */

function renderSelectedFiles() {

    if (!adminSelectedFiles) {
        return;
    }

    if (!selectedFiles.length) {

        adminSelectedFiles.innerHTML =
            "";

    } else {

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
            selectedFiles.length
                ? `${selectedFiles.length} ${
                    selectedFiles.length === 1
                        ? "file"
                        : "files"
                } selected`
                : "No files selected";

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
                selectedFiles.some(
                    existingFile =>
                        existingFile.name ===
                            file.name &&
                        existingFile.size ===
                            file.size &&
                        existingFile.lastModified ===
                            file.lastModified
                );

            if (!duplicate) {

                selectedFiles.push(
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

        showMessageError(
            rejected.join(" ")
        );

    }

    renderSelectedFiles();

    if (adminMessageFiles) {
        adminMessageFiles.value = "";
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


/* =========================================================
   FILE INPUT EVENTS
   ========================================================= */

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


/* =========================================================
   MESSAGE LINKING
   ========================================================= */

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


/* =========================================================
   API
   ========================================================= */

async function api(
    endpoint,
    options = {}
) {

    const headers = {
        ...getJSONHeaders(),
        ...(options.headers || {})
    };

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    let data = null;

    try {

        data =
            await response.json();

    } catch {

        if (!response.ok) {

            if (
                response.status ===
                401
            ) {

                handleExpiredSession();

            }

            throw new Error(
                "The server returned an invalid response."
            );

        }

    }

    if (
        response.status ===
        401
    ) {

        handleExpiredSession();

        throw new Error(
            "Your admin session has expired."
        );

    }

    if (
        !response.ok ||
        data?.success === false
    ) {

        throw new Error(
            data?.error ||
            "Something went wrong."
        );

    }

    return data || {};

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            hideLoginError();

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";

            if (!password) {

                showLoginError(
                    "Enter your admin password."
                );

                return;

            }

            if (loginButton) {

                loginButton.disabled =
                    true;

                loginButton.innerHTML =
                    "<span>Authenticating...</span><span>...</span>";

            }

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

                let data = null;

                try {

                    data =
                        await response.json();

                } catch {

                    throw new Error(
                        "The server returned an invalid login response."
                    );

                }

                if (
                    !response.ok ||
                    !data?.success ||
                    !data?.sessionToken
                ) {

                    throw new Error(
                        data?.error ||
                        "Invalid admin credentials."
                    );

                }

                adminSession =
                    data.sessionToken;

                sessionStorage.setItem(
                    SESSION_KEY,
                    adminSession
                );

                if (passwordInput) {
                    passwordInput.value = "";
                }

                showDashboard();

            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                showLoginError(
                    error.message ||
                    "Unable to authenticate."
                );

            } finally {

                if (loginButton) {

                    loginButton.disabled =
                        false;

                    loginButton.innerHTML =
                        "<span>Authenticate</span><span>→</span>";

                }

            }

        }
    );

}


function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent =
        message;

    loginError.hidden =
        false;

}


function hideLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent =
        "";

    loginError.hidden =
        true;

}


/* =========================================================
   SESSION
   ========================================================= */

function handleExpiredSession() {

    stopConversationPolling();

    adminSession = null;

    sessionStorage.removeItem(
        SESSION_KEY
    );

    if (dashboard) {
        dashboard.hidden = true;
    }

    if (loginScreen) {
        loginScreen.hidden = false;
    }

    closeSidebar();

    closeConversationContextPanel();

}


function logoutLocal() {

    handleExpiredSession();

}


async function logout() {

    stopConversationPolling();

    const session =
        adminSession;

    try {

        if (session) {

            await fetch(
                `${API_URL}/api/admin/logout`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${session}`
                    }
                }
            );

        }

    } catch {
        // Local logout still happens.
    }

    logoutLocal();

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );

}


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

    } catch (error) {

        console.warn(
            "Stored admin session could not be restored:",
            error
        );

        logoutLocal();

        return false;

    }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function showDashboard() {

    if (loginScreen) {
        loginScreen.hidden = true;
    }

    if (dashboard) {
        dashboard.hidden = false;
    }

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


/* =========================================================
   NAVIGATION
   ========================================================= */

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

                closeSidebar();

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
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.view === view
            );

        });

    document
        .querySelectorAll(
            ".admin-view"
        )
        .forEach(section => {

            section.hidden = true;

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

             reviews:
        "Reviews",

        conversation:
            "Conversation",

        notifications:
            "Notifications"

    };

    if (pageTitle) {

        pageTitle.textContent =
            titles[view] ||
            "Dashboard";

    }

    if (
        view ===
        "clients"
    ) {

        loadClients();

    }

    if (
    view ===
    "reviews"
) {

    loadReviews();

}

    if (
        view ===
        "notifications"
    ) {

        loadNotifications();

    }

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function openSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.add(
        "is-open"
    );

    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "active"
        );

    }

}


function closeSidebar() {

    if (sidebar) {

        sidebar.classList.remove(
            "is-open"
        );

    }

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "active"
        );

    }

}


if (sidebarToggle) {

    sidebarToggle.addEventListener(
        "click",
        () => {

            if (
                sidebar?.classList.contains(
                    "is-open"
                )
            ) {

                closeSidebar();

            } else {

                openSidebar();

            }

        }
    );

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );

}


/* =========================================================
   CLIENTS
   ========================================================= */

async function loadClients() {

    try {

        const data =
            await api(
                "/api/admin/clients"
            );

        clients =
            Array.isArray(
                data.clients
            )
                ? data.clients
                : [];

        renderClients();

        renderRecentClients();

        updateStats();

    } catch (error) {

        console.error(
            "Client loading error:",
            error
        );

        if (clientsList) {

            clientsList.innerHTML =
                `
                    <div class="clients-empty">

                        <div class="clients-empty-mark">
                            !
                        </div>

                        <strong class="clients-empty-title">
                            CLIENT DATA UNAVAILABLE
                        </strong>

                        <p class="clients-empty-description">
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>
                `;

        }

        if (recentClients) {

            recentClients.innerHTML =
                `
                    <div class="empty-state error-state">
                        ${escapeHTML(
                            error.message
                        )}
                    </div>
                `;

        }

    }

}


/* =========================================================
   CLIENT FILTERING
   ========================================================= */

function getFilteredClients() {

    const searchTerm =
        clientSearch
            ? clientSearch.value
                .trim()
                .toLowerCase()
            : "";

    return clients.filter(
        client => {

            if (
                activeClientFilter ===
                "unread"
            ) {

                const unread =
                    Number(
                        client.unread_count ||
                        client.unread ||
                        0
                    );

                if (!unread) {
                    return false;
                }

            }

            if (
                activeClientFilter ===
                "active"
            ) {

                const status =
                    String(
                        client.status ||
                        "open"
                    ).toLowerCase();

                if (
                    [
                        "closed",
                        "resolved",
                        "archived"
                    ].includes(status)
                ) {

                    return false;

                }

            }

            if (!searchTerm) {
                return true;
            }

            const searchable =
                [
                    client.name,
                    client.email,
                    client.business,
                    client.website,
                    client.id
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

            return searchable.includes(
                searchTerm
            );

        }
    );

}


function getClientStatusClass(
    client
) {

    const status =
        String(
            client.status ||
            "active"
        ).toLowerCase();

    if (
        [
            "closed",
            "resolved",
            "archived",
            "inactive"
        ].includes(status)
    ) {

        return "inactive";

    }

    if (
        [
            "pending",
            "new",
            "awaiting"
        ].includes(status)
    ) {

        return "pending";

    }

    return "active";

}


function getClientStatusLabel(
    client
) {

    const status =
        String(
            client.status ||
            "active"
        ).toLowerCase();

    if (
        [
            "closed",
            "resolved",
            "archived",
            "inactive"
        ].includes(status)
    ) {

        return "INACTIVE";

    }

    if (
        [
            "pending",
            "new",
            "awaiting"
        ].includes(status)
    ) {

        return "PENDING";

    }

    return "ACTIVE";

}


function renderRecentClients() {

    if (!recentClients) {
        return;
    }

    if (!clients.length) {

        recentClients.innerHTML =
            `
                <div class="empty-state compact-empty">

                    <strong class="empty-state-title">
                        No clients yet
                    </strong>

                    <p class="empty-state-description">
                        New investigations will appear here.
                    </p>

                </div>
            `;

        return;

    }

    recentClients.innerHTML =
        clients
            .slice(0, 5)
            .map(client => {

                const conversationId =
                    escapeHTML(
                        client.conversation_id ||
                        ""
                    );

                return `
                    <button
                        class="client-row"
                        data-conversation="${conversationId}"
                        type="button"
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
                                    client.name ||
                                    "Unknown Client"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    client.business ||
                                    client.email ||
                                    "No details"
                                )}
                            </span>

                        </span>

                        <span class="client-row-meta">

                            ${escapeHTML(
                                formatRelativeTime(
                                    client.conversation_updated_at ||
                                    client.created_at
                                )
                            )}

                        </span>

                        <span class="client-row-action">
                            →
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

    if (!clientsList) {
        return;
    }

    const filtered =
        getFilteredClients();

    if (!filtered.length) {

        clientsList.innerHTML =
            `
                <div class="clients-empty">

                    <div class="clients-empty-mark">
                        ⌕
                    </div>

                    <strong class="clients-empty-title">
                        NO MATCHING CLIENTS
                    </strong>

                    <p class="clients-empty-description">
                        No investigation records match the current filters.
                    </p>

                </div>
            `;

        updateClientSummary(
            filtered
        );

        return;

    }

    clientsList.innerHTML =
        filtered
            .map(client => {

                const conversationId =
                    escapeHTML(
                        client.conversation_id ||
                        ""
                    );

                const unread =
                    Number(
                        client.unread_count ||
                        client.unread ||
                        0
                    );

                const messageCount =
                    Number(
                        client.message_count ||
                        0
                    );

                const statusClass =
                    getClientStatusClass(
                        client
                    );

                const statusLabel =
                    getClientStatusLabel(
                        client
                    );

                return `
                    <article
                        class="client-row"
                        data-client-id="${escapeHTML(
                            client.id || ""
                        )}"
                    >

                        <div class="client-row-identity">

                            <span class="client-row-avatar">
                                ${escapeHTML(
                                    getInitials(
                                        client.name
                                    )
                                )}
                            </span>

                            <div>

                                <strong class="client-row-name">
                                    ${escapeHTML(
                                        client.name ||
                                        "Unknown Client"
                                    )}
                                </strong>

                                <span class="client-data muted">
                                    ${escapeHTML(
                                        client.email ||
                                        "No email"
                                    )}
                                </span>

                            </div>

                        </div>


                        <div class="client-data">

                            <span>
                                ${escapeHTML(
                                    client.business ||
                                    "Not provided"
                                )}
                            </span>

                        </div>


                        <div
                            class="client-status ${statusClass}"
                        >

                            ${statusLabel}

                            ${
                                unread
                                    ? `
                                        <small>
                                            ${unread} UNREAD
                                        </small>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="client-data mono">

                            ${escapeHTML(
                                formatRelativeTime(
                                    client.conversation_updated_at ||
                                    client.created_at
                                )
                            )}

                        </div>


                        <button
                            class="client-row-action open-conversation"
                            data-conversation="${conversationId}"
                            type="button"
                            aria-label="Open conversation with ${escapeHTML(
                                client.name ||
                                "client"
                            )}"
                        >
                            →
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

                    const conversationId =
                        button.dataset.conversation;

                    if (
                        conversationId
                    ) {

                        openConversation(
                            conversationId
                        );

                    }

                }
            );

        });

    updateClientSummary(
        filtered
    );

}


function updateClientSummary(
    filteredClients
) {

    const summaryValue =
        document.querySelector(
            ".clients-summary-value"
        );

    if (!summaryValue) {
        return;
    }

    summaryValue.textContent =
        filteredClients.length;

}


/* =========================================================
   CLIENT SEARCH
   ========================================================= */

if (clientSearch) {

    clientSearch.addEventListener(
        "input",
        renderClients
    );

}


/* =========================================================
   CLIENT FILTERS
   ========================================================= */

document
    .querySelectorAll(
        ".client-filter"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activeClientFilter =
                    button.dataset.filter ||
                    "all";

                document
                    .querySelectorAll(
                        ".client-filter"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    });

                renderClients();

            }
        );

    });

/* =========================================================
   REVIEWS
   ========================================================= */

async function loadReviews() {

    try {

        const data =
            await api(
                "/api/admin/reviews"
            );

        reviews =
            Array.isArray(
                data.reviews
            )
                ? data.reviews
                : [];

        renderReviews();

        updateReviewSummary();

    } catch (error) {

        console.error(
            "Review loading error:",
            error
        );

        if (reviewsList) {

            reviewsList.innerHTML =
                `
                    <div class="reviews-empty">

                        <div class="reviews-empty-mark">
                            !
                        </div>

                        <strong class="reviews-empty-title">
                            REVIEW DATABASE UNAVAILABLE
                        </strong>

                        <p class="reviews-empty-description">
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>
                `;

        }

    }

}


/* =========================================================
   REVIEW FILTERING
   ========================================================= */

function getFilteredReviews() {

    if (
        activeReviewFilter ===
        "pending"
    ) {

        return reviews.filter(
            review =>
                Number(
                    review.approved
                ) !== 1
        );

    }

    if (
        activeReviewFilter ===
        "approved"
    ) {

        return reviews.filter(
            review =>
                Number(
                    review.approved
                ) === 1
        );

    }

    return reviews;

}


/* =========================================================
   REVIEW STARS
   ========================================================= */

function reviewStars(
    rating
) {

    const value =
        Number(rating) || 0;

    return `
        <span class="review-stars">
            ${[1, 2, 3, 4, 5]
                .map(
                    star =>
                        `
                            <span
                                class="${
                                    star <= value
                                        ? "filled"
                                        : ""
                                }"
                            >
                                ★
                            </span>
                        `
                )
                .join("")}
        </span>
    `;

}


/* =========================================================
   REVIEW RENDERING
   ========================================================= */

function renderReview(
    review
) {

    const approved =
        Number(
            review.approved
        ) === 1;

    const name =
        review.name ||
        "Anonymous Client";

    const business =
        review.business ||
        "No business provided";

    const rating =
        Number(
            review.rating
        ) || 0;

    const text =
        review.review ||
        "";

    return `
        <article
            class="review-row ${
                approved ? "approved" : "pending"
            }"
            data-review-id="${escapeHTML(review.id || "")}">

            <div class="review-client">

                <span class="review-avatar">
                    ${escapeHTML(
                        getInitials(
                            name
                        )
                    )}
                </span>

                <div class="review-client-info">

                    <strong class="review-client-name">
                        ${escapeHTML(
                            name
                        )}
                    </strong>

                    <span class="review-client-business">
                        ${escapeHTML(
                            business
                        )}
                    </span>

                    <span class="review-client-date">
                        ${escapeHTML(
                            formatRelativeTime(
                                review.created_at
                            )
                        )}
                    </span>

                </div>

            </div>


            <div class="review-rating">

                ${reviewStars(
                    rating
                )}

                <span class="review-rating-number">
                    ${rating}/5
                </span>

            </div>


            <div class="review-content">

                <p>
                    ${escapeHTML(
                        text
                    )}
                </p>

            </div>


            <div class="review-status">

                <span
                    class="review-status-badge ${
                        approved
                            ? "approved"
                            : "pending"
                    }"
                >
                    ${
                        approved
                            ? "APPROVED"
                            : "PENDING"
                    }
                </span>

            </div>


            <div class="review-actions">

                ${
                    !approved
                        ? `
                            <button
                                type="button"
                                class="review-action approve"
                                data-review-action="approve"
                                data-review-id="${escapeHTML(
                                    review.id || ""
                                )}"
                            >
                                APPROVE
                            </button>

                            <button
                                type="button"
                                class="review-action reject"
                                data-review-action="reject"
                                data-review-id="${escapeHTML(
                                    review.id || ""
                                )}"
                            >
                                REJECT
                            </button>
                        `
                        : ""
                }

                <button
                    type="button"
                    class="review-action delete"
                    data-review-action="delete"
                    data-review-id="${escapeHTML(
                        review.id || ""
                    )}"
                >
                    DELETE
                </button>

            </div>

        </article>
    `;

}


/* =========================================================
   RENDER REVIEWS
   ========================================================= */

function renderReviews() {

    if (!reviewsList) {
        return;
    }

    const filtered =
        getFilteredReviews();

    if (!filtered.length) {

        const message =
            activeReviewFilter === "pending"
                ? "There are no reviews awaiting approval."
                : activeReviewFilter === "approved"
                    ? "There are no approved reviews yet."
                    : "No client reviews have been submitted yet.";

        reviewsList.innerHTML =
            `
                <div class="reviews-empty">

                    <div class="reviews-empty-mark">
                        ◌
                    </div>

                    <strong class="reviews-empty-title">
                        NO REVIEWS
                    </strong>

                    <p class="reviews-empty-description">
                        ${escapeHTML(
                            message
                        )}
                    </p>

                </div>
            `;

        updateReviewSummary();

        return;

    }

    reviewsList.innerHTML =
        filtered
            .map(
                review =>
                    renderReview(
                        review
                    )
            )
            .join("");

    updateReviewSummary();

}


/* =========================================================
   REVIEW SUMMARY
   ========================================================= */

function updateReviewSummary() {

    const total =
        reviews.length;

    const pending =
        reviews.filter(
            review =>
                Number(
                    review.approved
                ) !== 1
        ).length;

    const approved =
        reviews.filter(
            review =>
                Number(
                    review.approved
                ) === 1
        ).length;

    if (reviewsTotal) {

        reviewsTotal.textContent =
            total;

    }

    if (reviewsPending) {

        reviewsPending.textContent =
            pending;

    }

    if (reviewsApproved) {

        reviewsApproved.textContent =
            approved;

    }

    if (reviewsFooterCount) {

        const visible =
            getFilteredReviews().length;

        reviewsFooterCount.textContent =
            `${visible} REVIEW${
                visible === 1
                    ? ""
                    : "S"
            }`;

    }

}


/* =========================================================
   REVIEW ACTIONS
   ========================================================= */

async function handleReviewAction(
    action,
    reviewId,
    button
) {

    if (
        !action ||
        !reviewId
    ) {

        return;

    }

    const originalText =
        button
            ? button.textContent
            : "";

    if (button) {

        button.disabled =
            true;

        button.textContent =
            action === "approve"
                ? "APPROVING..."
                : action === "reject"
                    ? "REJECTING..."
                    : "DELETING...";

    }

    try {

        if (
            action ===
            "approve"
        ) {

            await api(
                "/api/admin/reviews/approve",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            reviewId
                        })
                }
            );

        } else if (
            action ===
            "reject"
        ) {

            await api(
                "/api/admin/reviews/reject",
                {
                    method: "POST",

                    body:
                        JSON.stringify({
                            reviewId
                        })
                }
            );

        } else if (
            action ===
            "delete"
        ) {

            await api(
                `/api/admin/reviews/${encodeURIComponent(
                    reviewId
                )}`,
                {
                    method: "DELETE"
                }
            );

        } else {

            return;

        }

        await loadReviews();

    } catch (error) {

        console.error(
            `Review ${action} error:`,
            error
        );

        if (button) {

            button.disabled =
                false;

            button.textContent =
                originalText;

        }

        alert(
            error.message ||
            `Unable to ${action} review.`
        );

    }

}


/* =========================================================
   REVIEW ACTION DELEGATION
   ========================================================= */

if (reviewsList) {

    reviewsList.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-review-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.reviewAction;

            const reviewId =
                button.dataset.reviewId;

            if (
                !action ||
                !reviewId
            ) {

                return;

            }

            if (
                action === "delete" ||
                action === "reject"
            ) {

                const confirmed =
                    window.confirm(
                        action === "reject"
                            ? "Reject and remove this review?"
                            : "Permanently delete this review?"
                    );

                if (!confirmed) {
                    return;
                }

            }

            await handleReviewAction(
                action,
                reviewId,
                button
            );

        }
    );

}


/* =========================================================
   REVIEW FILTERS
   ========================================================= */

document
    .querySelectorAll(
        ".review-filter"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activeReviewFilter =
                    button.dataset.reviewFilter ||
                    "all";

                document
                    .querySelectorAll(
                        ".review-filter"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    });

                renderReviews();

            }
        );

    });


/* =========================================================
   REVIEW REFRESH
   ========================================================= */

if (refreshReviews) {

    refreshReviews.addEventListener(
        "click",
        async () => {

            refreshReviews.disabled =
                true;

            const originalText =
                refreshReviews.textContent;

            refreshReviews.textContent =
                "Refreshing...";

            try {

                await loadReviews();

            } finally {

                refreshReviews.disabled =
                    false;

                refreshReviews.textContent =
                    originalText;

            }

        }
    );

}
/* =========================================================
   CONVERSATION
   ========================================================= */

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

    selectedFiles = [];

    renderSelectedFiles();

    closeSidebar();

    switchView(
        "conversation"
    );

    closeConversationContextPanel();

    if (adminMessages) {

        adminMessages.innerHTML =
            `
                <div class="conversation-empty">

                    <div class="conversation-empty-mark">
                        ◌
                    </div>

                    <strong class="conversation-empty-title">
                        LOADING CONVERSATION
                    </strong>

                    <p class="conversation-empty-description">
                        Establishing secure communication channel...
                    </p>

                </div>
            `;

    }

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

        if (adminMessages) {

            adminMessages.innerHTML =
                `
                    <div class="empty-state error-state">
                        ${escapeHTML(
                            error.message
                        )}
                    </div>
                `;

        }

    }

}


/* =========================================================
   CONVERSATION SIGNATURE
   ========================================================= */

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
                `${fileSignature}:` +
                `${message.message || ""}`
            );

        })
        .join("|");

}


/* =========================================================
   LOAD CONVERSATION
   ========================================================= */

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
            Array.isArray(
                data.messages
            )
                ? data.messages
                : [];

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
                data.conversation || {},
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

        if (
            !silent &&
            adminMessages
        ) {

            adminMessages.innerHTML =
                `
                    <div class="empty-state error-state">
                        ${escapeHTML(
                            error.message
                        )}
                    </div>
                `;

        }

        if (!silent) {
            throw error;
        }

    }

}


/* =========================================================
   CONVERSATION POLLING
   ========================================================= */

function startConversationPolling() {

    stopConversationPolling();

    if (!currentConversationId) {
        return;
    }

    conversationPollingInterval =
        setInterval(
            () => {

                if (
                    document.hidden ||
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


/* =========================================================
   TAB VISIBILITY
   ========================================================= */

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
            dashboard &&
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


/* =========================================================
   RENDER MESSAGE FILES
   ========================================================= */

function renderMessageFiles(files) {

    if (
        !Array.isArray(files) ||
        !files.length
    ) {

        return "";

    }

    return `
        <div class="message-attachments">

            <span class="message-attachments-label">
                ATTACHMENTS
            </span>

            <div class="attachment-grid">

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
                            <div class="message-attachment">

                                <span class="attachment-icon">
                                    ${label}
                                </span>

                                <div class="attachment-info">

                                    <span
                                        class="attachment-name"
                                        title="${fileName}"
                                    >
                                        ${fileName}
                                    </span>

                                    <span class="attachment-size">
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
                                    class="attachment-download message-file-download"
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

        </div>
    `;

}


/* =========================================================
   CONVERSATION STATUS
   ========================================================= */

function updateConversationStatus(
    status
) {

    if (!conversationStatus) {
        return;
    }

    const normalized =
        String(
            status ||
            "open"
        )
            .toLowerCase();

    const label =
        normalized.toUpperCase();

    conversationStatus.textContent =
        label;

    conversationStatus.classList.remove(
        "active",
        "critical",
        "warning"
    );

    if (
        [
            "closed",
            "blocked",
            "archived"
        ].includes(normalized)
    ) {

        conversationStatus.classList.add(
            "critical"
        );

    } else if (
        [
            "pending",
            "waiting"
        ].includes(normalized)
    ) {

        conversationStatus.classList.add(
            "warning"
        );

    } else {

        conversationStatus.classList.add(
            "active"
        );

    }

}


/* =========================================================
   RENDER CONVERSATION
   ========================================================= */

function renderConversation(
    conversation,
    messages
) {

    const name =
        conversation?.name ||
        "Client";

    const email =
        conversation?.email ||
        "";

    if (conversationClientName) {

        conversationClientName.textContent =
            name;

    }

    if (conversationClientDetails) {

        conversationClientDetails.textContent =
            email ||
            "Secure client channel";

    }

    updateConversationStatus(
        conversation?.status
    );

    if (clientInfoName) {

        clientInfoName.textContent =
            name;

    }

    if (clientInfoEmail) {

        clientInfoEmail.textContent =
            email ||
            "—";

    }

    if (clientInfoBusiness) {

        clientInfoBusiness.textContent =
            conversation?.business ||
            "Not provided";

    }

    if (clientInfoWebsite) {

        clientInfoWebsite.textContent =
            conversation?.website ||
            "Not provided";

    }

    if (!adminMessages) {
        return;
    }

    if (!messages.length) {

        adminMessages.innerHTML =
            `
                <div class="conversation-empty">

                    <div class="conversation-empty-mark">
                        ◌
                    </div>

                    <strong class="conversation-empty-title">
                        NO MESSAGES YET
                    </strong>

                    <p class="conversation-empty-description">
                        Start the investigation by sending a reply.
                    </p>

                </div>
            `;

        return;

    }

    adminMessages.innerHTML =
        messages
            .map(
                (message, index) => {

                    const isAdmin =
                        String(
                            message.sender_type ||
                            ""
                        ).toLowerCase() ===
                        "admin";

                    const senderName =
                        isAdmin
                            ? "YOU"
                            : name;

                    const direction =
                        isAdmin
                            ? "outbound"
                            : "inbound";

                    return `
                        <article class="message-group">

                            <div class="message-meta">

                                <span class="message-meta-name">
                                    ${escapeHTML(
                                        senderName
                                    )}
                                </span>

                                <span class="message-meta-time">
                                    ${escapeHTML(
                                        formatDate(
                                            message.created_at
                                        )
                                    )}
                                </span>

                            </div>

                            <div class="message ${direction}">

                                <div class="message-bubble">

                                    ${linkifyMessage(
                                        message.message
                                    )}

                                </div>

                            </div>

                            ${renderMessageFiles(
                                message.files
                            )}

                        </article>
                    `;

                }
            )
            .join("");

    adminMessages.scrollTop =
        adminMessages.scrollHeight;

}


/* =========================================================
   DOWNLOAD ADMIN ATTACHMENT
   ========================================================= */

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


/* =========================================================
   ATTACHMENT DOWNLOAD DELEGATION
   ========================================================= */

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


/* =========================================================
   UPLOAD ADMIN FILE
   ========================================================= */

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


/* =========================================================
   SEND ADMIN MESSAGE
   ========================================================= */

if (adminMessageForm) {

    adminMessageForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            hideMessageError();

            const message =
                adminMessageInput
                    ? adminMessageInput.value.trim()
                    : "";

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

            if (sendButton) {
                sendButton.disabled = true;
            }

            try {

                if (sendButton) {
                    sendButton.textContent =
                        "Sending...";
                }

                const result =
                    await api(
                        "/api/admin/messages",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    conversationId:
                                        currentConversationId,

                                    message
                                })
                        }
                    );

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

                if (adminMessageInput) {

                    adminMessageInput.value =
                        "";

                }

                updateCharacterCount();

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

                    if (sendButton) {

                        sendButton.textContent =
                            `Uploading ${
                                index + 1
                            }/${filesBeingSent.length}...`;

                    }

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

                selectedFiles = [];

                renderSelectedFiles();

                await loadConversation(
                    currentConversationId,
                    {
                        silent: false,
                        forceRender: true
                    }
                );

                await loadNotifications();

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

                if (sendButton) {

                    sendButton.disabled =
                        false;

                    sendButton.textContent =
                        "Send Reply →";

                }

            }

        }
    );

}


/* =========================================================
   CHARACTER COUNTER
   ========================================================= */

function updateCharacterCount() {

    if (
        !adminMessageInput ||
        !characterCount
    ) {

        return;

    }

    const current =
        adminMessageInput.value.length;

    const maximum =
        Number(
            adminMessageInput.maxLength
        ) || 5000;

    characterCount.textContent =
        `${current} / ${maximum}`;

    characterCount.classList.toggle(
        "critical",
        current >=
            maximum * 0.9
    );

}


if (adminMessageInput) {

    adminMessageInput.addEventListener(
        "input",
        updateCharacterCount
    );

}


/* =========================================================
   MESSAGE ERROR
   ========================================================= */

function showMessageError(message) {

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


/* =========================================================
   CONVERSATION CONTEXT PANEL
   ========================================================= */

function openConversationContext() {

    if (!conversationContext) {
        return;
    }

    conversationContext.classList.add(
        "is-open"
    );

    if (conversationWorkspace) {

        conversationWorkspace.classList.add(
            "context-open"
        );

    }

}


function closeConversationContextPanel() {

    if (conversationContext) {

        conversationContext.classList.remove(
            "is-open"
        );

    }

    if (conversationWorkspace) {

        conversationWorkspace.classList.remove(
            "context-open"
        );

    }

}


if (contextToggle) {

    contextToggle.addEventListener(
        "click",
        () => {

            if (
                conversationContext?.classList.contains(
                    "is-open"
                )
            ) {

                closeConversationContextPanel();

            } else {

                openConversationContext();

            }

        }
    );

}


if (closeConversationContext) {

    closeConversationContext.addEventListener(
        "click",
        closeConversationContextPanel
    );

}


/* =========================================================
   BACK TO CLIENTS
   ========================================================= */

if (backToClients) {

    backToClients.addEventListener(
        "click",
        () => {

            currentConversationId =
                null;

            lastConversationSignature =
                "";

            selectedFiles = [];

            renderSelectedFiles();

            stopConversationPolling();

            closeConversationContextPanel();

            switchView(
                "clients"
            );

        }
    );

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

async function loadNotifications() {

    try {

        const data =
            await api(
                "/api/admin/notifications"
            );

        notifications =
            Array.isArray(
                data.notifications
            )
                ? data.notifications
                : [];

        renderNotifications();

        renderRecentNotifications();

        updateNotificationSummary();

        updateStats();

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

        if (notificationsList) {

            notificationsList.innerHTML =
                `
                    <div class="notifications-empty">

                        <div class="notifications-empty-mark">
                            !
                        </div>

                        <strong class="notifications-empty-title">
                            SIGNAL FEED UNAVAILABLE
                        </strong>

                        <p class="notifications-empty-description">
                            ${escapeHTML(
                                error.message
                            )}
                        </p>

                    </div>
                `;

        }

        if (recentNotifications) {

            recentNotifications.innerHTML =
                `
                    <div class="empty-state error-state">
                        ${escapeHTML(
                            error.message
                        )}
                    </div>
                `;

        }

    }

}


/* =========================================================
   NOTIFICATION CLASSIFICATION
   ========================================================= */

function getNotificationCategory(
    notification
) {

    const raw =
        String(
            notification?.type ||
            notification?.category ||
            ""
        ).toLowerCase();

    if (
        raw.includes("message")
    ) {

        return "messages";

    }

    if (
        raw.includes("client")
    ) {

        return "clients";

    }

    return "activity";

}


function getNotificationSeverity(
    notification
) {

    const raw =
        String(
            notification?.severity ||
            notification?.level ||
            notification?.type ||
            notification?.category ||
            ""
        ).toLowerCase();

    if (
        raw.includes("critical") ||
        raw.includes("error") ||
        raw.includes("danger")
    ) {

        return "critical";

    }

    if (
        raw.includes("warning") ||
        raw.includes("warn")
    ) {

        return "warning";

    }

    if (
        raw.includes("success") ||
        raw.includes("complete") ||
        raw.includes("resolved")
    ) {

        return "success";

    }

    return "info";

}


function getNotificationTypeLabel(
    severity
) {

    const labels = {
        info: "INFO",
        success: "OK",
        warning: "WARN",
        critical: "CRITICAL"
    };

    return (
        labels[severity] ||
        "INFO"
    );

}


function isNotificationUnread(
    notification
) {

    const value =
        notification?.read;

    if (
        value === true ||
        value === "true"
    ) {

        return false;

    }

    return (
        Number(value) === 0 ||
        value === null ||
        value === undefined
    );

}


function getFilteredNotifications() {

    if (
        activeNotificationFilter ===
        "all"
    ) {

        return notifications;

    }

    return notifications.filter(
        notification => {

            if (
                activeNotificationFilter ===
                "unread"
            ) {

                return isNotificationUnread(
                    notification
                );

            }

            return (
                getNotificationCategory(
                    notification
                ) ===
                activeNotificationFilter
            );

        }
    );

}


/* =========================================================
   NOTIFICATION RENDERING
   ========================================================= */

function notificationHTML(
    notification,
    compact = false
) {

    const unread =
        isNotificationUnread(
            notification
        );

    const category =
        getNotificationCategory(
            notification
        );

    const severity =
        getNotificationSeverity(
            notification
        );

    const title =
        notification.title ||
        "System Notification";

    const description =
        notification.message ||
        notification.description ||
        "";

    const source =
        notification.source ||
        (
            category === "messages"
                ? "CLIENT COMMUNICATION"
                : category === "clients"
                    ? "CLIENT DATABASE"
                    : "SYSTEM"
        );

    return `
        <article
            class="
                notification-row
                ${unread ? "unread" : ""}
                ${severity}
            "
            data-category="${escapeHTML(
                category
            )}"
            data-severity="${escapeHTML(
                severity
            )}"
        >

            <div class="notification-type ${severity}">
                ${escapeHTML(
                    getNotificationTypeLabel(
                        severity
                    )
                )}
            </div>


            <div class="notification-content">

                <strong class="notification-title">
                    ${escapeHTML(
                        title
                    )}
                </strong>

                <p class="notification-description">
                    ${escapeHTML(
                        description
                    )}
                </p>

                <span class="notification-source">
                    ${escapeHTML(
                        source
                    )}
                </span>

            </div>


            <time class="notification-time">
                ${escapeHTML(
                    formatRelativeTime(
                        notification.created_at
                    )
                )}
            </time>


            <div class="notification-action">

                ${
                    !compact &&
                    unread
                        ? `
                            <button
                                class="notification-read-button"
                                data-notification="${escapeHTML(
                                    notification.id || ""
                                )}"
                                type="button"
                            >
                                MARK READ
                            </button>
                        `
                        : unread
                            ? `
                                <span class="notification-new">
                                    NEW
                                </span>
                            `
                            : ""
                }

            </div>

        </article>
    `;

}


function renderNotifications() {

    if (!notificationsList) {
        return;
    }

    const filtered =
        getFilteredNotifications();

    if (!filtered.length) {

        notificationsList.innerHTML =
            `
                <div class="notifications-empty">

                    <div class="notifications-empty-mark">
                        ◌
                    </div>

                    <strong class="notifications-empty-title">
                        NO SIGNALS
                    </strong>

                    <p class="notifications-empty-description">
                        There are no notifications matching this filter.
                    </p>

                </div>
            `;

        updateNotificationSummary();

        return;

    }

    notificationsList.innerHTML =
        filtered
            .map(
                notification =>
                    notificationHTML(
                        notification
                    )
            )
            .join("");

}


function renderRecentNotifications() {

    if (!recentNotifications) {
        return;
    }

    if (!notifications.length) {

        recentNotifications.innerHTML =
            `
                <div class="empty-state compact-empty">

                    <strong class="empty-state-title">
                        No notifications
                    </strong>

                    <p class="empty-state-description">
                        No new system signals.
                    </p>

                </div>
            `;

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


/* =========================================================
   NOTIFICATION READ ACTION
   ========================================================= */

if (notificationsList) {

    notificationsList.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    ".notification-read-button"
                );

            if (!button) {
                return;
            }

            const notificationId =
                button.dataset.notification;

            if (!notificationId) {
                return;
            }

            button.disabled =
                true;

            const originalText =
                button.textContent;

            button.textContent =
                "UPDATING...";

            try {

                await api(
                    "/api/admin/notifications/read",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                notificationId
                            })
                    }
                );

                await loadNotifications();

            } catch (error) {

                console.error(
                    "Notification read error:",
                    error
                );

                button.disabled =
                    false;

                button.textContent =
                    originalText;

            }

        }
    );

}


/* =========================================================
   NOTIFICATION FILTERS
   ========================================================= */

document
    .querySelectorAll(
        ".notification-filter"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                activeNotificationFilter =
                    button.dataset.filter ||
                    "all";

                document
                    .querySelectorAll(
                        ".notification-filter"
                    )
                    .forEach(item => {

                        item.classList.toggle(
                            "active",
                            item === button
                        );

                    });

                renderNotifications();

            }
        );

    });


/* =========================================================
   NOTIFICATION SUMMARY
   ========================================================= */

function updateNotificationSummary() {

    const total =
        notifications.length;

    const unread =
        notifications.filter(
            notification =>
                isNotificationUnread(
                    notification
                )
        ).length;

    const critical =
        notifications.filter(
            notification =>
                getNotificationSeverity(
                    notification
                ) === "critical"
        ).length;

    if (notificationsTotal) {

        notificationsTotal.textContent =
            total;

    }

    if (notificationsUnread) {

        notificationsUnread.textContent =
            unread;

    }

    if (notificationsCritical) {

        notificationsCritical.textContent =
            critical;

    }

    if (notificationsFooterCount) {

        notificationsFooterCount.textContent =
            `${getFilteredNotifications().length} SIGNAL${
                getFilteredNotifications().length === 1
                    ? ""
                    : "S"
            }`;

    }

}


/* =========================================================
   NOTIFICATION HEADER
   ========================================================= */

if (notificationTrigger) {

    notificationTrigger.addEventListener(
        "click",
        () => {

            switchView(
                "notifications"
            );

        }
    );

}


/* =========================================================
   STATS
   ========================================================= */

function updateStats() {

    const totalClients =
        clients.length;

    const totalConversations =
        clients.filter(
            client =>
                client.conversation_id
        ).length;

    const totalMessages =
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
                isNotificationUnread(
                    notification
                )
        ).length;

    if (statClients) {

        statClients.textContent =
            totalClients;

    }

    if (statConversations) {

        statConversations.textContent =
            totalConversations;

    }

    if (statMessages) {

        statMessages.textContent =
            totalMessages;

    }

    if (statUnread) {

        statUnread.textContent =
            unread;

    }

    if (notificationCount) {

        notificationCount.textContent =
            unread;

        notificationCount.hidden =
            unread === 0;

    }

    if (headerNotificationCount) {

        headerNotificationCount.textContent =
            unread;

        headerNotificationCount.hidden =
            unread === 0;

    }

    updateNotificationSummary();

}


/* =========================================================
   REFRESH BUTTONS
   ========================================================= */

if (refreshClients) {

    refreshClients.addEventListener(
        "click",
        async () => {

            refreshClients.disabled =
                true;

            try {

                await loadClients();

            } finally {

                refreshClients.disabled =
                    false;

            }

        }
    );

}


if (refreshNotifications) {

    refreshNotifications.addEventListener(
        "click",
        async () => {

            refreshNotifications.disabled =
                true;

            try {

                await loadNotifications();

            } finally {

                refreshNotifications.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   SYSTEM CLOCK
   ========================================================= */

function updateSystemClock() {

    if (!systemClock) {
        return;
    }

    const now =
        new Date();

    systemClock.textContent =
        now.toLocaleTimeString(
            undefined,
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        );

}


updateSystemClock();

setInterval(
    updateSystemClock,
    1000
);


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }

        closeSidebar();

        closeConversationContextPanel();

    }
);


/* =========================================================
   INITIAL UI
   ========================================================= */

renderSelectedFiles();

updateCharacterCount();

updateNotificationSummary();


/* =========================================================
   INITIALIZE APPLICATION
   ========================================================= */

restoreSession();