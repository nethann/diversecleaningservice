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

const paymentTone = {
  none: "bg-slate-100 text-slate-500",
  unpaid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700"
};

const paymentLabel = {
  none: "No invoice",
  unpaid: "Invoice sent",
  paid: "Paid",
  failed: "Payment failed"
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
  if (value === "confirmed") return "New";
  return value.replaceAll("_", " ");
}

function formatPhoneDisplay(phone) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length !== 10) return phone || "Not provided";
  return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
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
  const bookingMins = parseTimeToMinutes(booking.time);
  if (!availability.length) {
    return { tone: "bg-slate-100 text-slate-600", label: "Not set", reason: "Weekly availability has not been configured yet.", workloadCount };
  }

  const worksThisSlot = availability.some((entry) => {
    if (entry.weekday !== weekday) return false;
    const startMins = parseTimeToMinutes(entry.startTime);
    const endMins = parseTimeToMinutes(entry.endTime);
    return startMins >= 0 && endMins >= 0 && bookingMins >= startMins && bookingMins <= endMins;
  });
  if (!worksThisSlot) {
    return { tone: "bg-amber-50 text-amber-700", label: "Outside hours", reason: "This time is outside their saved availability.", workloadCount };
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

function getNoteSummary(text, fallbackLabel) {
  const trimmed = String(text ?? "").trim();

  if (!trimmed) {
    return `No ${fallbackLabel.toLowerCase()} yet`;
  }

  const lines = trimmed.split(/\n+/).filter(Boolean).length;
  return lines <= 1 ? "1 note" : `${lines} lines`;
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return -1;
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) return parseInt(match24[1]) * 60 + parseInt(match24[2]);
  const match12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = parseInt(match12[2]);
    if (match12[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (match12[3].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + m;
  }
  return -1;
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return timeStr;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 || 12;
  return `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

function buildWorkingHours(weekdayList, availability) {
  const map = Object.fromEntries(weekdayList.map((day) => [day, { start: "", end: "" }]));
  for (const entry of availability ?? []) {
    if (entry.weekday && entry.startTime && entry.endTime) {
      map[entry.weekday] = { start: entry.startTime, end: entry.endTime };
    }
  }
  return map;
}

function MemberCard({ member, onEdit, onEmailEdit, onRemove }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-slate-950">{member.name}</div>
          <div className="mt-1 text-xs text-slate-400">{member.email || "No email on file"}</div>
          <div className="mt-1 text-xs text-slate-500">{member.zone || "—"}</div>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {member.days.length ? `${member.days.length}d` : "Not set"}
        </span>
      </div>
      {member.availability?.length ? (
        <div className="mt-4 space-y-1 text-sm text-slate-600">
          {member.availability.map((entry) => (
            <div key={entry.weekday}>
              <span className="font-medium text-slate-800">{entry.weekday}:</span>{" "}
              {formatTime(entry.startTime)} – {formatTime(entry.endTime)}
            </div>
          ))}
          {member.blackoutDates?.length ? (
            <div className="mt-2 text-slate-500">Time off: {member.blackoutDates.join(", ")}</div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 min-h-[40px] rounded-2xl border border-dashed border-slate-200 bg-slate-50/60" />
      )}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onEmailEdit}
          className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit email
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Edit schedule
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AdminPage({ adminUser }) {
  const [bookings, setBookings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusSavingId, setStatusSavingId] = useState("");
  const [emailSavingId, setEmailSavingId] = useState("");
  const [initMessage, setInitMessage] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState("");
  const [assignmentSelection, setAssignmentSelection] = useState({});
  const [workingHours, setWorkingHours] = useState({});
  const [blackoutDatesSelection, setBlackoutDatesSelection] = useState([]);
  const [blackoutDateDraft, setBlackoutDateDraft] = useState("");
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityTarget, setAvailabilityTarget] = useState(null);
  const [teamCoverageOpen, setTeamCoverageOpen] = useState(false);
  const [addWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [workerSaving, setWorkerSaving] = useState(false);
  const [emailModalMember, setEmailModalMember] = useState(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState("");
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [specificDateFilter, setSpecificDateFilter] = useState("");
  const [internalNotesDraft, setInternalNotesDraft] = useState({});
  const [toast, setToast] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState({});
  const [invoiceDraft, setInvoiceDraft] = useState({});
  const [invoiceCreatingId, setInvoiceCreatingId] = useState("");

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
          setWorkingHours(buildWorkingHours(availabilityData.weekdays ?? [], currentMember?.availability ?? []));
          setBlackoutDatesSelection(currentMember?.blackoutDates ?? []);
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
      setWorkingHours(buildWorkingHours(refreshAvailabilityData.weekdays ?? [], currentMember?.availability ?? []));
      setBlackoutDatesSelection(currentMember?.blackoutDates ?? []);
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

  function getSelectedAssignedCleaners(bookingId) {
    const selectedIds = assignmentSelection[bookingId] ?? [];
    return selectedIds
      .map((memberId) => teamMembers.find((member) => member.id === memberId))
      .filter(Boolean)
      .map((member) => ({
        id: member.id,
        name: member.name,
        email: member.email ?? "",
        role: member.role ?? "head_admin"
      }));
  }

  async function handleStatusUpdate(id, status) {
    setStatusSavingId(id);

    const assignedCleaners = getSelectedAssignedCleaners(id);

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
    const assignedCleaners = getSelectedAssignedCleaners(bookingId);

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

  async function handleSendAssignmentEmails(bookingId) {
    const assignedCleaners = getSelectedAssignedCleaners(bookingId);

    if (!assignedCleaners.length) {
      setToast({ tone: "error", message: "Choose at least one team member before sending emails." });
      return;
    }

    setEmailSavingId(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/assignment-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          assignedCleaners,
          internalNotes: internalNotesDraft[bookingId] ?? ""
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't send assignment emails.");
      }

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
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
        [bookingId]: getBookingAssignmentIds(data.booking)
      }));
      setInternalNotesDraft((current) => ({
        ...current,
        [bookingId]: data.booking.internalNotes ?? ""
      }));
      setToast({ tone: "success", message: `Assignment saved and ${data.emailedCount} email${data.emailedCount === 1 ? "" : "s"} sent.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "We couldn't send assignment emails." });
    } finally {
      setEmailSavingId("");
    }
  }

  function requestBookingCancellation(booking) {
    setStatusMenuOpenId("");
    setCancelModalBooking(booking);
  }

  async function confirmBookingCancellation() {
    if (!cancelModalBooking) {
      return;
    }

    await handleStatusUpdate(cancelModalBooking.id, "cancelled");
    setCancelModalBooking(null);
  }

  function handleWorkingHoursChange(weekday, field, value) {
    if (field === "clear") {
      setWorkingHours((current) => ({ ...current, [weekday]: { start: "", end: "" } }));
      setAvailabilityMessage("");
      return;
    }
    setWorkingHours((current) => ({
      ...current,
      [weekday]: { ...(current[weekday] ?? { start: "", end: "" }), [field]: value }
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

  function openAvailabilityModal(member) {
    const target = member ?? teamMembers.find((m) => m.id === adminUser?.id);
    setAvailabilityTarget(target ?? null);
    setWorkingHours(buildWorkingHours(weekdays, target?.availability ?? []));
    setBlackoutDatesSelection(target?.blackoutDates ?? []);
    setBlackoutDateDraft("");
    setAvailabilityMessage("");
    setAvailabilityModalOpen(true);
  }

  function openEmailModal(member) {
    setEmailModalMember(member);
    setEmailDraft(member?.email ?? "");
  }

  function toggleDetailPanel(bookingId, panelKey) {
    setDetailPanelOpen((current) => ({
      ...current,
      [bookingId]: {
        ...current[bookingId],
        [panelKey]: !current[bookingId]?.[panelKey]
      }
    }));
  }

  async function handleAvailabilitySave() {
    setAvailabilitySaving(true);
    setAvailabilityMessage("");

    try {
      const selectedEntries = Object.entries(workingHours)
        .filter(([, hours]) => hours.start && hours.end)
        .map(([weekday, hours]) => ({ weekday, startTime: hours.start, endTime: hours.end }));

      const response = await fetch("/api/admin/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ selectedEntries, blackoutDates: blackoutDatesSelection, targetUserId: availabilityTarget?.id })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't save availability right now.");
      }

      setTeamMembers(data.teamMembers ?? []);
      setAvailabilityMessage("Availability updated.");
      setAvailabilityModalOpen(false);
      setToast({ tone: "success", message: "Weekly availability updated." });
    } catch (error) {
      setAvailabilityMessage(error.message || "We couldn't save availability right now.");
      setToast({ tone: "error", message: error.message || "We couldn't save availability right now." });
    } finally {
      setAvailabilitySaving(false);
    }
  }

  async function handleAddWorker() {
    if (!newWorkerName.trim()) return;
    setWorkerSaving(true);
    try {
      const response = await fetch("/api/admin/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWorkerName.trim(), email: newWorkerEmail.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add worker.");
      setTeamMembers(data.teamMembers ?? []);
      const addedName = newWorkerName.trim();
      setNewWorkerName("");
      setNewWorkerEmail("");
      setAddWorkerModalOpen(false);
      setToast({ tone: "success", message: `${addedName} added to the team.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "Failed to add worker." });
    } finally {
      setWorkerSaving(false);
    }
  }

  async function handleEmailSave() {
    if (!emailModalMember) return;

    setEmailSaving(true);
    try {
      const response = await fetch(`/api/admin/workers/${emailModalMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailDraft.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update email.");
      setTeamMembers(data.teamMembers ?? []);
      setEmailModalMember(null);
      setEmailDraft("");
      setToast({ tone: "success", message: `${emailModalMember.name}'s email updated.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "Failed to update email." });
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleRemoveWorker(workerId, workerName) {
    try {
      const response = await fetch(`/api/admin/workers/${workerId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to remove worker.");
      setTeamMembers(data.teamMembers ?? []);
      setToast({ tone: "success", message: `${workerName} removed.` });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "Failed to remove worker." });
    }
  }

  async function handleCreateInvoice(bookingId) {
    const draft = invoiceDraft[bookingId] ?? {};
    const amountDollars = parseFloat(draft.amount ?? "");

    if (!amountDollars || amountDollars < 0.5) {
      setToast({ tone: "error", message: "Enter a valid amount (min $0.50)." });
      return;
    }

    setInvoiceCreatingId(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountCents: Math.round(amountDollars * 100),
          description: draft.description?.trim() || undefined
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice.");
      }

      setBookings((current) =>
        current.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                stripeInvoiceId: data.booking.stripeInvoiceId,
                stripePaymentUrl: data.booking.stripePaymentUrl,
                paymentStatus: data.booking.paymentStatus,
                paymentAmount: data.booking.paymentAmount
              }
            : b
        )
      );
      setInvoiceDraft((current) => ({ ...current, [bookingId]: { amount: "", description: "" } }));
      setToast({ tone: "success", message: "Invoice created and sent to customer." });
    } catch (error) {
      setToast({ tone: "error", message: error.message || "Failed to create invoice." });
    } finally {
      setInvoiceCreatingId("");
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
              onClick={() => openAvailabilityModal(null)}
              className="mt-3 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Update my availability
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
                                          if (option.value === "cancelled") {
                                            requestBookingCancellation(booking);
                                            return;
                                          }

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
                          <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${paymentTone[booking.paymentStatus] ?? paymentTone.none}`}>
                              {paymentLabel[booking.paymentStatus] ?? "No invoice"}
                            </span>
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
                            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                              <div className="rounded-[1.75rem] border border-[#e7dcc8] bg-white p-5 shadow-[0_16px_40px_rgba(44,56,45,0.06)] sm:p-6">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Customer</div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Name</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{booking.customer}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Phone</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{formatPhoneDisplay(booking.phone)}</div>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Address</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{booking.address}</div>
                                  </div>
                                </div>

                                <div className="mt-5 rounded-2xl bg-mist p-4">
                                  <button
                                    type="button"
                                    onClick={() => toggleDetailPanel(booking.id, "customerNotes")}
                                    className="flex w-full items-center justify-between gap-3 text-left"
                                  >
                                    <div>
                                      <div className="text-sm font-medium text-slate-950">Customer notes</div>
                                      <div className="mt-1 text-xs text-slate-500">{getNoteSummary(booking.details, "Customer notes")}</div>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                      {detailPanelOpen[booking.id]?.customerNotes ? "Hide" : "View"}
                                    </span>
                                  </button>
                                  {detailPanelOpen[booking.id]?.customerNotes ? (
                                    <div className="mt-3 text-sm leading-7 text-slate-700">
                                      {booking.details || "No customer notes added."}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="rounded-[1.75rem] border border-[#e7dcc8] bg-white p-5 shadow-[0_16px_40px_rgba(44,56,45,0.06)] sm:p-6">
                                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Service</div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Service</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{booking.service}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Date</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{formatDateLabel(booking.date)}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Time</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{booking.time}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Recurring</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{formatListLabel(booking.recurring)}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Home size</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{formatListLabel(booking.homeSize)}</div>
                                  </div>
                                  <div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bath count</div>
                                    <div className="mt-1 text-sm leading-7 text-slate-900">{formatListLabel(booking.bathCount)}</div>
                                  </div>
                                </div>

                                <div className="mt-5 rounded-2xl bg-mist p-4">
                                  <button
                                    type="button"
                                    onClick={() => toggleDetailPanel(booking.id, "pricingAddons")}
                                    className="flex w-full items-center justify-between gap-3 text-left"
                                  >
                                    <div>
                                      <div className="text-sm font-medium text-slate-950">Pricing and add-ons</div>
                                      <div className="mt-1 text-xs text-slate-500">
                                        {booking.selectedAddons?.length
                                          ? `${booking.selectedAddons.length} add-on${booking.selectedAddons.length > 1 ? "s" : ""}`
                                          : "No add-ons selected"}
                                      </div>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                      {detailPanelOpen[booking.id]?.pricingAddons ? "Hide" : "View"}
                                    </span>
                                  </button>
                                  {detailPanelOpen[booking.id]?.pricingAddons ? (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      {booking.selectedAddons?.length ? (
                                        booking.selectedAddons.map((addon) => (
                                          <span
                                            key={addon.slug}
                                            className="rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-800"
                                          >
                                            {addon.name}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-sm text-slate-500">No add-ons selected.</span>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-3xl bg-mist p-5 sm:p-6">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Dispatch</div>
                                  <div className="mt-2 text-lg font-semibold text-slate-950">Assign responsible team members</div>
                                  <div className="mt-1 text-sm text-slate-500">
                                    Keep dispatch actions separate here. Choose up to three people for this booking.
                                  </div>
                                </div>
                                <div className="space-y-2 text-right">
                                  <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    {selectedIds.length} / 3 selected
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    Assigned team: {selectedNames.length ? selectedNames.join(", ") : "Not assigned yet"}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    Status: <span className="font-medium capitalize text-slate-900">{formatStatusLabel(booking.status)}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSendAssignmentEmails(booking.id)}
                                    disabled={!selectedIds.length || emailSavingId === booking.id || statusSavingId === booking.id}
                                    className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                  >
                                    {emailSavingId === booking.id ? "Sending..." : "Save + send emails"}
                                  </button>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {teamMembers.map((member) => {
                                  const active = selectedIds.includes(member.id);
                                  const memberStatus = getTeamMemberStatusForBooking(member, booking, bookings);
                                  const disabled = (!active && selectedIds.length >= 3) || (!active && ["Time off", "Conflict"].includes(memberStatus.label));

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
                                          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                            <span>{member.zone}</span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                              {member.role === "worker" ? "Sub-worker" : "Head admin"}
                                            </span>
                                          </div>
                                          <div className="mt-1 text-xs text-slate-400">
                                            {member.email ? member.email : "No email on file"}
                                          </div>
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
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Payment</div>
                                  <div className="mt-2 text-lg font-semibold text-slate-950">Stripe invoice</div>
                                  <div className="mt-1 text-sm text-slate-500">
                                    Create a custom invoice and send it to the customer by email.
                                  </div>
                                </div>
                                <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${paymentTone[booking.paymentStatus] ?? paymentTone.none}`}>
                                  {paymentLabel[booking.paymentStatus] ?? "No invoice"}
                                </span>
                              </div>

                              {booking.stripeInvoiceId ? (
                                <div className="mt-4 space-y-2">
                                  <div className="text-sm text-slate-700">
                                    <span className="font-medium">Amount: </span>
                                    ${(booking.paymentAmount / 100).toFixed(2)}
                                  </div>
                                  {booking.stripePaymentUrl ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                        <span className="flex-1 truncate text-xs text-slate-600">{booking.stripePaymentUrl}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(booking.stripePaymentUrl);
                                            setToast({ tone: "success", message: "Payment link copied." });
                                          }}
                                          className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                          Copy link
                                        </button>
                                        <a
                                          href={booking.stripePaymentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="shrink-0 rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:bg-brand-50"
                                        >
                                          Open
                                        </a>
                                      </div>
                                      <div className="text-xs text-slate-500">Send this link to the customer to collect payment.</div>
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="mt-4 space-y-3">
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="block">
                                      <span className="text-xs text-slate-500">Amount (USD)</span>
                                      <div className="relative mt-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">$</span>
                                        <input
                                          type="number"
                                          min="0.50"
                                          step="0.01"
                                          value={invoiceDraft[booking.id]?.amount ?? ""}
                                          onChange={(e) =>
                                            setInvoiceDraft((current) => ({
                                              ...current,
                                              [booking.id]: { ...(current[booking.id] ?? {}), amount: e.target.value }
                                            }))
                                          }
                                          placeholder="0.00"
                                          className="field-input w-full pl-7"
                                        />
                                      </div>
                                    </label>
                                    <label className="block">
                                      <span className="text-xs text-slate-500">Line item description (optional)</span>
                                      <input
                                        type="text"
                                        value={invoiceDraft[booking.id]?.description ?? ""}
                                        onChange={(e) =>
                                          setInvoiceDraft((current) => ({
                                            ...current,
                                            [booking.id]: { ...(current[booking.id] ?? {}), description: e.target.value }
                                          }))
                                        }
                                        placeholder={`${booking.service} — ${booking.date}`}
                                        className="field-input mt-1 w-full"
                                      />
                                    </label>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCreateInvoice(booking.id)}
                                    disabled={invoiceCreatingId === booking.id}
                                    className="rounded-full bg-[#6f8a67] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247] disabled:opacity-60"
                                  >
                                    {invoiceCreatingId === booking.id ? "Creating invoice..." : "Create and send invoice"}
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="rounded-3xl bg-mist p-5 sm:p-6">
                              <div className="font-medium text-slate-950">Internal booking notes</div>
                              <div className="mt-1 text-sm text-slate-500">
                                Keep dispatch notes, customer follow-up, and scheduling reminders here.
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleDetailPanel(booking.id, "internalNotes")}
                                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left"
                              >
                                <div>
                                  <div className="text-sm font-medium text-slate-900">Internal notes</div>
                                  <div className="mt-1 text-xs text-slate-500">
                                    {getNoteSummary(internalNotesDraft[booking.id] ?? booking.internalNotes, "Internal notes")}
                                  </div>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                                  {detailPanelOpen[booking.id]?.internalNotes ? "Hide" : "View"}
                                </span>
                              </button>
                              {detailPanelOpen[booking.id]?.internalNotes ? (
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
                              ) : null}
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
                <div className="mt-1 text-sm text-slate-500">Head admins and sub-workers — manage schedules and assignments.</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                <span>{teamCoverageOpen ? "Hide" : "Show"}</span>
                <span className="text-[10px]">{teamCoverageOpen ? "v" : ">"}</span>
              </span>
            </button>
            {teamCoverageOpen ? (
            <div className="border-t border-slate-200 px-7 pb-7 pt-6 sm:px-8 sm:pb-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="text-sm text-slate-500">{teamMembers.length} team members</div>
                <button
                  type="button"
                  onClick={() => { setNewWorkerName(""); setNewWorkerEmail(""); setAddWorkerModalOpen(true); }}
                  className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  + Add sub-worker
                </button>
              </div>
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Head admins</div>
                <div className="grid gap-4 lg:grid-cols-3">
                  {teamMembers.filter((m) => m.role !== "worker").map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onEdit={() => openAvailabilityModal(member)}
                      onEmailEdit={() => openEmailModal(member)}
                      onRemove={null}
                    />
                  ))}
                </div>
              </div>

              {teamMembers.some((m) => m.role === "worker") ? (
                <div className="mt-7">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sub-workers</div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {teamMembers.filter((m) => m.role === "worker").map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onEdit={() => openAvailabilityModal(member)}
                        onEmailEdit={() => openEmailModal(member)}
                        onRemove={() => handleRemoveWorker(member.id, member.name)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-7">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sub-workers</div>
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-6 text-center text-sm text-slate-400">
                    No sub-workers yet. Click &ldquo;+ Add sub-worker&rdquo; to create one.
                  </div>
                </div>
              )}
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
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                  {availabilityTarget?.id === adminUser?.id || !availabilityTarget
                    ? "Update your schedule"
                    : `Update ${availabilityTarget.name}'s schedule`}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Set the working hours for each day. Leave a day blank to mark it as unavailable.
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
              {weekdays.map((weekday) => {
                const hours = workingHours[weekday] ?? { start: "", end: "" };
                const isActive = Boolean(hours.start && hours.end);
                return (
                  <div
                    key={weekday}
                    className={`rounded-2xl px-4 py-4 transition ${
                      isActive ? "border border-brand-200 bg-brand-50" : "bg-mist"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-medium text-slate-900">{weekday}</div>
                      {isActive ? (
                        <span className="text-xs font-semibold text-brand-700">
                          {formatTime(hours.start)} – {formatTime(hours.end)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not working</span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs text-slate-500">Start time</span>
                        <input
                          type="time"
                          value={hours.start}
                          onChange={(e) => handleWorkingHoursChange(weekday, "start", e.target.value)}
                          className="field-input mt-1 w-full"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs text-slate-500">End time</span>
                        <input
                          type="time"
                          value={hours.end}
                          onChange={(e) => handleWorkingHoursChange(weekday, "end", e.target.value)}
                          className="field-input mt-1 w-full"
                        />
                      </label>
                    </div>
                    {hours.start && !hours.end ? (
                      <div className="mt-2 text-xs text-amber-600">Add an end time to activate this day.</div>
                    ) : null}
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => handleWorkingHoursChange(weekday, "clear", "")}
                        className="mt-3 text-xs font-semibold text-rose-600 transition hover:text-rose-800"
                      >
                        Clear this day
                      </button>
                    ) : null}
                  </div>
                );
              })}
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

      {addWorkerModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="w-full max-w-md rounded-[2rem] border border-[#e6e0d3] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Team</div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Add sub-worker</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Sub-workers appear on the dispatch board and can be assigned to bookings. Add an email if they should receive assignment notices.
            </p>
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input
                type="text"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddWorker(); }}
                placeholder="e.g. Marcus Johnson"
                className="field-input mt-2 w-full"
                autoFocus
              />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Email for assignment notices</span>
              <input
                type="email"
                value={newWorkerEmail}
                onChange={(e) => setNewWorkerEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddWorker(); }}
                placeholder="worker@example.com"
                className="field-input mt-2 w-full"
              />
            </label>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleAddWorker}
                disabled={workerSaving || !newWorkerName.trim()}
                className="rounded-full bg-[#6f8a67] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247] disabled:opacity-60"
              >
                {workerSaving ? "Adding..." : "Add worker"}
              </button>
              <button
                type="button"
                onClick={() => setAddWorkerModalOpen(false)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {emailModalMember ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="w-full max-w-md rounded-[2rem] border border-[#e6e0d3] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Team email</div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Update {emailModalMember.name}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              This email is used for assignment notifications when you click Save + send emails on a booking.
            </p>
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">Email address</span>
              <input
                type="email"
                value={emailDraft}
                onChange={(event) => setEmailDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleEmailSave();
                }}
                placeholder="team@example.com"
                className="field-input mt-2 w-full"
                autoFocus
              />
            </label>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleEmailSave}
                disabled={emailSaving}
                className="rounded-full bg-[#6f8a67] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4c6247] disabled:opacity-60"
              >
                {emailSaving ? "Saving..." : "Save email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailModalMember(null);
                  setEmailDraft("");
                }}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cancelModalBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-[2rem] border border-[#e6e0d3] bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)] sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Cancel booking</div>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Are you sure?</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              This will cancel the booking for {cancelModalBooking.customer} on {formatDateLabel(cancelModalBooking.date)} at{" "}
              {cancelModalBooking.time}. The slot will become available again for scheduling.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={confirmBookingCancellation}
                disabled={statusSavingId === cancelModalBooking.id}
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {statusSavingId === cancelModalBooking.id ? "Cancelling..." : "Yes, cancel booking"}
              </button>
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep booking
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
