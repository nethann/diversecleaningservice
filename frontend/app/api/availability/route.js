import { NextResponse } from "next/server";
import { getSlotSummaries } from "@/lib/booking-store";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date is required." }, { status: 400 });
  }

  const slotSummaries = await getSlotSummaries(date);
  return NextResponse.json({ slotSummaries });
}
