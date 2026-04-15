import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";

const pricingSections = [
  {
    title: "Standard House Cleaning",
    subtitle: "Regular maintenance cleaning",
    kicker: "Routine upkeep",
    priceLabel: "$90 - $200",
    rows: [
      { size: "1 Bedroom / 1 Bath", price: "$90 - $110" },
      { size: "2 Bedroom / 1-2 Bath", price: "$110 - $130" },
      { size: "3 Bedroom / 2 Bath", price: "$130 - $160" },
      { size: "4 Bedroom / 2-3 Bath", price: "$160 - $200" }
    ],
    includesLabel: "Includes",
    includes: [
      "Dusting",
      "Vacuuming",
      "Mopping floors",
      "Bathroom cleaning",
      "Kitchen cleaning",
      "Trash removal",
      "Wiping surfaces"
    ]
  },
  {
    title: "Deep Cleaning",
    subtitle: "First time or very dirty homes",
    kicker: "Extra detail",
    priceLabel: "$150 - $400",
    rows: [
      { size: "1 Bedroom", price: "$150 - $180" },
      { size: "2 Bedroom", price: "$180 - $220" },
      { size: "3 Bedroom", price: "$220 - $300" },
      { size: "4 Bedroom", price: "$300 - $400" }
    ],
    includesLabel: "Includes everything in standard cleaning plus",
    includes: ["Baseboards", "Inside appliances", "Window sills", "Heavy bathroom scrubbing", "Cabinet wipe-down"]
  },
  {
    title: "Move-In / Move-Out Cleaning",
    subtitle: "For empty-home transitions",
    kicker: "Fresh start",
    priceLabel: "$200 - $450",
    rows: [
      { size: "1-2 Bedroom", price: "$200 - $275" },
      { size: "3 Bedroom", price: "$275 - $350" },
      { size: "4 Bedroom", price: "$350 - $450" }
    ],
    includesLabel: "Includes",
    includes: ["Inside cabinets", "Inside refrigerator", "Inside oven", "Closets", "Baseboards", "Deep bathroom cleaning"]
  }
];

const addOnRows = [
  { service: "Inside Oven", price: "$25 - $40" },
  { service: "Inside Refrigerator", price: "$25 - $40" },
  { service: "Inside Cabinets", price: "$25 - $50" },
  { service: "Interior Windows", price: "$5 per window" },
  { service: "Laundry", price: "$20 - $30" },
  { service: "Pet Hair Removal", price: "$25 - $50" }
];

function PriceTable({ rows, firstColumn = "Home Size" }) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#e8e1d3] bg-[#fcfaf5]">
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 border-b border-[#e8e1d3] px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f8a67] sm:px-6">
        <span>{firstColumn}</span>
        <span>Price</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.size ?? row.service}
          className="grid grid-cols-[1.2fr_0.8fr] gap-4 border-b border-[#eee7d9] px-5 py-4 text-sm text-[#374038] last:border-b-0 sm:px-6 sm:text-base"
        >
          <span>{row.size ?? row.service}</span>
          <span className="font-semibold text-[#243128]">{row.price}</span>
        </div>
      ))}
    </div>
  );
}

function IncludesGrid({ items }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item} className="rounded-[1.25rem] border border-[#e8e1d3] bg-[#fcfaf5] px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#6f8a67]" />
            <span className="text-sm leading-7 text-[#374038] sm:text-[15px]">{item}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PricingPage() {
  return (
    <main className="pb-24">
      <SiteHeader />

      <section className="shell py-12 lg:py-16">
        <ScrollReveal>
          <div className="rounded-[2.5rem] bg-[#f2ece1] px-6 py-8 shadow-panel sm:px-10 sm:py-10 lg:px-14 lg:py-14">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Pricing</p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#243128] sm:text-5xl lg:text-6xl">
                Residential pricing and commercial estimates in one place.
              </h1>
              <p className="mt-6 max-w-3xl text-sm leading-7 text-[#5f6c61] sm:text-lg sm:leading-8">
                If you are booking for your home, you can review our residential pricing below. If you need cleaning for a business,
                office, or commercial property, we will schedule a technician to visit and provide an estimate.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
              >
                Book Now
              </Link>
              <a
                href="tel:+14702939475"
                className="inline-flex items-center justify-center rounded-full border border-[#d5ccba] bg-white px-8 py-4 text-sm font-semibold text-[#243128] transition hover:bg-[#f8f3ea]"
                >
                  Call to book (470) 293-9475
                </a>
              </div>
            </div>
        </ScrollReveal>
      </section>

      <section className="shell py-2 lg:py-4">
        <div className="mx-auto max-w-6xl space-y-8">
          <ScrollReveal delay={40}>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="flex h-full flex-col rounded-[2rem] border border-[#e4ddce] bg-white px-6 py-8 shadow-panel sm:px-8 sm:py-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">Option 1</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">Residential Cleaning</h2>
                <p className="mt-4 text-sm leading-7 text-[#5f6c61] sm:text-base sm:leading-8">
                  Review our current residential pricing for standard house cleaning, deep cleaning, move-in or move-out service,
                  and optional add-ons.
                </p>
                <div className="mt-auto pt-6">
                  <div className="inline-flex rounded-full bg-[#f3eee4] px-4 py-2 text-sm font-semibold text-[#4c6247]">
                    Published residential rates below
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-[2rem] border border-[#d9d0bf] bg-[#faf6ed] px-6 py-8 shadow-panel sm:px-8 sm:py-8">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">Option 2</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">Commercial Cleaning</h2>
                <p className="mt-4 text-sm leading-7 text-[#5f6c61] sm:text-base sm:leading-8">
                  For businesses and commercial spaces, a technician will come out, walk the property with you, and provide a
                  custom estimate based on the scope of work.
                </p>
                <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:flex-wrap">
                  <a
                    href="tel:+14702939475"
                    className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
                  >
                    Call for a commercial estimate
                  </a>
                  <Link
                    href="/booking"
                    className="inline-flex items-center justify-center rounded-full border border-[#d5ccba] bg-white px-6 py-3 text-sm font-semibold text-[#243128] transition hover:bg-[#f8f3ea]"
                  >
                    Request service
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={55}>
            <div id="residential-pricing" className="rounded-[2rem] border border-[#e4ddce] bg-[#fffdf8] px-6 py-6 shadow-panel sm:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">Residential pricing</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#243128] sm:text-3xl">Home cleaning price guide</h2>
                </div>
                <div className="inline-flex w-fit rounded-full bg-[#f3eee4] px-4 py-2 text-sm font-semibold text-[#4c6247]">
                  Residential only
                </div>
              </div>
            </div>
          </ScrollReveal>

          {pricingSections.map((section, index) => (
            <ScrollReveal key={section.title} delay={index * 80 + 60}>
              <div className="rounded-[2rem] border border-[#e4ddce] bg-white px-6 py-8 shadow-panel sm:px-10 sm:py-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">{section.kicker}</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">{section.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-[#5f6c61] sm:text-base">{section.subtitle}</p>
                  </div>
                  <div className="inline-flex w-fit rounded-full bg-[#f3eee4] px-5 py-3 text-sm font-semibold text-[#4c6247]">
                    {section.priceLabel}
                  </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                  <PriceTable rows={section.rows} />

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6f8a67]">{section.includesLabel}</p>
                    <div className="mt-4">
                      <IncludesGrid items={section.includes} />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal delay={220}>
            <div className="rounded-[2rem] border border-[#e4ddce] bg-white px-6 py-8 shadow-panel sm:px-10 sm:py-10">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">Add-ons</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">Optional extras for a more customized clean.</h2>
                <p className="mt-4 text-sm leading-7 text-[#5f6c61] sm:text-base sm:leading-8">
                  Add these services to your appointment when you want extra attention in specific areas of the home.
                </p>
              </div>

              <div className="mt-8">
                <PriceTable rows={addOnRows} firstColumn="Service" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={280}>
            <div className="rounded-[2rem] border border-[#e4ddce] bg-[#faf6ed] px-6 py-8 shadow-panel sm:px-10 sm:py-10">
              <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6f8a67]">Before you book</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#243128] sm:text-4xl">
                    Need help choosing the right service?
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[#5f6c61] sm:text-base sm:leading-8">
                    If you are not sure whether your home needs standard cleaning, deep cleaning, or a move-in or move-out service,
                    we can help you choose the best fit before you book.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <a
                    href="tel:+14702939475"
                    className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
                  >
                    Call (470) 293-9475
                  </a>
                  <Link
                    href="/booking"
                    className="inline-flex items-center justify-center rounded-full border border-[#d5ccba] bg-white px-8 py-4 text-sm font-semibold text-[#243128] transition hover:bg-[#f8f3ea]"
                  >
                    Start Booking
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
