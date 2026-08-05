import { expect, test } from "@playwright/test";
test("defaults unsupported browser languages to en-GB", async ({ browser }) => {
  const context = await browser.newContext({ locale: "fr-FR" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page).toHaveURL(/\/en-GB$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "best offers in Portugal",
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

test("uses a vertical navigation rail on laptop layouts", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
  });
  const page = await context.newPage();
  await page.goto("/en-GB");

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const navigationRail = primaryNavigation.locator("..");

  await expect(navigationRail).toHaveCSS("display", "flex");
  await expect(navigationRail).toHaveCSS("flex-direction", "column");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeHidden();
  await context.close();
});

test("guests are prompted to sign in before sharing a deal", async ({
  page,
}) => {
  await page.goto("/en-GB/submit");
  await expect(page).toHaveURL(/\/en-GB\/login\?message=sign-in-required/);
});

test("guests can browse deals without registering", async ({ page }) => {
  await page.goto("/en-GB/deals");
  await expect(page).toHaveURL(/\/en-GB\/deals$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Deals in Portugal",
  );
});

test("guests can search public deals without registering", async ({ page }) => {
  await page.goto("/en-GB/deals");
  await page.locator("#deal-search").fill("__dealo_no_match__");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=__dealo_no_match__/);
  await expect(page.getByRole("heading", { level: 2 })).toContainText(
    "No matching deals",
  );
});
