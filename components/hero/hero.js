/* =================================
   HERO
================================= */

function initializeHero() {

    const hero =
        document.querySelector(".hero");

    if (!hero) {
        return;
    }


    /* ================================
       HERO CONTENT REVEAL
    ================================= */

    const content =
        hero.querySelector(".hero-content");

    const visual =
        hero.querySelector(".hero-visual");


    if (content) {

        content.style.opacity = "0";
        content.style.transform = "translateY(20px)";

        requestAnimationFrame(() => {

            content.style.transition =
                "opacity 700ms ease, transform 700ms ease";

            content.style.opacity = "1";
            content.style.transform = "translateY(0)";

        });

    }


    if (visual) {

        visual.style.opacity = "0";
        visual.style.transform =
            "translateY(25px) scale(0.98)";

        requestAnimationFrame(() => {

            visual.style.transition =
                "opacity 900ms ease 150ms, transform 900ms ease 150ms";

            visual.style.opacity = "1";
            visual.style.transform =
                "translateY(0) scale(1)";

        });

    }

}


initializeHero();