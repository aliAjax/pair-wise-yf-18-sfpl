import { useCallback, useEffect, useState } from "react";
import type { HistoryEvent, Stone, StoneInput } from "./types";
import { deriveStatus, loadStones, saveStones, uid } from "./storage";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const EDITABLE_LABELS: Record<string, string> = {
  species: "种类",
  shape: "形状",
  carat: "克拉重量",
  size: "尺寸",
  clarity: "净度",
  color: "颜色",
  cut: "切工",
  position: "镶嵌位置",
  defect: "缺陷备注",
};

const EDITABLE_KEYS = Object.keys(EDITABLE_LABELS);

export function useStones() {
  const [stones, setStones] = useState<Stone[]>(() => loadStones());

  useEffect(() => {
    saveStones(stones);
  }, [stones]);

  /** 登记新石头：同批次编号重复时拒收，先登记的留下 */
  const addStone = useCallback((raw: StoneInput): ActionResult => {
    const input: StoneInput = {
      ...raw,
      orderNo: raw.orderNo.trim(),
      batchNo: raw.batchNo.trim(),
      stoneNo: raw.stoneNo.trim(),
      species: raw.species.trim(),
      shape: raw.shape.trim(),
      carat: raw.carat.trim(),
      size: raw.size.trim(),
      clarity: raw.clarity.trim(),
      color: raw.color.trim(),
      cut: raw.cut.trim(),
      position: raw.position.trim(),
      defect: raw.defect.trim(),
    };

    if (!input.orderNo || !input.batchNo || !input.stoneNo) {
      return { ok: false, message: "订单号、批次号、宝石编号必须填写" };
    }
    if (!input.species || !input.shape) {
      return { ok: false, message: "种类和形状必须填写" };
    }

    const key = (b: string, s: string) => `${b}|||${s}`.toLowerCase();
    const duplicate = stones.some(
      (st) => key(st.batchNo, st.stoneNo) === key(input.batchNo, input.stoneNo),
    );
    if (duplicate) {
      return {
        ok: false,
        message: `批次 ${input.batchNo} 中编号 ${input.stoneNo} 已登记，保留先登记的资料，本次重复录入拒收`,
      };
    }

    const status = deriveStatus(input);
    const now = new Date().toISOString();
    const missing: string[] = [];
    if (!input.size) missing.push("尺寸");
    if (!input.position) missing.push("镶嵌位置");

    const stone: Stone = {
      id: uid(),
      ...input,
      status,
      createdAt: now,
      setAt: undefined,
      history: [
        {
          id: uid(),
          at: now,
          kind: "create",
          text:
            missing.length > 0
              ? `登记入分拣批次 ${input.batchNo}；${missing.join("、")}待补，进入待补区`
              : `登记入分拣批次 ${input.batchNo}，资料齐全进入待镶嵌`,
        },
      ],
    };

    setStones((prev) => [...prev, stone]);
    return {
      ok: true,
      message:
        status === "pending"
          ? `${input.stoneNo} 已登记到 ${input.batchNo}，放入待补区`
          : `${input.stoneNo} 已登记到 ${input.batchNo}，等待镶嵌`,
    };
  }, [stones]);

  /**
   * 修改石头资料。
   * 已送镶的石头若改克拉重量或形状：退回待补，原值与修改时间写入历次调整。
   */
  const updateStone = useCallback((id: string, rawPatch: Partial<StoneInput>): ActionResult => {
    let result: ActionResult = { ok: true, message: "资料已保存" };

    setStones((prev) => {
      const target = prev.find((st) => st.id === id);
      if (!target) {
        result = { ok: false, message: "未找到该石头" };
        return prev;
      }

      const patch: Record<string, string> = {};
      for (const k of EDITABLE_KEYS) {
        if (rawPatch[k as keyof StoneInput] !== undefined) {
          patch[k] = (rawPatch[k as keyof StoneInput] ?? "").toString().trim();
        }
      }

      const changes = EDITABLE_KEYS.filter(
        (k) => patch[k] !== undefined && patch[k] !== (target as unknown as Record<string, string>)[k],
      ).map((k) => ({
        key: k,
        label: EDITABLE_LABELS[k],
        oldValue: (target as unknown as Record<string, string>)[k] ?? "",
        newValue: patch[k],
      }));

      if (changes.length === 0) {
        result = { ok: true, message: "没有改动" };
        return prev;
      }

      const now = new Date().toISOString();
      const newEvents: HistoryEvent[] = [];

      const wasSet = target.status === "set";
      const protectedChanges = wasSet
        ? changes.filter((c) => c.key === "carat" || c.key === "shape")
        : [];
      const returned = protectedChanges.length > 0;

      // 退回事件优先记录，原值与修改时间逐条留存
      for (const c of protectedChanges) {
        newEvents.push({
          id: uid(),
          at: now,
          kind: "return",
          field: c.label,
          oldValue: c.oldValue,
          newValue: c.newValue,
          text: `送镶后${c.label}由「${c.oldValue || "空"}」改为「${c.newValue}」，退回待补核对`,
        });
      }

      for (const c of changes) {
        if (protectedChanges.includes(c)) continue;
        const verb = c.key === "size" || c.key === "position" ? "补齐/修改" : "修改";
        newEvents.push({
          id: uid(),
          at: now,
          kind: "edit",
          field: c.label,
          oldValue: c.oldValue,
          newValue: c.newValue,
          text: c.oldValue
            ? `${verb}${c.label}：「${c.oldValue}」→「${c.newValue || "空"}」`
            : `补齐${c.label}：${c.newValue || "空"}`,
        });
      }

      let nextStatus = target.status;
      let nextSetAt = target.setAt;

      if (returned) {
        nextStatus = "pending";
        nextSetAt = undefined;
      } else if (target.status === "pending") {        const nextSize = patch.size !== undefined ? patch.size : target.size;
        const nextPosition = patch.position !== undefined ? patch.position : target.position;
        const becameReady = Boolean(nextSize && nextPosition);
        if (becameReady) {
          nextStatus = "ready";
          newEvents.push({
            id: uid(),
            at: now,
            kind: "edit",
            text: "资料已补齐，转入待镶嵌",
          });
        }
      } else if (target.status === "ready") {
        const nextSize = patch.size !== undefined ? patch.size : target.size;
        const nextPosition = patch.position !== undefined ? patch.position : target.position;
        if (nextSize && nextPosition) {
          nextStatus = "ready";
        } else {
          nextStatus = "pending";
          const cleared = [
            !nextSize ? "尺寸" : "",
            !nextPosition ? "镶嵌位置" : "",
          ].filter(Boolean);
          newEvents.push({
            id: uid(),
            at: now,
            kind: "edit",
            text: `${cleared.join("、")}缺失，退回待补区`,
          });
        }
      }

      if (returned) {
        result = {
          ok: true,
          message: `已送镶石头${protectedChanges.map((c) => `改动${c.label}`).join("、")}，已退回待补，原值与修改时间已留存`,
        };
      } else if (nextStatus === "ready" && target.status === "pending") {
        result = { ok: true, message: "资料补齐，已转入待镶嵌" };
      } else {
        result = { ok: true, message: "资料修改已记录" };
      }

      return prev.map((st) =>
        st.id === id
          ? {
              ...st,
              ...Object.fromEntries(changes.map((c) => [c.key, c.newValue])),
              status: nextStatus,
              setAt: nextSetAt,
              returned: returned ? true : st.returned,
              history: [...st.history, ...newEvents],
            }
          : st,
      );
    });

    return result;
  }, []);

  /** 送镶嵌：仅资料齐全且在待镶嵌队列的石头可送 */
  const sendToSetting = useCallback((id: string): ActionResult => {
    let result: ActionResult = { ok: true, message: "已送镶嵌" };
    setStones((prev) => {
      const target = prev.find((st) => st.id === id);
      if (!target) {
        result = { ok: false, message: "未找到该石头" };
        return prev;
      }
      if (target.status === "set") {
        result = { ok: false, message: `${target.stoneNo} 已在镶嵌中` };
        return prev;
      }
      if (!target.size.trim() || !target.position.trim()) {
        result = { ok: false, message: `${target.stoneNo} 尺寸或镶嵌位置缺失，请先补齐` };
        return prev;
      }
      const now = new Date().toISOString();
      result = { ok: true, message: `${target.stoneNo} 已送镶嵌（${target.position}）` };
      return prev.map((st) =>
        st.id === id
          ? {
              ...st,
              status: "set",
              setAt: now,
              returned: false,
              history: [
                ...st.history,
                { id: uid(), at: now, kind: "send", text: "资料齐全，送镶嵌" },
              ],
            }
          : st,
      );
    });
    return result;
  }, []);

  return { stones, addStone, updateStone, sendToSetting };
}
