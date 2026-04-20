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

function toLocalDateInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function getBookingWeekday(date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(`${date}T12:00:00`));
}

function getRelativeDateRange(range) {
  const now = new Date();
  const today = toLocalDateInputValue(now);

  if (range === "today") {
    return { start: today, end: today };
  }

  if (range === "tomorrow") {
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = toLocalDateInputValue(tomorrowDate);
    return { start: tomorrow, end: tomorrow };
  }

  if (range === "this-week") {
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 7);
    return {
      start: toLocalDateInputValue(startDate),
      end: toLocalDateInputValue(endDate)
    };
  }

  return null;
}

function getDispatchStatusKey(booking) {
  if (booking.status === "completed") return "completed";
  if (booking.status === "cancelled") return "cancelled";
  if (booking.assignedCleaners?.length) return "assigned";
  return "new";
}

function getTeamMemberStatusForBooking(member, booking, bookings) {
  const blackoutDates = member.blackoutDates ?? [];
  const availability = member.availability ?? [];
  const workloadCount = bookings.filter(
    (item) =>
      item.id !== booking.id &&
      item.date === booking.date &&
      item.status !== "cancelled" &&
      ((item.assignedCleaners ?? []).some((assigned) => assigned.id === member.id) || item.cleanerId === member.id)
  ).length;

  if (blackoutDates.includes(booking.date)) {
    return { tone: "bg-rose-50 text-rose-700", label: "Time off", reason: "Marked unavailable for this date.", workloadCount };
  }

  const weekday = getBookingWeekday(booking.date);
  const worksThisSlot = availability.some((entry) => entry.weekday === weekday && entry.timeSlot === booking.time);
  if (!worksThisSlot) {
    return { tone: "bg-slate-100 text-slate-600", label: "Unavailable", reason: "Does not cover this date and time.", workloadCount };
  }

  const conflictingBooking = bookings.find(
    (item) =>
      item.id !== booking.id &&
      item.date === booking.date &&
      item.time === booking.time &&
      item.status !== "cancelled" &&
      (((item.assignedCleaners ?? []).some((assigned) => assigned.id === member.id) || item.cleanerId === member.id))
  );

  if (conflictingBooking) {
    return { tone: "bg-amber-50 text-amber-700", label: "Conflict", reason: "Already tied to another booking at this time.", workloadCount };
  }

  return { tone: "bg-emerald-50 text-emerald-700", label: "Available", reason: "Open for this booking time.", workloadCount };
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
  const [blackoutDatesSelection, setBlackoutDatesSelection] = useState([]);
  const [blackoutDateDraft, setBlackoutDateDraft] = useState("");
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [teamCoverageOpen, setTeamCoverageOpen] = useState(false);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [specificDateFilter, setSpecificDateFilter] = useState("");
  const [internalNotesDraft, setInternalNotesDraft] = useState({});
  const [toast, setToast] = useState(null);

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
          setBlackoutDatesSelection(currentMember?.blackoutDates ?? []);
          setAvailabilityDraft(
            Object.fromEntries((availabilityData.weekdays ?? []).map((weekday) => [weekday, ""]))
          );
          setInternalNotesDraft(
            Object.fromEntries(nextBookings.map((booking) => [booking.id, booking.internalNotes ?? ""]))
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

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const quickRange = getRelativeDateRange(dateFilter);

    return sortedBookings.filter((booking) => {
      const matchesQuery =
        !query ||
        booking.customer.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.service.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || getDispatchStatusKey(booking) === statusFilter;
      const matchesService = serviceFilter === "all" || booking.serviceSlug === serviceFilter;
      const matchesSpecificDate = !specificDateFilter || booking.date === specificDateFilter;
      const matchesQuickDate =
        !quickRange || (booking.date >= quickRange.start && booking.date <= quickRange.end);

      return matchesQuery && matchesStatus && matchesService && matchesSpecificDate && matchesQuickDate;
    });
  }, [sortedBookings, searchQuery, statusFilter, serviceFilter, dateFilter, specificDateFilter]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    function handleWindowClick() {
      setStatusMenuOpenId("");
    }

    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

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
      setBlackoutDatesSelection(currentMember?.blackoutDates ?? []);
      setAvailabilityDraft(
        Object.fromEntries((refreshAvailabilityData.weekdays ?? []).map((weekday) => [weekday, ""]))
      );
      setInternalNotesDraft(
        Object.fromEntries(nextBookings.map((booking) => [booking.id, booking.internalNotes ?? ""]))
      );
      setToast({ tone: "success", message: "Database is ready." });
    } catch (error) {
      setInitMessage(error.message || "We couldn't initialize the database.");
      setToast({ tone: "error", message: error.message || "We couldn't initialize the database." });
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
    if (status === "cancelled" && !window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

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
        body: JSON.stringify({ status, assignedCleaners, internalNotes: internalNotesDraft[id] ?? "" })
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
                assignedCleaners: data.booking.assignedCleaners,
                internalNotes: data.booking.internalNotes
              }
            : booking
        )
      );
      setAssignmentSelection((current) => ({
        ...current,
        [id]: getBookingAssignmentIds(data.booking)
      }));
      setInternalNotesDraft((current) => ({
        ...current,
        [id]: data.booking.internalNotes ?? ""
      }));
      setToast({ tone: "success", message: `Booking marked ${formatStatusLabel(data.booking.status)}.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "We couldn't update the booking status." });
    } finally {
      setStatusSavingId("");
    }
  }

  async function handleInternalNotesSave(bookingId) {
    setStatusSavingId(bookingId);

    const booking = bookings.find((item) => item.id === bookingId);
    const selectedIds = assignmentSelection[bookingId] ?? [];
    const assignedCleaners = selectedIds
      .map((memberId) => teamMembers.find((member) => member.id === memberId))
      .filter(Boolean)
      .map((member) => ({ id: member.id, name: member.name }));

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: booking?.status ?? "confirmed",
          assignedCleaners,
          internalNotes: internalNotesDraft[bookingId] ?? ""
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't save the internal note.");
      }

      setBookings((current) =>
        current.map((item) => (item.id === bookingId ? { ...item, internalNotes: data.booking.internalNotes } : item))
      );
      setToast({ tone: "success", message: "Internal note saved." });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "We couldn't save the internal note." });
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

  function addBlackoutDate() {
    if (!blackoutDateDraft) {
      return;
    }

    setBlackoutDatesSelection((current) => (current.includes(blackoutDateDraft) ? current : [...current, blackoutDateDraft].sort()));
    setBlackoutDateDraft("");
    setAvailabilityMessage("");
  }

  function removeBlackoutDate(dateValue) {
    setBlackoutDatesSelection((current) => current.filter((item) => item !== dateValue));
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
        body: JSON.stringify({ selectedEntries, blackoutDates: blackoutDatesSelection })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't save availability right now.");
      }

      setTeamMembers(data.teamMembers ?? []);
      setAvailabilityMessage("Availability updated.");
      setAvailabilityModalOpen(false);
      setAvailabilityDraft(Object.fromEntries(weekdays.map((weekday) => [weekday, ""])));
      setToast({ tone: "success", message: "Weekly availability updated." });
    } catch (error) {
      setAvailabilityMessage(error.message || "We couldn't save availability right now.");
      setToast({ tone: "error", message: error.message || "We couldn't save availability right now." });
    } finally {
      setAvailabilitySaving(false);
    }
  }

  return (
    <main className="pb-20">
      <SiteHeader />

      <section className="shell py-10">
        {toast ? (
          <div
            className={`mb-6 rounded-[1.5rem] px-5 py-4 text-sm font-medium shadow-panel ${
              toast.tone === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {toast.message}
          </div>
        ) : null}

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
                setBlackoutDatesSelection(currentMember?.blackoutDates ?? []);
                setAvailabilityDraft(Object.fromEntries(weekdays.map((weekday) => [weekday, ""])));
                setBlackoutDateDraft("");
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
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search customer, email, or service"
                    className="field-input w-full"
                  />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="field-input w-full">
                    <option value="all">All statuses</option>
                    <option value="new">New</option>
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} className="field-input w-full">
                    <option value="all">All services</option>
                    <option value="standard-cleaning">Standard cleaning</option>
                    <option value="deep-cleaning">Deep cleaning</option>
                    <option value="move-in-move-out">Move-in / move-out</option>
                    <option value="commercial-cleaning">Commercial cleaning</option>
                  </select>
                  <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="field-input w-full">
                    <option value="all">All dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="this-week">This week</option>
                  </select>
                  <input
                    type="date"
                    value={specificDateFilter}
                    onChange={(event) => setSpecificDateFilter(event.target.value)}
                    className="field-input w-full"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "new", label: "New" },
                    { value: "assigned", label: "Assigned" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                        statusFilter === option.value
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-7 space-y-5">
                {filteredBookings.length ? (
                  filteredBookings.map((booking) => {
                    const isExpanded = expandedBookingId === booking.id;
                    const selectedIds = assignmentSelection[booking.id] ?? [];
                    const selectedNames = selectedIds
                      .map((memberId) => teamMembers.find((member) => member.id === memberId)?.name)
                      .filter(Boolean);
                    const dispatchState = getDispatchStatusKey(booking);

                    return (
                      <div
                        key={booking.id}
                        className={`rounded-[2rem] border bg-white p-6 shadow-[0_18px_45px_rgba(44,56,45,0.05)] sm:p-7 ${
                          dispatchState === "new" ? "border-amber-300 ring-1 ring-amber-100" : "border-slate-200"
                        }`}
                      >
                        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.85fr_1fr_auto_auto] xl:items-center">
                          <div className="pr-2">
                            <div className="font-medium text-slate-950">{booking.customer}</div>
                            <div className="mt-2 text-sm leading-7 text-slate-500">{booking.service}</div>
                            {dispatchState === "new" ? (
                              <div className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                                Unassigned
                              </div>
                            ) : null}
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
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setStatusMenuOpenId((current) => (current === booking.id ? "" : booking.id));
                                }}
                                disabled={statusSavingId === booking.id}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold capitalize shadow-sm transition ${
                                  statusTone[booking.status] ?? "bg-slate-100 text-slate-700"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                              >
                                <span>{formatStatusLabel(booking.status)}</span>
                                <span className={`text-[10px] transition ${statusMenuOpenId === booking.id ? "rotate-180" : ""}`}>v</span>
                              </button>

                              {statusMenuOpenId === booking.id ? (
                                <div
                                  className="absolute right-0 top-full z-20 mt-2 min-w-[170px] overflow-hidden rounded-2xl border border-[#e6dcc8] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  {statusOptions
                                    .filter((option) => option.value !== booking.status)
                                    .map((option) => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                          setStatusMenuOpenId("");
                                          handleStatusUpdate(booking.id, option.value);
                                        }}
                                        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-sm font-medium text-slate-700 transition last:border-b-0 hover:bg-slate-50"
                                      >
                                        <span>{option.label}</span>
                                        <span className="text-xs text-slate-400">{formatStatusLabel(option.value)}</span>
                                      </button>
                                    ))}
                                </div>
                              ) : null}
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
                                  const memberStatus = getTeamMemberStatusForBooking(member, booking, bookings);
                                  const disabled = (!active && selectedIds.length >= 3) || (!active && memberStatus.label !== "Available");

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
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <div className="font-medium text-slate-900">{member.name}</div>
                                          <div className="mt-1 text-sm text-slate-500">{member.zone}</div>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${memberStatus.tone}`}>
                                          {memberStatus.label}
                                        </span>
                                      </div>
                                      <div className="mt-3 text-xs leading-6 text-slate-500">{memberStatus.reason}</div>
                                      <div className="mt-2 text-xs font-medium text-slate-600">
                                        {memberStatus.workloadCount} job{memberStatus.workloadCount === 1 ? "" : "s"} that day
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="rounded-3xl bg-mist p-5 sm:p-6">
                              <div className="font-medium text-slate-950">Internal booking notes</div>
                              <div className="mt-1 text-sm text-slate-500">
                                Keep dispatch notes, customer follow-up, and scheduling reminders here.
                              </div>
                              <textarea
                                rows={4}
                                value={internalNotesDraft[booking.id] ?? ""}
                                onChange={(event) =>
                                  setInternalNotesDraft((current) => ({
                                    ...current,
                                    [booking.id]: event.target.value
                                  }))
                                }
                                className="field-input mt-4 w-full rounded-[1.5rem]"
                                placeholder="Add internal admin notes"
                              />
                              <div className="mt-4">
                                <button
                                  type="button"
                                  onClick={() => handleInternalNotesSave(booking.id)}
                                  disabled={statusSavingId === booking.id}
                                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                                >
                                  Save internal note
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl bg-mist px-5 py-6 text-center text-sm text-slate-600">
                    No bookings matched the current filters.
                  </div>
                )}
              </div>
          </section>

          <section className="glass overflow-hidden rounded-[2rem]">
            <button
              type="button"
              onClick={() => setTeamCoverageOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-4 px-7 py-7 text-left transition hover:bg-slate-50/50 sm:px-8"
            >
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Team coverage</h2>
                <div className="mt-1 text-sm text-slate-500">Shared weekly schedule for the admin team.</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                <span>{teamCoverageOpen ? "Hide team coverage" : "Show team coverage"}</span>
                <span className="text-[10px]">{teamCoverageOpen ? "v" : ">"}</span>
              </span>
            </button>
            {teamCoverageOpen ? (
            <div className="border-t border-slate-200 px-7 pb-7 pt-6 sm:px-8 sm:pb-8">
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
                        {member.blackoutDates?.length ? (
                          <div className={member.days.length || member.slots.length ? "mt-2" : ""}>
                            Time off dates: {member.blackoutDates.join(", ")}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4 min-h-[52px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/60" />
                    )}
                  </div>
                ))}
            </div>
            </div>
            ) : null}
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

            <div className="mt-6 rounded-2xl bg-mist px-4 py-4">
              <div className="text-sm font-medium text-slate-900">Time off / blackout dates</div>
              <div className="mt-1 text-sm text-slate-500">
                Add dates when you should not be assigned to any booking.
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={blackoutDateDraft}
                  onChange={(event) => setBlackoutDateDraft(event.target.value)}
                  className="field-input min-w-[180px] flex-1"
                />
                <button
                  type="button"
                  onClick={addBlackoutDate}
                  className="rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  Add blackout date
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {blackoutDatesSelection.length ? (
                  blackoutDatesSelection.map((dateValue) => (
                    <button
                      key={dateValue}
                      type="button"
                      onClick={() => removeBlackoutDate(dateValue)}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      {dateValue} x
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-slate-500">No blackout dates added yet.</div>
                )}
              </div>
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
