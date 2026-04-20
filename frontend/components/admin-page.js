"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { SiteHeader } from "@/components/site-header";

const statusTone = {
  confirmed: "bg-emerald-50 text-emerald-700",
  assigned: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-rose-50 text-rose-700",
  pending: "bg-brand-50 text-brand-700",
  in_progress: "bg-sky-50 text-sky-700"
};

const statusOptions = [
  { value: "assigned", label: "Assign" },
  { value: "completed", label: "Complete" },
  { value: "cancelled", label: "Cancel" }
];

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

function formatStatusLabel(value) {
  return value.replaceAll("_", " ");
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

export function AdminPage({ adminUser }) {
  const [bookings, setBookings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusSavingId, setStatusSavingId] = useState("");
  const [initMessage, setInitMessage] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState("");
  const [assignmentSelection, setAssignmentSelection] = useState({});
  const [availabilitySelection, setAvailabilitySelection] = useState([]);
  const [availabilityDraft, setAvailabilityDraft] = useState({});
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);

  function getBookingAssignmentIds(booking) {
    const lockedStatuses = new Set(["assigned", "completed", "in_progress"]);
    return lockedStatuses.has(booking.status) ? (booking.assignedCleaners ?? []).map((member) => member.id) : [];
  }

  useEffect(() => {
    let active = true;

    async function loadDashboard(showLoading = true) {
      if (showLoading) {
        setLoading(true);
      }

      try {
        const [bookingsResponse, availabilityResponse] = await Promise.all([
          fetch("/api/bookings"),
          fetch("/api/admin/availability")
        ]);
        const bookingsData = await bookingsResponse.json();
        const availabilityData = await availabilityResponse.json();

        if (!bookingsResponse.ok || !availabilityResponse.ok) {
          return;
        }

        if (active) {
          const nextBookings = bookingsData.bookings ?? [];
          const nextTeamMembers = availabilityData.teamMembers ?? [];
          setBookings(nextBookings);
          setTeamMembers(nextTeamMembers);
          setWeekdays(availabilityData.weekdays ?? []);
          setAssignmentSelection(
            Object.fromEntries(
              nextBookings.map((booking) => [booking.id, getBookingAssignmentIds(booking)])
            )
          );
          const currentMember = nextTeamMembers.find((member) => member.id === adminUser?.id);
          setAvailabilitySelection((currentMember?.availability ?? []).map((entry) => `${entry.weekday}|${entry.timeSlot}`));
          setAvailabilityDraft(
            Object.fromEntries((availabilityData.weekdays ?? []).map((weekday) => [weekday, ""]))
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

    loadDashboard();

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
      const [refreshBookings, refreshAvailability] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/admin/availability")
      ]);
      const refreshBookingsData = await refreshBookings.json();
      const refreshAvailabilityData = await refreshAvailability.json();
      const nextBookings = refreshBookingsData.bookings ?? [];
      const nextTeamMembers = refreshAvailabilityData.teamMembers ?? [];
      setBookings(nextBookings);
      setTeamMembers(nextTeamMembers);
      setWeekdays(refreshAvailabilityData.weekdays ?? []);
      setAssignmentSelection(
        Object.fromEntries(
          nextBookings.map((booking) => [booking.id, getBookingAssignmentIds(booking)])
        )
      );
      const currentMember = nextTeamMembers.find((member) => member.id === adminUser?.id);
      setAvailabilitySelection((currentMember?.availability ?? []).map((entry) => `${entry.weekday}|${entry.timeSlot}`));
      setAvailabilityDraft(
        Object.fromEntries((refreshAvailabilityData.weekdays ?? []).map((weekday) => [weekday, ""]))
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
      .map((memberId) => teamMembers.find((member) => member.id === memberId))
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
        [id]: getBookingAssignmentIds(data.booking)
      }));
    } catch {
      // Keep the board stable if a status update fails.
    } finally {
      setStatusSavingId("");
    }
  }

  function toggleAvailability(weekday, timeSlot) {
    const key = `${weekday}|${timeSlot}`;

    setAvailabilitySelection((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    );
    setAvailabilityMessage("");
  }

  function handleAvailabilityDraftChange(weekday, value) {
    setAvailabilityDraft((current) => ({
      ...current,
      [weekday]: value
    }));
  }

  function addAvailabilityTime(weekday) {
    const nextTime = (availabilityDraft[weekday] ?? "").trim();
    if (!nextTime) {
      return;
    }

    const key = `${weekday}|${nextTime}`;
    setAvailabilitySelection((current) => (current.includes(key) ? current : [...current, key]));
    setAvailabilityDraft((current) => ({
      ...current,
      [weekday]: ""
    }));
    setAvailabilityMessage("");
  }

  async function handleAvailabilitySave() {
    setAvailabilitySaving(true);
    setAvailabilityMessage("");

    try {
      const selectedEntries = availabilitySelection.map((entry) => {
        const [weekday, timeSlot] = entry.split("|");
        return { weekday, timeSlot };
      });

      const response = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ selectedEntries })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't save availability right now.");
      }

      setTeamMembers(data.teamMembers ?? []);
      setAvailabilityMessage("Availability updated.");
      setAvailabilityModalOpen(false);
      setAvailabilityDraft(Object.fromEntries(weekdays.map((weekday) => [weekday, ""])));
    } catch (error) {
      setAvailabilityMessage(error.message || "We couldn't save availability right now.");
    } finally {
      setAvailabilitySaving(false);
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
              Review each booking request, open the full details for that entry, assign up to three team members, and keep
              the shared weekly availability board current for the whole team.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-950 px-5 py-4 text-white shadow-panel">
            <div className="text-sm text-slate-300">Signed in as</div>
            <div className="mt-1 text-lg font-semibold">{adminUser?.displayName ?? "Admin user"}</div>
            <div className="mt-4 border-t border-white/10 pt-4">
              <div className="text-sm text-slate-300">Database status</div>
              <div className="mt-2 text-3xl font-semibold">{loading ? "..." : sortedBookings.length}</div>
              <div className="mt-1 text-sm text-slate-400">
                {sortedBookings.length ? "Live booking requests currently loaded." : "Ready to receive the first live booking."}
              </div>
            </div>
            <button
              type="button"
              onClick={handleInitDatabase}
              className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Initialize database
            </button>
            <div className="mt-3">
              <AdminLogoutButton />
            </div>
            <button
              type="button"
              onClick={() => {
                const currentMember = teamMembers.find((member) => member.id === adminUser?.id);
                setAvailabilitySelection((currentMember?.availability ?? []).map((entry) => `${entry.weekday}|${entry.timeSlot}`));
                setAvailabilityDraft(Object.fromEntries(weekdays.map((weekday) => [weekday, ""])));
                setAvailabilityMessage("");
                setAvailabilityModalOpen(true);
              }}
              className="mt-3 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Update weekly availability
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
                      .map((memberId) => teamMembers.find((member) => member.id === memberId)?.name)
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
                            <div
                              className={`relative inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusTone[booking.status] ?? "bg-slate-100 text-slate-700"}`}
                            >
                              <select
                                value={booking.status}
                                onChange={(event) => handleStatusUpdate(booking.id, event.target.value)}
                                disabled={statusSavingId === booking.id}
                                className="appearance-none bg-transparent pr-5 text-xs font-semibold capitalize text-current outline-none disabled:cursor-not-allowed"
                                aria-label={`Update status for ${booking.customer}`}
                              >
                                <option value={booking.status}>{formatStatusLabel(booking.status)}</option>
                                {statusOptions
                                  .filter((option) => option.value !== booking.status)
                                  .map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                              </select>
                              <span className="pointer-events-none absolute right-3 text-[10px]">v</span>
                            </div>
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
                              {teamMembers.map((member) => {
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
                Shared weekly schedule
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-slate-950">{member.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{member.zone}</div>
                      </div>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                        {member.days.length ? `${member.days.length} days available` : "Not set"}
                      </span>
                    </div>
                    {member.days.length || member.slots.length ? (
                      <div className="mt-4 text-sm text-slate-600">
                        {member.days.length ? <div>Coverage days: {member.days.join(", ")}</div> : null}
                        {member.slots.length ? <div className={member.days.length ? "mt-2" : ""}>Time slots: {member.slots.join(", ")}</div> : null}
                      </div>
                    ) : (
                      <div className="mt-4 min-h-[52px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/60" />
                    )}
                  </div>
                ))}
            </div>
          </section>
        </div>
      </section>

      {availabilityModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#e6e0d3] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Weekly availability</div>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">Update your schedule</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Choose the days and time slots you want the team to see for this week.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAvailabilityModalOpen(false)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {weekdays.map((weekday) => (
                <div key={weekday} className="rounded-2xl bg-mist px-4 py-4">
                  <div className="text-sm font-medium text-slate-900">{weekday}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={availabilityDraft[weekday] ?? ""}
                      onChange={(event) => handleAvailabilityDraftChange(weekday, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addAvailabilityTime(weekday);
                        }
                      }}
                      placeholder="Add preferred time"
                      className="field-input min-w-[180px] flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => addAvailabilityTime(weekday)}
                      className="rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                    >
                      Add time
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {availabilitySelection
                      .filter((entry) => entry.startsWith(`${weekday}|`))
                      .map((entry) => {
                        const [, timeSlot] = entry.split("|");

                        return (
                          <button
                            key={entry}
                            type="button"
                            onClick={() => toggleAvailability(weekday, timeSlot)}
                            className="rounded-full border border-brand-300 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800 transition hover:bg-brand-100"
                          >
                            {timeSlot} x
                          </button>
                        );
                      })}
                    {!availabilitySelection.some((entry) => entry.startsWith(`${weekday}|`)) ? (
                      <div className="text-xs text-slate-500">No preferred times added yet.</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAvailabilitySave}
                disabled={availabilitySaving}
                className="rounded-full bg-[#6f8a67] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247] disabled:opacity-70"
              >
                {availabilitySaving ? "Saving..." : "Save availability"}
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityModalOpen(false)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
