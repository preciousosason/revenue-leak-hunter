/* =========================================================
   SERVICES PAGE
========================================================= */

import { services as serviceRegistry }
    from "../../data/services/services.js";


/* =========================================================
   SERVICE DATA
========================================================= */

async function loadServices() {

    const modules =
        await Promise.all(
            serviceRegistry.map(
                async service => {

                    const module =
                        await import(
                            `../../data/services/${service.slug}/service.js`
                        );

                    return module.default;

                }
            )
        );


    return modules;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   FORMAT PARAGRAPHS
========================================================= */

function formatParagraphs(text) {

    return String(text || "")
        .trim()
        .split(/\n\s*\n/)
        .map(paragraph => {

            const cleaned =
                paragraph
                    .replace(/\s+/g, " ")
                    .trim();


            return cleaned
                ? `<p>${escapeHTML(cleaned)}</p>`
                : "";

        })
        .join("");

}


/* =========================================================
   RENDER JOURNEY
========================================================= */

function renderJourney(items) {

    if (!Array.isArray(items) || !items.length) {
        return "";
    }


    return `
        <div class="journey">

            ${items.map(
                (item, index) => `

                    <span class="journey-step">
                        ${escapeHTML(item)}
                    </span>

                    ${
                        index < items.length - 1
                            ? `
                                <span
                                    class="journey-arrow"
                                    aria-hidden="true"
                                >
                                    →
                                </span>
                            `
                            : ""
                    }

                `
            ).join("")}

        </div>
    `;

}


/* =========================================================
   RENDER SERVICE AREAS
========================================================= */

function renderServiceArea(area) {

    return `
        <article class="leak-item">

            <div class="leak-item-header">

                <div>

                    <span class="leak-number">
                        ${escapeHTML(area.number)}
                    </span>

                    <h4>
                        ${escapeHTML(area.title)}
                    </h4>

                </div>


                <span class="leak-severity">
                    ${escapeHTML(area.severity)}
                </span>

            </div>


            <div class="leak-detail">

                <span class="leak-detail-label">
                    What I Look For
                </span>

                <p>
                    ${escapeHTML(area.what)}
                </p>

            </div>


            <div class="leak-detail">

                <span class="leak-detail-label">
                    Why It Matters
                </span>

                <p>
                    ${escapeHTML(area.why)}
                </p>

            </div>


            <div class="leak-detail">

                <span class="leak-detail-label">
                    What I Work On
                </span>

                <p>
                    ${escapeHTML(area.fix)}
                </p>

            </div>


            <div class="leak-detail">

                <span class="leak-detail-label">
                    Focus
                </span>

                <p>
                    ${escapeHTML(area.stage)}
                </p>

            </div>

        </article>
    `;

}


/* =========================================================
   RENDER SERVICE MODAL
========================================================= */

function renderService(service) {

    const currentPath =
        service.currentPath || [];


    const proposedPath =
        service.proposedPath || [];


    const areas =
        Array.isArray(service.areas)
            ? service.areas
            : [];


    const deliverables =
        Array.isArray(service.deliverables)
            ? service.deliverables
            : [];


    const process =
        Array.isArray(service.process)
            ? service.process
            : [];


    const deliverablesHTML =
        deliverables.length
            ? `
                <div class="service-modal-list">

                    ${deliverables.map(
                        (item, index) => `

                            <div class="service-modal-list-item">

                                <span>
                                    ${String(index + 1).padStart(2, "0")}
                                </span>

                                <strong>
                                    ${escapeHTML(item)}
                                </strong>

                            </div>

                        `
                    ).join("")}

                </div>
            `
            : "";


    const processHTML =
        process.length
            ? `
                <div class="service-modal-process">

                    ${process.map(
                        (item, index) => `

                            <div class="service-process-step">

                                <span>
                                    ${String(index + 1).padStart(2, "0")}
                                </span>

                                <div>
                                    <strong>
                                        ${escapeHTML(item.title)}
                                    </strong>

                                    <p>
                                        ${escapeHTML(item.description)}
                                    </p>
                                </div>

                            </div>

                        `
                    ).join("")}

                </div>
            `
            : "";


    return `

        <header class="case-modal-header">

            <span class="eyebrow">
                ${escapeHTML(service.number)}
            </span>


            <h2 id="service-modal-title">
                ${escapeHTML(service.title)}
            </h2>


            <p>
                ${escapeHTML(service.summary)}
            </p>

        </header>


        <div class="modal-file-meta">

            <div class="modal-highlight">

                <span>
                    Type
                </span>

                <strong>
                    ${escapeHTML(service.type)}
                </strong>

            </div>


            <div class="modal-highlight">

                <span>
                    Category
                </span>

                <strong>
                    ${escapeHTML(service.category)}
                </strong>

            </div>


            <div class="modal-highlight">

                <span>
                    Investigation Focus
                </span>

                <strong>
                    ${escapeHTML(service.focus)}
                </strong>

            </div>

        </div>


        <section class="modal-section">

            <span class="eyebrow">
                01 / THE PROBLEM
            </span>


            <h3>
                The service starts with the problem, not the tactic.
            </h3>


            ${formatParagraphs(service.situation)}

        </section>


        <section class="modal-section">

            <span class="eyebrow">
                02 / THE PRIMARY LEAK
            </span>


            <div class="modal-quote">
                ${escapeHTML(service.primaryProblem)}
            </div>

        </section>


        <section class="modal-section">

            <span class="eyebrow">
                03 / WHAT I INVESTIGATE
            </span>


            <h3>
                Where the experience can start losing momentum.
            </h3>


            <div class="leak-list">

                ${areas
                    .map(renderServiceArea)
                    .join("")}

            </div>

        </section>


        <section class="modal-section">

            <span class="eyebrow">
                04 / THE APPROACH
            </span>


            <h3>
                Understand the system before changing it.
            </h3>


            ${processHTML}

        </section>


        <section class="modal-section">

            <span class="eyebrow">
                05 / THE JOURNEY
            </span>


            <h3>
                Follow the path from problem to action.
            </h3>


            <div class="modal-grid">

                <div class="modal-highlight">

                    <span>
                        Current Path
                    </span>

                    ${renderJourney(currentPath)}

                </div>


                <div class="modal-highlight">

                    <span>
                        Improved Path
                    </span>

                    ${renderJourney(proposedPath)}

                </div>

            </div>

        </section>


        <section class="modal-section">

            <span class="eyebrow">
                06 / WHAT YOU GET
            </span>


            <h3>
                Practical work built around the actual problem.
            </h3>


            ${deliverablesHTML}

        </section>


        <section class="modal-section">

            <span class="eyebrow">
                07 / INTENDED IMPACT
            </span>


            <h3>
                What the work is designed to improve.
            </h3>


            <p>
                ${escapeHTML(service.impact)}
            </p>

        </section>


        <section class="modal-section">

            <div class="modal-conclusion">

                <span class="eyebrow">
                    THE HUNT
                </span>


                <h3>
                    ${escapeHTML(service.conclusion)}
                </h3>


                <p>
                    This describes the service approach,
                    not a claimed client result.
                </p>

            </div>

        </section>

    `;

}


/* =========================================================
   RENDER SERVICE CARDS
========================================================= */

function renderServices(serviceData) {

    const grid =
        document.getElementById(
            "servicesGrid"
        );


    if (!grid) {
        return false;
    }


    grid.innerHTML =
        serviceData
            .map(service => {

                const featuredClass =
                    service.featured
                        ? " featured-service"
                        : "";


                const badge =
                    service.badge
                        ? `
                            <span class="service-card-badge">
                                ${escapeHTML(service.badge)}
                            </span>
                        `
                        : "";


                const bullets =
                    Array.isArray(service.bullets)
                        ? service.bullets
                            .map(
                                bullet => `
                                    <li>
                                        ${escapeHTML(bullet)}
                                    </li>
                                `
                            )
                            .join("")
                        : "";


                return `
                    <article
                        class="service-card${featuredClass}"
                        data-service-id="${escapeHTML(service.id)}"
                        tabindex="0"
                        role="button"
                        aria-label="Explore ${escapeHTML(service.title)}"
                    >

                        <div class="service-card-top">

                            <span class="service-number">
                                ${escapeHTML(service.number)}
                            </span>


                            <span class="service-icon">
                                ${escapeHTML(service.icon)}
                            </span>


                            <span class="service-category">
                                ${escapeHTML(service.category)}
                            </span>


                            ${badge}

                        </div>


                        <h3>
                            ${escapeHTML(service.title)}
                        </h3>


                        <p>
                            ${escapeHTML(
                                service.description ||
                                service.summary
                            )}
                        </p>


                        <div class="service-divider"></div>


                        <h4>
                            ${escapeHTML(service.listLabel)}
                        </h4>


                        <ul>
                            ${bullets}
                        </ul>


                        <span class="service-link">

                            ${escapeHTML(
                                service.linkText ||
                                "Explore service"
                            )}

                            <span aria-hidden="true">
                                →
                            </span>

                        </span>

                    </article>
                `;

            })
            .join("");


    return true;

}


/* =========================================================
   SERVICE MODAL
========================================================= */

function initServiceModal(serviceData) {

    const modal =
        document.getElementById(
            "service-modal"
        );


    const modalBody =
        document.getElementById(
            "service-modal-body"
        );


    const closeButton =
        document.getElementById(
            "service-modal-close"
        );


    const grid =
        document.getElementById(
            "servicesGrid"
        );


    if (
        !modal ||
        !modalBody ||
        !grid
    ) {
        return;

    }


    function openModal(id) {

        const service =
            serviceData.find(
                item => item.id === id
            );


        if (!service) {
            return;
        }


        modalBody.innerHTML =
            renderService(service);


        modal.hidden = false;


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        closeButton?.focus();

    }


    function closeModal() {

        modal.hidden = true;


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.style.overflow =
            "";

    }


    grid.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(
                    "[data-service-id]"
                );


            if (!card) {
                return;
            }


            openModal(
                card.dataset.serviceId
            );

        }
    );


    grid.addEventListener(
        "keydown",
        event => {

            const card =
                event.target.closest(
                    "[data-service-id]"
                );


            if (!card) {
                return;
            }


            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();


                openModal(
                    card.dataset.serviceId
                );

            }

        }
    );


    closeButton?.addEventListener(
        "click",
        closeModal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

async function initServicesPage() {

    try {

        const serviceData =
            await loadServices();


        const rendered =
            renderServices(
                serviceData
            );


        if (!rendered) {
            return;
        }


        initServiceModal(
            serviceData
        );


    } catch (error) {

        console.error(
            "Failed to load services:",
            error
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * SERVICE CARD REVEAL
     * -----------------------------------------------------
     */

    const revealElements =
        document.querySelectorAll(
            ".service-card, .method-card, .fit-item"
        );


    if (!revealElements.length) {
        return;
    }


    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (prefersReducedMotion) {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "is-visible"
                );

            }
        );

    } else {

        revealElements.forEach(
            (element, index) => {

                element.style.transitionDelay =
                    `${Math.min(index * 60, 360)}ms`;

            }
        );


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target.classList.add(
                            "is-visible"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    });

                },
                {
                    threshold: 0.12,
                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );


        revealElements.forEach(
            element => {

                observer.observe(
                    element
                );

            }
        );

    }


    /*
     * -----------------------------------------------------
     * SERVICE CARD INTERACTION
     * -----------------------------------------------------
     */

    const serviceCards =
        document.querySelectorAll(
            ".service-card"
        );


    serviceCards.forEach(card => {

        card.addEventListener(
            "pointermove",
            event => {

                if (
                    window.matchMedia(
                        "(hover: none)"
                    ).matches
                ) {
                    return;
                }


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left;


                const y =
                    event.clientY -
                    rect.top;


                const rotateX =
                    ((y / rect.height) - 0.5) *
                    -2;


                const rotateY =
                    ((x / rect.width) - 0.5) *
                    2;


                card.style.transform =
                    `translateY(-7px) perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            }
        );


        card.addEventListener(
            "pointerleave",
            () => {

                card.style.transform =
                    "";

            }
        );


        card.addEventListener(
            "focus",
            () => {

                card.classList.add(
                    "is-focused"
                );

            }
        );


        card.addEventListener(
            "blur",
            () => {

                card.classList.remove(
                    "is-focused"
                );

            }
        );


        card.addEventListener(
            "pointerdown",
            () => {

                card.classList.add(
                    "is-pressed"
                );

            }
        );


        card.addEventListener(
            "pointerup",
            () => {

                card.classList.remove(
                    "is-pressed"
                );

            }
        );


        card.addEventListener(
            "pointercancel",
            () => {

                card.classList.remove(
                    "is-pressed"
                );

            }
        );

    });


    /*
     * -----------------------------------------------------
     * SCANNER STAGE INTERACTION
     * -----------------------------------------------------
     */

    const funnelStages =
        document.querySelectorAll(
            ".funnel-stage"
        );


    if (
        funnelStages.length &&
        !prefersReducedMotion
    ) {

        let activeStage = 0;


        const activateStage = () => {

            funnelStages.forEach(
                stage => {

                    stage.classList.remove(
                        "scanner-active"
                    );

                }
            );


            if (
                funnelStages[activeStage]
            ) {

                funnelStages[activeStage]
                    .classList.add(
                        "scanner-active"
                    );

            }


            activeStage =
                (activeStage + 1) %
                funnelStages.length;

        };


        activateStage();


        setInterval(
            activateStage,
            2200
        );

    }

}


/* =========================================================
   LEAK AUDIT NOTIFICATION
========================================================= */

function initAuditNotification() {

    const notification =
        document.getElementById(
            "auditNotification"
        );


    const actionButton =
        document.getElementById(
            "auditNotificationAction"
        );


    const closeButton =
        document.getElementById(
            "auditNotificationClose"
        );


    const auditSection =
        document.getElementById(
            "leak-audit"
        );


    if (
        !notification ||
        !auditSection
    ) {
        return;
    }


    const showTimer =
        setTimeout(() => {

            notification.classList.add(
                "is-visible"
            );


            notification.setAttribute(
                "aria-hidden",
                "false"
            );

        }, 10000);


    if (actionButton) {

        actionButton.addEventListener(
            "click",
            () => {

                auditSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


                notification.classList.remove(
                    "is-visible"
                );


                notification.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                clearTimeout(
                    showTimer
                );


                notification.classList.remove(
                    "is-visible"
                );


                notification.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }

}


/* =========================================================
   PAGE START
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        async () => {

            await initServicesPage();

            initAuditNotification();

        }
    );

} else {

    await initServicesPage();

    initAuditNotification();

}