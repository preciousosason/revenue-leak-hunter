import {
    api
} from "../core/api.js";

import state from "../core/state.js";

import {
    escapeHTML,
    formatDate,
    formatFileSize,
    getFileLabel,
    linkifyMessage
} from "../core/utils.js";

import {
    uploadAdminFile,
    downloadAdminFile,
    clearSelectedFiles,
    renderSelectedFiles
} from "../components/files.js";


let switchViewHandler = null;
let closeSidebarHandler = null;
let loadNotificationsHandler = null;


export function configureConversation({
    switchView,
    closeSidebar,
    loadNotifications
} = {}) {

    switchViewHandler =
        switchView || null;

    closeSidebarHandler =
        closeSidebar || null;

    loadNotificationsHandler =
        loadNotifications || null;

}


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


export async function openConversation(
    conversationId
) {

    if (!conversationId) {
        return;
    }

    stopConversationPolling();

    state.currentConversationId =
        conversationId;

    state.lastConversationSignature =
        "";

    clearSelectedFiles();

    closeSidebarHandler?.();

    switchViewHandler?.(
        "conversation"
    );

    closeConversationContextPanel();

    const adminMessages =
        document.getElementById(
            "admin-messages"
        );

    if (adminMessages) {

        adminMessages.innerHTML = `
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

        await loadEmailNotificationHistory();
        setNotificationStatus();
        startConversationPolling();

    } catch (error) {

        if (adminMessages) {

            adminMessages.innerHTML = `
                <div class="empty-state error-state">
                    ${escapeHTML(
                        error.message
                    )}
                </div>
            `;

        }

    }

}


export async function loadConversation(
    conversationId,
    options = {}
) {

    const {
        silent = false,
        forceRender = false
    } = options;

    if (
        conversationId !==
        state.currentConversationId
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
            state.currentConversationId
        ) {
            return;
        }

        const conversation = {
            ...(data.conversation || {}),
            name: data.conversation?.name || data.conversation?.client_name || "",
            email: data.conversation?.email || data.conversation?.client_email || "",
            business: data.conversation?.business || data.conversation?.client_business || "",
            website: data.conversation?.website || data.conversation?.client_website || ""
        };

        state.currentConversation = conversation;

        const messages =
            Array.isArray(
                data.messages
            )
                ? data.messages
                : [];

        const signature =
            getConversationSignature(
                messages
            );

        const messagesChanged =
            signature !==
            state.lastConversationSignature;

        if (
            forceRender ||
            messagesChanged
        ) {

            renderConversation(
                conversation,
                messages
            );

            state.lastConversationSignature =
                signature;

        }

    } catch (error) {

        console.error(
            "Conversation loading error:",
            error
        );

        const adminMessages =
            document.getElementById(
                "admin-messages"
            );

        if (
            !silent &&
            adminMessages
        ) {

            adminMessages.innerHTML = `
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


export function startConversationPolling() {

    stopConversationPolling();

    if (
        !state.currentConversationId
    ) {
        return;
    }

    state.conversationPollingInterval =
        setInterval(
            () => {

                if (
                    document.hidden ||
                    !state.currentConversationId
                ) {
                    return;
                }

                loadConversation(
                    state.currentConversationId,
                    {
                        silent: true,
                        forceRender: false
                    }
                );

            },
            2000
        );

}


export function stopConversationPolling() {

    if (
        state.conversationPollingInterval
    ) {

        clearInterval(
            state.conversationPollingInterval
        );

    }

    state.conversationPollingInterval =
        null;

}


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

                ${files
                    .map(file => {

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
                                getFileLabel(file)
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
                                        ${label}${
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

                    })
                    .join("")}

            </div>

        </div>
    `;

}


function updateConversationStatus(
    status
) {

    const conversationStatus =
        document.getElementById(
            "conversation-status"
        );

    if (!conversationStatus) {
        return;
    }

    const normalized =
        String(
            status ||
            "open"
        ).toLowerCase();

    conversationStatus.textContent =
        normalized.toUpperCase();

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


function renderConversationServices(services) {

    const container =
        document.getElementById(
            "client-info-services"
        );

    if (!container) {
        return;
    }

    if (!Array.isArray(services) || !services.length) {
        container.innerHTML =
            `<span class="context-service-empty">Not specified</span>`;
        return;
    }

    const sorted = services
        .filter(service => service && (service.title || service.slug))
        .slice()
        .sort((a, b) => {
            const aNumber = Number.parseInt(a.number, 10);
            const bNumber = Number.parseInt(b.number, 10);
            return (Number.isFinite(aNumber) ? aNumber : 9999) -
                   (Number.isFinite(bNumber) ? bNumber : 9999);
        });

    container.innerHTML = sorted.length
        ? sorted.map(service => `
            <span class="context-service-chip">
                <span class="context-service-number">
                    ${escapeHTML(service.number || "--")}
                </span>
                <span class="context-service-name">
                    ${escapeHTML(service.title || service.slug || "Service")}
                </span>
            </span>
        `).join("")
        : `<span class="context-service-empty">Not specified</span>`;

}


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

    const setText = (
        id,
        value
    ) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    };


    setText(
        "conversation-client-name",
        name
    );

    setText(
        "conversation-client-details",
        email ||
        "Secure client channel"
    );

    setText(
        "client-info-name",
        name
    );

    setText(
        "client-info-email",
        email || "—"
    );

    setText(
        "client-info-business",
        conversation?.business ||
        "Not provided"
    );

    setText(
        "client-info-website",
        conversation?.website ||
        "Not provided"
    );

    const servicesElement =
        document.getElementById(
            "client-info-services"
        );

    if (servicesElement) {
        const services =
            Array.isArray(conversation?.services)
                ? conversation.services
                : [];

        servicesElement.innerHTML =
            services.length
                ? services.map(service => `
                    <span class="client-service-chip">
                        ${service.number ? `<b>${escapeHTML(service.number)}</b>` : ""}
                        ${escapeHTML(service.title || service.slug || "Service")}
                    </span>
                `).join("")
                : `<span class="context-service-empty">Not specified</span>`;
    }


    renderConversationServices(
        conversation?.services
    );

    updateConversationStatus(
        conversation?.status
    );


    const adminMessages =
        document.getElementById(
            "admin-messages"
        );

    if (!adminMessages) {
        return;
    }

    if (!messages.length) {

        adminMessages.innerHTML = `
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
            .map(message => {

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

            })
            .join("");

    adminMessages.scrollTop =
        adminMessages.scrollHeight;

}


export function showMessageError(
    message
) {

    const error =
        document.getElementById(
            "admin-message-error"
        );

    if (!error) {
        return;
    }

    error.textContent =
        message;

    error.hidden =
        false;

}


export function hideMessageError() {

    const error =
        document.getElementById(
            "admin-message-error"
        );

    if (!error) {
        return;
    }

    error.textContent = "";

    error.hidden = true;

}


export function updateCharacterCount() {

    const input =
        document.getElementById(
            "admin-message-input"
        );

    const counter =
        document.getElementById(
            "character-count"
        );

    if (
        !input ||
        !counter
    ) {
        return;
    }

    const current =
        input.value.length;

    const maximum =
        Number(
            input.maxLength
        ) || 5000;

    counter.textContent =
        `${current} / ${maximum}`;

    counter.classList.toggle(
        "critical",
        current >= maximum * 0.9
    );

}


export function openConversationContext() {

    const context =
        document.querySelector(
            ".conversation-context"
        );

    const workspace =
        document.querySelector(
            ".conversation-workspace"
        );

    context?.classList.add(
        "is-open"
    );

    workspace?.classList.add(
        "context-open"
    );

}


export function closeConversationContextPanel() {

    const context =
        document.querySelector(
            ".conversation-context"
        );

    const workspace =
        document.querySelector(
            ".conversation-workspace"
        );

    context?.classList.remove(
        "is-open"
    );

    workspace?.classList.remove(
        "context-open"
    );

}



function setNotificationStatus(message = "", type = "") {
    const element = document.getElementById("email-notification-status");
    if (!element) return;
    element.textContent = message;
    element.className = `email-notification-status ${type}`.trim();
    element.hidden = !message;
}

function setNotificationButtonsDisabled(disabled) {
    document.querySelectorAll("[data-email-notification]").forEach(button => {
        button.disabled = disabled;
    });
}

async function sendNotification(type, custom = {}) {
    if (!state.currentConversationId) {
        setNotificationStatus("No conversation selected.", "error");
        return;
    }

    setNotificationButtonsDisabled(true);
    setNotificationStatus("Sending notification...", "working");

    try {
        const result = await api("/api/admin/email-notifications", {
            method: "POST",
            body: JSON.stringify({
                conversationId: state.currentConversationId,
                type,
                ...custom
            })
        });

        setNotificationStatus(
            type === "welcome"
                ? "Welcome notification sent."
                : type === "custom"
                    ? "Custom notification sent."
                    : "Reply notification sent.",
            "success"
        );

        await loadEmailNotificationHistory();
        return result;
    } catch (error) {
        setNotificationStatus(error.message || "Unable to send notification.", "error");
        throw error;
    } finally {
        setNotificationButtonsDisabled(false);
    }
}

async function loadEmailNotificationHistory() {
    const container = document.getElementById("email-notification-history");
    if (!container || !state.currentConversationId) return;

    try {
        const data = await api(`/api/admin/email-notifications/${encodeURIComponent(state.currentConversationId)}`);
        const items = Array.isArray(data.notifications) ? data.notifications : [];
        container.innerHTML = items.length
            ? items.slice(0, 8).map(item => `
                <div class="email-history-item">
                    <div>
                        <strong>${escapeHTML(String(item.type || "notification").toUpperCase())}</strong>
                        <span>${escapeHTML(item.subject || "Notification")}</span>
                    </div>
                    <span class="email-history-status ${escapeHTML(item.status || "")}">${escapeHTML(item.status || "unknown")}</span>
                </div>
            `).join("")
            : `<div class="email-history-empty">No email notifications sent yet.</div>`;
    } catch (error) {
        container.innerHTML = `<div class="email-history-empty">Notification history unavailable.</div>`;
    }
}

function openComposeNotification() {
    const modal = document.getElementById("compose-notification-modal");
    const recipient = document.getElementById("compose-notification-recipient");
    const subject = document.getElementById("compose-notification-subject");
    const message = document.getElementById("compose-notification-message");
    if (recipient) recipient.textContent = state.currentConversation?.email || "No client email";
    if (subject) subject.value = "";
    if (message) message.value = "";
    modal?.classList.add("is-open");
    modal?.setAttribute("aria-hidden", "false");
    subject?.focus();
}

function closeComposeNotification() {
    const modal = document.getElementById("compose-notification-modal");
    modal?.classList.remove("is-open");
    modal?.setAttribute("aria-hidden", "true");
}

export function initConversation() {

    const form =
        document.getElementById(
            "admin-message-form"
        );

    const input =
        document.getElementById(
            "admin-message-input"
        );

    const adminMessages =
        document.getElementById(
            "admin-messages"
        );

    document.getElementById("send-reply-notification")?.addEventListener("click", async () => {
        try { await sendNotification("reply"); } catch {}
    });

    document.getElementById("send-welcome-notification")?.addEventListener("click", async () => {
        try { await sendNotification("welcome"); } catch {}
    });

    document.getElementById("compose-notification")?.addEventListener("click", openComposeNotification);
    document.getElementById("close-compose-notification")?.addEventListener("click", closeComposeNotification);
    document.getElementById("cancel-compose-notification")?.addEventListener("click", closeComposeNotification);

    document.getElementById("compose-notification-modal")?.addEventListener("click", event => {
        if (event.target.id === "compose-notification-modal") closeComposeNotification();
    });

    document.getElementById("compose-notification-form")?.addEventListener("submit", async event => {
        event.preventDefault();
        const subject = document.getElementById("compose-notification-subject")?.value.trim() || "";
        const message = document.getElementById("compose-notification-message")?.value.trim() || "";
        const error = document.getElementById("compose-notification-error");
        if (error) { error.hidden = true; error.textContent = ""; }
        if (!subject || !message) {
            if (error) { error.textContent = "Subject and message are required."; error.hidden = false; }
            return;
        }
        const button = document.getElementById("send-custom-notification");
        if (button) { button.disabled = true; button.textContent = "Sending..."; }
        try {
            await sendNotification("custom", { subject, message });
            closeComposeNotification();
        } catch (sendError) {
            if (error) { error.textContent = sendError.message; error.hidden = false; }
        } finally {
            if (button) { button.disabled = false; button.textContent = "Send Notification →"; }
        }
    });


    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                hideMessageError();

                const message =
                    input
                        ? input.value.trim()
                        : "";

                if (
                    !state.currentConversationId
                ) {

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
                    [...state.selectedFiles];

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

                                body:
                                    JSON.stringify({
                                        conversationId:
                                            state.currentConversationId,

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
                        state.currentConversationId;

                    if (
                        filesBeingSent.length &&
                        !messageId
                    ) {

                        throw new Error(
                            "Your reply was sent, but the server did not return the message ID needed for file uploads."
                        );

                    }

                    if (input) {
                        input.value = "";
                    }

                    updateCharacterCount();

                    const failed = [];

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

                        } catch (error) {

                            console.error(
                                `Admin file upload failed: ${file.name}`,
                                error
                            );

                            failed.push(file);

                        }

                    }

                    clearSelectedFiles();

                    await loadConversation(
                        state.currentConversationId,
                        {
                            silent: false,
                            forceRender: true
                        }
                    );

                    await loadNotificationsHandler?.();

                    if (failed.length) {

                        showMessageError(
                            `Your reply was sent, but these files could not be uploaded: ${
                                failed
                                    .map(file => file.name)
                                    .join(", ")
                            }`
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


    input?.addEventListener(
        "input",
        updateCharacterCount
    );


    adminMessages?.addEventListener(
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


    document.addEventListener(
        "visibilitychange",
        () => {

            const dashboard =
                document.getElementById(
                    "admin-dashboard"
                );

            if (
                !document.hidden &&
                state.currentConversationId &&
                dashboard &&
                !dashboard.hidden
            ) {

                loadConversation(
                    state.currentConversationId,
                    {
                        silent: true,
                        forceRender: true
                    }
                );

            }

        }
    );


    const contextToggle =
        document.getElementById(
            "conversation-context-toggle"
        );

    contextToggle?.addEventListener(
        "click",
        () => {

            const context =
                document.querySelector(
                    ".conversation-context"
                );

            if (
                context?.classList.contains(
                    "is-open"
                )
            ) {

                closeConversationContextPanel();

            } else {

                openConversationContext();

            }

        }
    );


    document
        .getElementById(
            "close-conversation-context"
        )
        ?.addEventListener(
            "click",
            closeConversationContextPanel
        );


    document
        .getElementById(
            "back-to-clients"
        )
        ?.addEventListener(
            "click",
            () => {

                state.currentConversationId =
                    null;

                state.lastConversationSignature =
                    "";

                clearSelectedFiles();

                stopConversationPolling();

                closeConversationContextPanel();

                switchViewHandler?.(
                    "clients"
                );

            }
        );


    renderSelectedFiles();

    updateCharacterCount();

}