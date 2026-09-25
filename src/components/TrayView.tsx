import { useMemo } from "react";
import { SHAPES } from "../constants";
import type { Stone, StoneStatus } from "../types";
import { STATUS_META } from "../types";
import StoneCard from "./StoneCard";

export interface Filters {
  shape: string; // "" = 全部
  status: StoneStatus | "";
  keyword: string;
}

interface Props {
  stones: Stone[];
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onOpen: (stone: Stone) => void;
  onSend: (stone: Stone) => void;
}

const ZONE_ORDER: StoneStatus[] = ["pending", "ready", "set"];

export default function TrayView({ stones, filters, onFiltersChange, onOpen, onSend }: Props) {
  const filtered = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    return stones.filter((s) => {
      if (filters.shape && s.shape !== filters.shape) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (kw) {
        const hay = [s.stoneNo, s.orderNo, s.batchNo, s.species, s.position, s.defect]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [stones, filters]);

  return (
    <div className="tray">
      <div className="filter-bar panel">
        <div className="filter-group">
          <span className="filter-label">形状</span>
          <div className="chips">
            <button
              className={filters.shape === "" ? "chip active" : "chip"}
              onClick={() => onFiltersChange({ ...filters, shape: "" })}
            >
              全部
            </button>
            {SHAPES.map((shape) => (
              <button
                key={shape}
                className={filters.shape === shape ? "chip active" : "chip"}
                onClick={() => onFiltersChange({ ...filters, shape })}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">状态</span>
          <div className="chips">
            <button
              className={filters.status === "" ? "chip active" : "chip"}
              onClick={() => onFiltersChange({ ...filters, status: "" })}
            >
              全部
            </button>
            {ZONE_ORDER.map((st) => (
              <button
                key={st}
                className={`chip ${filters.status === st ? "active" : ""} chip-${STATUS_META[st].tone}`}
                onClick={() => onFiltersChange({ ...filters, status: st })}
              >
                {STATUS_META[st].label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group keyword-group">
          <input
            className="keyword-input"
            placeholder="搜编号 / 批次 / 订单 / 备注"
            value={filters.keyword}
            onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty panel">
          当前筛选下没有石头。{stones.length === 0 ? "先在左侧登记一颗。" : "换个形状或状态试试。"}
        </div>
      )}

      {ZONE_ORDER.map((zone) => {
        const inZone = filtered.filter((s) => s.status === zone);
        if (inZone.length === 0) return null;

        const batches = groupByBatch(inZone);
        return (
          <section key={zone} className={`zone zone-${STATUS_META[zone].tone}`}>
            <div className="zone-head">
              <h3>
                <span className={`zone-dot dot-${STATUS_META[zone].tone}`} />
                {STATUS_META[zone].zone}
              </h3>
              <span className="zone-count">{inZone.length} 颗</span>
            </div>

            {batches.map((group) => (
              <div key={group.batchNo} className="batch-block">
                <div className="batch-head">
                  <span className="batch-no">{group.batchNo}</span>
                  <span className="batch-order">订单 {group.orderNo}</span>
                  <span className="batch-count">{group.items.length} 颗</span>
                </div>
                <div className="stone-grid">
                  {group.items.map((stone) => (
                    <StoneCard key={stone.id} stone={stone} onOpen={onOpen} onSend={onSend} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function groupByBatch(list: Stone[]): { orderNo: string; batchNo: string; items: Stone[] }[] {
  const map = new Map<string, { orderNo: string; batchNo: string; items: Stone[] }>();
  for (const s of [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )) {
    const key = `${s.orderNo}|||${s.batchNo}`;
    if (!map.has(key)) map.set(key, { orderNo: s.orderNo, batchNo: s.batchNo, items: [] });
    map.get(key)!.items.push(s);
  }
  return [...map.values()].sort((a, b) =>
    a.batchNo === b.batchNo
      ? a.orderNo.localeCompare(b.orderNo)
      : a.batchNo.localeCompare(b.batchNo),
  );
}
