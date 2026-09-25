import { useMemo, useState } from "react";
import { display } from "../constants";
import type { Stone } from "../types";
import { STATUS_META } from "../types";

interface Props {
  stones: Stone[];
  onOpen: (stone: Stone) => void;
  onSend: (stone: Stone) => void;
}

interface BatchGroup {
  orderNo: string;
  batchNo: string;
  items: Stone[];
}

export default function OrderView({ stones, onOpen, onSend }: Props) {
  const [openOrder, setOpenOrder] = useState<string | null>(
    stones[0]?.orderNo ?? null,
  );

  const orders = useMemo(() => {
    const map = new Map<string, BatchGroup[]>();
    for (const s of stones) {
      if (!map.has(s.orderNo)) map.set(s.orderNo, []);
      const groups = map.get(s.orderNo)!;
      let g = groups.find((x) => x.batchNo === s.batchNo);
      if (!g) {
        g = { orderNo: s.orderNo, batchNo: s.batchNo, items: [] };
        groups.push(g);
      }
      g.items.push(s);
    }
    return [...map.entries()]
      .map(([orderNo, groups]) => ({
        orderNo,
        groups: groups.sort((a, b) => a.batchNo.localeCompare(b.batchNo)),
      }))
      .sort((a, b) => a.orderNo.localeCompare(b.orderNo));
  }, [stones]);

  const totalReady = stones.filter((s) => s.status === "ready").length;

  return (
    <div className="order-view panel">
      <div className="order-summary">
        <div>
          <p className="eyebrow">订单视图</p>
          <h2>按批次汇总待镶嵌</h2>
        </div>
        <div className="summary-pill">
          <strong>{totalReady}</strong>
          <span>颗待镶嵌</span>
        </div>
      </div>

      {orders.length === 0 && <div className="empty">还没有订单，先到分拣台登记石头。</div>}

      {orders.map((order) => {
        const all = order.groups.flatMap((g) => g.items);
        const readyCount = all.filter((s) => s.status === "ready").length;
        const pendingCount = all.filter((s) => s.status === "pending").length;
        const setCount = all.filter((s) => s.status === "set").length;
        const open = openOrder === order.orderNo;

        return (
          <div key={order.orderNo} className={`order-card ${open ? "open" : ""}`}>
            <button className="order-head" onClick={() => setOpenOrder(open ? null : order.orderNo)}>
              <div className="order-title">
                <span className="twisty">{open ? "▾" : "▸"}</span>
                <h3>{order.orderNo}</h3>
                <span className="muted">{order.groups.length} 个批次 · 共 {all.length} 颗</span>
              </div>
              <div className="order-counts">
                <span className="count-tag amber">待补 {pendingCount}</span>
                <span className="count-tag teal">待镶嵌 <b>{readyCount}</b></span>
                <span className="count-tag rose">已送镶 {setCount}</span>
              </div>
            </button>

            {open && (
              <div className="batch-rows">
                {order.groups.map((g) => {
                  const ready = g.items.filter((s) => s.status === "ready").length;
                  const pending = g.items.filter((s) => s.status === "pending").length;
                  const set = g.items.filter((s) => s.status === "set").length;
                  const totalCarat = g.items.reduce((sum, s) => {
                    const n = parseFloat(s.carat);
                    return Number.isFinite(n) ? sum + n : sum;
                  }, 0);

                  return (
                    <div key={g.batchNo} className="batch-row">
                      <div className="batch-meta">
                        <h4>{g.batchNo}</h4>
                        <p>
                          待镶嵌 <b className="teal-text">{ready}</b> · 待补 {pending} · 已送镶 {set}
                        </p>
                        <p className="muted">
                          {g.items.length} 颗 · 合计 {totalCarat.toFixed(2)} ct
                        </p>
                      </div>
                      <ul className="batch-stones">
                        {g.items
                          .slice()
                          .sort((a, b) => a.stoneNo.localeCompare(b.stoneNo))
                          .map((s) => (
                            <li key={s.id}>
                              <button
                                className={`batch-stone status-${s.status}`}
                                onClick={() => onOpen(s)}
                                title={s.defect || STATUS_META[s.status].label}
                              >
                                <span className={`dot dot-${STATUS_META[s.status].tone}`} />
                                <span className="bs-no">{s.stoneNo}</span>
                                <span className="bs-info">
                                  {s.species} · {s.shape}
                                </span>
                                <span className="bs-pos">{display(s.position)}</span>
                              </button>
                              {s.status === "ready" && (
                                <button
                                  className="mini-primary inline-send"
                                  onClick={() => onSend(s)}
                                >
                                  送镶
                                </button>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
