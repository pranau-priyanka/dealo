import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const isolatedServer = Boolean(process.env.PLAYWRIGHT_PORT);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: { baseURL: `http://127.0.0.1:${port}`, trace: "on-first-retry" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: isolatedServer ? `npm run start -- --port ${port}` : "npm run dev",
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !isolatedServer && !process.env.CI,
  },
});
