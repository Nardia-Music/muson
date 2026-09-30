import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { verificationUrl } from "./urls";
import { date, type Certificate } from "./workflows";

export const publicCertificate: Certificate = {
  id: "public-sample",
  institutionId: "muson",
  registrationId: "sample",
  number: "MUSON-DEMO-2026",
  candidate: "Ada Okafor",
  exam: "Grade 5 Music Theory",
  grade: 5,
  mark: 86,
  issuedAt: Date.parse("2026-05-20"),
  status: "valid",
};

export async function certificatePdf(certificate: Certificate, origin: string) {
  const document = await PDFDocument.create();
  const page = document.addPage([842, 595]);
  const regular = await document.embedFont(StandardFonts.TimesRoman);
  const bold = await document.embedFont(StandardFonts.TimesRomanBold);
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
  line("MUSICAL SOCIETY OF NIGERIA", 490, 26, bold);
  line("Certificate of Achievement", 440, 32);
  line("This sample certificate is awarded to", 394, 14);
  line(certificate.candidate, 346, 30, bold);
  line(certificate.exam, 298, 22);
  line(
    `Score: ${certificate.mark}%  |  Issued: ${date(certificate.issuedAt)}`,
    260,
    14,
  );
  line(certificate.number, 227, 12, sans);
  const image = await document.embedPng(
    await QRCode.toDataURL(verificationUrl(certificate.number, origin), {
      margin: 2,
      width: 250,
    }),
  );
  page.drawImage(image, { x: 371, y: 103, width: 100, height: 100 });
  line(
    `SAMPLE - NOT AN OFFICIAL QUALIFICATION - ${certificate.status.toUpperCase()}`,
    72,
    11,
    sans,
  );
  line(
    "Presentation prototype. Browser-local records are not a public registry.",
    52,
    10,
    sans,
  );
  return document.save();
}

export async function downloadCertificate(certificate: Certificate) {
  const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN || window.location.origin;
  const bytes = await certificatePdf(certificate, origin);
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${certificate.number}.pdf`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
