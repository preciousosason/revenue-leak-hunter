/* =================================
   SHARED COMPONENT LOADER
================================= */

async function loadSharedComponent(
    targetId,
    componentPath,
    cssPath = null,
    jsPath = null
) {

    const target =
        document.getElementById(targetId);


    if (!target) {

        console.error(
            `Component target not found: #${targetId}`
        );

        return;

    }


    try {

        const response =
            await fetch(componentPath);


        if (!response.ok) {

            throw new Error(
                `Failed to load component: ${componentPath}`
            );

        }


        const html =
            await response.text();


        target.innerHTML = html;


        /* ============================
           LOAD COMPONENT CSS
        ============================= */

        if (cssPath) {

            loadComponentCSS(cssPath);

        }


        /* ============================
           LOAD COMPONENT JS
        ============================= */

        if (jsPath) {

            loadComponentJS(jsPath);

        }


    } catch (error) {

        console.error(
            `Component loading error:`,
            error
        );

    }

}


/* =================================
   CSS LOADER
================================= */

function loadComponentCSS(path) {

    const existing =
        document.querySelector(
            `link[data-component-css="${path}"]`
        );


    if (existing) {

        return;

    }


    const stylesheet =
        document.createElement("link");


    stylesheet.rel = "stylesheet";

    stylesheet.href = path;

    stylesheet.dataset.componentCss = path;


    document.head.appendChild(
        stylesheet
    );

}


/* =================================
   JS LOADER
================================= */

function loadComponentJS(path) {

    const existing =
        document.querySelector(
            `script[data-component-js="${path}"]`
        );


    if (existing) {

        return;

    }


    const script =
        document.createElement("script");


    script.src = path;

    script.defer = true;

    script.dataset.componentJs = path;


    document.body.appendChild(
        script
    );

}