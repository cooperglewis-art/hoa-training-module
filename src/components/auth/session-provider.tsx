"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  orgId: string | null;
  orgType: string | null;
  disclaimerAcknowledged: boolean;
}

interface SessionContextValue {
  user: SessionUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  status: "loading",
});

export function CustomSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatus] = useState<SessionContextValue["status"]>("loading");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  return (
    <SessionContext.Provider value={{ user, status }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
