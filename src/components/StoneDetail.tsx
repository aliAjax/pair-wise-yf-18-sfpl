import { useEffect, useState } from "react";
import { CLARITIES, COLORS, CUTS, FIELD_DEFS, POSITIONS, SHAPES, SPECIES, display } from "../constants";
import type { HistoryEvent, Stone, StoneInput } from "../types";
import { STATUS_META } from "../types";
import PositionDiagram from "./PositionDiagram";

interface Props {
  stone: Stone;
  onClose: () => void;
  onSave: (id: string, patch: Partial<StoneInput>) => { ok: boolean; message: string };
  onSend: (id: string) => { ok: boolean; message: string };
}

const KIND_META: Record<HistoryEvent["kind"], { label: string; cls: string }> = {
  create: { label: "登记", cls: "hk-create" },
  send: { label: "送镶", cls: "hk-send" },
  return: { label: "退回", cls: "hk-return" },
  edit: { label: "调整", cls: "hk-edit" },
};

export default function StoneDetail({ stone, onClose, onSave, onSend }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<StoneInput>({
    orderNo: stone.orderNo,
    batchNo: stone.batchNo,
    stoneNo: stone.stoneNo,
    species: stone.species,
    shape: stone.shape,
    carat: stone.carat,
    size: stone.size,
    clarity: stone.clarity,
    color: stone.color,
    cut: stone.cut,
    position: stone.position,
    defect: stone.defect,
  });
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (key: keyof StoneInput, value: string) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const startEdit = () => {
    setDraft({
      orderNo: stone.orderNo,
      batchNo: stone.batchNo,
      stoneNo: stone.stoneNo,
      species: stone.species,
      shape: stone.shape,
      carat: stone.carat,
      size: stone.size,
      clarity: stone.clarity,
      color: stone.color,
      cut: stone.cut,
      position: stone.position,
      defect: stone.defect,
    });
    setFeedback(null);
    setEditing(true);
  };

  const save = () => {
    const patch: Partial<StoneInput> = {};
    (Object.keys(draft) as (keyof StoneInput)[]).forEach((k) => {
      if (draft[k] !== (stone as unknown as Record<string, string>)[k]) patch[k] = draft[k];
    });
    if (Object.keys(patch).length === 0) {
      setFeedback({ ok: true, message: "没有改动" });
      return;
    }
    const result = onSave(stone.id, patch);
    setFeedback(result);
    if (result.ok) setEditing(false);
  };

  const meta = STATUS_META[stone.status];
  const protectedChanging =
    editing &&
    stone.status === "set" &&
    (draft.carat.trim() !== stone.carat.trim() || draft.shape !== stone.shape);

  const renderControl = (def: (typeof FIELD_DEFS)[number]) => {
    if (!editing) {
      return (
        <dd className={def.gatesReady && !stone[def.key].trim() ? "missing" : ""}>
          {display(stone[def.key])}
        </dd>
      );
    }
    const value = draft[def.key];
    const opts =
      def.key === "species"
        ? SPECIES
        : def.key === "shape"
          ? SHAPES
          : def.key === "clarity"
            ? CLARITIES
            : def.key === "color"
              ? COLORS
              : def.key === "cut"
                ? CUTS
                : def.key === "position"
                  ? POSITIONS
                  : undefined;
    return (
      <span className="edit-ctl">
        {opts ? (
          <select value={value} onChange={(e) => set(def.key, e.target.value)}>
            <option value="">未填写</option>
            {opts.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : def.textarea ? (
          <textarea
            rows={2}
            value={value}
            placeholder={def.placeholder}
            onChange={(e) => set(def.key, e.target.value)}
          />
        ) : (
          <input
            value={value}
            placeholder={def.placeholder}
            onChange={(e) => set(def.key, e.target.value)}
          />
        )}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <p className="eyebrow">
              {stone.batchNo} · 订单 {stone.orderNo}
            </p>
            <h2>
              {stone.stoneNo}
              <span className={`status-pill ${meta.tone}`}>{meta.label}</span>
              {stone.returned && <span className="return-badge">退回待核对</span>}
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        {stone.status === "set" && editing && (
          <div className={`warn-strip ${protectedChanging ? "armed" : ""}`}>
            {protectedChanging
              ? "⚠ 已修改克拉重量或形状：保存后该石头将退回待补区，原值与修改时间记入历次调整。"
              : "该石头已送镶；若修改克拉重量或形状，会退回待补并留存原值。"}
          </div>
        )}

        <div className="modal-body">
          <div className="detail-main">
            <dl className="detail-grid">
              {FIELD_DEFS.filter((d) => d.key !== "orderNo" && d.key !== "batchNo" && d.key !== "stoneNo").map(
                (def) => (
                  <div key={def.key} className={`detail-cell ${def.textarea ? "span-2" : ""}`}>
                    <dt>
                      {def.label}
                      {def.gatesReady && <i className="gate-tag">缺则待补</i>}
                    </dt>
                    {renderControl(def)}
                  </div>
                ),
              )}
            </dl>

            <div className="history">
              <h3>历次调整</h3>
              <ol className="timeline">
                {[...stone.history]
                  .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                  .map((ev) => {
                    const km = KIND_META[ev.kind];
                    return (
                      <li key={ev.id} className={`timeline-item ${km.cls}`}>
                        <div className="tl-head">
                          <span className={`tl-kind ${km.cls}`}>{km.label}</span>
                          <time>{new Date(ev.at).toLocaleString("zh-CN", { hour12: false })}</time>
                        </div>
                        <p className="tl-text">{ev.text}</p>
                        {(ev.oldValue !== undefined || ev.newValue !== undefined) && (
                          <p className="tl-values">
                            <span className="old-val">原值：{ev.oldValue || "（空）"}</span>
                            <span className="arrow">→</span>
                            <span className="new-val">新值：{ev.newValue || "（空）"}</span>
                          </p>
                        )}
                      </li>
                    );
                  })}
              </ol>
            </div>
          </div>

          <aside className="detail-side">
            <h3>镶嵌位置示意图</h3>
            <PositionDiagram position={stone.position} />
            <div className="side-times">
              <p>
                登记时间
                <b>{new Date(stone.createdAt).toLocaleString("zh-CN", { hour12: false })}</b>
              </p>
              {stone.setAt && (
                <p>
                  送镶时间
                  <b>{new Date(stone.setAt).toLocaleString("zh-CN", { hour12: false })}</b>
                </p>
              )}
            </div>
          </aside>
        </div>

        {feedback && <div className={`feedback ${feedback.ok ? "ok" : "err"}`}>{feedback.message}</div>}

        <footer className="modal-foot">
          {!editing ? (
            <>
              <button className="ghost" onClick={onClose}>
                关闭
              </button>
              <div className="foot-right">
                {stone.status === "ready" && (
                  <button
                    className="primary"
                    onClick={() => {
                      const r = onSend(stone.id);
                      setFeedback(r);
                    }}
                  >
                    送镶嵌
                  </button>
                )}
                {stone.status === "pending" &&
                  stone.size.trim() &&
                  stone.position.trim() && (
                    <button
                      className="primary"
                      onClick={() => {
                        const r = onSend(stone.id);
                        setFeedback(r);
                      }}
                    >
                      {stone.returned ? "核对无误 · 重新送镶" : "送镶嵌"}
                    </button>
                  )}
                <button className="ghost-primary" onClick={startEdit}>
                  {stone.status === "pending" ? "补齐 / 修改资料" : "修改资料"}
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="ghost" onClick={() => { setEditing(false); setFeedback(null); }}>
                取消
              </button>
              <button className="primary" onClick={save}>
                保存修改
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}
