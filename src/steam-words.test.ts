import mixedOriginal from "../assets/wordlists/steam/3022451195.txt?raw";
import strangeOriginal from "../assets/wordlists/steam/3416324742.txt?raw";
import { describe, expect, it } from "vitest";
import { getWordLibrary, pickWords } from "./words";
import { initialState, reducer } from "./game";

describe("Steam 原始词库接入", () => {
  for (const sourceId of ["3022451195", "3416324742"]) {
    const libraryId = `steam-${sourceId}`;
    it(`${sourceId} 与下载原文一致，元数据不进入题目`, () => {
      const original = sourceId === "3022451195" ? mixedOriginal : strangeOriginal;
      const expected = [...new Set(original.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#")))];
      const actual = getWordLibrary(libraryId).words;
      expect(actual.map(word => word.text)).toEqual(expected);
      expect(new Set(actual.map(word => word.id)).size).toBe(actual.length);
      expect(actual.every(word => word.id.startsWith(`steam-${sourceId}-`))).toBe(true);
    });
    for (const difficulty of ["easy", "hard"] as const) {
      it(`${sourceId} ${difficulty} 抽词只来自选定来源和难度`, () => {
        const library = getWordLibrary(libraryId);
        const allowed = library.words.filter(word => word.difficulty === difficulty);
        expect(allowed.length).toBeGreaterThanOrEqual(3);
        const selected = pickWords(difficulty, "all", 3, () => 0.5, libraryId);
        expect(selected).toHaveLength(3);
        expect(new Set(selected.map(word => word.text)).size).toBe(3);
        expect(selected.every(word => allowed.includes(word))).toBe(true);
        let state = reducer(initialState, { type: "SETTINGS", settings: { libraryId, difficulty } });
        state = reducer(state, { type: "START" });
        expect(state.candidates.every(word => allowed.includes(word))).toBe(true);
      });
    }
  }
  it("旧设置或无效来源仍回退原有精选", () => {
    expect(getWordLibrary("missing").id).toBe("builtin");
  });
});
