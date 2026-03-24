import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";

export function ServicePage({ service }) {
  return (
    <main className="pb-24">
      <SiteHeader />

      <section className="shell py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="rounded-[2rem] bg-[#f2ece1] p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Services</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#243128] sm:text-6xl lg:leading-[1.04]">
              {service.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6c61]">{service.description}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#243128] shadow-sm">
                Price range: {service.priceLabel}
              </div>
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
              >
                Book Now
              </Link>
            </div>
          </div>

          <ScrollReveal className="overflow-hidden rounded-[2rem] shadow-panel" delay={120}>
            <img src={service.image} alt={service.alt} className="h-[520px] w-full object-cover" />
          </ScrollReveal>
        </div>
      </section>

      <section className="shell py-4 lg:py-8">
        <ScrollReveal className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]" delay={90}>
          <div className="rounded-[2rem] bg-white px-6 py-8 shadow-panel sm:px-10 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Pricing guide</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#243128] sm:text-5xl">
              Estimated pricing by home size
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f6c61]">{service.pricingNote}</p>
            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#ece4d6] bg-[#fbf8f2]">
              <div className="grid grid-cols-[1.3fr_0.7fr] gap-4 border-b border-[#ece4d6] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#6f8a67]">
                <span>Home size</span>
                <span>Price</span>
              </div>
              {service.pricingTiers.map((tier) => (
                <div key={tier.size} className="grid grid-cols-[1.3fr_0.7fr] gap-4 border-b border-[#ece4d6] px-6 py-4 text-base text-[#243128] last:border-b-0">
                  <span>{tier.size}</span>
                  <span className="font-semibold">{tier.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white px-6 py-8 shadow-panel sm:px-10 sm:py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">What&apos;s included</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#243128] sm:text-5xl">
              {service.includesHeading}
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {service.includes.map((item) => (
                <div key={item} className="rounded-[1.75rem] border border-[#ece4d6] bg-[#fbf8f2] p-6">
                  <div className="flex items-start gap-4">
                    <span className="mt-2 h-3 w-3 rounded-full bg-[#6f8a67]" />
                    <p className="text-base leading-8 text-[#5f6c61]">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
