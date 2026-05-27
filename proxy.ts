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