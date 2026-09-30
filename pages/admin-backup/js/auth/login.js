import {
    API_URL,
    SESSION_KEY
} from "../core/config.js";

import {
    setAdminSession
} from "../core/state.js";


export function initLogin({
    onLoginSuccess
} = {}) {

    const loginForm =
        document.getElementById(
            "admin-login-form"
        );

    const passwordInput =
        document.getElementById(
            "admin-password"
        );

    const loginButton =
        document.getElementById(
            "admin-login-button"
        );

    const loginError =
        document.getElementById(
            "admin-login-error"
        );


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


    if (!loginForm) {
        return;
    }


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

                setAdminSession(
                    data.sessionToken
                );

                sessionStorage.setItem(
                    SESSION_KEY,
                    data.sessionToken
                );

                if (passwordInput) {
                    passwordInput.value = "";
                }

                onLoginSuccess?.();

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