import {
    API_URL
} from "./config.js";

import {
    getAdminSession
} from "./state.js";


let expiredSessionHandler =
    null;


/* =========================================================
   SESSION HANDLER
   ========================================================= */

export function setExpiredSessionHandler(
    handler
) {

    expiredSessionHandler =
        typeof handler === "function"
            ? handler
            : null;

}


/* =========================================================
   AUTH HEADERS
   ========================================================= */

export function getAuthHeaders() {

    return {
        "Authorization":
            `Bearer ${getAdminSession()}`
    };

}


export function getJSONHeaders() {

    return {
        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${getAdminSession()}`
    };

}


/* =========================================================
   API REQUEST
   ========================================================= */

export async function api(
    endpoint,
    options = {}
) {

    const headers = {
        ...getJSONHeaders(),
        ...(options.headers || {})
    };

    const response =
        await fetch(
            `${API_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );

    let data = null;

    try {

        data =
            await response.json();

  } catch {

    if (
        response.status === 401
    ) {

        expiredSessionHandler?.();

        throw new Error(
            "Your admin session has expired."
        );

    }


    if (!response.ok) {

        throw new Error(
            `The server returned an invalid response (${response.status}).`
        );

    }

}

    if (
        response.status === 401
    ) {

        expiredSessionHandler?.();

        throw new Error(
            "Your admin session has expired."
        );

    }

    if (
        !response.ok ||
        data?.success === false
    ) {

        throw new Error(
            data?.error ||
            "Something went wrong."
        );

    }

    return data || {};

}