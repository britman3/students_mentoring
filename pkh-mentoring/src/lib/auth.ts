import { cookies } from "next/headers";
import crypto from "crypto";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "pkh_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || "default-secret-change-me";
}

function createSessionToken(): string {
  const payload = Date.now().toString();
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(payload);
  return `${payload}.${hmac.digest("hex")}`;
}

function verifySessionToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, signature] = parts;
  const hmac = crypto.createHmac("sha256", getSessionSecret());
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");
  if (signature !== expectedSignature) return false;
  const timestamp = parseInt(payload, 10);
  if (isNaN(timestamp)) return false;
  const age = (Date.now() - timestamp) / 1000;
  return age < SESSION_MAX_AGE;
}

export async function setSessionCookie(): Promise<void> {
  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export async function verifyPassword(password: string): Promise<boolean> {
  // Check against env var first (simple approach)
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword && password === envPassword) return true;

  // Check against hashed password in Settings
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return false;
    return compare(password, settings.adminPasswordHash);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    throw new Error(`Database connection failed: ${message}`);
  }
}
