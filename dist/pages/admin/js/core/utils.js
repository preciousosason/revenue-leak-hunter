/* =========================================================
   ADMIN CORE UTILITIES
   ========================================================= */

export function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


export function formatDate(dateString) {

    if (!dateString) {
        return "Unknown";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown";
    }

    return date.toLocaleString(
        undefined,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


export function formatRelativeTime(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const difference =
        Date.now() -
        date.getTime();

    const seconds =
        Math.floor(
            difference / 1000
        );

    if (seconds < 60) {
        return "Just now";
    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days < 7) {
        return `${days}d ago`;
    }

    return formatDate(
        dateString
    );

}


export function getInitials(name) {

    if (!name) {
        return "?";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            part =>
                part[0]?.toUpperCase()
        )
        .join("");

}

export function formatFileSize(bytes) {

    const size =
        Number(bytes);

    if (
        !Number.isFinite(size) ||
        size < 0
    ) {
        return "";
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (
        size <
        1024 * 1024
    ) {

        return `${(
            size / 1024
        ).toFixed(1)} KB`;

    }

    return `${(
        size /
        (1024 * 1024)
    ).toFixed(1)} MB`;

}


export function getFileLabel(file) {

    const category =
        String(
            file?.category || ""
        ).toLowerCase();

    const contentType =
        String(
            file?.contentType || ""
        ).toLowerCase();

    if (
        category === "image" ||
        contentType.startsWith("image/")
    ) {
        return "IMG";
    }

    if (
        category === "pdf" ||
        contentType === "application/pdf"
    ) {
        return "PDF";
    }

    if (category === "document") {
        return "DOC";
    }

    if (category === "spreadsheet") {
        return "XLS";
    }

    if (category === "presentation") {
        return "PPT";
    }

    if (category === "text") {
        return "TXT";
    }

    return "FILE";

}


export function linkifyMessage(value) {

    const escaped =
        escapeHTML(
            value ?? ""
        );

    const pattern =
        /((?:https?:\/\/|www\.)[^\s<]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

    return escaped
        .replace(
            pattern,
            match => {

                let cleanMatch =
                    match;

                let trailing =
                    "";

                while (
                    /[.,!?;:)]$/.test(
                        cleanMatch
                    )
                ) {

                    trailing =
                        cleanMatch.slice(-1) +
                        trailing;

                    cleanMatch =
                        cleanMatch.slice(
                            0,
                            -1
                        );

                }

                if (
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                        cleanMatch
                    )
                ) {

                    return (
                        `<a href="mailto:${cleanMatch}" ` +
                        `class="message-link message-email">` +
                        `${cleanMatch}` +
                        `</a>` +
                        trailing
                    );

                }

                const href =
                    /^https?:\/\//i.test(
                        cleanMatch
                    )
                        ? cleanMatch
                        : `https://${cleanMatch}`;

                return (
                    `<a href="${href}" ` +
                    `target="_blank" ` +
                    `rel="noopener noreferrer" ` +
                    `class="message-link">` +
                    `${cleanMatch}` +
                    `</a>` +
                    trailing
                );

            }
        )
        .replace(
            /\n/g,
            "<br>"
        );

}