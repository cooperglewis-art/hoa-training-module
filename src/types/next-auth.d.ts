import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
    role?: string | null;
    orgId?: string | null;
    orgType?: string | null;
    disclaimerAcknowledged?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    orgId?: string | null;
    orgType?: string | null;
    disclaimerAcknowledged?: boolean;
  }
}
