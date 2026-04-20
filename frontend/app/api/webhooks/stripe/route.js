import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { updateBookingPaymentStatus } from "@/lib/booking-store";

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "invoice.paid") {
    await updateBookingPaymentStatus(event.data.object.id, "paid");
  } else if (event.type === "invoice.payment_failed") {
    await updateBookingPaymentStatus(event.data.object.id, "failed");
  }

  return NextResponse.json({ received: true });
}
