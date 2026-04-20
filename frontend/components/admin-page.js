"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { team } from "@/components/product-data";

const statusTone = {
  confirmed: "bg-emerald-50 text-emerald-700",
  assigned: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-rose-50 text-rose-700",
  pending: "bg-brand-50 text-brand-700"
};

function formatDateLabel(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));
}

export function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusSavingId, setStatusSavingId] = useState("");
  const [initMessage, setInitMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings(showLoading = true) {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (!response.ok) {
          return;
        }

        if (active) {
          setBookings(data.bookings ?? []);
        }
      } catch {
        // Keep the dashboard resilient even if live bookings cannot be loaded.
      } finally {
        if (active && showLoading) {
          setLoading(false);
        }
      }
    }

    loadBookings();

    return () => {
      active = false;
    };
  }, []);

  const dashboardStats = useMemo(() => {
    const activeBookings = bookings.filter((booking) => booking.status !== "cancelled");
    const completedBookings = bookings.filter((booking) => booking.status === "completed");
    const commercialRequests = bookings.filter((booking) => booking.serviceSlug === "commercial-cleaning");
    const unassignedBookings = bookings.filter((booking) => ["confirmed", "pending"].includes(booking.status));

    return [
      {
        label: "Live bookings",
        value: String(bookings.length),
        detail: bookings.length ? "Requests currently saved in Railway." : "No bookings saved yet."
      },
      {
        label: "Active schedule",
        value: String(activeBookings.length),
        detail: activeBookings.length ? "Confirmed, assigned, or in-progress visits." : "No active visits yet."
      },
      {
        label: "Unassigned",
        value: String(unassignedBookings.length),
        detail: unassignedBookings.length ? "Bookings still waiting on dispatch actions." : "Nothing waiting right now."
      },
      {
        label: "Commercial requests",
        value: String(commercialRequests.length),
        detail: commercialRequests.length ? "Estimate-based commercial requests on file." : "No commercial requests yet."
      },
      {
        label: "Completed",
        value: String(completedBookings.length),
        detail: completedBookings.length ? "Jobs marked complete in the live workflow." : "No completed visits yet."
      }
    ];
  }, [bookings]);

  const recentBookings = useMemo(() => bookings.slice(-5).reverse(), [bookings]);

  async function handleInitDatabase() {
    setInitMessage("Initializing database...");

    try {
      const response = await fetch("/api/admin/init-db", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't initialize the database.");
      }

      setInitMessage("Database is ready.");
      const refresh = await fetch("/api/bookings");
      const refreshData = await refresh.json();
      setBookings(refreshData.bookings ?? []);
    } catch (error) {
      setInitMessage(error.message || "We couldn't initialize the database.");
    }
  }

  async function handleStatusUpdate(id, status) {
    setStatusSavingId(id);

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't update the booking status.");
      }

      setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status: data.booking.status } : booking)));
    } catch {
      // Keep the board stable if a status update fails.
    } finally {
      setStatusSavingId("");
    }
  }

  return (
    <main className="pb-20">
      <SiteHeader />

      <section className="shell py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/booking" className="text-sm font-medium text-brand-700">
              Open booking flow
            </Link>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Admin scheduling and operations</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Review real booking requests, update statuses, and keep the live schedule honest as residential and commercial
              inquiries come in.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-950 px-5 py-4 text-white shadow-panel">
            <div className="text-sm text-slate-300">Database status</div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "..." : bookings.length}</div>
            <div className="mt-1 text-sm text-slate-400">
              {bookings.length ? "Live booking records currently loaded." : "Ready to receive the first live booking."}
            </div>
            <button
              type="button"
              onClick={handleInitDatabase}
              className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Initialize database
            </button>
            {initMessage ? <div className="mt-2 text-xs text-slate-300">{initMessage}</div> : null}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {dashboardStats.map((item) => (
            <div key={item.label} className="glass rounded-[2rem] p-6 shadow-panel">
              <div className="text-sm uppercase tracking-[0.18em] text-slate-500">{item.label}</div>
              <div className="mt-4 text-4xl font-semibold text-slate-950">{item.value}</div>
              <div className="mt-2 text-sm text-slate-500">{item.detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-8">
            <section className="glass rounded-[2rem] p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-slate-950">Upcoming bookings</h2>
                <div className="flex items-center gap-3">
                  {loading ? <span className="text-sm text-slate-500">Loading live bookings...</span> : null}
                  <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                    Live dispatch board
                  </span>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Service</th>
                      <th className="pb-3 font-medium">When</th>
                      <th className="pb-3 font-medium">Cleaner</th>
                      <th className="pb-3 font-medium">Pricing</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-slate-200 text-slate-700">
                        <td className="py-4">
                          <div className="font-medium text-slate-900">{booking.customer}</div>
                          <div className="text-xs text-slate-500">{booking.address}</div>
                        </td>
                        <td className="py-4">{booking.service}</td>
                        <td className="py-4">
                          {formatDateLabel(booking.date)} / {booking.time}
                        </td>
                        <td className="py-4">{booking.cleaner || "Awaiting team"}</td>
                        <td className="py-4">{booking.serviceSlug === "commercial-cleaning" ? "On-site estimate" : "Range on pricing page"}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[booking.status] ?? "bg-slate-100 text-slate-700"}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-2">
                            {booking.status !== "assigned" ? (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(booking.id, "assigned")}
                                disabled={statusSavingId === booking.id}
                                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                              >
                                Assign
                              </button>
                            ) : null}
                            {booking.status !== "completed" ? (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(booking.id, "completed")}
                                disabled={statusSavingId === booking.id}
                                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                              >
                                Complete
                              </button>
                            ) : null}
                            {booking.status !== "cancelled" ? (
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                disabled={statusSavingId === booking.id}
                                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!bookings.length ? (
                      <tr className="border-t border-slate-200 text-slate-500">
                        <td colSpan="7" className="py-6 text-center">
                          No bookings yet. New requests from the booking page will appear here.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="glass rounded-[2rem] p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-slate-950">Recent booking activity</h2>
                <span className="text-sm text-slate-500">{recentBookings.length} most recent</span>
              </div>
              <div className="mt-6 space-y-4">
                {recentBookings.length ? (
                  recentBookings.map((booking) => (
                    <div key={`activity-${booking.id}`} className="rounded-3xl bg-mist p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-950">{booking.customer}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {booking.service} on {formatDateLabel(booking.date)} at {booking.time}
                          </div>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[booking.status] ?? "bg-slate-100 text-slate-700"}`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.selectedAddons?.length ? (
                        <div className="mt-3 text-sm text-slate-600">
                          Add-ons: {booking.selectedAddons.map((addon) => addon.name).join(", ")}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl bg-mist p-6 text-sm text-slate-600">
                    Once someone books through the site, their request will show up here with service details and status changes.
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass rounded-[2rem] p-8">
              <h2 className="text-2xl font-semibold text-slate-950">Team coverage</h2>
              <div className="mt-6 space-y-4">
                {team.map((member) => (
                  <div key={member.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-slate-950">{member.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{member.zone}</div>
                      </div>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                        {member.days.length} days available
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-slate-600">
                      <div>Coverage days: {member.days.join(", ")}</div>
                      <div className="mt-2">Time slots: {member.slots.join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-[2rem] p-8">
              <h2 className="text-2xl font-semibold text-slate-950">Dispatch notes</h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-3xl bg-mist p-5">
                  The bookings table above is live. If `/api/bookings` returns an empty array, this dashboard should also stay empty.
                </div>
                <div className="rounded-3xl bg-mist p-5">
                  Residential pricing follows the published ranges on the pricing page. Commercial jobs stay estimate-based until a technician walk-through is complete.
                </div>
                <div className="rounded-3xl bg-mist p-5">
                  If you cancel a booking, that team slot becomes available again in the booking flow.
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
