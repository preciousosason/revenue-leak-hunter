document.addEventListener("DOMContentLoaded", () => {

    const grid =
        document.getElementById("case-studies-grid");

    const emptyState =
        document.getElementById("portfolio-empty");

    const modal =
        document.getElementById("case-modal");

    const modalBody =
        document.getElementById("case-modal-body");

    const closeButton =
        document.getElementById("case-modal-close");


    if (!grid || !modal || !modalBody) {
        return;
    }


    const studies =
        Array.isArray(window.caseStudies)
            ? window.caseStudies
            : (typeof caseStudies !== "undefined"
                ? caseStudies
                : []);


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


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


    function renderJourney(items) {

        return `
            <div class="journey">
                ${items.map((item, index) => `

                    <span class="journey-step">
                        ${escapeHTML(item)}
                    </span>

                    ${
                        index < items.length - 1
                            ? `<span
                                class="journey-arrow"
                                aria-hidden="true"
                            >→</span>`
                            : ""
                    }

                `).join("")}
            </div>
        `;

    }


    function renderLeak(leak) {

        return `
            <article class="leak-item">

                <div class="leak-item-header">

                    <div>

                        <span class="leak-number">
                            ${escapeHTML(leak.number)}
                        </span>

                        <h4>
                            ${escapeHTML(leak.title)}
                        </h4>

                    </div>

                    <span class="leak-severity">
                        ${escapeHTML(leak.severity)}
                    </span>

                </div>


                <div class="leak-detail">

                    <span class="leak-detail-label">
                        What's Happening
                    </span>

                    <p>
                        ${escapeHTML(leak.what)}
                    </p>

                </div>


                <div class="leak-detail">

                    <span class="leak-detail-label">
                        Why It Matters
                    </span>

                    <p>
                        ${escapeHTML(leak.why)}
                    </p>

                </div>


                <div class="leak-detail">

                    <span class="leak-detail-label">
                        What I'd Change
                    </span>

                    <p>
                        ${escapeHTML(leak.fix)}
                    </p>

                </div>


                <div class="leak-detail">

                    <span class="leak-detail-label">
                        Journey Stage
                    </span>

                    <p>
                        ${escapeHTML(leak.stage)}
                    </p>

                </div>

            </article>
        `;

    }


    function renderInvestigation(study) {

        const currentPath =
            study.currentPath || [];

        const proposedPath =
            study.proposedPath || [];

        modalBody.innerHTML = `

            <header class="case-modal-header">

                <span class="eyebrow">
                    ${escapeHTML(study.number)}
                </span>

                <h2 id="case-modal-title">
                    ${escapeHTML(study.title)}
                </h2>

                <p>
                    ${escapeHTML(study.summary)}
                </p>

            </header>


            <div class="modal-file-meta">

                <div class="modal-highlight">

                    <span>
                        Type
                    </span>

                    <strong>
                        ${escapeHTML(study.type)}
                    </strong>

                </div>


                <div class="modal-highlight">

                    <span>
                        Industry
                    </span>

                    <strong>
                        ${escapeHTML(study.category)}
                    </strong>

                </div>


                <div class="modal-highlight">

                    <span>
                        Investigation Focus
                    </span>

                    <strong>
                        ${escapeHTML(study.focus)}
                    </strong>

                </div>

            </div>


            <section class="modal-section">

                <span class="eyebrow">
                    01 / THE SITUATION
                </span>

                <h3>
                    The problem starts before the obvious problem.
                </h3>

                ${formatParagraphs(study.situation)}

            </section>


            <section class="modal-section">

                <span class="eyebrow">
                    02 / THE JOURNEY
                </span>

                <h3>
                    Follow the customer.
                </h3>

                <p>
                    Before changing anything, I map the path the
                    customer is expected to take.
                </p>

                ${renderJourney(study.journey)}

            </section>


            <section class="modal-section">

                <span class="eyebrow">
                    03 / THE PRIMARY LEAK
                </span>

                <div class="modal-quote">
                    ${escapeHTML(study.primaryLeak)}
                </div>

            </section>


            <section class="modal-section">

                <span class="eyebrow">
                    04 / THE LEAKS
                </span>

                <h3>
                    Where the journey starts losing momentum.
                </h3>

                <div class="leak-list">

                    ${study.leaks
                        .map(renderLeak)
                        .join("")}

                </div>

            </section>


            <section class="modal-section">

                <span class="eyebrow">
                    05 / THE FIX
                </span>

                <h3>
                    Rebuild the journey around the decision.
                </h3>

                <p>
                    The goal is not to add more information.
                    The goal is to make the right information appear
                    at the right point in the decision.
                </p>


                <div class="modal-grid">

                    <div class="modal-highlight">

                        <span>
                            Current Path
                        </span>

                        ${renderJourney(currentPath)}

                    </div>


                    <div class="modal-highlight">

                        <span>
                            Proposed Path
                        </span>

                        ${renderJourney(proposedPath)}

                    </div>

                </div>

            </section>


            <section class="modal-section">

                <span class="eyebrow">
                    06 / EXPECTED IMPACT
                </span>

                <h3>
                    What the changes are designed to improve.
                </h3>

                <p>
                    ${escapeHTML(study.impact)}
                </p>

            </section>


            <section class="modal-section">

                <div class="modal-conclusion">

                    <span class="eyebrow">
                        THE HUNT
                    </span>

                    <h3>
                        ${escapeHTML(study.conclusion)}
                    </h3>

                    <p>
                        This is an illustrative investigation,
                        not a client result.
                    </p>

                </div>

            </section>

        `;

    }


    function renderCards() {

        if (!studies.length) {

            emptyState.hidden = false;

            return;
        }


        emptyState.hidden = true;


        grid.innerHTML =
            studies.map(study => `

                <article
                    class="case-card"
                    data-case-id="${escapeHTML(study.id)}"
                >

                    <div class="case-card-top">

                        <span class="case-number">
                            ${escapeHTML(study.number)}
                        </span>

                        <span class="case-category">
                            ${escapeHTML(study.category)}
                        </span>

                    </div>


                    <span class="case-type">
                        ${escapeHTML(study.type)}
                    </span>


                    <h3>
                        ${escapeHTML(study.title)}
                    </h3>


                    <p class="case-card-summary">
                        ${escapeHTML(study.summary)}
                    </p>


                    <div class="case-card-meta">

                        <div class="case-meta">

                            <span>
                                Focus
                            </span>

                            <strong>
                                ${escapeHTML(study.focus)}
                            </strong>

                        </div>


                        <div class="case-meta">

                            <span>
                                Primary Leak
                            </span>

                            <strong>
                                ${escapeHTML(study.primaryLeak)}
                            </strong>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="case-card-button"
                        data-case-id="${escapeHTML(study.id)}"
                    >

                        <span>
                            Open Investigation
                        </span>

                        <span aria-hidden="true">
                            →
                        </span>

                    </button>

                </article>

            `).join("");

    }


    function openModal(id) {

        const study =
            studies.find(item => item.id === id);

        if (!study) {
            return;
        }


        renderInvestigation(study);


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


    grid.addEventListener("click", event => {

        const button =
            event.target.closest(
                "[data-case-id]"
            );

        if (!button) {
            return;
        }


        openModal(
            button.dataset.caseId
        );

    });


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


    renderCards();

});