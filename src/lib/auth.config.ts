import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

type AppUser = User & {
  role?: string | null;
  orgId?: string | null;
  orgType?: string | null;
  disclaimerAcknowledged?: boolean;
};

type AppToken = JWT & {
  id?: string;
  role?: string | null;
  orgId?: string | null;
  orgType?: string | null;
  disclaimerAcknowledged?: boolean;
};

type AppSession = Session & {
  role?: string | null;
  orgId?: string | null;
  orgType?: string | null;
  disclaimerAcknowledged?: boolean;
};

// This file has NO Prisma imports — safe for Edge runtime
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers added in auth.ts (needs Prisma)
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as AppToken;
      if (user) {
        const appUser = user as AppUser;
        appToken.id = appUser.id;
        appToken.role = appUser.role ?? null;
        appToken.orgId = appUser.orgId ?? null;
        appToken.orgType = appUser.orgType ?? null;
        appToken.disclaimerAcknowledged = !!appUser.disclaimerAcknowledged;
      }
      return appToken;
    },
    async session({ session, token }) {
      const appSession = session as AppSession;
      const appToken = token as AppToken;
      if (session.user) {
        appSession.user.id = appToken.id as string;
        appSession.role = appToken.role ?? null;
        appSession.orgId = appToken.orgId ?? null;
        appSession.orgType = appToken.orgType ?? null;
        appSession.disclaimerAcknowledged = !!appToken.disclaimerAcknowledged;
      }
      return appSession;
    },
  },
} satisfies NextAuthConfig;
