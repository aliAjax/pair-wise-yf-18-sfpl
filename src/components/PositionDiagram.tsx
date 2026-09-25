interface Props {
  position: string;
}

/** 点位：中心主石、三圈围石、双肩、辅石区 */
const SPOTS: { pos: string; x: number; y: number; r: number }[] = [
  { pos: "主石位", x: 150, y: 130, r: 15 },
  { pos: "围石A组", x: 150, y: 62, r: 8 },
  { pos: "围石A组", x: 208, y: 96, r: 8 },
  { pos: "围石A组", x: 208, y: 164, r: 8 },
  { pos: "围石A组", x: 150, y: 198, r: 8 },
  { pos: "围石A组", x: 92, y: 164, r: 8 },
  { pos: "围石A组", x: 92, y: 96, r: 8 },
  { pos: "围石B组", x: 150, y: 38, r: 6 },
  { pos: "围石B组", x: 229, y: 60, r: 6 },
  { pos: "围石B组", x: 246, y: 130, r: 6 },
  { pos: "围石B组", x: 229, y: 200, r: 6 },
  { pos: "围石B组", x: 150, y: 222, r: 6 },
  { pos: "围石B组", x: 71, y: 200, r: 6 },
  { pos: "围石B组", x: 54, y: 130, r: 6 },
  { pos: "围石B组", x: 71, y: 60, r: 6 },
  { pos: "围石C组", x: 150, y: 16, r: 4.5 },
  { pos: "围石C组", x: 267, y: 84, r: 4.5 },
  { pos: "围石C组", x: 267, y: 176, r: 4.5 },
  { pos: "围石C组", x: 150, y: 244, r: 4.5 },
  { pos: "围石C组", x: 33, y: 176, r: 4.5 },
  { pos: "围石C组", x: 33, y: 84, r: 4.5 },
  { pos: "肩石左", x: 96, y: 286, r: 7 },
  { pos: "肩石右", x: 204, y: 286, r: 7 },
  { pos: "辅石区", x: 150, y: 312, r: 9 },
];

export default function PositionDiagram({ position }: Props) {
  const active = position.trim();

  return (
    <div className="diagram">
      <svg viewBox="0 0 300 332" role="img" aria-label="镶嵌位置示意图">
        <ellipse cx="150" cy="130" rx="120" ry="112" className="ring-band" />
        <ellipse cx="150" cy="130" rx="120" ry="112" className="ring-outline" />
        <rect x="132" y="240" width="36" height="60" rx="12" className="ring-band" />
        <rect x="132" y="240" width="36" height="60" rx="12" className="ring-outline" />

        {SPOTS.map((s, i) => {
          const on = active && s.pos === active;
          return (
            <g key={i}>
              {on && <circle cx={s.x} cy={s.y} r={s.r + 6} className="spot-halo" />}
              <circle
                cx={s.x}
                cy={s.y}
                r={s.r}
                className={on ? "spot spot-on" : "spot"}
              />
            </g>
          );
        })}
      </svg>
      <div className="diagram-legend">
        {["主石位", "围石A组", "围石B组", "围石C组", "肩石左", "肩石右", "辅石区"].map(
          (name) => (
            <span key={name} className={active === name ? "legend-on" : ""}>
              <i className={`legend-dot ${active === name ? "legend-dot-on" : ""}`} />
              {name}
            </span>
          ),
        )}
      </div>
      <p className="diagram-current">
        {active ? <>当前镶嵌位：<b>{active}</b></> : <>镶嵌位未填写，补齐后示意图会点亮对应点位</>}
      </p>
    </div>
  );
}
