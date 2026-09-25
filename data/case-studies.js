const caseStudies = [

    {
        id: "case-001",

        number: "CASE FILE 001",

        type: "ILLUSTRATIVE INVESTIGATION",

        category: "E-COMMERCE",

        title: "THE PRODUCT PAGE LEAK",

        summary:
            "The store has traffic. The products are legitimate. The visitors are interested. Yet too many sessions end without a purchase. The investigation starts after the visitor arrives.",

        journey: [
            "Search / Social",
            "Landing Page",
            "Product Page",
            "Add To Cart",
            "Checkout",
            "Purchase"
        ],

        focus:
            "Traffic → Product Understanding → Trust → Purchase",

        primaryLeak:
            "The product page creates too much work for the buyer.",

        situation: `
            The store is not suffering from an obvious lack of attention.
            Visitors are arriving through search and social channels,
            browsing products, and showing enough interest to continue
            deeper into the experience.

            But interest is not the same thing as purchase intent.

            Somewhere between understanding the product and committing
            to the purchase, the journey begins losing momentum.

            The obvious response would be to buy more traffic.

            That's not where I would start.

            I would investigate what happens after the visitor arrives.
        `,

        leaks: [

            {
                number: "LEAK 01",
                title: "THE VALUE GAP",
                severity: "HIGH",

                what:
                    "The opening section explains what the product is, but does not communicate the desired outcome quickly enough.",

                why:
                    "Visitors should not have to translate features into benefits before they understand why the product matters to them.",

                fix:
                    "Rebuild the opening section around the customer's desired outcome, followed by the strongest supporting benefits and proof.",

                stage:
                    "Product Understanding"
            },

            {
                number: "LEAK 02",
                title: "THE TRUST DELAY",
                severity: "HIGH",

                what:
                    "Trust signals exist, but they appear too late in the decision process or are visually buried beneath product information.",

                why:
                    "A visitor who is uncertain about quality, delivery, returns, or product credibility may hesitate before reaching the buying action.",

                fix:
                    "Move relevant trust signals closer to the decision point and make reassurance easier to scan without overwhelming the page.",

                stage:
                    "Trust"
            },

            {
                number: "LEAK 03",
                title: "THE DECISION FRICTION",
                severity: "MEDIUM",

                what:
                    "The page presents several pieces of information without making the next decision obvious.",

                why:
                    "Every unnecessary decision adds cognitive friction. The visitor starts evaluating the page instead of evaluating the product.",

                fix:
                    "Create a clearer hierarchy: desired outcome, key benefits, proof, objections, then a decisive call to action.",

                stage:
                    "Purchase Intent"
            },

            {
                number: "LEAK 04",
                title: "THE MOBILE COLLAPSE",
                severity: "MEDIUM",

                what:
                    "The desktop experience may communicate the product clearly, while the mobile experience forces the visitor through a longer and less coherent sequence.",

                why:
                    "A mobile visitor has less screen space and often less patience. Important information buried several screens below the opening can effectively become invisible.",

                fix:
                    "Audit the mobile journey independently rather than treating it as a smaller desktop page. Reorder information around the decisions the mobile visitor needs to make.",

                stage:
                    "Mobile Journey"
            }

        ],

        currentPath: [
            "Product information",
            "Long description",
            "Features",
            "Reviews",
            "CTA"
        ],

        proposedPath: [
            "Clear outcome",
            "Immediate proof",
            "Key benefits",
            "Objection handling",
            "CTA"
        ],

        impact:
            "Reduce decision friction, make the product's value easier to understand, strengthen purchase confidence, and create a cleaner path toward checkout.",

        conclusion:
            "The problem isn't necessarily the amount of traffic. The problem is what the traffic encounters once it arrives. More visitors won't automatically repair a leaking journey. Find the leak first."
    },


    {
        id: "case-002",

        number: "CASE FILE 002",

        type: "ILLUSTRATIVE INVESTIGATION",

        category: "SAAS",

        title: "THE SIGNUP TRAP",

        summary:
            "The software gets signups. The dashboard fills with new accounts. But too many users disappear before experiencing the product's core value.",

        journey: [
            "Landing Page",
            "Signup",
            "Onboarding",
            "First Action",
            "Aha Moment",
            "Activation"
        ],

        focus:
            "Interest → Signup → Activation → First Value",

        primaryLeak:
            "The signup is being treated as the destination instead of the beginning.",

        situation: `
            The SaaS product is successfully getting people through the door.

            New accounts are being created. Marketing is generating interest.
            The signup number looks healthy enough to create optimism.

            But an account is not an activated customer.

            The real question begins after registration:

            What happens next?

            If users create an account but never reach the moment where
            the product solves a meaningful problem for them, the funnel
            may be optimizing the wrong milestone.

            The investigation therefore moves beyond signup volume and
            into the first minutes of the user's experience.
        `,

        leaks: [

            {
                number: "LEAK 01",
                title: "THE ONBOARDING INTERROGATION",
                severity: "HIGH",

                what:
                    "The onboarding process asks users for too much information before showing them enough value.",

                why:
                    "Every question creates another opportunity for the user to wonder whether continuing is worth the effort.",

                fix:
                    "Remove non-essential questions from the first session and defer secondary configuration until after the user experiences meaningful value.",

                stage:
                    "Onboarding"
            },

            {
                number: "LEAK 02",
                title: "THE FIRST-ACTION GAP",
                severity: "HIGH",

                what:
                    "The interface introduces several possible actions without clearly identifying the one action that should happen first.",

                why:
                    "New users do not yet understand the product's internal logic. Giving them too many choices creates hesitation instead of momentum.",

                fix:
                    "Define one primary first action and design the interface around helping the user complete it.",

                stage:
                    "First Action"
            },

            {
                number: "LEAK 03",
                title: "THE FEATURE WALL",
                severity: "MEDIUM",

                what:
                    "The onboarding experience exposes the product's capabilities before establishing why those capabilities matter.",

                why:
                    "Features are useful only when users understand the problem they solve. A long list can increase complexity without increasing perceived value.",

                fix:
                    "Introduce capabilities in the context of the user's immediate goal rather than presenting the product as a catalogue of features.",

                stage:
                    "Product Understanding"
            },

            {
                number: "LEAK 04",
                title: "THE MISSING AHA MOMENT",
                severity: "HIGH",

                what:
                    "The experience does not deliberately guide the user toward an early moment where the product's value becomes obvious.",

                why:
                    "Without an early payoff, the user has little reason to invest additional effort into learning the system.",

                fix:
                    "Identify the smallest meaningful outcome the product can deliver and engineer the first session around reaching it.",

                stage:
                    "Activation"
            }

        ],

        currentPath: [
            "Signup",
            "Profile Setup",
            "Configuration",
            "Feature Tour",
            "Dashboard",
            "Maybe Value"
        ],

        proposedPath: [
            "Signup",
            "One Clear Goal",
            "First Action",
            "Immediate Result",
            "Aha Moment",
            "Activation"
        ],

        impact:
            "Reduce onboarding friction, shorten the path to meaningful product value, clarify the first action, and make activation a deliberate part of the customer journey.",

        conclusion:
            "A signup tells you someone entered the building. It does not tell you they found what they came for. The investigation should focus on the distance between registration and value."
    },


    {
        id: "case-003",

        number: "CASE FILE 003",

        type: "ILLUSTRATIVE INVESTIGATION",

        category: "WELLNESS",

        title: "THE TRUST GAP",

        summary:
            "The brand gets attention from social channels, but the website asks visitors to take action before giving them enough reason to believe, understand, and trust.",

        journey: [
            "Attention",
            "Curiosity",
            "Trust",
            "Understanding",
            "Action"
        ],

        focus:
            "Attention → Credibility → Understanding → Action",

        primaryLeak:
            "The journey asks for commitment before establishing enough confidence.",

        situation: `
            The brand has attention.

            People see the content. They engage with the message.
            Some become curious enough to visit the website.

            Then the experience changes.

            Instead of answering the visitor's quiet questions,
            the page moves quickly toward the sale.

            What is this?

            Can I trust it?

            Does it actually help with my problem?

            Why should I believe this brand?

            What happens if it doesn't work for me?

            These questions are part of the conversion journey whether
            the website addresses them or not.

            If the visitor has to answer them alone, the journey has
            developed a trust leak.
        `,

        leaks: [

            {
                number: "LEAK 01",
                title: "THE CREDIBILITY GAP",
                severity: "HIGH",

                what:
                    "The brand communicates benefits and claims, but the supporting credibility signals are not strong enough or are difficult to find.",

                why:
                    "Wellness purchases can involve a high degree of uncertainty. Visitors need enough evidence to understand what they are considering before committing.",

                fix:
                    "Build a clear proof hierarchy using appropriate evidence, transparent explanations, relevant authority signals, and credible customer experiences.",

                stage:
                    "Trust"
            },

            {
                number: "LEAK 02",
                title: "THE CLAIM WITHOUT CONTEXT",
                severity: "MEDIUM",

                what:
                    "Benefits are presented as statements without enough explanation of how the product or service relates to the customer's actual problem.",

                why:
                    "A claim without context can sound like marketing language rather than useful information.",

                fix:
                    "Connect each major claim to a specific customer problem, explain the mechanism or reasoning where appropriate, and support important claims with suitable evidence.",

                stage:
                    "Understanding"
            },

            {
                number: "LEAK 03",
                title: "THE OBJECTION SILENCE",
                severity: "HIGH",

                what:
                    "The page explains why someone should buy but spends less time addressing why they might hesitate.",

                why:
                    "Objections do not disappear because a website ignores them. They simply remain unresolved inside the visitor's decision.",

                fix:
                    "Identify the most likely objections and address them directly through FAQs, product explanations, policies, proof, and clear expectations.",

                stage:
                    "Decision"
            },

            {
                number: "LEAK 04",
                title: "THE PREMATURE CTA",
                severity: "MEDIUM",

                what:
                    "The primary call to action appears before the visitor has received enough context to make the decision comfortably.",

                why:
                    "The CTA is asking for action before the page has completed enough of the trust-building work.",

                fix:
                    "Match CTA timing to decision readiness. Educate first, establish credibility, resolve important objections, then ask for action.",

                stage:
                    "Action"
            }

        ],

        currentPath: [
            "Social Attention",
            "Landing Page",
            "Product Claim",
            "CTA"
        ],

        proposedPath: [
            "Attention",
            "Clear Problem",
            "Credibility",
            "Understanding",
            "Objection Handling",
            "Action"
        ],

        impact:
            "Strengthen credibility, clarify the product's value, answer important objections, and create a more natural transition from curiosity to action.",

        conclusion:
            "The visitor does not need another reason to click. They need enough reason to believe. If the website asks for the sale before establishing trust, the leak is not hidden at all. It is simply being overlooked."
    }

];