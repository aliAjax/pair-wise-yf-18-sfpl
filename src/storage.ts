import type { HistoryEvent, Stone, StoneStatus } from "./types";

const STORAGE_KEY = "gem-sorting-stones-v1";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function event(
  kind: HistoryEvent["kind"],
  text: string,
  extra?: Partial<HistoryEvent>,
  minutesAgo = 0,
): HistoryEvent {
  return {
    id: uid(),
    at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
    kind,
    text,
    ...extra,
  };
}

function seedStones(): Stone[] {
  // SO-2026-018 / B-0925-A
  const s1: Stone = {
    id: uid(),
    orderNo: "SO-2026-018",
    batchNo: "B-0925-A",
    stoneNo: "ST-2048",
    species: "蓝宝石",
    shape: "椭圆",
    carat: "1.25",
    size: "6.0×4.0 mm",
    clarity: "VS1",
    color: "未分级",
    cut: "混合切",
    position: "主石位",
    defect: "",
    status: "set",
    createdAt: new Date(Date.now() - 2880 * 60_000).toISOString(),
    setAt: new Date(Date.now() - 300 * 60_000).toISOString(),
    history: [
      event("create", "登记入分拣批次 B-0925-A", undefined, 2880),
      event("send", "资料齐全，送镶嵌", undefined, 300),
    ],
  };

  const s2: Stone = {
    id: uid(),
    orderNo: "SO-2026-018",
    batchNo: "B-0925-A",
    stoneNo: "ST-2061",
    species: "钻石",
    shape: "圆形",
    carat: "0.08",
    size: "2.7 mm",
    clarity: "VVS2",
    color: "E",
    cut: "明亮切",
    position: "围石A组",
    defect: "",
    status: "ready",
    createdAt: new Date(Date.now() - 2400 * 60_000).toISOString(),
    history: [
      event("create", "登记入分拣批次 B-0925-A", undefined, 2400),
      event("edit", "补齐尺寸：2.7 mm", { field: "尺寸", oldValue: "", newValue: "2.7 mm" }, 1800),
      event("edit", "指定镶嵌位置：围石A组", { field: "镶嵌位置", oldValue: "", newValue: "围石A组" }, 1790),
    ],
  };

  const s3: Stone = {
    id: uid(),
    orderNo: "SO-2026-018",
    batchNo: "B-0925-A",
    stoneNo: "ST-2099",
    species: "祖母绿",
    shape: "祖母绿切",
    carat: "0.62",
    size: "",
    clarity: "SI2",
    color: "未分级",
    cut: "阶梯切",
    position: "",
    defect: "内含物明显，需客户确认后再排镶",
    status: "pending",
    createdAt: new Date(Date.now() - 1400 * 60_000).toISOString(),
    history: [event("create", "登记入分拣批次 B-0925-A；尺寸与镶嵌位置待补", undefined, 1400)],
  };

  const s4: Stone = {
    id: uid(),
    orderNo: "SO-2026-018",
    batchNo: "B-0925-A",
    stoneNo: "ST-2104",
    species: "钻石",
    shape: "圆形",
    carat: "0.05",
    size: "2.3 mm",
    clarity: "VS1",
    color: "F",
    cut: "明亮切",
    position: "围石B组",
    defect: "",
    status: "set",
    createdAt: new Date(Date.now() - 1200 * 60_000).toISOString(),
    setAt: new Date(Date.now() - 240 * 60_000).toISOString(),
    history: [
      event("create", "登记入分拣批次 B-0925-A", undefined, 1200),
      event("send", "资料齐全，送镶嵌", undefined, 240),
      event(
        "return",
        "送镶后克拉重量由 0.05 改为 0.06，退回待补核对",
        { field: "克拉重量", oldValue: "0.05", newValue: "0.06" },
        90,
      ),
    ],
  };
  // 退回事件后实际状态为待补
  s4.status = "pending";
  s4.carat = "0.06";
  s4.setAt = undefined;
  s4.returned = true;

  // SO-2026-021 / B-0925-B
  const s5: Stone = {
    id: uid(),
    orderNo: "SO-2026-021",
    batchNo: "B-0925-B",
    stoneNo: "ST-3101",
    species: "红宝石",
    shape: "梨形",
    carat: "2.01",
    size: "9.1×6.2 mm",
    clarity: "VS2",
    color: "未分级",
    cut: "混合切",
    position: "主石位",
    defect: "亭部轻微磨损，已拍照",
    status: "ready",
    createdAt: new Date(Date.now() - 900 * 60_000).toISOString(),
    history: [event("create", "登记入分拣批次 B-0925-B", undefined, 900)],
  };

  const s6: Stone = {
    id: uid(),
    orderNo: "SO-2026-021",
    batchNo: "B-0925-B",
    stoneNo: "ST-3102",
    species: "尖晶石",
    shape: "垫形",
    carat: "0.9",
    size: "5.5×5.3 mm",
    clarity: "VVS1",
    color: "未分级",
    cut: "明亮切",
    position: "肩石左",
    defect: "",
    status: "set",
    createdAt: new Date(Date.now() - 700 * 60_000).toISOString(),
    setAt: new Date(Date.now() - 120 * 60_000).toISOString(),
    history: [
      event("create", "登记入分拣批次 B-0925-B", undefined, 700),
      event("send", "资料齐全，送镶嵌", undefined, 120),
    ],
  };

  const s7: Stone = {
    id: uid(),
    orderNo: "SO-2026-021",
    batchNo: "B-0925-B",
    stoneNo: "ST-3103",
    species: "钻石",
    shape: "圆形",
    carat: "0.12",
    size: "3.1 mm",
    clarity: "VS2",
    color: "G",
    cut: "明亮切",
    position: "",
    defect: "",
    status: "pending",
    createdAt: new Date(Date.now() - 400 * 60_000).toISOString(),
    history: [event("create", "登记入分拣批次 B-0925-B；镶嵌位置待补", undefined, 400)],
  };

  const s8: Stone = {
    id: uid(),
    orderNo: "SO-2026-021",
    batchNo: "B-0925-B",
    stoneNo: "ST-3104",
    species: "碧玺",
    shape: "椭圆",
    carat: "1.10",
    size: "7.0×5.0 mm",
    clarity: "SI1",
    color: "未分级",
    cut: "混合切",
    position: "辅石区",
    defect: "台面可见细小包裹体",
    status: "set",
    createdAt: new Date(Date.now() - 260 * 60_000).toISOString(),
    setAt: new Date(Date.now() - 60 * 60_000).toISOString(),
    history: [
      event("create", "登记入分拣批次 B-0925-B", undefined, 260),
      event("send", "资料齐全，送镶嵌", undefined, 60),
      event(
        "return",
        "送镶后形状由椭圆改为梨形，退回待补重新对位",
        { field: "形状", oldValue: "椭圆", newValue: "梨形" },
        35,
      ),
    ],
  };
  s8.status = "pending";
  s8.shape = "梨形";
  s8.setAt = undefined;
  s8.returned = true;

  return [s1, s2, s3, s4, s5, s6, s7, s8];
}

export function loadStones(): Stone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Stone[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // 本机资料损坏时回退到示例数据
  }
  const seeded = seedStones();
  saveStones(seeded);
  return seeded;
}

export function saveStones(stones: Stone[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stones));
  } catch {
    // 存储不可用时仅保留在内存
  }
}

/** 根据资料完整度推算分拣状态 */
export function deriveStatus(input: {
  size: string;
  position: string;
}): Extract<StoneStatus, "pending" | "ready"> {
  return input.size.trim() && input.position.trim() ? "ready" : "pending";
}
