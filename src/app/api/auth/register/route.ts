import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validation/auth";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
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

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Handle invite token
    if (inviteToken) {
      const invite = await db.inviteToken.findUnique({
        where: { token: inviteToken },
        include: { org: true },
      });

      if (!invite || invite.usedAt || new Date() > invite.expiresAt) {
        // User created but invite invalid -- still allow registration
        // but don't create membership
      } else {
        await db.membership.create({
          data: {
            userId: user.id,
            orgId: invite.orgId,
            role: invite.role,
          },
        });

        await db.inviteToken.update({
          where: { id: invite.id },
          data: { usedAt: new Date() },
        });
      }
    }

    // Handle org slug enrollment
    if (orgSlug && !inviteToken) {
      const org = await db.organization.findUnique({
        where: { slug: orgSlug },
      });

      if (org && org.active) {
        await db.membership.create({
          data: {
            userId: user.id,
            orgId: org.id,
            role: "LEARNER",
          },
        });
      }
    }

    // Log registration
    await db.auditLog.create({
      data: {
        action: "USER_REGISTERED",
        actorId: user.id,
        metadata: {
          email: user.email,
          inviteToken: inviteToken || null,
          orgSlug: orgSlug || null,
        },
      },
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
