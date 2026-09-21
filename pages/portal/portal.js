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

        const errorElement =
            document.getElementById(
                "portal-error"
            );

        const logoutButton =
            document.getElementById(
                "portal-logout"
            );


        /* =================================
           NO SESSION
        ================================== */

        if (!sessionToken) {

            window.location.href =
                "/pages/contact/contact.html";

            return;

        }


        /* =================================
           LOAD SESSION
        ================================== */

        try {

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

                sessionStorage.removeItem(
                    "portalSessionToken"
                );

                sessionStorage.removeItem(
                    "portalClient"
                );


                window.location.href =
                    "/pages/contact/contact.html";

                return;

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


        } catch (error) {

            console.error(
                "Portal loading error:",
                error
            );


            if (errorElement) {

                errorElement.textContent =
                    "Unable to load your private portal.";

                errorElement.hidden =
                    false;

            }

        }


        /* =================================
           LOGOUT
        ================================== */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

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

    }
);