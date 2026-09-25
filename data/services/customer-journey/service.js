/* =========================================================
   CUSTOMER JOURNEY ENGINEERING
========================================================= */

export default {

    id: "service-007",

    slug: "customer-journey",

    number: "07",

    type: "EXPERIENCE ANALYSIS",

    category: "EXPERIENCE",

    title: "Customer Journey Engineering",

    icon: "◉",


    /* =====================================================
       CARD
    ===================================================== */

    summary:
        "Trace the experience from the first interaction to the final decision, and find where the journey starts to feel harder than it should.",

    featured: false,

    listLabel: "I map",

    bullets: [
        "Customer journey mapping",
        "Touchpoint analysis",
        "UX and onboarding",
        "Cross-channel handoffs"
    ],


    /* =====================================================
       CORE FOCUS
    ===================================================== */

    focus:
        "Understanding the full customer experience as one connected journey instead of treating each touchpoint as a separate problem.",


    /* =====================================================
       PRIMARY PROBLEM
    ===================================================== */

    primaryProblem:
        "The individual touchpoints may work on their own, but the journey between them feels disconnected, forcing customers to figure out too much for themselves.",


    /* =====================================================
       01 / THE SITUATION
    ===================================================== */

    situation: `
        A customer does not experience your business one department at a time.

        They do not think:

        "Now I am experiencing marketing."

        "Now I am experiencing sales."

        "Now I am experiencing support."

        They just experience your business.

        They see an ad.
        They visit your website.
        They read something.
        They send a message.
        Maybe someone from sales replies.
        Then they receive an email.
        Then they move to another channel.

        To the customer, those are not separate systems.

        It is one journey.

        And when something changes between those moments, they notice.

        Maybe the website promises one thing and the sales conversation explains something else.

        Maybe they already gave you information, but another team asks for it again.

        Maybe they finish one step and have no idea what they are supposed to do next.

        None of these problems may look huge on their own.

        But when they happen across the same journey, they create friction that the customer has to carry.

        That is what I map.

        I follow the experience from one important touchpoint to the next and look for the places where information, expectations, trust, or momentum break.

        Because the customer sees one journey.

        So the journey should make sense as one.
    `,


    /* =====================================================
       SERVICE-SPECIFIC SECTION HEADINGS
    ===================================================== */

    sections: {

        problem: {
            eyebrow: "01 / START HERE",
            title:
                "Your business has many touchpoints. Your customer experiences one journey."
        },


        primaryLeak: {
            eyebrow: "02 / THE REAL GAP",
            title:
                "The problem often appears between the touchpoints."
        },


        investigation: {
            eyebrow: "03 / MAP THE EXPERIENCE",
            title:
                "So we follow what the customer has to deal with from one step to the next."
        },


        approach: {
            eyebrow: "04 / HOW I TRACE IT",
            title:
                "I connect the moments instead of studying them in isolation."
        },


        journey: {
            eyebrow: "05 / THE SHIFT",
            title:
                "The goal is to stop making customers stitch the experience together themselves."
        },


        deliverables: {
            eyebrow: "06 / WHAT I WORK ON",
            title:
                "The work follows the gaps we find across the journey."
        },


        impact: {
            eyebrow: "07 / WHAT CHANGES",
            title:
                "Each interaction should make the next one easier."
        }

    },


    /* =====================================================
       INVESTIGATION AREAS
    ===================================================== */

    areas: [

        {
            number: "01",

            title: "Expectation Gaps",

            severity: "EXPECTATION GAP",

            whatLabel:
                "What I Look For",

            what:
                "The customer is promised or led to expect one thing early in the journey, but encounters something different later.",

            whyLabel:
                "Why It Matters",

            why:
                "When the experience changes without a clear reason, customers can become confused or lose confidence in what comes next.",

            fixLabel:
                "What I Work On",

            fix:
                "We align important promises, messages, handoffs, and expectations so the journey feels consistent from one step to another.",

            stageLabel:
                "Where It Happens",

            stage:
                "Expectation"
        },


        {
            number: "02",

            title: "Touchpoint Friction",

            severity: "JOURNEY FRICTION",

            whatLabel:
                "What I Look For",

            what:
                "Unnecessary steps, repeated information, unclear instructions, or delays that make an important interaction harder than it needs to be.",

            whyLabel:
                "Why It Matters",

            why:
                "One small obstacle may be easy to ignore. Several of them, spread across the journey, can make the whole experience feel difficult.",

            fixLabel:
                "What I Work On",

            fix:
                "We identify where effort is being added unnecessarily and look for ways to make important interactions clearer and easier to move through.",

            stageLabel:
                "Where It Happens",

            stage:
                "Interaction"
        },


        {
            number: "03",

            title: "Onboarding Drop",

            severity: "ONBOARDING GAP",

            whatLabel:
                "What I Look For",

            what:
                "A customer completes the first step but is left unsure about what happens next, what they should do, or what they should expect.",

            whyLabel:
                "Why It Matters",

            why:
                "The beginning of a relationship sets expectations. Uncertainty early on can make it harder for customers to continue with confidence.",

            fixLabel:
                "What I Work On",

            fix:
                "We create a clearer sequence of next steps, useful guidance, and meaningful milestones that help customers keep moving.",

            stageLabel:
                "Where It Happens",

            stage:
                "Onboarding"
        },


        {
            number: "04",

            title: "Channel Disconnect",

            severity: "CHANNEL GAP",

            whatLabel:
                "What I Look For",

            what:
                "The website, email, sales process, support experience, or other channels give customers information that does not connect cleanly.",

            whyLabel:
                "Why It Matters",

            why:
                "Customers should not have to explain their situation again or figure out which version of the information is correct every time they switch channels.",

            fixLabel:
                "What I Work On",

            fix:
                "We look at the handoffs between channels and create clearer expectations, information flow, and continuity.",

            stageLabel:
                "Where It Happens",

            stage:
                "Cross-channel"
        }

    ],


    /* =====================================================
       CURRENT VS BETTER PATH
    ===================================================== */

    currentPath: [
        "Discover",
        "Switch channels",
        "Repeat context",
        "Get confused",
        "Hesitate"
    ],


    proposedPath: [
        "Discover",
        "Understand",
        "Interact",
        "Continue",
        "Decide"
    ],


    /* =====================================================
       HOW I WORK
    ===================================================== */

    process: [

        {
            title:
                "Map the journey",

            description:
                "We start with the customer's important path, from the first meaningful interaction through the decisions and actions that follow."
        },


        {
            title:
                "Connect the touchpoints",

            description:
                "We look at what happens before and after each important interaction, instead of treating every touchpoint as its own isolated problem."
        },


        {
            title:
                "Find the gaps",

            description:
                "We look for places where information, expectations, instructions, trust, or momentum become unclear between one step and the next."
        },


        {
            title:
                "Follow the handoffs",

            description:
                "We examine what happens when the customer moves between pages, channels, teams, or stages of the relationship."
        },


        {
            title:
                "Prioritize the improvements",

            description:
                "We identify the parts of the journey that deserve attention first and turn the findings into practical improvements."
        }

    ],


    /* =====================================================
       DELIVERABLES
    ===================================================== */

    deliverables: [

        "Customer journey map",

        "Touchpoint analysis",

        "Journey friction breakdown",

        "Onboarding review",

        "Cross-channel recommendations"

    ],


    /* =====================================================
       IMPACT
    ===================================================== */

    impact:
        "Instead of making customers connect the dots themselves, the journey becomes easier to follow, easier to understand, and more consistent from one interaction to the next.",


    /* =====================================================
       CONCLUSION
    ===================================================== */

    conclusion:
        "The customer sees one journey. So stop fixing the pieces separately and start fixing how they connect."

};