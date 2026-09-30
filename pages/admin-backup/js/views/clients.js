import {
    api
} from "../core/api.js";

import state, {
    setClients
} from "../core/state.js";

import {
    escapeHTML,
    formatRelativeTime,
    getInitials
} from "../core/utils.js";


let openConversationHandler = null;
let updateStatsHandler = null;


export function configureClients({
    openConversation,
    updateStats
} = {}) {

    openConversationHandler =
        openConversation || null;

    updateStatsHandler =
        updateStats || null;

}


export async function loadClients() {

    const clientsList =
        document.getElementById(
            "clients-list"
        );

    const recentClients =
        document.getElementById(
            "recent-clients"
        );

    try {

        const data =
            await api(
                "/api/admin/clients"
            );

        setClients(
            Array.isArray(data.clients)
                ? data.clients
                : []
        );

        renderClients();
        renderRecentClients();

        updateStatsHandler?.();

    } catch (error) {

        console.error(
            "Client loading error:",
            error
        );

        if (clientsList) {

            clientsList.innerHTML = `
                <div class="clients-empty">
                    <div class="clients-empty-mark">!</div>

                    <strong class="clients-empty-title">
                        CLIENT DATA UNAVAILABLE
                    </strong>

                    <p class="clients-empty-description">
                        ${escapeHTML(error.message)}
                    </p>
                </div>
            `;

        }

        if (recentClients) {

            recentClients.innerHTML = `
                <div class="empty-state error-state">
                    ${escapeHTML(error.message)}
                </div>
            `;

        }

    }

}


export function getFilteredClients() {

    const clientSearch =
        document.getElementById(
            "client-search"
        );

    const searchTerm =
        clientSearch
            ? clientSearch.value
                .trim()
                .toLowerCase()
            : "";

    return state.clients.filter(
        client => {

            if (
                state.activeClientFilter ===
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
                state.activeClientFilter ===
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

            const searchable = [
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


function getClientStatusClass(client) {

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


function getClientStatusLabel(client) {

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


export function renderRecentClients() {

    const recentClients =
        document.getElementById(
            "recent-clients"
        );

    if (!recentClients) {
        return;
    }

    if (!state.clients.length) {

        recentClients.innerHTML = `
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
        state.clients
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
                                getInitials(client.name)
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
                        openConversationHandler?.(id);
                    }

                }
            );

        });

}


export function renderClients() {

    const clientsList =
        document.getElementById(
            "clients-list"
        );

    if (!clientsList) {
        return;
    }

    const filtered =
        getFilteredClients();

    if (!filtered.length) {

        clientsList.innerHTML = `
            <div class="clients-empty">
                <div class="clients-empty-mark">⌕</div>

                <strong class="clients-empty-title">
                    NO MATCHING CLIENTS
                </strong>

                <p class="clients-empty-description">
                    No investigation records match the current filters.
                </p>
            </div>
        `;

        updateClientSummary(filtered);

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

                const statusClass =
                    getClientStatusClass(client);

                const statusLabel =
                    getClientStatusLabel(client);

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
                                    getInitials(client.name)
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

                        <div class="client-status ${statusClass}">
                            ${statusLabel}

                            ${
                                unread
                                    ? `<small>${unread} UNREAD</small>`
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
                                client.name || "client"
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

                    if (conversationId) {
                        openConversationHandler?.(
                            conversationId
                        );
                    }

                }
            );

        });

    updateClientSummary(filtered);

}


function updateClientSummary(filteredClients) {

    const summaryValue =
        document.querySelector(
            ".clients-summary-value"
        );

    if (summaryValue) {
        summaryValue.textContent =
            filteredClients.length;
    }

}


export function initClients() {

    const clientSearch =
        document.getElementById(
            "client-search"
        );

    if (clientSearch) {

        clientSearch.addEventListener(
            "input",
            renderClients
        );

    }

    document
        .querySelectorAll(
            ".client-filter"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.activeClientFilter =
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


    const refreshClients =
        document.getElementById(
            "refresh-clients"
        );

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

}