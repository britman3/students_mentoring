import { nanoid } from "nanoid";

/**
 * Generate a URL-safe magic link token.
 * Uses nanoid with 21 characters (default) for collision resistance.
 */
export function generateToken(): string {
  return nanoid(21);
}
