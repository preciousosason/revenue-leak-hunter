export default {
    id: "service-008",
    slug: "conversion-intelligence",
    number: "08",
    type: "BEHAVIORAL MEASUREMENT",
    category: "MEASURE",
    title: "Conversion Intelligence",
    icon: "◫",

    summary:
        "Turn customer behavior into evidence about where people hesitate, disappear, and convert.",

    featured: false,

    listLabel: "I measure",

    bullets: [
        "Conversion tracking",
        "Funnel analytics",
        "Event tracking",
        "Behavioral insights"
    ],

    focus:
        "Replacing assumptions about customer behavior with useful evidence.",

    primaryProblem:
        "The business knows the final numbers but cannot clearly explain what is happening between the beginning and the outcome.",

    situation: `
        A conversion number tells you what happened.
        It does not always tell you why.

        Useful measurement connects important customer actions across the
        journey so that friction, drop-off, and successful behavior become
        easier to investigate.
    `,

    areas: [
        {
            number: "01",
            title: "Measurement Blind Spot",
            severity: "CRITICAL",

            what:
                "Important actions in the journey are not being tracked consistently.",

            why:
                "Missing data creates gaps between what the business thinks is happening and what visitors actually do.",

            fix:
                "Define the important events and establish a reliable measurement structure.",

            stage:
                "Tracking"
        },

        {
            number: "02",
            title: "Funnel Drop-off",
            severity: "HIGH FRICTION",

            what:
                "The business can see that conversion is low but cannot isolate where the largest drop-offs occur.",

            why:
                "Without stage-level visibility, optimization becomes guesswork.",

            fix:
                "Track meaningful funnel stages and compare progression between them.",

            stage:
                "Funnel"
        },

        {
            number: "03",
            title: "Behavior Gap",
            severity: "ANALYTICAL",

            what:
                "Aggregate metrics hide important differences in how visitors interact with the experience.",

            why:
                "Different traffic sources, devices, or user groups may encounter different problems.",

            fix:
                "Segment useful behavioral data and investigate meaningful patterns.",

            stage:
                "Behavior"
        },

        {
            number: "04",
            title: "Insight Delay",
            severity: "OPERATIONAL",

            what:
                "Data exists but is difficult to interpret or connect to an actual decision.",

            why:
                "Measurement has limited value when it does not influence action.",

            fix:
                "Turn important signals into clear questions, investigations, and priorities.",

            stage:
                "Decision"
        }
    ],

    currentPath: [
        "Collect data",
        "View numbers",
        "Guess",
        "Change things"
    ],

    proposedPath: [
        "Define events",
        "Track behavior",
        "Find patterns",
        "Investigate",
        "Improve"
    ],

    deliverables: [
        "Conversion tracking plan",
        "Funnel measurement",
        "Event tracking structure",
        "Behavioral analysis"
    ],

    process: [
        "Define important actions",
        "Implement measurement",
        "Analyze behavior",
        "Turn signals into decisions"
    ],

    impact:
        "The goal is to make customer behavior easier to observe and turn measurement into evidence that can guide practical improvements.",

    conclusion:
        "Measure the journey, not just the destination."
};