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

test("guests can browse deals without registering", async ({ page }) => {
  await page.goto("/en-GB/deals");
  await expect(page).toHaveURL(/\/en-GB\/deals$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Deals near you",
  );
});

test("guests can search public deals without registering", async ({ page }) => {
  await page.goto("/en-GB/deals");
  await page
    .getByRole("search")
    .getByLabel("Search deals")
    .fill("__dealo_no_match__");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=__dealo_no_match__/);
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    "No matching deals",
  );
});
