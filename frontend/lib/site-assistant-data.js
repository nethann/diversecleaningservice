import { addons, services } from "@/components/product-data";
import { servicePages } from "@/components/service-data";
import { siteAssistantFaqs } from "@/lib/site-assistant-faqs";

export const bookingPhoneNumber = "(470) 293-9475";
export const serviceAreaSummary = "We currently serve the Atlanta area and some Gwinnett counties.";

const frontDeskPlaybook = [
  {
    id: "playbook-tone",
    title: "Front desk tone",
    tags: ["tone", "style", "front desk", "receptionist", "warm", "helpful"],
    content:
      "Answer like a smart front-desk assistant: warm, calm, concise, confident, and helpful. Sound like a human receptionist for the business."
  },
  {
    id: "playbook-clarify",
    title: "Clarifying questions",
    tags: ["clarify", "follow-up", "ambiguous", "not sure", "which service"],
    content:
      "If a customer question is broad or unclear, ask one short clarifying question instead of guessing. Examples: ask whether they mean residential or commercial, or which cleaning type they are comparing."
  },
  {
    id: "playbook-guidance",
    title: "Guidance behavior",
    tags: ["guide", "recommend", "help choose", "which service", "what should i pick"],
    content:
      "When a customer asks which service is right, briefly compare options and help them choose. Standard cleaning is for routine upkeep, deep cleaning is for heavier detail work, move-in/move-out is for empty-home transitions, and commercial cleaning is for business spaces with an on-site estimate."
  },
  {
    id: "playbook-handoff",
    title: "Human handoff",
    tags: ["call", "handoff", "speak to someone", "help", "agent", "representative"],
    content:
      "When a customer wants direct help, encourage them to call (470) 293-9475 for residential or commercial booking support."
  },
  {
    id: "playbook-trust",
    title: "Trust building",
    tags: ["trust", "safe", "peace of mind", "comfortable", "professional"],
    content:
      "When customers ask trust or comfort questions, emphasize respectful service, professionalism, clear communication, and the goal of leaving the space refreshed and well cared for."
  }
];

const faqEntries = [
  {
    question: "Will I be able to communicate easily with your cleaning team?",
    answer:
      "Our team is friendly, professional, and easy to communicate with throughout the cleaning experience."
  },
  {
    question: "What does your cleaning service include?",
    answer:
      "Services are detail-focused and designed to leave the home refreshed and polished, with special attention to kitchens, bathrooms, floors, and high-touch areas."
  },
  {
    question: "What if I am not satisfied with my cleaning?",
    answer:
      "Your satisfaction comes first. If something is missed, Diverse Cleaning Service will make it right promptly."
  },
  {
    question: "Can I get a quote and book online?",
    answer:
      "Yes. Residential customers can review pricing and book online. Commercial customers should call to schedule a walk-through and estimate."
  },
  {
    question: "What is the difference between standard cleaning and deep cleaning?",
    answer:
      "Standard cleaning is for routine upkeep. Deep cleaning includes everything in standard cleaning plus more detailed work like baseboards, inside appliances, window sills, heavy bathroom scrubbing, and cabinet wipe-down."
  },
  {
    question: "What is included in move-in or move-out cleaning?",
    answer:
      "Move-in or move-out cleaning includes detailed empty-home cleaning such as inside cabinets, inside refrigerator, inside oven, closets, baseboards, and deep bathroom cleaning."
  },
  {
    question: "How does commercial cleaning pricing work?",
    answer:
      "Commercial cleaning is not shown as a flat published rate. A technician will visit the property, review the scope of work, and provide an on-site estimate."
  },
  {
    question: "Do you bring cleaning supplies?",
    answer:
      "The site positions the service as a full cleaning experience and describes standard and add-on service scope, but it does not list a separate customer-supplied product requirement. If a customer has specific product questions or preferences, they should call for details."
  },
  {
    question: "What should I expect when booking?",
    answer:
      "Residential customers can choose a service, select add-ons, review pricing, and book online. Commercial customers should call so a technician can schedule a walk-through and provide an estimate."
  }
];

const businessRules = [
  {
    id: "booking-paths",
    title: "Residential and commercial booking paths",
    tags: ["book", "booking", "residential", "commercial", "estimate", "call", "online"],
    content:
      "Diverse Cleaning Service offers both residential and commercial cleaning. Residential customers can book online. Commercial customers should call because a technician will visit the property and provide an on-site estimate."
  },
  {
    id: "phone-number",
    title: "Phone support",
    tags: ["phone", "call", "number", "contact", "commercial", "residential"],
    content: `The phone number for residential or commercial booking support is ${bookingPhoneNumber}.`
  },
  {
    id: "trust",
    title: "Service approach",
    tags: ["trust", "professional", "respectful", "team", "peace of mind"],
    content:
      "The team is positioned as professional, respectful, and detail-focused. Messaging should emphasize trust, care in the home, and peace of mind."
  },
  {
    id: "service-area",
    title: "Service area",
    tags: ["service area", "location", "atlanta", "gwinnett", "gwinnette", "county", "counties", "where do you service"],
    content: serviceAreaSummary
  },
  {
    id: "supplies-what-to-expect",
    title: "Supplies and expectations",
    tags: ["supplies", "products", "equipment", "what to expect", "bring supplies", "cleaning products"],
    content:
      "The service is presented as a full cleaning experience with defined residential service packages and add-ons. If customers want to confirm product details or preferences, the safest answer is to invite them to call for specifics."
  },
  {
    id: "issue-resolution",
    title: "Satisfaction and issue resolution",
    tags: ["satisfaction", "not satisfied", "problem", "issue", "missed", "fix", "guarantee"],
    content:
      "If something is missed, the business messaging says it will be made right promptly so the home meets the expected standard."
  }
];

const coreIntentKnowledge = [
  {
    id: "intent-pricing",
    title: "Pricing intent",
    tags: ["pricing", "price", "cost", "how much", "quote", "rates"],
    content:
      "Residential pricing is published for Standard House Cleaning, Deep Cleaning, and Move-In / Move-Out Cleaning. Commercial cleaning is handled through an on-site estimate."
  },
  {
    id: "intent-included",
    title: "What's included intent",
    tags: ["included", "what's included", "what is included", "scope", "service includes"],
    content:
      "Customers often want to know what is included in standard cleaning, deep cleaning, and move-in or move-out cleaning. The assistant should explain the scope using the service detail lists."
  },
  {
    id: "intent-addons",
    title: "Add-ons intent",
    tags: ["add-ons", "addons", "extras", "optional services", "inside oven", "laundry", "windows"],
    content:
      "Add-ons have published amounts and should be answered with exact prices when customers ask."
  },
  {
    id: "intent-booking",
    title: "Booking steps intent",
    tags: ["booking", "book", "schedule", "appointment", "how to book"],
    content:
      "Residential customers can book online through the booking page. Residential or commercial customers can also call for help."
  },
  {
    id: "intent-residential-commercial",
    title: "Residential vs commercial intent",
    tags: ["difference", "residential vs commercial", "homes", "businesses", "commercial"],
    content:
      "Residential cleaning has published online pricing. Commercial cleaning requires a technician visit and on-site estimate."
  },
  {
    id: "intent-commercial-estimate",
    title: "Commercial estimate process intent",
    tags: ["estimate", "walk-through", "technician", "commercial estimate", "office quote"],
    content:
      "For commercial cleaning, a technician comes out, walks the property, reviews the scope of work, and provides an estimate."
  },
  {
    id: "intent-supplies",
    title: "Supplies and expectations intent",
    tags: ["supplies", "products", "bring", "equipment", "expect", "what should i do"],
    content:
      "Customers often ask whether the company brings supplies and what to expect before service. The assistant should answer conservatively and invite a call when a policy is not explicitly listed."
  },
  {
    id: "intent-satisfaction",
    title: "Satisfaction and issue resolution intent",
    tags: ["not satisfied", "issue", "problem", "missed", "fix", "make it right"],
    content:
      "Customers often ask what happens if something is missed. The answer should reinforce that the business will make it right promptly."
  }
];

const serviceKnowledge = [
  ...servicePages.map((service) => ({
    id: `service-${service.slug}`,
    title: service.name,
    tags: [
      service.name.toLowerCase(),
      service.shortName.toLowerCase(),
      ...service.slug.split("-"),
      "service",
      "pricing"
    ],
    content: `${service.name}. ${service.description} Price label: ${service.priceLabel}. Pricing note: ${
      service.pricingNote
    }. Pricing tiers: ${service.pricingTiers.map((tier) => `${tier.size}: ${tier.price}`).join("; ")}. Includes: ${
      service.includes.join(", ")
    }.`
  })),
  ...services.map((service) => ({
    id: `summary-${service.slug}`,
    title: `${service.name} summary`,
    tags: [service.name.toLowerCase(), ...service.slug.split("-"), "summary", "price"],
    content: `${service.name}: ${service.description} Price: ${service.priceLabel}. Duration: ${service.duration}.`
  }))
];

const addonKnowledge = [
  {
    id: "addons-overview",
    title: "Add-on pricing overview",
    tags: ["add-on", "addon", "extra", "extras", "inside oven", "refrigerator", "windows", "laundry", "pet"],
    content: `Add-on pricing is: ${addons.map((addon) => `${addon.name}: ${addon.priceLabel}`).join("; ")}.`
  },
  ...addons.map((addon) => ({
    id: `addon-${addon.slug}`,
    title: addon.name,
    tags: [addon.name.toLowerCase(), ...addon.slug.split("-"), "add-on", "addon"],
    content: `${addon.name} is available as an add-on for ${addon.priceLabel}.`
  }))
];

const faqKnowledge = faqEntries.map((entry, index) => ({
  id: `faq-${index + 1}`,
  title: entry.question,
  tags: entry.question.toLowerCase().split(/\W+/).filter(Boolean),
  content: `${entry.question} ${entry.answer}`
}));

const categoryFaqKnowledge = Object.entries(siteAssistantFaqs).flatMap(([category, entries]) =>
  entries.map((entry, index) => ({
    id: `category-${category}-${index + 1}`,
    title: `${category} - ${entry.question}`,
    tags: [category.toLowerCase(), ...entry.question.toLowerCase().split(/\W+/).filter(Boolean)],
    content: `${entry.question} ${entry.answer}`
  }))
);

export const siteAssistantKnowledge = [
  ...frontDeskPlaybook,
  ...coreIntentKnowledge,
  ...businessRules,
  ...serviceKnowledge,
  ...addonKnowledge,
  ...faqKnowledge,
  ...categoryFaqKnowledge
];

export const siteAssistantSystemPrompt = `
You are the website assistant for Diverse Cleaning Service.

Your job:
- Answer customer questions about this site, services, pricing, add-ons, booking, and commercial estimates.
- Be warm, clear, and concise.
- Sound like a smart front-desk assistant for the business, not a generic AI.

Rules:
- Use only the supplied business knowledge.
- Do not invent discounts, service areas, policies, staff details, or promises that are not in the site knowledge.
- If the question is about commercial cleaning, explain that a technician will visit the property and provide an on-site estimate.
- If the question is about booking, explain that residential customers can book online and residential or commercial customers can call ${bookingPhoneNumber}.
- If the user asks about pricing, answer with the real ranges and exact add-on amounts when available.
- If the user asks about location or service area, explain that the business currently serves the Atlanta area and some Gwinnett counties.
- If the question is ambiguous, ask one short clarifying question.
- If the customer seems to be deciding between services, help them choose.
- If the customer seems ready to act, naturally point them toward booking, pricing, calling, or a commercial estimate.
- Prefer practical, customer-facing answers over abstract explanations.
- If you still do not know, recommend calling ${bookingPhoneNumber}.
- Keep answers short enough to feel conversational.
`;

export function detectPrimaryIntent(question, messages = []) {
  const text = `${messages.map((message) => message.content).join(" ")} ${question}`.toLowerCase();

  if (/(commercial|business|office|estimate|walk-through)/.test(text)) return "commercial_estimate";
  if (/(difference|compare|which service|what should i choose|best fit)/.test(text)) return "service_guidance";
  if (/(add-on|addon|oven|refrigerator|fridge|cabinet|windows|laundry|pet)/.test(text)) return "addons";
  if (/(price|pricing|cost|how much|quote|rate)/.test(text)) return "pricing";
  if (/(included|what does.*include|scope|what is included)/.test(text)) return "included";
  if (/(book|booking|schedule|appointment)/.test(text)) return "booking";
  if (/(service area|location|atlanta|gwinnett|county)/.test(text)) return "location";
  if (/(satisfied|missed|problem|issue|fix|make it right)/.test(text)) return "satisfaction";
  if (/(supplies|products|bring|equipment|expect)/.test(text)) return "supplies";
  return "general";
}

export function suggestAssistantActions(question, answer = "") {
  const text = `${question} ${answer}`.toLowerCase();
  const actions = [];

  function addAction(type, label) {
    if (!actions.some((action) => action.type === type)) {
      actions.push({ type, label });
    }
  }

  if (
    text.includes("book") ||
    text.includes("appointment") ||
    text.includes("schedule") ||
    text.includes("residential") ||
    text.includes("booking page") ||
    text.includes("book online")
  ) {
    addAction("open_booking_page", "Book residential cleaning");
  }

  if (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("cost") ||
    text.includes("how much") ||
    text.includes("quote") ||
    text.includes("add-on") ||
    text.includes("addon")
  ) {
    addAction("open_pricing_page", "View pricing");
  }

  if (
    text.includes("phone") ||
    text.includes("call") ||
    text.includes("number") ||
    text.includes("contact")
  ) {
    addAction("show_phone_number", `Call ${bookingPhoneNumber}`);
  }

  if (
    text.includes("commercial") ||
    text.includes("business") ||
    text.includes("estimate") ||
    text.includes("office")
  ) {
    addAction("request_commercial_estimate", "Request commercial estimate");
    addAction("show_phone_number", `Call ${bookingPhoneNumber}`);
  }

  if (
    text.includes("location") ||
    text.includes("service area") ||
    text.includes("atlanta") ||
    text.includes("gwinnett") ||
    text.includes("gwynette") ||
    text.includes("county")
  ) {
    addAction("show_service_area", "Service area");
  }

  return actions.slice(0, 3);
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreEntry(entry, tokens, query) {
  let score = 0;

  for (const token of tokens) {
    if (entry.tags.some((tag) => tag.includes(token) || token.includes(tag))) {
      score += 4;
    }

    if (entry.title.toLowerCase().includes(token)) {
      score += 2;
    }

    if (entry.content.toLowerCase().includes(token)) {
      score += 1;
    }
  }

  if (query.includes("how much") && entry.content.toLowerCase().includes("$")) {
    score += 3;
  }

  if (query.includes("commercial") && entry.content.toLowerCase().includes("estimate")) {
    score += 3;
  }

  return score;
}

export function buildRelevantKnowledge(question, messages = []) {
  const transcriptText = [...messages.map((message) => message.content), question].join(" ");
  const tokens = tokenize(transcriptText);

  const ranked = siteAssistantKnowledge
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, tokens, question.toLowerCase())
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.entry);

  if (!ranked.length) {
    return businessRules.slice(0, 2);
  }

  return ranked;
}

export function buildKnowledgeBlock(question, messages = []) {
  const relevant = buildRelevantKnowledge(question, messages);
  return relevant.map((entry) => `${entry.title}: ${entry.content}`).join("\n\n");
}

export function buildFrontDeskContext(question, messages = []) {
  const intent = detectPrimaryIntent(question, messages);
  const recentConversation = messages
    .slice(-4)
    .map((message) => `${message.role === "user" ? "Customer" : "Assistant"}: ${message.content}`)
    .join("\n");

  const intentGuidanceMap = {
    pricing:
      "The customer is asking about price. Answer with exact published residential ranges when available and mention commercial cleaning is estimate-based if relevant.",
    included:
      "The customer wants to know what is included. Use the service scope lists and explain clearly.",
    addons:
      "The customer is asking about add-ons. Use exact add-on pricing and names.",
    booking:
      "The customer is asking how to book or schedule. Guide them clearly: residential can book online, residential or commercial can call, commercial needs a walk-through estimate.",
    commercial_estimate:
      "The customer is asking about business cleaning or estimates. Explain the technician visit and on-site estimate process confidently.",
    service_guidance:
      "The customer needs help choosing a service. Compare standard, deep cleaning, move-in/move-out, and commercial cleaning briefly and help them choose.",
    location:
      "The customer is asking about service area. State that the business currently serves the Atlanta area and some Gwinnett counties.",
    satisfaction:
      "The customer is asking about issues or satisfaction. Reassure them that if something is missed, it will be made right promptly.",
    supplies:
      "The customer is asking about supplies or what to expect. Answer carefully using only listed business knowledge and invite a phone call for specifics if policy details are not explicit.",
    general:
      "Answer helpfully using the most relevant business information and keep the tone like a front-desk assistant."
  };

  return {
    intent,
    summary: `Primary intent: ${intent}\nIntent guidance: ${intentGuidanceMap[intent]}\nRecent conversation:\n${recentConversation || "No prior conversation."}`
  };
}

export function fallbackAssistantAnswer(question) {
  const text = question.toLowerCase();

  if (["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].some((greeting) => text.includes(greeting))) {
    return "Hi! I can help with residential pricing, commercial cleaning estimates, add-ons, and booking questions. What would you like to know?";
  }

  if (text.includes("commercial")) {
    return `Yes. We offer commercial cleaning. A technician will visit the property and provide an on-site estimate. Please call ${bookingPhoneNumber} to get started.`;
  }

  if (
    text.includes("location") ||
    text.includes("service area") ||
    text.includes("atlanta") ||
    text.includes("gwinnett") ||
    text.includes("gwynette") ||
    text.includes("county")
  ) {
    return `${serviceAreaSummary} If you'd like to confirm your exact location, please call ${bookingPhoneNumber}.`;
  }

  if (
    text.includes("residential") ||
    text.includes("house cleaning") ||
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("cost") ||
    text.includes("how much") ||
    text.includes("quote")
  ) {
    return "Residential pricing starts at $90 - $110 for a 1 bedroom / 1 bath standard house cleaning. Deep cleaning ranges from $150 - $400, and move-in or move-out cleaning ranges from $200 - $450 depending on home size. Ask about a specific service if you want exact ranges.";
  }

  if (text.includes("deep cleaning")) {
    return "Deep cleaning ranges from $150 - $180 for a 1 bedroom home, $180 - $220 for 2 bedrooms, $220 - $300 for 3 bedrooms, and $300 - $400 for 4 bedrooms.";
  }

  if (text.includes("move-in") || text.includes("move out") || text.includes("move-out")) {
    return "Move-in / move-out cleaning ranges from $200 - $275 for 1-2 bedrooms, $275 - $350 for 3 bedrooms, and $350 - $450 for 4 bedrooms.";
  }

  if (text.includes("standard cleaning")) {
    return "Standard house cleaning ranges from $90 - $110 for 1 bedroom / 1 bath, $110 - $130 for 2 bedroom / 1-2 bath, $130 - $160 for 3 bedroom / 2 bath, and $160 - $200 for 4 bedroom / 2-3 bath.";
  }

  if (
    text.includes("add-on") ||
    text.includes("addon") ||
    text.includes("oven") ||
    text.includes("refrigerator") ||
    text.includes("fridge") ||
    text.includes("cabinet") ||
    text.includes("windows") ||
    text.includes("laundry") ||
    text.includes("pet")
  ) {
    return "Add-ons include Inside Oven ($25 - $40), Inside Refrigerator ($25 - $40), Inside Cabinets ($25 - $50), Interior Windows ($5 per window), Laundry ($20 - $30), and Pet Hair Removal ($25 - $50).";
  }

  if (text.includes("book") || text.includes("appointment")) {
    return `Residential customers can book online through the booking page. For residential or commercial booking help, please call ${bookingPhoneNumber}.`;
  }

  if (text.includes("satisfaction") || text.includes("missed")) {
    return "Your satisfaction comes first. If something is missed, Diverse Cleaning Service will make it right promptly.";
  }

  return `I can help with residential pricing, add-ons, services, booking, and commercial cleaning estimates. If you'd rather speak with someone directly, please call ${bookingPhoneNumber}.`;
}
