/* =========================================================
   SYSTEM CLOCK
   ========================================================= */

let clockInterval = null;


export function updateSystemClock() {

    const systemClock =
        document.getElementById(
            "system-clock"
        );

    if (!systemClock) {
        return;
    }

    const now =
        new Date();

    systemClock.textContent =
        now.toLocaleTimeString(
            undefined,
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            }
        );

}


export function startSystemClock() {

    updateSystemClock();

    if (clockInterval) {
        clearInterval(
            clockInterval
        );
    }

    clockInterval =
        setInterval(
            updateSystemClock,
            1000
        );

}


export function stopSystemClock() {

    if (!clockInterval) {
        return;
    }

    clearInterval(
        clockInterval
    );

    clockInterval = null;

}