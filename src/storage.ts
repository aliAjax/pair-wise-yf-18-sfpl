import {
  HistoryEvent,
  HistoryKind,
  OriginalValue,
  Stone,
  StoneStatus,
} from "./types";

const STORAGE_KEY = "gem-sort-bench:v1";

let counter = 0;
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function ev(
  kind: HistoryKind,
  title: string,
  at: string,
  extra?: { detail?: string; originals?: OriginalValue[] }
): HistoryEvent {
  return { id: uid("ev"), kind, title, at, ...extra };
}

export function isComplete(stone: {
  size: string;
  position: string;
}): boolean {
  return stone.size.trim() !== "" && stone.position.trim() !== "";
}

interface DemoSeed {
  code: string;
  orderNo: string;
  batch: string;
  kind: string;
  shape: string;
  carat: string;
  size: string;
  position: string;
  clarity?: string;
  color?: string;
  cut?: string;
  defectNote?: string;
  status: StoneStatus;
  minutesAgo: number;
  returnReason?: string;
  history: [HistoryKind, string, number, { detail?: string }?][];
}

const now = Date.now();
const minutes = (n: number) => new Date(now - n * 60_000).toISOString();

const SEEDS: DemoSeed[] = [
  {
    code: "ST-2048",
    orderNo: "PO-2609",
    batch: "B-0925-01",
    kind: "蓝宝石",
    shape: "椭圆",
    carat: "1.28",
    size: "6×4mm",
    position: "主石位",
    clarity: "VVS",
    color: "皇家蓝",
    cut: "椭圆明亮",
    defectNote: "",
    status: "ready",
    minutesAgo: 96,
    history: [
      ["register", "登记入库", 96],
      ["complete", "资料补齐（尺寸 / 镶嵌位）", 82],
    ],
  },
  {
    code: "ST-2061",
    orderNo: "PO-2609",
    batch: "B-0925-01",
    kind: "钻石",
    shape: "圆形",
    carat: "0.08",
    size: "2.7mm",
    position: "围石A组",
    clarity: "SI1",
    color: "F",
    cut: "八心八箭",
    defectNote: "腰部轻微抛光痕，排镶前复检",
    status: "setting",
    minutesAgo: 88,
    history: [
      ["register", "登记入库", 88],
      ["complete", "资料补齐（尺寸 / 镶嵌位）", 70, { detail: "排镶 A 组第 3 位" }],
      ["send", "送镶嵌车间", 55],
    ],
  },
  {
    code: "ST-2062",
    orderNo: "PO-2609",
    batch: "B-0925-01",
    kind: "钻石",
    shape: "圆形",
    carat: "0.08",
    size: "",
    position: "围石B组",
    clarity: "SI2",
    color: "G",
    defectNote: "",
    status: "incomplete",
    minutesAgo: 64,
    returnReason: "缺少资料：尺寸未填",
    history: [
      ["register", "登记入库", 64],
      ["hold", "放入待补区", 64, { detail: "尺寸未填" }],
    ],
  },
  {
    code: "ST-2077",
    orderNo: "PO-2609",
    batch: "B-0925-01",
    kind: "尖晶石",
    shape: "梨形",
    carat: "0.35",
    size: "5×3.5mm",
    position: "肩石右",
    clarity: "VVS",
    color: "热粉",
    cut: "梨形玫瑰",
    defectNote: "",
    status: "incomplete",
    minutesAgo: 200,
    returnReason: "送镶后修改了「形状」，退回待补复核",
    history: [
      ["register", "登记入库", 200],
      ["complete", "资料补齐（尺寸 / 镶嵌位）", 190],
      ["send", "送镶嵌车间", 160],
      [
        "return",
        "已送镶后改动，退回待补",
        40,
        {
          detail:
            "形状：马眼形 → 梨形；克拉重量：0.34ct → 0.35ct（原值与修改时间已留存）",
        },
      ],
    ],
  },
  {
    code: "ST-2099",
    orderNo: "PO-2610",
    batch: "B-0925-02",
    kind: "祖母绿",
    shape: "祖母绿切",
    carat: "0.92",
    size: "6×4mm",
    position: "主石位",
    clarity: "SI",
    color: "木佐绿",
    cut: "阶梯",
    defectNote: "台面可见内含物与一条细裂，需客户书面确认后再镶",
    status: "ready",
    minutesAgo: 44,
    history: [
      ["register", "登记入库", 44],
      ["complete", "资料补齐（尺寸 / 镶嵌位）", 30, { detail: "客户确认件待回收" }],
    ],
  },
  {
    code: "ST-2101",
    orderNo: "PO-2610",
    batch: "B-0925-02",
    kind: "钻石",
    shape: "公主方",
    carat: "0.12",
    size: "3mm",
    position: "肩石左",
    clarity: "VS2",
    color: "E",
    cut: "公主方",
    defectNote: "",
    status: "setting",
    minutesAgo: 36,
    history: [
      ["register", "登记入库", 36],
      ["complete", "资料补齐（尺寸 / 镶嵌位）", 28],
      ["send", "送镶嵌车间", 12],
    ],
  },
  {
    code: "ST-2102",
    orderNo: "PO-2610",
    batch: "B-0925-02",
    kind: "红宝石",
    shape: "心形",
    carat: "0.51",
    size: "",
    position: "",
    clarity: "SI1",
    color: "鸽血红",
    defectNote: "",
    status: "incomplete",
    minutesAgo: 20,
    returnReason: "缺少资料：尺寸、镶嵌位置未填",
    history: [
      ["register", "登记入库", 20],
      ["hold", "放入待补区", 20, { detail: "尺寸、镶嵌位置未填" }],
    ],
  },
  {
    code: "ST-2108",
    orderNo: "PO-2611",
    batch: "B-0925-03",
    kind: "碧玺",
    shape: "椭圆",
    carat: "1.05",
    size: "7×5mm",
    position: "底托围镶",
    clarity: "VS",
    color: "帕拉伊巴",
    cut: "椭圆明亮",
    defectNote: "亭部边缘小缺口，建议包镶遮挡",
    status: "ready",
    minutesAgo: 8,
    history: [
      ["register", "登记入库", 8],
      ["complete", "资料补齐（尺寸 / 镶嵌位）", 6],
    ],
  },
];

function buildSeed(s: DemoSeed): Stone {
  const registeredAt = minutes(s.minutesAgo);
  const history: HistoryEvent[] = s.history.map(([kind, title, ago, extra]) =>
    ev(kind, title, minutes(ago), extra)
  );
  return {
    id: uid("st"),
    code: s.code,
    orderNo: s.orderNo,
    batch: s.batch,
    kind: s.kind,
    shape: s.shape,
    carat: s.carat,
    size: s.size,
    position: s.position,
    clarity: s.clarity ?? "",
    color: s.color ?? "",
    cut: s.cut ?? "",
    defectNote: s.defectNote ?? "",
    status: s.status,
    returnReason: s.returnReason,
    registeredAt,
    updatedAt: history.length
      ? history[history.length - 1].at
      : registeredAt,
    history,
  };
}

export function loadStones(): Stone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stone[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // 本机资料损坏时回落到演示数据
  }
  const seeded = SEEDS.map(buildSeed);
  saveStones(seeded);
  return seeded;
}

export function saveStones(stones: Stone[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stones));
  } catch {
    // 本机存储不可用时只保留内存状态
  }
}

export function resetStones(): Stone[] {
  const seeded = SEEDS.map(buildSeed);
  saveStones(seeded);
  return seeded;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

/** 克拉按数值比较，避免 0.35 与 0.350 被误判为改动 */
export function caratChanged(a: string, b: string): boolean {
  const na = parseFloat(a);
  const nb = parseFloat(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) {
    return Math.abs(na - nb) > 1e-9;
  }
  return a.trim() !== b.trim();
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
