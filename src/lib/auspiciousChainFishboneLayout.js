import { assignChainLayers } from "@/lib/auspiciousChain";

const STAR_W = 60;
const STAR_H = 36;
const PALACE_RX = 48;
const PALACE_RY = 18;
const STAR_PALACE_GAP = 16;
const SIDE_W = 76;
const SIDE_H = 26;
const SIDE_GAP = 8;
const LINK_LEN = 14;
const SELF_LINK_LEN = Math.round(LINK_LEN * 1.5);
const ABOVE_OFFSET = 26;
const SIDE_SPREAD = 14;
const PADDING_X = 20;
const PADDING_TOP = 16;
const HEADER_H = 36;
const JI_SOURCE_GAP = 8;
const JI_CONNECTOR_GAP = 108;
const TERMINAL_JI_GAP = 44;
const STRUCTURE_COL_SCALE = 1.2;
const NODE_BLOCK_H = STAR_H + STAR_PALACE_GAP + PALACE_RY * 2;
const COL_GAP = 16;

function isSelfLu(label) {
  return label === "自化祿";
}

function isSelfQuan(label) {
  return label === "自化權";
}

function centerStack(count, itemSize, gap) {
  if (count <= 0) return [];
  const total = count * itemSize + (count - 1) * gap;
  const start = -total / 2 + itemSize / 2;
  return Array.from({ length: count }, (_, i) => start + i * (itemSize + gap));
}

function splitSources(innerGreen, innerRed) {
  const greensAbove = [];
  const greensSelf = [];
  (innerGreen || []).forEach((label) => (isSelfLu(label) ? greensSelf : greensAbove).push(label));

  const redsAbove = [];
  const redsSelf = [];
  (innerRed || []).forEach((label) => (isSelfQuan(label) ? redsSelf : redsAbove).push(label));

  return { greensAbove, greensSelf, redsAbove, redsSelf };
}

function colWidthForNode(node) {
  const { greensAbove, greensSelf, redsAbove, redsSelf } = splitSources(node.innerGreen, node.innerRed);
  const aboveCount = Math.max(greensAbove.length, redsAbove.length, 1);
  const selfCount = greensSelf.length + redsSelf.length;
  const spread = SIDE_W + SIDE_SPREAD + LINK_LEN;
  return Math.max(STAR_W + spread * 2 + 12, STAR_W + (aboveCount - 1) * 10, selfCount > 0 ? STAR_W + spread * 2 + 20 : 0);
}

function layerRowHeight(indices, graph) {
  const palaceBottomOffset = STAR_H + STAR_PALACE_GAP + PALACE_RY;
  return palaceBottomOffset + JI_CONNECTOR_GAP;
}

function layoutNodeStep(node, idx, cx, starY, nodes, edges, graphIdx) {
  const starId = `star-${graphIdx}`;
  const palaceId = `palace-${graphIdx}`;

  nodes.push({
    id: starId,
    type: "star",
    x: cx - STAR_W / 2,
    y: starY,
    w: STAR_W,
    h: STAR_H,
    label: node.star,
    cx,
    cy: starY + STAR_H / 2,
  });

  const palaceY = starY + STAR_H + STAR_PALACE_GAP;
  nodes.push({
    id: palaceId,
    type: "palace",
    x: cx - PALACE_RX,
    y: palaceY - PALACE_RY,
    w: PALACE_RX * 2,
    h: PALACE_RY * 2,
    label: node.name,
    cx,
    cy: palaceY,
  });

  edges.push({
    id: `palace-star-${graphIdx}`,
    type: "palace-star",
    x1: cx,
    y1: palaceY - PALACE_RY,
    x2: cx,
    y2: starY + STAR_H,
  });

  const { greensAbove, greensSelf, redsAbove, redsSelf } = splitSources(node.innerGreen, node.innerRed);

  const targetY = starY + STAR_H / 2;
  const routeY = targetY;
  const greenOffsets = centerStack(greensAbove.length, SIDE_H, SIDE_GAP);
  greensAbove.forEach((label, i) => {
    const id = `green-${graphIdx}-${i}`;
    const anchorX = cx + STAR_W / 2;
    const x = anchorX + LINK_LEN;
    const boxCx = x + SIDE_W / 2;
    const y = starY - ABOVE_OFFSET - SIDE_H + greenOffsets[i] - SIDE_H / 2;
    nodes.push({ id, type: "green", x, y, w: SIDE_W, h: SIDE_H, label, self: false });
    edges.push({
      id: `e-${id}-${starId}`,
      type: "lu",
      self: false,
      x1: boxCx,
      y1: y + SIDE_H,
      x2: anchorX,
      y2: targetY,
      bendY: routeY,
    });
  });

  const redOffsets = centerStack(redsAbove.length, SIDE_H, SIDE_GAP);
  redsAbove.forEach((label, i) => {
    const id = `red-${graphIdx}-${i}`;
    const anchorX = cx - STAR_W / 2;
    const x = anchorX - LINK_LEN - SIDE_W;
    const boxCx = x + SIDE_W / 2;
    const y = starY - ABOVE_OFFSET - SIDE_H + redOffsets[i] - SIDE_H / 2;
    nodes.push({ id, type: "red", x, y, w: SIDE_W, h: SIDE_H, label, self: false });
    edges.push({
      id: `e-${id}-${starId}`,
      type: "quan",
      self: false,
      x1: boxCx,
      y1: y + SIDE_H,
      x2: anchorX,
      y2: targetY,
      bendY: routeY,
    });
  });

  greensSelf.forEach((label, i) => {
    const id = `green-self-${graphIdx}-${i}`;
    const edgeX = cx + PALACE_RX;
    const upY = palaceY - PALACE_RY - SELF_LINK_LEN;
    const x = edgeX + SELF_LINK_LEN + i * (SIDE_W + 8);
    const y = upY - SIDE_H / 2;
    const targetX = x + SIDE_W / 2;
    const targetY = y + SIDE_H;
    nodes.push({ id, type: "green", x, y, w: SIDE_W, h: SIDE_H, label, self: true });
    edges.push({
      id: `e-${palaceId}-${id}`,
      type: "lu-self",
      self: true,
      x1: edgeX,
      y1: palaceY,
      x2: targetX,
      y2: targetY,
      bendX: targetX,
    });
  });

  redsSelf.forEach((label, i) => {
    const id = `red-self-${graphIdx}-${i}`;
    const edgeX = cx - PALACE_RX;
    const upY = palaceY - PALACE_RY - SELF_LINK_LEN;
    const x = edgeX - SELF_LINK_LEN - SIDE_W - i * (SIDE_W + 8);
    const y = upY - SIDE_H / 2;
    const targetX = x + SIDE_W / 2;
    const targetY = y + SIDE_H;
    nodes.push({ id, type: "red", x, y, w: SIDE_W, h: SIDE_H, label, self: true });
    edges.push({
      id: `e-${palaceId}-${id}`,
      type: "quan-self",
      self: true,
      x1: edgeX,
      y1: palaceY,
      x2: targetX,
      y2: targetY,
      bendX: targetX,
    });
  });

  return {
    palaceY,
    palaceBottom: palaceY + PALACE_RY,
    cx,
    starY,
    starTop: starY,
    starBottom: starY + STAR_H,
  };
}

function layoutTerminal(node, graphIdx, cx, palaceBottom, nodes, edges, options = {}) {
  const ob = node.outerBlue;
  if (!ob || !ob.name) return;
  const cycle = Boolean(options.cycle);

  if (ob.name === "自化忌" || ob.name === "自化忌出" || ob.name === "忌出") {
    const ty = palaceBottom + TERMINAL_JI_GAP;
    const terminalLabel = ob.name === "忌出" ? "自化忌出" : ob.name;
    const id = `terminal-${graphIdx}`;
    nodes.push({
      id,
      type: "blue",
      x: cx - SIDE_W / 2,
      y: ty,
      w: SIDE_W,
      h: SIDE_H,
      label: terminalLabel,
      self: true,
    });
    edges.push({
      id: `blue-${graphIdx}-terminal`,
      type: "ji",
      x1: cx,
      y1: palaceBottom,
      x2: cx,
      y2: ty,
      straight: true,
    });
    return;
  }

  if (ob.star) {
    const ty = palaceBottom + TERMINAL_JI_GAP;
    const tStarId = `terminal-star-${graphIdx}`;
    nodes.push({
      id: tStarId,
      type: "star",
      x: cx - STAR_W / 2,
      y: ty,
      w: STAR_W,
      h: STAR_H,
      label: ob.star,
      cx,
      cy: ty + STAR_H / 2,
      terminal: true,
      cycle,
    });
    edges.push({
      id: `blue-${graphIdx}-tstar`,
      type: "ji",
      x1: cx,
      y1: palaceBottom,
      x2: cx,
      y2: ty,
      straight: true,
      cycle,
    });

    if (ob.name.endsWith("宮") || ob.name === "命宮") {
      const py = ty + STAR_H + STAR_PALACE_GAP;
      nodes.push({
        id: `terminal-palace-${graphIdx}`,
        type: "palace",
        x: cx - PALACE_RX,
        y: py - PALACE_RY,
        w: PALACE_RX * 2,
        h: PALACE_RY * 2,
        label: ob.name,
        cx,
        cy: py,
        terminal: true,
        cycle,
      });
    }

    if (cycle) {
      nodes.push({
        id: `cycle-badge-${graphIdx}`,
        type: "cycle-badge",
        x: cx + STAR_W / 2 + 6,
        y: ty + STAR_H / 2 - 10,
        w: 36,
        h: 20,
        label: "循環",
        cx: cx + STAR_W / 2 + 24,
        cy: ty + STAR_H / 2,
      });
    }
  }
}

function isOuterBlueAlreadyInGraph(node, indices, graph) {
  const ob = node?.outerBlue;
  if (!ob?.name || !ob?.star) return false;
  if (ob.name === "自化忌" || ob.name === "自化忌出" || ob.name === "忌出") return false;
  return indices.some((i) => graph[i]?.name === ob.name && graph[i]?.star === ob.star);
}

function buildJiChannelY(indices, graph, posByIdx) {
  const channelByTarget = new Map();
  indices.forEach((idx) => {
    const tail = graph[idx]?.tail;
    if (typeof tail !== "number" || !indices.includes(tail)) return;
    const source = posByIdx.get(idx);
    if (!source) return;
    const bottom = source.palaceBottom;
    const prev = channelByTarget.get(tail);
    channelByTarget.set(tail, prev === undefined ? bottom : Math.max(prev, bottom));
  });
  channelByTarget.forEach((bottom, tail) => {
    channelByTarget.set(tail, bottom + JI_SOURCE_GAP);
  });
  return channelByTarget;
}

function addBlueEdge(edges, id, source, target, channelY) {
  if (!source || !target) return;
  const x1 = source.cx;
  const y1 = source.palaceBottom;
  const x2 = target.cx;
  const y2 = target.starTop;
  const gap = y2 - y1;
  if (gap <= 0) return;

  if (Math.abs(x1 - x2) < 3) {
    edges.push({ id, type: "ji", x1, y1, x2, y2, straight: true });
    return;
  }

  const midY = y1 + gap / 2;
  const bendY = Math.max(y1 + 4, Math.min(typeof channelY === "number" ? channelY : midY, y2 - 4));
  edges.push({ id, type: "ji", x1, y1, x2, y2, bendY });
}

function buildIncomingTails(indices, graph) {
  const map = new Map();
  indices.forEach((idx) => {
    const tail = graph[idx]?.tail;
    if (typeof tail === "number" && indices.includes(tail)) {
      if (!map.has(tail)) map.set(tail, []);
      map.get(tail).push(idx);
    }
  });
  return map;
}

function assignColumnCx(indices, graph, roots, colWidth, incomingTails, displayLayer) {
  const cxByIdx = new Map();
  roots.forEach((rootIdx, col) => {
    cxByIdx.set(rootIdx, PADDING_X + col * colWidth + colWidth / 2);
  });

  const sorted = [...indices]
    .filter((idx) => !cxByIdx.has(idx))
    .sort((a, b) => (displayLayer.get(a) || 0) - (displayLayer.get(b) || 0));

  sorted.forEach((idx) => {
    const parents = incomingTails.get(idx) || [];
    const parentCxs = parents.map((p) => cxByIdx.get(p)).filter((v) => typeof v === "number");
    if (parentCxs.length === 0) {
      cxByIdx.set(idx, PADDING_X + colWidth / 2);
    } else if (parentCxs.length === 1) {
      cxByIdx.set(idx, parentCxs[0]);
    } else {
      cxByIdx.set(idx, parentCxs.reduce((s, v) => s + v, 0) / parentCxs.length);
    }
  });

  return cxByIdx;
}

function computeLayoutBounds(nodes, edges = [], padding = 18) {
  if (!nodes.length) {
    return { viewBox: "0 0 200 80", width: 200, height: 80 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.w);
    maxY = Math.max(maxY, n.y + n.h);
  });

  edges.forEach((e) => {
    if (typeof e.x1 === "number") {
      minX = Math.min(minX, e.x1, e.x2 ?? e.x1);
      maxX = Math.max(maxX, e.x1, e.x2 ?? e.x1);
      minY = Math.min(minY, e.y1, e.y2 ?? e.y1);
      maxY = Math.max(maxY, e.y1, e.y2 ?? e.y1);
    }
    if (typeof e.bendX === "number") {
      minX = Math.min(minX, e.bendX);
      maxX = Math.max(maxX, e.bendX);
    }
    if (typeof e.dropY === "number") {
      maxY = Math.max(maxY, e.dropY);
    }
  });

  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return {
    viewBox: `${minX - padding} ${minY - padding} ${width} ${height}`,
    width,
    height,
  };
}

function findRoots(indices, graph) {
  const incoming = new Set();
  indices.forEach((idx) => {
    const t = graph[idx]?.tail;
    if (typeof t === "number" && indices.includes(t)) incoming.add(t);
  });
  return indices.filter((idx) => !incoming.has(idx)).sort((a, b) => a - b);
}

function buildRowYMap(sortedLayers, graph) {
  const yForLayer = new Map();
  let yCursor = PADDING_TOP + HEADER_H;
  sortedLayers.forEach(([layer, arr]) => {
    yForLayer.set(layer, yCursor);
    yCursor += layerRowHeight(arr, graph);
  });
  return yForLayer;
}

/**
 * Layout one connected component from buildAuspiciousGraph.
 * Ji lines point to star top; merge targets are centered between incoming columns.
 */
export function layoutGraphComponent(component) {
  const { indices, graph, chainLuCount, chainQuanCount, leader } = component;
  if (!indices?.length || !graph) {
    return { width: 200, height: 80, nodes: [], edges: [], header: null };
  }

  const displayLayer = assignChainLayers(indices, graph);

  const layerMap = new Map();
  indices.forEach((idx) => {
    const layer = displayLayer.get(idx) || 0;
    if (!layerMap.has(layer)) layerMap.set(layer, []);
    layerMap.get(layer).push(idx);
  });
  const sortedLayers = Array.from(layerMap.entries()).sort((a, b) => a[0] - b[0]);
  const yForLayer = buildRowYMap(sortedLayers, graph);

  const colWidth =
    (Math.max(200, ...indices.map((idx) => colWidthForNode(graph[idx]))) + COL_GAP) * STRUCTURE_COL_SCALE;
  const roots = findRoots(indices, graph);
  const incomingTails = buildIncomingTails(indices, graph);
  const cxByIdx = assignColumnCx(indices, graph, roots, colWidth, incomingTails, displayLayer);

  const nodes = [];
  const edges = [];
  const posByIdx = new Map();

  indices.forEach((idx) => {
    const layer = displayLayer.get(idx) || 0;
    const starY = yForLayer.get(layer) ?? PADDING_TOP + HEADER_H;
    const cx = cxByIdx.get(idx) ?? PADDING_X + colWidth / 2;
    const placed = layoutNodeStep(graph[idx], idx, cx, starY, nodes, edges, idx);
    posByIdx.set(idx, placed);
  });

  const jiChannelByTarget = buildJiChannelY(indices, graph, posByIdx);

  indices.forEach((idx) => {
    const tail = graph[idx]?.tail;
    const source = posByIdx.get(idx);
    if (!source) return;
    const cycleHint = isOuterBlueAlreadyInGraph(graph[idx], indices, graph);
    if (typeof tail === "number" && indices.includes(tail)) {
      const target = posByIdx.get(tail);
      const canDrawDown =
        target && typeof target.starTop === "number" && target.starTop > source.palaceBottom;
      if (canDrawDown) {
        const bendY = jiChannelByTarget.get(tail);
        addBlueEdge(edges, `blue-${idx}-${tail}`, source, target, bendY);
      } else {
        // Cycle: target already above — show terminal copy with cycle signal.
        layoutTerminal(graph[idx], idx, source.cx, source.palaceBottom, nodes, edges, {
          cycle: true,
        });
      }
    } else {
      layoutTerminal(graph[idx], idx, source.cx, source.palaceBottom, nodes, edges, {
        cycle: cycleHint,
      });
    }
  });

  const structures = component.structures?.length
    ? component.structures
    : [
        {
          leader,
          chainLuCount,
          chainQuanCount,
        },
      ];

  const header = {
    structures: structures.map((s) => ({
      leader: s.leader?.label || (s.leader ? `${s.leader.palace}・${s.leader.star}` : ""),
      counts: `${s.chainLuCount ?? 0}祿${(s.chainQuanCount ?? 0) > 0 ? ` ${s.chainQuanCount}權` : ""}`.trim(),
    })),
    // backward-compatible primary fields
    leader: leader?.label || (leader ? `${leader.palace}・${leader.star}` : ""),
    counts: `${chainLuCount}祿${chainQuanCount > 0 ? ` ${chainQuanCount}權` : ""}`.trim(),
  };

  const bounds = computeLayoutBounds(nodes, edges);

  return { ...bounds, nodes, edges, header };
}
