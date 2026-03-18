import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(2, "Organization name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  type: z.enum(["HOA", "POA", "COA"]),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

export const createInviteSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  role: z.enum(["ORG_ADMIN", "LEARNER"]).default("LEARNER"),
  orgId: z.string(),
});

export const updateContentSchema = z.object({
  lessonId: z.string(),
  content: z.any(),
  changelog: z.string().optional(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type CreateInviteInput = z.infer<typeof createInviteSchema>;
