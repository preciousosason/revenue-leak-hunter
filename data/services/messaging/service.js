export default {
    id: "service-004",
    slug: "messaging",
    number: "04",
    type: "MESSAGE CLARITY",
    category: "CLARIFY",
    title: "Messaging That Makes Sense",
    icon: "Aa",

    summary:
        "Turn complicated offers into words people understand quickly enough to care, trust, and act.",

    featured: false,

    listLabel: "I clarify",

    bullets: [
        "Website and landing-page copy",
        "Headlines and offers",
        "Value propositions",
        "Calls-to-action"
    ],

    focus:
        "Making the value of an offer easier to understand and harder to misunderstand.",

    primaryProblem:
        "The business understands its offer, but the visitor has to work too hard to understand it.",

    situation: `
        Businesses often describe what they do from the inside out.
        Customers experience the offer from the outside in.

        The language needs to answer the questions that matter to the
        person reading it: What is this? Is it for me? Why should I care?
        Can I trust it? What happens next?

        I restructure messaging around those decisions.
    `,

    areas: [
        {
            number: "01",
            title: "Message Fog",
            severity: "HIGH FRICTION",

            what:
                "The headline and opening message describe the business without clearly communicating the customer's problem or desired outcome.",

            why:
                "Visitors need context quickly before they decide whether the rest of the page deserves their attention.",

            fix:
                "Lead with the problem, audience, value, or outcome that matters most to the intended customer.",

            stage:
                "First impression"
        },

        {
            number: "02",
            title: "Weak Value Proposition",
            severity: "FRICTION",

            what:
                "The offer sounds similar to alternatives or relies on vague claims that could describe almost anyone.",

            why:
                "Generic language makes differentiation difficult.",

            fix:
                "Make the value, mechanism, audience, and meaningful difference more specific.",

            stage:
                "Evaluation"
        },

        {
            number: "03",
            title: "Proof Disconnect",
            severity: "FRICTION",

            what:
                "Testimonials, evidence, or explanations exist but do not directly support the claims being made.",

            why:
                "Proof is most useful when it answers the doubt created by the claim.",

            fix:
                "Connect evidence to specific promises, objections, and decision points.",

            stage:
                "Trust"
        },

        {
            number: "04",
            title: "Weak CTA",
            severity: "FRICTION",

            what:
                "The call-to-action tells visitors what to click without making the next step meaningful.",

            why:
                "A button cannot repair an unclear decision.",

            fix:
                "Make the action specific, relevant, and consistent with the expectation created by the page.",

            stage:
                "Decision"
        }
    ],

    currentPath: [
        "Read",
        "Interpret",
        "Question",
        "Leave"
    ],

    proposedPath: [
        "Read",
        "Understand",
        "Believe",
        "Decide",
        "Act"
    ],

    deliverables: [
        "Website copy",
        "Landing-page copy",
        "Headlines and offers",
        "CTA and value proposition system"
    ],

    process: [
        "Understand the audience",
        "Clarify the offer",
        "Structure the message",
        "Refine for action"
    ],

    impact:
        "The goal is to reduce the mental work required to understand the offer and make the important message easier to act on.",

    conclusion:
        "If people need a decoder ring to understand the offer, the message has already leaked."
};