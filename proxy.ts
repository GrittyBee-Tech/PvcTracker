import { NextRequest, NextResponse } from "next/server";

const authPages = ["/auth/login", "/auth/register", "/verify-email"];
const protectedPaths = ["/dashboard"];

function getDashboardDestination(role?: string) {
  if (role === "admin") return "/dashboard/admin";
  if (role === "volunteer") return "/dashboard/volunteer";
  return "/dashboard/user";
}

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  // 1. Guard: If trying to access a protected dashboard route and NOT logged in
  if (isDashboardRoute && !session) {
    // Redirect them to login, and remember where they were trying to go using callbackUrl
    const loginUrl = new URL("/auth/login", nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};

// export async function proxy(request: NextRequest) {
//   const { nextUrl: url } = request;
//   const pathname = url.pathname;

//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/static") ||
//     pathname.startsWith("/favicon.ico") ||
//     PUBLIC_FILE.test(pathname)
//   ) {
//     return NextResponse.next();
//   }

//   const token = await getToken({
//     req: request,
//     secret: authSecret,
//   });

//   if (protectedPaths.some((path) => pathname.startsWith(path))) {
//     if (!token) {
//       const loginUrl = new URL("/auth/login", url);
//       loginUrl.searchParams.set("callbackUrl", pathname + url.search);
//       return NextResponse.redirect(loginUrl);
//     }
//     return NextResponse.next();
//   }

//   if (authPages.some((path) => pathname.startsWith(path)) && token) {
//     return NextResponse.redirect(
//       new URL(getDashboardDestination(token.role), url),
//     );
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/auth/:path*", "/verify-email"],
// };
