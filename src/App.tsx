import { useMemo, useState } from "react";
import "./styles.css";
import { useStones } from "./store";
import type { Stone, StoneInput } from "./types";
import StoneForm from "./components/StoneForm";
import TrayView, { type Filters } from "./components/TrayView";
import OrderView from "./components/OrderView";
import StoneDetail from "./components/StoneDetail";

type Tab = "tray" | "orders";

export default function App() {
  const { stones, addStone, updateStone, sendToSetting } = useStones();
  const [tab, setTab] = useState<Tab>("tray");
  const [filters, setFilters] = useState<Filters>({ shape: "", status: "", keyword: "" });
  const [activeId, setActiveId] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const batches = new Set(stones.map((s) => `${s.orderNo}|${s.batchNo}`));
    const pending = stones.filter((s) => s.status === "pending").length;
    const ready = stones.filter((s) => s.status === "ready").length;
    const setCount = stones.filter((s) => s.status === "set").length;
    const carat = stones.reduce((sum, s) => {
      const n = parseFloat(s.carat);
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
    return { batches: batches.size, pending, ready, setCount, carat };
  }, [stones]);

  const activeStone = activeId ? stones.find((s) => s.id === activeId) ?? null : null;

  const openStone = (s: Stone) => setActiveId(s.id);

  const handleSend = (s: Stone) => sendToSetting(s.id);

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <div>
            <h1>宝石分拣台</h1>
            <p>混单分拣 · 批次归组 · 资料缺漏先入待补区</p>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === "tray" ? "tab active" : "tab"} onClick={() => setTab("tray")}>
            分拣台
          </button>
          <button
            className={tab === "orders" ? "tab active" : "tab"}
            onClick={() => setTab("orders")}
          >
            订单视图
          </button>
        </nav>
      </header>

      <section className="metrics">
        <article>
          <small>分拣批次</small>
          <strong>{metrics.batches}</strong>
        </article>
        <article className="metric-amber">
          <small>待补区</small>
          <strong>{metrics.pending}</strong>
        </article>
        <article className="metric-teal">
          <small>待镶嵌</small>
          <strong>{metrics.ready}</strong>
        </article>
        <article className="metric-rose">
          <small>已送镶</small>
          <strong>{metrics.setCount}</strong>
        </article>
        <article className="metric-muted">
          <small>总克拉（在册）</small>
          <strong>{metrics.carat.toFixed(2)}</strong>
        </article>
      </section>

      <div className="layout">
        <aside className="side-panel">
          <StoneForm onSubmit={(input: StoneInput) => addStone(input)} />
        </aside>

        <section className="content-panel">
          {tab === "tray" ? (
            <TrayView
              stones={stones}
              filters={filters}
              onFiltersChange={setFilters}
              onOpen={openStone}
              onSend={handleSend}
            />
          ) : (
            <OrderView stones={stones} onOpen={openStone} onSend={handleSend} />
          )}
        </section>
      </div>

      <footer className="page-foot">
        所有登记与历次调整只保存在当前浏览器（localStorage），不上传服务器。
      </footer>

      {activeStone && (
        <StoneDetail
          stone={activeStone}
          onClose={() => setActiveId(null)}
          onSave={updateStone}
          onSend={sendToSetting}
        />
      )}
    </main>
  );
}
