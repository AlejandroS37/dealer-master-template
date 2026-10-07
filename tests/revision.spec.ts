import { test, expect } from "@playwright/test";
async function skipSeen(page: import("@playwright/test").Page) {
  await page.addInitScript(() =>
    sessionStorage.setItem("dealer-intro-seen", "1"),
  );
}
async function seekIntro(page: import("@playwright/test").Page, time: number) {
  await page.locator(".intro-wrapper").evaluate((root, time) => {
    root.getAnimations({ subtree: true }).forEach((animation) => {
      animation.pause();
      animation.currentTime = time;
    });
  }, time);
}
test("supplied cinematic sequence, centered logo hold and continuous rise have a bounded deadline", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/?replayIntro=1");
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await expect(page.locator(".intro-brand img")).toHaveAttribute(
    "src",
    /Level%20Up%20Auto%20Sales%20Supercar%20Nightscape/,
  );
  await expect(page.locator(".intro-video")).toHaveAttribute("playsinline", "");
  await seekIntro(page, 700);
  expect(
    await page
      .locator(".intro-brand")
      .evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBe(0);
  expect(
    await page
      .locator(".intro-open")
      .evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBeCloseTo(1);
  await seekIntro(page, 1850);
  expect(
    await page
      .locator(".intro-burnout")
      .evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBeGreaterThan(0.7);
  await seekIntro(page, 3000);
  expect(
    await page
      .locator(".intro-smoke")
      .evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBe(1);
  const center = await page.locator(".intro-brand").boundingBox();
  expect(center!.y + center!.height / 2).toBeCloseTo(360, 0);
  expect(
    await page
      .locator(".intro-brand")
      .evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBe(1);
  await seekIntro(page, 4650);
  const raised = await page.locator(".intro-brand").boundingBox();
  expect(raised!.y).toBeLessThan(center!.y);
  expect(
    await page
      .locator(".cinematic")
      .evaluate((el) => el.getBoundingClientRect().bottom),
  ).toBeLessThan(400);
  await page.clock.fastForward(5000);
  await expect(page.locator(".intro-wrapper")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Shop inventory", exact: true }).first(),
  ).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});
test("skip persists across browser visits and query replay overrides it", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).click();
  const key = "dealer-intro-seen:level-up-demo:supplied-cinematic-v1";
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    "1",
  );
  await page.reload();
  await expect(page.locator(".intro-wrapper")).toHaveCount(0);
  const second = await context.newPage();
  await second.goto("/");
  await expect(second.locator(".intro-wrapper")).toHaveCount(0);
  await page.goto("/?replayIntro=1");
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".intro-wrapper")).toHaveCount(0);
  await second.close();
});
test("blocked video falls back to supplied still sequence and exits on time", async ({
  page,
}) => {
  await page.route("**/media/*.mp4", (route) => route.abort());
  await page.clock.install();
  await page.goto("/?replayIntro=1");
  await expect(page.locator(".intro-wrapper")).toHaveAttribute(
    "data-video-state",
    "fallback",
  );
  await expect(page.locator(".intro-open img")).toHaveAttribute(
    "src",
    /McLaren%20Wings/,
  );
  await seekIntro(page, 3000);
  await expect(page.locator(".intro-brand")).toBeVisible();
  await page.clock.fastForward(5000);
  await expect(page.locator(".intro-wrapper")).toHaveCount(0);
});
test("reduced motion skips replay and mobile logo fits the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?replayIntro=1");
  await expect(page.locator(".intro-wrapper")).toHaveCount(0);
  await expect(page.locator(".header .brand-image-frame")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?replayIntro=1");
  await seekIntro(page, 3000);
  const logo = await page.locator(".intro-brand").boundingBox();
  expect(logo!.x).toBeGreaterThanOrEqual(0);
  expect(logo!.x + logo!.width).toBeLessThanOrEqual(390);
  expect(logo!.y + logo!.height / 2).toBeCloseTo(422, 0);
  await page.getByRole("button", { name: "Skip intro" }).click();
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).resolves.toBe(true);
});
test("desktop sidebars follow below the header, scroll internally and stop before the footer", async ({
  page,
}) => {
  await skipSeen(page);
  await page.setViewportSize({ width: 1440, height: 720 });
  await page.goto("/inventory");
  await expect(page.locator(".vehicle-card")).toHaveCount(18);
  await page.evaluate(() => scrollTo(0, 1100));
  for (const selector of [".makes-sidebar", ".filters-sidebar"]) {
    const bounds = await page.locator(selector).boundingBox(),
      header = await page.locator(".header").boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(header!.height + 15);
    expect(bounds!.y).toBeLessThan(header!.height + 30);
    expect(bounds!.height).toBeLessThan(720 - header!.height);
    const scroll = await page.locator(selector).evaluate((el) => {
      el.scrollTop = el.scrollHeight;
      return {
        top: el.scrollTop,
        height: el.clientHeight,
        total: el.scrollHeight,
      };
    });
    expect(scroll.top).toBeGreaterThan(0);
    expect(scroll.total).toBeGreaterThan(scroll.height);
  }
  await page
    .locator(".filters-sidebar")
    .getByRole("checkbox", { name: "Saved vehicles only" })
    .isVisible();
  await page.locator("footer").scrollIntoViewIfNeeded();
  const footer = await page.locator("footer").boundingBox(),
    boundary = await page.locator(".inventory-layout").boundingBox();
  for (const selector of [".makes-sidebar", ".filters-sidebar"]) {
    const side = await page.locator(selector).boundingBox();
    expect(side!.y + side!.height).toBeLessThanOrEqual(
      boundary!.y + boundary!.height + 1,
    );
    expect(side!.y + side!.height).toBeLessThan(footer!.y);
  }
});
test("sticky controls remain interactive and preserve unrelated filters when results shrink", async ({
  page,
}) => {
  await skipSeen(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/inventory");
  await page.getByLabel("Max price").fill("90000");
  await page.evaluate(() => scrollTo(0, 1000));
  await page
    .locator(".makes-sidebar")
    .getByRole("button", { name: "BMW", exact: false })
    .click();
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await expect(page.getByLabel("Max price")).toHaveValue("90000");
  await page.getByLabel("Sidebar model").selectOption("X5");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await expect(page.locator(".card-title")).toContainText("BMW X5");
  await expect(page.getByLabel("Max price")).toHaveValue("90000");
  await expect(page).toHaveURL(/model=X5/);
  await page
    .locator(".makes-sidebar")
    .getByRole("button", { name: "All makes", exact: false })
    .click();
  await expect(page.getByLabel("Max price")).toHaveValue("90000");
  await expect(page.locator(".vehicle-card")).toHaveCount(17);
});
test("configured map destination, phone and contact form work with a real provider URL", async ({
  page,
}) => {
  await skipSeen(page);
  await page.route("https://maps.google.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>External map fixture</title><p>Map provider fixture</p>",
    }),
  );
  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: "VISIT LEVEL UP." }),
  ).toBeVisible();
  await expect(
    page.getByTitle("Interactive map for Level Up Auto Sales"),
  ).toHaveAttribute("src", /q=604\+Broadway%2C\+Newark%2C\+NJ\+07104/);
  await expect(
    page.getByRole("link", { name: "Get directions" }),
  ).toHaveAttribute("href", /goo\.gl\/maps\/K4DyrRSYqbZj4X4j9/);
  await expect(page.getByRole("link", { name: "Call dealer" })).toHaveAttribute(
    "href",
    "tel:(973) 688-8095",
  );
  await expect(page.getByText("604 Broadway")).toBeVisible();
  await expect(page.getByText("Newark NJ 07104")).toBeVisible();
  await expect(page.locator(".contact-form form")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const map = await page.locator(".dealer-map").boundingBox(),
    info = await page.locator(".location-information").boundingBox();
  expect(map!.y + map!.height).toBeLessThanOrEqual(info!.y + 1);
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).resolves.toBe(true);
});
test("blocked map degrades to useful external directions instead of a broken frame", async ({
  page,
}) => {
  await skipSeen(page);
  await page.route("https://maps.google.com/**", (route) => route.abort());
  await page.goto("/contact");
  await expect(
    page.getByText("The embedded map could not load."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Get directions" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open larger map" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Call dealer" })).toBeVisible();
});
test("configured supplied marble backgrounds appear on all layouts without overflow", async ({
  page,
}) => {
  await skipSeen(page);
  await page.route("https://maps.google.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Map fixture</title>",
    }),
  );
  for (const width of [390, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/inventory");
    expect(
      await page.evaluate(
        () => getComputedStyle(document.body, "::before").backgroundImage,
      ),
    ).toContain("Luxurious%20Black%20Gold%20Veined%20Marble");
    expect(
      await page
        .locator(".card-info")
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundImage),
    ).toContain("Luxury%20White%20Gold%20Veined%20Marble");
    await expect(
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).resolves.toBe(true);
  }
});
