import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";

const pricingSections = [
  {
    title: "Standard House Cleaning",
    subtitle: "Regular maintenance cleaning",
    priceLabel: "$90 - $200",
    rows: [
      { size: "1 Bedroom / 1 Bath", price: "$90 - $110" },
      { size: "2 Bedroom / 1-2 Bath", price: "$110 - $130" },
      { size: "3 Bedroom / 2 Bath", price: "$130 - $160" },
      { size: "4 Bedroom / 2-3 Bath", price: "$160 - $200" }
    ],
    includes: ["Dusting", "Vacuuming", "Mopping floors", "Bathroom cleaning", "Kitchen cleaning", "Trash removal", "Wiping surfaces"]
  },
  {
    title: "Deep Cleaning",
    subtitle: "First time or very dirty homes",
    priceLabel: "$150 - $400",
    rows: [
      { size: "1 Bedroom", price: "$150 - $180" },
      { size: "2 Bedroom", price: "$180 - $220" },
      { size: "3 Bedroom", price: "$220 - $300" },
      { size: "4 Bedroom", price: "$300 - $400" }
    ],
    includes: ["Baseboards", "Inside appliances", "Window sills", "Heavy bathroom scrubbing", "Cabinet wipe-down"],
    includesLabel: "Includes everything in standard cleaning plus"
  },
  {
    title: "Move-In / Move-Out Cleaning",
    subtitle: "Empty-home transition cleaning",
    priceLabel: "$200 - $450",
    rows: [
      { size: "1-2 Bedroom", price: "$200 - $275" },
      { size: "3 Bedroom", price: "$275 - $350" },
      { size: "4 Bedroom", price: "$350 - $450" }
    ],
    includes: ["Inside cabinets", "Inside refrigerator", "Inside oven", "Closets", "Baseboards", "Deep bathroom cleaning"]
  }
];

const extraChargeAddons = ["Oven cleaning", "Fridge cleaning", "Interior windows", "Pet hair removal"];

export function PricingPage() {
  return (
    <main className="pb-24">
      <SiteHeader />

      <section className="shell py-12 lg:py-16">
        <div className="rounded-[2rem] bg-[#f2ece1] p-6 sm:p-10 lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Pricing</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[#243128] sm:text-5xl lg:text-6xl">
            Clear pricing based on your real service sheet
          </h1>
          <p className="mt-6 max-w-3xl text-sm leading-7 text-[#5f6c61] sm:text-lg sm:leading-8">
            These ranges reflect the pricing details you provided for standard house cleaning, deep cleaning, and move-in or
            move-out cleaning. Services with extra scope or add-ons are confirmed before the appointment.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
            >
              Book Now
            </Link>
            <Link
              href="/faqs"
              className="inline-flex items-center justify-center rounded-full border border-[#d7cfbf] bg-white px-8 py-4 text-sm font-semibold text-[#243128] transition hover:bg-[#f8f3ea]"
            >
              View FAQs
            </Link>
          </div>
        </div>
      </section>

      <section className="shell py-2 lg:py-6">
        <div className="space-y-8">
          {pricingSections.map((section, index) => (
            <ScrollReveal key={section.title} delay={index * 70}>
              <div className="rounded-[2rem] bg-white px-6 py-8 shadow-panel sm:px-10 sm:py-10">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">{section.subtitle}</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">{section.title}</h2>
                  </div>
                  <div className="rounded-full bg-[#f3eee4] px-5 py-3 text-sm font-semibold text-[#4c6247]">{section.priceLabel}</div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                  <div className="overflow-hidden rounded-[1.75rem] border border-[#ece4d6] bg-[#fbf8f2]">
                    <div className="grid grid-cols-[1.3fr_0.7fr] gap-4 border-b border-[#ece4d6] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#6f8a67]">
                      <span>Home size</span>
                      <span>Price</span>
                    </div>
                    {section.rows.map((row) => (
                      <div key={row.size} className="grid grid-cols-[1.3fr_0.7fr] gap-4 border-b border-[#ece4d6] px-6 py-4 text-base text-[#243128] last:border-b-0">
                        <span>{row.size}</span>
                        <span className="font-semibold">{row.price}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">
                      {section.includesLabel ?? "Includes"}
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      {section.includes.map((item) => (
                        <div key={item} className="rounded-[1.5rem] border border-[#ece4d6] bg-[#fbf8f2] p-5">
                          <div className="flex items-start gap-3">
                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#6f8a67]" />
                            <span className="text-sm leading-7 text-[#5f6c61] sm:text-base">{item}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="shell py-10 lg:py-14">
        <ScrollReveal delay={120}>
          <div className="rounded-[2rem] bg-white px-6 py-8 shadow-panel sm:px-10 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">Add-on services</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">Extra charges are confirmed with your quote</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#5f6c61]">
              Your pricing sheet identifies add-ons as extra-charge services, but it does not show fixed add-on amounts. We keep
              these as quote-based so the site only shows real confirmed information.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {extraChargeAddons.map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-[#ece4d6] bg-[#fbf8f2] px-5 py-5 text-center text-base font-semibold text-[#243128]">
                  {item}
                  <div className="mt-2 text-sm font-medium text-[#6f8a67]">Extra charge</div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
