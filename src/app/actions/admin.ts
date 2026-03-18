"use server";

import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createOrgSchema, createInviteSchema } from "@/lib/validation/admin";
import { sendEmail, inviteEmailHtml } from "@/lib/email";

async function requireRole(role: "SUPER_ADMIN" | "ORG_ADMIN") {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const membership = await db.membership.findFirst({
    where: { userId: session.id },
    orderBy: { joinedAt: "desc" },
  });

  if (!membership) {
    throw new Error("No membership found");
  }

  if (role === "SUPER_ADMIN" && membership.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Super Admin access required");
  }

  if (
    role === "ORG_ADMIN" &&
    membership.role !== "ORG_ADMIN" &&
    membership.role !== "SUPER_ADMIN"
  ) {
    throw new Error("Forbidden: Org Admin access required");
  }

  return { userId: session.id, membership };
}

export async function createOrganization(data: {
  name: string;
  slug: string;
  type: "HOA" | "POA" | "COA";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const { userId } = await requireRole("SUPER_ADMIN");

  const parsed = createOrgSchema.parse(data);

  const existing = await db.organization.findUnique({
    where: { slug: parsed.slug },
  });
  if (existing) {
    throw new Error("An organization with this slug already exists");
  }

  const org = await db.organization.create({
    data: {
      name: parsed.name,
      slug: parsed.slug,
      type: parsed.type,
      contactName: parsed.contactName || null,
      contactEmail: parsed.contactEmail || null,
      contactPhone: parsed.contactPhone || null,
    },
  });

  await db.auditLog.create({
    data: {
      action: "ORG_CREATED",
      actorId: userId,
      orgId: org.id,
      metadata: { orgName: org.name, slug: org.slug },
    },
  });

  revalidatePath("/admin/organizations");
  return org;
}

export async function updateOrganization(
  orgId: string,
  data: {
    name?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    active?: boolean;
  }
) {
  const { userId } = await requireRole("SUPER_ADMIN");

  const org = await db.organization.update({
    where: { id: orgId },
    data,
  });

  await db.auditLog.create({
    data: {
      action: "ORG_UPDATED",
      actorId: userId,
      orgId: org.id,
      metadata: { updatedFields: Object.keys(data) },
    },
  });

  revalidatePath(`/admin/organizations/${orgId}`);
  revalidatePath("/admin/organizations");
  return org;
}

export async function createInvite(data: {
  email?: string;
  role?: "ORG_ADMIN" | "LEARNER";
  orgId: string;
}) {
  const { userId } = await requireRole("ORG_ADMIN");

  const parsed = createInviteSchema.parse(data);

  const org = await db.organization.findUnique({
    where: { id: parsed.orgId },
  });
  if (!org) {
    throw new Error("Organization not found");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await db.inviteToken.create({
    data: {
      email: parsed.email || null,
      role: parsed.role || "LEARNER",
      orgId: parsed.orgId,
      expiresAt,
    },
  });

  if (parsed.email) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
    await sendEmail({
      to: parsed.email,
      subject: `You're invited to ${org.name} - CCR Enforcement Training`,
      html: inviteEmailHtml(org.name, inviteUrl),
      templateId: "invite",
    });
  }

  await db.auditLog.create({
    data: {
      action: "INVITE_CREATED",
      actorId: userId,
      orgId: parsed.orgId,
      metadata: {
        email: parsed.email || "open invite",
        role: parsed.role || "LEARNER",
        token: invite.token,
      },
    },
  });

  revalidatePath("/org/invites");
  return invite;
}

export async function updateContent(
  lessonId: string,
  content: unknown,
  changelog?: string
) {
  const { userId } = await requireRole("SUPER_ADMIN");

  const latestVersion = await db.lessonContentVersion.findFirst({
    where: { lessonId },
    orderBy: { version: "desc" },
  });

  const newVersion = (latestVersion?.version ?? 0) + 1;

  const version = await db.lessonContentVersion.create({
    data: {
      lessonId,
      version: newVersion,
      content: content as any,
      changelog: changelog || null,
    },
  });

  await db.auditLog.create({
    data: {
      action: "CONTENT_UPDATED",
      actorId: userId,
      metadata: { lessonId, version: newVersion, changelog },
    },
  });

  revalidatePath(`/admin/content/${lessonId}`);
  revalidatePath("/admin/content");
  return version;
}

export async function publishContent(lessonId: string, versionId: string) {
  const { userId } = await requireRole("SUPER_ADMIN");

  const version = await db.lessonContentVersion.update({
    where: { id: versionId },
    data: { publishedAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      action: "CONTENT_PUBLISHED",
      actorId: userId,
      metadata: { lessonId, versionId, version: version.version },
    },
  });

  revalidatePath(`/admin/content/${lessonId}`);
  revalidatePath("/admin/content");
  return version;
}

export async function exportLearnersCSV(orgId: string): Promise<string> {
  await requireRole("ORG_ADMIN");

  const memberships = await db.membership.findMany({
    where: { orgId, role: "LEARNER" },
    include: {
      user: {
        include: {
          moduleProgress: {
            include: { module: true },
          },
          assessmentAttempts: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          certificates: {
            take: 1,
          },
        },
      },
    },
  });

  const totalModules = await db.module.count();

  const headers = [
    "Name",
    "Email",
    "Joined",
    "Modules Completed",
    "Assessment Status",
    "Assessment Score",
    "Certificate Serial",
  ];

  const rows = memberships.map((m) => {
    const completedModules = m.user.moduleProgress.filter(
      (mp) => mp.completedAt !== null
    ).length;
    const latestAttempt = m.user.assessmentAttempts[0];
    const cert = m.user.certificates[0];

    return [
      m.user.name,
      m.user.email,
      m.joinedAt.toISOString().split("T")[0],
      `${completedModules}/${totalModules}`,
      latestAttempt ? (latestAttempt.passed ? "Passed" : "Attempted") : "Not Started",
      latestAttempt ? `${latestAttempt.score}` : "",
      cert ? cert.serialNumber : "",
    ];
  });

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  return csv;
}
