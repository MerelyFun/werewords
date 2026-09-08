import mixedOriginal from "../assets/wordlists/steam/3022451195.txt?raw";
import strangeOriginal from "../assets/wordlists/steam/3416324742.txt?raw";
import funnyOriginal from "../assets/wordlists/steam/2660283448.txt?raw";
import mixedNewOriginal from "../assets/wordlists/steam/2890545389.txt?raw";
import sources from "./data/steam-sources.json";
import steamWords from "./data/steam-words.json";
import { describe, expect, it } from "vitest";
import { getWordLibrary, pickWords, pickLibraryWords, wordLibraries } from "./words";
import { initialState, reducer } from "./game";

describe("Steam 原始词库接入", () => {
  const originals: Record<string, string> = { "3022451195": mixedOriginal, "3416324742": strangeOriginal, "2660283448": funnyOriginal, "2890545389": mixedNewOriginal };
  for (const { sourceId, rawWordCount } of sources) {
    const libraryId = `steam-${sourceId}`;
    it(`${sourceId} 与下载原文一致，元数据不进入题目`, () => {
      const original = originals[sourceId];
      const expected = [...new Set(original.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#")))];
      const actual = getWordLibrary(libraryId).words;
      expect(actual.map(word => word.text)).toEqual(expected);
      expect(expected).toHaveLength(rawWordCount);
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
        let state = reducer(initialState, { type: "SETTINGS", settings: { libraryIds: [libraryId], difficulty } });
        expect(state.settings.difficulty).toBe("all");
        state = reducer(state, { type: "START" });
        expect(state.candidates.every(word => library.words.includes(word))).toBe(true);
      });
    }
  }
  it("来源只登记一次，所有题目都能追溯到已登记工坊", () => {
    const ids = sources.map(source => source.sourceId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(steamWords.map(word => word.id)).size).toBe(steamWords.length);
    expect(steamWords.every(word => ids.includes(word.sourceId))).toBe(true);
    for (const source of sources) {
      expect(wordLibraries.filter(library => library.id === `steam-${source.sourceId}`)).toHaveLength(1);
      expect(source.url).toBe(`https://steamcommunity.com/sharedfiles/filedetails/?id=${source.sourceId}`);
    }
  });
  it("重复选同库及四库混抽不会重复候选词", () => {
    const ids = sources.map(source => `steam-${source.sourceId}`);
    const key = (text: string) => text.trim().normalize("NFKC").toLocaleLowerCase("zh-CN");
    for (const difficulty of ["easy", "hard"] as const) {
      const selected = pickLibraryWords(difficulty, [...ids, ...ids], 10000);
      const allowed = steamWords.filter(word => word.difficulty === difficulty);
      expect(selected.length).toBe(new Set(allowed.map(word => key(word.text))).size);
      expect(new Set(selected.map(word => key(word.text))).size).toBe(selected.length);
    }
  });
  it("旧设置或无效来源仍回退原有精选", () => {
    expect(getWordLibrary("missing").id).toBe("builtin");
  });
});
