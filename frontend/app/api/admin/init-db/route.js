import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { bootstrapBookingDatabase } from "@/lib/booking-store";
import { runSqlFile } from "@/lib/db";

export async function POST() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await runSqlFile("seed.sql");
  const bookings = await bootstrapBookingDatabase();

  return NextResponse.json({
    ok: true,
    bookings: bookings.length
  });
}
