import { NextResponse } from "next/server";
import { addons, services } from "@/components/product-data";
import { servicePages } from "@/components/service-data";

const bookingPhoneNumber = "(470) 293-9475";

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
  }
];

function buildKnowledgeBase() {
  const residentialServices = servicePages
    .filter((service) => service.slug !== "commercial-cleaning-service")
    .map((service) => {
      const tiers = service.pricingTiers.map((tier) => `${tier.size}: ${tier.price}`).join("; ");
      const includes = service.includes.join(", ");
      return `${service.name} | ${service.priceLabel} | ${service.description} | Tiers: ${tiers} | Includes: ${includes}`;
    })
    .join("\n");

  const commercialService = servicePages.find((service) => service.slug === "commercial-cleaning-service");
  const addOnLines = addons.map((addon) => `${addon.name}: ${addon.priceLabel}`).join("; ");
  const serviceList = services.map((service) => `${service.name}: ${service.priceLabel}`).join("; ");
  const faqLines = faqEntries.map((entry) => `Q: ${entry.question} A: ${entry.answer}`).join("\n");

  return `
Business name: Diverse Cleaning Service
Phone: ${bookingPhoneNumber}

Residential and commercial cleaning are both offered.
Residential customers can book online.
Commercial customers should call and a technician will visit the property and provide an on-site estimate.

Top-level services:
${serviceList}

Residential service details:
${residentialServices}

Commercial cleaning:
${commercialService ? `${commercialService.description} | ${commercialService.pricingNote} | ${commercialService.includes.join(", ")}` : "Commercial cleaning is available by on-site estimate."}

Add-on pricing:
${addOnLines}

FAQs:
${faqLines}
`;
}

function fallbackAnswer(question) {
  const text = question.toLowerCase();

  if (text.includes("commercial")) {
    return `Yes. We offer commercial cleaning. For businesses, a technician will visit the property and provide an on-site estimate. Please call ${bookingPhoneNumber} to get started.`;
  }

  if (text.includes("residential") || text.includes("house cleaning") || text.includes("price")) {
    return `Residential pricing currently starts at $90 - $110 for a 1 bedroom / 1 bath standard cleaning and goes up based on home size and service type. You can also view the full pricing page or ask about a specific service.`;
  }

  if (text.includes("add-on") || text.includes("oven") || text.includes("refrigerator") || text.includes("windows") || text.includes("laundry") || text.includes("pet")) {
    return "Add-ons include Inside Oven ($25 - $40), Inside Refrigerator ($25 - $40), Inside Cabinets ($25 - $50), Interior Windows ($5 per window), Laundry ($20 - $30), and Pet Hair Removal ($25 - $50).";
  }

  if (text.includes("book") || text.includes("appointment")) {
    return `Residential customers can book online through the booking page. For residential or commercial booking help, please call ${bookingPhoneNumber}.`;
  }

  if (text.includes("satisfaction") || text.includes("missed")) {
    return "Your satisfaction comes first. If something is missed, Diverse Cleaning Service will make it right promptly.";
  }

  return `I can help with residential pricing, add-ons, service types, and commercial cleaning estimates. You can also call ${bookingPhoneNumber} for residential or commercial booking support.`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";

    if (!latestUserMessage.trim()) {
      return NextResponse.json({ answer: "Please send a question so I can help." }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: fallbackAnswer(latestUserMessage) });
    }

    const knowledgeBase = buildKnowledgeBase();
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const input = [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are the website chatbot for Diverse Cleaning Service. Answer warmly, briefly, and accurately using only the provided business information. If asked about commercial cleaning, say a technician will visit and provide an on-site estimate. If asked how to book, explain that residential can book online and residential or commercial customers can call " +
              bookingPhoneNumber +
              ". Do not invent discounts, service areas, or policies that are not provided. If unsure, recommend calling " +
              bookingPhoneNumber +
              "."
          },
          {
            type: "input_text",
            text: `Business knowledge:\n${knowledgeBase}`
          }
        ]
      },
      ...messages.slice(-8).map((message) => ({
        role: message.role,
        content: [{ type: "input_text", text: message.content }]
      }))
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        input
      })
    });

    if (!response.ok) {
      return NextResponse.json({ answer: fallbackAnswer(latestUserMessage) });
    }

    const data = await response.json();
    const answer =
      data.output_text ||
      data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text ||
      fallbackAnswer(latestUserMessage);

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({
      answer: `I’m sorry, I’m having trouble right now. Please call ${bookingPhoneNumber} for residential or commercial booking support.`
    });
  }
}
