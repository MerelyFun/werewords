import { test, expect } from "@playwright/test";
import { getWordLibrary } from "../src/words";

for (const sourceId of ["3022451195", "3416324742", "2660283448", "2890545389"]) {
  test(`Steam ${sourceId} 选库、刷新和全池选词`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width: 320, height: 740 });
    await page.route("**/audio/manifest.json", route => route.fulfill({ json: { ready: false, clips: [] } }));
    await page.goto("/");
    await page.locator('.library-picker > summary').click();
    const libraryId = `steam-${sourceId}`;
    await page.getByRole("checkbox", { name: getWordLibrary(libraryId).name, exact: true }).check();
    await page.getByRole("checkbox", { name: "原有精选", exact: true }).uncheck();
    await page.reload();
    await page.locator('.library-picker > summary').click();
    await expect(page.getByRole("checkbox", { name: getWordLibrary(libraryId).name, exact: true })).toBeChecked();
    await expect(page.getByRole("button", { name: /^(标准|挑战)$/ })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "无声预览流程", exact: true }).click();
    await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
    const candidates = page.locator(".word-options button");
    await expect(candidates).toHaveCount(3);
    const allowed = new Set(getWordLibrary(libraryId).words.map(word => word.text));
    const actual = (await candidates.allTextContents()).map(text => text.trim());
    expect(actual.every(text => allowed.has(text))).toBe(true);
    expect(new Set(actual).size).toBe(3);
    expect(errors).toEqual([]);
  });
}
