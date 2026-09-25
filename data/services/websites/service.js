export default {
    id: "service-002",
    slug: "websites",
    number: "02",
    type: "DIGITAL EXPERIENCE BUILD",
    category: "BUILD",
    title: "Websites That Move People",
    icon: "◇",

    summary:
        "Build a digital experience that makes the next step obvious, removes unnecessary friction, and turns attention into action.",

    featured: true,
    badge: "BUILD",

    listLabel: "I build",

    bullets: [
        "Conversion-focused websites",
        "Landing pages",
        "UX and responsive design",
        "Performance and structure"
    ],

    focus:
        "Building websites around the decisions visitors need to make.",

    primaryProblem:
        "A website can look polished while still making visitors work too hard to understand what to do next.",

    situation: `
        A website is not simply a collection of pages.
        It is part of the customer's decision-making process.

        The structure, messaging, hierarchy, navigation, calls-to-action,
        responsiveness, and performance all influence whether someone keeps
        moving or leaves.

        I build the experience around the journey rather than treating
        individual pages as isolated designs.
    `,

    areas: [
        {
            number: "01",
            title: "Information Architecture",
            severity: "STRUCTURAL",

            what:
                "Important information is buried, scattered, or presented in an order that does not match the visitor's questions.",

            why:
                "Poor structure creates unnecessary effort before visitors can understand the offer.",

            fix:
                "Organize pages and content around intent, questions, decisions, and the actions that matter.",

            stage:
                "Navigation"
        },

        {
            number: "02",
            title: "Page Hierarchy",
            severity: "FRICTION",

            what:
                "Every element competes for attention instead of guiding the visitor toward the most important information.",

            why:
                "Visual noise makes it harder to identify value, proof, and the next step.",

            fix:
                "Create a clearer hierarchy between the problem, value, proof, offer, objections, and CTA.",

            stage:
                "Evaluation"
        },

        {
            number: "03",
            title: "Responsive Friction",
            severity: "TECHNICAL",

            what:
                "A page that works on desktop becomes awkward, crowded, slow, or difficult to use on smaller screens.",

            why:
                "A broken experience on one device can interrupt the entire decision journey.",

            fix:
                "Design and test layouts around real screen constraints instead of shrinking the desktop version.",

            stage:
                "Experience"
        },

        {
            number: "04",
            title: "Performance Friction",
            severity: "TECHNICAL",

            what:
                "Heavy assets, unnecessary scripts, or inefficient structure slow down the experience.",

            why:
                "Waiting creates friction before visitors even reach the important content.",

            fix:
                "Reduce unnecessary weight, optimize assets, and keep the technical structure focused.",

            stage:
                "Load"
        }
    ],

    currentPath: [
        "Visit",
        "Explore",
        "Search",
        "Hesitate"
    ],

    proposedPath: [
        "Visit",
        "Understand",
        "Trust",
        "Choose",
        "Act"
    ],

    deliverables: [
        "Conversion-focused website",
        "Responsive page system",
        "Landing pages",
        "UX and structural implementation"
    ],

    process: [
        "Define the journey",
        "Structure the experience",
        "Build the interface",
        "Test and refine"
    ],

    impact:
        "The goal is a website that does more than exist online. It should help visitors understand the offer, build confidence, and move naturally toward the next step.",

    conclusion:
        "Build the website around the decision, not around the decoration."
};