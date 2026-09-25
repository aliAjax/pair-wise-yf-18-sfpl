export type StoneStatus = "incomplete" | "ready" | "setting";

export type HistoryKind =
  | "register"
  | "hold"
  | "complete"
  | "send"
  | "return"
  | "edit";

export interface OriginalValue {
  label: string;
  oldValue: string;
  newValue: string;
}

export interface HistoryEvent {
  id: string;
  at: string;
  kind: HistoryKind;
  title: string;
  detail?: string;
  originals?: OriginalValue[];
}

export interface Stone {
  id: string;
  /** 宝石编号 */
  code: string;
  /** 订单号 */
  orderNo: string;
  /** 分拣批次 */
  batch: string;
  /** 种类 */
  kind: string;
  /** 形状 */
  shape: string;
  /** 克拉重量 */
  carat: string;
  /** 尺寸 */
  size: string;
  /** 净度 */
  clarity: string;
  /** 颜色 */
  color: string;
  /** 切工 */
  cut: string;
  /** 镶嵌位置 */
  position: string;
  /** 缺陷备注 */
  defectNote: string;
  status: StoneStatus;
  /** 退回待补的原因（缺资料 / 送镶后被改） */
  returnReason?: string;
  registeredAt: string;
  updatedAt: string;
  history: HistoryEvent[];
}

export interface StoneFormValues {
  code: string;
  orderNo: string;
  batch: string;
  kind: string;
  shape: string;
  carat: string;
  size: string;
  clarity: string;
  color: string;
  cut: string;
  position: string;
  defectNote: string;
}

export const STATUS_META: Record<
  StoneStatus,
  { label: string; tone: "warn" | "ok" | "done" }
> = {
  incomplete: { label: "待补", tone: "warn" },
  ready: { label: "待镶嵌", tone: "ok" },
  setting: { label: "已送镶", tone: "done" },
};

export const STATUS_ORDER: StoneStatus[] = ["incomplete", "ready", "setting"];

export const SHAPES = [
  "圆形",
  "椭圆",
  "梨形",
  "祖母绿切",
  "公主方",
  "心形",
  "马眼形",
];

export const KINDS = ["钻石", "蓝宝石", "红宝石", "祖母绿", "尖晶石", "碧玺"];

export const POSITIONS = [
  "主石位",
  "围石A组",
  "围石B组",
  "肩石左",
  "肩石右",
  "底托围镶",
];

export function emptyFormValues(): StoneFormValues {
  return {
    code: "",
    orderNo: "",
    batch: "",
    kind: "",
    shape: SHAPES[0],
    carat: "",
    size: "",
    clarity: "",
    color: "",
    cut: "",
    position: "",
    defectNote: "",
  };
}
