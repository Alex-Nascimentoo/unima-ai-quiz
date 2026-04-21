import { NextRequest, NextResponse } from "next/server";
import { getUrl } from "./lib/getUrl";
import { updateSession } from "./lib/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const pathname = request.nextUrl.pathname;

  if ((pathname === "/auth" && token) || (pathname === "/" && token)) {
    return NextResponse.redirect(new URL(getUrl("/app")));
  }

  if ((pathname.includes("/app") && !token) || (pathname === "/" && !token)) {
    return NextResponse.redirect(new URL(getUrl("/auth")));
  }

  // Protect all /api routes except for user and printshop creation
  if (
    pathname.startsWith("/api") &&
    pathname !== "/api/user/public/register" &&
    !token
  ) {
    return NextResponse.redirect(new URL(getUrl("/auth")));
  }

  return await updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api/:path*"],
};
