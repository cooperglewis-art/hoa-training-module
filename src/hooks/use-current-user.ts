"use client";

import { useSession } from "next-auth/react";

export function useCurrentUser() {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    role: (session as any)?.role as string | undefined,
    orgId: (session as any)?.orgId as string | undefined,
    orgType: (session as any)?.orgType as string | undefined,
    disclaimerAcknowledged: (session as any)?.disclaimerAcknowledged as boolean | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
