import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { listBookings, updateBookingPayment } from "@/lib/booking-store";
import { getStripe } from "@/lib/stripe";

export async function POST(request, { params }) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { amountCents, description } = await request.json();

  if (!Number.isInteger(amountCents) || amountCents < 50) {
    return NextResponse.json({ error: "Amount must be at least $0.50." }, { status: 400 });
  }

  const bookings = await listBookings();
  const booking = bookings.find((b) => b.id === params.id);

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.stripeInvoiceId) {
    return NextResponse.json({ error: "An invoice already exists for this booking." }, { status: 409 });
  }

  const stripe = getStripe();

  const customers = await stripe.customers.list({ email: booking.email, limit: 1 });
  let customer;

  if (customers.data.length) {
    customer = customers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: booking.email,
      name: booking.customer,
      phone: booking.phone || undefined,
      metadata: { bookingId: booking.id }
    });
  }

  const invoiceDescription = description?.trim() ||
    `${booking.service} — ${booking.date} at ${booking.time}`;

  // Create the invoice first, then attach the item directly to it.
  // This prevents orphaned pending items from previous failed attempts bleeding in.
  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: 7,
    pending_invoice_items_behavior: "exclude",
    metadata: { bookingId: booking.id }
  });

  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: amountCents,
    currency: "usd",
    description: invoiceDescription
  });

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

  const result = await updateBookingPayment(booking.id, {
    stripeInvoiceId: finalizedInvoice.id,
    stripePaymentUrl: finalizedInvoice.hosted_invoice_url,
    paymentAmount: amountCents
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ booking: result.booking }, { status: 200 });
}
