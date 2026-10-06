/* =========================================================
   PRECIOUS ELIJAH
   HEALTH & WELLNESS ARTICLE INTERACTIONS

   Article:
   Iron Deficiency
========================================================= */

"use strict";


/* =========================================================
   01. SETTINGS
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
   03. READING TIME
   ---------------------------------------------------------
   Calculates from the actual article text rather than
   hard-coding a number that becomes wrong after editing.
========================================================= */

function calculateReadingTime() {
  const article = document.getElementById("article-content");
  const readingTimeElement = document.getElementById(
    "reading-time"
  );

  if (!article || !readingTimeElement) return;

  const text = article.textContent
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return;

  const words = text.split(" ").filter(Boolean).length;

  const averageReadingSpeed = 220;

  const minutes = Math.max(
    1,
    Math.ceil(words / averageReadingSpeed)
  );

  readingTimeElement.textContent =
    `${minutes} min read`;
}


/* =========================================================
   04. READING PROGRESS
========================================================= */

function initReadingProgress() {
  const progressBar = document.getElementById(
    "reading-progress-bar"
  );

  const article = document.getElementById(
    "article-content"
  );

  if (!progressBar || !article) return;


  function updateProgress() {
    const articleRect = article.getBoundingClientRect();

    const articleTop =
      window.scrollY +
      articleRect.top;

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
      window.scrollY - articleTop;

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


  let ticking = false;

  function requestProgressUpdate() {
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
    requestProgressUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestProgressUpdate,
    { passive: true }
  );
}


/* =========================================================
   05. SECTION REVEALS
========================================================= */

function initSectionReveals() {
  const revealElements = document.querySelectorAll(
    [
      ".article-section",
      ".medical-note__inner",
      ".sources-section",
      ".writer-note"
    ].join(",")
  );

  if (!revealElements.length) return;


  if (
    prefersReducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    revealElements.forEach((element) => {
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


  revealElements.forEach((element) => {
    element.classList.add("reveal-ready");

    observer.observe(element);
  });
}


/* =========================================================
   06. EXTERNAL LINK SAFETY
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
   07. INITIALIZE
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