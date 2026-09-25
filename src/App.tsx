import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import {
  OriginalValue,
  SHAPES,
  Stone,
  StoneFormValues,
  StoneStatus,
  STATUS_META,
  STATUS_ORDER,
} from "./types";
import {
  caratChanged,
  formatTime,
  isComplete,
  loadStones,
  normalizeCode,
  resetStones,
  saveStones,
  uid,
} from "./storage";
import StoneForm from "./components/StoneForm";
import StoneCard from "./components/StoneCard";
import StoneDetail from "./components/StoneDetail";
import OrderView from "./components/OrderView";

type Tab = "bench" | "orders";

interface Toast {
  id: string;
  text: string;
  tone: "ok" | "warn" | "error";
}

const SHAPE_ALL = "all-shapes";
const STATUS_ALL = "all-statuses";

function missingFields(v: { size: string; position: string }): string[] {
  const m: string[] = [];
  if (!v.size.trim()) m.push("尺寸");
  if (!v.position.trim()) m.push("镶嵌位置");
  return m;
}

export default function App() {
  const [stones, setStones] = useState<Stone[]>(() => loadStones());
  const [tab, setTab] = useState<Tab>("bench");

  const [shapeFilter, setShapeFilter] = useState<string>(SHAPE_ALL);
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_ALL);
  const [keyword, setKeyword] = useState("");

  const [detailStone, setDetailStone] = useState<Stone | null>(null);
  const [editingStone, setEditingStone] = useState<Stone | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    saveStones(stones);
  }, [stones]);

  // 详情 / 编辑弹窗始终展示最新数据
  const liveDetail = detailStone
    ? stones.find((s) => s.id === detailStone.id) ?? null
    : null;
  const liveEditing = editingStone
    ? stones.find((s) => s.id === editingStone.id) ?? null
    : null;

  const pushToast = (text: string, tone: Toast["tone"] = "ok") => {
    const id = uid("toast");
    setToasts((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const findDuplicate = (
    values: StoneFormValues,
    excludeId?: string
  ): Stone | undefined => {
    const code = normalizeCode(values.code);
    return stones.find(
      (s) =>
        s.id !== excludeId &&
        s.batch.trim() === values.batch.trim() &&
        normalizeCode(s.code) === code
    );
  };

  /* ---------- 登记 ---------- */
  const handleRegister = (values: StoneFormValues) => {
    if (!values.code.trim() || !values.orderNo.trim() || !values.batch.trim()) {
      setFormError("宝石编号、订单号、批次为必填项。");
      return;
    }
    const dup = findDuplicate(values);
    if (dup) {
      setFormError(
        `批次 ${values.batch} 中编号 ${normalizeCode(values.code)} 已由 ${formatTime(
          dup.registeredAt
        )} 登记的记录占用，同批次重复编号以先登记的为准，本次不录入。`
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const missing = missingFields(values);
    const complete = missing.length === 0;
    const stone: Stone = {
      id: uid("st"),
      code: values.code.trim(),
      orderNo: values.orderNo.trim(),
      batch: values.batch.trim(),
      kind: values.kind.trim(),
      shape: values.shape,
      carat: values.carat.trim(),
      size: values.size.trim(),
      clarity: values.clarity.trim(),
      color: values.color.trim(),
      cut: values.cut.trim(),
      position: values.position.trim(),
      defectNote: values.defectNote.trim(),
      status: complete ? "ready" : "incomplete",
      returnReason: complete
        ? undefined
        : `缺少资料：${missing.join("、")}未填`,
      registeredAt: nowIso,
      updatedAt: nowIso,
      history: [
        {
          id: uid("ev"),
          at: nowIso,
          kind: "register",
          title: "登记入库",
        },
        ...(complete
          ? []
          : [
              {
                id: uid("ev"),
                at: nowIso,
                kind: "hold" as const,
                title: "放入待补区",
                detail: `${missing.join("、")}未填`,
              },
            ]),
      ],
    };

    setStones((prev) => [stone, ...prev]);
    setFormError(null);
    setFormResetKey((k) => k + 1);
    pushToast(
      complete
        ? `${stone.code} 已登记到批次 ${stone.batch}，资料齐备，进入待镶嵌。`
        : `${stone.code} 缺少${missing.join("、")}，已放入待补区。`,
      complete ? "ok" : "warn"
    );
  };

  /* ---------- 送镶 ---------- */
  const handleSend = (stone: Stone) => {
    if (!isComplete(stone)) {
      pushToast("尺寸或镶嵌位仍缺，不能送镶。", "error");
      return;
    }
    const nowIso = new Date().toISOString();
    const next: Stone = {
      ...stone,
      status: "setting",
      returnReason: undefined,
      updatedAt: nowIso,
      history: [
        ...stone.history,
        { id: uid("ev"), at: nowIso, kind: "send" as const, title: "送镶嵌车间" },
      ],
    };
    setStones((prev) => prev.map((s) => (s.id === stone.id ? next : s)));
    pushToast(`${stone.code} 已送镶嵌车间。`);
    if (liveDetail) setDetailStone(next);
  };

  /* ---------- 编辑 / 补齐 ---------- */
  const handleUpdate = (values: StoneFormValues) => {
    if (!liveEditing) return;
    if (!values.code.trim() || !values.orderNo.trim() || !values.batch.trim()) {
      setFormError("宝石编号、订单号、批次为必填项。");
      return;
    }
    const dup = findDuplicate(values, liveEditing.id);
    if (dup) {
      setFormError(
        `批次 ${values.batch} 中编号 ${normalizeCode(values.code)} 已存在（先登记者保留），无法改成该编号。`
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const history = [...liveEditing.history];
    const originals: OriginalValue[] = [];
    const watchChanged: Array<{ key: "carat" | "shape"; label: string }> = [];
    if (caratChanged(liveEditing.carat, values.carat)) {
      watchChanged.push({ key: "carat", label: "克拉重量" });
      originals.push({
        label: "克拉重量",
        oldValue: `${liveEditing.carat || "空"}ct`,
        newValue: `${values.carat.trim() || "空"}ct`,
      });
    }
    if (liveEditing.shape !== values.shape) {
      watchChanged.push({ key: "shape", label: "形状" });
      originals.push({
        label: "形状",
        oldValue: liveEditing.shape,
        newValue: values.shape,
      });
    }

    // 其它字段的普通变更也记入历次调整
    const plainKeys: Array<{ key: keyof StoneFormValues; label: string }> = [
      { key: "kind", label: "种类" },
      { key: "size", label: "尺寸" },
      { key: "position", label: "镶嵌位置" },
      { key: "clarity", label: "净度" },
      { key: "color", label: "颜色" },
      { key: "cut", label: "切工" },
      { key: "defectNote", label: "缺陷备注" },
      { key: "code", label: "宝石编号" },
      { key: "batch", label: "批次" },
      { key: "orderNo", label: "订单号" },
    ];
    for (const { key, label } of plainKeys) {
      if (liveEditing[key] !== values[key].trim()) {
        originals.push({
          label,
          oldValue: liveEditing[key] || "空",
          newValue: values[key].trim() || "空",
        });
      }
    }

    const wasIncomplete = liveEditing.status === "incomplete";
    const wasSetting = liveEditing.status === "setting";
    const next: Stone = {
      ...liveEditing,
      code: values.code.trim(),
      orderNo: values.orderNo.trim(),
      batch: values.batch.trim(),
      kind: values.kind.trim(),
      shape: values.shape,
      carat: values.carat.trim(),
      size: values.size.trim(),
      clarity: values.clarity.trim(),
      color: values.color.trim(),
      cut: values.cut.trim(),
      position: values.position.trim(),
      defectNote: values.defectNote.trim(),
    };

    if (wasSetting && watchChanged.length > 0) {
      // 已送镶后改克拉或形状：退回待补，原值与修改时间一并留存
      const watchOriginals = originals.filter(
        (o) => o.label === "克拉重量" || o.label === "形状"
      );
      next.status = "incomplete";
      next.returnReason = `送镶后修改了${watchChanged
        .map((w) => `「${w.label}」`)
        .join("、")}，退回待补复核`;
      history.push({
        id: uid("ev"),
        at: nowIso,
        kind: "return",
        title: "已送镶后改动，退回待补",
        detail: `${watchOriginals
          .map((o) => `${o.label}：${o.oldValue} → ${o.newValue}`)
          .join("；")}；原值与修改时间已留存。`,
        originals: watchOriginals,
      });
      pushToast(
        `${next.code} 已送镶但${watchChanged
          .map((w) => w.label)
          .join("、")}有改动，已退回待补，原值已留存。`,
        "warn"
      );
    } else {
      const missing = missingFields(values);
      if (wasIncomplete && missing.length === 0) {
        // 待补资料补齐 → 待镶嵌
        next.status = "ready";
        next.returnReason = undefined;
        history.push({
          id: uid("ev"),
          at: nowIso,
          kind: "complete",
          title: "资料补齐（尺寸 / 镶嵌位）",
          ...(originals.length ? { originals } : {}),
        });
        pushToast(`${next.code} 资料已补齐，送到待镶嵌队列。`);
      } else if (!wasIncomplete && missing.length > 0) {
        // 原本可排镶的石头被改缺尺寸 / 镶嵌位 → 放入待补
        next.status = "incomplete";
        next.returnReason = `缺少资料：${missing.join("、")}未填`;
        history.push({
          id: uid("ev"),
          at: nowIso,
          kind: "hold",
          title: "资料出现缺项，放入待补区",
          detail: `${missing.join("、")}未填`,
          ...(originals.length ? { originals } : {}),
        });
        pushToast(
          `${next.code} 缺少${missing.join("、")}，已移入待补区。`,
          "warn"
        );
      } else if (wasIncomplete && missing.length > 0 && originals.length > 0) {
        next.returnReason = `缺少资料：${missing.join("、")}未填`;
        history.push({
          id: uid("ev"),
          at: nowIso,
          kind: "edit",
          title: "更新资料，仍缺项",
          detail: `仍缺：${missing.join("、")}，继续留在待补区。`,
          originals,
        });
      } else if (originals.length > 0) {
        history.push({
          id: uid("ev"),
          at: nowIso,
          kind: "edit",
          title: "修改资料",
          originals,
        });
        pushToast(`${next.code} 的资料已更新。`);
      } else {
        pushToast("没有检测到改动。");
      }
    }

    next.history = history;
    next.updatedAt = nowIso;

    setStones((prev) => prev.map((s) => (s.id === next.id ? next : s)));
    setFormError(null);
    setEditingStone(null);
    if (liveDetail) setDetailStone(next);
  };

  /* ---------- 筛选与分组 ---------- */
  const filtered = useMemo(() => {
    const kw = keyword.trim().toUpperCase();
    return stones.filter((s) => {
      if (shapeFilter !== SHAPE_ALL && s.shape !== shapeFilter) return false;
      if (statusFilter !== STATUS_ALL && s.status !== statusFilter) return false;
      if (
        kw &&
        !`${s.code} ${s.kind} ${s.batch} ${s.orderNo} ${s.position}`
          .toUpperCase()
          .includes(kw)
      )
        return false;
      return true;
    });
  }, [stones, shapeFilter, statusFilter, keyword]);

  const pendingStones = filtered.filter((s) => s.status === "incomplete");
  const activeStones = filtered.filter((s) => s.status !== "incomplete");

  const batches = useMemo(() => {
    const map = new Map<string, Stone[]>();
    for (const s of activeStones) {
      const arr = map.get(s.batch) ?? [];
      arr.push(s);
      map.set(s.batch, arr);
    }
    return [...map.entries()]
      .map(([batch, items]) => ({
        batch,
        items: items.sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => a.batch.localeCompare(b.batch));
  }, [activeStones]);

  const existingBatches = useMemo(
    () =>
      [...new Set(stones.map((s) => s.batch))]
        .filter(Boolean)
        .sort(),
    [stones]
  );
  const existingOrders = useMemo(
    () =>
      [...new Set(stones.map((s) => s.orderNo))]
        .filter(Boolean)
        .sort(),
    [stones]
  );

  /* ---------- 顶部指标 ---------- */
  const metrics = useMemo(() => {
    const batchCount = new Set(stones.map((s) => s.batch)).size;
    return {
      batch: batchCount,
      ready: stones.filter((s) => s.status === "ready").length,
      defects: stones.filter((s) => s.defectNote.trim() !== "").length,
      carat: stones.reduce((sum, s) => {
        const c = parseFloat(s.carat);
        return sum + (Number.isNaN(c) ? 0 : c);
      }, 0),
    };
  }, [stones]);

  const handleReset = () => {
    if (
      window.confirm(
        "将清空本机全部登记并恢复演示数据（仅影响这台浏览器），确定继续？"
      )
    ) {
      setStones(resetStones());
      pushToast("已恢复演示数据。");
    }
  };

  const locateBatch = (batch: string) => {
    setTab("bench");
    setStatusFilter(STATUS_ALL);
    setShapeFilter(SHAPE_ALL);
    setKeyword(batch);
  };

  const openEdit = (stone: Stone) => {
    setFormError(null);
    setEditingStone(stone);
  };

  const closeEditing = () => {
    setEditingStone(null);
    setFormError(null);
  };

  return (
    <main className="app">
      <section className="hero">
        <p>hxyfront-62006 · 珠宝镶嵌工作室 · 数据仅保存在本机浏览器</p>
        <h1>宝石分拣台</h1>
        <span>
          混单按批次归组登记，同批次重复编号以先登记的为准；缺尺寸或镶嵌位的石头进待补区，补齐后再送镶嵌。
          已送镶的石头若改动克拉重量或形状，自动退回待补并留存原值与修改时间。
        </span>
      </section>

      <section className="metrics">
        <article>
          <small>分拣批次</small>
          <strong>{metrics.batch}</strong>
        </article>
        <article>
          <small>待镶嵌</small>
          <strong className="ok-text">{metrics.ready}</strong>
        </article>
        <article>
          <small>缺陷备注</small>
          <strong>{metrics.defects}</strong>
        </article>
        <article>
          <small>总克拉</small>
          <strong>{metrics.carat.toFixed(2)}</strong>
        </article>
      </section>

      <div className="tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "bench"}
          className={tab === "bench" ? "active" : ""}
          onClick={() => setTab("bench")}
        >
          分拣台
        </button>
        <button
          role="tab"
          aria-selected={tab === "orders"}
          className={tab === "orders" ? "active" : ""}
          onClick={() => setTab("orders")}
        >
          订单视图
        </button>
      </div>

      {tab === "orders" ? (
        <section className="panel">
          <OrderView
            stones={stones}
            onViewStone={setDetailStone}
            onLocateBatch={locateBatch}
          />
        </section>
      ) : (
        <section className="workspace">
          <aside className="panel entry-panel">
            <div className="heading">
              <div>
                <p>本机登记</p>
                <h2>新到石头</h2>
              </div>
            </div>
            <StoneForm
              key={formResetKey}
              batches={existingBatches}
              orders={existingOrders}
              submitLabel="登记入托盘"
              onSubmit={handleRegister}
              error={formError}
            />
          </aside>

          <div className="bench-main">
            <section className="panel filter-panel">
              <div className="filter-row">
                <div className="filter-group">
                  <span className="filter-label">形状</span>
                  <div className="chips">
                    <FilterChip
                      active={shapeFilter === SHAPE_ALL}
                      onClick={() => setShapeFilter(SHAPE_ALL)}
                    >
                      全部
                    </FilterChip>
                    {SHAPES.map((s) => (
                      <FilterChip
                        key={s}
                        active={shapeFilter === s}
                        onClick={() => setShapeFilter(s)}
                      >
                        {s}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <div className="filter-group">
                  <span className="filter-label">状态</span>
                  <div className="chips">
                    <FilterChip
                      active={statusFilter === STATUS_ALL}
                      onClick={() => setStatusFilter(STATUS_ALL)}
                    >
                      全部
                    </FilterChip>
                    {STATUS_ORDER.map((s: StoneStatus) => (
                      <FilterChip
                        key={s}
                        active={statusFilter === s}
                        tone={STATUS_META[s].tone}
                        onClick={() => setStatusFilter(s)}
                      >
                        {STATUS_META[s].label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
                <input
                  className="search-box"
                  placeholder="搜编号 / 种类 / 批次 / 订单 / 镶嵌位"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </section>

            <section className={`panel hold-zone${pendingStones.length ? "" : " empty-zone"}`}>
              <div className="zone-head">
                <div>
                  <h2>待补区</h2>
                  <p>尺寸或镶嵌位没填先放这里；已送镶改动退回的也在此复核</p>
                </div>
                <span className="zone-count">{pendingStones.length} 颗</span>
              </div>
              {pendingStones.length > 0 ? (
                <div className="stone-grid">
                  {pendingStones.map((s) => (
                    <StoneCard
                      key={s.id}
                      stone={s}
                      onView={setDetailStone}
                      onEdit={openEdit}
                      onSend={handleSend}
                    />
                  ))}
                </div>
              ) : (
                <p className="zone-empty">
                  当前筛选下没有待补石头，资料齐备的可直接送镶。
                </p>
              )}
            </section>

            {batches.length > 0 ? (
              batches.map(({ batch, items }) => {
                const ready = items.filter((s) => s.status === "ready").length;
                const setting = items.filter((s) => s.status === "setting").length;
                const orders = [...new Set(items.map((s) => s.orderNo))].join("、");
                return (
                  <section key={batch} className="panel batch-panel">
                    <div className="zone-head">
                      <div>
                        <h2>批次 {batch}</h2>
                        <p>订单 {orders} · {items.length} 颗在册</p>
                      </div>
                      <div className="batch-pills">
                        <span className="pill ok">待镶嵌 {ready}</span>
                        <span className="pill done">已送镶 {setting}</span>
                      </div>
                    </div>
                    <div className="stone-grid">
                      {items.map((s) => (
                        <StoneCard
                          key={s.id}
                          stone={s}
                          onView={setDetailStone}
                          onEdit={openEdit}
                          onSend={handleSend}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <section className="panel empty-zone">
                <p className="zone-empty">
                  当前筛选下没有资料齐备的石头。可登记新石头，或调整筛选条件。
                </p>
              </section>
            )}

            <p className="local-note">
              所有登记、修改与历次调整只保存在这台浏览器（localStorage），不会上传。
              <button className="link-btn" onClick={handleReset}>
                恢复演示数据
              </button>
            </p>
          </div>
        </section>
      )}

      {liveDetail && (
        <StoneDetail
          stone={liveDetail}
          onClose={() => setDetailStone(null)}
          onEdit={(s) => {
            setDetailStone(null);
            openEdit(s);
          }}
          onSend={handleSend}
        />
      )}

      {liveEditing && (
        <div className="modal-backdrop" onClick={closeEditing}>
          <div
            className="modal modal-form"
            role="dialog"
            aria-modal="true"
            aria-label={`编辑石头 ${liveEditing.code}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">{liveEditing.batch}</p>
                <h2>
                  修改 {liveEditing.code}
                  <span className={`badge ${STATUS_META[liveEditing.status].tone}`}>
                    {STATUS_META[liveEditing.status].label}
                  </span>
                </h2>
              </div>
              <button className="icon-btn" onClick={closeEditing} aria-label="关闭">
                ×
              </button>
            </div>
            {liveEditing.status === "setting" && (
              <div className="warn-banner">
                该石头已送镶：若修改克拉重量或形状，将退回待补区，原值与修改时间会留存在历次调整中。
              </div>
            )}
            <StoneForm
              key={liveEditing.id}
              initial={liveEditing}
              batches={existingBatches}
              orders={existingOrders}
              submitLabel="保存修改"
              onSubmit={handleUpdate}
              onCancel={closeEditing}
              error={formError}
            />
          </div>
        </div>
      )}

      <div className="toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            {t.text}
          </div>
        ))}
      </div>
    </main>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "warn" | "ok" | "done";
}) {
  return (
    <button
      className={`chip${active ? " active" : ""}${tone ? ` ${tone}` : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

