import { describe, it, expect } from "vitest";
import { cn, formatDate, generateSerialNumber, slugify } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("merges tailwind classes correctly", () => {
    const result = cn("px-4 py-2", "px-6");
    expect(result).toContain("px-6");
    expect(result).toContain("py-2");
    expect(result).not.toContain("px-4");
  });
});

describe("formatDate", () => {
  it("formats a date in US format", () => {
    const date = new Date(2024, 5, 15); // June 15, 2024 in local time
    const result = formatDate(date);
    expect(result).toContain("June");
    expect(result).toContain("2024");
  });
});

describe("generateSerialNumber", () => {
  it("generates a serial number with correct format", () => {
    const serial = generateSerialNumber();
    expect(serial).toMatch(/^CCR-\d{4}-\d{5}$/);
  });

  it("includes the current year", () => {
    const serial = generateSerialNumber();
    const year = new Date().getFullYear().toString();
    expect(serial).toContain(year);
  });

  it("generates unique serial numbers", () => {
    const serials = new Set(Array.from({ length: 100 }, generateSerialNumber));
    expect(serials.size).toBeGreaterThan(90);
  });
});

describe("slugify", () => {
  it("converts text to a URL-safe slug", () => {
    expect(slugify("Sunset Ridge HOA")).toBe("sunset-ridge-hoa");
  });

  it("handles special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("foo---bar")).toBe("foo-bar");
  });
});
