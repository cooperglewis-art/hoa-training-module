import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";
import { rateLimitByIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!(await rateLimitByIp(request, "auth:register", 5, 60_000))) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const { inviteToken, orgSlug } = body as {
      inviteToken?: string;
      orgSlug?: string;
    };
    const normalizedInviteToken = inviteToken?.trim() || undefined;
    const normalizedOrgSlug = orgSlug?.trim() || undefined;

    // Require org context — no naked self-registration
    if (!normalizedInviteToken && !normalizedOrgSlug) {
      return NextResponse.json(
        { error: "Registration requires an invite link or organization enrollment link." },
        { status: 400 }
      );
    }

    if (normalizedInviteToken && normalizedOrgSlug) {
      return NextResponse.json(
        { error: "Use either an invite link or an enrollment link, not both." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const now = new Date();
    const invite = normalizedInviteToken
      ? await db.inviteToken.findUnique({
          where: { token: normalizedInviteToken },
          include: { org: true },
        })
      : null;
    const org = normalizedOrgSlug
      ? await db.organization.findUnique({
          where: { slug: normalizedOrgSlug },
        })
      : null;

    if (normalizedInviteToken) {
      if (!invite || invite.usedAt || now > invite.expiresAt) {
        return NextResponse.json(
          { error: "This invite link is invalid or expired." },
          { status: 400 }
        );
      }
      if (
        invite.email &&
        invite.email.toLowerCase() !== email.toLowerCase()
      ) {
        return NextResponse.json(
          { error: "This invite was issued for a different email address." },
          { status: 400 }
        );
      }
      if (!invite.org.active) {
        return NextResponse.json(
          { error: "This organization is not currently accepting enrollments." },
          { status: 400 }
        );
      }
    }

    if (normalizedOrgSlug) {
      if (!org || !org.active) {
        return NextResponse.json(
          { error: "This enrollment link is invalid or inactive." },
          { status: 400 }
        );
      }
    }

    const passwordHash = await hash(password, 12);

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      if (invite) {
        const currentInvite = await tx.inviteToken.findUnique({
          where: { id: invite.id },
        });

        if (
          !currentInvite ||
          currentInvite.usedAt ||
          new Date() > currentInvite.expiresAt
        ) {
          throw new Error("INVITE_NO_LONGER_VALID");
        }

        await tx.membership.create({
          data: {
            userId: user.id,
            orgId: invite.orgId,
            role: invite.role,
          },
        });

        await tx.inviteToken.update({
          where: { id: invite.id },
          data: { usedAt: new Date() },
        });
      } else if (org) {
        await tx.membership.create({
          data: {
            userId: user.id,
            orgId: org.id,
            role: "LEARNER",
          },
        });
      } else {
        throw new Error("MISSING_ENROLLMENT_CONTEXT");
      }

      await tx.auditLog.create({
        data: {
          action: "USER_REGISTERED",
          actorId: user.id,
          metadata: {
            email: user.email,
            inviteToken: normalizedInviteToken || null,
            orgSlug: normalizedOrgSlug || null,
          },
        },
      });

      return user;
    });

    // Send welcome email
    await sendEmail({
      to: email,
      subject: "Welcome to CCR Enforcement Training",
      html: welcomeEmailHtml(name),
      templateId: "welcome",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVITE_NO_LONGER_VALID") {
      return NextResponse.json(
        { error: "This invite link is no longer valid. Please request a new invite." },
        { status: 400 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
