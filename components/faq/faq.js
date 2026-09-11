/* =================================
   FAQ COMPONENT
================================= */

function initializeFAQ() {

    const faqList =
        document.getElementById("faq-list");


    /* ============================
       CHECK FAQ CONTAINER
    ============================= */

    if (!faqList) {

        console.error(
            "FAQ: #faq-list was not found."
        );

        return;

    }


    /* ============================
       CHECK FAQ DATA
    ============================= */

    if (
        typeof faqData === "undefined" ||
        !Array.isArray(faqData)
    ) {

        console.error(
            "FAQ: faqData was not found."
        );

        return;

    }


    /* ============================
       GENERATE FAQ ITEMS
    ============================= */

    faqList.innerHTML = faqData
        .map((item, index) => {

            const questionId =
                `faq-question-${index}`;

            const answerId =
                `faq-answer-${index}`;


            return `
                <article class="faq-item">

                    <button
                        class="faq-question"
                        type="button"
                        aria-expanded="false"
                        aria-controls="${answerId}"
                        id="${questionId}"
                    >

                        <span class="faq-question-text">
                            ${item.question}
                        </span>

                        <span
                            class="faq-icon"
                            aria-hidden="true"
                        ></span>

                    </button>


                    <div
                        class="faq-answer"
                        id="${answerId}"
                        role="region"
                        aria-labelledby="${questionId}"
                    >

                        <div class="faq-answer-inner">

                            <p>
                                ${item.answer}
                            </p>

                        </div>

                    </div>

                </article>
            `;

        })
        .join("");


    /* ============================
       FAQ INTERACTION
    ============================= */

    const faqItems =
        faqList.querySelectorAll(
            ".faq-item"
        );


    faqItems.forEach((item) => {

        const button =
            item.querySelector(
                ".faq-question"
            );


        button.addEventListener(
            "click",
            () => {

                const isOpen =
                    item.classList.contains(
                        "is-open"
                    );


                /* ====================
                   CLOSE ALL
                ==================== */

                faqItems.forEach(
                    (otherItem) => {

                        otherItem.classList.remove(
                            "is-open"
                        );


                        const otherButton =
                            otherItem.querySelector(
                                ".faq-question"
                            );


                        if (otherButton) {

                            otherButton.setAttribute(
                                "aria-expanded",
                                "false"
                            );

                        }

                    }
                );


                /* ====================
                   OPEN SELECTED
                ==================== */

                if (!isOpen) {

                    item.classList.add(
                        "is-open"
                    );


                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }

            }
        );

    });


    console.log(
        `FAQ initialized successfully: ${faqData.length} questions loaded.`
    );

}


/* =================================
   INITIALIZE
================================= */

/*
   The component loader injects this
   script dynamically, so DOMContentLoaded
   may already have happened.

   Check the document state instead.
*/

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFAQ
    );

} else {

    initializeFAQ();

}