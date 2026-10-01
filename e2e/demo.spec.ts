import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { questions } from "../src/lib/questions";
import { config } from "../src/lib/workflows";

async function checkpoint(page: Page, name: string) {
  await page.goto("/candidate/");
  await page.getByRole("button", { name: "Demo controls" }).click();
  await page.getByLabel("Load checkpoint").selectOption(name);
}

test.beforeEach(async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/login/");
  await page.getByText("Presentation workspaces", { exact: true }).click();
  await page.getByRole("button", { name: "Enter candidate demo" }).click();
  await expect(page).toHaveURL(/\/candidate\/?$/);
});

test("connected exam, publication, PDF, appeal and revocation", async ({ page, browser }, info) => {
  await page.goto("/candidate/register/");
  await page.getByRole("button", { name: "Add exam entries" }).click();
  await page.getByRole("button", { name: /Pay.*mock|mock.*payment/i }).click();
  await page.getByRole("button", { name: "Complete test payment" }).click();
  await page.goto("/candidate/theory/");
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Begin examination" }).click();
  const seen = new Set<string>();
  for (let index = 0; index < 12; index++) {
    await expect(page.getByText(`Question ${index + 1} of 12`, { exact: true })).toBeVisible();
    const prompt = await page.locator(".question h2").textContent();
    const question = questions.find(item => item.prompt === prompt)!;
    if (question.id === "pitch") {
      await expect(page.locator(".notation svg")).toBeVisible();
      await page.screenshot({ path: info.outputPath("theory-notation.png"), fullPage: true });
    }
    seen.add(question.id);
    await page.getByRole("radio", { name: question.correct, exact: true }).check();
    await page.getByRole("button", { name: index === 11 ? "Finish paper" : "Next question", exact: true }).click();
  }
  expect(seen.size).toBe(12);
  await expect(page.getByRole("heading", { name: "Your paper has been submitted." })).toBeVisible();
  await expect(page.locator(".score-number")).toContainText("100");
  await page.goto("/candidate/practical/");
  await page.getByRole("button", { name: "Use sample video" }).click();
  await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThan(0);
  await page.locator("video").evaluate((video: HTMLVideoElement) => video.play());
  await expect.poll(() => page.locator("video").evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Submit performance" }).click();
  await page.reload();
  await expect(page.getByText(/No replacement upload is permitted/)).toBeVisible();
  await page.goto("/examiner/marking/?id=ada-practical");
  for (const [index, value] of [23, 22, 23, 8].entries()) await page.getByLabel(config.rubric[index].name).fill(String(value));
  await page.getByLabel("Examiner comments").fill("A confident performance with clear phrasing.");
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.reload();
  await expect(page.getByLabel(config.rubric[0].name)).toHaveValue("23");
  await page.getByRole("button", { name: "Submit mark" }).click();
  await page.goto("/admin/integrity/");
  const ada = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Ada Okafor" }) });
  await ada.getByRole("textbox").fill("Reviewed demo session and cleared evidence.");
  await ada.getByRole("button", { name: "Clear session" }).click();
  await page.goto("/admin/results/");
  await expect(page.getByRole("row").filter({ hasText: "Kehinde Bello" })).toContainText("flagged");
  await page.getByRole("button", { name: "Publish 2 results" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Publish results", exact: true }).click();
  await page.goto("/admin/certificates/");
  await page.getByRole("button", { name: "Issue certificate" }).first().click();
  await expect(page.locator(".error-toast")).toContainText("3 to 7 days");
  await page.getByRole("button", { name: "Dismiss error" }).click();
  await page.getByRole("button", { name: "Demo controls" }).click();
  await page.getByRole("button", { name: "Advance 4 days" }).click();
  await page.getByRole("button", { name: "Issue certificate" }).first().click();
  await page.getByRole("button", { name: "Issue certificate" }).click();
  await page.goto("/candidate/results/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download sample PDF" }).first().click();
  const download = await downloadPromise;
  const pdf = await PDFDocument.load(await readFile((await download.path())!));
  expect(pdf.getPageCount()).toBe(1);
  await page.screenshot({ path: info.outputPath("results.png"), fullPage: true });
  const shareLink = await page.getByRole("link", { name: "Check certificate" }).first().getAttribute("href");
  const freshContext = await browser.newContext();
  try {
    const freshPage = await freshContext.newPage();
    await freshPage.goto(new URL(shareLink!, page.url()).href);
    await expect(freshPage.getByRole("heading", { name: "Shared sample certificate" })).toBeVisible();
    await expect(freshPage.getByText(/Shared snapshot, not an authenticated record/i)).toBeVisible();
  } finally { await freshContext.close(); }
  await page.goto("/verify/?number=MUSON-2026-1001");
  await expect(page.getByRole("heading", { name: "Valid sample certificate" })).toBeVisible();
  await page.goto("/candidate/appeals/");
  await page.getByLabel("Reason for appeal").fill("Please reconsider the interpretation mark for my second piece.");
  await page.getByRole("button", { name: "Submit appeal" }).click();
  await page.getByRole("button", { name: "Demo controls" }).click();
  await page.getByLabel("View as").selectOption("examiner-2");
  await page.getByRole("row").filter({ hasText: "Ada Okafor" }).getByRole("link", { name: "Open marking" }).click();
  for (const [index, value] of [25, 25, 24, 8].entries()) await page.getByLabel(config.rubric[index].name).fill(String(value));
  await page.getByLabel("Examiner comments").fill("Independent review supports a stronger interpretation mark.");
  await page.getByRole("button", { name: "Submit mark" }).click();
  await page.goto("/admin/appeals/");
  await page.getByRole("button", { name: "Approve review outcome" }).click();
  await expect(page.getByText(/Review complete: 76% to 82%/)).toBeVisible();
  await page.goto("/verify/?number=MUSON-2026-1002");
  await expect(page.getByRole("heading", { name: "Certificate superseded" })).toBeVisible();
  await page.goto("/admin/certificates/");
  await page.getByRole("button", { name: "Cancel certificate" }).click();
  await page.goto("/verify/?number=MUSON-2026-1001");
  await expect(page.getByRole("heading", { name: "Certificate cancelled" })).toBeVisible();
});

test("attempt survives reload and expires exactly once", async ({ page }) => {
  await page.clock.install();
  await checkpoint(page, "registered");
  await page.goto("/candidate/theory/");
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Begin examination" }).click();
  await expect(page.locator(".question")).toBeVisible();
  await page.locator(".brand").first().click();
  await expect(page).toHaveURL(/\/candidate\/theory\/?$/);
  await expect(page.locator(".error-toast")).toContainText("Submit your theory paper before leaving");
  await page.getByRole("button", { name: "Demo controls" }).click();
  await expect(page.getByLabel("Load checkpoint")).toBeDisabled();
  await expect(page.getByLabel("View as")).toBeDisabled();
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("muson-demo-v1")!).state.data.registrations.find((item: { id: string }) => item.id === "ada-theory").attempt);
  await page.reload();
  await expect(page.locator(".question")).toBeVisible();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("muson-demo-v1")!).state.data.registrations.find((item: { id: string }) => item.id === "ada-theory").attempt);
  expect(after.deadline).toBe(before.deadline);
  expect(after.order).toEqual(before.order);
  await page.clock.fastForward(13 * 60000);
  await expect(page.getByRole("heading", { name: "Your paper has been submitted." })).toBeVisible();
  await expect(page.locator(".score-number")).toContainText("0 / 100");
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("muson-demo-v1")!).state.data.registrations.find((item: { id: string }) => item.id === "ada-theory").scores.length)).toBe(1);
});

test("checkout cancellation and optional camera lifecycle", async ({ page }, info) => {
  await page.goto("/candidate/register/");
  await page.getByRole("button", { name: "Add exam entries" }).click();
  await page.getByRole("button", { name: "Pay mock fee", exact: true }).click();
  await page.getByRole("button", { name: "Simulate declined payment" }).click();
  await expect(page.getByRole("dialog")).toContainText("Nothing has been charged");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("muson-demo-v1")!).state.data.payments.length)).toBe(0);
  await page.getByRole("button", { name: "Pay mock fee", exact: true }).click();
  await page.getByRole("button", { name: "Complete test payment" }).click();
  await page.goto("/candidate/theory/");
  await page.evaluate(() => {
    let calls = 0;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", { value: async () => {
      if (++calls === 1) throw new DOMException("Test denial", "NotAllowedError");
      const canvas = document.createElement("canvas");
      canvas.width = 320; canvas.height = 180;
      canvas.getContext("2d")!.fillRect(0, 0, 320, 180);
      const stream = canvas.captureStream(5);
      (window as unknown as { demoTracks: MediaStreamTrack[] }).demoTracks = stream.getTracks();
      return stream;
    } });
  });
  await page.getByRole("button", { name: "Enable camera preview" }).click();
  await expect(page.getByText(/Camera unavailable or permission declined/)).toBeVisible();
  await page.getByRole("button", { name: "Enable camera preview" }).click();
  await expect(page.getByRole("button", { name: "Turn camera off" })).toBeVisible();
  await expect(page.getByLabel("Live camera preview")).toBeVisible();
  await page.screenshot({ path: info.outputPath("readiness.png"), fullPage: true });
  for (const checkbox of await page.getByRole("checkbox").all()) await checkbox.check();
  await page.getByRole("button", { name: "Begin examination" }).click();
  await expect(page.locator(".question")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { demoTracks: MediaStreamTrack[] }).demoTracks.every(track => track.readyState === "ended"))).toBe(true);
});