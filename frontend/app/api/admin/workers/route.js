import { NextResponse } from "next/server";
import { getAdminSession, createWorker, listAdminTeamMembers } from "@/lib/admin-auth";

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { name } = await request.json();
  const result = await createWorker(name ?? "");

  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  const teamMembers = await listAdminTeamMembers();
  return NextResponse.json({ teamMembers }, { status: 201 });
}
