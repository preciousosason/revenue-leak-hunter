/* =========================================================
   CONVERSION LEAK HUNTING
========================================================= */

export default {

    id: "service-001",

    slug: "conversion-leak-hunting",

    number: "01",

    type: "CONVERSION INVESTIGATION",

    category: "FIND",

    title: "Conversion Leak Hunting",

    icon: "↗",


    /* =====================================================
       CARD
    ===================================================== */

    summary:
        "Find where interested visitors hesitate, get confused, or leave, and uncover what is getting in the way of action.",

    featured: false,

    listLabel: "I investigate",

    bullets: [
        "Conversion friction",
        "Landing pages",
        "Calls-to-action",
        "Offers and decision points"
    ],


    /* =====================================================
       CORE FOCUS
    ===================================================== */

    focus:
        "Finding the moments where interest starts to break down before the action you want people to take.",


    /* =====================================================
       PRIMARY PROBLEM
    ===================================================== */

    primaryProblem:
        "People are reaching the experience, but something is making too many of them hesitate, lose trust, or leave before they act.",


    /* =====================================================
       01 / THE SITUATION
    ===================================================== */

    situation: `
        Someone finds you.

        They click.
        They land on the page.
        They look around.

        For a moment, you have their attention.

        But attention is not the same as action.

        They might not understand what you are offering.
        They might not see why it matters to them.
        They might have a question that the page never answers.
        Or they might simply not know what to do next.

        So they hesitate.

        And when that hesitation is not resolved, they leave.

        The frustrating part is that the visitor may have been interested.

        The problem was not always getting them there.

        Something happened after they arrived.

        That is the part I investigate.

        I follow the journey from the first impression to the point where someone is expected to take action.

        Then I look for the moments where the experience creates confusion, doubt, friction, or unnecessary effort.

        Because when people stop moving forward, there is usually something worth investigating.
    `,


    /* =====================================================
       SERVICE-SPECIFIC SECTION HEADINGS
    ===================================================== */

    sections: {

        problem: {
            eyebrow: "01 / START HERE",
            title:
                "Getting attention is only the beginning."
        },


        primaryLeak: {
            eyebrow: "02 / THE REAL LEAK",
            title:
                "Somewhere between interest and action, momentum is disappearing."
        },


        investigation: {
            eyebrow: "03 / FOLLOW THE LEAK",
            title:
                "So we trace the moments where people start pulling away."
        },


        approach: {
            eyebrow: "04 / HOW I HUNT",
            title:
                "I follow the journey from the first impression to the final action."
        },


        journey: {
            eyebrow: "05 / THE SHIFT",
            title:
                "The goal is not more attention. It is less wasted attention."
        },


        deliverables: {
            eyebrow: "06 / WHAT I WORK ON",
            title:
                "The work focuses on the leaks we actually find."
        },


        impact: {
            eyebrow: "07 / WHAT CHANGES",
            title:
                "The path becomes easier to understand and easier to act on."
        }

    },


    /* =====================================================
       INVESTIGATION AREAS
    ===================================================== */

    areas: [

        {
            number: "01",

            title: "Unclear Value",

            severity: "CLARITY GAP",

            whatLabel:
                "What I Look For",

            what:
                "The visitor cannot quickly understand what is being offered, who it is for, or why it matters to them.",

            whyLabel:
                "Why It Matters",

            why:
                "When people have to work too hard to understand the value, interest can turn into uncertainty before the journey even gets started.",

            fixLabel:
                "What I Work On",

            fix:
                "We make the offer, audience, outcome, and key message easier to understand from the start.",

            stageLabel:
                "Where It Happens",

            stage:
                "First impression"
        },


        {
            number: "02",

            title: "A Broken Decision Path",

            severity: "PATH FRICTION",

            whatLabel:
                "What I Look For",

            what:
                "The page gives people information, but does not give them a clear reason or natural path to move from understanding to action.",

            whyLabel:
                "Why It Matters",

            why:
                "People can be interested and still hesitate when the next step feels disconnected from what they have just learned.",

            fixLabel:
                "What I Work On",

            fix:
                "We connect the message, proof, objections, and call-to-action so each part helps move the visitor toward the next decision.",

            stageLabel:
                "Where It Happens",

            stage:
                "Consideration"
        },


        {
            number: "03",

            title: "Trust Gaps",

            severity: "TRUST GAP",

            whatLabel:
                "What I Look For",

            what:
                "The experience asks people to commit before giving them enough information, proof, or reassurance to feel comfortable doing it.",

            whyLabel:
                "Why It Matters",

            why:
                "A visitor can understand the offer and still leave because one important doubt has not been answered.",

            fixLabel:
                "What I Work On",

            fix:
                "We bring the right proof, explanations, reassurance, and objection handling closer to the moments where people are deciding.",

            stageLabel:
                "Where It Happens",

            stage:
                "Decision"
        },


        {
            number: "04",

            title: "Action Friction",

            severity: "ACTION GAP",

            whatLabel:
                "What I Look For",

            what:
                "The final action is harder, less obvious, or more demanding than it needs to be.",

            whyLabel:
                "Why It Matters",

            why:
                "Small obstacles matter more when they appear at the exact moment someone is ready to act.",

            fixLabel:
                "What I Work On",

            fix:
                "We simplify the action path, strengthen the CTA, remove unnecessary steps, and reduce avoidable resistance.",

            stageLabel:
                "Where It Happens",

            stage:
                "Conversion"
        }

    ],


    /* =====================================================
       CURRENT VS BETTER PATH
    ===================================================== */

    currentPath: [
        "Attention",
        "Uncertainty",
        "Hesitation",
        "Drop-off"
    ],


    proposedPath: [
        "Attention",
        "Clarity",
        "Trust",
        "Decision",
        "Action"
    ],


    /* =====================================================
       HOW I WORK
    ===================================================== */

    process: [

        {
            title:
                "Map the journey",

            description:
                "We start with the path a visitor takes, from the first page they see to the action you want them to complete."
        },


        {
            title:
                "Find the friction",

            description:
                "We look for the moments where the experience becomes confusing, demanding, uncertain, or difficult to move through."
        },


        {
            title:
                "Trace the leak",

            description:
                "We connect what we find across the page, message, offer, trust signals, calls-to-action, and decision points."
        },


        {
            title:
                "Separate symptoms from causes",

            description:
                "A low conversion rate is a symptom. We look underneath it to find the parts of the experience that may be creating the problem."
        },


        {
            title:
                "Prioritize the fixes",

            description:
                "Not every issue deserves the same attention, so we focus on the leaks that are most useful to investigate or improve first."
        }

    ],


    /* =====================================================
       DELIVERABLES
    ===================================================== */

    deliverables: [

        "Conversion leak investigation",

        "Journey and friction analysis",

        "Priority leak breakdown",

        "Conversion improvement recommendations",

        "Action priority list"

    ],


    /* =====================================================
       IMPACT
    ===================================================== */

    impact:
        "Instead of simply knowing that people are leaving, you get a clearer view of where momentum is being lost, what may be causing it, and which parts of the journey deserve attention.",


    /* =====================================================
       CONCLUSION
    ===================================================== */

    conclusion:
        "Don't just watch people leave. Find the moment they started to pull away, then investigate what caused it."

};