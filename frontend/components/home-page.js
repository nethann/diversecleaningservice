"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { servicePages } from "@/components/service-data";

const benefits = [
  {
    name: "English Speaking Staff",
    description:
      "Clear communication matters. Our team is friendly, professional, and easy to communicate with throughout the entire cleaning experience.",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80",
    alt: "Professional cleaner speaking with a client"
  },
  {
    name: "Thorough Cleaning Experience",
    description:
      "Our cleanings are detail-focused from kitchens and bathrooms to floors and high-touch areas, leaving your home refreshed and polished.",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
    alt: "Beautifully cleaned and organized kitchen"
  },
  {
    name: "100% Satisfaction Guarantee",
    description:
      "Your satisfaction comes first. If something is missed, we will make it right promptly so your home meets the standard you expect.",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
    alt: "Happy customer enjoying a clean living room"
  },
  {
    name: "Instant Quotes & Online Booking",
    description:
      "Get straightforward pricing, choose your service and add-ons, and book online in minutes without the back-and-forth.",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
    alt: "Customer booking a service online"
  }
];

const addons = [
  {
    name: "Oven Cleaning",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M7 9h10" />
        <path d="M8 13h8v4H8z" />
      </svg>
    )
  },
  {
    name: "Fridge Cleaning",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="7" y="3.5" width="10" height="17" rx="2" />
        <path d="M7 11.5h10" />
        <path d="M15 7v2" />
        <path d="M15 14v2" />
      </svg>
    )
  },
  {
    name: "Interior Windows",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M12 4v16" />
        <path d="M4 12h16" />
      </svg>
    )
  },
  {
    name: "Pet Hair Removal",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 19c3.2 0 5.5-1.7 5.5-4 0-1.7-1.2-2.8-3-3.3-.8-.2-1.6-.2-2.5-.2s-1.7 0-2.5.2c-1.8.5-3 1.6-3 3.3 0 2.3 2.3 4 5.5 4z" />
        <path d="M8 9.5c.9 0 1.5-.9 1.5-2s-.6-2-1.5-2-1.5.9-1.5 2 .6 2 1.5 2z" />
        <path d="M16 9.5c.9 0 1.5-.9 1.5-2s-.6-2-1.5-2-1.5.9-1.5 2 .6 2 1.5 2z" />
      </svg>
    )
  }
];

export function HomePage() {
  const [openServiceSlug, setOpenServiceSlug] = useState(servicePages[0]?.slug ?? null);

  function toggleService(slug) {
    setOpenServiceSlug((current) => (current === slug ? null : slug));
  }

  return (
    <main className="pb-24">
      <SiteHeader />

      <section id="home" className="shell py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="animate-enter rounded-[2rem] bg-[#f2ece1] p-8 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Home</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-[#243128] sm:text-6xl lg:text-[4.35rem] lg:leading-[1.02]">
              Your Time is Precious. Why Spend it Cleaning?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6c61]">
              diversecleaningservice offers beautifully maintained homes, dependable service, and a simple way to book online.
              Choose your service, select a time, and let us handle the rest.
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

          <div className=" grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-[2rem] shadow-panel">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80"
                alt="Freshly cleaned living room"
                className="h-full min-h-[430px] w-full object-cover"
              />
            </div>
            <div className="grid gap-4">
              <div className="overflow-hidden rounded-[2rem] shadow-panel">
                <img
                  src="https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80"
                  alt="Clean kitchen details"
                  className="h-52 w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-[2rem] shadow-panel">
                <img
                  src="https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=80"
                  alt="Neatly styled clean bedroom"
                  className="h-52 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-10 lg:py-14">
        <div className="rounded-[2rem] bg-white px-8 py-10 shadow-panel sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Why choose us</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#243128] sm:text-5xl">
            Why you&apos;ll love our cleaning services
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="overflow-hidden rounded-[1.75rem] border border-[#ece4d6] bg-[#fbf8f2]">
                <img src={benefit.image} alt={benefit.alt} className="h-52 w-full object-cover" />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-[#243128]">{benefit.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#5f6c61]">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="shell py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Services</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#243128] sm:text-5xl">
              Services tailored to the way you live.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[#5f6c61]">
              Browse our most requested cleaning services below. Each option is designed to help customers quickly
              understand what fits their home best.
            </p>
            <div className="mt-8 overflow-hidden rounded-[2rem] shadow-panel">
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
                alt="Bedroom prepared after cleaning"
                className="h-[420px] w-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-4">
            {servicePages.map((service) => {
              const isOpen = openServiceSlug === service.slug;

              return (
                <div
                  key={service.name}
                  className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-panel transition-all duration-400 ease-out ${
                    isOpen ? "border-[#dcd1bc] shadow-[0_22px_50px_rgba(36,49,40,0.12)]" : "border-[#e6e0d3]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleService(service.slug)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left"
                  >
                    <span className="text-[1.35rem] font-semibold text-[#243128]">{service.name}</span>
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
                        className={`border-t border-[#ebe4d7] px-6 pb-6 pt-5 text-sm leading-7 text-[#5f6c61] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          isOpen ? "translate-y-0" : "-translate-y-2"
                        }`}
                      >
                        <p>{service.description}</p>
                        <div className="mt-4 inline-flex rounded-full bg-[#f3eee4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f8a67]">
                          {service.priceLabel}
                        </div>
                        <ul className="mt-4 space-y-2">
                          {service.includes.map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-[#6f8a67]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href={`/services/${service.slug}`} className="mt-4 inline-flex font-semibold text-[#4c6247]">
                          Learn more
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="shell py-10 lg:py-14">
        <div className="rounded-[2rem] bg-white px-8 py-10 shadow-panel sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Add-ons</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#243128] sm:text-5xl">Popular extras</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6c61]">
            Add finishing touches to customize your cleaning appointment.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {addons.map((addon) => (
              <div key={addon.name} className="rounded-[1.75rem] border border-[#ece4d6] bg-[#fbf8f2] p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#6f8a67] shadow-sm">
                  {addon.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#243128]">{addon.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
