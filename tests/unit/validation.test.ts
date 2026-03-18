import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validation/auth";
import { createOrgSchema, createInviteSchema } from "@/lib/validation/admin";

describe("loginSchema", () => {
  it("validates correct input", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "notanemail",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates correct input", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("validates correct email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("createOrgSchema", () => {
  it("validates correct input", () => {
    const result = createOrgSchema.safeParse({
      name: "Sunset Ridge HOA",
      slug: "sunset-ridge",
      type: "HOA",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid slug", () => {
    const result = createOrgSchema.safeParse({
      name: "Test",
      slug: "Invalid Slug!",
      type: "HOA",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid org type", () => {
    const result = createOrgSchema.safeParse({
      name: "Test",
      slug: "test",
      type: "INVALID",
    });
    expect(result.success).toBe(false);
  });
});

describe("createInviteSchema", () => {
  it("validates invite with email", () => {
    const result = createInviteSchema.safeParse({
      email: "test@example.com",
      role: "LEARNER",
      orgId: "some-org-id",
    });
    expect(result.success).toBe(true);
  });

  it("validates invite without email (open enrollment)", () => {
    const result = createInviteSchema.safeParse({
      email: "",
      role: "LEARNER",
      orgId: "some-org-id",
    });
    expect(result.success).toBe(true);
  });
});
