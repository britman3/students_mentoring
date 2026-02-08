import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { compare, hash } from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Verify current password against env var first, then hash
    const envPassword = process.env.ADMIN_PASSWORD;
    let currentValid = false;

    if (envPassword && currentPassword === envPassword) {
      currentValid = true;
    } else {
      currentValid = await compare(currentPassword, settings.adminPasswordHash);
    }

    if (!currentValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password and update
    const newHash = await hash(newPassword, 12);
    await prisma.settings.update({
      where: { id: settings.id },
      data: { adminPasswordHash: newHash },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
