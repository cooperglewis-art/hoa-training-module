import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { rateLimitByIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation/auth";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET!
);

export async function POST(request: Request) {
  try {
    if (!(await rateLimitByIp(request, "auth:login", 10, 60_000))) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const rememberMe = body.rememberMe === true;

    const user = await db.user.findUnique({
      where: { email },
      include: {
        memberships: {
          include: { org: true },
          orderBy: { joinedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const membership = user.memberships[0];
    if (!membership) {
      return NextResponse.json(
        {
          error:
            "Your account is not assigned to an organization. Please contact your administrator.",
        },
        { status: 403 }
      );
    }

    // Session duration: 30 days if "remember me", 1 day otherwise
    const sessionDays = rememberMe ? 30 : 1;

    // Create a JWT token matching NextAuth's format
    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership?.role || null,
      orgId: membership?.orgId || null,
      orgType: membership?.org?.type || null,
      disclaimerAcknowledged: !!user.disclaimerAcknowledgedAt,
      sub: user.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${sessionDays}d`)
      .sign(secret);

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * sessionDays,
    });

    // Log login
    await db.auditLog.create({
      data: {
        action: "USER_LOGIN",
        actorId: user.id,
        orgId: membership?.orgId || null,
      },
    });

    return NextResponse.json({
      success: true,
      role: membership?.role || null,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
