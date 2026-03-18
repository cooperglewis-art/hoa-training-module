import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { LAW_FIRM_NAME, APP_NAME } from "./constants";
import { formatDate } from "./utils";

interface CertificateData {
  userName: string;
  orgName: string;
  serialNumber: string;
  issuedAt: Date;
}

export async function generateCertificatePdf(data: CertificateData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([792, 612]); // Landscape letter

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRomanItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const navy = rgb(0, 0.125, 0.376); // #002060
  const olive = rgb(0.451, 0.471, 0.322); // #737852
  const brown = rgb(0.404, 0.365, 0.31); // #675D4F
  const gold = rgb(0.72, 0.65, 0.45);

  // Border
  const borderMargin = 30;
  page.drawRectangle({
    x: borderMargin,
    y: borderMargin,
    width: width - 2 * borderMargin,
    height: height - 2 * borderMargin,
    borderColor: navy,
    borderWidth: 3,
  });

  // Inner border
  const innerMargin = 40;
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: width - 2 * innerMargin,
    height: height - 2 * innerMargin,
    borderColor: gold,
    borderWidth: 1,
  });

  // Top decorative line
  page.drawLine({
    start: { x: 80, y: height - 80 },
    end: { x: width - 80, y: height - 80 },
    color: olive,
    thickness: 2,
  });

  // Title: "Certificate of Completion"
  const titleText = "Certificate of Completion";
  const titleWidth = timesRomanBold.widthOfTextAtSize(titleText, 36);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 130,
    size: 36,
    font: timesRomanBold,
    color: navy,
  });

  // Subtitle
  const subtitleText = "This certifies that";
  const subtitleWidth = timesRomanItalic.widthOfTextAtSize(subtitleText, 16);
  page.drawText(subtitleText, {
    x: (width - subtitleWidth) / 2,
    y: height - 175,
    size: 16,
    font: timesRomanItalic,
    color: brown,
  });

  // Learner name
  const nameWidth = timesRomanBold.widthOfTextAtSize(data.userName, 30);
  page.drawText(data.userName, {
    x: (width - nameWidth) / 2,
    y: height - 220,
    size: 30,
    font: timesRomanBold,
    color: navy,
  });

  // Name underline
  page.drawLine({
    start: { x: 200, y: height - 228 },
    end: { x: width - 200, y: height - 228 },
    color: gold,
    thickness: 1,
  });

  // Organization
  const orgText = `of ${data.orgName}`;
  const orgWidth = timesRoman.widthOfTextAtSize(orgText, 16);
  page.drawText(orgText, {
    x: (width - orgWidth) / 2,
    y: height - 260,
    size: 16,
    font: timesRoman,
    color: brown,
  });

  // Completion text
  const completionText = "has successfully completed the";
  const completionWidth = timesRoman.widthOfTextAtSize(completionText, 16);
  page.drawText(completionText, {
    x: (width - completionWidth) / 2,
    y: height - 300,
    size: 16,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Course title
  const courseText = APP_NAME;
  const courseWidth = timesRomanBold.widthOfTextAtSize(courseText, 22);
  page.drawText(courseText, {
    x: (width - courseWidth) / 2,
    y: height - 335,
    size: 22,
    font: timesRomanBold,
    color: olive,
  });

  // Course description
  const descText = "Texas HOA/POA/COA Governing Document Enforcement";
  const descWidth = timesRomanItalic.widthOfTextAtSize(descText, 14);
  page.drawText(descText, {
    x: (width - descWidth) / 2,
    y: height - 360,
    size: 14,
    font: timesRomanItalic,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Bottom decorative line
  page.drawLine({
    start: { x: 80, y: 140 },
    end: { x: width - 80, y: 140 },
    color: olive,
    thickness: 2,
  });

  // Date
  const dateText = `Date: ${formatDate(data.issuedAt)}`;
  page.drawText(dateText, {
    x: 100,
    y: 110,
    size: 12,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Serial number
  const serialText = `Certificate No: ${data.serialNumber}`;
  const serialWidth = helvetica.widthOfTextAtSize(serialText, 12);
  page.drawText(serialText, {
    x: width - 100 - serialWidth,
    y: 110,
    size: 12,
    font: helvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Law firm
  const firmText = `Presented by ${LAW_FIRM_NAME}`;
  const firmWidth = timesRomanItalic.widthOfTextAtSize(firmText, 12);
  page.drawText(firmText, {
    x: (width - firmWidth) / 2,
    y: 80,
    size: 12,
    font: timesRomanItalic,
    color: brown,
  });

  // Signature line
  page.drawLine({
    start: { x: width / 2 - 100, y: 60 },
    end: { x: width / 2 + 100, y: 60 },
    color: rgb(0.3, 0.3, 0.3),
    thickness: 0.5,
  });

  const sigText = "Authorized Signature";
  const sigWidth = helvetica.widthOfTextAtSize(sigText, 9);
  page.drawText(sigText, {
    x: (width - sigWidth) / 2,
    y: 48,
    size: 9,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdfDoc.save();
}
