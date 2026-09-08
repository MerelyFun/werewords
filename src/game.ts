import { findNightStep, getNightSteps, normalizeRoles, type RoleNightStage } from "./roles";
import { normalizeLibraryIds, pickLibraryWords, type Category, type PlayDifficulty, type Word } from "./words";

export type Stage =
  | "setup"
  | "nightIntro"
  | "mayor"
  | "mayorClose"
  | "seer"
  | "seerClose"
  | "werewolf"
  | "werewolfClose"
  | "dayIntro"
  | "day"
  | "accusation"
  | "discussion"
  | "verdict"
  | "result"
  | RoleNightStage;
export interface Settings {
  players: number;
  daySeconds: number;
  nightSeconds: number;
  closeSeconds: number;
  roles: Record<string, number>;
  difficulty: PlayDifficulty;
  libraryIds: string[];
  category: Category | "all";
}
export const defaultSettings: Settings = {
  players: 6,
  daySeconds: 240,
  nightSeconds: 8,
  closeSeconds: 4,
  roles: normalizeRoles(undefined, 6),
  difficulty: "easy",
  libraryIds: ["builtin"],
  category: "all",
};
export interface GameState {
  stage: Stage;
  nightSequence: Stage[];
  settings: Settings;
  candidates: Word[];
  secret: Word | null;
  guessed: boolean | null;
  verdict: boolean | null;
  winner: "villagers" | "werewolves" | null;
  remaining: number;
}
export type Action =
  | { type: "START"; candidates?: Word[] }
  | { type: "SETTINGS"; settings: Partial<Settings> }
  | { type: "SELECT_WORD"; word: Word }
  | { type: "NEXT" | "SKIP" | "EXPIRE" | "RESET" }
  | { type: "GUESS"; correct: boolean }
  | { type: "VERDICT"; hit: boolean }
  | { type: "TICK"; seconds: number };

export const stageLabels: Partial<Record<Stage, string>> = {
  setup: "准备开局",
  nightIntro: "天黑请闭眼",
  mayor: "镇长选词",
  mayorClose: "镇长闭眼",
  seer: "先知看词",
  seerClose: "先知闭眼",
  werewolf: "狼人看词",
  werewolfClose: "狼人闭眼",
  dayIntro: "天亮请睁眼",
  day: "限时猜词",
  accusation: "狼人指认先知",
  discussion: "讨论并投票",
  verdict: "确认线下结果",
  result: "本局结果",
};

export const initialState: GameState = {
  stage: "setup",
  nightSequence: [],
  settings: { ...defaultSettings },
  candidates: [],
  secret: null,
  guessed: null,
  verdict: null,
  winner: null,
  remaining: 0,
};

export function getStageDuration(stage: Stage, settings: Settings): number {
  if (stage === "day") return settings.daySeconds;
  if (stage === "accusation") return 15;
  if (stage === "discussion") return 60;
  if (["nightIntro", "mayorClose", "dayIntro"].includes(stage)) return settings.closeSeconds;
  const step = findNightStep(stage);
  if (step) return step.duration === "close" ? settings.closeSeconds : settings.nightSeconds;
  return 0;
}

function enter(state: GameState, stage: Stage): GameState {
  return {
    ...state,
    stage,
    remaining: getStageDuration(stage, state.settings),
  };
}

function start(state: GameState, candidates?: Word[]): GameState {
  const selection = candidates?.length
    ? candidates
    : pickLibraryWords(state.settings.difficulty, state.settings.libraryIds);
  return enter(
    {
      ...initialState,
      settings: { ...state.settings },
      candidates: [...selection],
      nightSequence: ["nightIntro", "mayor", "mayorClose", ...getNightSteps(state.settings.roles).map((step) => step.id), "dayIntro"],
    },
    "nightIntro",
  );
}

function next(state: GameState): GameState {
  const nightIndex = state.nightSequence.indexOf(state.stage);
  if (nightIndex >= 0) {
    const prepared = state.stage === "mayor" ? {
      ...state, secret: state.secret ?? state.candidates[0] ?? null, candidates: [],
    } : state;
    return enter(prepared, state.nightSequence[nightIndex + 1] ?? "day");
  }
  switch (state.stage) {
    case "setup":
      return start(state);
    case "day":
      return enter({ ...state, guessed: false }, "discussion");
    case "accusation":
    case "discussion":
      return enter(state, "verdict");
    case "verdict":
      return enter({ ...state, winner: null, verdict: null }, "result");
    case "result":
      return { ...initialState, settings: { ...state.settings } };
    default:
      return state;
  }
}

const clamp = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.round(value)))
    : fallback;

/** UI 负责 deadline/暂停与语音播放。TICK 注入实际剩余秒数；EXPIRE 只推进有计时的阶段。 */
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SETTINGS": {
      if (state.stage !== "setup") return state;
      const input = { ...state.settings, ...action.settings };
      // 持久化设置可能来自旧版本或被改写，只接受白名单字段和值。
      const players = clamp(input.players, 4, 10, defaultSettings.players);
      const legacy = action.settings as Partial<Settings> & { libraryId?: unknown };
      const libraryIds = normalizeLibraryIds(
        Object.hasOwn(action.settings, "libraryIds") ? action.settings.libraryIds
          : Object.hasOwn(legacy, "libraryId") ? [legacy.libraryId] : input.libraryIds,
      );
      const difficulty = input.difficulty === "hard" ? "hard" : "easy";
      const settings: Settings = {
        players,
        roles: normalizeRoles(input.roles, players),
        closeSeconds: clamp(input.closeSeconds, 1, 15, defaultSettings.closeSeconds),
        daySeconds: clamp(
          input.daySeconds,
          60,
          600,
          defaultSettings.daySeconds,
        ),
        nightSeconds: clamp(
          input.nightSeconds,
          4,
          30,
          defaultSettings.nightSeconds,
        ),
        libraryIds,
        difficulty,
        category: "all",
      };
      return { ...state, settings };
    }
    case "START":
      return state.stage === "setup" || state.stage === "result"
        ? start(state, action.candidates)
        : state;
    case "RESET":
      return { ...initialState, settings: { ...state.settings } };
    case "SELECT_WORD": {
      if (state.stage !== "mayor") return state;
      const selected = state.candidates.find(
        (word) => word.id === action.word.id,
      );
      return selected
        ? enter({ ...state, secret: selected, candidates: [] }, "mayorClose")
        : state;
    }
    case "GUESS":
      return state.stage === "day"
        ? enter(
            { ...state, guessed: action.correct },
            action.correct ? "accusation" : "discussion",
          )
        : state;
    case "VERDICT": {
      if (state.stage !== "verdict" || state.guessed === null) return state;
      const wolvesWin = state.guessed ? action.hit : !action.hit;
      return enter(
        {
          ...state,
          verdict: action.hit,
          winner: wolvesWin ? "werewolves" : "villagers",
        },
        "result",
      );
    }
    case "NEXT":
    case "SKIP":
      return next(state);
    case "EXPIRE":
      return getStageDuration(state.stage, state.settings) > 0
        ? next(state)
        : state;
    case "TICK":
      return Number.isFinite(action.seconds) &&
        getStageDuration(state.stage, state.settings) > 0
        ? {
            ...state,
            remaining: Math.min(
              getStageDuration(state.stage, state.settings),
              Math.max(0, Math.ceil(action.seconds)),
            ),
          }
        : state;
  }
}
