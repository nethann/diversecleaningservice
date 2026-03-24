"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { addons, initialBookings, services, team, timeSlots } from "@/components/product-data";
import { servicePages } from "@/components/service-data";

const today = "2026-03-24";
const initialDate = "2026-03-26";

function getWeekday(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(`${date}T12:00:00`));
}

function getAvailableTeams(bookings, date, slot) {
  const weekday = getWeekday(date);

  return team.filter((member) => {
    const worksThisSlot = member.days.includes(weekday) && member.slots.includes(slot);
    if (!worksThisSlot) {
      return false;
    }

    return !bookings.some(
      (booking) =>
        booking.date === date && booking.time === slot && booking.cleanerId === member.id && booking.status !== "cancelled"
    );
  });
}

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
    default:
      return null;
  }
}

export function BookingPage() {
  const [bookings, setBookings] = useState(initialBookings);
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
    return service.slug === "recurring-cleaning-service";
  });

  const slotSummaries = timeSlots.map((slot) => {
    const availableTeams = getAvailableTeams(bookings, form.date, slot);
    return {
      slot,
      availableTeams,
      capacity: availableTeams.length,
      isAvailable: availableTeams.length > 0
    };
  });
  const availableSlots = slotSummaries.filter((slot) => slot.isAvailable);
  const selectedSlot = slotSummaries.find((slot) => slot.slot === form.time);
  const suggestedCleaner = selectedSlot?.availableTeams[0] ?? null;
  const estimatedRange = useMemo(
    () => getPricingMatch(form.service, form.homeSize, form.bathCount),
    [form.service, form.homeSize, form.bathCount]
  );

  useEffect(() => {
    if (!selectedSlot?.isAvailable) {
      setForm((current) => ({
        ...current,
        time: availableSlots[0]?.slot ?? ""
      }));
    }
  }, [availableSlots, selectedSlot]);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      homeSize: "",
      bathCount: current.service === "standard-cleaning" ? current.bathCount : ""
    }));
  }, [form.service]);

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

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.address || !form.date || !form.time || !form.service) {
      setError("Please complete the required booking details before submitting your request.");
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

    const availableTeams = getAvailableTeams(bookings, form.date, form.time);
    if (availableTeams.length === 0) {
      setError("That slot was just taken. Choose another available time.");
      return;
    }

    const assignedCleaner = availableTeams[0];
    const booking = {
      id: `DCS-${2400 + bookings.length + 1}`,
      customer: form.fullName,
      service: selectedService.name,
      serviceSlug: selectedService.slug,
      date: form.date,
      time: form.time,
      cleaner: assignedCleaner.name,
      cleanerId: assignedCleaner.id,
      address: form.address,
      status: "confirmed"
    };

    setBookings((current) => [...current, booking]);
    setSubmittedBooking({
      ...booking,
      pricing: estimatedRange ?? selectedService.priceLabel,
      notes: form.details,
      recurring: form.recurring,
      addons: addons.filter((addon) => form.selectedAddons.includes(addon.slug)).map((addon) => addon.name)
    });
    setError("");
  }

  const showBathCount = form.service === "standard-cleaning";
  const showSizePricing = ["standard-cleaning", "deep-cleaning", "move-in-move-out"].includes(form.service);

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
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="field-input mt-2 w-full"
                  placeholder="(555) 123-4567"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Service type</span>
                <select value={form.service} onChange={(event) => updateField("service", event.target.value)} className="field-input mt-2 w-full">
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
                  <select value={form.homeSize} onChange={(event) => updateField("homeSize", event.target.value)} className="field-input mt-2 w-full">
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
                  <select value={form.bathCount} onChange={(event) => updateField("bathCount", event.target.value)} className="field-input mt-2 w-full">
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
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Recurring frequency</span>
                <select value={form.recurring} onChange={(event) => updateField("recurring", event.target.value)} className="field-input mt-2 w-full">
                  <option value="one-time">One-time</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-slate-700">Available time slots</div>
                  <div className="mt-1 text-sm text-slate-500">{getWeekday(form.date)} coverage updates from staff schedules.</div>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {availableSlots.length} open slots
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {slotSummaries.map((slot) => {
                  const active = form.time === slot.slot;
                  return (
                    <button
                      key={slot.slot}
                      type="button"
                      onClick={() => slot.isAvailable && updateField("time", slot.slot)}
                      disabled={!slot.isAvailable}
                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                        !slot.isAvailable
                          ? "cursor-not-allowed border-rose-100 bg-rose-50 text-rose-500"
                          : active
                            ? "border-slate-950 bg-slate-950 text-white"
                            : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-medium">{slot.slot}</div>
                        <div className={`text-xs font-semibold uppercase tracking-[0.18em] ${active ? "text-white/70" : "text-slate-400"}`}>
                          {slot.isAvailable ? `${slot.capacity} teams open` : "Full"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <div className="text-sm font-medium text-slate-700">Add-ons</div>
              <div className="mt-2 text-sm text-slate-500">Your sheet shows these as extra charges, so final pricing is confirmed with your quote.</div>
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
              />
            </label>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl text-sm text-slate-500">
                Submit your booking request and we will confirm the exact quote for services with extra charges or special scope before the visit.
              </div>
              <button
                disabled={!availableSlots.length}
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Submit request
              </button>
            </div>

            {error ? <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
            {submittedBooking ? (
              <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                Booking request received for {submittedBooking.date} at {submittedBooking.time}. Estimated range: {submittedBooking.pricing}. We will confirm final scope and any extra-charge add-ons with you directly.
              </div>
            ) : null}
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
                  <span>Cleaner preview</span>
                  <span className="font-medium text-slate-900">{suggestedCleaner ? suggestedCleaner.name : "Awaiting slot"}</span>
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-5 text-white">
                <div className="text-sm text-slate-300">Price guide</div>
                <div className="mt-2 text-3xl font-semibold">{estimatedRange ?? selectedService.priceLabel}</div>
                <div className="mt-2 text-xs text-slate-400">Add-ons are listed as extra charges and are confirmed separately.</div>
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
              <h2 className="text-xl font-semibold text-slate-950">Availability on {form.date}</h2>
              <div className="mt-4 space-y-3">
                {slotSummaries.map((slot) => (
                  <div key={slot.slot} className="flex items-center justify-between rounded-2xl bg-mist px-4 py-3 text-sm">
                    <span className="font-medium text-slate-900">{slot.slot}</span>
                    <span className={slot.isAvailable ? "text-emerald-700" : "text-rose-700"}>
                      {slot.isAvailable ? `${slot.capacity} teams available` : "Fully booked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </ScrollReveal>
      </section>
    </main>
  );
}
