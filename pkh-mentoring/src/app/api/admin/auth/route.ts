import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, clearSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || !(await verifyPassword(password))) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await setSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
