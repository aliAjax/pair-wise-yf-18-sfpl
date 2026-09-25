import { Stone, STATUS_META } from "../types";
import { formatTime } from "../storage";

interface StoneCardProps {
  stone: Stone;
  onView: (stone: Stone) => void;
  onEdit: (stone: Stone) => void;
  onSend: (stone: Stone) => void;
}

export default function StoneCard({
  stone,
  onView,
  onEdit,
  onSend,
}: StoneCardProps) {
  const meta = STATUS_META[stone.status];
  const missing: string[] = [];
  if (!stone.size.trim()) missing.push("尺寸");
  if (!stone.position.trim()) missing.push("镶嵌位");

  return (
    <article
      className={`stone-card ${meta.tone}`}
      onClick={() => onView(stone)}
    >
      <div className="stone-card-head">
        <div>
          <h3>{stone.code}</h3>
          <p>
            {stone.kind || "未填种类"} · {stone.shape}
            {stone.carat.trim() ? ` · ${stone.carat}ct` : ""}
          </p>
        </div>
        <span className={`badge ${meta.tone}`}>{meta.label}</span>
      </div>

      <dl className="stone-meta">
        <div>
          <dt>批次</dt>
          <dd>{stone.batch}</dd>
        </div>
        <div>
          <dt>镶嵌位</dt>
          <dd>{stone.position || "—"}</dd>
        </div>
        <div>
          <dt>尺寸</dt>
          <dd>{stone.size || "—"}</dd>
        </div>
        <div>
          <dt>登记</dt>
          <dd>{formatTime(stone.registeredAt)}</dd>
        </div>
      </dl>

      {stone.status === "incomplete" && (
        <div className="missing-tags">
          {missing.map((m) => (
            <span key={m} className="tag-missing">
              缺{m}
            </span>
          ))}
          {stone.returnReason && missing.length === 0 && (
            <span className="tag-return">退回待复核</span>
          )}
          {stone.defectNote && <span className="tag-defect">有缺陷备注</span>}
        </div>
      )}

      {stone.returnReason && (
        <p className="return-reason">↩ {stone.returnReason}</p>
      )}

      {stone.defectNote && (
        <p className="defect-line" title={stone.defectNote}>
          ◈ 缺陷：{stone.defectNote}
        </p>
      )}

      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="link-btn" onClick={() => onView(stone)}>
          查看历次调整
        </button>
        {stone.status === "incomplete" && (
          <button className="small-btn ok" onClick={() => onEdit(stone)}>
            补齐资料
          </button>
        )}
        {stone.status === "ready" && (
          <button className="small-btn done" onClick={() => onSend(stone)}>
            送镶嵌
          </button>
        )}
        {stone.status === "setting" && (
          <button className="small-btn ghost" onClick={() => onEdit(stone)}>
            修改资料
          </button>
        )}
      </div>
    </article>
  );
}
