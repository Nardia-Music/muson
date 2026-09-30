import { writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function ffmpeg(args) {
  const result = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: "inherit" },
  );
  if (result.error || result.status !== 0)
    throw result.error || new Error("ffmpeg failed");
}

ffmpeg([
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=261.6256:duration=1.1",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=391.9954:duration=1.1",
  "-filter_complex",
  "[0:a]afade=t=out:st=0.95:d=0.15[first];[1:a]afade=t=out:st=0.95:d=0.15[second];[first][second]concat=n=2:v=0:a=1",
  "public/demo/interval.wav",
]);
ffmpeg([
  "-loop",
  "1",
  "-i",
  "public/demo/piano.jpg",
  "-stream_loop",
  "-1",
  "-i",
  "public/demo/interval.wav",
  "-t",
  "8",
  "-vf",
  "scale=960:540:force_original_aspect_ratio=increase,crop=960:540",
  "-r",
  "24",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-movflags",
  "+faststart",
  "public/demo/performance.mp4",
]);

const pdf = await PDFDocument.create();
const page = pdf.addPage([595, 842]);
const font = await pdf.embedFont(StandardFonts.Helvetica);
const lines = [
  "MUSON PRESENTATION SAMPLE",
  "Fictional supporting document",
  "Candidate: Ada Okafor",
  "Reference: DEMO-2026-001",
  "Illustrative SSCE: 5 credits including English",
  "Illustrative music qualifications: Grade 5 theory and practical",
  "No actual examination body has issued this document.",
  "Not valid for admission, identification or certification.",
];
lines.forEach((text, index) =>
  page.drawText(text, {
    x: 45,
    y: 760 - index * 42,
    font,
    size: index === 0 ? 22 : 13,
    color: rgb(0.1, 0.3, 0.22),
  }),
);
await writeFile("public/demo/document.pdf", await pdf.save());
console.log("Generated interval.wav, performance.mp4 and document.pdf");
