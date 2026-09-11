/* =========================================
   ARTICLE PAGE
========================================= */


/*
 * Handle the comment form.
 *
 * For now this is frontend-only.
 * A real persistent comment system requires
 * a backend or external comment service.
 */

const commentForm =
    document.querySelector(
        ".comment-form"
    );


if (commentForm) {

    commentForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const textarea =
                commentForm.querySelector(
                    "textarea"
                );


            if (
                !textarea.value.trim()
            ) {

                textarea.focus();

                return;

            }


            /*
             * Temporary behavior.
             *
             * We will replace this with
             * the actual comment system
             * later if needed.
             */

            alert(
                "Comments will be connected when the comment system is added."
            );

        }
    );

}