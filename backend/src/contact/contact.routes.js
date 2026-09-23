import {
    handleContact
} from "./contact.js";

export async function handleContactRoutes(
    request,
    env
) {
    const url = new URL(request.url);

    if (
        url.pathname === "/api/contact" &&
        request.method === "POST"
    ) {
        return handleContact(
            request,
            env
        );
    }

    return null;
}