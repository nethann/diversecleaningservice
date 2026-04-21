import { NextResponse } from "next/server";
import { getAdminSession, listAdminTeamMembers, updateAdminAvailability, WEEKDAYS } from "@/lib/admin-auth";

export async function GET() {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const teamMembers = await listAdminTeamMembers();

  return NextResponse.json({
    teamMembers,
    weekdays: WEEKDAYS
  });
}

export async function PUT(request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = await request.json();
  const selectedEntries = payload.selectedEntries ?? [];
  const blackoutDates = payload.blackoutDates ?? [];
  const targetUserId = payload.targetUserId ?? session.user.id;

  const teamMembers = await updateAdminAvailability(targetUserId, selectedEntries, blackoutDates);

  return NextResponse.json({
    ok: true,
    teamMembers
  });
}
