import type { ArtKind } from "./RoleArt";
export type RoleNightStage = "seer" | "seerClose" | "werewolf" | "werewolfClose" | `role:${string}`;
export interface NightStep {
  id: RoleNightStage;
  roleId: string;
  title: string;
  description: string;
  speech: string;
  revealSecret: boolean;
  duration: "close" | "view";
}
export interface RoleDefinition {
  id: string;
  name: string;
  art: ArtKind;
  team: "villagers" | "werewolves";
  description: string;
  min: number;
  max: number;
  defaultCount: number;
  countStep?: number;
  nightSteps: readonly NightStep[];
}

function steps(id: string, name: string, description: string, revealSecret = false): NightStep[] {
  const basic = id === "seer" || id === "werewolf";
  const closing = `${name}请闭眼。${id === "minion" ? "狼人请放下拇指。" : id === "beholder" ? "先知请放下拇指。" : ""}`;
  return [
    { id: basic ? id : `role:${id}`, roleId: id, title: `${name}，请睁眼`, description, speech: description, revealSecret, duration: "view" },
    { id: basic ? `${id}Close` : `role:${id}:close`, roleId: id, title: `${name}，请闭眼`, description: closing, speech: closing, revealSecret: false, duration: "close" },
  ];
}

/** 新增角色只需扩展此目录；目录顺序决定夜晚行动顺序。镇长是额外职务，不占角色名额。 */
export const roleCatalog: readonly RoleDefinition[] = [
  { id: "seer", art: "seer", name: "先知", team: "villagers", description: "知道秘密词，帮助大家猜中并隐藏身份。", min: 1, max: 1, defaultCount: 1, nightSteps: steps("seer", "先知", "先知请睁眼，查看手机上的秘密词语，并记住它。", true) },
  { id: "werewolf", art: "werewolf", name: "狼人", team: "werewolves", description: "知道秘密词，阻碍猜词；猜中后指认先知。", min: 1, max: 3, defaultCount: 1, nightSteps: steps("werewolf", "狼人", "狼人请睁眼，辨认你的同伴，并查看手机上的秘密词语。", true) },
  { id: "villager", art: "villager", name: "村民", team: "villagers", description: "通过提问找出秘密词，讨论时寻找狼人。", min: 0, max: 8, defaultCount: 4, nightSteps: [] },
  { id: "minion", art: "minion", name: "爪牙", team: "werewolves", description: "知道狼人是谁，不知道秘密词，帮助狼人阵营。", min: 0, max: 1, defaultCount: 0, nightSteps: steps("minion", "爪牙", "爪牙请睁眼。狼人保持闭眼并竖起拇指，让爪牙辨认。爪牙不查看秘密词语。") },
  { id: "beholder", art: "beholder", name: "观察者", team: "villagers", description: "知道先知是谁，但不知道秘密词。", min: 0, max: 1, defaultCount: 0, nightSteps: steps("beholder", "观察者", "观察者请睁眼。先知保持闭眼并竖起拇指，让观察者辨认。观察者不查看秘密词语。") },
  { id: "masons", art: "masons", name: "共济会成员", team: "villagers", description: "必须成对加入，夜晚互认，不知道秘密词。", min: 0, max: 2, defaultCount: 0, countStep: 2, nightSteps: steps("masons", "共济会成员", "共济会成员请睁眼，互相确认同伴。你们不查看秘密词语。") },
  { id: "thing", art: "thing", name: "怪物", team: "villagers", description: "轻触一位相邻玩家，让对方知道你是好人。", min: 0, max: 1, defaultCount: 0, nightSteps: steps("thing", "怪物", "怪物请睁眼，轻触左边或右边一位玩家的肩膀，让对方知道你是怪物。其他人保持闭眼。") },
];

export function getNightSteps(roles: Record<string, number>): NightStep[] {
  return roleCatalog.flatMap((role) => roles[role.id] > 0 ? [...role.nightSteps] : []);
}

export function findNightStep(stage: string): NightStep | undefined {
  return roleCatalog.flatMap((role) => role.nightSteps).find((step) => step.id === stage);
}

/** 仅接收目录内的整数数量；优先基础角色，村民自动补齐剩余座位。 */
export function normalizeRoles(input: unknown, players: number): Record<string, number> {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const result: Record<string, number> = {};
  let available = players;
  for (const role of roleCatalog.filter((role) => role.id !== "villager")) {
    const value = Object.hasOwn(source, role.id) ? source[role.id] : role.defaultCount;
    let count = typeof value === "number" && Number.isSafeInteger(value) ? Math.min(role.max, Math.max(role.min, value)) : role.defaultCount;
    const step = role.countStep ?? 1;
    count = Math.floor(count / step) * step;
    if (count > available) count = Math.max(role.min, Math.floor(available / step) * step);
    result[role.id] = count;
    available -= count;
  }
  result.villager = Math.max(0, available);
  return result;
}
