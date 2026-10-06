/* =========================================================
   PRECIOUS ELIJAH
   HEALTH & WELLNESS WRITING PORTFOLIO

   Lightweight interaction only.
   The writing remains the main event.
========================================================= */

"use strict";


/* =========================================================
   01. HELPERS
========================================================= */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* =========================================================
   02. CURRENT YEAR
========================================================= */

function setCurrentYear() {
  const yearElement = document.getElementById("current-year");

  if (!yearElement) return;

  yearElement.textContent = new Date().getFullYear();
}


/* =========================================================
   03. ARTICLE REVEAL
   ---------------------------------------------------------
   Adds a subtle entrance as article rows enter the viewport.

   If reduced motion is enabled, everything appears
   immediately.
========================================================= */

function initArticleReveal() {
  const articleCards = document.querySelectorAll(".article-card");

  if (!articleCards.length) return;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    articleCards.forEach((card) => {
      card.classList.add("is-visible");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");

        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  articleCards.forEach((card) => {
    card.classList.add("reveal-ready");
    observer.observe(card);
  });
}


/* =========================================================
   04. ARTICLE LINK INTENT
   ---------------------------------------------------------
   Adds a class briefly before navigating.

   This gives CSS the option to provide a restrained visual
   response when someone chooses an article.

   Navigation is never delayed.
========================================================= */

function initArticleLinks() {
  const articleLinks = document.querySelectorAll(
    ".article-card__link"
  );

  if (!articleLinks.length) return;

  articleLinks.forEach((link) => {
    link.addEventListener("click", () => {
      link.classList.add("is-opening");
    });
  });
}


/* =========================================================
   05. KEYBOARD ARTICLE FEEDBACK
   ---------------------------------------------------------
   Article cards are already native links, so keyboard
   navigation works without JavaScript.

   This only gives keyboard users the same visual intent
   state available to pointer users.
========================================================= */

function initKeyboardFeedback() {
  const articleLinks = document.querySelectorAll(
    ".article-card__link"
  );

  articleLinks.forEach((link) => {
    link.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;

      link.classList.add("is-opening");
    });
  });
}


/* =========================================================
   06. EXTERNAL LINK SAFETY
   ---------------------------------------------------------
   Future-proofing:
   if external links are added later and opened in a new tab,
   make sure they cannot access the originating window.
========================================================= */

function secureExternalLinks() {
  const externalLinks = document.querySelectorAll(
    'a[target="_blank"]'
  );

  externalLinks.forEach((link) => {
    const relValues = new Set(
      (link.getAttribute("rel") || "")
        .split(/\s+/)
        .filter(Boolean)
    );

    relValues.add("noopener");
    relValues.add("noreferrer");

    link.setAttribute(
      "rel",
      Array.from(relValues).join(" ")
    );
  });
}


/* =========================================================
   07. INITIALIZE
========================================================= */

function initPortfolio() {
  setCurrentYear();
  initArticleReveal();
  initArticleLinks();
  initKeyboardFeedback();
  secureExternalLinks();
}


if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initPortfolio,
    { once: true }
  );
} else {
  initPortfolio();
}