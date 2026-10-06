/* =========================================================
   PRECIOUS ELIJAH
   HEALTH & WELLNESS ARTICLE

   ARTICLE 03:
   WHY YOU CAN FEEL TIRED AFTER SLEEPING
========================================================= */

"use strict";


const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* =========================================================
   CURRENT YEAR
========================================================= */

function setCurrentYear() {
  const yearElement = document.getElementById(
    "current-year"
  );

  if (!yearElement) return;

  yearElement.textContent =
    new Date().getFullYear();
}


/* =========================================================
   READING TIME
========================================================= */

function calculateReadingTime() {
  const article = document.getElementById(
    "article-content"
  );

  const output = document.getElementById(
    "reading-time"
  );

  if (!article || !output) return;

  const text = article.textContent
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return;

  const wordCount = text
    .split(" ")
    .filter(Boolean)
    .length;

  const wordsPerMinute = 220;

  const minutes = Math.max(
    1,
    Math.ceil(
      wordCount / wordsPerMinute
    )
  );

  output.textContent =
    `${minutes} min read`;
}


/* =========================================================
   READING PROGRESS
========================================================= */

function initReadingProgress() {
  const progressBar = document.getElementById(
    "reading-progress-bar"
  );

  const article = document.getElementById(
    "article-content"
  );

  if (!progressBar || !article) return;


  let ticking = false;


  function updateProgress() {
    const rect =
      article.getBoundingClientRect();

    const articleStart =
      window.scrollY +
      rect.top;

    const articleHeight =
      article.offsetHeight;

    const viewportHeight =
      window.innerHeight;

    const readableDistance =
      Math.max(
        articleHeight - viewportHeight,
        1
      );

    const distanceRead =
      window.scrollY -
      articleStart;

    const progress =
      Math.min(
        Math.max(
          distanceRead / readableDistance,
          0
        ),
        1
      );

    progressBar.style.width =
      `${progress * 100}%`;
  }


  function requestUpdate() {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updateProgress();
      ticking = false;
    });
  }


  updateProgress();

  window.addEventListener(
    "scroll",
    requestUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestUpdate,
    { passive: true }
  );
}


/* =========================================================
   SECTION REVEALS
========================================================= */

function initSectionReveals() {
  const elements = document.querySelectorAll(
    [
      ".factor-overview",
      ".article-section",
      ".medical-note__inner",
      ".sources-section",
      ".writer-note"
    ].join(",")
  );

  if (!elements.length) return;


  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {

    elements.forEach((element) => {
      element.classList.add("is-visible");
    });

    return;
  }


  const observer = new IntersectionObserver(
    (entries, currentObserver) => {

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add(
          "is-visible"
        );

        currentObserver.unobserve(
          entry.target
        );
      });

    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -45px 0px"
    }
  );


  elements.forEach((element) => {
    element.classList.add(
      "reveal-ready"
    );

    observer.observe(element);
  });
}


/* =========================================================
   EXTERNAL LINK SAFETY
========================================================= */

function secureExternalLinks() {
  const links = document.querySelectorAll(
    'a[target="_blank"]'
  );

  links.forEach((link) => {

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
   INITIALIZE
========================================================= */

function initArticle() {
  setCurrentYear();
  calculateReadingTime();
  initReadingProgress();
  initSectionReveals();
  secureExternalLinks();
}


if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initArticle,
    { once: true }
  );

} else {

  initArticle();

}