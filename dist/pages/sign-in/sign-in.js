
/* ============================================================
   LEAKENDIA — AUTHENTICATION PAGE CONTROLLER
   File: pages/sign-in/sign-in.js
   Version: 1.0.0
============================================================ */

import Auth, {

    AuthError,
    sanitizeReturnPath

} from "/global/auth/auth-state.js";


/* ============================================================
   CONFIGURATION
============================================================ */

const CONFIG = Object.freeze({

    defaultReturnPath: "/pages/portal/portal.html",

    resendDelay: 60,

    defaultCodeLifetime: 600,

    successDelay: 1400,

    codeLength: 6

});


/* ============================================================
   AUTHENTICATION ERROR MESSAGES
============================================================ */

const ERROR_MESSAGES = Object.freeze({

    NETWORK_ERROR:
        "Unable to connect. Check your internet connection and try again.",

    REQUEST_TIMEOUT:
        "The request took too long. Please try again.",

    RATE_LIMITED:
        "Too many requests. Please wait before trying again.",

    INVALID_EMAIL:
        "Please enter a valid email address.",

    INVALID_CODE:
        "The verification code is incorrect. Please try again.",

    INVALID_VERIFICATION_CODE:
        "The verification code is incorrect. Please try again.",

    INVALID_CHALLENGE:
        "This verification request is no longer valid. Request a new code.",

    CHALLENGE_EXPIRED:
        "Your verification code has expired. Request a new one.",

    CODE_EXPIRED:
        "Your verification code has expired. Request a new one.",

    CHALLENGE_CONSUMED:
        "This verification code has already been used.",

    MAX_ATTEMPTS_EXCEEDED:
        "Too many incorrect attempts. Request a new verification code.",

    ACCOUNT_LINK_REQUIRED:
        "This email belongs to an existing account. Sign in using your original authentication method.",

    LEGACY_LINK_REQUIRED:
        "An existing Leakendia account uses this email. Contact support to securely connect your account.",

    ACCOUNT_SUSPENDED:
        "Your account is currently unavailable. Contact Leakendia for assistance.",

    GOOGLE_AUTH_CANCELLED:
        "Google sign-in was cancelled. You can try again or continue with email.",

    GOOGLE_CONNECTION_FAILED:
        "Google authentication is temporarily unavailable. Please try again.",

    GOOGLE_TOKEN_EXCHANGE_FAILED:
        "Google authentication could not be completed. Please try again.",

    INVALID_OAUTH_STATE:
        "Your authentication request expired. Please start again.",

    INVALID_GOOGLE_IDENTITY:
        "Your Google identity could not be verified. Please try again.",

    GOOGLE_EMAIL_NOT_VERIFIED:
        "Google has not verified this email address.",

    GOOGLE_EMAIL_VERIFICATION_REQUIRED:
        "Please use email verification to authenticate this address.",

    SESSION_NOT_ESTABLISHED:
        "Your session could not be established. Please try signing in again.",

    GOOGLE_NOT_CONFIGURED:
        "Google sign-in is temporarily unavailable. Continue with email.",

    AUTHENTICATION_REQUIRED:
        "Please sign in to continue."

});


/* ============================================================
   DOM REFERENCES
============================================================ */

const $ = id => document.getElementById(id);

const elements = {

    panels: {

        loading: $("session-check-panel"),

        signIn: $("sign-in-panel"),

        verification: $("verification-panel"),

        success: $("success-panel"),

        connectionError: $("connection-error-panel")

    },

    googleButton: $("google-sign-in"),

    emailForm: $("email-sign-in-form"),

    emailInput: $("auth-email"),

    requestButton: $("request-code-button"),

    verificationForm: $("verification-form"),

    codeInput: $("verification-code"),

    verifyButton: $("verify-code-button"),

    verificationEmail: $("verification-email"),

    changeEmailButton: $("change-email-button"),

    resendButton: $("resend-code-button"),

    resendCountdown: $("resend-countdown"),

    expiryCountdown: $("expiry-countdown"),

    verificationTimer: $("verification-timer"),

    continueButton: $("continue-button"),

    retryButton: $("retry-connection-button"),

    connectionErrorMessage: $("connection-error-message"),

    successMessage: $("success-message"),

    errorBox: $("auth-error"),

    errorMessage: $("auth-error-message"),

    noticeBox: $("auth-notice"),

noticeMessage: $("auth-notice-message")

};


/* ============================================================
   PAGE STATE
============================================================ */

const state = {

    panel: "loading",

    busy: false,

    completed: false,

    email: "",

    challengeId: null,

    expiresAt: 0,

    resendAvailableAt: 0,

    countdownTimer: null,

    redirectTimer: null,

    operation: 0,

    lastAutoSubmittedCode: null,

    returnPath: CONFIG.defaultReturnPath

};


/* ============================================================
   DOM VALIDATION
============================================================ */

function validateDOM() {

    const missing = [];

    for (const [name, element] of Object.entries(elements)) {

        if (name === "panels") {

            for (
                const [panelName, panel]
                of Object.entries(element)
            ) {

                if (!panel) {

                    missing.push(`panel:${panelName}`);

                }

            }

        } else if (!element) {

            missing.push(name);

        }

    }

    if (missing.length) {

        throw new Error(

            "Missing authentication elements: " +
            missing.join(", ")

        );

    }

}


/* ============================================================
   SAFE RETURN DESTINATION
============================================================ */

function getReturnPath() {

    const params = new URLSearchParams(
        window.location.search
    );

    const requested = params.get("return");

    if (!requested) {

        return CONFIG.defaultReturnPath;

    }

    const safePath = sanitizeReturnPath(requested);

    const url = new URL(
        safePath,
        window.location.origin
    );

    let pathname;

    try {

        pathname = decodeURIComponent(url.pathname)
            .replace(/\/+$/, "")
            .toLowerCase();

    } catch {

        return CONFIG.defaultReturnPath;

    }

    const blockedPaths = new Set([

        "/sign-in",

        "/sign-in.html",

        "/pages/sign-in",

        "/pages/sign-in/sign-in",

        "/pages/sign-in/sign-in.html"

    ]);

    if (blockedPaths.has(pathname)) {

        return CONFIG.defaultReturnPath;

    }

    return safePath;

}


/* ============================================================
   AUTHENTICATION PANEL MANAGEMENT
============================================================ */

function showPanel(name, { focus = true } = {}) {

    if (!elements.panels[name]) {

        throw new Error(
            `Unknown authentication panel: ${name}`
        );

    }

    state.panel = name;

    for (
        const [panelName, panel]
        of Object.entries(elements.panels)
    ) {

        panel.hidden = panelName !== name;

    }

    if (!focus) {

        return;

    }

    requestAnimationFrame(() => {

        if (state.panel !== name) {

            return;

        }

        if (name === "verification") {

            elements.codeInput.focus({
                preventScroll: true
            });

            return;

        }

        const heading =
            elements.panels[name].querySelector("h2");

        if (heading) {

            heading.setAttribute("tabindex", "-1");

            heading.focus({
                preventScroll: true
            });

        }

    });

}


/* ============================================================
   FEEDBACK
============================================================ */

function clearFeedback() {

    elements.errorBox.hidden = true;

    elements.errorMessage.textContent = "";

    elements.noticeBox.hidden = true;

    elements.noticeMessage.textContent = "";

}

function showError(message) {

    elements.noticeBox.hidden = true;

    elements.errorMessage.textContent = message;

    elements.errorBox.hidden = false;

}

function showNotice(message) {

    elements.errorBox.hidden = true;

    elements.noticeMessage.textContent = message;

    elements.noticeBox.hidden = false;

}

function getErrorMessage(error) {

    const code = error?.code;

    if (
        code &&
        Object.prototype.hasOwnProperty.call(
            ERROR_MESSAGES,
            code
        )
    ) {

        return ERROR_MESSAGES[code];

    }

    if (
        error instanceof AuthError &&
        typeof error.message === "string" &&
        error.message.length <= 300
    ) {

        return error.message;

    }

    return "Something went wrong. Please try again.";

}


/* ============================================================
   BUSY STATE
============================================================ */

function setButtonLoading(button, loading, label) {

    const text = button.querySelector(".button-text");

    const spinner =
        button.querySelector(".button-spinner");

    if (text) {

        if (!button.dataset.originalText) {

            button.dataset.originalText =
                text.textContent.trim();

        }

        text.textContent = loading

            ? label || "Please wait..."

            : button.dataset.originalText;

    }

    if (spinner) {

        spinner.hidden = !loading;

    }

    button.classList.toggle(
        "is-loading",
        loading
    );

    button.setAttribute(
        "aria-busy",
        String(loading)
    );

}

function updateControls() {

    const disabled =
        state.busy || state.completed;

    elements.googleButton.disabled = disabled;

    elements.emailInput.disabled = disabled;

    elements.requestButton.disabled = disabled;

    elements.codeInput.disabled = disabled;

    elements.changeEmailButton.disabled = disabled;

    elements.retryButton.disabled = disabled;

    elements.verifyButton.disabled =

        disabled ||

        !state.challengeId ||

        Date.now() >= state.expiresAt ||

        !/^[0-9]{6}$/.test(
            elements.codeInput.value
        );

    elements.resendButton.disabled =

        disabled ||

        !state.email ||

        Date.now() < state.resendAvailableAt;

}

function setBusy(busy) {

    state.busy = busy;

    updateControls();

}


/* ============================================================
   EMAIL VALIDATION
============================================================ */

function normalizeEmail(value) {

    return String(value)
        .trim()
        .toLowerCase();

}

function isValidEmail(email) {

    return (

        email.length > 0 &&

        email.length <= 254 &&

        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    );

}


/* ============================================================
   TIMER UTILITIES
============================================================ */

function formatTime(seconds) {

    const safeSeconds = Math.max(
        0,
        Math.ceil(seconds)
    );

    const minutes = Math.floor(
        safeSeconds / 60
    );

    const remainder = safeSeconds % 60;

    return (

        String(minutes).padStart(2,"0") +

        ":" +

        String(remainder).padStart(2,"0")

    );

}

function stopCountdown() {

    if (state.countdownTimer !== null) {

        clearInterval(state.countdownTimer);

        state.countdownTimer = null;

    }

}

function updateCountdown() {

    if (state.panel !== "verification") {

        return;

    }

    const now = Date.now();

    const remaining = Math.max(

        0,

        Math.ceil(
            (state.expiresAt - now) / 1000
        )

    );

    const resendRemaining = Math.max(

        0,

        Math.ceil(
            (state.resendAvailableAt - now) / 1000
        )

    );

    elements.expiryCountdown.textContent =

        remaining > 0

            ? formatTime(remaining)

            : "Expired";

    elements.verificationTimer.classList.toggle(

        "is-expiring",

        remaining <= 60

    );

    elements.resendCountdown.textContent =

        resendRemaining > 0

            ? `(${resendRemaining}s)`

            : "";

    updateControls();

}

function startCountdown() {

    stopCountdown();

    updateCountdown();

    state.countdownTimer = setInterval(

        updateCountdown,

        1000

    );

}


/* ============================================================
   NORMALIZE EMAIL CHALLENGE RESPONSE
============================================================ */

function parseChallenge(response) {

    // Support the existing direct response and common
    // nested response structures.

    const challenge =

        response?.challenge ||

        response?.data ||

        response;

    const challengeId = challenge?.challengeId;

    if (

        typeof challengeId !== "string" ||

        !challengeId

    ) {

        throw new AuthError(

            "The server did not return a verification challenge.",

            "INVALID_SERVER_RESPONSE"

        );

    }

    const now = Date.now();

    const suppliedExpiry = Date.parse(
        challenge.expiresAt || ""
    );

    const suppliedLifetime = Number(
        challenge.expiresIn
    );

    let expiresAt;

    if (Number.isFinite(suppliedExpiry)) {

        expiresAt = suppliedExpiry;

    } else if (

        Number.isFinite(suppliedLifetime) &&

        suppliedLifetime > 0

    ) {

        expiresAt = now + suppliedLifetime * 1000;

    } else {

        expiresAt = now +
            CONFIG.defaultCodeLifetime * 1000;

    }

    if (expiresAt <= now) {

        throw new AuthError(

            "The verification challenge has expired.",

            "CHALLENGE_EXPIRED"

        );

    }

    return {

        challengeId,

        expiresAt

    };

}


/* ============================================================
   REQUEST EMAIL VERIFICATION
============================================================ */

async function requestEmailCode({
    resend = false
} = {}) {

    if (state.busy || state.completed) {

        return;

    }

    if (

        resend &&

        Date.now() < state.resendAvailableAt

    ) {

        return;

    }

    const email = resend

        ? state.email

        : normalizeEmail(
            elements.emailInput.value
        );

    clearFeedback();

    if (!isValidEmail(email)) {

        showError(
            "Please enter a valid email address."
        );

        elements.emailInput.focus();

        return;

    }

    const operation = ++state.operation;

    setBusy(true);

    if (!resend) {

        setButtonLoading(

            elements.requestButton,

            true,

            "Sending verification code..."

        );

    } else {

        elements.resendButton.textContent =
            "Sending...";

    }

    try {

        const response = await Auth.requestEmailCode(
            email
        );

        if (

            operation !== state.operation ||

            state.completed

        ) {

            return;

        }

        const challenge = parseChallenge(
            response
        );

        state.email = email;

        state.challengeId = challenge.challengeId;

        state.expiresAt = challenge.expiresAt;

        state.resendAvailableAt =

            Date.now() +

            CONFIG.resendDelay * 1000;

        state.lastAutoSubmittedCode = null;

        elements.verificationEmail.textContent =
            email;

        elements.codeInput.value = "";

        showPanel("verification");

        startCountdown();

        if (resend) {

            showNotice(
                "A new verification code has been sent. Use the most recent code."
            );

        } else {

            showNotice(
                "Verification code requested. Check your inbox and spam folder."
            );

        }

    } catch (error) {

        if (operation !== state.operation) {

            return;

        }

        showError(
            getErrorMessage(error)
        );

    } finally {

        if (operation === state.operation) {

            setButtonLoading(

                elements.requestButton,

                false

            );

            elements.resendButton.textContent =
                "Resend code";

            setBusy(false);

            if (state.panel === "verification") {

                elements.codeInput.focus({
                    preventScroll: true
                });

            }

        }

    }

}


/* ============================================================
   EMAIL CODE VERIFICATION
============================================================ */

async function verifyEmailCode() {

    if (

        state.busy ||

        state.completed ||

        state.panel !== "verification"

    ) {

        return;

    }

    clearFeedback();

    const code = elements.codeInput.value.trim();

    if (!/^[0-9]{6}$/.test(code)) {

        showError(
            "Enter the complete six-digit verification code."
        );

        elements.codeInput.focus();

        return;

    }

    if (

        !state.challengeId ||

        Date.now() >= state.expiresAt

    ) {

        showError(

            "Your verification code has expired. Request a new one."

        );

        updateCountdown();

        return;

    }

    const operation = ++state.operation;

    setBusy(true);

    setButtonLoading(

        elements.verifyButton,

        true,

        "Verifying identity..."

    );

    try {

        const result = await Auth.verifyEmailCode({

            email: state.email,

            challengeId: state.challengeId,

            code

        });

        if (

            operation !== state.operation ||

            state.completed

        ) {

            return;

        }

        completeAuthentication(
            result.customer
        );

    } catch (error) {

        if (operation !== state.operation) {

            return;

        }

        showError(
            getErrorMessage(error)
        );

        const terminalCodes = new Set([

            "CHALLENGE_EXPIRED",

            "CODE_EXPIRED",

            "CHALLENGE_CONSUMED",

            "INVALID_CHALLENGE",

            "MAX_ATTEMPTS_EXCEEDED",

            "ACCOUNT_LINK_REQUIRED",

            "LEGACY_LINK_REQUIRED"

        ]);

        if (terminalCodes.has(error?.code)) {

            state.challengeId = null;

            state.expiresAt = 0;

        }

        elements.codeInput.select();

    } finally {

        if (operation === state.operation) {

            setButtonLoading(

                elements.verifyButton,

                false

            );

            setBusy(false);

            if (!state.completed) {

                elements.codeInput.focus({
                    preventScroll: true
                });

            }

        }

    }

}


/* ============================================================
   GOOGLE AUTHENTICATION
============================================================ */

function startGoogleAuthentication() {

    if (state.busy || state.completed) {

        return;

    }

    clearFeedback();

    setBusy(true);

    elements.googleButton.setAttribute(
        "aria-busy",
        "true"
    );

    showNotice(
        "Redirecting to Google for secure authentication..."
    );

    try {

        Auth.signInWithGoogle(
            state.returnPath
        );

    } catch (error) {

        setBusy(false);

        elements.googleButton.removeAttribute(
            "aria-busy"
        );

        showError(
            getErrorMessage(error)
        );

    }

}


/* ============================================================
   CHANGE EMAIL ADDRESS
============================================================ */

function changeEmail() {

    if (state.busy || state.completed) {

        return;

    }

    state.operation++;

    stopCountdown();

    state.challengeId = null;

    state.expiresAt = 0;

    state.resendAvailableAt = 0;

    state.lastAutoSubmittedCode = null;

    elements.codeInput.value = "";

    elements.emailInput.value = state.email;

    clearFeedback();

    showPanel("signIn", {
        focus: false
    });

    updateControls();

    elements.emailInput.focus();

    elements.emailInput.select();

}


/* ============================================================
   AUTHENTICATION SUCCESS
============================================================ */

function completeAuthentication(customer) {

    if (state.completed) {

        return;

    }

    state.completed = true;

    state.operation++;

    state.busy = false;

    stopCountdown();

    clearFeedback();

    state.challengeId = null;

    state.email = "";

    elements.codeInput.value = "";

    elements.emailInput.value = "";

    setButtonLoading(
        elements.verifyButton,
        false
    );

    setButtonLoading(
        elements.requestButton,
        false
    );

    const firstName =

        typeof customer?.name === "string"

            ? customer.name.trim().split(/\s+/)[0]

            : "";

    elements.successMessage.textContent =

        firstName

            ? `Welcome, ${firstName}. Your secure session has been established.`

            : "Your identity has been verified. Your secure session is ready.";

    showPanel("success");

    updateControls();

    const reducedMotion = window.matchMedia(

        "(prefers-reduced-motion: reduce)"

    ).matches;

    state.redirectTimer = setTimeout(

        continueToDestination,

        reducedMotion ? 0 : CONFIG.successDelay

    );

}


/* ============================================================
   SAFE DESTINATION REDIRECTION
============================================================ */

function continueToDestination() {

    if (!state.completed) {

        return;

    }

    clearTimeout(state.redirectTimer);

    const destination = sanitizeReturnPath(
        state.returnPath
    );

    window.location.replace(
        destination
    );

}


/* ============================================================
   OAUTH CALLBACK ERROR RECOVERY
============================================================ */

function getCallbackError() {

    const url = new URL(
        window.location.href
    );

    const code =

        url.searchParams.get("error") ||

        url.searchParams.get("auth_error") ||

        url.searchParams.get("code");

    if (!code) {

        return null;

    }

    // Remove error parameters from the address bar.

    url.searchParams.delete("error");

    url.searchParams.delete("auth_error");

    url.searchParams.delete("code");

    window.history.replaceState(

        window.history.state,

        "",

        url.pathname +
        url.search +
        url.hash

    );

    const normalizedCode = code.toUpperCase();

    return Object.prototype.hasOwnProperty.call(

        ERROR_MESSAGES,

        normalizedCode

    )

        ? ERROR_MESSAGES[normalizedCode]

        : "Authentication could not be completed. Please try again.";

}


/* ============================================================
   INITIAL SESSION CHECK
============================================================ */

async function initializeSession({
    retry = false
} = {}) {

    if (state.busy || state.completed) {

        return;

    }

    clearFeedback();

    showPanel("loading", {
        focus: false
    });

    setBusy(true);

    try {

        const authState = retry

            ? await Auth.refresh({
                force: true
            })

            : await Auth.init();

        if (state.completed) {

            return;

        }

        if (authState.error) {

            throw authState.error;

        }

        if (

            authState.authenticated &&

            authState.customer

        ) {

            completeAuthentication(
                authState.customer
            );

            return;

        }

        showPanel("signIn");

        const callbackError = getCallbackError();

        if (callbackError) {

            showError(callbackError);

        }

    } catch (error) {

        elements.connectionErrorMessage.textContent =

            getErrorMessage(error);

        showPanel("connectionError");

    } finally {

        setBusy(false);

    }

}


/* ============================================================
   EVENT LISTENERS
============================================================ */

function bindEvents() {

    elements.googleButton.addEventListener(

        "click",

        startGoogleAuthentication

    );

    elements.emailForm.addEventListener(

        "submit",

        event => {

            event.preventDefault();

            requestEmailCode();

        }

    );

    elements.verificationForm.addEventListener(

        "submit",

        event => {

            event.preventDefault();

            verifyEmailCode();

        }

    );

    elements.resendButton.addEventListener(

        "click",

        () => requestEmailCode({
            resend: true
        })

    );

    elements.changeEmailButton.addEventListener(

        "click",

        changeEmail

    );

    elements.retryButton.addEventListener(

        "click",

        () => initializeSession({
            retry: true
        })

    );

    elements.continueButton.addEventListener(

        "click",

        continueToDestination

    );

    elements.codeInput.addEventListener(

        "input",

        event => {

            const input = event.target;

            input.value = input.value

                .replace(/[^0-9]/g,"")

                .slice(0,CONFIG.codeLength);

            updateControls();

            // Automatically verify a complete code.
            // Do not repeatedly submit the same code.

            if (

                input.value.length === CONFIG.codeLength &&

                input.value !== state.lastAutoSubmittedCode &&

                !state.busy &&

                !elements.verifyButton.disabled

            ) {

                state.lastAutoSubmittedCode =
                    input.value;

                verifyEmailCode();

            }

        }

    );

    elements.codeInput.addEventListener(

        "paste",

        event => {

            const pasted =

                event.clipboardData?.getData("text") || "";

            const digits = pasted

                .trim()

                .replace(/[\s-]/g,"");

            if (!/^[0-9]{6}$/.test(digits)) {

                return;

            }

            event.preventDefault();

            elements.codeInput.value = digits;

            elements.codeInput.dispatchEvent(

                new Event("input",{
                    bubbles: true
                })

            );

        }

    );

    elements.emailInput.addEventListener(

        "input",

        () => {

            if (!state.busy) {

                clearFeedback();

            }

        }

    );

    document.addEventListener(

        "visibilitychange",

        () => {

            if (!document.hidden) {

                updateCountdown();

            }

        }

    );

    window.addEventListener(

        "pageshow",

        event => {

            if (!event.persisted) {

                return;

            }

            // Recover when the browser restores the
            // page after returning from Google.

            clearTimeout(state.redirectTimer);

            state.completed = false;

            state.busy = false;

            elements.googleButton.removeAttribute(
                "aria-busy"
            );

            initializeSession({
                retry: true
            });

        }

    );

    window.addEventListener(

        "pagehide",

        () => {

            stopCountdown();

            clearTimeout(state.redirectTimer);

        }

    );

    Auth.subscribe(

        authState => {

            if (

                authState.initialized &&

                !authState.loading &&

                !authState.error &&

                authState.authenticated &&

                authState.customer &&

                !state.completed

            ) {

                completeAuthentication(
                    authState.customer
                );

            }

        },

        false

    );

}


/* ============================================================
   PAGE INITIALIZATION
============================================================ */

async function initialize() {

    validateDOM();

    state.returnPath = getReturnPath();



    bindEvents();

    updateControls();

    await initializeSession();

}


/* ============================================================
   START APPLICATION
============================================================ */

initialize().catch(error => {

    console.error(

        "[Leakendia Authentication] Initialization failed",

        error

    );

    if (elements.panels.connectionError) {

        for (
            const panel of Object.values(elements.panels)
        ) {

            if (panel) {

                panel.hidden = true;

            }

        }

        elements.panels.connectionError.hidden = false;

    }

    if (elements.connectionErrorMessage) {

        elements.connectionErrorMessage.textContent =

            "The authentication interface could not be initialized. Please reload the page.";

    }

    if (elements.retryButton) {

        elements.retryButton.disabled = false;

        elements.retryButton.onclick = () => {

            window.location.reload();

        };

    }

});
