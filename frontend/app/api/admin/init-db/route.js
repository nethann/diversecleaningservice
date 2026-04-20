import { NextResponse } from "next/server";
import { bootstrapBookingDatabase } from "@/lib/booking-store";
import { runSqlFile } from "@/lib/db";

export async function POST() {
  await runSqlFile("seed.sql");
  const bookings = await bootstrapBookingDatabase();

  return NextResponse.json({
    ok: true,
    bookings: bookings.length
  });
}
