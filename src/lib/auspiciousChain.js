export const STAR_LIST = [
  "廉貞",
  "破軍",
  "武曲",
  "太陽",
  "天機",
  "天梁",
  "紫微",
  "太陰",
  "天同",
  "文昌",
  "巨門",
  "貪狼",
  "右弼",
  "文曲",
  "左輔",
  "七殺",
  "天府",
  "天相",
];

export const HEAVENLY_STEM_TO_STAR_INDEX = {
  甲: [0, 1, 2, 3],
  乙: [4, 5, 6, 7],
  丙: [8, 4, 9, 0],
  丁: [7, 8, 4, 10],
  戊: [11, 7, 12, 4],
  己: [2, 11, 5, 13],
  庚: [3, 2, 7, 8],
  辛: [10, 3, 13, 9],
  壬: [5, 6, 14, 2],
  癸: [1, 10, 7, 11],
};

const MUTAGEN_TO_INDEX = { 祿: 0, 權: 1, 科: 2, 忌: 3 };

function normalizePalaceName(name) {
  if (name === "僕役") return "交友宮";
  if (name === "官祿") return "事業宮";
  if (name === "命宮") return "命宮";
  return `${name}宮`;
}

function findStarInPalace(palace, starName) {
  return (
    palace.majorStars.find((s) => s.name === starName) ||
    palace.minorStars.find((s) => s.name === starName)
  );
}

function dedupeLabels(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}

/**
 * Normalize raw iztro astrolabe into palace structures used by chart + chain pages.
 */
export function normalizeAstrolabe(astrolabe) {
  const lifePalaceIndex = astrolabe.palaces.findIndex((p) => p.name === "命宮");
  const lifePalaceMutagenStars = HEAVENLY_STEM_TO_STAR_INDEX[
    astrolabe.palaces[lifePalaceIndex].decadal.heavenlyStem
  ].map((item) => STAR_LIST[item]);

  const palaces = astrolabe.palaces.map((pItem, pIndex) => {
    const mapStar = (star) => {
      if (!STAR_LIST.includes(star.name)) return null;
      const mutagenIndex = lifePalaceMutagenStars.findIndex((s) => star.name === s);
      return {
        name: star.name,
        mutagen: star.mutagen || "",
        hollowMutagen:
          mutagenIndex > -1
            ? Object.keys(MUTAGEN_TO_INDEX).find((key) => MUTAGEN_TO_INDEX[key] === mutagenIndex)
            : "",
      };
    };

    const majorStars = pItem.majorStars.map(mapStar).filter(Boolean);
    const minorStars = pItem.minorStars.map(mapStar).filter(Boolean);
    const mutagenStars = HEAVENLY_STEM_TO_STAR_INDEX[pItem.decadal.heavenlyStem].map(
      (starIndex) => STAR_LIST[starIndex]
    );

    return {
      index: pIndex,
      name: normalizePalaceName(pItem.name),
      majorStars,
      minorStars,
      mutagenStars,
      outsideMutagenIndexes: mutagenStars.flatMap((mStar, mIndex) => {
        if (majorStars.find((star) => star.name === mStar) || minorStars.find((star) => star.name === mStar)) {
          return [mIndex];
        }
        return [];
      }),
      insideMutagenIndexes: mutagenStars.flatMap((mStar, mIndex) => {
        const opposite = astrolabe.palaces[(pIndex + 6) % 12];
        if (
          opposite.majorStars.find((star) => star.name === mStar) ||
          opposite.minorStars.find((star) => star.name === mStar)
        ) {
          return [mIndex];
        }
        return [];
      }),
    };
  });

  return {
    lifePalaceIndex,
    palaces,
    lunarYear: astrolabe.rawDates.lunarDate.lunarYear,
  };
}

function buildIndexes(palaces) {
  const starToPalaceIdx = new Map();
  const starsByPalace = new Map();

  palaces.forEach((p) => {
    const stars = [...p.majorStars.map((s) => s.name), ...p.minorStars.map((s) => s.name)];
    starsByPalace.set(p.index, stars);
    stars.forEach((starName) => {
      if (!starToPalaceIdx.has(starName)) starToPalaceIdx.set(starName, p.index);
    });
  });

  return { starToPalaceIdx, starsByPalace };
}

function collectLuSources(palaces, targetPalaceIdx, targetStar, starToPalaceIdx) {
  const targetPalace = palaces[targetPalaceIdx];
  const sitting = findStarInPalace(targetPalace, targetStar);
  const sources = [];

  if (sitting?.mutagen === "祿") sources.push("生年祿");
  // 命四化等同命宮天干四化，標示為「命宮」不另標命祿
  if (sitting?.hollowMutagen === "祿") sources.push("命宮");

  if (targetPalace.outsideMutagenIndexes.includes(0) && targetPalace.mutagenStars[0] === targetStar) {
    sources.push("自化祿");
  }

  palaces.forEach((p) => {
    if (p.mutagenStars[0] !== targetStar) return;
    const landingIdx = starToPalaceIdx.get(targetStar);
    if (landingIdx !== targetPalaceIdx) return;
    if (p.index === targetPalaceIdx) return;
    sources.push(p.name);
  });

  return dedupeLabels(sources);
}

function collectQuanSources(palaces, targetPalaceIdx, targetStar, starToPalaceIdx) {
  const targetPalace = palaces[targetPalaceIdx];
  const sitting = findStarInPalace(targetPalace, targetStar);
  const sources = [];

  if (sitting?.mutagen === "權") sources.push("生年權");
  if (sitting?.hollowMutagen === "權") sources.push("命宮");

  if (targetPalace.outsideMutagenIndexes.includes(1) && targetPalace.mutagenStars[1] === targetStar) {
    sources.push("自化權");
  }

  palaces.forEach((p) => {
    if (p.mutagenStars[1] !== targetStar) return;
    const landingIdx = starToPalaceIdx.get(targetStar);
    if (landingIdx !== targetPalaceIdx) return;
    if (p.index === targetPalaceIdx) return;
    sources.push(p.name);
  });

  const deduped = dedupeLabels(sources);
  // If this palace already has 自化權, do not also show same-palace 權入 label.
  if (deduped.includes("自化權")) {
    return deduped.filter((label) => label !== targetPalace.name);
  }
  return deduped;
}

function isZiHuaJi(palace, jiStar) {
  return palace.outsideMutagenIndexes.includes(3) && palace.mutagenStars[3] === jiStar;
}

function isJiChu(palace) {
  if (palace.outsideMutagenIndexes.includes(3)) return { type: "自化忌出" };
  if (palace.insideMutagenIndexes.includes(3)) return { type: "忌入對宮" };
  return null;
}

function resolveTransfer(palace, starName, palaces, starToPalaceIdx) {
  const jiStar = palace.mutagenStars[3];
  if (!jiStar) return null;

  const targetPalaceIdx = starToPalaceIdx.get(jiStar);
  if (targetPalaceIdx === undefined) return null;

  if (isZiHuaJi(palace, jiStar) && jiStar === starName) {
    return { type: "自化忌", name: "自化忌", star: "", targetPalaceIdx, targetStar: jiStar };
  }

  const jiChu = isJiChu(palace);
  if (jiChu) {
    const oppositePalace = palaces[(palace.index + 6) % 12];
    return {
      type: "忌出",
      name: jiChu.type === "自化忌出" ? "自化忌出" : "忌出",
      star: jiStar,
      targetPalaceIdx,
      targetStar: jiStar,
      oppositePalace: oppositePalace?.name,
    };
  }

  const targetPalace = palaces[targetPalaceIdx];
  return {
    type: "转忌",
    name: targetPalace.name,
    star: jiStar,
    targetPalaceIdx,
    targetStar: jiStar,
  };
}

function traceChain(startPalaceIdx, startStar, palaces, starToPalaceIdx) {
  const steps = [];
  const visited = new Set();
  let palaceIdx = startPalaceIdx;
  let star = startStar;
  let luCount = 0;
  let quanCount = 0;

  while (true) {
    const key = `${palaceIdx}|${star}`;
    if (visited.has(key)) {
      steps.push({ stopReason: "循環" });
      break;
    }
    visited.add(key);

    const palace = palaces[palaceIdx];
    const innerGreen = collectLuSources(palaces, palaceIdx, star, starToPalaceIdx);
    const innerRed = collectQuanSources(palaces, palaceIdx, star, starToPalaceIdx);

    if (innerGreen.length === 0) break;

    luCount += innerGreen.length;
    if (innerRed.length > 0) quanCount += innerRed.length;

    const transfer = resolveTransfer(palace, star, palaces, starToPalaceIdx);

    steps.push({
      palaceIdx,
      name: palace.name,
      star,
      innerGreen,
      innerRed,
      luCount,
      quanCount,
      transfer,
    });

    if (!transfer) break;
    if (transfer.type === "自化忌" || transfer.type === "忌出") break;

    const nextLu = collectLuSources(palaces, transfer.targetPalaceIdx, transfer.targetStar, starToPalaceIdx);
    if (nextLu.length === 0) {
      steps[steps.length - 1].terminalTransfer = transfer;
      steps[steps.length - 1].stopReason = "下宮無祿";
      break;
    }

    palaceIdx = transfer.targetPalaceIdx;
    star = transfer.targetStar;
  }

  return steps;
}

function findChainStarts(palaces, starToPalaceIdx) {
  const starts = new Map();
  palaces.forEach((p) => {
    const stars = [...p.majorStars.map((s) => s.name), ...p.minorStars.map((s) => s.name)];
    stars.forEach((star) => {
      const lu = collectLuSources(palaces, p.index, star, starToPalaceIdx);
      if (lu.length > 0) {
        starts.set(`${p.index}|${star}`, { palaceIdx: p.index, star });
      }
    });
  });
  return Array.from(starts.values());
}

function stepsToGraphNodes(allSteps) {
  const nodeMap = new Map();

  allSteps.forEach((steps) => {
    steps.forEach((step) => {
      if (!step.name || !step.star) return;
      const key = `${step.name}|${step.star}`;
      const existing = nodeMap.get(key);
      const outerBlue = step.transfer
        ? { name: step.transfer.name, star: step.transfer.star || "" }
        : step.terminalTransfer
        ? { name: step.terminalTransfer.name, star: step.terminalTransfer.star || "" }
        : "";

      if (!existing) {
        nodeMap.set(key, {
          name: step.name,
          star: step.star,
          innerGreen: [...step.innerGreen],
          innerRed: [...step.innerRed],
          outerBlue,
          luCount: step.luCount,
          quanCount: step.quanCount,
          stopReason: step.stopReason,
        });
      } else {
        existing.innerGreen = dedupeLabels([...existing.innerGreen, ...step.innerGreen]);
        existing.innerRed = dedupeLabels([...existing.innerRed, ...step.innerRed]);
        existing.luCount = Math.max(existing.luCount || 0, step.luCount || 0);
        existing.quanCount = Math.max(existing.quanCount || 0, step.quanCount || 0);
        if (outerBlue && outerBlue.name) existing.outerBlue = outerBlue;
        if (step.stopReason) existing.stopReason = step.stopReason;
      }
    });
  });

  const nodes = Array.from(nodeMap.values()).filter((n) => n.innerGreen.length > 0);

  const indexByKey = new Map();
  nodes.forEach((item, index) => indexByKey.set(`${item.name}|${item.star}`, index));

  return nodes.map((item, selfIdx) => {
    let tail;
  const ob = item.outerBlue;
    if (ob && typeof ob === "object" && ob.name) {
      if (ob.name === "自化忌" || ob.name === "自化忌出" || ob.name === "忌出") {
        tail = undefined;
      } else if (ob.star) {
        const idx = indexByKey.get(`${ob.name}|${ob.star}`);
        tail = typeof idx === "number" && idx !== selfIdx ? idx : undefined;
      }
    }

    return { ...item, tail };
  });
}

export function countStructureTotals(indices, graphNodes) {
  const lu = new Set();
  const quan = new Set();
  indices.forEach((idx) => {
    (graphNodes[idx]?.innerGreen || []).forEach((label) => lu.add(label));
    (graphNodes[idx]?.innerRed || []).forEach((label) => quan.add(label));
  });
  return { chainLuCount: lu.size, chainQuanCount: quan.size };
}

/**
 * 領軍 = 所有化祿出去來源（綠框），不是只取中間坐祿宮。
 * - 宮位祿入：寫宮名
 * - 自化祿：寫「{坐祿宮}自化祿」
 * - 生年祿：寫「{坐祿宮}生年祿」
 * 多個來源用頓號並列，例如「命宮、夫妻宮領軍・武曲」
 */
export function getLeaderFromNode(node) {
  if (!node) return { palace: "", star: "", sources: [], label: "" };

  const sitting = node.name || "";
  const star = node.star || "";
  const greens = node.innerGreen || [];
  const sources = [];

  greens.forEach((label) => {
    if (label === "自化祿") {
      if (sitting) sources.push(`${sitting}自化祿`);
      return;
    }
    if (label === "生年祿") {
      if (sitting) sources.push(`${sitting}生年祿`);
      return;
    }
    if (label === "命宮" || (typeof label === "string" && label.endsWith("宮"))) {
      sources.push(label);
    }
  });

  const unique = [];
  const seen = new Set();
  sources.forEach((s) => {
    if (seen.has(s)) return;
    seen.add(s);
    unique.push(s);
  });
  if (unique.length === 0 && sitting) unique.push(sitting);

  const palace = unique.join("、");
  const label = `${palace}領軍${star ? `・${star}` : ""}`;
  return { palace, star, sources: unique, label };
}

/** Nodes reachable by following tail from root (one 領軍結構 chain). */
function chainIndicesFromRoot(rootIdx, graph, allowedSet) {
  const indices = [];
  const seen = new Set();
  let idx = rootIdx;
  while (typeof idx === "number" && !seen.has(idx) && (!allowedSet || allowedSet.has(idx))) {
    seen.add(idx);
    indices.push(idx);
    idx = graph[idx]?.tail;
  }
  return indices;
}

function findRoots(indices, graph) {
  const targets = new Set();
  indices.forEach((idx) => {
    const t = graph[idx]?.tail;
    if (typeof t === "number" && indices.includes(t)) targets.add(t);
  });
  return indices.filter((idx) => !targets.has(idx)).sort((a, b) => a - b);
}

/**
 * Split a connected component into independent 領軍 structures.
 * Different structures may share downstream nodes visually, but 祿/權 are counted per chain
 * (不同圈的結構不一定能互相交祿).
 */
export function buildStructuresInComponent(indices, graph) {
  if (!indices?.length || !graph) return [];
  const allowed = new Set(indices);
  return findRoots(indices, graph)
    .map((rootIdx) => {
      const chainIndices = chainIndicesFromRoot(rootIdx, graph, allowed);
      const { chainLuCount, chainQuanCount } = countStructureTotals(chainIndices, graph);
      const leader = getLeaderFromNode(graph[rootIdx]);
      return {
        rootIdx,
        indices: chainIndices,
        leader,
        chainLuCount,
        chainQuanCount,
      };
    })
    .sort((a, b) => (b.indices?.length || 0) - (a.indices?.length || 0) || (b.chainLuCount || 0) - (a.chainLuCount || 0));
}

/**
 * Assign vertical layers for a connected component (supports merge / tree convergence).
 */
export function assignChainLayers(indices, graphNodes) {
  const compSet = new Set(indices);
  const layerByIdx = new Map();

  const hasIncomingTail = new Set();
  indices.forEach((idx) => {
    const t = graphNodes[idx]?.tail;
    if (typeof t === "number" && compSet.has(t)) hasIncomingTail.add(t);
  });

  indices.filter((idx) => !hasIncomingTail.has(idx)).forEach((r) => layerByIdx.set(r, 0));

  let changed = true;
  let guard = 0;
  while (changed && guard++ < 64) {
    changed = false;
    indices.forEach((idx) => {
      const heads = (graphNodes[idx]?.heads || []).filter((h) => compSet.has(h));
      if (heads.length > 0) {
        const layer = Math.max(...heads.map((h) => layerByIdx.get(h) ?? 0)) + 1;
        if ((layerByIdx.get(idx) ?? -1) < layer) {
          layerByIdx.set(idx, layer);
          changed = true;
        }
      }
      const tail = graphNodes[idx]?.tail;
      if (typeof tail === "number" && compSet.has(tail)) {
        const layer = (layerByIdx.get(idx) ?? 0) + 1;
        if ((layerByIdx.get(tail) ?? -1) < layer) {
          layerByIdx.set(tail, layer);
          changed = true;
        }
      }
    });
  }

  indices.forEach((idx) => {
    if (!layerByIdx.has(idx)) layerByIdx.set(idx, 0);
  });

  return layerByIdx;
}

/**
 * Order node indices: roots first, then by layer, for stable tree-like layout.
 */
export function orderComponentNodes(indices, graphNodes, layerByIdx) {
  const hasIncomingTail = new Set();
  indices.forEach((idx) => {
    const t = graphNodes[idx]?.tail;
    if (typeof t === "number" && indices.includes(t)) hasIncomingTail.add(t);
  });
  const roots = indices.filter((idx) => !hasIncomingTail.has(idx)).sort((a, b) => a - b);

  return [...indices].sort((a, b) => {
    const la = layerByIdx.get(a) ?? 0;
    const lb = layerByIdx.get(b) ?? 0;
    if (la !== lb) return la - lb;
    const ra = roots.indexOf(a);
    const rb = roots.indexOf(b);
    if (ra !== -1 && rb !== -1) return ra - rb;
    if (ra !== -1) return -1;
    if (rb !== -1) return 1;
    return a - b;
  });
}

function attachHeads(nodes) {
  const headsByIndex = nodes.map(() => []);
  nodes.forEach((item, idx) => {
    if (typeof item.tail === "number" && item.tail !== idx) {
      headsByIndex[item.tail].push(idx);
    }
  });
  return nodes.map((item, idx) => ({ ...item, heads: headsByIndex[idx] }));
}

/**
 * Build auspicious-chain graph nodes from a normalized astrolabe.
 * Implements 梁派 化祿轉忌：有祿即可轉忌，命四化標為命宮，追祿/追權計數、忌出停止。
 */
export function buildAuspiciousGraph(normalized) {
  const { palaces } = normalized;
  const { starToPalaceIdx } = buildIndexes(palaces);

  const starts = findChainStarts(palaces, starToPalaceIdx);
  const allSteps = starts.map((s) => traceChain(s.palaceIdx, s.star, palaces, starToPalaceIdx));
  const meaningful = allSteps.filter((steps) => steps.some((step) => step.name && step.innerGreen?.length > 0));

  if (meaningful.length === 0) return [];

  const withTails = stepsToGraphNodes(meaningful);
  return attachHeads(withTails);
}

function normalizeStepForStructure(step) {
  const transferLabel = step.transfer
    ? `${step.transfer.name}${step.transfer.star ? `・${step.transfer.star}` : ""}`
    : "";
  return {
    name: step.name,
    star: step.star,
    innerGreen: step.innerGreen || [],
    innerRed: step.innerRed || [],
    transfer: step.transfer || null,
    transferLabel,
  };
}

/**
 * Build independent leader-based structures (no cross-family total merge).
 * Each structure keeps its own lu/quan counting and downstream flow.
 */
function buildConnectedComponents(graph) {
  const n = graph.length;
  const visited = Array(n).fill(false);
  const components = [];

  const getNeighbors = (i) => {
    const neighbors = [];
    const t = graph[i]?.tail;
    if (typeof t === "number") neighbors.push(t);
    const heads = graph[i]?.heads || [];
    for (const h of heads) neighbors.push(h);
    return Array.from(new Set(neighbors));
  };

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const queue = [i];
    visited[i] = true;
    const comp = [i];
    while (queue.length) {
      const cur = queue.shift();
      for (const nb of getNeighbors(cur)) {
        if (!visited[nb]) {
          visited[nb] = true;
          queue.push(nb);
          comp.push(nb);
        }
      }
    }
    components.push(comp.sort((a, b) => a - b));
  }

  return components.filter((c) => c.length > 0);
}

/**
 * Connected components from buildAuspiciousGraph, with per-領軍 structure lu/quan totals.
 * Header uses 化祿出去的宮 as 領軍宮, and does not merge 祿 across independent structures.
 */
export function buildGraphComponents(graph) {
  if (!graph || graph.length === 0) return [];

  return buildConnectedComponents(graph)
    .map((indices, i) => {
      const structures = buildStructuresInComponent(indices, graph);
      const primary = structures[0];
      const leader = primary?.leader || getLeaderFromNode(graph[indices[0]]);
      const palaceSet = Array.from(new Set(indices.map((idx) => graph[idx]?.name).filter(Boolean)));

      return {
        id: `comp-${i}-${indices.join("-")}`,
        indices,
        graph,
        structures,
        // Primary structure counts (not merged across circles)
        chainLuCount: primary?.chainLuCount ?? 0,
        chainQuanCount: primary?.chainQuanCount ?? 0,
        leader,
        palaceSet,
      };
    })
    .sort((a, b) => (b.indices?.length || 0) - (a.indices?.length || 0));
}

export function buildAuspiciousStructures(normalized) {
  const { palaces } = normalized;
  const { starToPalaceIdx } = buildIndexes(palaces);
  const starts = findChainStarts(palaces, starToPalaceIdx);

  const signatures = new Set();
  const structures = [];

  starts.forEach((start, i) => {
    const steps = traceChain(start.palaceIdx, start.star, palaces, starToPalaceIdx).filter(
      (s) => s && s.name && s.star
    );
    if (steps.length === 0) return;

    const signature = steps.map((s) => `${s.name}|${s.star}`).join("->");
    if (signatures.has(signature)) return;
    signatures.add(signature);

    const luSources = new Set();
    const quanSources = new Set();
    const palaceSet = new Set();
    const stepItems = steps.map((s) => {
      (s.innerGreen || []).forEach((label) => luSources.add(label));
      (s.innerRed || []).forEach((label) => quanSources.add(label));
      palaceSet.add(s.name);
      return normalizeStepForStructure(s);
    });

    structures.push({
      id: `${start.palaceIdx}-${start.star}-${i}`,
      leader: getLeaderFromNode(stepItems[0]),
      steps: stepItems,
      luCount: luSources.size,
      quanCount: quanSources.size,
      palaceSet: Array.from(palaceSet),
    });
  });

  return structures;
}
