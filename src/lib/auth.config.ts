import type { NextAuthConfig } from "next-auth";

// This file has NO Prisma imports — safe for Edge runtime
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers added in auth.ts (needs Prisma)
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.orgId = (user as any).orgId;
        token.orgType = (user as any).orgType;
        token.disclaimerAcknowledged = (user as any).disclaimerAcknowledged;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).role = token.role;
        (session as any).orgId = token.orgId;
        (session as any).orgType = token.orgType;
        (session as any).disclaimerAcknowledged = token.disclaimerAcknowledged;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
