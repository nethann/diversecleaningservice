"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { addons, formatCurrency, initialBookings, services, team, timeSlots } from "@/components/product-data";

const today = "2026-03-11";
const initialDate = "2026-03-13";

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

export function BookingPage() {
  const [bookings, setBookings] = useState(initialBookings);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    service: services[0].slug,
    address: "",
    date: initialDate,
    time: "",
    details: "",
    recurring: "one-time",
    payment: "deposit",
    selectedAddons: []
  });
  const [error, setError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState(null);

  const selectedService = services.find((service) => service.slug === form.service) ?? services[0];
  const addonTotal = addons
    .filter((addon) => form.selectedAddons.includes(addon.slug))
    .reduce((sum, addon) => sum + addon.price, 0);
  const total = selectedService.price + addonTotal;

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

  useEffect(() => {
    if (!selectedSlot?.isAvailable) {
      setForm((current) => ({
        ...current,
        time: availableSlots[0]?.slot ?? ""
      }));
    }
  }, [availableSlots, selectedSlot]);

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

    if (!form.fullName || !form.email || !form.address || !form.date || !form.time) {
      setError("Please complete the required booking details before confirming.");
      return;
    }

    const availableTeams = getAvailableTeams(bookings, form.date, form.time);
    if (availableTeams.length === 0) {
      setError("That slot was just taken. Choose another available time.");
      return;
    }

    const assignedCleaner = availableTeams[0];
    const booking = {
      id: `WC-${2400 + bookings.length + 1}`,
      customer: form.fullName,
      service: selectedService.name,
      serviceSlug: selectedService.slug,
      date: form.date,
      time: form.time,
      cleaner: assignedCleaner.name,
      cleanerId: assignedCleaner.id,
      address: form.address,
      status: "confirmed",
      amount: total,
      paymentStatus: form.payment === "deposit" ? "Deposit paid" : "Paid in full"
    };

    setBookings((current) => [...current, booking]);
    setSubmittedBooking({
      ...booking,
      paymentDueNow: form.payment === "deposit" ? total * 0.3 : total,
      notes: form.details,
      recurring: form.recurring,
      addons: addons.filter((addon) => form.selectedAddons.includes(addon.slug)).map((addon) => addon.name)
    });
    setError("");
  }

  return (
    <main className="pb-20">
      <SiteHeader />

      <section className="shell py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-medium text-brand-700">
              Back to home
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Book a cleaning appointment</h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Pick a service, choose a live time slot, and confirm with a deposit or full payment. Availability updates
              automatically from active cleaner capacity.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
            24/7 online scheduling with automatic confirmations
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form onSubmit={handleSubmit} className="glass rounded-[2rem] p-8 shadow-panel">
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
                <span className="text-sm font-medium text-slate-700">Service date</span>
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
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-medium text-slate-900">{addon.name}</div>
                        <div className="text-sm text-slate-500">{addon.turnaround}</div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">+{formatCurrency(addon.price)}</div>
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

            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { value: "deposit", label: "Pay deposit now" },
                { value: "full", label: "Pay in full" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("payment", option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    form.payment === option.value
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl text-sm text-slate-500">
                Premier Cleaning Co. blocks overbooked slots automatically, assigns the first available cleaner, and queues the
                booking confirmation for email and SMS delivery.
              </div>
              <button
                disabled={!availableSlots.length}
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Confirm booking
              </button>
            </div>

            {error ? <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
            {submittedBooking ? (
              <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                Booking confirmed for {submittedBooking.date} at {submittedBooking.time}. {submittedBooking.cleaner} has
                been assigned and {formatCurrency(submittedBooking.paymentDueNow)} was scheduled for payment today.
              </div>
            ) : null}
          </form>

          <aside className="space-y-6">
            <div className="glass rounded-[2rem] p-6 shadow-panel">
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
                  <span>Add-ons</span>
                  <span className="font-medium text-slate-900">{form.selectedAddons.length}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Cleaner preview</span>
                  <span className="font-medium text-slate-900">{suggestedCleaner ? suggestedCleaner.name : "Awaiting slot"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>Payment now</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(form.payment === "deposit" ? total * 0.3 : total)}
                  </span>
                </div>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-5 text-white">
                <div className="text-sm text-slate-300">Estimated total</div>
                <div className="mt-2 text-3xl font-semibold">{formatCurrency(total)}</div>
              </div>
            </div>

            <div className="glass rounded-[2rem] p-6">
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

            <div className="glass rounded-[2rem] p-6">
              <h2 className="text-xl font-semibold text-slate-950">Automation preview</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-mist px-4 py-4">
                  Confirmation email after payment authorization
                </div>
                <div className="rounded-2xl bg-mist px-4 py-4">SMS reminder 24 hours before arrival window</div>
                <div className="rounded-2xl bg-mist px-4 py-4">Invoice and cleaner dispatch message on service day</div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
