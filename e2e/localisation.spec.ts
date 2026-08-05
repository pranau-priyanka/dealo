import { expect, test } from "@playwright/test";
test("defaults unsupported browser languages to en-GB", async ({ browser }) => {
  const context = await browser.newContext({ locale: "fr-FR" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/en-GB$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Local deals",
  );
});
test("detects Portuguese and persists an explicit switch", async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: "pt-PT" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/pt-PT$/);
  await page.getByLabel("Idioma").selectOption("en-GB");
  await expect(page).toHaveURL(/\/en-GB$/);
  await page.goto("/");
  await expect(page).toHaveURL(/\/en-GB$/);
});
