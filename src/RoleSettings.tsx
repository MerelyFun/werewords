import { Minus, Plus } from "lucide-react";
import { roleCatalog } from "./roles";
import { RoleArt } from "./RoleArt";

export function RoleSettings({ players, counts, onChange }: {
  players: number; counts: Record<string, number>; onChange: (roles: Record<string, number>) => void;
}) {
  return <details className="role-settings">
    <summary><span className="role-summary-title">角色配置</span><span className="roster-preview" aria-hidden="true">{roleCatalog.filter(role => counts[role.id] > 0).slice(0, 4).map(role => <RoleArt key={role.id} kind={role.art} />)}</span><span>{players} 人</span></summary>
    <p className="role-summary">{roleCatalog.filter(r => counts[r.id] > 0).map(r => `${r.name} × ${counts[r.id]}`).join(" · ")}</p>
    <p className="role-note">镇长另兼一张身份卡；村民自动补足人数。</p>
    {roleCatalog.map(role => {
      const count = counts[role.id] ?? 0;
      const step = role.countStep ?? 1;
      return <div className="role-row" key={role.id}>
        <RoleArt kind={role.art} />
        <div className="role-info"><strong>{role.name}</strong><p>{role.description}</p></div>
        {role.id === "villager" ? <output className="role-count">{count}</output> :
          <div className="stepper">
            <button aria-label={`减少${role.name}`} disabled={count <= role.min}
              onClick={() => onChange({ ...counts, [role.id]: count - step })}><Minus size={15} /></button>
            <output>{count}</output>
            <button aria-label={`增加${role.name}`} disabled={count + step > role.max || (counts.villager ?? 0) < step}
              onClick={() => onChange({ ...counts, [role.id]: count + step })}><Plus size={15} /></button>
          </div>}
      </div>;
    })}
  </details>;
}
