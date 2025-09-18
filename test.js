// ========== Tail Pair Discovery & Trimming (Pre-merge) ==========

// 取得所有「首尾相同」路徑之尾端 pair（例如 ['文曲','財帛宮']）
function getCyclicTailPairs(routes) {
    const join2 = (a, b) => `${a}\x1f${b}`;
    const pairsSet = new Set();
 
    for (const r of routes) {
        if (!Array.isArray(r) || r.length < 2) continue;
        if (r[0] === r[r.length - 1]) {
            const tailStar = r[r.length - 2];
            const tailPalace = r[r.length - 1];
            pairsSet.add(join2(tailStar, tailPalace));
        }
    }
    return Array.from(pairsSet).map((s) => s.split("\x1f"));
}
 
// 計數 pair 在所有 routes 中出現次數（連續 bigram）
function countPairOccurrences(routes, [a, b]) {
    let count = 0;
    for (const r of routes) {
        if (!Array.isArray(r) || r.length < 2) continue;
        for (let i = 0; i < r.length - 1; i += 1) {
            if (r[i] === a && r[i + 1] === b) count += 1;
        }
    }
    return count;
}
 
// 從所有候選尾端 pair 中，挑選出現次數最多者（平手取第一個）
function chooseMostFrequentTailPair(routes, candidatePairs) {
    if (!candidatePairs.length) return null;
    let best = candidatePairs[0];
    let bestCnt = countPairOccurrences(routes, best);
    for (let i = 1; i < candidatePairs.length; i += 1) {
        const cnt = countPairOccurrences(routes, candidatePairs[i]);
        if (cnt > bestCnt) {
            best = candidatePairs[i];
            bestCnt = cnt;
        }
    }
    return best; // [star, palace]
}
 
// 以「唯一選出的尾端 pair」裁切所有路徑：遇到該 pair 即截斷（含兩元素）
function trimRoutesByChosenTailPair(routes) {
    const candidates = getCyclicTailPairs(routes);
    if (candidates.length === 0) return routes.map((r) => r.slice());
 
    const chosen = chooseMostFrequentTailPair(routes, candidates);
    if (!chosen) return routes.map((r) => r.slice());
 
    const [a, b] = chosen;
    return routes.map((route) => {
        if (!Array.isArray(route) || route.length < 2) return Array.isArray(route) ? route.slice() : route;
        for (let i = 0; i < route.length - 1; i += 1) {
            if (route[i] === a && route[i + 1] === b) {
                return route.slice(0, i + 2);
            }
        }
        return route.slice();
    });
}
 
// ========== Merge Engine (Rules 1–4, Safe) ==========
 
function mergeAllRoutesEnhancedSafe(inputRoutes, opts = {}) {
    const { logProgress = false, maxIterations = 2000, maxRoutes = 5000 } = opts;
    if (!Array.isArray(inputRoutes)) return { allRoutes: [], longestRoutes: [], longestLength: 0 };
 
    const joinKey = (r) => r.join("\x1f");
    const isCyclic = (r) => r.length > 0 && r[0] === r[r.length - 1];
 
    const originals = inputRoutes.map((r) => r.slice());
    const originalKeySet = new Set(originals.map(joinKey));
    const cyclicHeads = new Set(originals.filter(isCyclic).map((r) => r[0]));
 
    // 規則1 + 規則4：尾首完整重疊；若合併結果中出現循環 head 且不在尾端，截斷於該 head
    function suffixPrefixMergesWithTrunc(a, b) {
        const results = [];
        const maxK = Math.min(a.length, b.length);
        for (let k = maxK; k >= 1; k -= 1) {
            let ok = true;
            for (let i = 0; i < k; i += 1) {
                if (a[a.length - k + i] !== b[i]) {
                    ok = false;
                    break;
                }
            }
            if (!ok) continue;
 
            let merged = [...a, ...b.slice(k)];
            const cutIdx = merged.findIndex((node, idx) => cyclicHeads.has(node) && idx !== merged.length - 1);
            if (cutIdx !== -1) merged = merged.slice(0, cutIdx + 1);

            // 追加限制：合併後若以「宮」結尾的項目數量 >= 5，則不允許該合併
            const palaceCount = (arr) => {
                let c = 0;
                for (const v of arr) {
                    if (typeof v === 'string' && v.endsWith('宮')) c += 1;
                }
                return c;
            };
            if (palaceCount(merged) >= 5) continue;
 
            results.push(merged);
        }
        return results;
    }
 
    const all = [];
    const seen = new Map();
    const originalMerged = new Set(); // 規則3：原始路徑只要參與過合併，就不輸出原始路徑
 
    function addRoute(r) {
        const k = joinKey(r);
        if (!seen.has(k)) {
            seen.set(k, r);
            all.push(r);
            return true;
        }
        return false;
    }
 
    // 初始化：先把原始 routes 放進池
    originals.forEach(addRoute);
 
    let grew = true;
    let iterations = 0;
 
    while (grew) {
        grew = false;
        iterations += 1;
        if (iterations > maxIterations) {
            if (logProgress) console.warn("[merge] Hit iteration cap:", iterations);
            break;
        }
        if (all.length > maxRoutes) {
            if (logProgress) console.warn("[merge] Hit route cap:", all.length);
            break;
        }
 
        const snapshot = all.slice();
        for (let i = 0; i < snapshot.length; i += 1) {
            for (let j = 0; j < snapshot.length; j += 1) {
                if (i === j) continue;
 
                const a = snapshot[i];
                const b = snapshot[j];
 
                // 規則2：不可把任何路徑接到「循環路徑的頭」之前 → 直接略過 b 為循環路徑
                if (isCyclic(b)) continue;
 
                const mergedList = suffixPrefixMergesWithTrunc(a, b);
                for (const merged of mergedList) {
                    // 安全：只接受會「變長」的合併，避免無效循環
                    if (merged.length <= Math.max(a.length, b.length)) continue;
 
                    const added = addRoute(merged);
                    if (added) {
                        grew = true;
 
                        const aKey = joinKey(a);
                        const bKey = joinKey(b);
                        if (originalKeySet.has(aKey)) originalMerged.add(aKey);
                        if (originalKeySet.has(bKey)) originalMerged.add(bKey);
 
                        if (all.length > maxRoutes) break;
                    }
                }
                if (all.length > maxRoutes) break;
            }
            if (all.length > maxRoutes) break;
        }
        if (logProgress) console.log(`[merge] iter=${iterations}, routes=${all.length}, grew=${grew}`);
    }
 
    // 規則3：參與過合併的原始路徑不輸出
    const filteredAll = all.filter((r) => {
        const k = joinKey(r);
        const isOriginal = originalKeySet.has(k);
        return !(isOriginal && originalMerged.has(k));
    });
 
    let longestLength = 0;
    for (const r of filteredAll) longestLength = Math.max(longestLength, r.length);
    const longestRoutes = filteredAll.filter((r) => r.length === longestLength);
 
    return { allRoutes: filteredAll, longestRoutes, longestLength };
}
 
// ========== Post-processing: Remove Contained Subroutes ==========
 
// small 是否為 big 的「連續子序列」
function isContiguousSubarray(small, big) {
    if (!Array.isArray(small) || !Array.isArray(big)) return false;
    if (small.length === 0 || small.length > big.length) return false;
    outer: for (let i = 0; i <= big.length - small.length; i += 1) {
        for (let j = 0; j < small.length; j += 1) {
            if (big[i + j] !== small[j]) continue outer;
        }
        return true;
    }
    return false;
}
 
// 將被其它較長路徑完整包含的路徑移除
function removeContainedRoutes(routes) {
    const out = [];
    for (let i = 0; i < routes.length; i += 1) {
        const r = routes[i];
        let contained = false;
        for (let j = 0; j < routes.length; j += 1) {
            if (i === j) continue;
            const s = routes[j];
            if (s.length > r.length && isContiguousSubarray(r, s)) {
                contained = true;
                break;
            }
        }
        if (!contained) out.push(r);
    }
    return out;
}

// ========== Second-merge (extend by star-palace tail) ==========

// 星曜清單（判定『星→宮』尾端對）
const STARS_SET = new Set(["太陽","太陰","巨門","貪狼","天機","天同","文昌","文曲","武曲","廉貞"]);
function isStar(name) { return typeof name === 'string' && STARS_SET.has(name); }
function isPalace(name) { return typeof name === 'string' && name.endsWith('宮'); }

// 建立索引：在其他路徑中，凡出現『星, 宮』且該 pair 之後還有元素的地方，收集後綴作為可延伸參考
function buildStarPalaceSuffixIndex(routes) {
    const map = new Map(); // key: star\x1fpalace -> Array<suffix[]>
    for (const r of routes) {
        if (!Array.isArray(r) || r.length < 3) continue;
        for (let i = 0; i < r.length - 2; i += 1) {
            const a = r[i];
            const b = r[i + 1];
            if (isStar(a) && isPalace(b)) {
                const suffix = r.slice(i + 2);
                if (suffix.length === 0) continue;
                const key = `${a}\x1f${b}`;
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(suffix);
            }
        }
    }
    return map;
}

// 進一步延伸：若某路徑以『星, 宮』結尾，且該 pair 在其他路徑中間出現過，則將其後綴接在尾端（遵守『宮』數量限制）
function extendRoutesByStarPalaceTail(routes, palaceLimit = 5) {
    const index = buildStarPalaceSuffixIndex(routes);

    const joinKey = (r) => r.join("\x1f");
    const out = [];
    const seen = new Set();

    // 計算『宮』數量
    const palaceCount = (arr) => arr.reduce((c, v) => c + (isPalace(v) ? 1 : 0), 0);

    for (const r of routes) {
        if (!Array.isArray(r) || r.length < 2) {
            const k = joinKey(r);
            if (!seen.has(k)) { seen.add(k); out.push(r); }
            continue;
        }
        const tailStar = r[r.length - 2];
        const tailPalace = r[r.length - 1];
        const key = `${tailStar}\x1f${tailPalace}`;

        let extendedAny = false;
        if (isStar(tailStar) && isPalace(tailPalace) && index.has(key)) {
            for (const suffix of index.get(key)) {
                const merged = [...r, ...suffix];
                if (palaceCount(merged) >= palaceLimit) continue; // 遵守限制
                const mk = joinKey(merged);
                if (!seen.has(mk)) { seen.add(mk); out.push(merged); extendedAny = true; }
            }
        }
        // 保留原路徑（若沒成功擴展或所有擴展被限制）
        const rk = joinKey(r);
        if (!extendedAny && !seen.has(rk)) { seen.add(rk); out.push(r); }
    }

    return out;
}
 
// ========== Sorting: anchor tail similarity → tail bigram popularity → length → tail n-gram ==========
 
// 取得路徑的尾端 pair（最後兩個節點）；長度不足 2 則回傳 null
function tailPairOf(route) {
    if (!Array.isArray(route) || route.length < 2) return null;
    return [route[route.length - 2], route[route.length - 1]];
}
 
// 取得路徑結尾長度為 n 的片段（suffix）；不足 n 回傳 null
function tailSlice(route, n) {
    if (!Array.isArray(route) || route.length < n) return null;
    return route.slice(route.length - n);
}
 
// 計算某個連續片段（n-gram）在所有 routes 中的出現次數
function countNgramOccurrences(routes, seq) {
    if (!Array.isArray(seq) || seq.length === 0) return 0;
    let count = 0;
    for (const r of routes) {
        if (!Array.isArray(r) || r.length < seq.length) continue;
        outer: for (let i = 0; i <= r.length - seq.length; i += 1) {
            for (let j = 0; j < seq.length; j += 1) {
                if (r[i + j] !== seq[j]) continue outer;
            }
            count += 1;
        }
    }
    return count;
}

// 比較兩條路徑的「由尾端往前的 n-gram 熱度」（定義於此，供初排和最終排序共用）
function compareByTailNgramPopularity(a, b, routesPool) {
    const maxN = Math.min(a.length, b.length);
    for (let n = maxN; n >= 2; n -= 1) {
        const aSuffix = tailSlice(a, n);
        const bSuffix = tailSlice(b, n);
        if (!aSuffix || !bSuffix) continue;
        const aCnt = countNgramOccurrences(routesPool, aSuffix);
        const bCnt = countNgramOccurrences(routesPool, bSuffix);
        if (aCnt !== bCnt) return bCnt - aCnt;
    }
    return 0;
}

// 計算兩條路徑的共同尾段長度（Longest Common Suffix）
function commonTailLen(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    let i = 1;
    const max = Math.min(a.length, b.length);
    while (i <= max && a[a.length - i] === b[b.length - i]) i += 1;
    return i - 1;
}
 
// 依：1) 與錨點共同尾段長度(套用閾值) 2) 尾端 pair 熱度 3) 長度 4) 尾端 n-gram 熱度 5) 生年忌 6) 字典序
function sortRoutesByTailPopularityThenLength(allRoutes, routesPool, opts = {}) {
    if (!Array.isArray(allRoutes) || allRoutes.length === 0) return [];

    const { minCommonTailMatchLen = 2 } = opts; // 單一元素相同(=1)視為不匹配

    // 初排（不含錨點相似度）：尾端 pair 熱度 → 長度 → n-gram → 生年忌 → 字典序，用於選錨點
    const prelim = [...allRoutes].sort((a, b) => {
        const pair = (r) => tailPairOf(r) || ["",""];
        const join = (r) => r.join("\x1f");
        const cnt = (r) => countPairOccurrences(routesPool, pair(r));
        const cA = cnt(a), cB = cnt(b);
        if (cA !== cB) return cB - cA;
        if (a.length !== b.length) return b.length - a.length;
        const ng = compareByTailNgramPopularity(a, b, routesPool);
        if (ng !== 0) return ng;
        const hasSeed = (r) => Array.isArray(r) && r.includes("生年忌");
        const aSeed = hasSeed(a), bSeed = hasSeed(b);
        if (aSeed !== bSeed) return aSeed ? -1 : 1;
        return join(a).localeCompare(join(b));
    });
    const anchor = prelim[0];

    // 建立尾端 pair 熱度與最熱門 pair（供生年忌 tie-break）
    let maxTailCount = -1;
    const tailCountCache = new Map();
    const getTailKey = (route) => {
        const pair = tailPairOf(route);
        return pair ? `${pair[0]}\x1f${pair[1]}` : "";
    };
    const getTailCount = (route) => {
        const pair = tailPairOf(route);
        if (!pair) return -1;
        const key = `${pair[0]}\x1f${pair[1]}`;
        if (!tailCountCache.has(key)) tailCountCache.set(key, countPairOccurrences(routesPool, pair));
        return tailCountCache.get(key);
    };
    for (const r of allRoutes) {
        const pair = tailPairOf(r);
        if (!pair) continue;
        const key = `${pair[0]}\x1f${pair[1]}`;
        if (!tailCountCache.has(key)) tailCountCache.set(key, countPairOccurrences(routesPool, pair));
        const c = tailCountCache.get(key);
        if (c > maxTailCount) maxTailCount = c;
    }

    const includesSeed = (route) => Array.isArray(route) && route.includes("生年忌");

    return [...allRoutes].sort((a, b) => {
        // 1) 與錨點共同尾段長度（大→小），但若僅 1 個元素相同則視為 0（不匹配）
        let aSim = commonTailLen(a, anchor);
        let bSim = commonTailLen(b, anchor);
        if (aSim < minCommonTailMatchLen) aSim = 0;
        if (bSim < minCommonTailMatchLen) bSim = 0;
        if (aSim !== bSim) return bSim - aSim;

        // 2) 尾端 pair 熱度（routesPool 基底）
        const aTailCount = getTailCount(a);
        const bTailCount = getTailCount(b);
        if (aTailCount !== bTailCount) return bTailCount - aTailCount;

        // 3) 長度（長→短）
        if (a.length !== b.length) return b.length - a.length;

        // 4) 尾端 n-gram 熱度（routesPool 基底）
        const ngramCmp = compareByTailNgramPopularity(a, b, routesPool);
        if (ngramCmp !== 0) return ngramCmp;

        // 5) 若同尾端、同長度，且該尾端為最熱門，優先包含「生年忌」
        const aTail = getTailKey(a);
        const bTail = getTailKey(b);
        if (aTail && aTail === bTail) {
            const aCount = getTailCount(a);
            if (aCount === maxTailCount) {
                const aHas = includesSeed(a);
                const bHas = includesSeed(b);
                if (aHas !== bHas) return aHas ? -1 : 1;
            }
        }

        // 6) 字典序穩定 tie-break
        return a.join("\x1f").localeCompare(b.join("\x1f"));
    });
}
 
// ========== Pipeline (Trim → Merge → Filter → Second-merge → Sort) ==========
 
function trimThenMergeWithMostFrequentTailThenFilterThenSort(routes, opts) {
    const trimmed = trimRoutesByChosenTailPair(routes);
    const merged = mergeAllRoutesEnhancedSafe(trimmed, opts);

    // Post-filter
    let filteredRoutes = removeContainedRoutes(merged.allRoutes);

    // Second-merge: extend by star-palace tail
    filteredRoutes = extendRoutesByStarPalaceTail(filteredRoutes, 5);

    // Run filter again to drop any now-contained routes
    filteredRoutes = removeContainedRoutes(filteredRoutes);

    // Sort（優先：與錨點共同尾段長度(>=2) → 尾端 pair 熱度 → 長度 → 尾端 n-gram 熱度）
    const sortedRoutes = sortRoutesByTailPopularityThenLength(filteredRoutes, filteredRoutes, { minCommonTailMatchLen: 2 });
 
    let longestLength = 0;
    for (const r of sortedRoutes) longestLength = Math.max(longestLength, r.length);
    const longestRoutes = sortedRoutes.filter((r) => r.length === longestLength);
 
    return {
        allRoutes: sortedRoutes,
        longestRoutes,
        longestLength,
    };
}
 
// ========== Example Usage ==========
 
const SAMPLE_ROUTES_1 = [
    ["遷移宮", "天機", "子女宮", "文昌", "福德宮"],
    ["疾厄宮", "文曲", "財帛宮", "天同", "交友宮"],
    ["財帛宮", "天同", "交友宮", "文曲", "財帛宮"],
    ["子女宮", "文昌", "福德宮", "廉貞", "自化忌"],
    ["夫妻宮", "武曲", "遷移宮", "天機", "子女宮"],
    ["兄弟宮", "貪狼", "事業宮", "天機", "子女宮"],
    ["命宮", "太陽", "疾厄宮", "文曲", "財帛宮"],
    ["父母宮", "太陰", "田宅宮", "巨門", "交友宮"],
    ["福德宮", "廉貞", "自化忌"],
    ["田宅宮", "巨門", "交友宮", "文曲", "財帛宮"],
    ["事業宮", "天機", "子女宮", "文昌", "福德宮"],
    ["交友宮", "文曲", "財帛宮", "天同", "交友宮"],
    ["生年忌", "太陰", "田宅宮", "巨門", "交友宮"],
];
 
const SAMPLE_ROUTES_2 = [
    [
        "疾厄宮",
        "天機",
        "兄弟宮",
        "武曲",
        "財帛宮",
    ],
    [
        "財帛宮",
        "文曲",
        "夫妻宮",
        "文昌",
        "福德宮",
    ],
    [
        "子女宮",
        "天同",
        "疾厄宮",
        "天機",
        "兄弟宮",
    ],
    [
        "夫妻宮",
        "文昌",
        "福德宮",
        "太陰",
        "田宅宮",
    ],
    [
        "兄弟宮",
        "武曲",
        "財帛宮",
        "文曲",
        "夫妻宮",
    ],
    [
        "命宮",
        "貪狼",
        "事業宮",
        "巨門",
        "交友宮",
    ],
    [
        "父母宮",
        "太陽",
        "子女宮",
        "天同",
        "疾厄宮",
    ],
    [
        "福德宮",
        "太陰",
        "田宅宮",
        "廉貞",
        "事業宮",
    ],
    [
        "田宅宮",
        "廉貞",
        "事業宮",
        "巨門",
        "交友宮",
    ],
    [
        "事業宮",
        "巨門",
        "交友宮",
        "天機",
        "兄弟宮",
    ],
    [
        "交友宮",
        "天機",
        "兄弟宮",
        "武曲",
        "財帛宮",
    ],
    [
        "遷移宮",
        "文曲",
        "夫妻宮",
        "文昌",
        "福德宮",
    ],
    [
        "生年忌",
        "太陰",
        "田宅宮",
        "廉貞",
        "事業宮",
    ],
];
 
const SAMPLE_ROUTES_3 = [
    [
        "兄弟宮",
        "天機",
        "自化忌",
    ],
    [
        "命宮",
        "文曲",
        "遷移宮",
        "太陰",
        "兄弟宮",
    ],
    [
        "父母宮",
        "天同",
        "疾厄宮",
        "廉貞",
        "事業宮",
    ],
    [
        "福德宮",
        "文昌",
        "自化忌",
    ],
    [
        "田宅宮",
        "武曲",
        "財帛宮",
        "巨門",
        "父母宮",
    ],
    [
        "事業宮",
        "貪狼",
        "命宮",
        "文曲",
        "遷移宮",
    ],
    [
        "交友宮",
        "太陽",
        "子女宮",
        "天機",
        "兄弟宮",
        "自化忌",
    ],
    [
        "遷移宮",
        "太陰",
        "兄弟宮",
        "天機",
        "自化忌",
    ],
    [
        "疾厄宮",
        "廉貞",
        "事業宮",
        "貪狼",
        "命宮",
    ],
    [
        "財帛宮",
        "巨門",
        "父母宮",
        "天同",
        "疾厄宮",
    ],
    [
        "子女宮",
        "天機",
        "兄弟宮",
        "自化忌",
    ],
    [
        "夫妻宮",
        "文曲",
        "遷移宮",
        "太陰",
        "兄弟宮",
    ],
    [
        "生年忌",
        "太陰",
        "兄弟宮",
        "天機",
        "自化忌",
    ],
];
 
const graph1 = [
    SAMPLE_ROUTES_1[0],
    SAMPLE_ROUTES_1[3],
    SAMPLE_ROUTES_1[4],
    SAMPLE_ROUTES_1[5],
    SAMPLE_ROUTES_1[6],
    SAMPLE_ROUTES_1[8],
    SAMPLE_ROUTES_1[10],
    SAMPLE_ROUTES_1[12],
];
const graph2 = [
    SAMPLE_ROUTES_1[0],
    SAMPLE_ROUTES_1[6],
    SAMPLE_ROUTES_1[8],
    SAMPLE_ROUTES_1[1],
    SAMPLE_ROUTES_1[2],
    SAMPLE_ROUTES_1[7],
    SAMPLE_ROUTES_1[9],
    SAMPLE_ROUTES_1[11],
    SAMPLE_ROUTES_1[12],
];
const graph3 = SAMPLE_ROUTES_1;
 
const graph4 = [
    SAMPLE_ROUTES_2[5],
    SAMPLE_ROUTES_2[7],
    SAMPLE_ROUTES_2[11],
    SAMPLE_ROUTES_2[4],
    SAMPLE_ROUTES_2[12],
];
 
const graph5 = [
    SAMPLE_ROUTES_3[1],
    SAMPLE_ROUTES_3[3],
    SAMPLE_ROUTES_3[7],
    SAMPLE_ROUTES_3[4],
    SAMPLE_ROUTES_3[12],
];
 
const { allRoutes, longestRoutes, longestLength } = trimThenMergeWithMostFrequentTailThenFilterThenSort(graph2, { logProgress: false });
console.log(allRoutes);
 
/*
Rules & Flow
 
Flow:
1) Trim discovery:
   - 掃描所有「首尾相同」的路徑，取其最後兩個元素作為候選尾端 pair（例如 ['文曲','財帛宮']）。
   - 若有多個候選尾端 pair，統計其在所有輸入路徑中的出現次數（相鄰 bigram），選出出現次數最多者。
   - 對所有路徑進行裁切：一旦遇到選定的尾端 pair，截斷到該 pair（含兩元素）。
 
2) Merge (Rules 1–4, safe):
   - 規則1：僅在「a 的尾部」等於「b 的首部」的完整重疊下合併 → merged = a + b[overlapLen:].
     追加限制：合併後若路徑中以「宮」結尾的項目數量 >= 5，則不允許該合併（避免產生過長的『宮』鏈）。
   - 規則2：若某路徑為循環（head === tail），禁止把任何東西接到它的頭之前（不可當 b 的 target）。
   - 規則3：凡原始路徑只要參與過合併（成為某次合併的 a 或 b），則不輸出該原始路徑本體。
   - 規則4：若合併結果中出現「循環路徑的 head」且不在尾端，立即截斷於該 head，保證尾端穩定。
   - 安全措施：只接受會「變長」的合併，並設置迭代與總路徑數上限，避免組合爆炸或長時間停滯。
 
3) Post-filter:
   - 新規則：移除任何是其他更長路徑「連續子序列」的路徑（例如 ['疾厄宮','文曲','財帛宮'] 被包含於較長路徑時剔除）。

2.5) Second-merge:
   - 若某條路徑以『星, 宮』結尾，且該 pair 在另一條路徑的中段出現過，則可把該參考路徑中 pair 之後的後綴接在此路徑尾端（同樣遵守『宮』數量限制）。
   - 之後再執行一次 Post-filter 以移除新產生的子路徑。
 
4) Sorting (final output order):
   - 先選錨點（用尾端 pair 熱度→長度→n-gram→生年忌→字典序預排取第一條）。
   - 最終排序鍵（依序）：
     1) 與錨點共同尾段長度（越長越前；若僅 1 個元素相同則視為不匹配）
     2) 尾端 pair 熱度（以過濾後集合計數）
     3) 路徑長度（長→短）
     4) 尾端 n-gram 熱度（從較長 n 到 2，以過濾後集合計數）
     5) 生年忌 tie-break（在最熱門尾端下）
     6) 字典序穩定收尾
 
Outputs:
- allRoutes：套用上述規則後的所有可能結果（已去除子路徑）。
- longestRoutes：最長長度的所有結果。
- longestLength：最長長度數值。
*/
