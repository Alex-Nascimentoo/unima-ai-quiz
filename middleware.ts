import { NextRequest, NextResponse } from "next/server";
import { getUrl } from "./lib/getUrl";
import { updateSession, getSessionUser } from "./lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from auth page (and root) to the app
  if ((pathname === "/auth" && token) || (pathname === "/" && token)) {
    return NextResponse.redirect(new URL(getUrl("/app")));
  }

  // Require authentication for /app routes (and root)
  if ((pathname.startsWith("/app") && !token) || (pathname === "/" && !token)) {
    return NextResponse.redirect(new URL(getUrl("/auth")));
  }

  // Protect all /api routes except for public user registration
  if (
    pathname.startsWith("/api") &&
    pathname !== "/api/user/public/register" &&
    !token
  ) {
    return NextResponse.redirect(new URL(getUrl("/auth")));
  }

  // Admin-only protection for routes starting with /app/admin or /api/admin
  if (pathname.startsWith("/app/admin") || pathname.startsWith("/api/admin")) {
    // If there's no token, send to auth (covered above, but keep guard)
    if (!token) {
      return NextResponse.redirect(new URL(getUrl("/auth")));
    }

    try {
      const user = await getSessionUser(request);
      // If user is missing or not admin, redirect away
      if (!user) {
        return NextResponse.redirect(new URL(getUrl("/auth")));
      }
      if (user.role !== "admin") {
        // Redirect normal users to app homepage (or replace with a 403 page)
        return NextResponse.redirect(new URL(getUrl("/app")));
      }
    } catch (error) {
      // On any error verifying session, redirect to auth
      return NextResponse.redirect(new URL(getUrl("/auth")));
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
