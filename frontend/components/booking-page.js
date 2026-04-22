"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { addons, services } from "@/components/product-data";
import { servicePages } from "@/components/service-data";

function toDateInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const today = toDateInputValue(new Date());
const initialDate = toDateInputValue(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));

function AddonIcon({ slug }) {
  const commonProps = {
    className: "h-5 w-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7"
  };

  switch (slug) {
    case "oven-cleaning":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M7 9h10" />
          <path d="M8 13h8v4H8z" />
        </svg>
      );
    case "fridge-cleaning":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="7" y="3.5" width="10" height="17" rx="2" />
          <path d="M7 11.5h10" />
          <path d="M15 7v2" />
          <path d="M15 14v2" />
        </svg>
      );
    case "interior-windows":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M12 4v16" />
          <path d="M4 12h16" />
        </svg>
      );
    case "pet-hair-removal":
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M12 19c3.2 0 5.5-1.7 5.5-4 0-1.7-1.2-2.8-3-3.3-.8-.2-1.6-.2-2.5-.2s-1.7 0-2.5.2c-1.8.5-3 1.6-3 3.3 0 2.3 2.3 4 5.5 4z" />
          <path d="M8 9.5c.9 0 1.5-.9 1.5-2s-.6-2-1.5-2-1.5.9-1.5 2 .6 2 1.5 2z" />
          <path d="M16 9.5c.9 0 1.5-.9 1.5-2s-.6-2-1.5-2-1.5.9-1.5 2 .6 2 1.5 2z" />
        </svg>
      );
    default:
      return null;
  }
}

function getPricingMatch(serviceSlug, homeSize, bathCount) {
  switch (serviceSlug) {
    case "standard-cleaning":
      if (homeSize === "1-bedroom" && bathCount === "1-bath") return "$90 - $110";
      if (homeSize === "2-bedroom" && ["1-bath", "2-bath"].includes(bathCount)) return "$110 - $130";
      if (homeSize === "3-bedroom" && bathCount === "2-bath") return "$130 - $160";
      if (homeSize === "4-bedroom" && ["2-bath", "3-bath"].includes(bathCount)) return "$160 - $200";
      return null;
    case "deep-cleaning":
      if (homeSize === "1-bedroom") return "$150 - $180";
      if (homeSize === "2-bedroom") return "$180 - $220";
      if (homeSize === "3-bedroom") return "$220 - $300";
      if (homeSize === "4-bedroom") return "$300 - $400";
      return null;
    case "move-in-move-out":
      if (["1-bedroom", "2-bedroom"].includes(homeSize)) return "$200 - $275";
      if (homeSize === "3-bedroom") return "$275 - $350";
      if (homeSize === "4-bedroom") return "$350 - $450";
      return null;
    case "commercial-cleaning":
      return "On-site estimate";
    default:
      return null;
  }
}

export function BookingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: services[0].slug,
    homeSize: "",
    bathCount: "",
    address: "",
    date: initialDate,
    time: "",
    details: "",
    recurring: "one-time",
    selectedAddons: []
  });
  const [error, setError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const selectedService = services.find((service) => service.slug === form.service) ?? services[0];
  const selectedServicePage = servicePages.find((service) => {
    if (form.service === "standard-cleaning") return service.slug === "house-cleaning";
    if (form.service === "deep-cleaning") return service.slug === "deep-cleaning-service";
    if (form.service === "move-in-move-out") return service.slug === "move-in-move-out-cleaning";
    return service.slug === "commercial-cleaning-service";
  });

  const estimatedRange = useMemo(
    () => getPricingMatch(form.service, form.homeSize, form.bathCount),
    [form.service, form.homeSize, form.bathCount]
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      homeSize: "",
      bathCount: current.service === "standard-cleaning" ? current.bathCount : ""
    }));
  }, [form.service]);

  function formatPhoneInput(raw) {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)})-${digits.slice(3)}`;
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function updateField(field, value) {
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleAddon(slug) {
    setError("");
    setForm((current) => {
      const exists = current.selectedAddons.includes(slug);
      return {
        ...current,
        selectedAddons: exists
          ? current.selectedAddons.filter((item) => item !== slug)
          : [...current.selectedAddons, slug]
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.address || !form.date || !form.time || !form.service || !form.recurring || !form.details.trim()) {
      setError("Please complete the required booking details before submitting your request.");
      return;
    }

    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (["standard-cleaning", "deep-cleaning", "move-in-move-out"].includes(form.service) && !form.homeSize) {
      setError("Please choose your home size so we can match your request to the price guide.");
      return;
    }

    if (form.service === "standard-cleaning" && !form.bathCount) {
      setError("Please choose the bath count for standard cleaning pricing.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't submit your booking right now.");
      }

      setSubmittedBooking({
        ...data.booking,
        pricing: estimatedRange ?? selectedService.priceLabel,
        notes: form.details,
        recurring: form.recurring,
        addons: addons.filter((addon) => form.selectedAddons.includes(addon.slug)).map((addon) => addon.name)
      });
      setError("");
    } catch (submitError) {
      setError(submitError.message || "We couldn't submit your booking right now.");
    } finally {
      setSubmitting(false);
    }
  }

  const showBathCount = form.service === "standard-cleaning";
  const showSizePricing = ["standard-cleaning", "deep-cleaning", "move-in-move-out"].includes(form.service);
  const isCommercialService = form.service === "commercial-cleaning";

  return (
    <main className="pb-20">
      <SiteHeader />

      <section className="shell py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-brand-700">
              Back to home
            </Link>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Book a cleaning appointment</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Submit your service request online and use the price guide below for standard, deep, and move-in or move-out cleaning.
              If your service needs extra attention or special add-ons, we will confirm the final quote before service.
              Commercial cleaning requests are scheduled after a technician walk-through.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            Price ranges follow the current service sheet
          </div>
        </div>

        <ScrollReveal className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" delay={90}>
          <form onSubmit={handleSubmit} className="glass rounded-[2rem] p-6 shadow-panel sm:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="field-input mt-2 w-full"
                  placeholder="Jane Johnson"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="field-input mt-2 w-full"
                  placeholder="jane@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", formatPhoneInput(event.target.value))}
                  className="field-input mt-2 w-full"
                  placeholder="(555)-123-4567"
                  maxLength={14}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Service type</span>
                <select value={form.service} onChange={(event) => updateField("service", event.target.value)} className="field-input mt-2 w-full" required>
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>

              {showSizePricing ? (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Home size</span>
                  <select value={form.homeSize} onChange={(event) => updateField("homeSize", event.target.value)} className="field-input mt-2 w-full" required>
                    <option value="">Select size</option>
                    <option value="1-bedroom">1 Bedroom</option>
                    <option value="2-bedroom">2 Bedroom</option>
                    <option value="3-bedroom">3 Bedroom</option>
                    <option value="4-bedroom">4 Bedroom</option>
                  </select>
                </label>
              ) : null}

              {showBathCount ? (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Bath count</span>
                  <select value={form.bathCount} onChange={(event) => updateField("bathCount", event.target.value)} className="field-input mt-2 w-full" required>
                    <option value="">Select baths</option>
                    <option value="1-bath">1 Bath</option>
                    <option value="2-bath">2 Bath</option>
                    <option value="3-bath">3 Bath</option>
                  </select>
                </label>
              ) : null}

              <label className="block md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <input
                  type="text"
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  className="field-input mt-2 w-full"
                  placeholder="123 Main Street, Apt 4B"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Preferred date</span>
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="field-input mt-2 w-full"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Recurring frequency</span>
                <select value={form.recurring} onChange={(event) => updateField("recurring", event.target.value)} className="field-input mt-2 w-full" required>
                  <option value="one-time">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>

            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white/70 p-5">
              <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Preferred time</span>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) => updateField("time", event.target.value)}
                    className="field-input mt-2 w-full"
                    required
                  />
                </label>
                <div className="rounded-3xl bg-mist px-5 py-4 text-sm leading-6 text-slate-600">
                  Choose the time that works best for you. We will review the request, confirm the schedule, and assign the right team from the admin dispatch board.
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-sm font-medium text-slate-700">Add-ons</div>
              <div className="mt-2 text-sm text-slate-500">Add-ons follow the same published prices shown on the pricing page.</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {addons.map((addon) => {
                  const active = form.selectedAddons.includes(addon.slug);
                  return (
                    <button
                      key={addon.slug}
                      type="button"
                      onClick={() => toggleAddon(addon.slug)}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-brand-300 bg-brand-50"
                          : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                          <AddonIcon slug={addon.slug} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900">{addon.name}</div>
                          <div className="mt-2 text-sm text-slate-600">{addon.priceLabel}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-8 block">
              <span className="text-sm font-medium text-slate-700">Cleaning details / notes</span>
              <textarea
                rows={5}
                value={form.details}
                onChange={(event) => updateField("details", event.target.value)}
                className="field-input mt-2 w-full rounded-[1.5rem]"
                placeholder="Entry instructions, parking notes, pets, or focus areas"
                required
              />
            </label>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl text-sm text-slate-500">
                Submit your booking request and we will confirm any add-ons or service details before the visit. Commercial cleaning
                requests are finalized after a technician visit.
              </div>
              <button
                disabled={submitting}
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </div>

            {error ? <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
          </form>

          <aside className="space-y-6">
            <div className="glass rounded-[2rem] p-5 shadow-panel sm:p-6">
              <h2 className="text-xl font-semibold text-slate-950">Booking summary</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <span>Service</span>
                  <span className="font-medium text-slate-900">{selectedService.name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Estimated duration</span>
                  <span className="font-medium text-slate-900">{selectedService.duration}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Home size</span>
                  <span className="font-medium text-slate-900">{form.homeSize ? form.homeSize.replace("-", " ") : "Choose size"}</span>
                </div>
                {showBathCount ? (
                  <div className="flex items-center justify-between gap-4">
                    <span>Bath count</span>
                    <span className="font-medium text-slate-900">{form.bathCount ? form.bathCount.replace("-", " ") : "Choose baths"}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                  <span>Add-ons</span>
                  <span className="font-medium text-slate-900">{form.selectedAddons.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Dispatch</span>
                  <span className="font-medium text-slate-900">Assigned after review</span>
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-5 text-white">
                <div className="text-sm text-slate-300">Price guide</div>
                <div className="mt-2 text-3xl font-semibold">{estimatedRange ?? selectedService.priceLabel}</div>
                <div className="mt-2 text-xs text-slate-400">
                  {isCommercialService
                    ? "Commercial pricing is provided after a technician walk-through."
                    : "Add-ons use the same published amounts shown on the pricing page."}
                </div>
              </div>
            </div>

            {selectedServicePage ? (
              <div className="glass rounded-[2rem] p-5 shadow-panel sm:p-6">
                <h2 className="text-xl font-semibold text-slate-950">Included with this service</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {selectedServicePage.includes.map((item) => (
                    <div key={item} className="rounded-2xl bg-mist px-4 py-4">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="glass rounded-[2rem] p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-950">What happens next</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-mist px-4 py-4">We receive your preferred date and time.</div>
                <div className="rounded-2xl bg-mist px-4 py-4">A head admin reviews the request and assigns the right team.</div>
                <div className="rounded-2xl bg-mist px-4 py-4">You will receive confirmation if anything needs to be adjusted.</div>
              </div>
            </div>
          </aside>
        </ScrollReveal>
      </section>

      {submittedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="relative w-full max-w-lg rounded-[2rem] border border-[#e6e0d3] bg-white p-7 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-9">
            <button
              type="button"
              onClick={() => setSubmittedBooking(null)}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-xl leading-none text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Close booking confirmation"
            >
              ×
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">Booking received</div>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">You are all set, {submittedBooking.customer.split(" ")[0]}!</h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                We received your cleaning request and will confirm the final details with you shortly.
              </p>
            </div>

            <div className="mt-6 space-y-3 rounded-[1.5rem] bg-mist px-5 py-5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Booking ID</span>
                <span className="font-mono font-semibold text-slate-900">{submittedBooking.id}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Service</span>
                <span className="font-medium text-slate-900">{submittedBooking.service}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Date</span>
                <span className="font-medium text-slate-900">
                  {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${submittedBooking.date}T12:00:00`))}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Time</span>
                <span className="font-medium text-slate-900">{submittedBooking.time}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Estimated price</span>
                <span className="font-semibold text-slate-900">{submittedBooking.pricing}</span>
              </div>
              {submittedBooking.cleaner ? (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Your cleaner</span>
                  <span className="font-medium text-slate-900">{submittedBooking.cleaner}</span>
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-center text-xs text-slate-400">
              A confirmation will be sent to {submittedBooking.email}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setSubmittedBooking(null);
                  setForm({
                    fullName: "", email: "", phone: "", service: services[0].slug,
                    homeSize: "", bathCount: "", address: "", date: initialDate,
                    time: "", details: "", recurring: "one-time", selectedAddons: []
                  });
                }}
                className="flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Book another
              </button>
              <Link
                href="/"
                className="flex-1 rounded-full bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
