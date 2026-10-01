import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { achievement, certificatePdf, certificateUrl, publicCertificate, readCertificateSnapshot } from "./certificates";

describe("sample certificate PDF", () => {
  it("generates a landscape PDF with QR media and fits long candidate names", async () => {
    const bytes = await certificatePdf({ ...publicCertificate, candidate: "Ada Chiamaka Olabisi Okafor-Adeyemi " .repeat(3).trim() }, "https://example.org", await readFile("public/brand/muson.png"));
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 842, height: 595 });
    expect(bytes.length).toBeGreaterThan(3000);
  });
  it("shares a validated snapshot without relying on local storage", () => {
    const record = { ...publicCertificate, id: "issued", number: "MUSON-2026-1001" };
    const url = new URL(certificateUrl(record, "https://example.org"));
    expect(readCertificateSnapshot(url.searchParams.get("record"), record.number)).toMatchObject({ candidate: record.candidate, status: "valid", id: "shared-snapshot" });
    expect(readCertificateSnapshot(url.searchParams.get("record"), "OTHER")).toBeUndefined();
    expect(readCertificateSnapshot("not-json", record.number)).toBeUndefined();
    expect(readCertificateSnapshot(JSON.stringify([1, record.number, "Ada", "Theory", 5, 900, 0, "valid"]), record.number)).toBeUndefined();
    expect(achievement(86)).toBe("Distinction");
    expect(achievement(76)).toBe("Merit");
    expect(achievement(55)).toBe("Pass");
  });
});