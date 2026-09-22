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

        const messageFilesInput =
            document.getElementById(
                "message-files"
            );

        const fileSelection =
            document.getElementById(
                "file-selection"
            );

        const selectedFilesContainer =
            document.getElementById(
                "selected-files"
            );


        /* =================================
           FILE CONFIGURATION
        ================================== */

        const MAX_FILES =
            5;

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


        /* =================================
           MESSAGE POLLING
        ================================== */

        let pollingInterval =
            null;

        let lastConversationSignature =
            "";


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
           FORMAT FILE SIZE
        ================================== */

        function formatFileSize(
            bytes
        ) {

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


        /* =================================
           FILE CATEGORY
        ================================== */

        function getFileLabel(
            file
        ) {

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
           RENDER ATTACHMENTS
        ================================== */

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


                                ${renderMessageFiles(
                                    message.files
                                )}

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
           CONVERSATION SIGNATURE
        ================================== */

        function getConversationSignature(
            messages
        ) {

            return messages
                .map(
                    message => {

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

                    }
                )
                .join("|");

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


                const conversationSignature =
                    getConversationSignature(
                        messages
                    );


                const messagesChanged =
                    conversationSignature !==
                    lastConversationSignature;


                /*
                 * Redraw when:
                 *
                 * 1. The caller explicitly requests it.
                 * 2. A new message appears.
                 * 3. An existing message gains
                 *    or loses an attachment.
                 */

                if (
                    forceRender ||
                    messagesChanged
                ) {

                    renderMessages(
                        messages,
                        true
                    );


                    lastConversationSignature =
                        conversationSignature;

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
        ================================= */

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden
                ) {

                    stopMessagePolling();

                    return;

                }


                loadMessages({
                    silent: true,
                    forceRender: true
                });


                startMessagePolling();

            }
        );


        /* =================================
           SHOW PORTAL ERROR
        ================================== */

        function showError(
            message
        ) {

            if (!errorElement) {
                return;
            }


            errorElement.textContent =
                message;


            errorElement.hidden =
                false;

        }


        /* =================================
           HIDE PORTAL ERROR
        ================================== */

        function hideError() {

            if (!errorElement) {
                return;
            }


            errorElement.textContent =
                "";


            errorElement.hidden =
                true;

        }


        /* =================================
           VALIDATE FILE
        ================================== */

        function validateFile(
            file
        ) {

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


            const name =
                String(
                    file.name || ""
                );


            const extension =
                name
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


            /*
             * Some browsers provide an empty MIME
             * type for files selected from the device.
             * Extension validation still handles these.
             */

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


        /* =================================
           FILE CHIP RENDERING
        ================================== */

        function renderSelectedFiles() {

            if (!selectedFilesContainer) {
                return;
            }


            selectedFilesContainer.innerHTML =
                selectedFiles.map(
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
                ).join("");


            if (fileSelection) {

                if (!selectedFiles.length) {

                    fileSelection.textContent =
                        "No files selected";

                } else {

                    fileSelection.textContent =
                        `${selectedFiles.length} ${
                            selectedFiles.length === 1
                                ? "file"
                                : "files"
                        } selected`;

                }

            }

        }


        /* =================================
           HANDLE FILE SELECTION
        ================================== */

        function handleFileSelection(
            files
        ) {

            hideError();


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

                showError(
                    "You can attach a maximum of 5 files to one message."
                );


                if (messageFilesInput) {
                    messageFilesInput.value =
                        "";
                }


                return;

            }


            const filesToAdd =
                incomingFiles.slice(
                    0,
                    availableSlots
                );


            const rejected =
                [];


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

                showError(
                    rejected.join(" ")
                );

            }


            renderSelectedFiles();


            /*
             * Reset the native input so the same
             * file can be selected again later.
             */

            if (messageFilesInput) {

                messageFilesInput.value =
                    "";

            }

        }


        /* =================================
           REMOVE SELECTED FILE
        ================================== */

        function removeSelectedFile(
            index
        ) {

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


        /* =================================
           FILE INPUT
        ================================== */

        if (messageFilesInput) {

            messageFilesInput.addEventListener(
                "change",
                event => {

                    handleFileSelection(
                        event.target.files
                    );

                }
            );

        }


        /* =================================
           SELECTED FILE REMOVE BUTTONS
        ================================== */

        if (selectedFilesContainer) {

            selectedFilesContainer.addEventListener(
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


        /* =================================
           UPLOAD ONE FILE
        ================================== */

        async function uploadFile(
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
                    `${API_URL}/api/portal/files`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${sessionToken}`
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


        /* =================================
           UPLOAD SELECTED FILES
        ================================== */

        async function uploadSelectedFiles(
            conversationId,
            messageId
        ) {

            if (!selectedFiles.length) {

                return {
                    successful: [],
                    failed: []
                };

            }


            const filesToUpload =
                [...selectedFiles];


            const successful = [];
            const failed = [];


            for (
                const file
                of filesToUpload
            ) {

                try {

                    await uploadFile(
                        file,
                        conversationId,
                        messageId
                    );


                    successful.push(
                        file
                    );


                } catch (error) {

                    console.error(
                        `File upload failed: ${file.name}`,
                        error
                    );


                    failed.push({
                        file,
                        error
                    });

                }

            }


            return {
                successful,
                failed
            };

        }


        /* =================================
           DOWNLOAD ATTACHMENT
        ================================== */

        async function downloadFile(
            fileId,
            fileName,
            button
        ) {

            if (
                !fileId
            ) {

                return;

            }


            const originalButtonContent =
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
                        `${API_URL}/api/portal/files/${encodeURIComponent(
                            fileId
                        )}`,
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    `Bearer ${sessionToken}`
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
                        /*
                         * Response wasn't JSON.
                         */
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


                /*
                 * Give the browser a moment to
                 * consume the object URL.
                 */

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
                    "File download error:",
                    error
                );


                showError(
                    error.message ||
                    "Unable to download file."
                );


            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.innerHTML =
                        originalButtonContent;

                }

            }

        }


        /* =================================
           ATTACHMENT DOWNLOAD DELEGATION
        ================================== */

        if (messagesContainer) {

            messagesContainer.addEventListener(
                "click",
                event => {

                    const button =
                        event.target.closest(
                            ".message-file-download"
                        );


                    if (!button) {
                        return;
                    }


                    const fileId =
                        button.dataset.fileId;


                    const fileName =
                        button.dataset.fileName ||
                        "download";


                    downloadFile(
                        fileId,
                        fileName,
                        button
                    );

                }
            );

        }


        /* =================================
           SEND MESSAGE
        ================================== */

        if (messageForm) {

            messageForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    hideError();


                    const message =
                        messageInput
                            ? messageInput.value.trim()
                            : "";


                    /*
                     * The message remains required.
                     *
                     * If the client wants to send
                     * only a file, they can simply
                     * write something like:
                     *
                     * "See attached."
                     */

                    if (!message) {

                        showError(
                            "Please write a message before sending."
                        );


                        if (messageInput) {

                            messageInput.focus();

                        }


                        return;

                    }


                    const originalButtonHTML =
                        sendButton
                            ? sendButton.innerHTML
                            : "";


                    const filesBeingSent =
                        [...selectedFiles];


                    try {

                        if (sendButton) {

                            sendButton.disabled =
                                true;

                            sendButton.innerHTML =
                                `
                                    <span>
                                        Sending...
                                    </span>
                                `;

                        }


                        /*
                         * STEP 1
                         *
                         * Create the message first.
                         *
                         * The backend returns the
                         * message ID needed by the
                         * file upload endpoint.
                         */

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


                        const messageId =
                            result.message?.id;


                        const conversationId =
                            result.message?.conversation_id ||
                            result.conversation?.id;


                        if (
                            filesBeingSent.length &&
                            (
                                !messageId ||
                                !conversationId
                            )
                        ) {

                            throw new Error(
                                "Message was sent, but the conversation information needed for file uploads was not returned."
                            );

                        }


                        /*
                         * Clear the text immediately
                         * after the message succeeds.
                         */

                        if (messageInput) {

                            messageInput.value =
                                "";

                        }


                        /*
                         * STEP 2
                         *
                         * Upload selected attachments
                         * to the newly-created message.
                         */

                        let uploadResults = {
                            successful: [],
                            failed: []
                        };


                        if (
                            filesBeingSent.length
                        ) {

                            if (sendButton) {

                                sendButton.innerHTML =
                                    `
                                        <span>
                                            Uploading 0/${filesBeingSent.length}...
                                        </span>
                                    `;

                            }


                            /*
                             * Upload sequentially so the
                             * request remains lightweight
                             * for the browser and backend.
                             */

                            for (
                                let index = 0;
                                index <
                                filesBeingSent.length;
                                index++
                            ) {

                                const file =
                                    filesBeingSent[
                                        index
                                    ];


                                if (sendButton) {

                                    sendButton.innerHTML =
                                        `
                                            <span>
                                                Uploading ${
                                                    index + 1
                                                }/${filesBeingSent.length}...
                                            </span>
                                        `;

                                }


                                try {

                                    await uploadFile(
                                        file,
                                        conversationId,
                                        messageId
                                    );


                                    uploadResults.successful.push(
                                        file
                                    );


                                } catch (error) {

                                    console.error(
                                        `File upload failed: ${file.name}`,
                                        error
                                    );


                                    uploadResults.failed.push({
                                        file,
                                        error
                                    });

                                }

                            }

                        }


                        /*
                         * Clear selected files only after
                         * the upload attempt is complete.
                         */

                        selectedFiles =
                            [];


                        renderSelectedFiles();


                        /*
                         * STEP 3
                         *
                         * Refresh the conversation so
                         * the new message and attachments
                         * appear immediately.
                         */

                        await loadMessages({
                            forceRender: true
                        });


                        /*
                         * Tell the client if the message
                         * succeeded but one or more files
                         * failed.
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


                            showError(
                                `Your message was sent, but these files could not be uploaded: ${failedNames}`
                            );

                        }


                    } catch (error) {

                        console.error(
                            "Send message error:",
                            error
                        );


                        /*
                         * Do NOT clear selected files if
                         * the message itself failed.
                         *
                         * The user can retry instead of
                         * having to select everything again.
                         */

                        showError(
                            error.message ||
                            "Unable to send your message."
                        );

                    } finally {

                        if (sendButton) {

                            sendButton.disabled =
                                false;

                            sendButton.innerHTML =
                                originalButtonHTML;

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
           INITIAL FILE UI
        ================================== */

        renderSelectedFiles();


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
             * and attachment changes every
             * 2 seconds.
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