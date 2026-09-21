const API_URL = "https://revenue-leak-hunter-api.preciousosason.workers.dev";


document.addEventListener("DOMContentLoaded", () => {

    /* =================================
       CONTACT FORM
    ================================== */

    const form =
        document.getElementById("leak-hunt-form");

    const success =
        document.getElementById("form-success");


    /* =================================
       SUCCESS STATE
    ================================== */

    const generatedToken =
        document.getElementById("generated-portal-token");

    const copyTokenButton =
        document.getElementById("copy-portal-token");

    const enterCreatedPortal =
        document.getElementById("enter-created-portal");


    /* =================================
       PRIVATE PORTAL MODAL
    ================================== */

    const openPortalButton =
        document.getElementById("open-portal-login");

    const closePortalButton =
        document.getElementById("close-portal-login");

    const portalModal =
        document.getElementById("portal-login-modal");

    const portalBackdrop =
        document.getElementById("portal-modal-backdrop");

    const portalLoginForm =
        document.getElementById("portal-login-form");

    const portalTokenInput =
        document.getElementById("portal-token");

    const portalLoginMessage =
        document.getElementById("portal-login-message");


    /* =================================
       FORM STATUS
    ================================== */

    function showFormError(message) {

        let errorElement =
            document.getElementById("contact-form-error");


        if (!errorElement) {

            errorElement =
                document.createElement("p");

            errorElement.id =
                "contact-form-error";

            errorElement.className =
                "contact-form-error";

            form.insertBefore(
                errorElement,
                form.querySelector("button[type='submit']") ||
                form.lastElementChild
            );

        }


        errorElement.textContent =
            message;

        errorElement.hidden =
            false;

    }


    function clearFormError() {

        const errorElement =
            document.getElementById("contact-form-error");


        if (errorElement) {

            errorElement.hidden =
                true;

            errorElement.textContent =
                "";

        }

    }


    /* =================================
       OPEN PORTAL MODAL
    ================================== */

    function openPortalModal() {

        if (!portalModal) {
            return;
        }


        portalModal.classList.add(
            "is-visible"
        );

        portalModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "portal-modal-open"
        );


        setTimeout(() => {

            if (portalTokenInput) {

                portalTokenInput.focus();

            }

        }, 150);

    }


    /* =================================
       CLOSE PORTAL MODAL
    ================================== */

    function closePortalModal() {

        if (!portalModal) {
            return;
        }


        portalModal.classList.remove(
            "is-visible"
        );

        portalModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "portal-modal-open"
        );


        if (portalLoginMessage) {

            portalLoginMessage.hidden =
                true;

            portalLoginMessage.textContent =
                "";

        }

    }


    /* =================================
       OPEN EXISTING PORTAL
    ================================== */

    if (openPortalButton) {

        openPortalButton.addEventListener(
            "click",
            openPortalModal
        );

    }


    /* =================================
       CLOSE PORTAL
    ================================== */

    if (closePortalButton) {

        closePortalButton.addEventListener(
            "click",
            closePortalModal
        );

    }


    if (portalBackdrop) {

        portalBackdrop.addEventListener(
            "click",
            closePortalModal
        );

    }


    /* =================================
       ESCAPE KEY
    ================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                portalModal &&
                portalModal.classList.contains(
                    "is-visible"
                )
            ) {

                closePortalModal();

            }

        }
    );


    /* =================================
       TOKEN FORMATTING
    ================================== */

    if (portalTokenInput) {

        portalTokenInput.addEventListener(
            "input",
            () => {

                let value =
                    portalTokenInput.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "");


                /*
                 * Remove LH if the user
                 * types it manually.
                 */

                if (value.startsWith("LH")) {

                    value =
                        value.substring(2);

                }


                /*
                 * Token contains 16 characters
                 * after the LH prefix.
                 */

                value =
                    value.substring(0, 16);


                const groups =
                    value.match(/.{1,4}/g) || [];


                portalTokenInput.value =
                    "LH-" + groups.join("-");

            }
        );

    }


    /* =================================
       PORTAL LOGIN
       
       PHASE 2
       
       The backend authentication endpoint
       will be connected here after Phase 1
       contact submission is confirmed.
    ================================== */

    if (portalLoginForm) {

        portalLoginForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                if (!portalTokenInput) {
                    return;
                }


                const token =
                    portalTokenInput.value
                        .trim()
                        .toUpperCase();


                if (
                    !/^LH-[A-Z0-9]{4}(?:-[A-Z0-9]{4}){3}$/.test(token)
                ) {

                    if (portalLoginMessage) {

                        portalLoginMessage.textContent =
                            "Enter a valid private access token.";

                        portalLoginMessage.hidden =
                            false;

                    }

                    return;

                }


                /*
                 * Phase 2:
                 *
                 * POST /api/portal/login
                 *
                 * This will be implemented after
                 * Phase 1 is tested successfully.
                 */

                if (portalLoginMessage) {

                    portalLoginMessage.textContent =
                        "Portal authentication is being connected.";

                    portalLoginMessage.hidden =
                        false;

                }

            }
        );

    }


    /* =================================
       CONTACT FORM
       
       CONNECTED TO CLOUDFLARE WORKER
    ================================== */

    if (form && success) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                clearFormError();


                const submitButton =
                    form.querySelector(
                        "button[type='submit']"
                    );


                const originalButtonHTML =
                    submitButton
                        ? submitButton.innerHTML
                        : "";


                /*
                 * Collect all form fields.
                 */

                const formData =
                    new FormData(form);


                const data = {

                    name:
                        String(
                            formData.get("name") || ""
                        ).trim(),

                    email:
                        String(
                            formData.get("email") || ""
                        ).trim(),

                    business:
                        String(
                            formData.get("business") || ""
                        ).trim(),

                    website:
                        String(
                            formData.get("website") || ""
                        ).trim(),

                    offer:
                        String(
                            formData.get("offer") || ""
                        ).trim(),

                    problem:
                        String(
                            formData.get("problem") || ""
                        ).trim(),

                    message:
                        String(
                            formData.get("message") || ""
                        ).trim()

                };


                /*
                 * Basic frontend validation.
                 */

                if (!data.name) {

                    showFormError(
                        "Please enter your name."
                    );

                    return;

                }


                if (!data.email) {

                    showFormError(
                        "Please enter your email address."
                    );

                    return;

                }


                if (!data.offer) {

                    showFormError(
                        "Please describe what you sell."
                    );

                    return;

                }


                if (!data.problem) {

                    showFormError(
                        "Please select where you think the leak is."
                    );

                    return;

                }


                /*
                 * Make sure the Worker URL
                 * has been configured.
                 */

                if (
                    !API_URL ||
                    API_URL.includes(
                        "PASTE_YOUR_WORKER_URL_HERE"
                    )
                ) {

                    showFormError(
                        "The contact system is not configured yet."
                    );

                    console.error(
                        "API_URL has not been configured."
                    );

                    return;

                }


                /*
                 * Loading state.
                 */

                if (submitButton) {

                    submitButton.disabled =
                        true;

                    submitButton.innerHTML =
                        "<span>Creating Private Portal...</span>";

                }


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/contact`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );


                    let result;

                    try {

                        result =
                            await response.json();

                    } catch {

                        throw new Error(
                            "The server returned an invalid response."
                        );

                    }


                    /*
                     * Backend validation error.
                     */

                    if (
                        response.status === 422 &&
                        result.errors
                    ) {

                        const firstError =
                            Object.values(
                                result.errors
                            )[0];


                        showFormError(
                            firstError ||
                            "Please check your information and try again."
                        );

                        return;

                    }


                    /*
                     * Existing email.
                     */

                    if (response.status === 409) {

                        showFormError(
                            result.error ||
                            "A portal already exists for this email address."
                        );

                        return;

                    }


                    /*
                     * Other backend errors.
                     */

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        throw new Error(
                            result.error ||
                            "Something went wrong while creating your portal."
                        );

                    }


                    /*
                     * The backend generated the
                     * real secure token.
                     */

                    const token =
                        result.portalToken;


                    if (!token) {

                        throw new Error(
                            "The portal was created, but no access token was returned."
                        );

                    }


                    if (generatedToken) {

                        generatedToken.textContent =
                            token;

                    }


                    /*
                     * Hide form and display
                     * success state.
                     */

                    form.hidden =
                        true;

                    success.hidden =
                        false;


                    success.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });


                } catch (error) {

                    console.error(
                        "Contact submission failed:",
                        error
                    );


                    showFormError(
                        error.message ||
                        "Unable to submit your request right now. Please try again."
                    );


                } finally {

                    /*
                     * Restore submit button.
                     */

                    if (submitButton) {

                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalButtonHTML;

                    }

                }

            }
        );

    }


    /* =================================
       COPY TOKEN
    ================================== */

    if (copyTokenButton) {

        copyTokenButton.addEventListener(
            "click",
            async () => {

                if (!generatedToken) {
                    return;
                }


                const token =
                    generatedToken.textContent.trim();


                if (!token) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        token
                    );


                    const originalText =
                        copyTokenButton.textContent;


                    copyTokenButton.textContent =
                        "Copied ✓";


                    setTimeout(() => {

                        copyTokenButton.textContent =
                            originalText;

                    }, 1800);

                } catch (error) {

                    /*
                     * Clipboard fallback.
                     */

                    const temporaryInput =
                        document.createElement(
                            "input"
                        );


                    temporaryInput.value =
                        token;


                    document.body.appendChild(
                        temporaryInput
                    );


                    temporaryInput.select();


                    document.execCommand(
                        "copy"
                    );


                    temporaryInput.remove();


                    copyTokenButton.textContent =
                        "Copied ✓";


                    setTimeout(() => {

                        copyTokenButton.textContent =
                            "Copy Token";

                    }, 1800);

                }

            }
        );

    }


    /* =================================
       ENTER CREATED PORTAL
    ================================== */

    if (enterCreatedPortal) {

        enterCreatedPortal.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openPortalModal();

            }
        );

    }

});