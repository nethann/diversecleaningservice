import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return null;
  }

  return {
    resend: new Resend(apiKey),
    from
  };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date) {
  if (!date) return "Not provided";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T12:00:00`));
}

function formatAddons(addons = []) {
  if (!addons.length) return "None";
  return addons.map((addon) => addon.name ?? addon).join(", ");
}

function bookingTextSummary(booking) {
  return [
    `Booking: ${booking.id}`,
    `Customer: ${booking.customer}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || "Not provided"}`,
    `Service: ${booking.service}`,
    `Home size: ${booking.homeSize || "Not provided"}`,
    `Bath count: ${booking.bathCount || "Not provided"}`,
    `Address: ${booking.address}`,
    `Date: ${formatDate(booking.date)}`,
    `Preferred time: ${booking.time}`,
    `Recurring: ${booking.recurring || "one-time"}`,
    `Add-ons: ${formatAddons(booking.selectedAddons)}`,
    `Notes: ${booking.details || "None"}`
  ].join("\n");
}

function bookingHtmlSummary(booking) {
  const rows = [
    ["Booking", booking.id],
    ["Customer", booking.customer],
    ["Email", booking.email],
    ["Phone", booking.phone || "Not provided"],
    ["Service", booking.service],
    ["Home size", booking.homeSize || "Not provided"],
    ["Bath count", booking.bathCount || "Not provided"],
    ["Address", booking.address],
    ["Date", formatDate(booking.date)],
    ["Preferred time", booking.time],
    ["Recurring", booking.recurring || "one-time"],
    ["Add-ons", formatAddons(booking.selectedAddons)],
    ["Notes", booking.details || "None"]
  ];

  return `
    <div style="font-family: Georgia, serif; color: #1f2a22; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Diverse Cleaning Service booking</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="border-bottom: 1px solid #eee8dc; padding: 10px 12px; color: #6f806a; width: 160px;">${escapeHtml(label)}</td>
                <td style="border-bottom: 1px solid #eee8dc; padding: 10px 12px; font-weight: 600;">${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    </div>
  `;
}

async function sendMail({ to, subject, text, html }) {
  const client = getResendClient();
  if (!client || !to) {
    return { skipped: true };
  }

  try {
    await client.resend.emails.send({
      from: client.from,
      to,
      subject,
      text,
      html
    });
    return { ok: true };
  } catch (error) {
    console.error("Email send failed:", error);
    return { error };
  }
}

export async function sendNewBookingEmail(booking) {
  return sendMail({
    to: process.env.BOOKING_NOTIFICATION_EMAIL,
    subject: `New booking request: ${booking.customer} on ${formatDate(booking.date)}`,
    text: `A new booking request was submitted.\n\n${bookingTextSummary(booking)}`,
    html: bookingHtmlSummary(booking)
  });
}

export async function sendCustomerBookingEmail(booking) {
  return sendMail({
    to: booking.email,
    subject: `We received your Diverse Cleaning Service request`,
    text: [
      `Hi ${booking.customer},`,
      "",
      "Thanks for reaching out to Diverse Cleaning Service. We received your booking request and will review the details shortly.",
      "",
      bookingTextSummary(booking),
      "",
      "For residential or commercial booking help, call (470) 293-9475."
    ].join("\n"),
    html: `
      <div style="font-family: Georgia, serif; color: #1f2a22; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">We received your booking request</h2>
        <p style="margin: 0 0 18px;">Hi ${escapeHtml(booking.customer)}, thanks for reaching out to Diverse Cleaning Service. We will review your request and confirm the details shortly.</p>
        <p style="margin: 0 0 18px;">For residential or commercial booking help, call <strong>(470) 293-9475</strong>.</p>
      </div>
      ${bookingHtmlSummary(booking)}
    `
  });
}

export async function sendAssignmentEmail(booking, assignedCleaners = []) {
  const recipients = Array.from(
    new Set(
      assignedCleaners
        .map((member) => member.email)
        .filter(Boolean)
    )
  );

  if (!recipients.length) {
    return { skipped: true };
  }

  return sendMail({
    to: recipients.join(","),
    subject: `Cleaning assignment: ${booking.customer} on ${formatDate(booking.date)}`,
    text: `You have been assigned to this cleaning booking.\n\n${bookingTextSummary(booking)}`,
    html: `
      <div style="font-family: Georgia, serif; color: #1f2a22; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">You have a cleaning assignment</h2>
        <p style="margin: 0 0 18px;">Please review the customer, service, date, time, and address below.</p>
      </div>
      ${bookingHtmlSummary(booking)}
    `
  });
}
