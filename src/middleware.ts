import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET!
);

interface SessionPayload extends JWTPayload {
  id?: string;
  role?: string | null;
  orgId?: string | null;
  disclaimerAcknowledged?: boolean;
}

async function getSession(req: NextRequest) {
  const token = req.cookies.get("session-token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/debug"];
  const isPublic =
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/enroll/");
  const isApi = pathname.startsWith("/api/");

  if (isPublic || isApi) return NextResponse.next();

  const session = await getSession(req);

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = session.role ?? null;
  const disclaimerAcknowledged = !!session.disclaimerAcknowledged;
  const userId = session.id;

  if (!userId || !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

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

  // Pass session data via headers for layouts
  const response = NextResponse.next();
  response.headers.set("x-user-id", userId);
  response.headers.set("x-user-role", role || "");
  response.headers.set("x-user-org-id", session.orgId || "");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
