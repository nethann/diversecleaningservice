import { NextResponse } from "next/server";
import { getAdminSession, deleteWorker, listAdminTeamMembers } from "@/lib/admin-auth";

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const result = await deleteWorker(params.id);
  if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

  const teamMembers = await listAdminTeamMembers();
  return NextResponse.json({ teamMembers });
}
