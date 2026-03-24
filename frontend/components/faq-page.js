"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";

const faqs = [
  {
    question: "Will I be able to communicate easily with your cleaning team?",
    answer:
      "Yes. Our team is friendly, professional, and easy to communicate with throughout the cleaning experience, so expectations and requests stay clear from start to finish."
  },
  {
    question: "What does your cleaning service include?",
    answer:
      "Our cleaning services are detail-focused and designed to leave your home refreshed and polished. We give careful attention to kitchens, bathrooms, floors, and other high-touch living areas."
  },
  {
    question: "What if I am not satisfied with my cleaning?",
    answer:
      "Your satisfaction comes first. If something is missed, we will make it right promptly so your home meets the standard you expect from diversecleaningservice."
  },
  {
    question: "Can I get a quote and book online?",
    answer:
      "Yes. We offer straightforward pricing, simple service selection, optional add-ons, and online booking so you can schedule your cleaning without back-and-forth calls or in-person estimates."
  }
];

export function FaqPage() {
  const [openQuestion, setOpenQuestion] = useState(faqs[0]?.question ?? null);

  function toggleQuestion(question) {
    setOpenQuestion((current) => (current === question ? null : question));
  }

  return (
    <main className="pb-24">
      <SiteHeader />

      <section className="shell py-12 lg:py-16">
        <div className="rounded-[2rem] bg-[#f2ece1] p-8 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">FAQs</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-[#243128] sm:text-6xl">
            Frequently asked questions
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6c61]">
            Everything customers usually want to know before booking a cleaning with diversecleaningservice.
          </p>
          <div className="mt-8">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </section>

      <section className="shell py-2 lg:py-6">
        <ScrollReveal className="space-y-4" delay={80}>
          {faqs.map((item) => {
            const isOpen = openQuestion === item.question;

            return (
              <div
                key={item.question}
                className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-panel transition-all duration-400 ease-out ${
                  isOpen ? "border-[#dcd1bc] shadow-[0_22px_50px_rgba(36,49,40,0.12)]" : "border-[#e6e0d3]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(item.question)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
                >
                  <span className="text-[1.3rem] font-semibold text-[#243128]">{item.question}</span>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3eee4] text-[#6f8a67] transition-all duration-300 ${
                      isOpen ? "rotate-45 bg-[#dfe8d9] text-[#4c6247] shadow-sm" : "rotate-0"
                    }`}
                  >
                    <span className="text-2xl leading-none">+</span>
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`border-t border-[#ebe4d7] px-6 pb-6 pt-5 text-sm leading-8 text-[#5f6c61] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isOpen ? "translate-y-0" : "-translate-y-2"
                      }`}
                    >
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollReveal>
      </section>
    </main>
  );
}
