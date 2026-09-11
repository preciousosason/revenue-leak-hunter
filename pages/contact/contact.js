document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("leak-hunt-form");

    const success =
        document.getElementById("form-success");


    if (!form || !success) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            /*
             * DEVELOPMENT MODE
             *
             * This currently does not send
             * the form anywhere.
             *
             * A real form endpoint will be
             * connected before launch.
             */


            form.hidden = true;

            success.hidden = false;


            success.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }
    );

});