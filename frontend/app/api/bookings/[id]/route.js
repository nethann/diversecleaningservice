import { NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/booking-store";

export async function PATCH(request, { params }) {
  const payload = await request.json();
  const result = await updateBookingStatus(params.id, payload.status);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ booking: result.booking }, { status: result.status });
}
