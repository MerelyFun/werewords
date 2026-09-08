export type ArtKind = "seer" | "werewolf" | "villager" | "mayor" | "minion" | "beholder" | "masons" | "thing";

const positions: Record<ArtKind, string> = {
  seer: "0% 0%", werewolf: "100% 0%", villager: "0% 100%", mayor: "100% 100%",
  minion: "0% 0%", beholder: "100% 0%", masons: "0% 100%", thing: "100% 100%",
};

export function RoleArt({ kind }: { kind: ArtKind }) {
  return <div className="role-art" aria-hidden="true" style={{
    backgroundImage: `url(${import.meta.env.BASE_URL}images/${["minion", "beholder", "masons", "thing"].includes(kind) ? "extra-roles" : "roles"}.png)`,
    backgroundPosition: positions[kind],
  }} />;
}
