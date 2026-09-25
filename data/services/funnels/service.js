/* =========================================================
   FUNNELS THAT DON'T LEAK
========================================================= */

export default {

    id: "service-003",

    slug: "funnels",

    number: "03",

    type: "JOURNEY ARCHITECTURE",

    category: "CONNECT",

    title: "Funnels That Don't Leak",

    icon: "⌁",


    /* =====================================================
       CARD
    ===================================================== */

    summary:
        "Connect each step from the first click to the next decision, so people do not get lost between stages.",

    featured: false,

    listLabel: "I connect",

    bullets: [
        "Funnel architecture",
        "Landing pages",
        "Lead capture",
        "Follow-up journeys"
    ],


    /* =====================================================
       CORE FOCUS
    ===================================================== */

    focus:
        "Connecting the different parts of the customer journey so each step makes the next one feel natural.",


    /* =====================================================
       PRIMARY PROBLEM
    ===================================================== */

    primaryProblem:
        "The individual steps may work, but the journey can still lose people when one stage does not lead naturally into the next.",


    /* =====================================================
       01 / THE SITUATION
    ===================================================== */

    situation: `
        A funnel is not just a landing page, a form, and a follow-up email sitting beside each other.

        It is a journey.

        Someone clicks an ad.
        They land on a page.
        They read the offer.
        They decide to continue.
        They fill out a form.

        And then what?

        If the next step feels disconnected, the momentum you worked to create can disappear.

        The message might change.
        The promise might feel different.
        The visitor might not know what happens next.
        Or they might simply be left waiting.

        That is where a funnel can start leaking.

        The problem is not always inside one stage.

        Sometimes the problem is the handoff between stages.

        So I look at the journey as one connected system.

        I trace what a person sees, expects, does, and receives at each step, then look for the places where the experience stops making sense.

        Because every stage should prepare people for what comes next.
    `,


    /* =====================================================
       SERVICE-SPECIFIC SECTION HEADINGS
    ===================================================== */

    sections: {

        problem: {
            eyebrow: "01 / START HERE",
            title:
                "A funnel is a journey, not a collection of separate pages."
        },


        primaryLeak: {
            eyebrow: "02 / THE REAL LEAK",
            title:
                "The handoff between stages is where momentum can disappear."
        },


        investigation: {
            eyebrow: "03 / FOLLOW THE HANDOFFS",
            title:
                "So we look at what happens every time someone moves forward."
        },


        approach: {
            eyebrow: "04 / HOW I CONNECT IT",
            title:
                "Each stage should make the next stage feel like the natural next step."
        },


        journey: {
            eyebrow: "05 / THE SHIFT",
            title:
                "The goal is to stop making people figure out what comes next."
        },


        deliverables: {
            eyebrow: "06 / WHAT I WORK ON",
            title:
                "The structure follows the journey we need to build."
        },


        impact: {
            eyebrow: "07 / WHAT CHANGES",
            title:
                "The funnel starts behaving like one journey instead of separate pieces."
        }

    },


    /* =====================================================
       INVESTIGATION AREAS
    ===================================================== */

    areas: [

        {
            number: "01",

            title: "Broken Handoffs",

            severity: "MESSAGE GAP",

            whatLabel:
                "What I Look For",

            what:
                "The promise, message, or expectation from one stage does not clearly continue into the next.",

            whyLabel:
                "Why It Matters",

            why:
                "When the experience suddenly feels different, people can question whether they are still in the right place or making the right decision.",

            fixLabel:
                "What I Work On",

            fix:
                "We connect the message, expectation, and next action so each stage follows naturally from the one before it.",

            stageLabel:
                "Where It Happens",

            stage:
                "Stage transition"
        },


        {
            number: "02",

            title: "Capture Friction",

            severity: "ACTION GAP",

            whatLabel:
                "What I Look For",

            what:
                "The lead capture step asks for more effort than the visitor expects or gives them too little reason to continue.",

            whyLabel:
                "Why It Matters",

            why:
                "Someone can be interested and still stop when the exchange suddenly feels like too much work.",

            fixLabel:
                "What I Work On",

            fix:
                "We simplify the capture experience and make the value of taking the next step clear before asking for the commitment.",

            stageLabel:
                "Where It Happens",

            stage:
                "Lead capture"
        },


        {
            number: "03",

            title: "Follow-up Gaps",

            severity: "MOMENTUM GAP",

            whatLabel:
                "What I Look For",

            what:
                "A new lead is captured, but what happens afterward is delayed, inconsistent, or disconnected from what brought them in.",

            whyLabel:
                "Why It Matters",

            why:
                "The conversation can lose context when the follow-up does not match what the person just experienced.",

            fixLabel:
                "What I Work On",

            fix:
                "We create a deliberate follow-up path that can educate, reassure, qualify, and move the conversation toward the next decision.",

            stageLabel:
                "Where It Happens",

            stage:
                "Follow-up"
        },


        {
            number: "04",

            title: "Dead-End Stages",

            severity: "JOURNEY GAP",

            whatLabel:
                "What I Look For",

            what:
                "A person completes an action but is left without a clear or useful next step.",

            whyLabel:
                "Why It Matters",

            why:
                "Momentum is easier to lose when the journey suddenly stops instead of showing people where to go next.",

            fixLabel:
                "What I Work On",

            fix:
                "We define the next useful action after each major stage so progress does not stop simply because one action has been completed.",

            stageLabel:
                "Where It Happens",

            stage:
                "Post-action"
        }

    ],


    /* =====================================================
       CURRENT VS BETTER PATH
    ===================================================== */

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
        "Follow-up",
        "Decision"
    ],


    /* =====================================================
       HOW I WORK
    ===================================================== */

    process: [

        {
            title:
                "Map the journey",

            description:
                "We start with the full path, from where people come from to what happens after they take an action."
        },


        {
            title:
                "Check the handoffs",

            description:
                "We look at what each stage promises, what the visitor expects, and whether the next stage continues that experience."
        },


        {
            title:
                "Build the key stages",

            description:
                "We shape the important pages, capture points, decision steps, and supporting pieces around the journey they need to create."
        },


        {
            title:
                "Connect the follow-up",

            description:
                "We make sure the conversation does not suddenly stop after a form, sign-up, download, or other important action."
        },


        {
            title:
                "Define what comes next",

            description:
                "Each major action should lead somewhere useful, so we give the journey a clear next step instead of leaving people at a dead end."
        }

    ],


    /* =====================================================
       DELIVERABLES
    ===================================================== */

    deliverables: [

        "Funnel architecture",

        "Journey and stage map",

        "Landing-page structure",

        "Lead capture flow",

        "Follow-up journey",

        "Next-step recommendations"

    ],


    /* =====================================================
       IMPACT
    ===================================================== */

    impact:
        "Instead of making people figure out what comes next, the funnel gives them a clearer path from the first click through capture, follow-up, and the next decision.",


    /* =====================================================
       CONCLUSION
    ===================================================== */

    conclusion:
        "A good funnel does not make people start their decision again at every stage. It carries the momentum forward."
};