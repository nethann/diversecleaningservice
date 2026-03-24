"use client";

import Link from "next/link";
import { useState } from "react";
import { servicePages } from "@/components/service-data";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faqs", label: "FAQs" }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
    setServicesOpen(false);
  }

  return (
    <header className="shell pt-5 sm:pt-6">
      <div className="rounded-[1.75rem] border border-[#e6e0d3] bg-white px-5 py-4 shadow-panel sm:rounded-full sm:px-7 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 text-[#243128]" onClick={closeMenu}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6f8a67] text-sm font-semibold text-white">
              DCS
            </span>
            <div>
              <div className="text-lg font-semibold leading-none">Diverse Cleaning Service</div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#7a8478] sm:text-xs">
                Elevated home cleaning
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <nav className="flex items-center gap-5 text-sm font-medium text-[#5f6c61]">
              <Link href="/" className="transition hover:text-[#4c6247]">
                Home
              </Link>

              <div className="group relative">
                <button type="button" className="flex items-center gap-1 transition hover:text-[#4c6247] focus:outline-none">
                  <span>Services</span>
                  <span className="text-xs">v</span>
                </button>
                <div className="absolute left-0 top-full z-20 pt-2 opacity-0 invisible transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-72 rounded-[1.5rem] border border-[#e6e0d3] bg-white p-3 shadow-panel">
                    {servicePages.map((service) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="block rounded-xl px-4 py-3 text-[#243128] transition hover:bg-[#f7f3ea]"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {navItems.slice(1).map((item) => (
                <Link key={item.href} href={item.href} className="transition hover:text-[#4c6247]">
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
            >
              Book Now
            </Link>
          </div>

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6e0d3] text-[#243128] lg:hidden"
          >
            <span className="relative h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current transition ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[7px] h-[2px] w-5 rounded-full bg-current transition ${menuOpen ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute left-0 top-[14px] h-[2px] w-5 rounded-full bg-current transition ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>

        {menuOpen ? (
          <div className="mt-4 border-t border-[#ece4d6] pt-4 lg:hidden">
            <nav className="flex flex-col gap-2 text-sm font-medium text-[#5f6c61]">
              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 transition hover:bg-[#f7f3ea] hover:text-[#4c6247]"
              >
                Home
              </Link>

              <button
                type="button"
                onClick={() => setServicesOpen((current) => !current)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-[#f7f3ea] hover:text-[#4c6247]"
              >
                <span>Services</span>
                <span>{servicesOpen ? "-" : "+"}</span>
              </button>

              {servicesOpen ? (
                <div className="ml-2 flex flex-col gap-1">
                  {servicePages.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      onClick={closeMenu}
                      className="rounded-xl px-3 py-3 transition hover:bg-[#f7f3ea] hover:text-[#4c6247]"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              ) : null}

              {navItems.slice(1).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 transition hover:bg-[#f7f3ea] hover:text-[#4c6247]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/booking"
              onClick={closeMenu}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-[#6f8a67] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
            >
              Book Now
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
