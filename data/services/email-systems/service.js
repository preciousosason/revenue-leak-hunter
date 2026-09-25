export default {
    id: "service-006",
    slug: "email-systems",
    number: "06",
    type: "RETENTION SYSTEM",
    category: "RETAIN",
    title: "Email Systems That Keep Working",
    icon: "◌",

    summary:
        "Turn leads and customers into an owned audience with sequences, automation, and retention systems.",

    featured: false,

    listLabel: "I automate",

    bullets: [
        "Email sequences",
        "Lead nurturing",
        "Retention and re-engagement",
        "Automated customer journeys"
    ],

    focus:
        "Creating useful automated communication around the customer's stage and intent.",

    primaryProblem:
        "Leads and customers enter the system, but communication depends too heavily on manual follow-up.",

    situation: `
        Email becomes valuable when it is connected to the customer's
        journey rather than treated as a collection of broadcasts.

        A useful system can welcome new leads, answer common questions,
        nurture interest, support decisions, retain customers, and
        re-engage people who stopped responding.
    `,

    areas: [
        {
            number: "01",
            title: "Lead Follow-up Gap",
            severity: "HIGH FRICTION",

            what:
                "New leads are captured without a consistent sequence that continues the conversation.",

            why:
                "The context created during acquisition can disappear quickly without timely follow-up.",

            fix:
                "Create a structured welcome and nurture sequence tied to the original intent.",

            stage:
                "Lead nurture"
        },

        {
            number: "02",
            title: "Generic Communication",
            severity: "FRICTION",

            what:
                "Every subscriber receives essentially the same message regardless of where they are in the journey.",

            why:
                "Different stages require different information and expectations.",

            fix:
                "Use segmentation and behavioral triggers where they provide meaningful relevance.",

            stage:
                "Personalization"
        },

        {
            number: "03",
            title: "Retention Leak",
            severity: "HIGH FRICTION",

            what:
                "Existing customers receive little structured communication after the initial transaction.",

            why:
                "The relationship can become inactive even when another useful interaction is possible.",

            fix:
                "Design post-purchase, education, retention, and re-engagement journeys.",

            stage:
                "Retention"
        },

        {
            number: "04",
            title: "Manual Dependency",
            severity: "OPERATIONAL",

            what:
                "Important communication relies on someone remembering to send the right message at the right time.",

            why:
                "Manual processes become inconsistent as volume grows.",

            fix:
                "Automate repeatable journeys while keeping human intervention where it actually matters.",

            stage:
                "Automation"
        }
    ],

    currentPath: [
        "Capture",
        "Manual follow-up",
        "Inconsistent contact",
        "Drop-off"
    ],

    proposedPath: [
        "Capture",
        "Segment",
        "Nurture",
        "Convert",
        "Retain"
    ],

    deliverables: [
        "Email sequence architecture",
        "Lead nurture flows",
        "Retention sequences",
        "Re-engagement automation"
    ],

    process: [
        "Map communication triggers",
        "Define customer stages",
        "Write the sequences",
        "Connect automation"
    ],

    impact:
        "The goal is to keep useful communication moving without requiring the business to manually restart every customer conversation.",

    conclusion:
        "Build the follow-up once, then let the system keep the conversation moving."
};