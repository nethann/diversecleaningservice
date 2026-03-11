import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export function ServicePage({ service }) {
  return (
    <main className="pb-24">
      <SiteHeader />

      <section className="shell py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="rounded-[2rem] bg-[#f2ece1] p-8 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">Services</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-[#243128] sm:text-6xl lg:leading-[1.04]">
              {service.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f6c61]">{service.description}</p>
            <div className="mt-8">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-full bg-[#6f8a67] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#4c6247]"
              >
                Book Now
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] shadow-panel">
            <img src={service.image} alt={service.alt} className="h-[520px] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="shell py-4 lg:py-8">
        <div className="rounded-[2rem] bg-white px-8 py-10 shadow-panel sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#6f8a67]">What&apos;s included</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#243128] sm:text-5xl">
            What to expect from {service.shortName.toLowerCase()}
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
      </section>
    </main>
  );
}
