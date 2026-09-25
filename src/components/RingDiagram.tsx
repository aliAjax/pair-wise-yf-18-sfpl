import { POSITIONS } from "../types";

interface Zone {
  position: string;
  short: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate?: number;
  textDy?: number;
}

const ZONES: Zone[] = [
  { position: "主石位", short: "主", cx: 200, cy: 122, rx: 30, ry: 30 },
  { position: "围石A组", short: "A", cx: 200, cy: 62, rx: 26, ry: 13 },
  { position: "围石B组", short: "B", cx: 200, cy: 188, rx: 26, ry: 13 },
  { position: "肩石左", short: "左", cx: 138, cy: 106, rx: 15, ry: 24 },
  { position: "肩石右", short: "右", cx: 262, cy: 106, rx: 15, ry: 24 },
  { position: "底托围镶", short: "底", cx: 200, cy: 314, rx: 30, ry: 12 },
];

interface RingDiagramProps {
  value: string;
  onPick?: (position: string) => void;
}

export default function RingDiagram({ value, onPick }: RingDiagramProps) {
  const interactive = typeof onPick === "function";
  return (
    <div className="ring-diagram">
      <svg viewBox="0 0 400 370" role="img" aria-label="镶嵌位置示意图">
        {/* 戒臂 */}
        <path
          d="M152 196 C 138 252, 158 318, 200 334 C 242 318, 262 252, 248 196"
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* 镶口外圈 */}
        <circle
          cx="200"
          cy="122"
          r="76"
          fill="#f8fafc"
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {ZONES.map((z) => {
          const active = value === z.position;
          return (
            <g
              key={z.position}
              className={
                interactive
                  ? `ring-zone${active ? " active" : ""}`
                  : `ring-zone static${active ? " active" : ""}`
              }
              onClick={() => onPick?.(z.position)}
            >
              <ellipse
                cx={z.cx}
                cy={z.cy}
                rx={z.rx}
                ry={z.ry}
                transform={
                  z.rotate
                    ? `rotate(${z.rotate} ${z.cx} ${z.cy})`
                    : undefined
                }
              />
              <text x={z.cx} y={z.cy + (z.textDy ?? 4)} textAnchor="middle">
                {z.short}
              </text>
              <title>{z.position}</title>
            </g>
          );
        })}

        {/* 四角小围石点缀 */}
        {[
          [158, 78],
          [242, 78],
          [158, 166],
          [242, 166],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="#cbd5e1" />
        ))}
      </svg>
      <div className="ring-legend">
        {POSITIONS.map((p) => (
          <span key={p} className={value === p ? "on" : ""}>
            <i />
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
