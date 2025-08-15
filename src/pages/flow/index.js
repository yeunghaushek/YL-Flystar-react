import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { astro } from "iztro";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Controls, Background, Handle, Position, MarkerType } from "reactflow";

Date.prototype.toLocalDate = function () {
    let tzoffset = this.getTimezoneOffset() * 60000; //offset in milliseconds
    let formattedDateStr = new Date(this.getTime() - tzoffset).toISOString();
    return {
        year: formattedDateStr.substring(0, 4),
        month: parseInt(formattedDateStr.substring(5, 7)),
        day: parseInt(formattedDateStr.substring(8, 10)),
    };
};


const starList = [
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

const heavenlyStemToStarIndex = {
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

const mutagenToIndex = {
    祿: 0,
    權: 1,
    科: 2,
    忌: 3,
};

export default function Astrolabe() {
    const router = useRouter();

    const [astrolabe, setAstrolabe] = useState(null);
    const [graph, setGraph] = useState([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Shared sizing for nodes and side edge lengths
    const NODE_WIDTH = 140; // main node width
    const MAIN_NODE_HEIGHT = 32; // fixed height to align handles vertically
    const SIDE_NODE_WIDTH = 100; // red/green node width (shorter)
    const SIDE_NODE_HEIGHT = 32; // fixed height to align handles vertically
    const TARGET_SIDE_LINE = 40; // target visual line length for red/green edges

    // Custom nodes with 4 connection points for main nodes, and side handles for tags
    const PalaceNode = ({ data }) => (
        <div style={{ width: NODE_WIDTH, height: MAIN_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #ddd", borderRadius: 8, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 600, textAlign: 'center' }}>{data.label}</div>
            <Handle type="target" position={Position.Top} id="T" />
            <Handle type="source" position={Position.Bottom} id="B" />
            <Handle type="target" position={Position.Left} id="L" />
            <Handle type="source" position={Position.Right} id="R" />
        </div>
    );

    const RedNode = ({ data }) => (
        <div style={{ width:  SIDE_NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #fca5a5", borderRadius: 6, background: "#fff4f4", textAlign: 'center' }}>{data.label}
            <Handle type="source" position={Position.Right} id="R" />
        </div>
    );

    const GreenNode = ({ data }) => (
        <div style={{ width: SIDE_NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #86efac", borderRadius: 6, background: "#f1fff6", textAlign: 'center' }}>{data.label}
            <Handle type="target" position={Position.Left} id="L" />
        </div>
    );

    const BlueNode = ({ data }) => (
        <div style={{ width: NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #93c5fd", borderRadius: 6, background: "#eff6ff", textAlign: 'center' }}>{data.label}
            <Handle type="target" position={Position.Top} id="T" />
        </div>
    );

    const nodeTypes = useMemo(() => ({ palace: PalaceNode, red: RedNode, green: GreenNode, blue: BlueNode }), []);


    const [name, setName] = useState("");
    const [gender, setGender] = useState(0);
    const [calendar, setCalendar] = useState(0);
    const [isLeapMonth, setIsLeapMonth] = useState(false);
    const [birthTime, setBirthTime] = useState(0);


    const today = new Date().toLocalDate();
    const [year, setYear] = useState(today.year);
    const [month, setMonth] = useState(today.month);
    const [day, setDay] = useState(today.day);

    const generateAstrolabe = () => {
        let astrolabe;
        if (calendar == 0) {
            astrolabe = astro.astrolabeBySolarDate(`${year}-${month}-${day}`, birthTime, gender == 0 ? "male" : "female", true, "zh-TW");
        } else {
            astrolabe = astro.astrolabeByLunarDate(`${year}-${month}-${day}`, birthTime, gender == 0 ? "male" : "female", isLeapMonth, true, "zh-TW");
        }
        let lifePalaceIndex = astrolabe.palaces.findIndex((pItem) => pItem.name === "命宮");
        let lifePalaceMutagenStars = heavenlyStemToStarIndex[astrolabe.palaces[lifePalaceIndex].decadal.heavenlyStem].map((item) => starList[item]);

        let couplePalaceIndex = astrolabe.palaces.findIndex((pItem) => pItem.name === "夫妻" || pItem.name === "夫妻宮");

        let myAstrolabe = {
            chineseDate: astrolabe.chineseDate.replaceAll("醜", "丑"),
            solarDate: astrolabe.solarDate,
            fiveElementsClass: astrolabe.fiveElementsClass,
            lunarDate: `${astrolabe.lunarDate.replaceAll("腊", "臘").replaceAll("闰", "閏")}`,
            time: astrolabe.time,
            timeRange: astrolabe.timeRange,
            palaces: astrolabe.palaces.map((pItem, pIndex) => {
                let majorStars = pItem.majorStars.flatMap((star) => {
                    if (starList.includes(star.name)) {
                        return [
                            {
                                name: star.name,
                                mutagen: star.mutagen,
                                hollowMutagen:
                                    lifePalaceMutagenStars.findIndex((s) => star.name === s) > -1
                                        ? Object.keys(mutagenToIndex).find(
                                              (key) => mutagenToIndex[key] === lifePalaceMutagenStars.findIndex((s) => star.name === s)
                                          )
                                        : "",
                            },
                        ];
                    }
                    return [];
                });
                let minorStars = pItem.minorStars.flatMap((star) => {
                    if (starList.includes(star.name)) {
                        return [
                            {
                                name: star.name,
                                mutagen: star.mutagen,
                                hollowMutagen:
                                    // find '祿權科忌' based on mutagenIndex (0,1,2,3)
                                    lifePalaceMutagenStars.findIndex((s) => star.name === s) > -1
                                        ? Object.keys(mutagenToIndex).find(
                                              (key) => mutagenToIndex[key] === lifePalaceMutagenStars.findIndex((s) => star.name === s)
                                          )
                                        : "",
                            },
                        ];
                    }
                    return [];
                });
                let mutagenStars = heavenlyStemToStarIndex[pItem.decadal.heavenlyStem].map((starIndex) => starList[starIndex]);
                return {
                    name: pItem.name === "僕役" ? "交友宮" : pItem.name === "官祿" ? "事業宮" : pItem.name === "命宮" ? pItem.name : `${pItem.name}宮`,
                    ages: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(
                        (item, index) =>
                            astrolabe.rawDates.lunarDate.lunarYear -
                            (astrolabe.rawDates.lunarDate.lunarYear % 12) +
                            6 +
                            pIndex +
                            index * 12 -
                            astrolabe.rawDates.lunarDate.lunarYear +
                            1
                    ),

                    decadal: { ...pItem.decadal, earthlyBranch: pItem.decadal.earthlyBranch.replaceAll("醜", "丑") },
                    majorStars: majorStars,
                    minorStars: minorStars,
                    mutagenStars: mutagenStars,
                    outsideMutagenIndexes: mutagenStars.flatMap((mStar, mIndex) => {
                        if (majorStars.find((star) => star.name === mStar) || minorStars.find((star) => star.name === mStar)) {
                            return [mIndex];
                        }
                        return [];
                    }),
                    insideMutagenIndexes: mutagenStars.flatMap((mStar, mIndex) => {
                        if (
                            astrolabe.palaces[(pIndex + 6) % 12].majorStars.find((star) => star.name === mStar) ||
                            astrolabe.palaces[(pIndex + 6) % 12].minorStars.find((star) => star.name === mStar)
                        ) {
                            return [mIndex];
                        }
                        return [];
                    }),
                };
            }),
            lunarYear: astrolabe.rawDates.lunarDate.lunarYear,
            name: name,
            gender:
                gender == 0
                    ? astrolabe.rawDates.lunarDate.lunarYear % 2 == 0
                        ? "陽男"
                        : "陰男"
                    : gender == 1
                    ? astrolabe.rawDates.lunarDate.lunarYear % 2 == 0
                        ? "陽女"
                        : "陰女"
                    : "",
            isLeapMonth: isLeapMonth,
        };

        console.log(myAstrolabe);
        setAstrolabe(myAstrolabe);


    };


    useEffect(() => {
      if (!astrolabe) return;

      const mutagenStars = astrolabe.palaces.flatMap((p) => 
      {
        if (p.majorStars.find((s) => s.mutagen === "祿") || p.majorStars.find((s) => s.mutagen === "權")) {
            let star = p.majorStars.find((s) => s.mutagen === "祿") || p.majorStars.find((s) => s.mutagen === "權");
            return [{name: p.name, star: star.name, mutagen: star.mutagen}];
        }
        if (p.minorStars.find((s) => s.mutagen === "祿") || p.minorStars.find((s) => s.mutagen === "權")) {
            let star = p.minorStars.find((s) => s.mutagen === "祿") || p.minorStars.find((s) => s.mutagen === "權");
            return [{name: p.name, star: star.name, mutagen: star.mutagen}];
        }
        return [];
      });
      console.log(mutagenStars);
    
      const palaces = astrolabe.palaces.map((p) => ({
        name: p.name,
        mutagenStars: p.mutagenStars,
        majorStarNames: p.majorStars.map((s) => s.name),
        minorStarNames: p.minorStars.map((s) => s.name),
      }));
    
      // starName -> [palaceName,...] for innerGreen (mutagenStars[0]) / innerRed (mutagenStars[1])
      const greenMap = new Map();
      const redMap = new Map();
    
      // starName -> palaceName (owner) for major/minor stars, for outerBlue lookup
      const starToPalace = new Map();
    
      for (const p of palaces) {
        const g = p.mutagenStars[0];
        const r = p.mutagenStars[1];
    
        if (g) {
          if (!greenMap.has(g)) greenMap.set(g, []);
          greenMap.get(g).push(p.name);
        }
        if (r) {
          if (!redMap.has(r)) redMap.set(r, []);
          redMap.get(r).push(p.name);
        }
    
        for (const s of p.majorStarNames) if (!starToPalace.has(s)) starToPalace.set(s, p.name);
        for (const s of p.minorStarNames) if (!starToPalace.has(s)) starToPalace.set(s, p.name);
      }
    
      const myStarPalaceMap = palaces
        .flatMap((p) => {
        const targetStar = p.mutagenStars[3];
        const ownerName = targetStar ? starToPalace.get(targetStar) : undefined;
        const outerBlue = ownerName ? { star: targetStar, name: ownerName } : "";
    
        const buildEntry = (starName) => ({
          name: p.name,
            star: starName,
            innerGreen: (greenMap.get(starName) || []).map((palaceName) => (palaceName === p.name ? "祿" : palaceName)).concat(mutagenStars.find((s) => s.star === starName && s.mutagen === "祿") ? ["生"] : []),
          innerRed: (redMap.get(starName) || []).map((palaceName) => (palaceName === p.name ? "權" : palaceName)).concat(mutagenStars.find((s) => s.star === starName && s.mutagen === "權") ? ["生"] : []),
          outerBlue,
        });
    
        return [
          ...p.majorStarNames.map(buildEntry),
          ...p.minorStarNames.map(buildEntry),
        ];
        })
        .filter((entry) => entry.innerGreen && entry.innerGreen.length > 0);
      
      // Build an index map: "palaceName|starName" -> first index in myStarPalaceMap
      const indexByNameAndStar = new Map();
      myStarPalaceMap.forEach((item, index) => {
        const key = `${item.name}|${item.star}`;
        if (!indexByNameAndStar.has(key)) indexByNameAndStar.set(key, index);
      });

      // Attach tail (was outerBlueIndex), then compute heads for each item
      const myStarPalaceMapWithTail = myStarPalaceMap.map((item, selfIdx) => {
        if (item.outerBlue && typeof item.outerBlue === 'object' && item.outerBlue.name && item.outerBlue.star) {
          const idx = indexByNameAndStar.get(`${item.outerBlue.name}|${item.outerBlue.star}`);
          const tail = typeof idx === 'number' && idx !== selfIdx ? idx : undefined;
          return { ...item, tail };
        }
        return { ...item, tail: undefined };
      });

      const headsByIndex = Array(myStarPalaceMapWithTail.length).fill(0).map(() => []);
      myStarPalaceMapWithTail.forEach((item, idx) => {
        if (typeof item.tail === 'number' && item.tail !== idx) headsByIndex[item.tail].push(idx);
      });

      const myStarPalaceMapWithLinks = myStarPalaceMapWithTail.map((item, idx) => ({
        ...item,
        heads: headsByIndex[idx],
      }));

      console.log(palaces);
      console.log(myStarPalaceMapWithLinks);
      setGraph(myStarPalaceMapWithLinks);
    }, [astrolabe]);


    const [updateCounter, setUpdateCounter] = useState(0);
    useEffect(() => {
        generateAstrolabe();
    }, [updateCounter]);


    const { n, g, c, y, m, d, bt, lm } = router.query;
    useEffect(() => {
        //console.log(n, g, c, y, m, d, bt, lm);
        //console.log(router.pathname);
        //console.log(router.query);
        if (g && c && y && m && d && bt && lm) {
            // c == 0 ? "陽曆" : "農曆"
            // g == 0 ? "男" : "女"
            // lm == 1 ? "閏月" : "非閏月"

            if (n) setName(n);
            setName(n);
            setGender(parseInt(g));
            setCalendar(parseInt(c));
            setYear(parseInt(y));
            setMonth(parseInt(m));
            setDay(parseInt(d));
            setBirthTime(parseInt(bt));
            setIsLeapMonth(lm === "1" ? true : false);
            setUpdateCounter(updateCounter + 1);
        }
    }, [n, g, c, y, m, d, bt, lm]);

    // Build connected components and per-component flow data
    const buildComponents = (data) => {
        const n = data.length;
        const visited = Array(n).fill(false);
        const components = [];
        const getNeighbors = (i) => {
            const neighbors = [];
            const t = data[i]?.tail;
            if (typeof t === "number") neighbors.push(t);
            const heads = data[i]?.heads || [];
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
        return components;
    };

    const flows = useMemo(() => {
        if (!graph || graph.length === 0) return [];
        const comps = buildComponents(graph);
        return comps.map((comp) => {
            const layerHeight = 120; // vertical space between main nodes
            const colGap = 220;
            const LINK_LENGTH = 40; // fixed visual line length for red/green links
            const subItemGap = 32;

            // Build indegree for tail edges within this component
            const inDegree = new Map();
            comp.forEach((idx) => inDegree.set(idx, 0));
            comp.forEach((idx) => {
                const t = graph[idx].tail;
                if (typeof t === 'number' && comp.includes(t)) {
                    inDegree.set(t, (inDegree.get(t) || 0) + 1);
                }
            });

            // Kahn layering: heads (inDegree 0) at top, tails downwards
            const layerByIdx = new Map();
            const queue = [];
            comp.forEach((idx) => { if ((inDegree.get(idx) || 0) === 0) { layerByIdx.set(idx, 0); queue.push(idx); } });
            while (queue.length) {
                const u = queue.shift();
                const uLayer = layerByIdx.get(u) || 0;
                const v = graph[u].tail;
                if (typeof v === 'number' && comp.includes(v)) {
                    const nextLayer = Math.max((layerByIdx.get(v) ?? -1), uLayer + 1);
                    layerByIdx.set(v, nextLayer);
                    inDegree.set(v, (inDegree.get(v) || 0) - 1);
                    if ((inDegree.get(v) || 0) === 0) queue.push(v);
                }
            }
            // For any remaining (cycles), default to 0
            comp.forEach((idx) => { if (!layerByIdx.has(idx)) layerByIdx.set(idx, 0); });

            // Group by layers
            const layers = new Map();
            comp.forEach((idx) => {
                const l = layerByIdx.get(idx) || 0;
                if (!layers.has(l)) layers.set(l, []);
                layers.get(l).push(idx);
            });
            const sortedLayers = Array.from(layers.entries()).sort((a,b) => a[0]-b[0]);

            const nodes = [];
            const edges = [];
            const posByIdx = new Map();

            const mainWidth = NODE_WIDTH;
            const minGapX = 40;

            const getHalves = (idx) => {
                const hasRed = (graph[idx].innerRed || []).length > 0;
                const hasGreen = (graph[idx].innerGreen || []).length > 0;
                const leftHalf = mainWidth / 2 + (hasRed ? (LINK_LENGTH + SIDE_NODE_WIDTH) : 0);
                const rightHalf = mainWidth / 2 + (hasGreen ? (LINK_LENGTH + SIDE_NODE_WIDTH) : 0);
                return { leftHalf, rightHalf };
            };

            sortedLayers.forEach(([l, arr]) => {
                arr.sort((a,b) => a-b);
                const xs = [];
                arr.forEach((idx, i) => {
                    if (i === 0) {
                        xs[i] = 0;
                    } else {
                        const prev = arr[i - 1];
                        const { rightHalf: prevRight } = getHalves(prev);
                        const { leftHalf: currLeft } = getHalves(idx);
                        xs[i] = xs[i - 1] + prevRight + currLeft + minGapX;
                    }
                });
                if (xs.length > 0) {
                    const minX = xs[0];
                    const maxX = xs[xs.length - 1];
                    const center = (minX + maxX) / 2;
                    for (let i = 0; i < xs.length; i++) xs[i] -= center;
                }
                arr.forEach((idx, i) => {
                    const cx = xs[i] || 0; // center x
                    const x = cx - NODE_WIDTH / 2; // convert to top-left for React Flow
                    const y = l * layerHeight;
                    posByIdx.set(idx, { x, y, cx });
                    nodes.push({ id: `m-${idx}`, type: 'palace', data: { label: `${graph[idx].name}・${graph[idx].star}` }, position: { x, y } });
                });
            });

            // Tail edges between main nodes
            comp.forEach((idx) => {
                const t = graph[idx].tail;
                if (typeof t === 'number' && comp.includes(t)) {
                    edges.push({ id: `t-${idx}-${t}`, source: `m-${idx}`, target: `m-${t}`, sourceHandle: 'B', targetHandle: 'T', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } });
                }
            });

            // Append outerBlue node at the ultimate tail (bottom-most without further tail inside component)
            const tails = new Set();
            comp.forEach((idx) => { if (typeof graph[idx].tail === 'number' && comp.includes(graph[idx].tail)) tails.add(graph[idx].tail); });
            const heads = comp.filter((idx) => !tails.has(idx)); // nodes that are not anyone's tail are heads; we need sinks instead
            const sinks = comp.filter((idx) => !comp.includes(graph[idx].tail));
            sinks.forEach((idx) => {
                const ob = graph[idx].outerBlue;
                if (ob && ob.star && ob.name) {
                    const pos = posByIdx.get(idx) || { x: 0, y: 0 };
                    const blueId = `m-${idx}-OB`;
                    const by = pos.y + 60; // place beneath the sink
                    nodes.push({ id: blueId, type: 'blue', data: { label: `${ob.name}・${ob.star}` }, position: { x: pos.x, y: by } });
                    edges.push({ id: `ob-${idx}`, source: `m-${idx}`, target: blueId, sourceHandle: 'B', targetHandle: 'T', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } });
                }
            });

            // Add innerRed/innerGreen nodes around their main node
            comp.forEach((idx) => {
                const pos = posByIdx.get(idx) || { x: 0, y: 0 };
                const mainId = `m-${idx}`;
                const reds = graph[idx].innerRed || [];
                const greens = graph[idx].innerGreen || [];

                const redCenterOffset = reds.length > 0 ? (reds.length - 1) / 2 : 0;
                reds.forEach((txt, k) => {
                    const redId = `${mainId}-R-${k}`;
                    const ry = pos.y + (k - redCenterOffset) * subItemGap;
                    const redX = pos.x - (LINK_LENGTH + SIDE_NODE_WIDTH);
                    nodes.push({ id: redId, type: 'red', data: { label: txt }, position: { x: redX, y: ry } });
                    const redArrow = (txt === '權')
                      ? { markerStart: { type: MarkerType.ArrowClosed, color: '#ef4444' } }
                      : { markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } };
                    edges.push({ id: `r-${idx}-${k}`, source: redId, target: mainId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#ef4444' }, animated: false, ...redArrow });
                });

                const greenCenterOffset = greens.length > 0 ? (greens.length - 1) / 2 : 0;
                greens.forEach((txt, k) => {
                    const greenId = `${mainId}-G-${k}`;
                    const gy = pos.y + (k - greenCenterOffset) * subItemGap;
                    const greenX = pos.x + NODE_WIDTH + LINK_LENGTH;
                    nodes.push({ id: greenId, type: 'green', data: { label: txt }, position: { x: greenX, y: gy } });
                    const greenArrow = (txt === '祿')
                      ? { markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' } }
                      : { markerStart: { type: MarkerType.ArrowClosed, color: '#16a34a' } };
                    edges.push({ id: `g-${idx}-${k}`, source: mainId, target: greenId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#16a34a' }, animated: false, ...greenArrow });
                });
            });

            return { comp, nodes, edges, layerCount: sortedLayers.length };
        });
    }, [graph]);

    return (
        <>
            <Head>
                <title>排盤 - 飛星紫微斗數</title>
                <meta
                    name="description"
                    content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
                />
            </Head>
            {/* <div className={`header show`}>
                <div className="left info-header">
                    <Link href="/">
                        <div className="logo">
                            <img src={"logo.png"} alt="logo" />
                            <div className="name">曜靈星軌理數</div>
                        </div>
                    </Link>
                    <Link href="/chart">
                        <button>線上排盤</button>
                    </Link>
                    <Link href="/info#begin">
                        <button>遇見命理師</button>
                    </Link>
                    
                    <Link href="/blog">
                        <button>網誌</button>
                    </Link>
                </div>
                <div className="right">
                    <a target="_blank" href="https://buy.stripe.com/cN2cPsa6XaLMauQ001">
                        支持我們
                    </a>
                </div>
            </div> */}

            <div className="container">
                {mounted && flows.map((flow, idx) => {
                    const height = Math.max(360, (flow.layerCount || 1) * 260);
                    return (
                    <div key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, margin: "16px 0" }}>
                        {/* <div style={{ fontSize: 14, marginBottom: 8 }}>圖 {idx + 1} ・ 節點 {flow.comp.length}</div> */}
                        <div style={{ width: "100%", height: height }}>
                            <ReactFlow key={`rf-${idx}-${flow.nodes.length}-${flow.edges.length}`} nodes={flow.nodes} edges={flow.edges} nodeTypes={nodeTypes} defaultEdgeOptions={{ type: 'straight' }} fitView fitViewOptions={{ padding: 0.2 }} proOptions={{ hideAttribution: true }}>
                                <Controls showInteractive={false} position="top-right" />
                                <Background />
                            </ReactFlow>
                        </div>
                    </div>
                    );
                })}
            </div>
        </>
    );
}
