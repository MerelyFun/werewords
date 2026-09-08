import { describe, expect, it } from "vitest";
import handleOriginal from "../assets/wordlists/github/handle/list.ts.txt?raw";
import partiOriginal from "../assets/wordlists/github/parti/word-bank.ts.txt?raw";
import partiExtraOriginal from "../assets/wordlists/github/parti/word-bank-extra.ts.txt?raw";
import handleWords from "./data/handle-words.json";
import partiWords from "./data/parti-words.json";
import { initialState, reducer } from "./game";
import { getWordLibrary, normalizeLibraryIds, pickLibraryWords, pickWords, wordLibraries } from "./words";

const libraries = [
  { id: "github-handle", name: "汉兜 handle", data: handleWords, count: 424 },
  { id: "github-parti", name: "Parti", data: partiWords, count: 880 },
];
const key = (text: string) => text.trim().normalize("NFKC").toLocaleLowerCase("zh-CN");
const sortedTexts = (items: { text: string }[]) => items.map(word => word.text).sort();

describe("GitHub 两库原文与来源", () => {
  it("汉兜只提取每个答案数组的首词，不导入提示字和洗牌种子", () => {
    // 仅解析数组条目，不执行上游 TypeScript 或 seedShuffle。
    const expected = [...handleOriginal.matchAll(/^\s*\[\s*'([^']+)'(?:\s*,\s*'[^']*')?\s*\]/gm)]
      .map(match => match[1]);
    expect(expected).toHaveLength(424);
    expect(new Set(expected).size).toBe(424);
    expect(sortedTexts(handleWords)).toEqual([...expected].sort());
    expect(handleWords.every(word => /^\p{Script=Han}{4}$/u.test(word.text))).toBe(true);
  });

  it("Parti完整保留基础word与source各类别CSV，排除hints和类别说明", () => {
    const base = [...partiOriginal.matchAll(/\bword:\s*'([^']+)'/g)].map(match => match[1]);
    // 限定 source 对象，避免误把后面的 firstHint 文案当作题目。
    const source = partiExtraOriginal.match(/const\s+source\s*:[^=]+?=\s*\{([\s\S]*?)\n\};/);
    expect(source, "扩展原件应包含source对象").not.toBeNull();
    const categories = [...source![1].matchAll(/^\s*([a-z]+):\s*'([^']+)'\s*,?\s*$/gm)];
    expect(categories.map(match => match[1]).sort()).toEqual([
      "animals", "culture", "daily", "food", "imagination", "jobs", "places", "sports",
    ]);
    const extra = categories.flatMap(match => {
      const entries = match[2].split(",");
      expect(entries, `${match[1]}扩展词数量`).toHaveLength(80);
      return entries;
    });
    expect(base).toHaveLength(240);
    expect(extra).toHaveLength(640);
    const expected = [...base, ...extra];
    expect(new Set(expected).size).toBe(880);
    expect(sortedTexts(partiWords)).toEqual(expected.sort());
  });

  for (const { id, name, data, count } of libraries) {
    it(`${name}独立注册，目录完整保留数据和两档难度`, () => {
      expect(wordLibraries.filter(library => library.id === id)).toHaveLength(1);
      const library = getWordLibrary(id);
      expect(library.id).toBe(id); // 防止不存在的库静默回退到builtin。
      expect(library.name).toBe(name);
      expect(library.words).toEqual(data);
      expect(data).toHaveLength(count);
      expect(new Set(data.map(word => word.id)).size).toBe(count);
      expect(new Set(data.map(word => key(word.text))).size).toBe(count);
      for (const word of data) {
        expect(word.id.trim()).not.toBe("");
        expect(word.text).toBe(word.text.trim());
        expect(word.text).not.toBe("");
        expect(word.category.trim()).not.toBe("");
        expect(["easy", "hard"]).toContain(word.difficulty);
      }
      expect(library.difficulties.map(level => level.id).sort()).toEqual(["easy", "hard"]);
    });

    for (const difficulty of ["easy", "hard"] as const) {
      it(`${name} ${difficulty}完整词池、三候选和开局均不混入其他来源`, () => {
        const allowed = data.filter(word => word.difficulty === difficulty);
        expect(allowed.length).toBeGreaterThanOrEqual(3);
        expect(normalizeLibraryIds([id])).toEqual([id]);
        expect(pickLibraryWords(difficulty, [id], data.length, () => 0.5)
          .slice().sort((a, b) => a.id.localeCompare(b.id)))
          .toEqual(allowed.slice().sort((a, b) => a.id.localeCompare(b.id)));
        for (const random of [() => 0, () => 0.5, () => 0.999999]) {
          for (const selected of [
            pickWords(difficulty, "all", 3, random, id),
            pickLibraryWords(difficulty, [id], 3, random),
          ]) {
            expect(selected).toHaveLength(3);
            expect(new Set(selected.map(word => key(word.text))).size).toBe(3);
            selected.forEach(word => expect(allowed).toContainEqual(word));
          }
        }
        const configured = reducer(initialState, { type: "SETTINGS", settings: { libraryIds: [id], difficulty } });
        expect(configured.settings.libraryIds).toEqual([id]);
        expect(configured.settings.difficulty).toBe("all");
        const started = reducer(configured, { type: "START" });
        expect(started.candidates).toHaveLength(3);
        expect(new Set(started.candidates.map(word => key(word.text))).size).toBe(3);
        started.candidates.forEach(word => expect(data).toContainEqual(word));
      });
    }
  }

  it("两库记录ID与其他库互不冲突，重名词仍分别保留来源", () => {
    const allIds = wordLibraries.flatMap(library => library.words.map(word => word.id));
    expect(new Set(allIds).size).toBe(allIds.length);
    const otherTexts = new Set(wordLibraries.filter(library => !libraries.some(item => item.id === library.id))
      .flatMap(library => library.words.map(word => key(word.text))));
    // Parti与原有库确有重名题，导入时不可跨来源删除它们。
    expect(partiWords.some(word => otherTexts.has(key(word.text)))).toBe(true);
    expect(getWordLibrary("github-handle").words).toEqual(handleWords);
    expect(getWordLibrary("github-parti").words).toEqual(partiWords);
  });

  for (const difficulty of ["all", "easy", "hard"] as const) {
    it(`${difficulty}两库及全库混抽按规范化词面去重，重复勾选不扩充词池`, () => {
      for (const ids of [libraries.map(library => library.id), wordLibraries.map(library => library.id)]) {
        const allowed = ids.flatMap(id => getWordLibrary(id).words)
          .filter(word => difficulty === "all" || (difficulty === "hard" ? word.difficulty === "hard" : word.difficulty !== "hard"));
        const expectedKeys = [...new Set(allowed.map(word => key(word.text)))].sort();
        const selected = pickLibraryWords(difficulty, [...ids, ...ids], allowed.length + 1, () => 0.5);
        expect(selected.map(word => key(word.text)).sort()).toEqual(expectedKeys);
        const allowedById = new Map(allowed.map(word => [word.id, word]));
        selected.forEach(word => expect(allowedById.get(word.id)).toEqual(word));
        expect(pickLibraryWords(difficulty, ids, allowed.length + 1, () => 0.5)).toEqual(selected);
      }
    });
  }
});
