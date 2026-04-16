"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const bookingPhoneNumber = "(470) 293-9475";
const serviceAreaSummary = "We currently serve the Atlanta area and some Gwinnett counties.";

const starterQuestions = [
  "What are your residential prices?",
  "Do you offer commercial cleaning?",
  "What add-ons do you offer?",
  "Do you serve my area?"
];

function AssistantBadge() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6f8a67] text-xs font-semibold text-white shadow-sm">
      DCS
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#93a489]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#93a489] [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#93a489] [animation-delay:240ms]" />
    </div>
  );
}

function normalizeActions(actions) {
  if (!Array.isArray(actions)) {
    return [];
  }

  return actions
    .filter((action) => action?.type)
    .map((action) => ({
      type: action.type,
      label: action.label || action.type
    }));
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can help with residential pricing, commercial cleaning estimates, add-ons, booking questions, and service area details.",
      actions: []
    }
  ]);

  const formRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const visibleMessages = useMemo(() => messages.slice(-10), [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }, [visibleMessages, loading, open]);

  async function sendMessage(messageText) {
    const trimmed = messageText.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmed, actions: [] }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content
          }))
        })
      });

      const data = await response.json();

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.answer ??
            "I'm sorry, I couldn't answer that right now. Please call (470) 293-9475 and we'll be happy to help.",
          actions: normalizeActions(data.actions)
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble right now. Please call (470) 293-9475 for residential or commercial booking help.",
          actions: [{ type: "show_phone_number", label: `Call ${bookingPhoneNumber}` }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  function appendAssistantMessage(content, actions = []) {
    setMessages((current) => [...current, { role: "assistant", content, actions }]);
  }

  function handleAction(action) {
    switch (action.type) {
      case "open_booking_page":
        window.location.href = "/booking";
        return;
      case "open_pricing_page":
        window.location.href = "/pricing";
        return;
      case "show_phone_number":
        window.location.href = "tel:+14702939475";
        return;
      case "request_commercial_estimate":
        appendAssistantMessage(
          `For commercial cleaning, please call ${bookingPhoneNumber}. A technician will visit the property and provide an on-site estimate.`,
          [
            { type: "show_phone_number", label: `Call ${bookingPhoneNumber}` },
            { type: "show_service_area", label: "Service area" }
          ]
        );
        return;
      case "show_service_area":
        appendAssistantMessage(`${serviceAreaSummary} If you'd like to confirm your exact location, please call ${bookingPhoneNumber}.`);
        return;
      default:
        return;
    }
  }

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(36,49,40,0.25)] transition hover:bg-[#4c6247]"
        >
          Chat with us
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-[2rem] border border-[#e4ddce] bg-white shadow-[0_28px_70px_rgba(36,49,40,0.18)] sm:inset-auto sm:bottom-24 sm:right-5 sm:w-[min(390px,calc(100vw-2rem))] sm:max-h-[760px]">
          <div className="border-b border-[#ece4d6] bg-[#f2ece1] px-4 py-4 sm:px-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8a67]">Diverse Cleaning Service</p>
                <div className="mt-2 flex items-center gap-3">
                  <AssistantBadge />
                  <div>
                    <h2 className="text-lg font-semibold text-[#243128] sm:text-xl">Booking Assistant</h2>
                    <p className="text-xs text-[#6c7668]">Ask about pricing, booking, add-ons, or service areas.</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-2xl font-semibold leading-none text-[#4c6247] transition hover:bg-white hover:text-[#243128]"
              >
                ×
              </button>
            </div>
          </div>

          <div ref={messagesContainerRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            {visibleMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" ? (
                  <div className="flex max-w-[92%] items-start gap-3">
                    <AssistantBadge />
                    <div className="space-y-3">
                      <div className="rounded-[1.4rem] border border-[#e8e1d3] bg-[#f7f3ea] px-4 py-3 text-sm leading-7 text-[#374038]">
                        {message.content}
                      </div>
                      {message.actions?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {message.actions.map((action) => (
                            <button
                              key={`${message.role}-${index}-${action.type}`}
                              type="button"
                              onClick={() => handleAction(action)}
                              className="rounded-full border border-[#d9cfbb] bg-white px-3 py-2 text-xs font-semibold text-[#4c6247] transition hover:bg-[#f1ebde]"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-[1.4rem] bg-[#6f8a67] px-4 py-3 text-sm leading-7 text-white">
                    {message.content}
                  </div>
                )}
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="flex max-w-[90%] items-start gap-3">
                  <AssistantBadge />
                  <div className="rounded-[1.4rem] border border-[#e8e1d3] bg-[#f7f3ea] px-4 py-4">
                    <TypingDots />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#ece4d6] px-4 py-4 sm:px-5">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-full border border-[#ddd3be] bg-[#fbf8f2] px-3 py-2 text-xs font-semibold text-[#4c6247] transition hover:bg-[#f1ebde]"
                >
                  {question}
                </button>
              ))}
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-end gap-3">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="field-input min-h-[52px] flex-1 resize-none rounded-[1.4rem]"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#6f8a67] text-white transition hover:bg-[#4c6247] disabled:cursor-not-allowed disabled:bg-[#b3beaf]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h11" />
                    <path d="M11 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-[#7b8474]">Press Enter to send</div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
