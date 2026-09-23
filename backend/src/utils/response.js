import { CORS_HEADERS } from "../config/cors.js";

export function json(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: CORS_HEADERS
        }
    );
}

export function textResponse(
    message,
    status = 200
) {
    return new Response(
        message,
        {
            status,
            headers: {
                ...CORS_HEADERS,
                "Content-Type": "text/plain"
            }
        }
    );
}

export function optionsResponse() {
    return new Response(
        null,
        {
            status: 204,
            headers: CORS_HEADERS
        }
    );
}