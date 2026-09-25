/* =========================================================
   CONVERSION INTELLIGENCE
========================================================= */

export default {

    id: "service-008",

    slug: "conversion-intelligence",

    number: "08",

    type: "BEHAVIOR MEASUREMENT",

    category: "MEASURE",

    title: "Conversion Intelligence",

    icon: "◫",


    /* =====================================================
       CARD
    ===================================================== */

    summary:
        "See what people do, where they stop, and where they leave, so you know what needs attention.",

    featured: false,

    listLabel: "I measure",

    bullets: [
        "Conversion tracking",
        "Funnel tracking",
        "Event tracking",
        "Behavior insights"
    ],


    /* =====================================================
       CORE FOCUS
    ===================================================== */

    focus:
        "Finding out what people actually do on the way to becoming customers, so decisions are based on what you can see instead of what you assume.",


    /* =====================================================
       PRIMARY PROBLEM
    ===================================================== */

    primaryProblem:
        "You can see how many people visit, buy, or sign up. But if you cannot see what happens in between, you are still guessing.",


    /* =====================================================
       01 / THE SITUATION
    ===================================================== */

    situation: `
        You can see the final numbers.

        You can see how many people visited.
        You can see how many signed up.
        You can see how many bought.

        But what happened between those numbers?

        Someone visits your site.

        They look around.
        They click something.
        Maybe they read your offer.
        Maybe they start a form.
        Maybe they come back later.

        And then they leave.

        The final number can tell you that they did not convert.

        But it cannot always show you where the journey started to go wrong.

        That is where the real problem begins.

        When you cannot see the steps between the visit and the conversion, you have to guess what happened.

        So instead of staring at one final number, we follow the journey that created it.

        We look at the actions that matter, where people move forward, where they stop, and where their behavior changes.

        Because once you can see the journey, you have something useful to investigate.
    `,


    /* =====================================================
       SERVICE-SPECIFIC SECTION HEADINGS
    ===================================================== */

    sections: {

        problem: {
            eyebrow: "01 / START HERE",
            title:
                "You can see the result. But can you see the journey?"
        },


        primaryLeak: {
            eyebrow: "02 / THE REAL GAP",
            title:
                "The problem is not always the final number."
        },


        investigation: {
            eyebrow: "03 / FOLLOW THE JOURNEY",
            title:
                "So we look at what people actually do."
        },


        approach: {
            eyebrow: "04 / HOW I TRACE IT",
            title:
                "First we make the journey visible. Then we follow the clues."
        },


        journey: {
            eyebrow: "05 / FROM GUESSING TO KNOWING",
            title:
                "This is the shift we are looking for."
        },


        deliverables: {
            eyebrow: "06 / WHAT I WORK ON",
            title:
                "The work follows what the evidence shows us."
        },


        impact: {
            eyebrow: "07 / WHAT CHANGES",
            title:
                "You get a clearer picture of what needs attention."
        }

    },


    /* =====================================================
       INVESTIGATION AREAS
    ===================================================== */

    areas: [

        {
            number: "01",

            title: "Make the Journey Visible",

            severity: "VISIBILITY GAP",

            whatLabel:
                "What I Look For",

            what:
                "Important actions in the customer journey that are missing, unclear, or not being tracked properly.",

            whyLabel:
                "Why It Matters",

            why:
                "If you cannot see an important step, you cannot properly investigate what happens there.",

            fixLabel:
                "What I Work On",

            fix:
                "We identify the actions that matter and create a clear tracking structure around them.",

            stageLabel:
                "Focus",

            stage:
                "Visibility"
        },


        {
            number: "02",

            title: "Find Where People Drop",

            severity: "DROP-OFF",

            whatLabel:
                "What I Look For",

            what:
                "The points in the funnel where people stop moving forward.",

            whyLabel:
                "Why It Matters",

            why:
                "Knowing that conversion is low is not enough. You need to know where the biggest loss is happening.",

            fixLabel:
                "What I Work On",

            fix:
                "We track the important stages and compare how people move from one step to the next.",

            stageLabel:
                "Focus",

            stage:
                "Funnel"
        },


        {
            number: "03",

            title: "Look Closer at the Behavior",

            severity: "BEHAVIOR GAP",

            whatLabel:
                "What I Look For",

            what:
                "Differences in how people interact with the journey across useful groups, devices, traffic sources, or stages.",

            whyLabel:
                "Why It Matters",

            why:
                "A problem that looks small overall can become much clearer when you look at who is actually experiencing it.",

            fixLabel:
                "What I Work On",

            fix:
                "We break useful behavior into meaningful groups and look for patterns that help explain the drop.",

            stageLabel:
                "Focus",

            stage:
                "Behavior"
        },


        {
            number: "04",

            title: "Turn the Signals Into Action",

            severity: "DECISION GAP",

            whatLabel:
                "What I Look For",

            what:
                "Patterns that are visible in the data but have not yet been turned into a clear decision.",

            whyLabel:
                "Why It Matters",

            why:
                "More data does not automatically create better decisions. Someone still has to understand what the signal means.",

            fixLabel:
                "What I Work On",

            fix:
                "We turn the strongest findings into clear priorities and practical areas to investigate or improve.",

            stageLabel:
                "Focus",

            stage:
                "Decision"
        }

    ],


    /* =====================================================
       CURRENT VS BETTER PATH
    ===================================================== */

    currentPath: [
        "Look at the numbers",
        "Wonder what happened",
        "Guess where the problem is",
        "Make a change",
        "Hope it works"
    ],


    proposedPath: [
        "Track the journey",
        "See what people do",
        "Find where they drop",
        "Understand the pattern",
        "Make the right change"
    ],


    /* =====================================================
       HOW I WORK
    ===================================================== */

    process: [

        {
            title:
                "Map the journey",

            description:
                "We start with the steps that matter, from the first useful interaction to the action you want people to take."
        },


        {
            title:
                "Track what matters",

            description:
                "We make the important clicks, starts, sign-ups, purchases, and other key actions visible."
        },


        {
            title:
                "Follow the behavior",

            description:
                "We look at how people move through the journey and where that movement starts to change."
        },


        {
            title:
                "Find the pattern",

            description:
                "We compare useful groups, stages, and traffic sources to see where the problem becomes clearer."
        },


        {
            title:
                "Turn it into action",

            description:
                "We use what we find to identify what deserves attention and what should be investigated next."
        }

    ],


    /* =====================================================
       DELIVERABLES
    ===================================================== */

    deliverables: [

        "Conversion event map",

        "Funnel tracking structure",

        "Key event tracking",

        "Behavior analysis",

        "Priority findings"

    ],


    /* =====================================================
       IMPACT
    ===================================================== */

    impact:
        "Instead of staring at a final conversion number and wondering what went wrong, you can see how people move through the journey, where they drop, and what deserves attention next.",


    /* =====================================================
       CONCLUSION
    ===================================================== */

    conclusion:
        "You cannot fix what you cannot see. Make the journey visible, find where it breaks, and follow the evidence."

};