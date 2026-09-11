/* =================================
   PORTFOLIO PAGE
================================= */


/* =================================
   DOM ELEMENTS
================================= */

const caseStudiesGrid =
    document.getElementById(
        "case-studies-grid"
    );


const portfolioEmpty =
    document.getElementById(
        "portfolio-empty"
    );



/* =================================
   GET CASE STUDIES
================================= */

function getCaseStudies() {

    /*
     * Support several common names
     * so the page remains flexible.
     */

    if (
        typeof caseStudies !== "undefined"
    ) {

        return caseStudies;

    }


    if (
        typeof caseStudiesData !== "undefined"
    ) {

        return caseStudiesData;

    }


    if (
        typeof CASE_STUDIES !== "undefined"
    ) {

        return CASE_STUDIES;

    }


    return [];

}



/* =================================
   CREATE CASE CARD
================================= */

function createCaseCard(
    study,
    index
) {

    const card =
        document.createElement("article");


    card.className =
        "case-card";


    const title =
        study.title
        || study.name
        || "Untitled Case Study";


    const category =
        study.category
        || study.type
        || "Revenue Leak";


    const summary =
        study.summary
        || study.description
        || "A revenue leak investigation.";


    const problem =
        study.problem
        || study.challenge
        || "Conversion friction detected.";


    const outcome =
        study.outcome
        || study.result
        || study.impact
        || "Opportunity identified.";


    card.innerHTML = `

        <div class="case-card-top">

            <span class="case-number">
                CASE ${String(index + 1).padStart(2, "0")}
            </span>

            <span class="case-category">
                ${escapeHTML(category)}
            </span>

        </div>


        <h3>
            ${escapeHTML(title)}
        </h3>


        <p class="case-card-summary">
            ${escapeHTML(summary)}
        </p>


        <div class="case-card-meta">

            <div class="case-meta">

                <span>
                    The Problem
                </span>

                <strong>
                    ${escapeHTML(
                        shorten(problem, 70)
                    )}
                </strong>

            </div>


            <div class="case-meta">

                <span>
                    The Opportunity
                </span>

                <strong>
                    ${escapeHTML(
                        shorten(outcome, 70)
                    )}
                </strong>

            </div>

        </div>


        <button
            type="button"
            class="case-card-button"
            data-case-index="${index}"
        >

            <span>
                Open Case File
            </span>

            <span>
                →
            </span>

        </button>

    `;


    return card;

}



/* =================================
   RENDER CASE STUDIES
================================= */

function renderCaseStudies() {

    if (!caseStudiesGrid) {

        return;

    }


    const studies =
        getCaseStudies();


    caseStudiesGrid.innerHTML = "";


    if (
        !Array.isArray(studies)
        || studies.length === 0
    ) {

        if (portfolioEmpty) {

            portfolioEmpty.hidden = false;

        }

        return;

    }


    if (portfolioEmpty) {

        portfolioEmpty.hidden = true;

    }


    studies.forEach(
        (study, index) => {

            const card =
                createCaseCard(
                    study,
                    index
                );


            caseStudiesGrid.appendChild(
                card
            );

        }
    );



    /* ============================
       BUTTON EVENTS
    ============================ */

    const buttons =
        caseStudiesGrid.querySelectorAll(
            "[data-case-index]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    Number(
                        button.dataset.caseIndex
                    );


                openCaseStudy(
                    studies[index]
                );

            }
        );

    });

}



/* =================================
   CREATE MODAL
================================= */

function createModal() {

    let modal =
        document.getElementById(
            "case-modal"
        );


    if (modal) {

        return modal;

    }


    modal =
        document.createElement("div");


    modal.id =
        "case-modal";


    modal.className =
        "case-modal";


    modal.hidden = true;


    modal.innerHTML = `

        <div
            class="case-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-modal-title"
        >

            <button
                type="button"
                class="case-modal-close"
                id="case-modal-close"
                aria-label="Close case study"
            >
                ×
            </button>


            <div
                id="case-modal-body"
            ></div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        document.getElementById(
            "case-modal-close"
        );


    closeButton.addEventListener(
        "click",
        closeCaseStudy
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeCaseStudy();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
                && !modal.hidden
            ) {

                closeCaseStudy();

            }

        }
    );


    return modal;

}



/* =================================
   OPEN CASE STUDY
================================= */

function openCaseStudy(study) {

    if (!study) {

        return;

    }


    const modal =
        createModal();


    const body =
        document.getElementById(
            "case-modal-body"
        );


    const title =
        study.title
        || study.name
        || "Case Study";


    const category =
        study.category
        || study.type
        || "Revenue Leak";


    const summary =
        study.summary
        || study.description
        || "";


    const problem =
        study.problem
        || study.challenge
        || "Not specified.";


    const investigation =
        study.investigation
        || study.approach
        || study.process
        || "Investigation focused on identifying friction throughout the customer journey.";


    const findings =
        study.findings
        || study.leak
        || study.discovery
        || "A potential leak was identified within the journey.";


    const solution =
        study.solution
        || study.fix
        || study.recommendation
        || "A targeted improvement was recommended.";


    const outcome =
        study.outcome
        || study.result
        || study.impact
        || "Improved conversion opportunity identified.";


    body.innerHTML = `

        <div class="case-modal-header">

            <span class="eyebrow">
                ${escapeHTML(category)}
            </span>


            <h2 id="case-modal-title">
                ${escapeHTML(title)}
            </h2>


            <p>
                ${escapeHTML(summary)}
            </p>

        </div>


        <div class="modal-section">

            <h3>
                The Problem
            </h3>

            <p>
                ${escapeHTML(problem)}
            </p>

        </div>


        <div class="modal-section">

            <h3>
                The Investigation
            </h3>

            <p>
                ${escapeHTML(investigation)}
            </p>

        </div>


        <div class="modal-section">

            <h3>
                What Was Found
            </h3>

            <p>
                ${escapeHTML(findings)}
            </p>

        </div>


        <div class="modal-section">

            <h3>
                The Fix
            </h3>

            <p>
                ${escapeHTML(solution)}
            </p>

        </div>


        <div class="modal-section">

            <h3>
                The Opportunity
            </h3>

            <p>
                ${escapeHTML(outcome)}
            </p>

        </div>

    `;


    modal.hidden = false;


    document.body.style.overflow =
        "hidden";

}



/* =================================
   CLOSE CASE STUDY
================================= */

function closeCaseStudy() {

    const modal =
        document.getElementById(
            "case-modal"
        );


    if (!modal) {

        return;

    }


    modal.hidden = true;


    document.body.style.overflow =
        "";

}



/* =================================
   SHORTEN TEXT
================================= */

function shorten(
    text,
    maxLength
) {

    if (!text) {

        return "";

    }


    const value =
        String(text);


    if (
        value.length <= maxLength
    ) {

        return value;

    }


    return (
        value.substring(
            0,
            maxLength
        ).trim()
        + "..."
    );

}



/* =================================
   ESCAPE HTML
================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}



/* =================================
   INITIALIZE
================================= */

function initPortfolio() {

    renderCaseStudies();

}



/* =================================
   START
================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initPortfolio
    );

} else {

    initPortfolio();

}