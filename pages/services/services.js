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

    if (
        !Array.isArray(items) ||
        !items.length
    ) {
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

    if (!area) {
        return "";
    }


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


                ${
                    area.severity
                        ? `
                            <span class="leak-severity">
                                ${escapeHTML(
                                    area.severity
                                )}
                            </span>
                        `
                        : ""
                }

            </div>


            ${
                area.what
                    ? `
                        <div class="leak-detail">

                            <span class="leak-detail-label">
                                ${escapeHTML(
                                    area.whatLabel ||
                                    "What I Look For"
                                )}
                            </span>

                            <p>
                                ${escapeHTML(area.what)}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                area.why
                    ? `
                        <div class="leak-detail">

                            <span class="leak-detail-label">
                                ${escapeHTML(
                                    area.whyLabel ||
                                    "Why It Matters"
                                )}
                            </span>

                            <p>
                                ${escapeHTML(area.why)}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                area.fix
                    ? `
                        <div class="leak-detail">

                            <span class="leak-detail-label">
                                ${escapeHTML(
                                    area.fixLabel ||
                                    "What I Work On"
                                )}
                            </span>

                            <p>
                                ${escapeHTML(area.fix)}
                            </p>

                        </div>
                    `
                    : ""
            }


            ${
                area.stage
                    ? `
                        <div class="leak-detail">

                            <span class="leak-detail-label">
                                ${escapeHTML(
                                    area.stageLabel ||
                                    "Focus"
                                )}
                            </span>

                            <p>
                                ${escapeHTML(area.stage)}
                            </p>

                        </div>
                    `
                    : ""
            }

        </article>
    `;

}


/* =========================================================
   RENDER PROCESS
========================================================= */

function renderProcess(process) {

    if (
        !Array.isArray(process) ||
        !process.length
    ) {
        return "";
    }


    return `
        <div class="service-modal-process">

            ${process.map(
                (item, index) => {

                    const title =
                        typeof item === "string"
                            ? item
                            : item?.title || "";


                    const description =
                        typeof item === "string"
                            ? ""
                            : item?.description || "";


                    return `
                        <div class="service-process-step">

                            <span>
                                ${String(
                                    index + 1
                                ).padStart(2, "0")}
                            </span>


                            <div>

                                <strong>
                                    ${escapeHTML(title)}
                                </strong>


                                ${
                                    description
                                        ? `
                                            <p>
                                                ${escapeHTML(
                                                    description
                                                )}
                                            </p>
                                        `
                                        : ""
                                }

                            </div>

                        </div>
                    `;

                }
            ).join("")}

        </div>
    `;

}


/* =========================================================
   RENDER DELIVERABLES
========================================================= */

function renderDeliverables(deliverables) {

    if (
        !Array.isArray(deliverables) ||
        !deliverables.length
    ) {
        return "";
    }


    return `
        <div class="service-modal-list">

            ${deliverables.map(
                (item, index) => `

                    <div class="service-modal-list-item">

                        <span>
                            ${String(
                                index + 1
                            ).padStart(2, "0")}
                        </span>

                        <strong>
                            ${escapeHTML(item)}
                        </strong>

                    </div>

                `
            ).join("")}

        </div>
    `;

}


/* =========================================================
   GET SECTION CONTENT
========================================================= */

function getSection(
    service,
    key,
    fallbackEyebrow,
    fallbackTitle
) {

    const section =
        service.sections?.[key] || {};


    return {

        eyebrow:
            section.eyebrow ||
            fallbackEyebrow,

        title:
            section.title ||
            fallbackTitle

    };

}


/* =========================================================
   RENDER SERVICE
========================================================= */

function renderService(service) {

    const currentPath =
        Array.isArray(service.currentPath)
            ? service.currentPath
            : [];


    const proposedPath =
        Array.isArray(service.proposedPath)
            ? service.proposedPath
            : [];


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


    /* -----------------------------------------------------
       SECTION COPY
    ----------------------------------------------------- */

    const problemSection =
        getSection(
            service,
            "problem",
            "01 / START HERE",
            "Start with what is actually happening."
        );


    const primaryLeakSection =
        getSection(
            service,
            "primaryLeak",
            "02 / THE REAL GAP",
            "Find the part that is getting in the way."
        );


    const investigationSection =
        getSection(
            service,
            "investigation",
            "03 / FOLLOW THE CLUES",
            "Look closer at what is really happening."
        );


    const approachSection =
        getSection(
            service,
            "approach",
            "04 / HOW I WORK",
            "Follow the problem before trying to fix it."
        );


    const journeySection =
        getSection(
            service,
            "journey",
            "05 / THE SHIFT",
            "Move from guessing to seeing what is actually happening."
        );


    const deliverablesSection =
        getSection(
            service,
            "deliverables",
            "06 / WHAT I WORK ON",
            "The work follows what we find."
        );


    const impactSection =
        getSection(
            service,
            "impact",
            "07 / WHAT CHANGES",
            "Turn what we find into something useful."
        );


    const processHTML =
        renderProcess(process);


    const deliverablesHTML =
        renderDeliverables(
            deliverables
        );


    return `

        <!-- =============================================
             HEADER
        ============================================== -->

        <header class="case-modal-header">

            <span class="eyebrow">
                ${escapeHTML(service.number)}
            </span>


            <h2 id="service-modal-title">
                ${escapeHTML(service.title)}
            </h2>


            <p>
                ${escapeHTML(
                    service.summary
                )}
            </p>

        </header>


        <!-- =============================================
             META
        ============================================== -->

        <div class="modal-file-meta">

            <div class="modal-highlight">

                <span>
                    Type
                </span>

                <strong>
                    ${escapeHTML(
                        service.type
                    )}
                </strong>

            </div>


            <div class="modal-highlight">

                <span>
                    Category
                </span>

                <strong>
                    ${escapeHTML(
                        service.category
                    )}
                </strong>

            </div>


            <div class="modal-highlight">

                <span>
                    Investigation Focus
                </span>

                <strong>
                    ${escapeHTML(
                        service.focus
                    )}
                </strong>

            </div>

        </div>


        <!-- =============================================
             01 / PROBLEM
        ============================================== -->

        ${
            service.situation
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                problemSection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                problemSection.title
                            )}
                        </h3>


                        ${formatParagraphs(
                            service.situation
                        )}

                    </section>
                `
                : ""
        }


        <!-- =============================================
             02 / PRIMARY PROBLEM
        ============================================== -->

        ${
            service.primaryProblem
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                primaryLeakSection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                primaryLeakSection.title
                            )}
                        </h3>


                        <div class="modal-quote">
                            ${escapeHTML(
                                service.primaryProblem
                            )}
                        </div>

                    </section>
                `
                : ""
        }


        <!-- =============================================
             03 / INVESTIGATION
        ============================================== -->

        ${
            areas.length
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                investigationSection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                investigationSection.title
                            )}
                        </h3>


                        <div class="leak-list">

                            ${areas
                                .map(
                                    renderServiceArea
                                )
                                .join("")}

                        </div>

                    </section>
                `
                : ""
        }


        <!-- =============================================
             04 / APPROACH
        ============================================== -->

        ${
            processHTML
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                approachSection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                approachSection.title
                            )}
                        </h3>


                        ${processHTML}

                    </section>
                `
                : ""
        }


        <!-- =============================================
             05 / JOURNEY
        ============================================== -->

        ${
            currentPath.length ||
            proposedPath.length
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                journeySection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                journeySection.title
                            )}
                        </h3>


                        <div class="modal-grid">

                            ${
                                currentPath.length
                                    ? `
                                        <div class="modal-highlight">

                                            <span>
                                                Current Path
                                            </span>

                                            ${renderJourney(
                                                currentPath
                                            )}

                                        </div>
                                    `
                                    : ""
                            }


                            ${
                                proposedPath.length
                                    ? `
                                        <div class="modal-highlight">

                                            <span>
                                                Better Path
                                            </span>

                                            ${renderJourney(
                                                proposedPath
                                            )}

                                        </div>
                                    `
                                    : ""
                            }

                        </div>

                    </section>
                `
                : ""
        }


        <!-- =============================================
             06 / DELIVERABLES
        ============================================== -->

        ${
            deliverablesHTML
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                deliverablesSection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                deliverablesSection.title
                            )}
                        </h3>


                        ${deliverablesHTML}

                    </section>
                `
                : ""
        }


        <!-- =============================================
             07 / IMPACT
        ============================================== -->

        ${
            service.impact
                ? `
                    <section class="modal-section">

                        <span class="eyebrow">
                            ${escapeHTML(
                                impactSection.eyebrow
                            )}
                        </span>


                        <h3>
                            ${escapeHTML(
                                impactSection.title
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                service.impact
                            )}
                        </p>

                    </section>
                `
                : ""
        }


        <!-- =============================================
             CONCLUSION
        ============================================== -->

        ${
            service.conclusion
                ? `
                    <section class="modal-section">

                        <div class="modal-conclusion">

                            <span class="eyebrow">
                                THE HUNT
                            </span>


                            <h3>
                                ${escapeHTML(
                                    service.conclusion
                                )}
                            </h3>


                            <p>
                                This describes the service approach,
                                not a claimed client result.
                            </p>

                        </div>

                    </section>
                `
                : ""
        }

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
                                ${escapeHTML(
                                    service.badge
                                )}
                            </span>
                        `
                        : "";


                const bullets =
                    Array.isArray(
                        service.bullets
                    )
                        ? service.bullets
                            .map(
                                bullet => `
                                    <li>
                                        ${escapeHTML(
                                            bullet
                                        )}
                                    </li>
                                `
                            )
                            .join("")
                        : "";


                return `
                    <article
                        class="service-card${featuredClass}"
                        data-service-id="${escapeHTML(
                            service.id
                        )}"
                        tabindex="0"
                        role="button"
                        aria-label="Explore ${escapeHTML(
                            service.title
                        )}"
                    >

                        <div class="service-card-top">

                            <span class="service-number">
                                ${escapeHTML(
                                    service.number
                                )}
                            </span>


                            <span class="service-icon">
                                ${escapeHTML(
                                    service.icon
                                )}
                            </span>


                            <span class="service-category">
                                ${escapeHTML(
                                    service.category
                                )}
                            </span>


                            ${badge}

                        </div>


                        <h3>
                            ${escapeHTML(
                                service.title
                            )}
                        </h3>


                        <p>
                            ${escapeHTML(
                                service.description ||
                                service.summary
                            )}
                        </p>


                        <div class="service-divider"></div>


                        <h4>
                            ${escapeHTML(
                                service.listLabel ||
                                "I investigate"
                            )}
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
   TYPEWRITER REVEAL
========================================================= */

function revealModalText(modalBody) {

    const walker =
        document.createTreeWalker(
            modalBody,
            NodeFilter.SHOW_TEXT
        );


    const textNodes = [];


    let node;


    while (
        (node = walker.nextNode())
    ) {

        const text =
            node.nodeValue || "";


        if (
            text.trim()
        ) {

            textNodes.push({
                node,
                text
            });

        }

    }


    textNodes.forEach(item => {

        item.node.nodeValue = "";

    });


    let nodeIndex = 0;
    let characterIndex = 0;


    const typeNext = () => {

        if (
            nodeIndex >=
            textNodes.length
        ) {
            return;
        }


        const current =
            textNodes[nodeIndex];


        const original =
            current.text;


        current.node.nodeValue =
            original.slice(
                0,
                characterIndex + 1
            );


        characterIndex++;


        if (
            characterIndex >=
            original.length
        ) {

            nodeIndex++;

            characterIndex = 0;


            requestAnimationFrame(
                typeNext
            );


            return;

        }


        const currentCharacter =
            original[
                characterIndex - 1
            ];


        /*
         * 20ms per character.
         *
         * The previous 0.2 was effectively
         * instant because JavaScript timers
         * use milliseconds.
         */

        const delay =
            /\s/.test(
                currentCharacter
            )
                ? 0
                : 20;


        const timer =
            setTimeout(
                typeNext,
                delay
            );


        typewriterTimers.push(
            timer
        );

    };


    requestAnimationFrame(
        typeNext
    );

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


    let loadingTimer = null;


    let typewriterTimers = [];


    let openingSequence = 0;


    function clearModalSequence() {

        openingSequence++;


        if (loadingTimer) {

            clearTimeout(
                loadingTimer
            );

            loadingTimer = null;

        }


        typewriterTimers.forEach(
            timer => {

                clearTimeout(
                    timer
                );

            }
        );


        typewriterTimers = [];

    }


    function openModal(id) {

        if (!modal.hidden) {
            return;
        }


        const service =
            serviceData.find(
                item =>
                    item.id === id
            );


        if (!service) {
            return;
        }


        clearModalSequence();


        const currentSequence =
            openingSequence;


        /*
         * -------------------------------------------------
         * LOADING STATE
         * -------------------------------------------------
         */

        modalBody.innerHTML = `
            <div
                class="modal-section"
                role="status"
                aria-live="polite"
            >

                <p>
                    Preparing this for you…
                </p>

            </div>
        `;


        modal.hidden = false;


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";


        closeButton?.focus();


        /*
         * -------------------------------------------------
         * WAIT 3 SECONDS
         * -------------------------------------------------
         */

        loadingTimer =
            setTimeout(() => {

                loadingTimer = null;


                if (
                    modal.hidden ||
                    currentSequence !==
                        openingSequence
                ) {
                    return;
                }


                /*
                 * Insert the actual
                 * service content.
                 */

                modalBody.innerHTML =
                    renderService(
                        service
                    );


                /*
                 * Then type it out.
                 */

                revealModalText(
                    modalBody
                );

            }, 3000);

    }


    function closeModal() {

        clearModalSequence();


        modal.hidden = true;


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        modalBody.innerHTML =
            "";


        document.body.style.overflow =
            "";

    }


    /* -----------------------------------------------------
       CLICK
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       KEYBOARD
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       CLOSE BUTTON
    ----------------------------------------------------- */

    closeButton?.addEventListener(
        "click",
        closeModal
    );


    /* -----------------------------------------------------
       BACKDROP
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       ESCAPE
    ----------------------------------------------------- */

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
   SERVICE CARD REVEAL
========================================================= */

function initServiceCardReveal() {

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


        return;

    }


    revealElements.forEach(
        (element, index) => {

            element.style.transitionDelay =
                `${Math.min(
                    index * 60,
                    360
                )}ms`;

        }
    );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

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

                    }
                );

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


/* =========================================================
   SERVICE CARD INTERACTION
========================================================= */

function initServiceCardInteraction() {

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

}


/* =========================================================
   SCANNER STAGE INTERACTION
========================================================= */

function initScannerStages() {

    const funnelStages =
        document.querySelectorAll(
            ".funnel-stage"
        );


    if (!funnelStages.length) {
        return;
    }


    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (prefersReducedMotion) {
        return;
    }


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
            (
                activeStage + 1
            ) %
            funnelStages.length;

    };


    activateStage();


    setInterval(
        activateStage,
        2200
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


        initServiceCardReveal();

        initServiceCardInteraction();

        initScannerStages();

    } catch (error) {

        console.error(
            "Failed to load services:",
            error
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