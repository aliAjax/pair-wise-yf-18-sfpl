import { useState } from "react";
import { FIELD_DEFS } from "../constants";
import type { StoneInput } from "../types";

const EMPTY_FORM: StoneInput = {
  orderNo: "",
  batchNo: "",
  stoneNo: "",
  species: "",
  shape: "",
  carat: "",
  size: "",
  clarity: "",
  color: "",
  cut: "",
  position: "",
  defect: "",
};

interface Props {
  onSubmit: (input: StoneInput) => { ok: boolean; message: string };
}

export default function StoneForm({ onSubmit }: Props) {
  const [form, setForm] = useState<StoneInput>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const set = (key: keyof StoneInput, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const result = onSubmit(form);
    setFeedback(result);
    if (result.ok) {
      // 连续分拣录单：保留订单/批次，清空石头本身的字段
      setForm((f) => ({ ...EMPTY_FORM, orderNo: f.orderNo, batchNo: f.batchNo }));
    }
  };

  return (
    <div className="entry-form">
      <div className="entry-head">
        <div>
          <p className="eyebrow">到石登记</p>
          <h2>分拣录入</h2>
        </div>
        <span className="local-badge" title="资料仅保存在本机浏览器">
          ◉ 本机留存
        </span>
      </div>
      <p className="entry-hint">
        尺寸或镶嵌位没填的石头会先进待补区；同批次重复编号只保留先登记的一颗。
      </p>

      <div className="form-fields">
        {FIELD_DEFS.map((def) => (
          <label key={def.key} className={def.textarea ? "span-2" : ""}>
            <span>
              {def.label}
              {def.required && <em className="req">*</em>}
              {def.gatesReady && <i className="gate-tag">缺则待补</i>}
            </span>
            {def.options ? (
              <select
                value={form[def.key]}
                onChange={(e) => set(def.key, e.target.value)}
              >
                <option value="">请选择</option>
                {def.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : def.textarea ? (
              <textarea
                rows={2}
                value={form[def.key]}
                placeholder={def.placeholder}
                onChange={(e) => set(def.key, e.target.value)}
              />
            ) : (
              <input
                value={form[def.key]}
                placeholder={def.placeholder}
                onChange={(e) => set(def.key, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <button className="primary full" onClick={submit}>
        登记到分拣台
      </button>

      {feedback && (
        <div className={`feedback ${feedback.ok ? "ok" : "err"}`}>{feedback.message}</div>
      )}
    </div>
  );
}
