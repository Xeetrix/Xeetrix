// Prisma reports both a missing DATABASE_URL and a transient connection
// failure as an opaque PrismaClientInitializationError, so callers can't
// tell "never configured" from "briefly unreachable" without checking the
// message. Route handlers used to label every DB failure as "not
// configured", which is actively misleading once the app is deployed with
// a working DATABASE_URL and the database just blips.
export function dbErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Environment variable not found: DATABASE_URL")) {
    return "Database not configured. Set DATABASE_URL in your environment.";
  }
  if (message.includes("Can't reach database server")) {
    return "Database temporarily unreachable. Please try again in a moment.";
  }
  return fallback;
}
