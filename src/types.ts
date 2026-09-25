export type StoneStatus = "pending" | "ready" | "set";

export type HistoryKind = "create" | "send" | "return" | "edit";

export interface HistoryEvent {
  id: string;
  at: string; // ISO 时间
  kind: HistoryKind;
  text: string;
  field?: string; // 被修改字段的中文名
  oldValue?: string; // 原值（退回待补时强制留存）
  newValue?: string;
}

export interface Stone {
  id: string;
  orderNo: string; // 订单号
  batchNo: string; // 分拣批次号
  stoneNo: string; // 宝石编号
  species: string; // 种类
  shape: string; // 形状
  carat: string; // 克拉重量
  size: string; // 尺寸
  clarity: string; // 净度
  color: string; // 颜色
  cut: string; // 切工
  position: string; // 镶嵌位置
  defect: string; // 缺陷备注
  status: StoneStatus;
  createdAt: string;
  setAt?: string; // 送镶时间
  /** 曾送镶、因克拉/形状改动被退回待补（资料可能已齐，待核对） */
  returned?: boolean;
  history: HistoryEvent[];
}

/** 表单录入 / 修改用的纯字段结构 */
export type StoneInput = {
  orderNo: string;
  batchNo: string;
  stoneNo: string;
  species: string;
  shape: string;
  carat: string;
  size: string;
  clarity: string;
  color: string;
  cut: string;
  position: string;
  defect: string;
};

export const STATUS_META: Record<
  StoneStatus,
  { label: string; zone: string; tone: string }
> = {
  pending: { label: "待补资料", zone: "待补区", tone: "amber" },
  ready: { label: "待镶嵌", zone: "待镶嵌", tone: "teal" },
  set: { label: "已送镶", zone: "已送镶", tone: "rose" },
};
