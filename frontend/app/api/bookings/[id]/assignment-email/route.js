import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { sendBookingAssignmentEmails } from "@/lib/booking-store";

export async function POST(request, { params }) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const result = await sendBookingAssignmentEmails(params.id, payload.assignedCleaners, payload.internalNotes);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(
    {
      booking: result.booking,
      emailedCount: result.emailedCount
    },
    { status: result.status }
  );
}
