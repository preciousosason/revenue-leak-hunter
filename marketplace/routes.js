export async function handleMarketplacePage(request, env) {

    const url = new URL(request.url);
    const pathname = url.pathname;

    let template;

    if (
        pathname === "/marketplace" ||
        /^\/marketplace\/category\/[a-z0-9-]+$/.test(pathname)
    ) {

        template = "/pages/marketplace/marketplace.html";

    } else if (
        /^\/marketplace\/service\/[a-z0-9-]+$/.test(pathname)
    ) {

        template = "/pages/marketplace/service/service.html";

    } else {

        return new Response("Page not found", {
            status: 404
        });

    }

    const assetURL = new URL(template, request.url);

    return env.ASSETS.fetch(
        new Request(assetURL, {
            method: request.method
        })
    );

}