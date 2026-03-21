"use client";

import { useSession } from "@/components/auth/session-provider";

export function useCurrentUser() {
  const { user, status } = useSession();

  return {
    user: user ? { name: user.name, email: user.email } : undefined,
    role: user?.role ?? undefined,
    orgId: user?.orgId ?? undefined,
    orgType: user?.orgType ?? undefined,
    disclaimerAcknowledged: user?.disclaimerAcknowledged ?? undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
