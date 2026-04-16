"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

const starterQuestions = [
  "What are your residential prices?",
  "Do you offer commercial cleaning?",
  "What add-ons do you offer?",
  "How do I book?"
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I can help with residential pricing, commercial cleaning estimates, add-ons, and booking questions."
    }
  ]);
  const formRef = useRef(null);

  const visibleMessages = useMemo(() => messages.slice(-10), [messages]);

  async function sendMessage(messageText) {
    const trimmed = messageText.trim();
    if (!trimmed || loading) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmed }];
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
            "I’m sorry, I couldn’t answer that right now. Please call (470) 293-9475 and we’ll be happy to help."
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I’m sorry, I’m having trouble right now. Please call (470) 293-9475 for residential or commercial booking help."
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(36,49,40,0.25)] transition hover:bg-[#4c6247]"
      >
        {open ? "Close assistant" : "Chat with us"}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-40 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-[#e4ddce] bg-white shadow-[0_28px_70px_rgba(36,49,40,0.18)]">
          <div className="border-b border-[#ece4d6] bg-[#f2ece1] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6f8a67]">Diverse Cleaning Service</p>
            <h2 className="mt-2 text-xl font-semibold text-[#243128]">Booking Assistant</h2>
            <p className="mt-2 text-sm leading-6 text-[#5f6c61]">
              Ask about pricing, add-ons, residential bookings, or commercial cleaning estimates.
            </p>
          </div>

          <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-5">
            {visibleMessages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-7 ${
                    message.role === "user"
                      ? "bg-[#6f8a67] text-white"
                      : "bg-[#f7f3ea] text-[#374038]"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-[1.4rem] bg-[#f7f3ea] px-4 py-3 text-sm text-[#5f6c61]">Thinking...</div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#ece4d6] px-5 py-4">
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
              <textarea
                rows={3}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question..."
                className="field-input w-full rounded-[1.4rem]"
              />
              <div className="flex items-center justify-between gap-3">
                <Link href="/booking" className="text-sm font-semibold text-[#4c6247]">
                  Book online
                </Link>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247] disabled:cursor-not-allowed disabled:bg-[#b3beaf]"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
