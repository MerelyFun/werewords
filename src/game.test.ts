import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  getStageDuration,
  initialState,
  reducer,
  type GameState,
  type Settings,
} from "./game";
import { pickWords, words } from "./words";
import { findNightStep, getNightSteps, normalizeRoles, roleCatalog } from "./roles";

function reachDay(): GameState {
  let state = reducer(initialState, {
    type: "START",
    candidates: words.slice(0, 3),
  });
  while (state.stage !== "day") state = reducer(state, { type: "SKIP" });
  return state;
}

describe("实体卡共用手机流程", () => {
  it("镇长必须手动选词或跳过，不因等待超时静默选词", () => {
    const night = reducer(initialState, {
      type: "START",
      candidates: words.slice(0, 3),
    });
    const mayor = reducer(night, { type: "NEXT" });
    expect(mayor.stage).toBe("mayor");
    expect(getStageDuration("mayor", defaultSettings)).toBe(0);
    expect(reducer(mayor, { type: "EXPIRE" })).toBe(mayor);
    expect(reducer(mayor, { type: "TICK", seconds: 0 })).toBe(mayor);
    expect(mayor.secret).toBeNull();
    expect(reducer(mayor, { type: "SKIP" }).secret).toEqual(words[0]);
  });

  it("跳过镇长选词时自动选择首词，候选清空，全部夜晚阶段可跳过", () => {
    const state = reachDay();
    expect(state.secret).toEqual(words[0]);
    expect(state.candidates).toEqual([]);
    expect(state.remaining).toBe(240);
  });

  it("镇长只能选当前候选中的词，并立即进入遮挡阶段", () => {
    let state = reducer(initialState, {
      type: "START",
      candidates: words.slice(0, 3),
    });
    state = reducer(state, { type: "NEXT" });
    expect(reducer(state, { type: "SELECT_WORD", word: words[10]! })).toBe(
      state,
    );
    state = reducer(state, { type: "SELECT_WORD", word: words[1]! });
    expect(state.stage).toBe("mayorClose");
    expect(state.secret).toEqual(words[1]);
    expect(state.candidates).toHaveLength(0);
  });

  it.each(["SKIP", "EXPIRE"] as const)(
    "白天 %s 按未猜中进入讨论，跳过确认不会捏造胜负",
    (type) => {
      let state = reducer(reachDay(), { type });
      expect(state.stage).toBe("discussion");
      expect(state.guessed).toBe(false);
      state = reducer(state, { type: "SKIP" });
      expect(state.stage).toBe("verdict");
      state = reducer(state, { type: "SKIP" });
      expect(state.stage).toBe("result");
      expect(state.winner).toBeNull();
      expect(state.verdict).toBeNull();
    },
  );

  it.each([
    [true, true, "werewolves"],
    [true, false, "villagers"],
    [false, true, "villagers"],
    [false, false, "werewolves"],
  ] as const)("猜中=%s，线下指认命中=%s，赢家=%s", (correct, hit, winner) => {
    let state = reducer(reachDay(), { type: "GUESS", correct });
    expect(state.stage).toBe(correct ? "accusation" : "discussion");
    expect(state.remaining).toBe(correct ? 15 : 60);
    state = reducer(state, { type: "EXPIRE" });
    state = reducer(state, { type: "VERDICT", hit });
    expect(state.stage).toBe("result");
    expect(state.winner).toBe(winner);
  });

  it("支持外部截止时间校正，过期事件不推进手动确认页面", () => {
    let state = reducer(reachDay(), { type: "TICK", seconds: 9.1 });
    expect(state.remaining).toBe(10);
    state = reducer(state, { type: "EXPIRE" });
    state = reducer(state, { type: "EXPIRE" });
    expect(state.stage).toBe("verdict");
    expect(reducer(state, { type: "EXPIRE" })).toBe(state);
    expect(getStageDuration("setup", defaultSettings)).toBe(0);
  });

  it("重置清除秘密与本局结果，保留设置", () => {
    const state = reducer(reachDay(), { type: "RESET" });
    expect(state.stage).toBe("setup");
    expect(state.secret).toBeNull();
    expect(state.candidates).toEqual([]);
    expect(state.winner).toBeNull();
    expect(state.settings).toEqual(defaultSettings);
  });

  it("非目标阶段不会误处理选词、猜中或结算", () => {
    expect(reducer(initialState, { type: "GUESS", correct: true })).toBe(
      initialState,
    );
    expect(reducer(initialState, { type: "VERDICT", hit: true })).toBe(
      initialState,
    );
    expect(
      reducer(initialState, { type: "SELECT_WORD", word: words[0]! }),
    ).toBe(initialState);
  });
});

describe("设置数据校验", () => {
  it("时间范围与界面一致，人数限制4至10人", () => {
    const low = reducer(initialState, {
      type: "SETTINGS",
      settings: { players: -5, daySeconds: 1, nightSeconds: 0 },
    });
    expect(low.settings).toMatchObject({
      players: 4,
      daySeconds: 60,
      nightSeconds: 4,
    });
    const high = reducer(initialState, {
      type: "SETTINGS",
      settings: { players: 99, daySeconds: 9999, nightSeconds: 99 },
    });
    expect(high.settings).toMatchObject({
      players: 10,
      daySeconds: 600,
      nightSeconds: 30,
    });
  });

  it("存储中的非法枚举、非数值和额外字段不会进入游戏设置", () => {
    const dirty = {
      players: "six",
      daySeconds: null,
      nightSeconds: Number.NaN,
      difficulty: "impossible",
      category: "__proto__",
      secret: "残留词语",
    } as unknown as Partial<Settings>;
    const clean = reducer(initialState, { type: "SETTINGS", settings: dirty });
    expect(clean.settings).toEqual(defaultSettings);
    expect(reducer(clean, { type: "START" }).candidates).toHaveLength(3);
  });

  it("保留合法枚举和未更新字段，开局后不允许修改设置", () => {
    const configured = reducer(initialState, {
      type: "SETTINGS",
      settings: { difficulty: "hard", category: "自然", players: 7.4 },
    });
    expect(configured.settings).toEqual({
      ...defaultSettings,
      difficulty: "hard",
      category: "自然",
      players: 7,
      roles: { ...defaultSettings.roles, villager: 5 },
    });
    const started = reducer(configured, { type: "START" });
    expect(
      reducer(started, { type: "SETTINGS", settings: { daySeconds: 60 } }),
    ).toBe(started);
  });
});

describe("可配置角色目录与动态夜晚", () => {
  it("闭眼等待默认4秒，与8秒看词时长独立", () => {
    for (const stage of ["nightIntro", "mayorClose", "seerClose", "werewolfClose", "dayIntro"] as const) {
      expect(getStageDuration(stage, defaultSettings)).toBe(4);
    }
    expect(getStageDuration("seer", defaultSettings)).toBe(8);
    expect(getStageDuration("werewolf", { ...defaultSettings, closeSeconds: 2 })).toBe(8);
    expect(getStageDuration("role:minion:close", defaultSettings)).toBe(4);
  });

  it("目录每个阶段有唯一ID，扩展角色不会查看秘密词", () => {
    const all = roleCatalog.flatMap((role) => role.nightSteps);
    expect(new Set(all.map((step) => step.id)).size).toBe(all.length);
    expect(all.filter((step) => step.id.startsWith("role:")).every((step) => !step.revealSecret)).toBe(true);
    expect(findNightStep("role:minion")?.roleId).toBe("minion");
    expect(findNightStep("day")).toBeUndefined();
  });

  it("仅启用配置角色阶段，按目录顺序完成夜晚，全部可跳过", () => {
    const roles = normalizeRoles({ minion: 1, masons: 2 }, 6);
    let state = reducer(initialState, { type: "SETTINGS", settings: { roles } });
    state = reducer(state, { type: "START", candidates: words.slice(0, 3) });
    const visited = [];
    for (let count = 0; state.stage !== "day" && count < 30; count++) {
      visited.push(state.stage);
      state = reducer(state, { type: "SKIP" });
    }
    expect(visited).toEqual(["nightIntro", "mayor", "mayorClose", "seer", "seerClose", "werewolf", "werewolfClose", "role:minion", "role:minion:close", "role:masons", "role:masons:close", "dayIntro"]);
    expect(state.stage).toBe("day");
    expect(getNightSteps(defaultSettings.roles).some((step) => step.id.startsWith("role:"))).toBe(false);
  });

  it("人数改变自动补村民，成对角色仅接受0或2，超额不溢出", () => {
    expect(normalizeRoles({ masons: 1 }, 6).masons).toBe(0);
    expect(normalizeRoles({ masons: 2 }, 6).masons).toBe(2);
    expect(normalizeRoles({ minion: 1 }, 7).villager).toBe(4);
    const full = normalizeRoles({ werewolf: 3, minion: 1, beholder: 1, masons: 2, thing: 1 }, 4);
    expect(Object.values(full).reduce((sum, count) => sum + count, 0)).toBe(4);
    expect(full.masons).toBe(0);
  });

  it("清除存储中的未知角色和非法数量，保留必要基础身份", () => {
    const roles = normalizeRoles({ seer: 0, werewolf: -20, minion: "1", beholder: 0.5, masons: NaN, thing: Infinity, stranger: 3, villager: 999 }, 6);
    expect(roles).toEqual(defaultSettings.roles);
    expect(normalizeRoles(null, 6)).toEqual(defaultSettings.roles);
    expect(normalizeRoles([], 6)).toEqual(defaultSettings.roles);
    expect(normalizeRoles({ minion: 1 }, 6).minion).toBe(1);
  });
});

describe("原创词库", () => {
  it("至少100个不重名词，每类难度至少可选3个", () => {
    expect(words.length).toBeGreaterThanOrEqual(100);
    expect(new Set(words.map((word) => word.text)).size).toBe(words.length);
    for (const category of ["日常", "自然", "饮食", "趣味"] as const) {
      for (const difficulty of ["easy", "hard"] as const) {
        const selection = pickWords(difficulty, category);
        expect(selection).toHaveLength(3);
        expect(new Set(selection.map((word) => word.id)).size).toBe(3);
        expect(
          selection.every(
            (word) =>
              word.category === category && word.difficulty === difficulty,
          ),
        ).toBe(true);
      }
    }
  });
});
