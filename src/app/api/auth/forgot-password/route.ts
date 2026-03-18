import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { sendEmail, passwordResetEmailHtml } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      // Always return success to avoid leaking user existence
      return NextResponse.json({ success: true });
    }

    const { email } = result.data;

    const user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      // Create password reset token (expires in 1 hour)
      const resetToken = await db.passwordResetToken.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken.token}`;

      await sendEmail({
        to: email,
        subject: "Password Reset - CCR Enforcement Training",
        html: passwordResetEmailHtml(resetUrl),
        templateId: "password-reset",
      });

      // Log the request
      await db.auditLog.create({
        data: {
          action: "PASSWORD_RESET_REQUESTED",
          actorId: user.id,
          metadata: { email },
        },
      });
    }

    // Always return success to avoid leaking whether user exists
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    // Still return success to avoid leaking information
    return NextResponse.json({ success: true });
  }
}
