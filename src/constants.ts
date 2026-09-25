/** 形状选项（也用于筛选） */
export const SHAPES = ["圆形", "椭圆", "梨形", "祖母绿切", "心形", "马眼形", "垫形"];

export const SPECIES = ["钻石", "蓝宝石", "红宝石", "祖母绿", "尖晶石", "碧玺", "海蓝宝", "其他"];

export const CLARITIES = ["FL", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "未分级"];

export const COLORS = ["D", "E", "F", "G", "H", "I", "J", "未分级"];

export const CUTS = ["明亮切", "祖母绿切工", "玫瑰切", "阶梯切", "混合切", "未评定"];

/** 镶嵌位置（顺序对应示意图上的点位） */
export const POSITIONS = ["主石位", "围石A组", "围石B组", "围石C组", "肩石左", "肩石右", "辅石区"];

export const EMPTY_TEXT = "—";

/** 录入表单字段定义（侧边录入 + 详情编辑共用） */
export interface FieldDef {
  key:
    | "orderNo"
    | "batchNo"
    | "stoneNo"
    | "species"
    | "shape"
    | "carat"
    | "size"
    | "clarity"
    | "color"
    | "cut"
    | "position"
    | "defect";
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  textarea?: boolean;
  /** 缺了它就要进待补区 */
  gatesReady?: boolean;
}

export const FIELD_DEFS: FieldDef[] = [
  { key: "orderNo", label: "订单号", required: true, placeholder: "如 SO-2026-018" },
  { key: "batchNo", label: "分拣批次号", required: true, placeholder: "如 B-0925-A" },
  { key: "stoneNo", label: "宝石编号", required: true, placeholder: "如 ST-2048" },
  { key: "species", label: "种类", required: true, options: SPECIES },
  { key: "shape", label: "形状", required: true, options: SHAPES },
  { key: "carat", label: "克拉重量", placeholder: "如 1.25（ct）" },
  { key: "size", label: "尺寸", gatesReady: true, placeholder: "如 6.0×4.0 mm" },
  { key: "clarity", label: "净度", options: CLARITIES },
  { key: "color", label: "颜色", options: COLORS },
  { key: "cut", label: "切工", options: CUTS },
  { key: "position", label: "镶嵌位置", gatesReady: true, options: POSITIONS },
  { key: "defect", label: "缺陷备注", textarea: true, placeholder: "内含物 / 缺口 / 需客户确认……" },
];

export function display(value: string | undefined): string {
  return value && value.trim() ? value : EMPTY_TEXT;
}
