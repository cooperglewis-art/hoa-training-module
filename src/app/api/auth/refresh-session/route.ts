import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { db } from "@/lib/db";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret"
);

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  let payload: any;
  try {
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  // Re-fetch user data
  const user = await db.user.findUnique({
    where: { id: payload.id },
    include: {
      memberships: { include: { org: true }, take: 1 },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const membership = user.memberships[0];

  const newToken = await new SignJWT({
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
    .setExpirationTime("30d")
    .sign(secret);

  cookieStore.set("session-token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ success: true });
}
