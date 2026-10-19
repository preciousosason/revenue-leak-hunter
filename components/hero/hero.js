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


/* ==========================================
   HERO — ROTATING HEADLINE SYSTEM
========================================== */

function initializeRotatingHeadline() {
  const hero = document.querySelector(".hero");
  const text = hero?.querySelector("#hero-changing-text");

  if (!hero || !text) return;

  // Prevent duplicate initialization.
  if (text.dataset.rotatingInitialized === "true") return;
  text.dataset.rotatingInitialized = "true";

  const headlines = [
    "Find Out Why More Isn't Enough.",
    "Find Out What Happens Before They Leave.",
    "Make Sure You're Not Losing the Ones You Have.",
    "Find Out Why More Isn't Working.",
    "Question What's Happening to the Traffic You Have.",
    "Fix What More Traffic Can't.",
    "See What More Traffic Might Be Hiding.",
    "Find Out What's Getting in the Way."
  ];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let currentIndex = 0;
  let timer = null;
  let transitionTimer = null;
  let visible = true;
  let paused = false;

  // Time between headline changes.
  const CHANGE_INTERVAL = 3000;

  function stopRotation() {
    clearTimeout(timer);
    timer = null;

    if (transitionTimer !== null) {
      clearTimeout(transitionTimer);
      transitionTimer = null;

      text.classList.remove("is-leaving");
      text.classList.remove("is-entering");
    }
  }

  function rotateHeadline() {
    text.classList.remove("is-entering");
    text.classList.add("is-leaving");

    transitionTimer = setTimeout(() => {
      transitionTimer = null;

      currentIndex = (currentIndex + 1) % headlines.length;

      text.textContent = headlines[currentIndex];

      text.classList.remove("is-leaving");

      // Restart the entrance animation.
      void text.offsetWidth;

      text.classList.add("is-entering");

      startRotation();
    }, 180);
  }

  function startRotation() {
    clearTimeout(timer);

    if (
      paused ||
      !visible ||
      document.hidden ||
      reducedMotion.matches
    ) return;

    timer = setTimeout(rotateHeadline, CHANGE_INTERVAL);
  }

  function updateRotation() {
    stopRotation();
    startRotation();
  }

  // Pause while hovering over the changing headline.
  text.addEventListener("mouseenter", () => {
    paused = true;
    stopRotation();
  });

  text.addEventListener("mouseleave", () => {
    paused = false;
    startRotation();
  });

  // Pause when the browser tab is hidden.
  document.addEventListener(
    "visibilitychange",
    updateRotation
  );

  // Respect reduced-motion settings.
  reducedMotion.addEventListener(
    "change",
    updateRotation
  );

  // Avoid running while the hero is offscreen.
  if ("IntersectionObserver" in window) {
    visible = false;

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        updateRotation();
      },
      { threshold: 0.2 }
    );

    observer.observe(hero);
  }

  startRotation();
}

// Initialize after the hero component loads.
initializeRotatingHeadline();
