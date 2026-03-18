import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            memberships: {
              include: { org: true },
              take: 1,
            },
          },
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (token.id) {
        const membership = await db.membership.findFirst({
          where: { userId: token.id as string },
          include: { org: true },
          orderBy: { joinedAt: "desc" },
        });

        if (membership) {
          token.role = membership.role;
          token.orgId = membership.orgId;
          token.orgType = membership.org.type;
        }

        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { disclaimerAcknowledgedAt: true },
        });
        token.disclaimerAcknowledged = !!dbUser?.disclaimerAcknowledgedAt;
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
});
