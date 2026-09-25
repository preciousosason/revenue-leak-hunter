export default {

    id: "service-009",

    slug: "growth-systems",

    number: "09",

    type: "SYSTEM AUTOMATION",

    category: "AUTOMATE",

    title: "Growth Systems & Automation",

    icon: "⚙",


    /* =====================================================
       CARD
    ===================================================== */

    summary:
        "Turn repetitive growth work into connected systems that capture, organize, follow up, and keep opportunities moving.",

    featured: false,

    listLabel: "I systemize",

    bullets: [
        "Lead automation",
        "Marketing workflows",
        "CRM systems",
        "Internal growth tools"
    ],


    /* =====================================================
       CORE FOCUS
    ===================================================== */

    focus:
        "Finding repetitive work that can be connected, simplified, and automated without removing the human judgment the business still needs.",


    /* =====================================================
       PRIMARY PROBLEM
    ===================================================== */

    primaryProblem:
        "The business keeps doing the same work by hand, and as activity grows, that repetition starts creating delays, mistakes, and missed opportunities.",


    /* =====================================================
       01 / THE SITUATION
    ===================================================== */

    situation: `
        Growth sounds simple until the work starts piling up.

        A lead comes in.
        Someone copies the details.
        Someone sends a message.
        Someone updates the CRM.
        Someone creates a task.
        Someone remembers to follow up.

        Then another lead arrives.

        And another.

        Before long, people are spending time moving information around instead of doing the work that actually needs a person.

        The problem is not that the team is not working hard.

        The problem is that too much of the work keeps repeating.

        And when a process depends on someone remembering every step, things eventually get missed.

        A follow-up gets forgotten.
        A record does not get updated.
        The same information gets entered twice.
        A useful opportunity sits somewhere nobody is looking.

        That is where a good system can help.

        I look at the work that keeps repeating, find the parts that follow clear rules, and connect them into a system that can handle the repetition.

        But I do not automate everything just because I can.

        The goal is to remove unnecessary work while keeping people involved where judgment, context, or a real decision is still needed.
    `,


    /* =====================================================
       SERVICE-SPECIFIC SECTION HEADINGS
    ===================================================== */

    sections: {

        problem: {
            eyebrow: "01 / START HERE",
            title:
                "Growth gets harder when the same work keeps repeating."
        },


        primaryLeak: {
            eyebrow: "02 / THE REAL PROBLEM",
            title:
                "The bottleneck is often the work happening between the important work."
        },


        investigation: {
            eyebrow: "03 / FOLLOW THE WORK",
            title:
                "So we look at what gets repeated, moved, copied, and forgotten."
        },


        approach: {
            eyebrow: "04 / HOW I SYSTEMIZE IT",
            title:
                "First we understand the work. Then we decide what should run automatically."
        },


        journey: {
            eyebrow: "05 / THE SHIFT",
            title:
                "Move from repeating the process to running the process."
        },


        deliverables: {
            eyebrow: "06 / WHAT I BUILD",
            title:
                "The system follows the way the business actually works."
        },


        impact: {
            eyebrow: "07 / WHAT CHANGES",
            title:
                "Less repetition. Better visibility. More room for useful work."
        }

    },


    /* =====================================================
       INVESTIGATION AREAS
    ===================================================== */

    areas: [

        {
            number: "01",

            title: "Leads Without a Clear Path",

            severity: "ROUTING GAP",

            whatLabel:
                "What I Look For",

            what:
                "New leads arrive from different places without a reliable way to capture, organize, assign, or prioritize them.",

            whyLabel:
                "Why It Matters",

            why:
                "When every new opportunity has to be handled manually, response time and follow-up can depend too much on someone's memory.",

            fixLabel:
                "What I Work On",

            fix:
                "We create clear rules for capturing, organizing, assigning, and moving new opportunities through the right next step.",

            stageLabel:
                "Where It Happens",

            stage:
                "Lead capture"
        },


        {
            number: "02",

            title: "Work That Keeps Repeating",

            severity: "REPETITION",

            whatLabel:
                "What I Look For",

            what:
                "People repeatedly perform the same predictable steps even though those steps follow rules that a system could handle.",

            whyLabel:
                "Why It Matters",

            why:
                "Repeated manual work takes time away from higher-value tasks and creates more chances for small mistakes to enter the process.",

            fixLabel:
                "What I Work On",

            fix:
                "We separate the repeatable steps from the work that requires human judgment, then automate the parts that can safely run on their own.",

            stageLabel:
                "Where It Happens",

            stage:
                "Operations"
        },


        {
            number: "03",

            title: "Disconnected Systems",

            severity: "SYSTEM GAP",

            whatLabel:
                "What I Look For",

            what:
                "Important information lives in different tools, while people are left to move that information from one place to another.",

            whyLabel:
                "Why It Matters",

            why:
                "Disconnected tools create duplicate work, missing information, and a process that becomes harder to understand as more tools are added.",

            fixLabel:
                "What I Work On",

            fix:
                "We connect the relevant systems around clear data handoffs and a defined source of truth.",

            stageLabel:
                "Where It Happens",

            stage:
                "Integration"
        },


        {
            number: "04",

            title: "Work You Cannot Easily See",

            severity: "VISIBILITY GAP",

            whatLabel:
                "What I Look For",

            what:
                "The business is doing a lot of work, but there is no simple way to see what entered the system, what moved forward, what is waiting, and what has stalled.",

            whyLabel:
                "Why It Matters",

            why:
                "A process can appear to be working while small problems quietly build up inside it.",

            fixLabel:
                "What I Work On",

            fix:
                "We add useful tracking, status changes, notifications, and reporting so important movement is easier to see.",

            stageLabel:
                "Where It Happens",

            stage:
                "Monitoring"
        }

    ],


    /* =====================================================
       CURRENT VS BETTER PATH
    ===================================================== */

    currentPath: [
        "Capture",
        "Copy",
        "Notify",
        "Follow up",
        "Repeat"
    ],


    proposedPath: [
        "Capture",
        "Organize",
        "Automate",
        "Monitor",
        "Intervene"
    ],


    /* =====================================================
       HOW I WORK
    ===================================================== */

    process: [

        {
            title:
                "Map the work",

            description:
                "We follow how information and tasks move through the business, from the moment something enters the system to what happens next."
        },


        {
            title:
                "Separate rules from judgment",

            description:
                "We identify which steps are predictable enough to automate and which ones still need a person to make the decision."
        },


        {
            title:
                "Build the connections",

            description:
                "We connect the relevant tools, triggers, actions, and handoffs so information can move without unnecessary manual work."
        },


        {
            title:
                "Put the right signals in place",

            description:
                "We make important events visible through statuses, notifications, tracking, and useful reporting."
        },


        {
            title:
                "Monitor and refine",

            description:
                "A system is not finished just because it runs. We look at what happens in practice and improve the workflow where it creates friction."
        }

    ],


    /* =====================================================
       DELIVERABLES
    ===================================================== */

    deliverables: [

        "Lead capture and routing workflows",

        "Marketing automation",

        "CRM workflow structures",

        "System integrations",

        "Internal growth tools",

        "Workflow monitoring"

    ],


    /* =====================================================
       IMPACT
    ===================================================== */

    impact:
        "Instead of relying on people to remember every repeated step, the business gets a clearer system for moving information and opportunities forward, while people stay involved where judgment actually matters.",


    /* =====================================================
       CONCLUSION
    ===================================================== */

    conclusion:
        "Automate the repetition. Keep the judgment human."
};