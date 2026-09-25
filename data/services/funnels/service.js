export default {
    id: "service-003",
    slug: "funnels",
    number: "03",
    type: "JOURNEY ARCHITECTURE",
    category: "CONNECT",
    title: "Funnels That Don't Leak",
    icon: "⌁",

    summary:
        "Connect every step from first click to final action so prospects don't disappear between stages.",

    featured: false,

    listLabel: "I connect",

    bullets: [
        "Funnel architecture",
        "Landing pages",
        "Lead capture",
        "Follow-up journeys"
    ],

    focus:
        "Connecting acquisition, consideration, capture, and follow-up into one deliberate journey.",

    primaryProblem:
        "Each individual step may work while the handoffs between those steps quietly lose people.",

    situation: `
        A funnel is only as strong as the transitions between its stages.

        Someone may click an advertisement, understand the landing page,
        submit a form, and then receive a weak follow-up sequence that
        breaks the momentum.

        I examine the entire path and design the stages to work together
        instead of treating them as separate marketing assets.
    `,

    areas: [
        {
            number: "01",
            title: "Broken Handoff",
            severity: "HIGH FRICTION",

            what:
                "The promise made at one stage does not clearly continue into the next stage.",

            why:
                "A mismatch can make the visitor question whether they are still in the right place.",

            fix:
                "Align the message, expectation, and next action across every transition.",

            stage:
                "Stage transition"
        },

        {
            number: "02",
            title: "Capture Friction",
            severity: "FRICTION",

            what:
                "The lead capture step asks for too much information or provides too little reason to continue.",

            why:
                "Interest can disappear when the exchange feels unbalanced.",

            fix:
                "Simplify the capture experience and strengthen the value of taking the next step.",

            stage:
                "Lead capture"
        },

        {
            number: "03",
            title: "Follow-up Gap",
            severity: "HIGH FRICTION",

            what:
                "New leads are captured but the follow-up journey is delayed, inconsistent, or disconnected.",

            why:
                "The period immediately after capture can be critical for maintaining context and momentum.",

            fix:
                "Create a deliberate sequence that educates, reassures, qualifies, and advances the conversation.",

            stage:
                "Follow-up"
        },

        {
            number: "04",
            title: "Dead-End Stage",
            severity: "STRUCTURAL",

            what:
                "A funnel stage gives the visitor nowhere useful to go after completing the expected action.",

            why:
                "Momentum is wasted when the next opportunity is not designed.",

            fix:
                "Define the next logical action for every major stage of the journey.",

            stage:
                "Post-action"
        }
    ],

    currentPath: [
        "Traffic",
        "Landing page",
        "Form",
        "Silence"
    ],

    proposedPath: [
        "Traffic",
        "Landing page",
        "Capture",
        "Nurture",
        "Decision"
    ],

    deliverables: [
        "Funnel architecture",
        "Landing-page structure",
        "Lead capture flow",
        "Follow-up journey"
    ],

    process: [
        "Map the funnel",
        "Identify broken transitions",
        "Build the key stages",
        "Connect follow-up"
    ],

    impact:
        "The goal is a connected journey where each stage prepares the visitor for the next instead of forcing them to restart their decision.",

    conclusion:
        "A funnel should move people forward, not make them repeatedly figure out where they are."
};