export function createId() {
    return crypto.randomUUID();
}

export function generatePortalToken() {
    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    const randomValues =
        new Uint32Array(16);

    crypto.getRandomValues(
        randomValues
    );

    const groups = [];

    for (
        let group = 0;
        group < 4;
        group++
    ) {
        let value = "";

        for (
            let i = 0;
            i < 4;
            i++
        ) {
            const index =
                randomValues[
                    group * 4 + i
                ] %
                characters.length;

            value += characters[index];
        }

        groups.push(value);
    }

    return `LH-${groups.join("-")}`;
}

