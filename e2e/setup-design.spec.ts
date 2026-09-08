import { test, expect } from "@playwright/test";
import { words } from "../src/words";
import partyNight from "../src/data/party-night.json" with { type: "json" };

test.beforeEach(async ({ page }) => {
  // Keep this setup check independent of audio loading and playback timing.
  await page.route("**/audio/manifest.json", route =>
    route.fulfill({ json: { ready: false, clips: [] } }),
  );
});

test("cover and every configured role have working artwork at narrow width", async ({ page, request }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const cover = page.locator(".cover-hero img");
  await expect(cover).toBeVisible();
  await expect.poll(() => cover.evaluate(image =>
    image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
  )).toBe(true);
  await page.locator(".role-settings summary").click();
  const rows = page.locator(".role-row");
  expect(await rows.count()).toBeGreaterThanOrEqual(7);
  const imageUrls = new Set<string>();
  for (const row of await rows.all()) {
    const art = row.locator(".role-art");
    await expect(art).toBeVisible();
    const background = await art.evaluate(element => getComputedStyle(element).backgroundImage);
    const match = background.match(/url\(["']?([^"')]+)["']?\)/);
    expect(match, "Every role should resolve to an illustration").not.toBeNull();
    imageUrls.add(match![1]!);
  }
  for (const url of imageUrls) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    expect(response.headers()["content-type"], url).toMatch(/^image\//);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("multiple libraries persist without counts or categories and supply challenge candidates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox", { name: "群友派对之夜", exact: true }).check();
  await page.getByRole("button", { name: "挑战", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "原有精选", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "群友派对之夜", exact: true })).toBeChecked();
  await expect(page.getByRole("group", { name: "词库主题", exact: true })).toHaveCount(0);
  expect(await page.locator(".word-settings").innerText()).not.toMatch(/\d+\s*词/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: ".audio-work/home-v2.png", fullPage: true });
  await page.getByRole("button", { name: "无声预览流程", exact: true }).click();
  await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
  const candidates = page.locator(".word-options button");
  await expect(candidates).toHaveCount(3);
  const allowed = new Set([...words.filter(word => word.difficulty === "hard").map(word => word.text),
    ...partyNight.words.filter(word => word.level === 3).map(word => word.w)]);
  const actual = (await candidates.allTextContents()).map(text => text.trim());
  expect(new Set(actual).size).toBe(3);
  expect(actual.every(text => allowed.has(text))).toBe(true);
});

test("at least one library remains selected", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("checkbox", { name: "原有精选", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: "群友派对之夜", exact: true }).check();
  await page.getByRole("checkbox", { name: "原有精选", exact: true }).uncheck();
  await expect(page.getByRole("checkbox", { name: "群友派对之夜", exact: true })).toBeDisabled();
});
