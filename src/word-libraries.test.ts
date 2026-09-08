import { describe, expect, it, vi } from "vitest";
import { getWordLibrary, normalizeLibraryIds, pickLibraryWords, pickWords, wordLibraries } from "./words";
import { initialState, reducer, type Settings } from "./game";

describe("词库来源", () => {
  it("群友原始数据保留三级难度，旧单库抽词仍精确筛选", () => {
    const library = getWordLibrary("party-night");
    expect(library.words).toHaveLength(300);
    for (const difficulty of ["easy", "medium", "hard"] as const) {
      const selected = pickWords(difficulty, "all", 1000, () => 0.5, library.id);
      expect(selected.length).toBeGreaterThan(3);
      expect(selected.every(word => word.id.startsWith("party-night-") && word.difficulty === difficulty)).toBe(true);
    }
  });

  it("多库标准包含原简单及中等，并按词面去重", () => {
    const ids = ["builtin", "party-night"];
    const allowed = ids.flatMap(id => getWordLibrary(id).words).filter(word => word.difficulty !== "hard");
    const selected = pickLibraryWords("easy", ids, 10000, () => 0.5);
    const key = (text: string) => text.trim().normalize("NFKC").toLocaleLowerCase("zh-CN");
    expect(selected.length).toBe(new Set(allowed.map(word => key(word.text))).size);
    expect(new Set(selected.map(word => key(word.text))).size).toBe(selected.length);
    expect(selected.some(word => word.id.startsWith("w-"))).toBe(true);
    expect(selected.some(word => word.difficulty === "medium")).toBe(true);
    expect(selected.every(word => allowed.includes(word))).toBe(true);
  });

  it("多库全池不受旧难度和主题限制且不混入未选择库", () => {
    const ids = ["party-night", "steam-3416324742"];
    const configured = reducer(initialState, { type: "SETTINGS", settings: {
      libraryIds: ids, difficulty: "hard", category: "网络",
    } });
    expect(configured.settings.category).toBe("all");
    const allowed = ids.flatMap(id => getWordLibrary(id).words);
    const selected = pickLibraryWords(configured.settings.difficulty, ids, 10000, () => 0.5);
    expect(selected.every(word => allowed.includes(word))).toBe(true);
    expect(selected.some(word => word.id.startsWith("party-night-"))).toBe(true);
    expect(selected.some(word => word.id.startsWith("steam-"))).toBe(true);
    const started = reducer(configured, { type: "START" });
    expect(started.candidates).toHaveLength(3);
    expect(started.candidates.every(word => allowed.includes(word))).toBe(true);
  });

  it("空值、恶意来源及重复来源归一化，始终至少一库", () => {
    for (const ids of [undefined, null, [], "party-night", ["missing", "__proto__", 12]]) {
      expect(normalizeLibraryIds(ids)).toEqual(["builtin"]);
    }
    expect(normalizeLibraryIds(["party-night", "party-night", "missing", "builtin"]))
      .toEqual(["party-night", "builtin"]);
    expect(pickLibraryWords("easy", [], 3)).toHaveLength(3);
    const selected = pickLibraryWords("easy", wordLibraries.map(library => library.id), 10000);
    expect(new Set(selected.map(word => word.text.trim().normalize("NFKC").toLocaleLowerCase("zh-CN"))).size).toBe(selected.length);
  });

  it("迁移旧单库和中等难度，同时新多选字段优先", () => {
    const old = { libraryId: "party-night", difficulty: "medium", category: "网络" } as unknown as Partial<Settings>;
    const migrated = reducer(initialState, { type: "SETTINGS", settings: old });
    expect(migrated.settings.libraryIds).toEqual(["party-night"]);
    expect(migrated.settings.difficulty).toBe("all");
    expect(migrated.settings.category).toBe("all");
    expect(migrated.settings).not.toHaveProperty("libraryId");
    const updated = reducer(migrated, { type: "SETTINGS", settings: { players: 7 } });
    expect(updated.settings.libraryIds).toEqual(["party-night"]);
    const both = { libraryIds: ["builtin"], libraryId: "party-night" } as Partial<Settings>;
    expect(reducer(initialState, { type: "SETTINGS", settings: both }).settings.libraryIds).toEqual(["builtin"]);
    expect(reducer(migrated, { type: "SETTINGS", settings: { libraryIds: [] } }).settings.libraryIds).toEqual(["builtin"]);
  });
});


it.each(["easy", "medium", "hard"])("旧 %s 设置开局仍按全池抽词", difficulty => {
  const libraryIds = ["builtin", "party-night", "generated-wanxiang"];
  const saved = { libraryIds, difficulty } as unknown as Partial<Settings>;
  const configured = reducer(initialState, { type: "SETTINGS", settings: saved });
  expect(configured.settings.difficulty).toBe("all");
  const expected = pickLibraryWords("all", libraryIds, 3, () => 0.5);
  const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
  try {
    expect(reducer(configured, { type: "START" }).candidates).toEqual(expected);
  } finally {
    random.mockRestore();
  }
});
