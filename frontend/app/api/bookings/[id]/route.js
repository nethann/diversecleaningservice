import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { deleteBooking, updateBookingStatus } from "@/lib/booking-store";

export async function PATCH(request, { params }) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const result = await updateBookingStatus(params.id, payload.status, payload.assignedCleaners, payload.internalNotes);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ booking: result.booking }, { status: result.status });
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await deleteBooking(params.id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: result.status });
}
