"use client";

import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";
import { APP_NAME, LAW_FIRM_NAME } from "@/lib/constants";

interface CertificatePreviewProps {
  userName: string;
  orgName: string;
  serialNumber: string;
  issuedAt: Date;
}

export function CertificatePreview({
  userName,
  orgName,
  serialNumber,
  issuedAt,
}: CertificatePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-auto w-full max-w-2xl"
    >
      <div
        className="relative aspect-[792/612] w-full overflow-hidden rounded-lg bg-white shadow-xl"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {/* Outer border */}
        <div className="absolute inset-[12px] rounded border-[3px] border-[#002060]" />

        {/* Inner border */}
        <div className="absolute inset-[18px] rounded border border-[#b8a872]" />

        {/* Top decorative line */}
        <div className="absolute left-[10%] right-[10%] top-[13%] h-[2px] bg-[#737852]" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[15%] text-center">
          {/* Title */}
          <h1
            className="text-[clamp(1rem,3vw,2.25rem)] font-bold leading-tight"
            style={{ color: "#002060" }}
          >
            Certificate of Completion
          </h1>

          {/* Subtitle */}
          <p
            className="mt-[3%] text-[clamp(0.5rem,1.5vw,1rem)] italic"
            style={{ color: "#675D4F" }}
          >
            This certifies that
          </p>

          {/* Name */}
          <p
            className="mt-[2%] text-[clamp(0.75rem,2.5vw,1.875rem)] font-bold leading-tight"
            style={{ color: "#002060" }}
          >
            {userName}
          </p>

          {/* Name underline */}
          <div className="mt-1 h-px w-[50%] bg-[#b8a872]" />

          {/* Organization */}
          <p
            className="mt-[2%] text-[clamp(0.5rem,1.5vw,1rem)]"
            style={{ color: "#675D4F" }}
          >
            of {orgName}
          </p>

          {/* Completion text */}
          <p className="mt-[3%] text-[clamp(0.5rem,1.3vw,1rem)] text-gray-500">
            has successfully completed the
          </p>

          {/* Course name */}
          <p
            className="mt-[1.5%] text-[clamp(0.6rem,1.8vw,1.375rem)] font-bold"
            style={{ color: "#737852" }}
          >
            {APP_NAME}
          </p>

          {/* Course description */}
          <p className="mt-[1%] text-[clamp(0.4rem,1.1vw,0.875rem)] italic text-gray-400">
            Texas HOA/POA/COA Governing Document Enforcement
          </p>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute bottom-[22%] left-[10%] right-[10%] h-[2px] bg-[#737852]" />

        {/* Footer section */}
        <div className="absolute bottom-[10%] left-[12%] right-[12%] flex items-end justify-between text-[clamp(0.35rem,0.9vw,0.75rem)] text-gray-500">
          <span>Date: {formatDate(issuedAt)}</span>
          <span
            className="text-center italic"
            style={{ color: "#675D4F" }}
          >
            Presented by {LAW_FIRM_NAME}
          </span>
          <span>Certificate No: {serialNumber}</span>
        </div>

        {/* Signature line */}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2 text-center">
          <div className="mx-auto mb-1 h-px w-32 bg-gray-400" />
          <span className="text-[clamp(0.3rem,0.7vw,0.5625rem)] text-gray-400">
            Authorized Signature
          </span>
        </div>
      </div>
    </motion.div>
  );
}
