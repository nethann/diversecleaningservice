import { NextResponse } from "next/server";
import { authenticateAdmin, createAdminSession } from "@/lib/admin-auth";

export async function POST(request) {
  const payload = await request.json();
  const username = payload.username ?? "";
  const password = payload.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Please enter both your admin name and password." }, { status: 400 });
  }

  const adminUser = await authenticateAdmin(username, password);

  if (!adminUser) {
    return NextResponse.json({ error: "The admin name or password did not match." }, { status: 401 });
  }

  await createAdminSession(adminUser);

  return NextResponse.json({
    ok: true,
    user: adminUser
  });
}
