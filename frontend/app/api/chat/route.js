import {
  bookingPhoneNumber,
  buildFrontDeskContext,
  buildKnowledgeBlock,
  fallbackAssistantAnswer,
  siteAssistantSystemPrompt,
  suggestAssistantActions
} from "@/lib/site-assistant-data";

// ── Rate limiting ──────────────────────────────────────────────────────────────
// Note: in-memory only — resets on server restart and won't share state across
// serverless instances. Good enough for basic abuse prevention on a single process.
const rateLimitMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ── SSE helpers ────────────────────────────────────────────────────────────────
const enc = new TextEncoder();

function encodeEvent(payload) {
  return enc.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

function staticSseResponse(events) {
  const stream = new ReadableStream({
    start(controller) {
      for (const event of events) controller.enqueue(encodeEvent(event));
      controller.close();
    }
  });
  return sseResponse(stream);
}

function sseResponse(stream) {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  });
}

// ── Action instruction injected at call time (keeps site-assistant-data clean) ─
const ACTIONS_INSTRUCTION = `After your answer, on a new line output exactly: ACTIONS: followed by a compact JSON array of up to 3 action objects. Each object must have "type" (one of: open_booking_page, open_pricing_page, show_phone_number, request_commercial_estimate, show_service_area) and "label" (short customer-facing text, under 35 characters). If no action is natural, output ACTIONS: [].
Example: ACTIONS: [{"type":"open_booking_page","label":"Book online"},{"type":"show_phone_number","label":"Call (470) 293-9475"}]`;

// ── Route handler ──────────────────────────────────────────────────────────────
export async function POST(request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const latestUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    if (!latestUserMessage.trim()) {
      return new Response(
        JSON.stringify({ error: "Please send a question." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // ── Fallback: no API key ─────────────────────────────────────────────────
    if (!apiKey) {
      const answer = fallbackAssistantAnswer(latestUserMessage);
      const actions = suggestAssistantActions(latestUserMessage, answer);
      const fullText = actions.length
        ? `${answer}\nACTIONS:${JSON.stringify(actions)}`
        : answer;
      return staticSseResponse([{ delta: fullText }, { done: true }]);
    }

    // ── Build OpenAI input ───────────────────────────────────────────────────
    const recentMessages = messages.slice(-8);
    const relevantKnowledge = buildKnowledgeBlock(latestUserMessage, recentMessages);
    const frontDeskContext = buildFrontDeskContext(latestUserMessage, recentMessages);
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const input = [
      {
        role: "system",
        content: [
          { type: "input_text", text: siteAssistantSystemPrompt },
          { type: "input_text", text: `Relevant business knowledge:\n${relevantKnowledge}` },
          { type: "input_text", text: `Front desk context:\n${frontDeskContext.summary}` },
          { type: "input_text", text: ACTIONS_INSTRUCTION }
        ]
      },
      ...recentMessages.map((m) => ({
        role: m.role,
        content: [{ type: "input_text", text: m.content }]
      }))
    ];

    // ── Stream from OpenAI ───────────────────────────────────────────────────
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, input, stream: true })
    });

    if (!openAiResponse.ok || !openAiResponse.body) {
      const answer = fallbackAssistantAnswer(latestUserMessage);
      const actions = suggestAssistantActions(latestUserMessage, answer);
      const fullText = actions.length
        ? `${answer}\nACTIONS:${JSON.stringify(actions)}`
        : answer;
      return staticSseResponse([{ delta: fullText }, { done: true }]);
    }

    // ── Proxy stream → client ────────────────────────────────────────────────
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openAiResponse.body.getReader();
        const decoder = new TextDecoder();
        let lineBuffer = "";
        let doneSent = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            lineBuffer += decoder.decode(value, { stream: true });
            const lines = lineBuffer.split("\n");
            lineBuffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;

              try {
                const event = JSON.parse(data);
                if (event.type === "response.output_text.delta" && event.delta) {
                  controller.enqueue(encodeEvent({ delta: event.delta }));
                } else if (
                  event.type === "response.completed" ||
                  event.type === "response.done"
                ) {
                  doneSent = true;
                  controller.enqueue(encodeEvent({ done: true }));
                }
              } catch {}
            }
          }
        } finally {
          if (!doneSent) controller.enqueue(encodeEvent({ done: true }));
          controller.close();
        }
      }
    });

    return sseResponse(stream);
  } catch (error) {
    console.error("Chat route error", error);
    const answer = `I'm sorry, I'm having trouble right now. Please call ${bookingPhoneNumber} for residential or commercial booking support.`;
    const actions = [{ type: "show_phone_number", label: `Call ${bookingPhoneNumber}` }];
    return staticSseResponse([
      { delta: `${answer}\nACTIONS:${JSON.stringify(actions)}` },
      { done: true }
    ]);
  }
}
