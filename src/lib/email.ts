import { Resend } from "resend";
import { db } from "./db";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

function getAppUrl(): string {
  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/+$/, "")}`;
  }

  return "http://localhost:3000";
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  templateId: string;
  attachments?: { filename: string; content: Buffer }[];
}

export async function sendEmail({ to, subject, html, templateId, attachments }: SendEmailOptions) {
  const emailLog = await db.emailLog.create({
    data: { to, subject, templateId, status: "PENDING" },
  });

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    await db.emailLog.update({
      where: { id: emailLog.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    await db.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
    console.error("Email send failed:", error);
  }
}

export function inviteEmailHtml(orgName: string, inviteUrl: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #002060;">You're Invited to CCR Enforcement Training</h1>
      <p>You've been invited by <strong>${orgName}</strong> to complete the CCR Enforcement Training program.</p>
      <p>Click the link below to create your account and get started:</p>
      <a href="${inviteUrl}" style="display: inline-block; background: #737852; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Accept Invitation</a>
      <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days.</p>
    </div>
  `;
}

export function welcomeEmailHtml(name: string) {
  const appUrl = getAppUrl();
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #002060;">Welcome to CCR Enforcement Training</h1>
      <p>Hello ${name},</p>
      <p>Your account has been created successfully. You can now log in and begin your training.</p>
      <p>The program consists of 3 interactive modules followed by a case study assessment. Upon passing, you'll receive a certificate of completion.</p>
      <a href="${appUrl}/login" style="display: inline-block; background: #737852; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Log In</a>
    </div>
  `;
}

export function certificateEmailHtml(name: string) {
  const appUrl = getAppUrl();
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #002060;">Congratulations, ${name}!</h1>
      <p>You have successfully completed the CCR Enforcement Training program.</p>
      <p>Your certificate of completion is attached to this email. You can also download it from your dashboard at any time.</p>
      <a href="${appUrl}/dashboard" style="display: inline-block; background: #737852; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Dashboard</a>
    </div>
  `;
}

export function passwordResetEmailHtml(resetUrl: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #002060;">Password Reset</h1>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; background: #737852; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
}
