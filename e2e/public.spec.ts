import { test, expect } from "@playwright/test";

test("public deep links, assets, sample verification and responsive layout", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const path of ["/", "/diploma/", "/graded-exams/", "/basic-school/", "/about/", "/contact/", "/login/", "/roadmap/", "/candidate/", "/admin/", "/examiner/"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect.poll(() => page.locator("img").evaluateAll(images => images.every(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (["/", "/candidate/", "/admin/"].includes(path)) await page.screenshot({ path: info.outputPath(`${path.replaceAll("/", "") || "home"}.png`), fullPage: true });
  }
  await page.goto("/verify/?number=MUSON-DEMO-2026");
  await expect(page.getByRole("heading", { name: "Valid sample certificate" })).toBeVisible();
  await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
  await page.getByLabel("Certificate number").fill("NOT-A-CERTIFICATE");
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(page.getByText(/No record found/)).toBeVisible();
  for (const path of ["/demo/interval.wav", "/demo/notation.svg", "/demo/document.pdf", "/demo/performance.mp4"]) expect((await page.request.get(path)).status()).toBe(200);
  expect(errors).toEqual([]);
});