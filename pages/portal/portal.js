const API_URL =
    "https://revenue-leak-hunter-api.preciousosason.workers.dev";


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const sessionToken =
            sessionStorage.getItem(
                "portalSessionToken"
            );


        const clientName =
            document.getElementById(
                "client-name"
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

        const investigationStatus =
            document.getElementById(
                "investigation-status"
            );

        const errorElement =
            document.getElementById(
                "portal-error"
            );

        const logoutButton =
            document.getElementById(
                "portal-logout"
            );

        const messagesContainer =
            document.getElementById(
                "messages-container"
            );

        const messageForm =
            document.getElementById(
                "message-form"
            );

        const messageInput =
            document.getElementById(
                "message-input"
            );

        const sendButton =
            document.getElementById(
                "send-message"
            );


        /* =================================
           MESSAGE POLLING
        ================================== */

        let pollingInterval = null;

        let lastMessageId = null;

        let lastMessageCount = 0;


        /* =================================
           AUTHENTICATION
        ================================== */

        if (!sessionToken) {

            window.location.href =
                "/pages/contact/contact.html";

            return;

        }


        /* =================================
           ESCAPE HTML
        ================================== */

        function escapeHTML(value) {

            const div =
                document.createElement(
                    "div"
                );

            div.textContent =
                value || "";

            return div.innerHTML;

        }


        /* =================================
           CLICKABLE LINKS + EMAILS
        ================================== */

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


                        /*
                         * Keep normal sentence
                         * punctuation outside links.
                         */

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


                        /*
                         * EMAIL
                         */

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


                        /*
                         * WEBSITE URL
                         */

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


        /* =================================
           FORMAT DATE
        ================================== */

        function formatMessageDate(
            value
        ) {

            if (!value) {
                return "";
            }


            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return "";

            }


            return date.toLocaleString(
                undefined,
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

        }


        /* =================================
           LOAD CLIENT
        ================================== */

        async function loadClient() {

            const response =
                await fetch(
                    `${API_URL}/api/portal/me`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${sessionToken}`
                        }
                    }
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.error ||
                    "Your session is no longer valid."
                );

            }


            const client =
                result.client;


            if (clientName) {

                clientName.textContent =
                    client.name || "Client";

            }


            if (clientInfoName) {

                clientInfoName.textContent =
                    client.name || "—";

            }


            if (clientInfoEmail) {

                clientInfoEmail.textContent =
                    client.email || "—";

            }


            if (clientInfoBusiness) {

                clientInfoBusiness.textContent =
                    client.business || "—";

            }


            if (clientInfoWebsite) {

                clientInfoWebsite.textContent =
                    client.website || "—";

            }

        }


        /* =================================
           RENDER MESSAGES
        ================================== */

        function renderMessages(
            messages,
            shouldScroll = true
        ) {

            if (!messagesContainer) {
                return;
            }


            if (!messages.length) {

                messagesContainer.innerHTML = `
                    <div class="messages-empty">

                        <h3>
                            No messages yet.
                        </h3>

                        <p>
                            Your conversation will appear
                            here as your Leak Hunt progresses.
                        </p>

                    </div>
                `;

                return;

            }


            messagesContainer.innerHTML =
                messages.map(
                    message => {

                        const isClient =
                            message.sender_type ===
                            "client";


                        return `
                            <article
                                class="message
                                ${isClient
                                    ? "message-client"
                                    : "message-you"}"
                            >

                                <div class="message-meta">

                                    <strong>
                                        ${
                                            isClient
                                                ? "You"
                                                : "Revenue Leak Hunter"
                                        }
                                    </strong>

                                    <time>
                                        ${
                                            escapeHTML(
                                                formatMessageDate(
                                                    message.created_at
                                                )
                                            )
                                        }
                                    </time>

                                </div>


                                <div class="message-body">
                                    ${linkifyMessage(
                                        message.message
                                    )}
                                </div>

                            </article>
                        `;

                    }
                ).join("");


            if (shouldScroll) {

                messagesContainer.scrollTop =
                    messagesContainer.scrollHeight;

            }

        }


        /* =================================
           LOAD MESSAGES
        ================================== */

        async function loadMessages(
            options = {}
        ) {

            const {
                silent = false,
                forceRender = false
            } = options;


            if (!messagesContainer) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/portal/messages`,
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    `Bearer ${sessionToken}`
                            }
                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.error ||
                        "Unable to load conversation."
                    );

                }


                if (
                    investigationStatus &&
                    result.conversation
                ) {

                    investigationStatus.textContent =
                        result.conversation.status
                            .toUpperCase();

                }


                const messages =
                    result.messages || [];


                const newestMessage =
                    messages.length
                        ? messages[messages.length - 1]
                        : null;


                const newestMessageId =
                    newestMessage
                        ? newestMessage.id
                        : null;


                const messagesChanged =
                    newestMessageId !==
                        lastMessageId ||
                    messages.length !==
                        lastMessageCount;


                /*
                 * Only redraw the conversation
                 * when something actually changed.
                 */

                if (
                    forceRender ||
                    messagesChanged
                ) {

                    renderMessages(
                        messages,
                        true
                    );


                    lastMessageId =
                        newestMessageId;


                    lastMessageCount =
                        messages.length;

                }


            } catch (error) {

                console.error(
                    "Message loading error:",
                    error
                );


                /*
                 * Don't replace the existing
                 * conversation with an error
                 * during silent polling.
                 */

                if (!silent) {

                    messagesContainer.innerHTML = `
                        <div class="messages-empty">

                            <h3>
                                Unable to load conversation.
                            </h3>

                            <p>
                                Please refresh the page and try again.
                            </p>

                        </div>
                    `;

                }

            }

        }


        /* =================================
           START MESSAGE POLLING
        ================================== */

        function startMessagePolling() {

            if (pollingInterval) {
                return;
            }


            pollingInterval =
                setInterval(
                    () => {

                        if (
                            document.hidden
                        ) {

                            return;

                        }


                        loadMessages({
                            silent: true
                        });

                    },
                    2000
                );

        }


        /* =================================
           STOP MESSAGE POLLING
        ================================== */

        function stopMessagePolling() {

            if (!pollingInterval) {
                return;
            }


            clearInterval(
                pollingInterval
            );


            pollingInterval =
                null;

        }


        /* =================================
           VISIBILITY CONTROL
        ================================== */

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden
                ) {

                    stopMessagePolling();

                    return;

                }


                /*
                 * Immediately check for a new
                 * message when the client returns
                 * to the portal.
                 */

                loadMessages({
                    silent: true,
                    forceRender: true
                });


                startMessagePolling();

            }
        );


        /* =================================
           SEND MESSAGE
        ================================== */

        if (messageForm) {

            messageForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    const message =
                        messageInput
                            ? messageInput.value.trim()
                            : "";


                    if (!message) {
                        return;
                    }


                    const originalButtonText =
                        sendButton
                            ? sendButton.textContent
                            : "";


                    try {

                        if (sendButton) {

                            sendButton.disabled =
                                true;

                            sendButton.textContent =
                                "Sending...";

                        }


                        const response =
                            await fetch(
                                `${API_URL}/api/portal/messages`,
                                {
                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json",

                                        "Authorization":
                                            `Bearer ${sessionToken}`
                                    },

                                    body:
                                        JSON.stringify({
                                            message
                                        })
                                }
                            );


                        const result =
                            await response.json();


                        if (
                            !response.ok ||
                            !result.success
                        ) {

                            throw new Error(
                                result.error ||
                                "Unable to send your message."
                            );

                        }


                        if (messageInput) {

                            messageInput.value =
                                "";

                        }


                        /*
                         * Immediately reload after
                         * sending instead of waiting
                         * for the next 2-second poll.
                         */

                        await loadMessages({
                            forceRender: true
                        });


                    } catch (error) {

                        console.error(
                            "Send message error:",
                            error
                        );


                        if (errorElement) {

                            errorElement.textContent =
                                error.message;

                            errorElement.hidden =
                                false;

                        }

                    } finally {

                        if (sendButton) {

                            sendButton.disabled =
                                false;

                            sendButton.textContent =
                                originalButtonText;

                        }

                    }

                }
            );

        }


        /* =================================
           LOGOUT
        ================================== */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    /*
                     * Stop polling before logging out.
                     */

                    stopMessagePolling();


                    logoutButton.disabled =
                        true;

                    logoutButton.textContent =
                        "Logging out...";


                    try {

                        await fetch(
                            `${API_URL}/api/portal/logout`,
                            {
                                method: "POST",

                                headers: {
                                    "Authorization":
                                        `Bearer ${sessionToken}`
                                }
                            }
                        );

                    } catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                    }


                    sessionStorage.removeItem(
                        "portalSessionToken"
                    );

                    sessionStorage.removeItem(
                        "portalClient"
                    );


                    window.location.href =
                        "/";

                }
            );

        }


        /* =================================
           INITIAL LOAD
        ================================== */

        try {

            await loadClient();

            await loadMessages({
                forceRender: true
            });


            /*
             * Start checking for new messages
             * every 2 seconds.
             */

            startMessagePolling();


        } catch (error) {

            console.error(
                "Portal initialization error:",
                error
            );


            stopMessagePolling();


            sessionStorage.removeItem(
                "portalSessionToken"
            );

            sessionStorage.removeItem(
                "portalClient"
            );


            window.location.href =
                "/pages/contact/contact.html";

        }

    }
);