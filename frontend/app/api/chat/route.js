import { NextResponse } from "next/server";
import {
  bookingPhoneNumber,
  buildKnowledgeBlock,
  fallbackAssistantAnswer,
  siteAssistantSystemPrompt,
  suggestAssistantActions
} from "@/lib/site-assistant-data";

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
      const answer = fallbackAssistantAnswer(latestUserMessage);
      return NextResponse.json({ answer, actions: suggestAssistantActions(latestUserMessage, answer) });
    }

    const relevantKnowledge = buildKnowledgeBlock(latestUserMessage, messages.slice(-8));
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const input = [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: siteAssistantSystemPrompt
          },
          {
            type: "input_text",
            text: `Relevant business knowledge:\n${relevantKnowledge}`
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
      console.error("OpenAI chat response failed", response.status, response.statusText);
      const answer = fallbackAssistantAnswer(latestUserMessage);
      return NextResponse.json({ answer, actions: suggestAssistantActions(latestUserMessage, answer) });
    }

    const data = await response.json();
    const answer =
      data.output_text ||
      data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text ||
      fallbackAssistantAnswer(latestUserMessage);

    return NextResponse.json({ answer, actions: suggestAssistantActions(latestUserMessage, answer) });
  } catch (error) {
    console.error("OpenAI chat route error", error);
    const answer = `I'm sorry, I'm having trouble right now. Please call ${bookingPhoneNumber} for residential or commercial booking support.`;
    return NextResponse.json({
      answer,
      actions: suggestAssistantActions("call booking support", answer)
    });
  }
}
