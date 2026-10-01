import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { z } from "zod";
import { asset, verificationUrl } from "./urls";
import { date, type Certificate } from "./workflows";

export const publicCertificate: Certificate = {
  id: "public-sample",
  institutionId: "muson",
  registrationId: "sample",
  number: "MUSON-DEMO-2026",
  candidate: "Ada Okafor",
  exam: "Grade 4 Music Theory",
  grade: 4,
  mark: 86,
  issuedAt: Date.parse("2026-05-20"),
  status: "valid",
};

export const achievement = (mark: number) => mark >= 80 ? "Distinction" : mark >= 65 ? "Merit" : mark >= 50 ? "Pass" : "Not passed";

const snapshotSchema = z.tuple([
  z.literal(1), z.string().min(1).max(80), z.string().min(1).max(240),
  z.string().min(1).max(120), z.number().int().min(0).max(8), z.number().min(0).max(100),
  z.number().int().min(0).max(4102444800000), z.enum(["valid", "cancelled", "superseded"]),
]);

export function certificateUrl(certificate: Certificate, origin: string) {
  const url = new URL(verificationUrl(certificate.number, origin));
  if (certificate.id !== "public-sample") url.searchParams.set("record", JSON.stringify([
    1, certificate.number, certificate.candidate, certificate.exam, certificate.grade,
    certificate.mark, certificate.issuedAt, certificate.status,
  ]));
  return url.toString();
}

export function readCertificateSnapshot(value: string | null, number: string): Certificate | undefined {
  if (!value || value.length > 2000) return;
  try {
    const parsed = snapshotSchema.safeParse(JSON.parse(value));
    if (!parsed.success || parsed.data[1] !== number) return;
    const [, recordNumber, candidate, exam, grade, mark, issuedAt, status] = parsed.data;
    return { id: "shared-snapshot", institutionId: "muson", registrationId: "snapshot", number: recordNumber, candidate, exam, grade, mark, issuedAt, status };
  } catch { return; }
}

export async function certificatePdf(certificate: Certificate, origin: string, logoBytes?: Uint8Array) {
  const document = await PDFDocument.create();
  const page = document.addPage([842, 595]);
  const regular = await document.embedFont(StandardFonts.TimesRoman);
  const bold = await document.embedFont(StandardFonts.TimesRomanBold);
  const italic = await document.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await document.embedFont(StandardFonts.Helvetica);
  const green = rgb(0.1, 0.3, 0.22);
  page.drawRectangle({
    x: 24,
    y: 24,
    width: 794,
    height: 547,
    borderWidth: 2,
    borderColor: green,
  });
  const line = (text: string, y: number, size: number, font = regular) => {
    const fittedSize = Math.min(size, size * 750 / Math.max(1, font.widthOfTextAtSize(text, size)));
    page.drawText(text, {
      x: (842 - font.widthOfTextAtSize(text, fittedSize)) / 2,
      y,
      size: fittedSize,
      font,
      color: green,
      maxWidth: 750,
    });
  };
  if (logoBytes) {
    const crest = await document.embedPng(logoBytes);
    page.drawRectangle({ x: 386, y: 485, width: 70, height: 70, color: green });
    page.drawImage(crest, { x: 389, y: 488, width: 64, height: 64 });
  }
  line("MUSICAL SOCIETY OF NIGERIA", 452, 26, bold);
  line("Certificate of Achievement", 411, 30);
  line("This sample certificate is awarded to", 375, 14);
  line(certificate.candidate, 333, 30, bold);
  line(certificate.exam, 296, 22);
  page.drawRectangle({ x: 285, y: 248, width: 272, height: 30, color: rgb(0.92, 0.95, 0.92) });
  line(achievement(certificate.mark).toUpperCase(), 257, 16, bold);
  line(
    `Score: ${certificate.mark}%  |  Issued: ${date(certificate.issuedAt)}`,
    224,
    14,
  );
  line(certificate.number, 201, 12, sans);
  const image = await document.embedPng(
    await QRCode.toDataURL(certificateUrl(certificate, origin), {
      margin: 2,
      width: 250,
    }),
  );
  page.drawImage(image, { x: 366, y: 82, width: 110, height: 110 });
  for (const [position, label] of [[95, "School Director"], [582, "Examinations Officer"]] as const) {
    page.drawText("Sample signature", { x: position, y: 145, size: 16, font: italic, color: green });
    page.drawLine({ start: { x: position, y: 135 }, end: { x: position + 165, y: 135 }, thickness: 0.7, color: green });
    page.drawText(label, { x: position, y: 115, size: 11, font: sans, color: green });
    page.drawText("Demonstration signatory", { x: position, y: 97, size: 9, font: sans, color: green });
  }
  line(
    `SAMPLE - NOT AN OFFICIAL QUALIFICATION - ${certificate.status.toUpperCase()}`,
    63,
    11,
    sans,
  );
  line(
    "QR shares a sample snapshot, not a live registry. Classification thresholds are illustrative.",
    43,
    10,
    sans,
  );
  return document.save();
}

export async function downloadCertificate(certificate: Certificate) {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || window.location.origin;
  const response = await fetch(asset("brand/muson.png"));
  if (!response.ok) throw new Error("The certificate crest could not be loaded. Please try again.");
  const bytes = await certificatePdf(certificate, origin, new Uint8Array(await response.arrayBuffer()));
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${certificate.number}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
