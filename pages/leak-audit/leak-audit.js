document.addEventListener("DOMContentLoaded", () => {

    /* =================================
       SMOOTH SCROLL
    ================================= */

    const scrollLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );


    scrollLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const targetId =
                    link.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });


    /* =================================
       BUTTON INTERACTION
    ================================= */

    const primaryButtons =
        document.querySelectorAll(
            ".audit-primary-button"
        );


    primaryButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                button.classList.add(
                    "is-clicked"
                );

            }
        );

    });

});