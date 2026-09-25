export default {
    id: "service-007",
    slug: "customer-journey",
    number: "07",
    type: "EXPERIENCE ANALYSIS",
    category: "EXPERIENCE",
    title: "Customer Journey Engineering",
    icon: "◉",

    summary:
        "Trace the experience from first interaction to final decision and remove friction that quietly pushes customers away.",

    featured: false,

    listLabel: "I map",

    bullets: [
        "Customer journey mapping",
        "Touchpoint analysis",
        "UX and onboarding",
        "Cross-channel handoffs"
    ],

    focus:
        "Understanding the complete customer experience instead of optimizing isolated touchpoints.",

    primaryProblem:
        "Individual touchpoints work independently, but the experience between them feels disconnected.",

    situation: `
        Customers do not experience a business as separate departments,
        pages, campaigns, forms, emails, and support systems.

        They experience one journey.

        I trace that journey across the important touchpoints and identify
        where expectations, information, or momentum break between them.
    `,

    areas: [
        {
            number: "01",
            title: "Expectation Gap",
            severity: "HIGH FRICTION",

            what:
                "The experience promises one thing at an early touchpoint and delivers something different later.",

            why:
                "Expectation gaps create confusion and reduce confidence.",

            fix:
                "Align promises, messaging, handoffs, and delivery across the journey.",

            stage:
                "Expectation"
        },

        {
            number: "02",
            title: "Touchpoint Friction",
            severity: "FRICTION",

            what:
                "A customer encounters unnecessary effort at one or more important interaction points.",

            why:
                "Repeated small obstacles can create significant overall friction.",

            fix:
                "Identify and remove unnecessary steps, repetition, confusion, and delays.",

            stage:
                "Interaction"
        },

        {
            number: "03",
            title: "Onboarding Drop",
            severity: "HIGH FRICTION",

            what:
                "Customers complete an initial action but are not clearly guided through what happens next.",

            why:
                "Early uncertainty can weaken adoption and confidence.",

            fix:
                "Create a clear onboarding sequence with useful guidance and meaningful milestones.",

            stage:
                "Onboarding"
        },

        {
            number: "04",
            title: "Channel Disconnect",
            severity: "STRUCTURAL",

            what:
                "Website, email, sales, support, or other channels provide disconnected information.",

            why:
                "Customers should not have to reconstruct their own history every time they change channels.",

            fix:
                "Define consistent information, expectations, and handoffs between channels.",

            stage:
                "Cross-channel"
        }
    ],

    currentPath: [
        "Discover",
        "Switch channels",
        "Repeat context",
        "Hesitate"
    ],

    proposedPath: [
        "Discover",
        "Understand",
        "Interact",
        "Continue",
        "Decide"
    ],

    deliverables: [
        "Customer journey map",
        "Touchpoint analysis",
        "Onboarding review",
        "Cross-channel recommendations"
    ],

    process: [
        "Map the customer experience",
        "Document important touchpoints",
        "Identify friction and gaps",
        "Prioritize journey improvements"
    ],

    impact:
        "The goal is to create a more coherent experience where each interaction supports the next instead of forcing customers to start over.",

    conclusion:
        "The customer sees one journey. The business should too."
};