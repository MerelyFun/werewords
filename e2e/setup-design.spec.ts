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

test("challenge theme persists and mayor candidates obey both selected filters", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "挑战", exact: true }).click();
  await page.getByRole("button", { name: /^奇妙器物/ }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "挑战", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^奇妙器物/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "无声预览流程", exact: true }).click();
  await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
  const candidates = page.locator(".word-options button");
  await expect(candidates).toHaveCount(3);
  const allowed = new Set(words.filter(word => word.difficulty === "hard" && word.category === "日常").map(word => word.text));
  const actual = (await candidates.allTextContents()).map(text => text.trim());
  expect(new Set(actual).size).toBe(3);
  expect(actual.every(text => allowed.has(text))).toBe(true);
});

test("party library source persists and supplies only selected level and theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByLabel("词库来源", { exact: true }).selectOption("party-night");
  await page.getByRole("button", { name: "困难", exact: true }).click();
  await page.getByRole("button", { name: /^网络/ }).click();
  await page.reload();
  await expect(page.getByLabel("词库来源", { exact: true })).toHaveValue("party-night");
  await expect(page.getByRole("button", { name: "困难", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".word-settings").screenshot({ path: ".audio-work/party-library.png" });
  await page.getByRole("button", { name: "无声预览流程", exact: true }).click();
  await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
  const candidates = page.locator(".word-options button");
  await expect(candidates).toHaveCount(3);
  const allowed = new Set(partyNight.words.filter(word => word.level === 3 && word.tag === "网络").map(word => word.w));
  expect((await candidates.allTextContents()).every(text => allowed.has(text.trim()))).toBe(true);
  expect(errors).toEqual([]);
});
