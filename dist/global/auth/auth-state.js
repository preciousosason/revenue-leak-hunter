
/* ============================================================
   LEAKENDIA — GLOBAL AUTHENTICATION ENGINE
   File: global/auth/auth-state.js
   Version: 1.0.0
============================================================ */

const CONFIG = Object.freeze({

    api: "/api/auth",

    signInPath: "/sign-in",

    portalPath: "/pages/portal/portal.html",

    channelName: "leakendia-auth-v1",

    storageEventKey: "leakendia-auth-event",

    requestTimeout: 15000,

    refreshInterval: 60000

});


/* ============================================================
   AUTHENTICATION ERROR
============================================================ */

export class AuthError extends Error {

    constructor(
        message,
        code = "AUTH_ERROR",
        status = 0
    ) {

        super(message);

        this.name = "AuthError";
        this.code = code;
        this.status = status;

    }

}


/* ============================================================
   SAFE RETURN PATH
============================================================ */

export function sanitizeReturnPath(value) {

    if (
        typeof value !== "string" ||
        value.length > 2048 ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        /[\\\u0000-\u0020\u007f]/.test(value)
    ) {

        return "/";

    }

    try {

        const url = new URL(
            value,
            window.location.origin
        );

        const decoded = decodeURIComponent(
            url.pathname
        );

        if (
            url.origin !== window.location.origin ||
            decoded.startsWith("//") ||
            /[\\\u0000-\u0020\u007f]/.test(decoded) ||
            decoded.toLowerCase() === "/api" ||
            decoded.toLowerCase().startsWith("/api/")
        ) {

            return "/";

        }

        return (
            url.pathname +
            url.search +
            url.hash
        );

    } catch {

        return "/";

    }

}


/* ============================================================
   CUSTOMER NORMALIZATION
============================================================ */

function normalizeCustomer(customer) {

    if (
        !customer ||
        typeof customer !== "object" ||
        typeof customer.id !== "string" ||
        !customer.id ||
        typeof customer.email !== "string"
    ) {

        return null;

    }

    let avatarUrl = null;

    if (typeof customer.avatarUrl === "string") {

        try {

            const url = new URL(customer.avatarUrl);

            if (
                url.protocol === "https:" &&
                !url.username &&
                !url.password
            ) {

                avatarUrl = url.href;

            }

        } catch {

            avatarUrl = null;

        }

    }

    return Object.freeze({

        id: customer.id,

        name:
            typeof customer.name === "string"
                ? customer.name
                : "",

        email: customer.email,

        business: customer.business || null,

        website: customer.website || null,

        avatarUrl,

        emailVerified:
            customer.emailVerified === true,

        status: customer.status || null,

        registeredAt:
            customer.registeredAt || null,

        lastLoginAt:
            customer.lastLoginAt || null

    });

}


/* ============================================================
   GLOBAL AUTHENTICATION ENGINE
============================================================ */

class LeakendiaAuthEngine {

    constructor() {

        this.state = Object.freeze({

            initialized: false,

            loading: true,

            authenticated: false,

            customer: null,

            error: null,

            updatedAt: null

        });

        this.listeners = new Set();

        this.pendingRefresh = null;

        this.channel = null;

        this.started = false;

        this.refreshTimer = null;

        this.generation = 0;

        this.loggingOut = false;

        this.handleFocus = () => {

            if (
                !document.hidden &&
                !this.loggingOut
            ) {

                this.refresh().catch(() => {});

            }

        };

        this.handleStorage = event => {

            if (
                event.key === CONFIG.storageEventKey &&
                event.newValue
            ) {

                this.handleExternalChange();

            }

        };

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    async init() {

        if (!this.started) {

            this.started = true;

            this.initializeSynchronization();

            this.initializeLifecycle();

        }

        if (this.state.initialized) {

            return this.getState();

        }

        return this.refresh();

    }


    /* ========================================================
       STATE MANAGEMENT
    ======================================================== */

    getState() {

        return this.state;

    }

    getCustomer() {

        return this.state.customer;

    }

    isAuthenticated() {

        return (
            this.state.initialized &&
            this.state.authenticated
        );

    }

    isLoading() {

        return this.state.loading;

    }

    setState(changes) {

        this.state = Object.freeze({

            ...this.state,

            ...changes,

            updatedAt: Date.now()

        });

        this.notify();

        return this.state;

    }


    /* ========================================================
       STATE SUBSCRIPTIONS
    ======================================================== */

    subscribe(listener, immediate = true) {

        if (typeof listener !== "function") {

            throw new TypeError(
                "Authentication listener must be a function."
            );

        }

        this.listeners.add(listener);

        if (immediate) {

            try {

                listener(this.getState());

            } catch (error) {

                console.error(
                    "[Leakendia Auth] Listener failed",
                    error
                );

            }

        }

        return () => {

            this.listeners.delete(listener);

        };

    }

    notify() {

        const state = this.getState();

        for (const listener of this.listeners) {

            try {

                listener(state);

            } catch (error) {

                console.error(
                    "[Leakendia Auth] Listener failed",
                    error
                );

            }

        }

        window.dispatchEvent(

            new CustomEvent(
                "leakendia:auth-change",
                {
                    detail: state
                }
            )

        );

    }


    /* ========================================================
       SECURE API REQUESTS
    ======================================================== */

    async request(
        endpoint,
        {
            method = "GET",
            body
        } = {}
    ) {

        const controller = new AbortController();

        const timer = setTimeout(

            () => controller.abort(),

            CONFIG.requestTimeout

        );

        try {

            const headers = {

                Accept: "application/json"

            };

            const options = {

                method,

                headers,

                credentials: "same-origin",

                cache: "no-store",

                redirect: "error",

                signal: controller.signal

            };

            if (body !== undefined) {

                headers["Content-Type"] =
                    "application/json";

                options.body =
                    JSON.stringify(body);

            }

            const response = await fetch(

                `${CONFIG.api}${endpoint}`,

                options

            );

            let data;

            try {

                data = await response.json();

            } catch {

                throw new AuthError(

                    "Invalid authentication server response.",

                    "INVALID_SERVER_RESPONSE",

                    response.status

                );

            }

            if (
                !response.ok ||
                data.success === false
            ) {

                throw new AuthError(

                    data.error ||
                        "Authentication request failed.",

                    data.code ||
                        "AUTH_REQUEST_FAILED",

                    response.status

                );

            }

            return data;

        } catch (error) {

            if (error instanceof AuthError) {

                throw error;

            }

            if (error.name === "AbortError") {

                throw new AuthError(

                    "Authentication request timed out.",

                    "REQUEST_TIMEOUT"

                );

            }

            throw new AuthError(

                "Unable to connect to Leakendia.",

                "NETWORK_ERROR"

            );

        } finally {

            clearTimeout(timer);

        }

    }


    /* ========================================================
       REFRESH CUSTOMER SESSION
    ======================================================== */

    async refresh({ force = false } = {}) {

        if (this.loggingOut) {

            return this.getState();

        }

        if (this.pendingRefresh && !force) {

            return this.pendingRefresh;

        }

        const generation = ++this.generation;

        const operation = this.performRefresh(
            generation
        );

        this.pendingRefresh = operation;

        try {

            return await operation;

        } finally {

            if (this.pendingRefresh === operation) {

                this.pendingRefresh = null;

            }

        }

    }

    async performRefresh(generation) {

        this.setState({

            loading: true,

            error: null

        });

        try {

            const data = await this.request("/me");

            if (generation !== this.generation) {

                return this.getState();

            }

            const customer = normalizeCustomer(
                data.customer
            );

            const authenticated =

                data.authenticated === true &&

                customer !== null;

            return this.setState({

                initialized: true,

                loading: false,

                authenticated,

                customer:
                    authenticated ? customer : null,

                error: null

            });

        } catch (error) {

            if (generation !== this.generation) {

                return this.getState();

            }

            return this.setState({

                initialized: true,

                loading: false,

                authenticated: false,

                customer: null,

                error

            });

        }

    }


    /* ========================================================
       GOOGLE AUTHENTICATION
    ======================================================== */

    signInWithGoogle(returnPath = "/") {

        const safePath = sanitizeReturnPath(
            returnPath
        );

        const params = new URLSearchParams({

            return: safePath

        });

        window.location.assign(

            `${CONFIG.api}/google/start?${params}`

        );

    }


    /* ========================================================
       EMAIL AUTHENTICATION
    ======================================================== */

    async requestEmailCode(email) {

        const normalizedEmail = String(email)
            .trim()
            .toLowerCase();

        if (!normalizedEmail) {

            throw new AuthError(

                "Enter your email address.",

                "EMAIL_REQUIRED"

            );

        }

        return this.request(

            "/email/request",

            {

                method: "POST",

                body: {

                    email: normalizedEmail

                }

            }

        );

    }

    async verifyEmailCode({
        email,
        challengeId,
        code
    }) {

        const result = await this.request(

            "/email/verify",

            {

                method: "POST",

                body: {

                    email: String(email)
                        .trim()
                        .toLowerCase(),

                    challengeId,

                    code: String(code).trim()

                }

            }

        );

        const state = await this.refresh({

            force: true

        });

        if (!state.authenticated) {

            throw new AuthError(

                "Unable to establish your customer session.",

                "SESSION_NOT_ESTABLISHED"

            );

        }

        this.broadcastChange();

        return {

            ...result,

            customer: state.customer

        };

    }


    /* ========================================================
       PROTECTED PAGE NAVIGATION
    ======================================================== */

    getSignInURL(
        returnPath =
            window.location.pathname +
            window.location.search +
            window.location.hash
    ) {

        const params = new URLSearchParams({

            return: sanitizeReturnPath(returnPath)

        });

        return `${CONFIG.signInPath}?${params}`;

    }

    redirectToSignIn(returnPath) {

        window.location.assign(

            this.getSignInURL(returnPath)

        );

    }

    async requireAuthentication({
        redirect = true,
        returnPath
    } = {}) {

        await this.init();

        const state = await this.refresh();

        if (state.error) {

            throw state.error;

        }

        if (state.authenticated) {

            return state.customer;

        }

        if (redirect) {

            this.redirectToSignIn(returnPath);

        }

        return null;

    }

    openPortal() {

        if (this.isAuthenticated()) {

            window.location.assign(
                CONFIG.portalPath
            );

            return;

        }

        this.redirectToSignIn(
            CONFIG.portalPath
        );

    }


    /* ========================================================
       SESSION MANAGEMENT
    ======================================================== */

    async getSessions() {

        return this.request("/sessions");

    }

    async signOut({
        all = false,
        redirectTo = "/"
    } = {}) {

        if (this.loggingOut) {

            throw new AuthError(

                "Sign-out is already in progress.",

                "LOGOUT_IN_PROGRESS"

            );

        }

        this.loggingOut = true;

        this.generation++;

        try {

            await this.request(

                all
                    ? "/logout-all"
                    : "/logout",

                {

                    method: "POST"

                }

            );

            this.setState({

                initialized: true,

                loading: false,

                authenticated: false,

                customer: null,

                error: null

            });

            this.broadcastChange();

            if (redirectTo !== null) {

                window.location.replace(

                    sanitizeReturnPath(redirectTo)

                );

            }

            return true;

        } catch (error) {

            this.setState({

                loading: false,

                error

            });

            throw error;

        } finally {

            this.loggingOut = false;

        }

    }


    /* ========================================================
       CROSS-TAB SYNCHRONIZATION
    ======================================================== */

    initializeSynchronization() {

        if ("BroadcastChannel" in window) {

            try {

                this.channel = new BroadcastChannel(

                    CONFIG.channelName

                );

                this.channel.onmessage = event => {

                    if (
                        event.data?.type ===
                        "AUTH_CHANGED"
                    ) {

                        this.handleExternalChange();

                    }

                };

            } catch {

                this.channel = null;

            }

        }

        window.addEventListener(

            "storage",

            this.handleStorage

        );

    }

    broadcastChange() {

        if (this.channel) {

            try {

                this.channel.postMessage({

                    type: "AUTH_CHANGED"

                });

                return;

            } catch {

                // Fall back to a storage event.

            }

        }

        try {

            localStorage.setItem(

                CONFIG.storageEventKey,

                `${Date.now()}-${Math.random()}`

            );

        } catch {

            // Synchronization is best effort.

        }

    }

    handleExternalChange() {

        this.refresh({

            force: true

        }).catch(() => {});

    }


    /* ========================================================
       BROWSER LIFECYCLE
    ======================================================== */

    initializeLifecycle() {

        window.addEventListener(

            "focus",

            this.handleFocus

        );

        window.addEventListener(

            "pageshow",

            this.handleFocus

        );

        document.addEventListener(

            "visibilitychange",

            this.handleFocus

        );

        this.refreshTimer = setInterval(() => {

            if (
                !document.hidden &&
                !this.loggingOut
            ) {

                this.refresh().catch(() => {});

            }

        }, CONFIG.refreshInterval);

    }


    /* ========================================================
       CLEANUP
    ======================================================== */

    destroy() {

        this.generation++;

        clearInterval(this.refreshTimer);

        this.refreshTimer = null;

        if (this.channel) {

            this.channel.close();

            this.channel = null;

        }

        window.removeEventListener(

            "focus",

            this.handleFocus

        );

        window.removeEventListener(

            "pageshow",

            this.handleFocus

        );

        window.removeEventListener(

            "storage",

            this.handleStorage

        );

        document.removeEventListener(

            "visibilitychange",

            this.handleFocus

        );

        this.listeners.clear();

        this.pendingRefresh = null;

        this.started = false;

        this.state = Object.freeze({

            initialized: false,

            loading: true,

            authenticated: false,

            customer: null,

            error: null,

            updatedAt: null

        });

    }

}


/* ============================================================
   SINGLE GLOBAL AUTHENTICATION INSTANCE
============================================================ */

export const Auth = new LeakendiaAuthEngine();

export default Auth;


/* ============================================================
   GLOBAL BROWSER ACCESS
============================================================ */

if (typeof window !== "undefined") {

    window.LeakendiaAuth = Auth;

}
