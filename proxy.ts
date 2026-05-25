import { NextResponse, NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const isLoggedIn = !!(req as any).auth;
  const userRole = (req as any).auth?.user?.role;

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isVolunteerRoute = nextUrl.pathname.includes("/volunteer");
  const isUserRoute = nextUrl.pathname.includes("/user");
  const isAdminRoute = nextUrl.pathname.includes("/admin");
  const isAuthRoute =
    nextUrl.pathname === "/auth/login" || nextUrl.pathname === "/auth/register";

  // 1. Guard: If trying to access a protected dashboard route and NOT logged in
  // if (isDashboardRoute && !isLoggedIn) {
  //   // Redirect them to login, and remember where they were trying to go using callbackUrl
  //   const loginUrl = new URL("/auth/login", nextUrl);
  //   return NextResponse.redirect(loginUrl);
  // }

  // 2. Guard: Role-Based Authorization
  if (isVolunteerRoute && userRole !== "volunteer") {
    // If they are logged in but aren't a volunteer, kick them to the standard user space
    return NextResponse.redirect(new URL("/dashboard/user", nextUrl));
  }

  // 3. Guard: Prevent logged-in users from seeing login/register pages again
  if (isAuthRoute && isLoggedIn) {
    const destination =
      userRole === "volunteer"
        ? "/dashboard/volunteer"
        : userRole === "admin"
          ? "/dashboard/admin"
          : "/dashboard/user";
    return NextResponse.redirect(new URL(destination, nextUrl));
  }

  return NextResponse.next();
}

// Define exactly which URL paths should trigger this middleware file
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled separately or explicitly in route layers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
