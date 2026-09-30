import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 60000,
  retries: 0,
  reporter: "list",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:4173", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: { command: "npm run preview -- --no-clipboard", url: "http://localhost:4173", reuseExistingServer: true },
});