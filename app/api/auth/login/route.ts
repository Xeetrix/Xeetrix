import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  const { email, password } = parsed.data;

  // 1. Try the database first.
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.isActive) {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        const token = await createSessionToken({
          sub: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
        const res = NextResponse.json({ ok: true });
        res.cookies.set(SESSION_COOKIE, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: SESSION_MAX_AGE,
        });
        return res;
      }
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
  } catch {
    // Database unreachable — fall through to the bootstrap admin check below.
  }

  // 2. Bootstrap admin login, only used before the database is provisioned
  //    or seeded. Configure ADMIN_EMAIL / ADMIN_PASSWORD in the environment.
  const bootstrapEmail = process.env.ADMIN_EMAIL;
  const bootstrapPassword = process.env.ADMIN_PASSWORD;
  if (bootstrapEmail && bootstrapPassword && email === bootstrapEmail && password === bootstrapPassword) {
    const token = await createSessionToken({
      sub: "bootstrap-admin",
      email: bootstrapEmail,
      name: "Xeetrix Admin",
      role: "ADMIN",
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  }

  return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
}
