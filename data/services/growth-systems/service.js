export default {
    id: "service-009",
    slug: "growth-systems",
    number: "09",
    type: "SYSTEM AUTOMATION",
    category: "AUTOMATE",
    title: "Growth Systems & Automation",
    icon: "⚙",

    summary:
        "Replace repetitive manual work with connected systems that capture, organize, follow up, and move opportunities forward.",

    featured: false,

    listLabel: "I systemize",

    bullets: [
        "Lead automation",
        "Marketing workflows",
        "CRM systems",
        "Internal growth tools"
    ],

    focus:
        "Connecting repetitive growth operations into systems that can run consistently.",

    primaryProblem:
        "Important growth tasks depend on repetitive manual work that becomes difficult to maintain as activity increases.",

    situation: `
        Growth creates operational complexity.

        Leads arrive from different places. Information gets copied between
        systems. Follow-ups are forgotten. Internal tasks are repeated.
        Reports require manual assembly.

        Automation should remove unnecessary repetition without turning
        the business into an unreadable pile of workflows.
    `,

    areas: [
        {
            number: "01",
            title: "Lead Routing Gap",
            severity: "OPERATIONAL",

            what:
                "New opportunities arrive without a reliable system for organizing, assigning, or prioritizing them.",

            why:
                "Manual handling creates delays and inconsistent follow-up.",

            fix:
                "Define clear routing rules and automate repeatable lead handling.",

            stage:
                "Lead capture"
        },

        {
            number: "02",
            title: "Workflow Repetition",
            severity: "EFFICIENCY",

            what:
                "The same administrative actions are repeatedly performed by people even though the process follows predictable rules.",

            why:
                "Repetition consumes time and increases the chance of human error.",

            fix:
                "Identify repeatable processes and automate the steps that do not require judgment.",

            stage:
                "Operations"
        },

        {
            number: "03",
            title: "System Disconnect",
            severity: "STRUCTURAL",

            what:
                "Important information sits across separate tools without a reliable flow between them.",

            why:
                "Disconnected systems create duplicate work and incomplete visibility.",

            fix:
                "Connect the systems around a defined source of truth and clear data handoffs.",

            stage:
                "Integration"
        },

        {
            number: "04",
            title: "Visibility Gap",
            severity: "ANALYTICAL",

            what:
                "The business performs many activities but lacks a simple view of what entered the system, what moved forward, and what stalled.",

            why:
                "Without visibility, operational problems remain hidden until they become expensive.",

            fix:
                "Create useful status, tracking, notification, and reporting layers around the workflow.",

            stage:
                "Monitoring"
        }
    ],

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

    deliverables: [
        "Lead workflows",
        "Marketing automation",
        "CRM structures",
        "Internal growth tools"
    ],

    process: [
        "Map repetitive work",
        "Define system rules",
        "Connect the workflow",
        "Monitor and refine"
    ],

    impact:
        "The goal is to reduce repetitive work, improve consistency, and give the business clearer visibility into how opportunities move through its systems.",

    conclusion:
        "Automate the repetition. Keep the judgment human."
};