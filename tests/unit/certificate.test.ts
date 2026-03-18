import { describe, it, expect } from "vitest";
import { generateCertificatePdf } from "@/lib/certificate";

describe("generateCertificatePdf", () => {
  it("generates a valid PDF buffer", async () => {
    const pdf = await generateCertificatePdf({
      userName: "Jane Doe",
      orgName: "Sunset Ridge HOA",
      serialNumber: "CCR-2024-12345",
      issuedAt: new Date("2024-06-15"),
    });

    expect(pdf).toBeInstanceOf(Uint8Array);
    expect(pdf.length).toBeGreaterThan(0);

    // Check PDF magic bytes
    const header = String.fromCharCode(...pdf.slice(0, 5));
    expect(header).toBe("%PDF-");
  });

  it("generates different PDFs for different users", async () => {
    const pdf1 = await generateCertificatePdf({
      userName: "Jane Doe",
      orgName: "Sunset Ridge HOA",
      serialNumber: "CCR-2024-12345",
      issuedAt: new Date("2024-06-15"),
    });

    const pdf2 = await generateCertificatePdf({
      userName: "John Smith",
      orgName: "Lakewood COA",
      serialNumber: "CCR-2024-67890",
      issuedAt: new Date("2024-07-01"),
    });

    expect(pdf1.length).not.toBe(pdf2.length);
  });
});
