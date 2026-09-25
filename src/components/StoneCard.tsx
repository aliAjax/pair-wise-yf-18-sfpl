import { display } from "../constants";
import { STATUS_META } from "../types";
import type { Stone } from "../types";

interface Props {
  stone: Stone;
  onOpen: (stone: Stone) => void;
  onSend: (stone: Stone) => void;
}

function pendingReason(stone: Stone): string {
  const missing: string[] = [];
  if (!stone.size.trim()) missing.push("尺寸");
  if (!stone.position.trim()) missing.push("镶嵌位");
  if (missing.length > 0) return `缺${missing.join("、")}，资料补齐后再送镶嵌`;
  if (stone.returned) return "送镶后改动退回，原值已留存，核对无误可重新送镶";
  // 资料已齐但仍在待补
  return "待核对重排";
}

export default function StoneCard({ stone, onOpen, onSend }: Props) {
  const meta = STATUS_META[stone.status];
  const incomplete = stone.status === "pending" && (!stone.size.trim() || !stone.position.trim());

  return (
    <article
      className={`stone-card tone-${meta.tone}`}
      onClick={() => onOpen(stone)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(stone)}
    >
      <header className="stone-card-head">
        <div>
          <h4>{stone.stoneNo}</h4>
          <p>
            {stone.species} · {stone.shape}
          </p>
        </div>
        <span className={`status-pill ${meta.tone}`}>{meta.label}</span>
      </header>

      <dl className="stone-facts">
        <div>
          <dt>克拉</dt>
          <dd>{display(stone.carat)}{stone.carat ? " ct" : ""}</dd>
        </div>
        <div>
          <dt>尺寸</dt>
          <dd className={!stone.size.trim() ? "missing" : ""}>{display(stone.size)}</dd>
        </div>
        <div>
          <dt>镶嵌位</dt>
          <dd className={!stone.position.trim() ? "missing" : ""}>{display(stone.position)}</dd>
        </div>
      </dl>

      {stone.defect && <p className="defect-line">⚠ {stone.defect}</p>}

      {stone.status === "pending" && <p className="reason-line">{pendingReason(stone)}</p>}

      <footer className="stone-card-foot" onClick={(e) => e.stopPropagation()}>
        <button className="ghost" onClick={() => onOpen(stone)}>
          {incomplete ? "补齐资料" : "查看详情"}
        </button>
        {stone.status === "ready" && (
          <button className="mini-primary" onClick={() => onSend(stone)}>
            送镶嵌
          </button>
        )}
        {stone.status === "set" && stone.setAt && (
          <span className="set-time">送镶 {new Date(stone.setAt).toLocaleString("zh-CN", { hour12: false })}</span>
        )}
        {stone.status === "pending" && !incomplete && (
          <button className="mini-primary" onClick={() => onSend(stone)}>
            核对无误 · 送镶嵌
          </button>
        )}
      </footer>
    </article>
  );
}
