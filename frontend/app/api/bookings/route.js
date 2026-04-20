import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createBooking, listBookings } from "@/lib/booking-store";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const bookings = await listBookings();
  return NextResponse.json({ bookings });
}

export async function POST(request) {
  const payload = await request.json();
  const result = await createBooking(payload);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    {
      booking: result.booking,
      slotSummaries: result.slotSummaries
    },
    { status: result.status }
  );
}
