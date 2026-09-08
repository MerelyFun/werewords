import { describe, expect, it } from "vitest";
import { getWordLibrary, pickWords } from "./words";
import { initialState, reducer } from "./game";

describe("词库来源", () => {
  it("群友词库保留三级难度且抽词不混入其他来源", () => {
    const library = getWordLibrary("party-night");
    expect(library.words).toHaveLength(300);
    expect(new Set(library.words.map(word => word.text)).size).toBe(300);
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const selected = pickWords(difficulty, "all", 1000, () => 0.5, library.id);
      expect(selected.length).toBeGreaterThan(3);
      expect(selected.every(word => word.id.startsWith("party-night-") && word.difficulty === difficulty)).toBe(true);
    }
  });
  it("开局使用来源、难度和主题，切换来源会清理无效设置", () => {
    const configured = reducer(initialState, { type: "SETTINGS", settings: {
      libraryId: "party-night", difficulty: "hard", category: "网络",
    } });
    const started = reducer(configured, { type: "START" });
    expect(started.candidates).toHaveLength(3);
    expect(started.candidates.every(word => word.id.startsWith("party-night-") && word.difficulty === "hard" && word.category === "网络")).toBe(true);
    const changed = reducer(configured, { type: "SETTINGS", settings: { libraryId: "builtin" } });
    expect(changed.settings.difficulty).toBe("hard");
    expect(changed.settings.category).toBe("all");
    const invalid = reducer(initialState, { type: "SETTINGS", settings: { libraryId: "missing" } });
    expect(invalid.settings.libraryId).toBe("builtin");
  });
});
