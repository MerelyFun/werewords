import { test, expect } from "@playwright/test";
import handleWords from "../src/data/handle-words.json" with { type: "json" };
import partiWords from "../src/data/parti-words.json" with { type: "json" };

const libraries = [
  { name: "汉兜 handle", data: handleWords },
  { name: "Parti", data: partiWords },
];
const selections = [...libraries.map(library => [library]), libraries];

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.route("**/audio/manifest.json", route =>
    route.fulfill({ json: { ready: false, clips: [] } }),
  );
});

for (const selected of selections) {
  for (const { difficulty, label, opposite } of [
    { difficulty: "easy", label: "标准", opposite: "挑战" },
    { difficulty: "hard", label: "挑战", opposite: "标准" },
  ] as const) {
    test(`GitHub ${selected.map(library => library.name).join(" + ")} ${label}刷新保存、三候选与320px布局`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("/");
      const group = page.getByRole("group", { name: "词库", exact: true });
      for (const library of selected) {
        await group.getByRole("checkbox", { name: library.name, exact: true }).check();
      }
      await group.getByRole("checkbox", { name: "原有精选", exact: true }).uncheck();
      // 先切到另一档，确保标准档也实际验证保存而非只命中默认值。
      await page.getByRole("button", { name: opposite, exact: true }).click();
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(page.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
      await page.reload();
      for (const library of libraries) {
        await expect(group.getByRole("checkbox", { name: library.name, exact: true }))
          .toBeChecked({ checked: selected.includes(library) });
      }
      await expect(group.getByRole("checkbox", { name: "原有精选", exact: true })).not.toBeChecked();
      await expect(group.locator('input[type="checkbox"]:checked')).toHaveCount(selected.length);
      await expect(page.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("button", { name: opposite, exact: true })).toHaveAttribute("aria-pressed", "false");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

      await page.getByRole("button", { name: "无声预览流程", exact: true }).click();
      await page.getByRole("button", { name: "跳过此阶段", exact: true }).click();
      const candidates = page.locator(".word-options button");
      await expect(candidates).toHaveCount(3);
      const allowed = new Set(selected.flatMap(library => library.data)
        .filter(word => word.difficulty === difficulty).map(word => word.text));
      expect(allowed.size).toBeGreaterThanOrEqual(3);
      const actual = (await candidates.allTextContents()).map(text => text.trim());
      for (const text of actual) expect(allowed.has(text), `候选词不属于所选来源/${label}：${text}`).toBe(true);
      expect(new Set(actual.map(text => text.normalize("NFKC").toLocaleLowerCase("zh-CN"))).size).toBe(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}
