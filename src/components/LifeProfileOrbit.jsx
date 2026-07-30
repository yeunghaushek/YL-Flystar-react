import { useMemo, useState } from "react";
import { ORBIT_LAYOUT } from "@/lib/lifeProfile";
import styles from "@/styles/LifeProfile.module.scss";

const KIND_BASE_BEND = {
  expand: 1.35,
  control: -1.45,
  converge: 0.55,
};

const CANVAS_MIN = 5;
const CANVAS_MAX = 95;

function clampCanvas(v) {
  return Math.min(CANVAS_MAX, Math.max(CANVAS_MIN, v));
}

/** 依 bend 在垂直方向微移端點，讓反向／異色線走不同車道 */
function laneOffsetPoint(point, from, to, bend) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const o = Math.sign(bend || 1) * Math.min(4.5, 2.0 + Math.abs(bend) * 1.25);
  return {
    x: clampCanvas(point.x + nx * o),
    y: clampCanvas(point.y + ny * o),
  };
}

function cubicControls(from, to, bend = 1) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const towardCx = 50 - midX;
  const towardCy = 50 - midY;
  const verticalish = Math.abs(dx) < Math.abs(dy) * 0.35;
  // 左／右貼邊垂直廊道（際遇↔實踐等）
  const rimVertical = verticalish && (midX < 24 || midX > 76);

  // 貼邊垂直廊道少拉中心，避免向內大 C；改走沿邊外弧
  const pull = rimVertical ? 0.04 : 0.28;
  const amp = rimVertical ? 9.5 * bend * 0.22 : 9.5 * bend;
  let p1x = from.x + dx * 0.32 + towardCx * pull + nx * amp;
  let p1y = from.y + dy * 0.32 + towardCy * pull + ny * amp;
  let p2x = from.x + dx * 0.68 + towardCx * pull + nx * amp;
  let p2y = from.y + dy * 0.68 + towardCy * pull + ny * amp;

  if (rimVertical) {
    const toCenterLen = Math.hypot(towardCx, towardCy) || 1;
    const ox = -towardCx / toCenterLen;
    const oy = -towardCy / toCenterLen;
    const minOut = 3.6;

    const ensureOutward = (px, py, t) => {
      const baseX = from.x + dx * t;
      const baseY = from.y + dy * t;
      const outward = (px - baseX) * ox + (py - baseY) * oy;
      if (outward >= minOut) return { x: px, y: py };
      const add = minOut - outward;
      return { x: px + ox * add, y: py + oy * add };
    };

    ({ x: p1x, y: p1y } = ensureOutward(p1x, p1y, 0.32));
    ({ x: p2x, y: p2y } = ensureOutward(p2x, p2y, 0.68));
  }

  // 外弧控制點允許更貼邊，避免被 clamp 壓回直線／內彎
  const softClampX = (v) =>
    rimVertical
      ? Math.min(98.5, Math.max(1.2, v))
      : clampCanvas(v);

  return {
    c1: { x: softClampX(p1x), y: clampCanvas(p1y) },
    c2: { x: softClampX(p2x), y: clampCanvas(p2y) },
  };
}

function curveEndpoints(from, to, bend) {
  return {
    from: laneOffsetPoint(from, from, to, bend),
    to: laneOffsetPoint(to, from, to, bend),
  };
}

function curvePath(from, to, bend = 1) {
  const ends = curveEndpoints(from, to, bend);
  const { c1, c2 } = cubicControls(ends.from, ends.to, bend);
  return `M ${ends.from.x} ${ends.from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${ends.to.x} ${ends.to.y}`;
}

/**
 * 自化祿／權／忌：自節點向外繞一圈再回到自己
 * slot：同節點多條自化時由內而外分層（0/1/2）
 */
function selfLoopPath(point, kind = "expand", slot = 0) {
  const cx = 50;
  const cy = 50;
  let dx = point.x - cx;
  let dy = point.y - cy;
  let len = Math.hypot(dx, dy);
  if (len < 0.2) {
    dx = 0;
    dy = -1;
    len = 1;
  }
  const ox = dx / len;
  const oy = dy / len;
  // 權偏左、祿偏右、忌略偏右，避免同節點多圈重疊
  const side = kind === "control" ? -1 : kind === "expand" ? 1 : 0.55;
  const tx = -oy * side;
  const ty = ox * side;

  const r = 6.2 + slot * 2.6;
  const gap = 2.0 + slot * 0.35;
  const sx = clampCanvas(point.x + tx * gap);
  const sy = clampCanvas(point.y + ty * gap);
  const ex = clampCanvas(point.x - tx * gap);
  const ey = clampCanvas(point.y - ty * gap);
  const mx = clampCanvas(point.x + ox * (r + 3.2));
  const my = clampCanvas(point.y + oy * (r + 3.2));

  const c1x = clampCanvas(sx + ox * r + tx * r * 0.75);
  const c1y = clampCanvas(sy + oy * r + ty * r * 0.75);
  const c2x = clampCanvas(mx + tx * r * 0.4);
  const c2y = clampCanvas(my + ty * r * 0.4);
  const c3x = clampCanvas(mx - tx * r * 0.4);
  const c3y = clampCanvas(my - ty * r * 0.4);
  const c4x = clampCanvas(ex + ox * r - tx * r * 0.75);
  const c4y = clampCanvas(ey + oy * r - ty * r * 0.75);

  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${mx} ${my} C ${c3x} ${c3y}, ${c4x} ${c4y}, ${ex} ${ey}`;
}

function sampleCurve(from, to, bend, steps = 16) {
  const ends = curveEndpoints(from, to, bend);
  const { c1, c2 } = cubicControls(ends.from, ends.to, bend);
  const pts = [];
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    pts.push({
      x:
        u * u * u * ends.from.x +
        3 * u * u * t * c1.x +
        3 * u * t * t * c2.x +
        t * t * t * ends.to.x,
      y:
        u * u * u * ends.from.y +
        3 * u * u * t * c1.y +
        3 * u * t * t * c2.y +
        t * t * t * ends.to.y,
    });
  }
  return pts;
}

function minSampleDist(a, b) {
  let min = Infinity;
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) {
      const d = Math.hypot(a[i].x - b[j].x, a[i].y - b[j].y);
      if (d < min) min = d;
    }
  }
  return min;
}

function flowDirectionDot(fi, fj, layout) {
  const a0 = layout[fi.from];
  const a1 = layout[fi.to];
  const b0 = layout[fj.from];
  const b1 = layout[fj.to];
  if (!a0 || !a1 || !b0 || !b1) return 0;
  const ax = a1.x - a0.x;
  const ay = a1.y - a0.y;
  const bx = b1.x - b0.x;
  const by = b1.y - b0.y;
  const al = Math.hypot(ax, ay) || 1;
  const bl = Math.hypot(bx, by) || 1;
  return (ax / al) * (bx / bl) + (ay / al) * (by / bl);
}

/**
 * 分配每條流線的彎曲係數：
 * 1) 先依顏色（祿／權／忌）給不同底值
 * 2) 同起迄（含反向）再扇形拉開
 * 3) 幾何採樣後，凡路徑過近（不論方向／顏色）繼續互推
 */
function buildFlowBends(flows, layout) {
  const bends = {};
  const routed = flows.filter((f) => !f.self && f.from !== f.to);
  routed.forEach((flow, index) => {
    bends[flow.id] = KIND_BASE_BEND[flow.kind] ?? (index % 2 === 0 ? 1.2 : -1.2);
  });

  const pairGroups = new Map();
  routed.forEach((flow) => {
    const key = [flow.from, flow.to].sort().join("|");
    if (!pairGroups.has(key)) pairGroups.set(key, []);
    pairGroups.get(key).push(flow);
  });

  pairGroups.forEach((group) => {
    if (group.length < 2) return;
    const ordered = [...group].sort((a, b) => {
      const rank = { control: 0, converge: 1, expand: 2 };
      return (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9);
    });
    ordered.forEach((flow, index) => {
      const t = ordered.length === 1 ? 0.5 : index / (ordered.length - 1);
      // 同廊道：權紅偏外／左，忌藍偏內／右，明顯分道
      let bend = (t * 2 - 1) * (2.6 + ordered.length * 0.5);
      if (flow.kind === "control") bend = -Math.max(2.2, Math.abs(bend));
      if (flow.kind === "expand") bend = Math.max(2.0, Math.abs(bend));
      if (flow.kind === "converge") {
        bend = index % 2 === 0 ? Math.max(1.8, Math.abs(bend) * 0.9) : -Math.max(1.8, Math.abs(bend) * 0.9);
      }
      bends[flow.id] = bend;
    });
  });

  const MIN_CLEAR = 6.5;
  for (let iter = 0; iter < 20; iter += 1) {
    let moved = false;
    for (let i = 0; i < routed.length; i += 1) {
      for (let j = i + 1; j < routed.length; j += 1) {
        const fi = routed[i];
        const fj = routed[j];
        const fromI = layout[fi.from];
        const toI = layout[fi.to];
        const fromJ = layout[fj.from];
        const toJ = layout[fj.to];
        if (!fromI || !toI || !fromJ || !toJ) continue;

        const dist = minSampleDist(
          sampleCurve(fromI, toI, bends[fi.id]),
          sampleCurve(fromJ, toJ, bends[fj.id])
        );
        if (dist >= MIN_CLEAR) continue;

        let bi = bends[fi.id];
        let bj = bends[fj.id];
        const dirDot = flowDirectionDot(fi, fj, layout);
        // 反向／近平行時更用力岔開
        const boost = Math.abs(dirDot) > 0.55 ? 1.45 : 1;
        const push = Math.max(0.55, (MIN_CLEAR - dist) * 0.28) * boost;

        if (fi.kind !== fj.kind) {
          // 不同顏色固定偏好：權偏負、祿偏正、忌居中偏正
          if (fi.kind === "control") bi = -Math.abs(bi) - push;
          else if (fi.kind === "expand") bi = Math.abs(bi) + push * 0.85;
          else bi += bi >= 0 ? push : -push;

          if (fj.kind === "control") bj = -Math.abs(bj) - push;
          else if (fj.kind === "expand") bj = Math.abs(bj) + push * 0.85;
          else bj += bj >= 0 ? push : -push;

          // 若仍同號，強制一正一負
          if (bi * bj > 0) {
            if (Math.abs(bi) >= Math.abs(bj)) bj = -Math.abs(bj) - push;
            else bi = -Math.abs(bi) - push;
          }
        } else if (Math.abs(bi - bj) < 0.25) {
          bi = Math.abs(bi) + push;
          bj = -Math.abs(bj) - push;
        } else if (bi > bj) {
          bi += push;
          bj -= push;
        } else {
          bi -= push;
          bj += push;
        }

        bends[fi.id] = Math.max(-3.0, Math.min(3.0, bi));
        bends[fj.id] = Math.max(-3.0, Math.min(3.0, bj));
        moved = true;
      }
    }
    if (!moved) break;
  }

  return bends;
}

/** 節點太近時輕推開，避免標籤互相遮住 */
function resolveNodeLayout(baseLayout, minDist = 20) {
  const ids = Object.keys(baseLayout);
  const pos = Object.fromEntries(ids.map((id) => [id, { ...baseLayout[id] }]));
  const axisWeight = { Life: 0, Spirit: 0.2, Health: 0.2 };

  for (let iter = 0; iter < 14; iter += 1) {
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const aId = ids[i];
        const bId = ids[j];
        const a = pos[aId];
        const b = pos[bId];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist >= minDist) continue;

        const push = (minDist - dist) / 2;
        const ux = dx / dist;
        const uy = dy / dist;
        const wA = axisWeight[aId] ?? 1;
        const wB = axisWeight[bId] ?? 1;
        a.x = Math.min(90, Math.max(8, a.x - ux * push * wA));
        a.y = Math.min(90, Math.max(8, a.y - uy * push * wA));
        b.x = Math.min(90, Math.max(8, b.x + ux * push * wB));
        b.y = Math.min(90, Math.max(8, b.y + uy * push * wB));
      }
    }
  }

  return pos;
}

export default function LifeProfileOrbit({ profile, collapsed = true, onToggle }) {
  const [activeId, setActiveId] = useState(null);
  const [hoverId, setHoverId] = useState(null);

  const focusId = hoverId || activeId;

  const relatedFlowIds = useMemo(() => {
    if (!focusId || !profile) return new Set();
    return new Set(
      profile.flows
        .filter((f) => f.from === focusId || f.to === focusId)
        .map((f) => f.id)
    );
  }, [focusId, profile]);

  const layout = useMemo(() => resolveNodeLayout(ORBIT_LAYOUT), []);

  const flowBends = useMemo(
    () => (profile ? buildFlowBends(profile.flows, layout) : {}),
    [profile, layout]
  );

  const selfLoopSlots = useMemo(() => {
    const slots = {};
    if (!profile) return slots;
    const byNode = new Map();
    profile.flows.forEach((flow) => {
      if (!flow.self && flow.from !== flow.to) return;
      if (!byNode.has(flow.from)) byNode.set(flow.from, []);
      byNode.get(flow.from).push(flow);
    });
    byNode.forEach((group) => {
      const ordered = [...group].sort((a, b) => {
        const rank = { expand: 0, control: 1, converge: 2 };
        return (rank[a.kind] ?? 9) - (rank[b.kind] ?? 9);
      });
      ordered.forEach((flow, index) => {
        slots[flow.id] = index;
      });
    });
    return slots;
  }, [profile]);

  if (!profile) return null;

  const { nodeById, flows } = profile;
  const axisIds = new Set(["Spirit", "Life", "Health"]);

  return (
    <section className={styles.orbitSection}>
      <button type="button" className={styles.orbitToggle} onClick={onToggle}>
        星軌圖 {collapsed ? "（展開）" : "（收起）"}
      </button>

      {!collapsed && (
        <div className={styles.orbitStage}>
          <div className={styles.orbitLegend}>
            <span className={styles.legExpand}>祿</span>
            <span className={styles.legControl}>權</span>
            <span className={styles.legConverge}>忌</span>
            <span className={styles.legSelf}>虛線外圈＝自化</span>
          </div>

          <div className={styles.canvas}>
            <div className={styles.rings} aria-hidden="true">
              <div className={`${styles.ring} ${styles.ringOuter}`} />
              <div className={`${styles.ring} ${styles.ringInner}`} />
              <div className={styles.axisBeam} />
            </div>

            <svg className={styles.flowSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowExpand" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="flowControl" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f87171" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f87171" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="flowConverge" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {flows.map((flow) => {
                const from = layout[flow.from];
                const to = layout[flow.to];
                if (!from || !to) return null;
                const isSelf = flow.self || flow.from === flow.to;
                const dimmed = focusId && !relatedFlowIds.has(flow.id);
                const accent =
                  flow.kind === "expand"
                    ? "url(#flowExpand)"
                    : flow.kind === "control"
                      ? "url(#flowControl)"
                      : "url(#flowConverge)";
                const bend = flowBends[flow.id] ?? KIND_BASE_BEND[flow.kind] ?? 1;
                const d = isSelf
                  ? selfLoopPath(from, flow.kind, selfLoopSlots[flow.id] ?? 0)
                  : curvePath(from, to, bend);
                return (
                  <path
                    key={flow.id}
                    d={d}
                    className={`${styles.flowPath} ${styles[`flow_${flow.kind}`]} ${
                      isSelf ? styles.flowSelf : ""
                    } ${dimmed ? styles.flowDim : ""} ${
                      relatedFlowIds.has(flow.id) ? styles.flowHot : ""
                    }`}
                    stroke={accent}
                    fill="none"
                  />
                );
              })}
            </svg>

            {Object.keys(layout).map((id) => {
              const node = nodeById[id];
              const pos = layout[id];
              const isFocus = focusId === id;
              const isRelated =
                !focusId ||
                isFocus ||
                flows.some(
                  (f) =>
                    (f.from === focusId && f.to === id) || (f.to === focusId && f.from === id)
                );
              const isAxis = axisIds.has(id);
              const { expand, control, converge } = node.manifestations;

              return (
                <button
                  key={id}
                  type="button"
                  className={[
                    styles.node,
                    styles[`zone_${node.zone}`],
                    isAxis ? styles.nodeAxis : styles.nodeCompact,
                    isFocus ? styles.nodeActive : "",
                    focusId && !isRelated ? styles.nodeDim : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onMouseEnter={() => setHoverId(id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => setActiveId((prev) => (prev === id ? null : id))}
                  aria-pressed={activeId === id}
                >
                  <span className={styles.nodeTitleOnly}>【{node.title}】</span>
                  {!isAxis && (
                    <span className={styles.nodeManifests}>
                      {expand.state !== "NoManifestation" && (
                        <em className={styles.manifest_expand}>{expand.label}</em>
                      )}
                      {control.state !== "NoManifestation" && (
                        <em className={styles.manifest_control}>{control.label}</em>
                      )}
                      {converge.state !== "NoManifestation" && (
                        <em className={styles.manifest_converge}>{converge.label}</em>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
