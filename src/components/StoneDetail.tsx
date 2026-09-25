import { Stone, STATUS_META, HistoryKind } from "../types";
import { formatTime } from "../storage";
import RingDiagram from "./RingDiagram";

interface StoneDetailProps {
  stone: Stone;
  onClose: () => void;
  onEdit: (stone: Stone) => void;
  onSend: (stone: Stone) => void;
}

const KIND_LABEL: Record<HistoryKind, string> = {
  register: "登记",
  hold: "待补",
  complete: "补齐",
  send: "送镶",
  return: "退回",
  edit: "修改",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export default function StoneDetail({
  stone,
  onClose,
  onEdit,
  onSend,
}: StoneDetailProps) {
  const meta = STATUS_META[stone.status];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`石头 ${stone.code} 详情`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">{stone.batch}</p>
            <h2>
              {stone.code}
              <span className={`badge ${meta.tone}`}>{meta.label}</span>
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>

        {stone.returnReason && (
          <div className="return-banner">↩ {stone.returnReason}</div>
        )}

        <div className="detail-grid">
          <dl className="info-list">
            <InfoRow label="订单号" value={stone.orderNo} />
            <InfoRow label="种类" value={stone.kind} />
            <InfoRow label="形状" value={stone.shape} />
            <InfoRow label="克拉重量" value={`${stone.carat}ct`} />
            <InfoRow label="尺寸" value={stone.size} />
            <InfoRow label="镶嵌位置" value={stone.position} />
            <InfoRow label="净度" value={stone.clarity} />
            <InfoRow label="颜色" value={stone.color} />
            <InfoRow label="切工" value={stone.cut} />
            <InfoRow label="登记时间" value={formatTime(stone.registeredAt)} />
            <InfoRow label="最近更新" value={formatTime(stone.updatedAt)} />
          </dl>
          <div className="detail-side">
            <RingDiagram value={stone.position} />
            <div className="defect-box">
              <h4>缺陷备注</h4>
              {stone.defectNote ? (
                <p>{stone.defectNote}</p>
              ) : (
                <p className="muted">暂无缺陷记录</p>
              )}
            </div>
          </div>
        </div>

        <div className="timeline">
          <h4>历次调整（{stone.history.length}）</h4>
          <ol>
            {[...stone.history].reverse().map((h) => (
              <li key={h.id} className={`tl-${h.kind}`}>
                <span className="tl-dot">{KIND_LABEL[h.kind]}</span>
                <div>
                  <div className="tl-title">{h.title}</div>
                  {h.originals && h.originals.length > 0 && (
                    <ul className="originals">
                      {h.originals.map((o, i) => (
                        <li key={i}>
                          <b>{o.label}</b>：原值 {o.oldValue || "空"} →{" "}
                          {o.newValue || "空"}
                        </li>
                      ))}
                    </ul>
                  )}
                  {h.detail && <p className="tl-detail">{h.detail}</p>}
                  <time>{formatTime(h.at)}</time>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="modal-foot">
          <button className="ghost" onClick={onClose}>
            关闭
          </button>
          {stone.status === "incomplete" && (
            <button className="primary" onClick={() => onEdit(stone)}>
              补齐资料
            </button>
          )}
          {stone.status === "ready" && (
            <button className="primary" onClick={() => onSend(stone)}>
              送镶嵌
            </button>
          )}
          {stone.status === "setting" && (
            <button className="primary" onClick={() => onEdit(stone)}>
              修改资料
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
