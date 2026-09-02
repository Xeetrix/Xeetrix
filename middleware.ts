import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // Any authenticated dashboard role (ADMIN, IMPORTER, EXPORTER) may enter
  // /admin — role-specific access (Users/Categories management stays
  // ADMIN-only) is enforced deeper in the tree, not here. Gating this on
  // role === "ADMIN" caused an infinite bounce for non-admin logins: they'd
  // authenticate successfully, land on /admin, get redirected straight
  // back to /admin/login, and appear stuck.
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
