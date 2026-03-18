import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
  const isPublic = publicPaths.some((p) => pathname === p) || pathname.startsWith("/invite/") || pathname.startsWith("/enroll/");
  const isApi = pathname.startsWith("/api/");

  if (isPublic || isApi) return NextResponse.next();

  // Require auth for all other routes
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (session as any).role as string | undefined;
  const disclaimerAcknowledged = (session as any).disclaimerAcknowledged as boolean;

  // Disclaimer gate for learners
  if (role === "LEARNER" && !disclaimerAcknowledged && pathname !== "/disclaimer") {
    return NextResponse.redirect(new URL("/disclaimer", req.url));
  }

  // Route protection
  if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/org") && role !== "ORG_ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
