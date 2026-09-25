export default {

    id: "service-006",

    slug: "email-systems",

    number: "06",

    type: "RETENTION SYSTEM",

    category: "RETAIN",

    title: "Email Systems That Keep Working",

    icon: "◌",


    /* =====================================================
       CARD
    ===================================================== */

    summary:
        "Keep useful conversations moving with email sequences and automation that follow where each lead or customer is in the journey.",

    featured: false,

    listLabel: "I automate",

    bullets: [
        "Email sequences",
        "Lead nurturing",
        "Retention and re-engagement",
        "Automated customer journeys"
    ],


    /* =====================================================
       CORE FOCUS
    ===================================================== */

    focus:
        "Building automated communication that responds to where people are in the customer journey instead of sending the same message to everyone.",


    /* =====================================================
       PRIMARY PROBLEM
    ===================================================== */

    primaryProblem:
        "A lead or customer enters the system, but the conversation starts depending on someone remembering what to send, when to send it, and who needs it.",


    /* =====================================================
       01 / THE SITUATION
    ===================================================== */

    situation: `
        Someone shows interest.

        They fill out a form.
        They download something.
        They ask a question.
        Maybe they buy.

        And then what happens?

        If the next message depends on someone remembering to send it, the conversation can easily go quiet.

        Not because the person stopped being interested.

        Sometimes, they simply did not hear from you at the right time.

        And even when you do follow up, one message rarely makes sense for everyone.

        A new lead needs something different from someone who has already bought.

        Someone who is considering your offer may need answers and proof.

        Someone who has already bought may need help, education, or a reason to come back.

        That is where a good email system becomes useful.

        Instead of starting every conversation from scratch, we build the right messages around the moments that matter.

        Someone takes an action.

        The system responds.

        They move forward.

        The communication changes with them.

        And when they go quiet, the system can give the conversation another useful reason to continue.
    `,


    /* =====================================================
       SERVICE-SPECIFIC SECTION HEADINGS
    ===================================================== */

    sections: {

        problem: {
            eyebrow: "01 / START HERE",
            title:
                "A lead comes in. What happens after that?"
        },


        primaryLeak: {
            eyebrow: "02 / THE REAL GAP",
            title:
                "Interest can disappear when the conversation stops."
        },


        investigation: {
            eyebrow: "03 / FOLLOW THE CONVERSATION",
            title:
                "So we look at what people should hear, and when they should hear it."
        },


        approach: {
            eyebrow: "04 / HOW I BUILD IT",
            title:
                "The system follows the customer, not the other way around."
        },


        journey: {
            eyebrow: "05 / THE SHIFT",
            title:
                "Move from manual follow-up to communication that keeps moving."
        },


        deliverables: {
            eyebrow: "06 / WHAT I WORK ON",
            title:
                "The messages and automation follow the journey."
        },


        impact: {
            eyebrow: "07 / WHAT CHANGES",
            title:
                "Important conversations keep moving without someone having to remember every step."
        }

    },


    /* =====================================================
       INVESTIGATION AREAS
    ===================================================== */

    areas: [

        {
            number: "01",

            title: "The Follow-up Gap",

            severity: "CONVERSATION GAP",

            whatLabel:
                "What I Look For",

            what:
                "New leads enter the system, but there is no clear sequence that continues the conversation after the first interaction.",

            whyLabel:
                "Why It Matters",

            why:
                "Interest can cool quickly when someone takes the next step and then hears nothing useful afterward.",

            fixLabel:
                "What I Work On",

            fix:
                "We build a welcome and nurture sequence that continues from the original interaction and gives the lead a clear reason to keep moving.",

            stageLabel:
                "Where It Happens",

            stage:
                "Lead nurture"
        },


        {
            number: "02",

            title: "One Message for Everyone",

            severity: "RELEVANCE GAP",

            whatLabel:
                "What I Look For",

            what:
                "People receive the same communication even though they have different needs, questions, interests, or levels of intent.",

            whyLabel:
                "Why It Matters",

            why:
                "A message that makes sense for a new lead may be completely wrong for someone who has already bought.",

            fixLabel:
                "What I Work On",

            fix:
                "We use useful segments, actions, and triggers to make communication more relevant to where each person is in the journey.",

            stageLabel:
                "Where It Happens",

            stage:
                "Personalization"
        },


        {
            number: "03",

            title: "The Post-Purchase Silence",

            severity: "RETENTION GAP",

            whatLabel:
                "What I Look For",

            what:
                "The communication becomes quiet once someone has bought, even though there are still useful reasons to stay connected.",

            whyLabel:
                "Why It Matters",

            why:
                "The sale may be complete, but the customer relationship is not. Without useful follow-up, another opportunity to help or reconnect can simply disappear.",

            fixLabel:
                "What I Work On",

            fix:
                "We create post-purchase, education, retention, and re-engagement journeys that keep the relationship useful after the first transaction.",

            stageLabel:
                "Where It Happens",

            stage:
                "Retention"
        },


        {
            number: "04",

            title: "Too Much Depends on Memory",

            severity: "MANUAL GAP",

            whatLabel:
                "What I Look For",

            what:
                "Important messages depend on someone remembering who needs what, when they need it, and what should happen next.",

            whyLabel:
                "Why It Matters",

            why:
                "Manual follow-up becomes harder to keep consistent as the number of leads and customers grows.",

            fixLabel:
                "What I Work On",

            fix:
                "We automate the repeatable parts of the journey while leaving important moments open for real human attention.",

            stageLabel:
                "Where It Happens",

            stage:
                "Automation"
        }

    ],


    /* =====================================================
       CURRENT VS BETTER PATH
    ===================================================== */

    currentPath: [
        "Capture",
        "Remember to follow up",
        "Send something",
        "Lose track",
        "Go quiet"
    ],


    proposedPath: [
        "Capture",
        "Understand the stage",
        "Send the right message",
        "Continue the journey",
        "Retain"
    ],


    /* =====================================================
       HOW I WORK
    ===================================================== */

    process: [

        {
            title:
                "Map the conversation",

            description:
                "We look at what happens after someone becomes a lead or customer and identify the moments where communication should continue."
        },


        {
            title:
                "Define the stages",

            description:
                "We separate the journey into useful stages so a new lead, active prospect, and existing customer do not all receive the same treatment."
        },


        {
            title:
                "Build the messages",

            description:
                "We create the emails around the questions, decisions, actions, and moments that matter at each stage."
        },


        {
            title:
                "Connect the triggers",

            description:
                "We connect the messages to useful actions and conditions so the right communication can happen without someone manually starting it every time."
        },


        {
            title:
                "Keep improving the system",

            description:
                "Once the system is running, we can look at what people engage with, where they stop responding, and where the journey can be improved."
        }

    ],


    /* =====================================================
       DELIVERABLES
    ===================================================== */

    deliverables: [

        "Email sequence architecture",

        "Lead nurture flows",

        "Customer retention journeys",

        "Re-engagement automation",

        "Trigger and segmentation structure"

    ],


    /* =====================================================
       IMPACT
    ===================================================== */

    impact:
        "Instead of relying on someone to remember every follow-up, the system keeps useful communication moving around the customer's stage, actions, and needs.",


    /* =====================================================
       CONCLUSION
    ===================================================== */

    conclusion:
        "Build the right conversation once, then let the system keep it moving when people are ready to hear from you."

};