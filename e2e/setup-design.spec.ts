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
  await page.locator('.library-picker > summary').click();
  await page.getByRole("checkbox", { name: "群友派对之夜", exact: true }).check();
  await page.getByRole("button", { name: "挑战", exact: true }).click();
  await page.reload();
  await page.locator('.library-picker > summary').click();
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

test("library picker collapses by default, scrolls and preserves selection at 320px", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const picker = page.locator('details.library-picker');
  const summary = page.locator('.library-picker > summary');
  const group = page.getByRole("group", { name: "词库", exact: true });
  await expect(picker).not.toHaveAttribute("open");
  await expect(summary).toContainText("词库");
  await expect(summary).toContainText("原有精选");
  await expect(group).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await summary.click();
  await expect(picker).toHaveAttribute("open", "");
  await expect(group).toBeVisible();
  const scroll = await group.evaluate(element => {
    const style = getComputedStyle(element);
    return { maxHeight: style.maxHeight, overflowY: style.overflowY,
      height: element.clientHeight, contentHeight: element.scrollHeight };
  });
  expect(scroll.maxHeight).not.toBe("none");
  expect(parseFloat(scroll.maxHeight)).toBeGreaterThan(0);
  expect(scroll.overflowY).toMatch(/^(auto|scroll)$/);
  expect(scroll.contentHeight).toBeGreaterThan(scroll.height);
  expect(scroll.height).toBeLessThanOrEqual(parseFloat(scroll.maxHeight) + 1);
  await group.getByRole("checkbox").last().scrollIntoViewIfNeeded();
  expect(await group.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await group.getByRole("checkbox", { name: "群友派对之夜", exact: true }).check();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await summary.click();
  await expect(picker).not.toHaveAttribute("open");
  await expect(group).toBeHidden();
  await expect(summary).toContainText("原有精选 等 2 个");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(picker).not.toHaveAttribute("open");
  await expect(summary).toContainText("原有精选 等 2 个");
  await page.locator('.library-picker > summary').click();
  await expect(group.getByRole("checkbox", { name: "原有精选", exact: true })).toBeChecked();
  await expect(group.getByRole("checkbox", { name: "群友派对之夜", exact: true })).toBeChecked();
  await expect(group.locator('input:checked')).toHaveCount(2);
  expect(errors).toEqual([]);
});

test("at least one library remains selected", async ({ page }) => {
  await page.goto("/");
  await page.locator('.library-picker > summary').click();
  await expect(page.getByRole("checkbox", { name: "原有精选", exact: true })).toBeDisabled();
  await page.getByRole("checkbox", { name: "群友派对之夜", exact: true }).check();
  await page.getByRole("checkbox", { name: "原有精选", exact: true }).uncheck();
  await expect(page.getByRole("checkbox", { name: "群友派对之夜", exact: true })).toBeDisabled();
});
