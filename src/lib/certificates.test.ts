import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { certificatePdf, publicCertificate } from "./certificates";

describe("sample certificate PDF", () => {
  it("generates a landscape PDF with QR media and fits long candidate names", async () => {
    const bytes = await certificatePdf({ ...publicCertificate, candidate: "Ada Chiamaka Olabisi Okafor-Adeyemi " .repeat(3).trim() }, "https://example.org");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 842, height: 595 });
    expect(bytes.length).toBeGreaterThan(3000);
  });
});