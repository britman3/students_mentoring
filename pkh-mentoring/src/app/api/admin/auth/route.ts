import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, clearSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body;
  if (!password) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  try {
    const valid = await verifyPassword(password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    setSessionCookie(response);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Admin auth error:", message);
    return NextResponse.json(
      { error: "Unable to verify password. Check database connection." },
      { status: 503 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(response);
  return response;
}
