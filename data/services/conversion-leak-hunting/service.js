export default {
    id: "service-001",
    slug: "conversion-leak-hunting",
    number: "01",
    type: "CONVERSION INVESTIGATION",
    category: "FIND",
    title: "Conversion Leak Hunting",
    icon: "↗",

    summary:
        "Find the moments where attention turns into hesitation, confusion, or abandonment, and uncover what is stopping people from moving forward.",

    featured: false,

    listLabel: "I investigate",

    bullets: [
        "Conversion friction",
        "Landing pages",
        "Calls-to-action",
        "Offers and decision points"
    ],

    focus:
        "Finding where interest breaks down before the desired action.",

    primaryProblem:
        "Traffic reaches the experience, but too much of that attention disappears before action.",

    situation: `
        More traffic does not automatically solve a conversion problem.
        If visitors arrive but hesitate, misunderstand the offer, lose trust,
        or cannot see the next step, the real problem is happening inside
        the journey itself.

        I examine the experience from the visitor's perspective and trace
        the points where momentum begins to disappear.
    `,

    areas: [
        {
            number: "01",
            title: "Unclear Value",
            severity: "HIGH FRICTION",

            what:
                "The visitor cannot quickly understand what is being offered, who it is for, or why it matters.",

            why:
                "When the value proposition requires too much interpretation, attention starts turning into uncertainty.",

            fix:
                "Clarify the offer, audience, outcome, and supporting message so the value becomes obvious earlier.",

            stage:
                "First impression"
        },

        {
            number: "02",
            title: "Weak Decision Path",
            severity: "FRICTION",

            what:
                "Important actions are surrounded by competing choices or lack enough context to make the next step feel natural.",

            why:
                "People are more likely to hesitate when the path forward is unclear.",

            fix:
                "Create a more deliberate sequence between information, proof, objections, and action.",

            stage:
                "Consideration"
        },

        {
            number: "03",
            title: "Trust Gaps",
            severity: "HIGH FRICTION",

            what:
                "The experience asks for commitment before answering the questions that naturally create doubt.",

            why:
                "Unanswered concerns can stop otherwise interested visitors from progressing.",

            fix:
                "Place relevant proof, reassurance, explanations, and objection handling closer to the decision point.",

            stage:
                "Decision"
        },

        {
            number: "04",
            title: "Action Friction",
            severity: "FRICTION",

            what:
                "The final action feels harder, less obvious, or more demanding than it needs to be.",

            why:
                "Small obstacles become expensive when they appear at the exact moment someone is ready to act.",

            fix:
                "Reduce unnecessary steps, clarify the CTA, and remove avoidable resistance from the action path.",

            stage:
                "Conversion"
        }
    ],

    currentPath: [
        "Attention",
        "Confusion",
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

    deliverables: [
        "Conversion leak investigation",
        "Journey and friction analysis",
        "Priority leak breakdown",
        "Recommended conversion fixes"
    ],

    process: [
        "Map the customer journey",
        "Identify friction points",
        "Trace the highest-impact leaks",
        "Prioritize practical fixes"
    ],

    impact:
        "The goal is to make the path from attention to action easier to understand, easier to trust, and easier to complete.",

    conclusion:
        "Find the point where momentum disappears, then fix what is actually causing it."
};