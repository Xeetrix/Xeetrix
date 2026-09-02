import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "@/lib/auth";

/** Any authenticated dashboard user — ADMIN, IMPORTER, or EXPORTER. */
export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Strictly ADMIN — used for Users/Categories management, which stays admin-only. */
export async function getCurrentAdmin(): Promise<SessionPayload | null> {
  const session = await getCurrentUser();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
