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
  pending: "bg-brand-50 text-brand-700",
  in_progress: "bg-sky-50 text-sky-700"
};

function formatDateLabel(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateString}T12:00:00`));
}

function formatListLabel(value) {
  if (!value) {
    return "Not provided";
  }

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DetailTableRow({ label, value }) {
  return (
    <tr className="border-t border-[#ebe4d7] first:border-t-0">
      <th className="w-[34%] px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:px-5">
        {label}
      </th>
      <td className="px-4 py-4 text-sm leading-7 text-slate-800 sm:px-5">{value || "Not provided"}</td>
    </tr>
  );
}

export function AdminPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusSavingId, setStatusSavingId] = useState("");
  const [initMessage, setInitMessage] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState("");
  const [assignmentSelection, setAssignmentSelection] = useState({});

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
          const nextBookings = data.bookings ?? [];
          setBookings(nextBookings);
          setAssignmentSelection(
            Object.fromEntries(
              nextBookings.map((booking) => [
                booking.id,
                (booking.assignedCleaners?.length ? booking.assignedCleaners : booking.cleanerId && booking.cleaner
                  ? [{ id: booking.cleanerId, name: booking.cleaner }]
                  : []
                ).map((member) => member.id)
              ])
            )
          );
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

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        const left = new Date(`${a.date} ${a.time}`);
        const right = new Date(`${b.date} ${b.time}`);
        return left - right;
      }),
    [bookings]
  );

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
      const nextBookings = refreshData.bookings ?? [];
      setBookings(nextBookings);
      setAssignmentSelection(
        Object.fromEntries(
          nextBookings.map((booking) => [
            booking.id,
            (booking.assignedCleaners?.length ? booking.assignedCleaners : booking.cleanerId && booking.cleaner
              ? [{ id: booking.cleanerId, name: booking.cleaner }]
              : []
            ).map((member) => member.id)
          ])
        )
      );
    } catch (error) {
      setInitMessage(error.message || "We couldn't initialize the database.");
    }
  }

  function handleAssignmentToggle(bookingId, memberId) {
    setAssignmentSelection((current) => {
      const selected = current[bookingId] ?? [];
      const exists = selected.includes(memberId);

      if (exists) {
        return {
          ...current,
          [bookingId]: selected.filter((id) => id !== memberId)
        };
      }

      if (selected.length >= 3) {
        return current;
      }

      return {
        ...current,
        [bookingId]: [...selected, memberId]
      };
    });
  }

  async function handleStatusUpdate(id, status) {
    setStatusSavingId(id);

    const selectedIds = assignmentSelection[id] ?? [];
    const assignedCleaners = selectedIds
      .map((memberId) => team.find((member) => member.id === memberId))
      .filter(Boolean)
      .map((member) => ({
        id: member.id,
        name: member.name
      }));

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, assignedCleaners })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't update the booking status.");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? {
                ...booking,
                status: data.booking.status,
                cleaner: data.booking.cleaner,
                cleanerId: data.booking.cleanerId,
                assignedCleaners: data.booking.assignedCleaners
              }
            : booking
        )
      );
      setAssignmentSelection((current) => ({
        ...current,
        [id]: (data.booking.assignedCleaners ?? []).map((member) => member.id)
      }));
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
              Review each booking request, open the full details for that entry, and assign up to three team members to the
              job when you are ready.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-950 px-5 py-4 text-white shadow-panel">
            <div className="text-sm text-slate-300">Database status</div>
            <div className="mt-2 text-3xl font-semibold">{loading ? "..." : sortedBookings.length}</div>
            <div className="mt-1 text-sm text-slate-400">
              {sortedBookings.length ? "Live booking requests currently loaded." : "Ready to receive the first live booking."}
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

        <div className="space-y-8">
          <section className="glass rounded-[2rem] p-8 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-slate-950">Upcoming bookings</h2>
                <div className="flex items-center gap-3">
                  {loading ? <span className="text-sm text-slate-500">Loading live bookings...</span> : null}
                  <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                    Live dispatch board
                  </span>
                </div>
              </div>
              <div className="mt-7 space-y-5">
                {sortedBookings.length ? (
                  sortedBookings.map((booking) => {
                    const isExpanded = expandedBookingId === booking.id;
                    const selectedIds = assignmentSelection[booking.id] ?? [];
                    const selectedNames = selectedIds
                      .map((memberId) => team.find((member) => member.id === memberId)?.name)
                      .filter(Boolean);

                    return (
                      <div key={booking.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(44,56,45,0.05)] sm:p-7">
                        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.85fr_1fr_auto_auto] xl:items-center">
                          <div className="pr-2">
                            <div className="font-medium text-slate-950">{booking.customer}</div>
                            <div className="mt-2 text-sm leading-7 text-slate-500">{booking.service}</div>
                          </div>
                          <div className="text-sm leading-7 text-slate-700">
                            <div>{formatDateLabel(booking.date)}</div>
                            <div className="mt-1 text-slate-500">{booking.time}</div>
                          </div>
                          <div className="text-sm leading-7 text-slate-700">
                            <div className="font-medium text-slate-900">
                              {selectedNames.length ? selectedNames.join(", ") : "Not assigned yet"}
                            </div>
                            <div className="mt-1 text-slate-500">
                              {selectedNames.length ? `${selectedNames.length} team member${selectedNames.length > 1 ? "s" : ""}` : "Open booking"}
                            </div>
                          </div>
                          <div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[booking.status] ?? "bg-slate-100 text-slate-700"}`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex justify-start lg:justify-end">
                            <button
                              type="button"
                              onClick={() => setExpandedBookingId(isExpanded ? "" : booking.id)}
                              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              {isExpanded ? "Hide details" : "View details"}
                            </button>
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="mt-7 space-y-7 border-t border-slate-200 pt-7">
                            <div className="overflow-hidden rounded-[1.75rem] border border-[#e7dcc8] bg-white shadow-[0_16px_40px_rgba(44,56,45,0.06)]">
                              <div className="border-b border-[#ebe4d7] bg-[linear-gradient(180deg,#f7f1e4_0%,#fdfbf5_100%)] px-4 py-4 sm:px-5">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Booking details</div>
                                <div className="mt-1 text-sm text-slate-600">
                                  Submitted booking information for {booking.customer}
                                </div>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] border-collapse">
                                  <tbody>
                                    <DetailTableRow label="Full name" value={booking.customer} />
                                    <DetailTableRow label="Email" value={booking.email} />
                                    <DetailTableRow label="Phone" value={booking.phone} />
                                    <DetailTableRow label="Service type" value={booking.service} />
                                    <DetailTableRow label="Home size" value={formatListLabel(booking.homeSize)} />
                                    <DetailTableRow label="Bath count" value={formatListLabel(booking.bathCount)} />
                                    <DetailTableRow label="Address" value={booking.address} />
                                    <DetailTableRow label="Preferred date" value={formatDateLabel(booking.date)} />
                                    <DetailTableRow label="Recurring frequency" value={formatListLabel(booking.recurring)} />
                                    <DetailTableRow label="Time slot" value={booking.time} />
                                    <DetailTableRow
                                      label="Add-ons"
                                      value={booking.selectedAddons?.length ? booking.selectedAddons.map((addon) => addon.name).join(", ") : "None selected"}
                                    />
                                    <DetailTableRow label="Notes" value={booking.details || "No special notes added."} />
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="rounded-3xl bg-mist p-5 sm:p-6">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <div className="font-medium text-slate-950">Assign responsible team members</div>
                                  <div className="mt-1 text-sm text-slate-500">
                                    Choose up to three people for this booking. The first selected person becomes the primary assigned cleaner.
                                  </div>
                                </div>
                                <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                  {selectedIds.length} / 3 selected
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {team.map((member) => {
                                  const active = selectedIds.includes(member.id);
                                  const disabled = !active && selectedIds.length >= 3;

                                  return (
                                    <button
                                      key={member.id}
                                      type="button"
                                      onClick={() => handleAssignmentToggle(booking.id, member.id)}
                                      disabled={disabled}
                                      className={`rounded-3xl border px-4 py-4 text-left transition ${
                                        active
                                          ? "border-brand-300 bg-brand-50"
                                          : "border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                      }`}
                                    >
                                      <div className="font-medium text-slate-900">{member.name}</div>
                                      <div className="mt-1 text-sm text-slate-500">{member.zone}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {booking.status !== "assigned" ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(booking.id, "assigned")}
                                  disabled={statusSavingId === booking.id}
                                  className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-60"
                                >
                                  Assign
                                </button>
                              ) : null}
                              {booking.status !== "completed" ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(booking.id, "completed")}
                                  disabled={statusSavingId === booking.id}
                                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                                >
                                  Complete
                                </button>
                              ) : null}
                              {booking.status !== "cancelled" ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                                  disabled={statusSavingId === booking.id}
                                  className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl bg-mist px-5 py-6 text-center text-sm text-slate-600">
                    No bookings yet. New requests from the booking page will appear here.
                  </div>
                )}
              </div>
          </section>

          <section className="glass rounded-[2rem] p-7 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-slate-950">Team coverage</h2>
              <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Support roster
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
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
        </div>
      </section>
    </main>
  );
}
