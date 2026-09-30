import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/login/");
  await page.getByText("Presentation workspaces", { exact: true }).click();
  await page.getByRole("button", { name: "Enter candidate demo" }).click();
  await expect(page).toHaveURL(/\/candidate\/?$/);
});

test("selected profile and document files survive a reload", async ({ page }) => {
  await page.goto("/candidate/profile/");
  await page.getByLabel("Profile photo (fictional image only)").setInputFiles("public/brand/muson.png");
  await expect(page.getByRole("img", { name: "Candidate profile photo" })).toBeVisible();
  await page.getByRole("button", { name: "Save profile" }).click();
  await page.reload();
  await expect.poll(() => page.getByRole("img", { name: "Candidate profile photo" }).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.goto("/candidate/application/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Upload SSCE results").setInputFiles("public/demo/document.pdf");
  await expect(page.getByText("document.pdf", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save draft" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("link", { name: "View document" }).first()).toHaveAttribute("href", /^blob:/);
});

test("Diploma submission, replacement, verification and scheduling", async ({ page }, info) => {
  await page.goto("/candidate/application/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  for (const button of await page.getByRole("button", { name: "Use sample document" }).all()) await button.click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Pay mock fee & submit" }).click();
  await expect(page.getByRole("heading", { name: "Your application is with MUSON." })).toBeVisible();
  await page.goto("/admin/application/?id=ada-diploma");
  await page.getByLabel("Note for SSCE results").fill("Please upload a clearer scan of the result sheet.");
  await page.getByRole("button", { name: "Request replacement" }).first().click();
  await page.getByLabel("Message to candidate").fill("Replace your SSCE scan before we can shortlist you.");
  await page.getByRole("button", { name: "Request more information" }).click();
  await page.goto("/candidate/application/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Please upload a clearer scan of the result sheet.")).toBeVisible();
  await page.getByRole("button", { name: "Use sample document" }).first().click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Pay mock fee & submit" }).click();
  await page.goto("/admin/application/?id=ada-diploma");
  for (const button of await page.getByRole("button", { name: "Verify", exact: true }).all()) await button.click();
  await page.getByLabel("Message to candidate").fill("Documents verified. We look forward to your entrance examination.");
  await page.getByRole("button", { name: "Shortlist candidate" }).click();
  await page.getByRole("link", { name: "Schedule entrance exam" }).click();
  await page.getByRole("button", { name: "Create slot" }).click();
  await page.getByRole("checkbox", { name: /Ada Okafor/ }).check();
  await page.getByRole("button", { name: "Assign selected candidates" }).click();
  await expect(page.getByText("1 / 10 places assigned")).toBeVisible();
  await page.goto("/candidate/application/");
  await expect(page.getByRole("heading", { name: "Your entrance examination is scheduled." })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/10:00 WAT/)).toBeVisible();
  await page.screenshot({ path: info.outputPath("admission.png"), fullPage: true });
});