import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "dev-secret"
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  orgId: string | null;
  orgType: string | null;
  disclaimerAcknowledged: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: (payload.role as string) || null,
      orgId: (payload.orgId as string) || null,
      orgType: (payload.orgType as string) || null,
      disclaimerAcknowledged: !!payload.disclaimerAcknowledged,
    };
  } catch {
    return null;
  }
}
