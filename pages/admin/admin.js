const API_URL =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev";

const SESSION_KEY =
    "revenueLeakHunterAdminSession";

let adminSession = null;
let clients = [];
let notifications = [];
let currentConversationId = null;


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
        data = await response.json();
    } catch {
        throw new Error(
            "The server returned an invalid response."
        );
    }

    if (
        response.status === 401
    ) {
        logoutLocal();

        throw new Error(
            "Your admin session has expired."
        );
    }

    if (!response.ok || data.success === false) {
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

        loginError.hidden = true;

        const password =
            passwordInput.value;

        if (!password) {
            showLoginError(
                "Enter your admin password."
            );

            return;
        }

        loginButton.disabled = true;

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
                        body: JSON.stringify({
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

            passwordInput.value = "";

            showDashboard();

        } catch (error) {
            showLoginError(
                error.message
            );

        } finally {
            loginButton.disabled = false;

            loginButton.innerHTML =
                "<span>Enter Dashboard</span><span>→</span>";
        }
    }
);

function showLoginError(message) {
    loginError.textContent =
        message;

    loginError.hidden = false;
}


/* =========================================
   SESSION
========================================= */

function logoutLocal() {
    adminSession = null;

    sessionStorage.removeItem(
        SESSION_KEY
    );

    dashboard.hidden = true;
    loginScreen.hidden = false;
}

async function logout() {
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

    adminSession = stored;

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
    loginScreen.hidden = true;
    dashboard.hidden = false;

    switchView("overview");

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

    target.hidden = false;
    target.classList.add(
        "active-view"
    );

    const titles = {
        overview: "Overview",
        clients: "Clients",
        conversation: "Conversation",
        notifications:
            "Notifications"
    };

    pageTitle.textContent =
        titles[view] ||
        "Dashboard";

    if (view === "clients") {
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
                ${escapeHTML(error.message)}
            </div>`;

        recentClients.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(error.message)}
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
                                getInitials(client.name)
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
                        openConversation(id);
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
                                    getInitials(client.name)
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

    currentConversationId =
        conversationId;

    switchView(
        "conversation"
    );

    adminMessages.innerHTML =
        `<div class="empty-state">
            Loading conversation...
        </div>`;

    try {
        const data =
            await api(
                `/api/admin/conversations/${encodeURIComponent(
                    conversationId
                )}`
            );

        renderConversation(
            data.conversation,
            data.messages || []
        );

    } catch (error) {

        adminMessages.innerHTML =
            `<div class="empty-state">
                ${escapeHTML(
                    error.message
                )}
            </div>`;
    }
}

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
                                ${escapeHTML(
                                    message.message
                                )}
                            </div>

                            <div class="message-meta">
                                ${
                                    isAdmin
                                        ? "You"
                                        : conversation.name
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
   SEND ADMIN MESSAGE
========================================= */

adminMessageForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        adminMessageError.hidden =
            true;

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

        sendButton.disabled = true;
        sendButton.textContent =
            "Sending...";

        try {

            await api(
                "/api/admin/messages",
                {
                    method: "POST",
                    body: JSON.stringify({
                        conversationId:
                            currentConversationId,
                        message
                    })
                }
            );

            adminMessageInput.value =
                "";

            await openConversation(
                currentConversationId
            );

            await loadNotifications();

        } catch (error) {

            showMessageError(
                error.message
            );

        } finally {

            sendButton.disabled =
                false;

            sendButton.textContent =
                "Send Reply →";
        }
    }
);

function showMessageError(
    message
) {
    adminMessageError.textContent =
        message;

    adminMessageError.hidden =
        false;
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
            switchView("clients");
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
   INITIALIZE
========================================= */

restoreSession();