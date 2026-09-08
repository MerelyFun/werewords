export type ArtKind = "seer" | "werewolf" | "villager" | "mayor";

const positions: Record<ArtKind, string> = {
  seer: "0% 0%", werewolf: "100% 0%", villager: "0% 100%", mayor: "100% 100%",
};

export function RoleArt({ kind }: { kind: ArtKind }) {
  return <div className="role-art" aria-hidden="true" style={{
    backgroundImage: `url(${import.meta.env.BASE_URL}images/roles.png)`,
    backgroundPosition: positions[kind],
  }} />;
}
