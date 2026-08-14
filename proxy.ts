import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { User } from "better-auth";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  // 1. Fetch the session
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Unauthorized",
      }),
    );
  }

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isAdminRoute =
    nextUrl.pathname.startsWith("/api/admin") ||
    nextUrl.pathname.startsWith("/dashboard/admin");

  // 2. Guard: Unauthenticated users trying to access protected areas
  if ((isDashboardRoute || isAdminRoute) && !session) {
    const loginUrl = new URL("/auth/login", nextUrl);
    // Optional: Pass the current URL as a callback so they return after login
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Guard: Authenticated but unauthorized users trying to access Admin endpoints
  if (isAdminRoute) {
    // Structural Assumption: Your auth library returns a 'role' on the user object
    const user = session?.user as typeof session.user & Partial<User>;
    const userRole = user?.role;

    if (userRole !== "admin") {
      // For API routes, return a clean JSON error instead of a HTML redirect
      if (nextUrl.pathname.startsWith("/api/")) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            message: "Forbidden: Admin access required",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } },
        );
      }

      // For page routes, redirect to a 403 or dashboard home
      return NextResponse.redirect(
        new URL(`/dashboard/${userRole}`, request.url),
      );
    }
  }

  return NextResponse.next();
}

// FIX: Update matcher to catch all sub-routes using the named wildcard ':path*'
export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
};
