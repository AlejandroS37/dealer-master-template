import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("dealer-intro-seen", "1"),
  );
});
test("shopping filters, reset, sorting, favorites, quick actions and lead context", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/inventory");
  await expect(page.locator(".vehicle-card")).toHaveCount(18);
  await page
    .locator(".makes-sidebar")
    .getByRole("button", { name: "BMW", exact: false })
    .click();
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await page.getByRole("button", { name: "X5", exact: true }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByLabel("Max price").fill("40000");
  await expect(
    page.getByText("No vehicles match these selections."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(18);
  await page.getByLabel("Sort vehicles").selectOption("price-asc");
  await expect(page.locator(".card-title").first()).toContainText(
    "Honda Civic",
  );
  await page.getByRole("button", { name: "Save 2020 Honda Civic" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unsave 2020 Honda Civic" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".quick-action").first().click();
  await page.getByRole("button", { name: "Get a quote", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("DEMO-016");
  await page.getByLabel("Name", { exact: true }).fill("Demo Shopper");
  await page.getByLabel("Email", { exact: true }).fill("demo@example.com");
  await page.getByLabel("Phone", { exact: true }).fill("5555550100");
  await page.getByRole("dialog").getByRole("checkbox").check();
  await page.getByRole("button", { name: "Simulate request" }).click();
  await expect(page.getByText("Demo request complete")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("vehicle deep link, gallery, live payment, input clamping and financing carry-over", async ({
  page,
}) => {
  await page.goto("/inventory/2023-porsche-911-1");
  await expect(
    page.getByRole("heading", { name: "Porsche 911", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/2023 Porsche 911/);
  await page.getByRole("button", { name: "Show image 2" }).click();
  await expect(page.locator(".gallery-main img")).toHaveAttribute(
    "src",
    "/images/about.jpg",
  );
  await page.getByRole("button", { name: "Open fullscreen gallery" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByLabel("Down payment dollars").fill("22580");
  await page.getByRole("button", { name: "60", exact: true }).click();
  await page.getByLabel("Estimated APR (%)").fill("0");
  await expect(page.locator(".payment-amount strong")).toContainText("$1,505");
  await page.getByLabel("Down payment dollars").fill("999999");
  await expect(page.getByLabel("Down payment dollars")).toHaveValue("112900");
  await page.getByLabel("Down payment dollars").fill("22580");
  await page.getByRole("link", { name: "Get pre-approved" }).click();
  await expect(page.locator(".flow-context")).toContainText("$22,580");
  await expect(page.locator(".flow-context")).toContainText("60 mo / 0%");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Down payment dollars")).toHaveValue("22580");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Sample full name").fill("Demo Shopper");
  await page.getByLabel("Sample email").fill("demo@example.com");
  await page.getByLabel("Sample phone").fill("5555550100");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Sample employment status").selectOption("Employed");
  await page.getByLabel("Fictional monthly income").fill("6000");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Complete demo application" }).click();
  await expect(
    page.getByText("Your demo application is complete."),
  ).toBeVisible();
});
test("complete trade flow with local photo preview", async ({ page }) => {
  await page.goto("/trade-in");
  await page.getByLabel("Year", { exact: true }).fill("2019");
  await page.getByLabel("Make", { exact: true }).fill("Honda");
  await page.getByLabel("Model", { exact: true }).fill("Accord");
  await page.getByLabel("Trim", { exact: true }).fill("Sport");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Mileage", { exact: true }).fill("72450");
  await page.getByLabel("Your own trade estimate").fill("15000");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Excellent", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Upload Front photo")
    .setInputFiles("public/images/sedan-small.jpg");
  await expect(page.getByAltText("Your trade, Front")).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Sample name").fill("Demo Owner");
  await page.getByLabel("Sample email").fill("owner@example.com");
  await page.getByLabel("Sample phone").fill("5555550100");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("2019 Honda Accord Sport")).toBeVisible();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Request trade value" }).click();
  await expect(
    page.getByText("Demo appraisal request complete."),
  ).toBeVisible();
});
test("mobile navigation, drawers, no overflow, swipe and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".cinematic")).toHaveCount(0);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator(".nav")
    .getByRole("link", { name: "Inventory", exact: true })
    .click();
  await page
    .locator(".mobile-filter-bar")
    .getByRole("button", { name: "Make All" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "BMW", exact: false })
    .click();
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await page
    .locator(".mobile-filter-bar")
    .getByRole("button", { name: "Model All" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "X5", exact: true })
    .click();
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(
    page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).resolves.toBe(true);
  await page.locator(".card-title").click();
  await expect(
    page.getByRole("heading", { name: "BMW X5", exact: true }),
  ).toBeVisible();
  await expect(
    page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).resolves.toBe(true);
});
test("missing-image fallback and accessible immediate intro skip", async ({
  page,
}) => {
  await page.route("**/images/**", (route) => route.abort());
  await page.goto("/inventory");
  await expect(page.locator(".photo-fallback").first()).toBeVisible();
  await page.evaluate(() => sessionStorage.removeItem("dealer-intro-seen"));
  await page.locator(".header-top").getByRole("link", { name: /home/ }).click();
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(page.locator(".cinematic")).toHaveCount(0);
});

test("empty inventory is a useful state, not a broken page", async ({
  page,
}) => {
  await page.route("**/src/data/inventory.ts", async (route) => {
    await route.fulfill({
      contentType: "application/javascript",
      body: "export const inventory=[]; export const demoInventoryAdapter={list:async()=>[],getBySlug:async()=>undefined};",
    });
  });
  await page.goto("/inventory");
  await expect(page.locator(".vehicle-card")).toHaveCount(0);
  await expect(
    page.getByText("No vehicles match these selections."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await expect(
    page.getByText("No vehicles match these selections."),
  ).toBeVisible();
});
test("external financing mode passes vehicle context to the configured provider", async ({
  page,
}) => {
  await page.route("**/src/config/dealerConfig.ts*", async (route) => {
    const response = await route.fetch();
    const body = (await response.text())
      .replace('mode: "built-in"', 'mode: "external"')
      .replace(
        'providerURL: ""',
        'providerURL: "https://provider.example/apply"',
      );
    await route.fulfill({ response, body });
  });
  await page.goto("/inventory/2023-porsche-911-1");
  await page.getByRole("link", { name: "Get approved", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Apply with our financing partner." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue to provider" }),
  ).toHaveAttribute("href", /stock=DEMO-001/);
});
test("mobile quick actions and filters retain keyboard focus while typing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/inventory");
  await page
    .locator(".mobile-filter-bar")
    .getByRole("button", { name: "Filters" })
    .click();
  const keyword = page.getByRole("dialog").getByPlaceholder("Search vehicles");
  await keyword.pressSequentially("Porsche");
  await expect(keyword).toHaveValue("Porsche");
  await expect(keyword).toBeFocused();
  await page.getByRole("button", { name: "Show 3 vehicles" }).click();
  await page.locator(".quick-action").first().click();
  await expect(
    page.getByRole("dialog", { name: "Quick actions" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm availability", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Confirm availability" }),
  ).toContainText("DEMO-001");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("slider keyboard control, all makes reset, and mobile gallery swipe", async ({
  page,
}) => {
  await page.goto("/inventory");
  await page
    .locator(".makes-sidebar")
    .getByRole("button", { name: "BMW", exact: false })
    .click();
  await page.getByRole("button", { name: "All makes", exact: false }).click();
  await expect(page.locator(".vehicle-card")).toHaveCount(18);
  await page.goto("/inventory/2023-porsche-911-1");
  const slider = page.getByLabel("Down payment", { exact: true });
  await slider.focus();
  await slider.press("Home");
  await slider.press("ArrowRight");
  await expect(page.getByLabel("Down payment dollars")).toHaveValue("1");
  await slider.press("End");
  await expect(page.getByLabel("Down payment dollars")).toHaveValue("112900");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".gallery-main").dispatchEvent("touchstart", {
    touches: [{ identifier: 0, clientX: 300, clientY: 300 }],
  });
  await page.locator(".gallery-main").dispatchEvent("touchend", {
    changedTouches: [{ identifier: 0, clientX: 100, clientY: 300 }],
  });
  await expect(page.locator(".gallery-counter")).toContainText("02 / 03");
});

test("all routes render at phone, tablet and desktop widths without overflow or runtime errors", async ({
  page,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/inventory",
      "/inventory/2023-porsche-911-1",
      "/financing",
      "/trade-in",
      "/about",
      "/contact",
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).resolves.toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
