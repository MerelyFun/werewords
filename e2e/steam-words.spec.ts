import { test, expect } from "@playwright/test";
import { getWordLibrary } from "../src/words";

for (const sourceId of ["3022451195", "3416324742"]) {
  test(`Steam ${sourceId} 选库、切难度、刷新和选词`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.setViewportSize({ width: 320, height: 740 });
    await page.route("**/audio/manifest.json", route => route.fulfill({ json: { ready: false, clips: [] } }));
    await page.goto("/");
    const libraryId = `steam-${sourceId}`;
    await page.getByLabel("词库来源").selectOption(libraryId);
    await page.getByRole("button", { name: "挑战", exact: true }).click();
    await page.reload();
    await expect(page.getByLabel("词库来源")).toHaveValue(libraryId);
    await expect(page.getByRole("button", { name: "挑战", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: "无声预览流程", exact: true }).click();
    await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
    const candidates = page.locator(".word-options button");
    await expect(candidates).toHaveCount(3);
    const allowed = new Set(getWordLibrary(libraryId).words.filter(word => word.difficulty === "hard").map(word => word.text));
    const actual = (await candidates.allTextContents()).map(text => text.trim());
    expect(actual.every(text => allowed.has(text))).toBe(true);
    expect(new Set(actual).size).toBe(3);
    expect(errors).toEqual([]);
  });
}
