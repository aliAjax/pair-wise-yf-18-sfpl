import { useEffect, useState } from "react";
import {
  KINDS,
  POSITIONS,
  SHAPES,
  Stone,
  StoneFormValues,
  emptyFormValues,
} from "../types";
import RingDiagram from "./RingDiagram";

interface StoneFormProps {
  initial?: Stone | null;
  batches: string[];
  orders: string[];
  submitLabel: string;
  onSubmit: (values: StoneFormValues) => void;
  onCancel?: () => void;
  error?: string | null;
}

const inputFields: Array<{
  key: keyof StoneFormValues;
  label: string;
  placeholder: string;
  required?: boolean;
}> = [
  { key: "code", label: "宝石编号", placeholder: "如 ST-2109", required: true },
  { key: "orderNo", label: "订单号", placeholder: "如 PO-2611", required: true },
  { key: "batch", label: "分拣批次", placeholder: "如 B-0925-03", required: true },
  { key: "carat", label: "克拉重量", placeholder: "如 0.85" },
  { key: "size", label: "尺寸", placeholder: "如 6×4mm（缺此入待补）" },
  { key: "clarity", label: "净度", placeholder: "如 VVS / SI1" },
  { key: "color", label: "颜色", placeholder: "如 皇家蓝" },
  { key: "cut", label: "切工", placeholder: "如 椭圆明亮" },
];

export default function StoneForm({
  initial,
  batches,
  orders,
  submitLabel,
  onSubmit,
  onCancel,
  error,
}: StoneFormProps) {
  const [values, setValues] = useState<StoneFormValues>(
    initial
      ? {
          code: initial.code,
          orderNo: initial.orderNo,
          batch: initial.batch,
          kind: initial.kind,
          shape: initial.shape,
          carat: initial.carat,
          size: initial.size,
          clarity: initial.clarity,
          color: initial.color,
          cut: initial.cut,
          position: initial.position,
          defectNote: initial.defectNote,
        }
      : emptyFormValues()
  );

  useEffect(() => {
    if (!initial) setValues(emptyFormValues());
  }, [initial]);

  const set = (key: keyof StoneFormValues, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const datalistId = "form-batches";

  return (
    <form className="stone-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="field-grid">
        {inputFields.slice(0, 3).map((f) => (
          <label key={f.key}>
            <span>
              {f.label}
              {f.required ? <em>*</em> : null}
            </span>
            <input
              list={
                f.key === "batch"
                  ? datalistId
                  : f.key === "orderNo"
                    ? "form-orders"
                    : undefined
              }
              value={values[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
              required
            />
          </label>
        ))}
        <datalist id={datalistId}>
          {batches.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        {orders.length > 0 && (
          <datalist id="form-orders">
            {orders.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        )}

        <label>
          <span>种类</span>
          <input
            list="form-kinds"
            value={values.kind}
            placeholder="选择或输入种类"
            onChange={(e) => set("kind", e.target.value)}
          />
          <datalist id="form-kinds">
            {KINDS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </label>

        <label>
          <span>形状</span>
          <select
            value={values.shape}
            onChange={(e) => set("shape", e.target.value)}
          >
            {SHAPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {inputFields.slice(3).map((f) => (
          <label key={f.key}>
            <span>{f.label}</span>
            <input
              value={values[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => set(f.key, e.target.value)}
            />
          </label>
        ))}

        <label>
          <span>镶嵌位置（缺此入待补）</span>
          <select
            value={values.position}
            onChange={(e) => set("position", e.target.value)}
          >
            <option value="">— 未选择 —</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="full">
          <span>缺陷备注</span>
          <textarea
            rows={2}
            value={values.defectNote}
            placeholder="如：台面有内含物、腰部抛光痕、需客户确认……"
            onChange={(e) => set("defectNote", e.target.value)}
          />
        </label>
      </div>

      <div className="form-diagram">
        <RingDiagram
          value={values.position}
          onPick={(p) => set("position", p)}
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            取消
          </button>
        )}
        <button type="submit" className="primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
