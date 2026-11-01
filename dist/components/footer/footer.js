/* =================================
   FOOTER
================================= */


/* =================================
   INITIALIZE FOOTER
================================= */

function initFooter() {

    const yearElement =
        document.getElementById("footer-year");


    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }



}
