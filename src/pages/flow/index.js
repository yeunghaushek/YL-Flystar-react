// http://localhost:3000/flow?n=&g=0&c=0&y=2025&m=8&d=21&bt=3&lm=0

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { astro } from "iztro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Controls, Handle, Position, MarkerType, BaseEdge } from "reactflow";

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
    const NODE_WIDTH = 60; // star node (main rectangle) width
    const MAIN_NODE_HEIGHT = 40; // star node height
    const SIDE_NODE_WIDTH = 80; // red/green node width (shorter)
    const SIDE_NODE_HEIGHT = 32; // fixed height to align handles vertically
    const TARGET_SIDE_LINE = 40; // (legacy) remained for readability
    const ELLIPSE_WIDTH = 80; // palace ellipse node width
    const ELLIPSE_HEIGHT = 40; // palace ellipse node height

    // Reserve for bottom fixed shortcut bar to avoid overlaying the canvas when panning
    const SHORTCUT_BAR_OFFSET = 12; // bottom: 12px
    const SHORTCUT_BAR_HEIGHT = 44; // approximate bar height including padding
    const CHART_BOTTOM_SPACER = SHORTCUT_BAR_OFFSET + SHORTCUT_BAR_HEIGHT + 8;

    // Star (rectangle) node: shows star name only; top receives blue, left/right for red/green
    const StarNode = ({ data }) => {
        const { handles = {} } = data; // Get which handles should be visible
        const offsetLeft = Math.max(0, data.offsetLeft || 0);
        const offsetRight = Math.max(0, data.offsetRight || 0);
        const containerWidth = NODE_WIDTH + offsetLeft + offsetRight;
        return (
            <div style={{ width: containerWidth, height: MAIN_NODE_HEIGHT, position: 'relative' }}>
                <div style={{ position: 'absolute', left: offsetLeft, right: offsetRight, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: "1px solid #ddd", borderRadius: 8, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontWeight: 600, textAlign: 'center', fontSize: '14px', lineHeight: '1.5' }}>{data.label}</div>
                    {handles.T && <Handle type="target" position={Position.Top} id="T" />}
                    {handles.L && <Handle type="target" position={Position.Left} id="L" />}
                    {handles.R && <Handle type="source" position={Position.Right} id="R" />}
                </div>
            </div>
        );
    };

    // Palace (ellipse) node: shows palace name only; bottom sends blue
    const EclipseNode = ({ data }) => {
        const { handles = {} } = data;
        return (
            <div style={{ width: ELLIPSE_WIDTH, height: ELLIPSE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: "1px solid #ddd", borderRadius: 9999, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", textAlign: 'center' }}>
                <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
                {handles.B && <Handle type="source" position={Position.Bottom} id="B" />}
            </div>
        );
    };

    const RedNode = ({ data }) => (
        <div style={{ width:  SIDE_NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: data.label.startsWith("自化") ? "1px dashed #fca5a5" : "2px solid #fca5a5", borderRadius: 6, background: data.label.startsWith("自化") ? "#fff4f4" : "#fff4f4", textAlign: 'center' }}>
            <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
            <Handle type="source" position={Position.Right} id="R" />
        </div>
    );

    const GreenNode = ({ data }) => (
        <div style={{ width: SIDE_NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: data.label.startsWith("自化") ? "1px dashed #86efac" : "2px solid #86efac", borderRadius: 6, background: data.label.startsWith("自化") ? "#f1fff6" : "#f1fff6", textAlign: 'center' }}>
            <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
            <Handle type="target" position={Position.Left} id="L" />
        </div>
    );

    const BlueNode = ({ data }) => {
        const { handles = { T: true, B: false } } = data;
        return (
            <div style={{ width: SIDE_NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: data.label.startsWith("自化") ? "1px dashed #93c5fd" : "2px solid #93c5fd", borderRadius: 6, background: data.label.startsWith("自化") ? "#eff6ff" : "#eff6ff", textAlign: 'center' }}>
                <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
                {handles.T && <Handle type="target" position={Position.Top} id="T" />}
                {handles.B && <Handle type="source" position={Position.Bottom} id="B" />}
            </div>
        );
    };

    const LastNode = ({ data }) => {
        const [star, name] = data.label.split('・');
        const { handles = { T: true, B: false } } = data; // Default to showing only T handle for last nodes
        return (
            <div style={{ width: NODE_WIDTH, height: MAIN_NODE_HEIGHT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: "1px solid #ddd", borderRadius: 8, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div style={{ fontWeight: 600, textAlign: 'center', fontSize: '14px', lineHeight: '1.5' }}>{star}</div>
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.5' }}>{name}</div>
                {handles.T && <Handle type="target" position={Position.Top} id="T" />}
                {handles.B && <Handle type="source" position={Position.Bottom} id="B" />}
            </div>
        );
    };

    const nodeTypes = useMemo(() => ({ star: StarNode, eclipse: EclipseNode, red: RedNode, green: GreenNode, blue: BlueNode, last: LastNode }), []);

    // Custom 90-degree edge with optional vertical offset to reduce overlaps
    const RightAngleEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, style, data }) => {
        const offsetY = (data && typeof data.offsetY === 'number') ? data.offsetY : 0;
        const avoidNodes = (data && typeof data.avoidNodes === 'boolean') ? data.avoidNodes : false;
        const turnPointOffset = (data && typeof data.turnPointOffset === 'number') ? data.turnPointOffset : 0;
        const fixedMidY = (data && typeof data.fixedMidY === 'number') ? data.fixedMidY : undefined;
        const centered = (data && data.centered === true);
        const maxMidY = (data && typeof data.maxMidY === 'number') ? data.maxMidY : undefined;
        const minMidY = (data && typeof data.minMidY === 'number') ? data.minMidY : undefined;
        const bendY1 = (data && typeof data.bendY1 === 'number') ? data.bendY1 : undefined;
        const bendY2 = (data && typeof data.bendY2 === 'number') ? data.bendY2 : undefined;
        const bendX = (data && typeof data.bendX === 'number') ? data.bendX : Math.round((sourceX + targetX) / 2);

        // Multi-turn path (4 turning points):
        if (typeof bendY1 === 'number' && typeof bendY2 === 'number') {
            const path = `M ${sourceX} ${sourceY} L ${sourceX} ${bendY1} L ${bendX} ${bendY1} L ${bendX} ${bendY2} L ${targetX} ${bendY2} L ${targetX} ${targetY}`;
            return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
        }

        let midY = Math.round(((sourceY + targetY) / 2) + offsetY);

        // If we need to avoid nodes, keep midY as centered as possible within a safe band
        if (avoidNodes) {
            const baseClearance = MAIN_NODE_HEIGHT + 60; // moderate clearance to avoid pushing midY too low
            const minGapToTarget = 56; // ensure a longer lower segment and avoid target overlap
            let minMid = sourceY + baseClearance; // lower bound independent from per-layer shifts
            if (typeof minMidY === 'number') minMid = Math.max(minMid, minMidY);
            let maxMid = targetY - minGapToTarget;
            if (typeof maxMidY === 'number') maxMid = Math.min(maxMid, maxMidY);
            // Use per-layer offset as a centered shift rather than raising the lower bound
            const centeredGuess = Math.round(((sourceY + targetY) / 2) + offsetY + turnPointOffset);
            if (minMid <= maxMid) {
                const clamped = Math.max(minMid, Math.min(centeredGuess, maxMid));
                midY = clamped;
            } else {
                // fallback when band collapses
                midY = Math.round((minMid + maxMid) / 2);
            }
        }

        // If explicitly centered, make upper and lower vertical segments same length
        if (centered) {
            // For centered mode we still respect a minimal downward margin to target
            const minGapToTarget = 16;
            const ideal = Math.round((sourceY + targetY) / 2);
            midY = Math.min(ideal, targetY - minGapToTarget);
        }

        // Allow callers to pin the midY to separate parallel edges and avoid overlaps
        if (!centered && typeof fixedMidY === 'number') {
            let lower = (typeof minMidY === 'number') ? minMidY : (sourceY + MAIN_NODE_HEIGHT + 40);
            let upper = targetY - 16;
            if (typeof maxMidY === 'number') upper = Math.min(upper, maxMidY);
            midY = Math.max(lower, Math.min(fixedMidY, upper));
        }

        const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
        return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
    };

    const edgeTypes = useMemo(() => ({ rightangle: RightAngleEdge }), []);


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
        if (p.minorStars.find((s) => s.mutagen === "忌") || p.minorStars.find((s) => s.mutagen === "忌")) {
            let star = p.minorStars.find((s) => s.mutagen === "忌") || p.minorStars.find((s) => s.mutagen === "忌");
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
    
        const buildEntry = (starName) => {
          let ob = ownerName ? { star: targetStar, name: ownerName } : "";
          // If outerBlue points back to the same palace and same star, mark as 自化忌
          if (ob && ob.star && ob.name && ob.name === p.name && ob.star === starName) {
            ob = { name: "自化忌", star: "" };
          }

          /* if (ob && ob.star && ob.name && mutagenStars.find((s) => s.star === starName && s.mutagen === "忌")) {
            ob = { name: "自化忌", star: "" };
          } */


          return {
            name: p.name,
            star: starName,
            innerGreen: (greenMap.get(starName) || []).map((palaceName) => (palaceName === p.name ? "自化祿" : palaceName)).concat(mutagenStars.find((s) => s.star === starName && s.mutagen === "祿") ? ["生年祿"] : []),
            innerRed: (redMap.get(starName) || []).map((palaceName) => (palaceName === p.name ? "自化權" : palaceName)).concat(mutagenStars.find((s) => s.star === starName && s.mutagen === "權") ? ["生年權"] : []),
            outerBlue: ob,
          };
        };
    
        return [
          ...p.majorStarNames.map(buildEntry),
          ...p.minorStarNames.map(buildEntry),
        ];
        })
        .filter((entry) => entry.innerGreen && entry.innerGreen.length > 0);


        // handle the last blue node which is not found in myStarPalaceMap (文曲)
        const blueMutagenStars = mutagenStars.find((s) => s.mutagen === "忌");
        if (blueMutagenStars && !myStarPalaceMap.find((s) => s.name === blueMutagenStars.name && s.star === blueMutagenStars.star)) {
          myStarPalaceMap.push({name: blueMutagenStars.name, star: blueMutagenStars.star, innerGreen: [], innerRed: [], outerBlue: { name: "自化忌", star: "" }});
        }
      
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
        // Build diagrams by unique heads (items with no incoming heads)
        const headIndexes = graph
          .map((item, idx) => ({ idx, heads: item && item.heads ? item.heads : [] }))
          .filter((x) => !x.heads || x.heads.length === 0)
          .map((x) => x.idx);

        const buildChainFromHead = (startIdx) => {
            const chain = [];
            const visited = new Set();
            let cur = startIdx;
            while (typeof cur === 'number' && !visited.has(cur)) {
                visited.add(cur);
                chain.push(cur);
                const t = graph[cur] ? graph[cur].tail : undefined;
                if (typeof t !== 'number') break;
                cur = t;
            }
            return chain;
        };

        const uniqueChain = (start) => {
            const chain = buildChainFromHead(start);
            return Array.from(new Set(chain));
        };
        const chains = (headIndexes && headIndexes.length > 0)
          ? headIndexes.map((h) => uniqueChain(h))
          : [];

        // Add pure cycles not covered by chains
        const covered = new Set(chains.flat());
        const comps = [...chains];
        const buildCycleFrom = (startIdx) => {
            const order = [];
            const seen = new Map();
            let cur = startIdx;
            while (typeof cur === 'number' && !seen.has(cur)) {
                seen.set(cur, order.length);
                order.push(cur);
                const t = graph[cur] ? graph[cur].tail : undefined;
                if (typeof t !== 'number') return [];
                cur = t;
            }
            if (seen.has(cur)) {
                const begin = seen.get(cur) || 0;
                return order.slice(begin);
            }
            return [];
        };
        for (let i = 0; i < graph.length; i++) {
            if (covered.has(i)) continue;
            const cyc = buildCycleFrom(i);
            if (cyc.length > 0) {
                comps.push(cyc);
                cyc.forEach((n) => covered.add(n));
            }
        }
        if (comps.length === 0) {
            // fallback to connected components if nothing found
            const fallback = buildComponents(graph);
            fallback.forEach((c) => comps.push(c));
        }
        return comps.map((comp) => {
            const layerHeight = 160; // reduced vertical clearance: straight flows need less space between layers
            const LINK_LENGTH = 40; // fixed visual line length for red/green links
            const subItemGap = 32;

            // Build indegree for tail edges within this component
            const inDegree = new Map();
            comp.forEach((idx) => inDegree.set(idx, 0));
            const usedMidY = new Set(); // track integer midY values to avoid global overlaps
            const allocateMidY = (base, minY, maxY, step = 4) => {
                let y = Math.round(base);
                const clamp = (v) => Math.max(Math.ceil(minY), Math.min(Math.floor(maxY), v));
                y = clamp(y);
                if (!usedMidY.has(y)) { usedMidY.add(y); return y; }
                for (let k = 1; k < 100; k++) {
                    const up = clamp(y + k * step);
                    if (!usedMidY.has(up)) { usedMidY.add(up); return up; }
                    const down = clamp(y - k * step);
                    if (!usedMidY.has(down)) { usedMidY.add(down); return down; }
                }
                usedMidY.add(y);
                return y;
            };

            comp.forEach((idx) => {
                const t = graph[idx].tail;
                if (typeof t === 'number' && comp.includes(t)) {
                    inDegree.set(t, (inDegree.get(t) || 0) + 1);
                }
            });

            // 強制以組件順序垂直配置：第 i 個節點在第 i 層，保證直向排列
            const layerByIdx = new Map();
            comp.forEach((nodeIdx, order) => { layerByIdx.set(nodeIdx, order); });

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

            const getHalves = () => {
                const reserve = LINK_LENGTH + SIDE_NODE_WIDTH;
                const leftHalf = mainWidth / 2 + reserve;
                const rightHalf = mainWidth / 2 + reserve;
                return { leftHalf, rightHalf };
            };

            // Detect cycles (loops) to ensure we still render linkage as straight lines with a duplicate end
            const tailInComp = (idx) => {
                const t = graph[idx].tail;
                return (typeof t === 'number' && comp.includes(t)) ? t : undefined;
            };
            const cycles = [];
            const globallyVisited = new Set();
            comp.forEach((startIdx) => {
                if (globallyVisited.has(startIdx)) return;
                const localOrder = new Map();
                let cur = startIdx;
                while (cur !== undefined && !localOrder.has(cur) && !globallyVisited.has(cur)) {
                    localOrder.set(cur, localOrder.size);
                    cur = tailInComp(cur);
                }
                if (cur !== undefined && localOrder.has(cur)) {
                    const begin = localOrder.get(cur) || 0;
                    const seq = Array.from(localOrder.keys());
                    const cyc = seq.slice(begin);
                    if (cyc.length > 1) cycles.push(cyc);
                }
                for (const k of localOrder.keys()) globallyVisited.add(k);
            });
            const cycleNodeSet = new Set(cycles.flat());
            const nodeToCycle = new Map();
            cycles.forEach((cyc, ci) => { cyc.forEach((n) => nodeToCycle.set(n, ci)); });

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
                    const reserve = LINK_LENGTH + SIDE_NODE_WIDTH;
                    const containerWidth = NODE_WIDTH + reserve * 2;
                    const x = cx - containerWidth / 2; // convert to top-left for React Flow (container width)
                    const y = l * layerHeight;
                    posByIdx.set(idx, { x, y, cx, offsetLeft: reserve, offsetRight: reserve });
                    
                    // Determine which handles are needed for this node
                    const handles = {};
                    
                    // Check if node has incoming blue arrows (needs T handle)
                    const hasIncomingBlue = comp.some(sourceIdx => {
                        const t = graph[sourceIdx].tail;
                        if (!(typeof t === 'number' && t === idx)) return false;
                        const sourceLayer = layerByIdx.get(sourceIdx) || 0;
                        const targetLayer = layerByIdx.get(idx) || 0;
                        return sourceLayer < targetLayer; // only downward arrows
                    }) || cycles.some((cyc) => (cyc.length > 0 && cyc[0] === idx)); // cycle head receives return edge
                    if (hasIncomingBlue) handles.T = true;
                    
                    // Prepare outgoing blue info for ellipse node
                    const t = graph[idx].tail;
                    const ob = graph[idx].outerBlue;
                    const hasOutgoingBlue = (typeof t === 'number' && comp.includes(t)) || (ob && ob.name) || cycleNodeSet.has(idx);
                    // store for later ellipse creation
                    posByIdx.set(idx, { x, y, cx, offsetLeft: reserve, offsetRight: reserve, hasOutgoingBlue });
                    
                    // Check if node has red/green connections (needs L and R handles)
                    const reds = graph[idx].innerRed || [];
                    const greens = graph[idx].innerGreen || [];
                    if (reds.length > 0) handles.L = true;
                    if (greens.length > 0) handles.R = true;
                    
                    // Star node (rectangle): use star name only
                    nodes.push({ id: `m-${idx}`, type: 'star', data: { label: `${graph[idx].star}`, handles, offsetLeft: reserve, offsetRight: reserve }, position: { x, y } });
                });

                // Create palace ellipse node under each star node (do not move star)
                arr.forEach((idx) => {
                    const pos = posByIdx.get(idx) || { x: 0, y: 0, offsetLeft: 0 };
                    const contentCenterX = pos.x + (pos.offsetLeft || 0) + NODE_WIDTH / 2;
                    const ex = contentCenterX - ELLIPSE_WIDTH / 2;
                    const ey = pos.y + MAIN_NODE_HEIGHT + 8;
                    const eHandles = {};
                    if (pos.hasOutgoingBlue) eHandles.B = true; // only bottom dot
                    nodes.push({ id: `p-${idx}`, type: 'eclipse', data: { label: `${graph[idx].name}`, handles: eHandles }, position: { x: ex, y: ey } });
                });
            });

            // Tail edges between main nodes
            // Build incoming list for each tail to compute slight offsets and reduce overlap
            const incomingByTarget = new Map();
            comp.forEach((idx) => {
                const t = graph[idx].tail;
                if (typeof t === 'number' && comp.includes(t)) {
                    if (!incomingByTarget.has(t)) incomingByTarget.set(t, []);
                    incomingByTarget.get(t).push(idx);
                }
            });

            // Collect all blue arrows and group by source layer for global turn point assignment
            // Only include arrows that flow downward (from lower layer to higher layer)
            const blueArrows = [];
            comp.forEach((idx) => {
                const t = graph[idx].tail;
                if (typeof t === 'number' && comp.includes(t)) {
                    const sourceLayer = layerByIdx.get(idx) || 0;
                    const targetLayer = layerByIdx.get(t) || 0;
                    
                    // Only collect downward flowing arrows
                    if (sourceLayer < targetLayer) {
                        blueArrows.push({ source: idx, target: t, sourceLayer });
                    }
                }
            });

            // Group by source layer and assign turn point offsets globally within each layer
            const arrowsBySourceLayer = new Map();
            blueArrows.forEach((arrow) => {
                if (!arrowsBySourceLayer.has(arrow.sourceLayer)) arrowsBySourceLayer.set(arrow.sourceLayer, []);
                arrowsBySourceLayer.get(arrow.sourceLayer).push(arrow);
            });

            // Sort arrows within each layer by source index for deterministic ordering
            arrowsBySourceLayer.forEach((arrows) => { arrows.sort((a, b) => a.source - b.source); });

            // Stair cap disabled – treat as infinite (no stair layer)
            let stairTopCapY = Infinity;

            // Plan fixed midY per source to separate horizontals within each source layer band
            const plannedMidYBySource = new Map();
            arrowsBySourceLayer.forEach((arrows, layer) => {
                const count = arrows.length;
                if (count === 0) return;
                // Compute allowable band within this source layer
                const haveStair = (stairTopCapY !== Infinity);
                const baseBelow = (layer === 0 ? 20 : 60);
                const bandBottom = layer * layerHeight + MAIN_NODE_HEIGHT + baseBelow; // lower bound (smaller for top layer)
                // add a larger guard margin below stair top; if no stair, allow near layer mid
                let bandTop = haveStair ? (stairTopCapY - 30) : ((layer + 0.5) * layerHeight - 4); // upper bound toward top or layer mid
                if (bandTop <= bandBottom) {
                    arrows.forEach((arrow) => plannedMidYBySource.set(arrow.source, bandBottom));
                    return;
                }
                // If no stair in this component, center at exact layer mid; else bias to 25% away from stair top
                const centerY = haveStair ? (bandBottom + (bandTop - bandBottom) * 0.25) : (layer * layerHeight + layerHeight / 2);
                const available = bandTop - bandBottom;
                // Use a tiny, fixed separation around center to avoid overlap but stay near center
                const spacing = (count > 1) ? 4 : 0;
                // Build centered slots: odd -> includes center; even -> straddles center
                let slots = [];
                if (count === 1) {
                    const only = arrows[0];
                    const jitter = (only.source % 2 === 0) ? -4 : 4; // small deterministic separation
                    const planned = Math.max(bandBottom, Math.min(centerY + jitter, bandTop));
                    plannedMidYBySource.set(only.source, planned);
                } else {
                    if (count % 2 === 1) {
                        const half = (count - 1) / 2;
                        for (let k = -half; k <= half; k++) slots.push(centerY + k * spacing);
                    } else {
                        const half = count / 2;
                        for (let k = 0; k < count; k++) slots.push(centerY + (k - (half - 0.5)) * spacing);
                    }
                    // Clamp to band and assign in source order, with deterministic jitter (+/- 2px) to ensure visible 4px separation when rendering anti-aliased lines
                    arrows.sort((a, b) => a.source - b.source).forEach((arrow, i) => {
                        const jitter = ((arrow.source % 2) === 0) ? -2 : 2;
                        let planned = Math.max(bandBottom, Math.min(slots[i] + jitter, bandTop));
                        plannedMidYBySource.set(arrow.source, planned);
                    });
                }
            });

            comp.forEach((idx) => {
                const t = graph[idx].tail;
                if (typeof t === 'number' && comp.includes(t)) {
                    // Draw edges even在循環內也保留，讓 4->6、6->8 等直線存在
                    const sourceLayer = layerByIdx.get(idx) || 0;
                    const targetLayer = layerByIdx.get(t) || 0;
                    
                    // Only draw downward arrows; upward/cycle return handled separately
                    if (sourceLayer < targetLayer) {
                        const arr = incomingByTarget.get(t) || [];
                        const oi = Math.max(0, arr.indexOf(idx));
                        const offsetY = (oi - (arr.length - 1) / 2) * 18; // small stagger to reduce line overlap
                        
                        // Find global turn point offset based on position in source layer
                        // offset 已由全域 midY 分配處理，這裡不再需要 layer 內階梯偏移
                        const data = { offsetY, avoidNodes: true };
                        // Per-source-layer cap: keep turns within upper half of the source layer
                        // Constrain to the same band we planned in
                        const baseBelow = (sourceLayer === 0 ? 20 : 60);
                        const plannedBandBottom = sourceLayer * layerHeight + MAIN_NODE_HEIGHT + baseBelow;
                        let plannedBandTop = (stairTopCapY !== Infinity) ? (stairTopCapY - 30) : ((sourceLayer + 0.5) * layerHeight - 4);
                        data.minMidY = plannedBandBottom;
                        data.maxMidY = plannedBandTop;
                        const plannedMidY = plannedMidYBySource.get(idx);
                        const baseMid = (typeof plannedMidY === 'number') ? plannedMidY : (plannedBandBottom + plannedBandTop) / 2;
                        // Allocate a globally unique midY at 4px steps within the allowed band
                        data.fixedMidY = allocateMidY(baseMid, plannedBandBottom, plannedBandTop, 4);
                        // Blue arrow now starts from ellipse node bottom -> star node top
                        edges.push({ id: `t-${idx}-${t}`, source: `p-${idx}`, target: `m-${t}`, sourceHandle: 'B', targetHandle: 'T', type: 'rightangle', data, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                    }
                }
            });

            // Append outerBlue node at the ultimate tail (bottom-most without further tail inside component)
            const tails = new Set();
            comp.forEach((idx) => { if (typeof graph[idx].tail === 'number' && comp.includes(graph[idx].tail)) tails.add(graph[idx].tail); });
            const heads = comp.filter((idx) => !tails.has(idx)); // nodes that are not anyone's tail are heads; we need sinks instead
            const sinks = comp.filter((idx) => !comp.includes(graph[idx].tail));
            sinks.forEach((idx) => {
                const ob = graph[idx].outerBlue;
                if (ob && ob.name) {
                    const pos = posByIdx.get(idx) || { x: 0, y: 0, offsetLeft: 0 };
                    const by = pos.y + Math.max(180, layerHeight); // deeper spacing under the main node for better visual height
                    // 自化忌: 使用藍色節點，且只顯示名稱（不含星）
                    if (ob.name === '自化忌') {
                        const blueId = `m-${idx}-BLUE`;
                        const contentCenterX = pos.x + (pos.offsetLeft || 0) + NODE_WIDTH / 2;
                        const blueX = contentCenterX - SIDE_NODE_WIDTH / 2;
                        nodes.push({ id: blueId, type: 'blue', data: { label: ob.name, handles: { T: true, B: false } }, position: { x: blueX, y: by } });
                        // use a straight vertical edge to ensure marker points downward correctly
                        edges.push({ id: `ob-${idx}`, source: `p-${idx}`, target: blueId, sourceHandle: 'B', targetHandle: 'T', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                    } else if (ob.star) {
                        // Split into separate star node (top) and palace ellipse (bottom), like regular nodes
                        const starId = `m-${idx}-LAST-STAR`;
                        const contentCenterX = pos.x + (pos.offsetLeft || 0) + NODE_WIDTH / 2;
                        const starX = contentCenterX - NODE_WIDTH / 2;
                        nodes.push({ id: starId, type: 'star', data: { label: `${ob.star}`, handles: { T: true }, offsetLeft: 0, offsetRight: 0 }, position: { x: starX, y: by } });
                        // Connect current palace ellipse to the last star node with a straight blue arrow
                        edges.push({ id: `ob-${idx}`, source: `p-${idx}`, target: starId, sourceHandle: 'B', targetHandle: 'T', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        // Add the palace ellipse below the star node for the destination palace
                        const epX = contentCenterX - ELLIPSE_WIDTH / 2;
                        const epY = by + MAIN_NODE_HEIGHT + 8;
                        const epId = `p-${idx}-LAST`;
                        nodes.push({ id: epId, type: 'eclipse', data: { label: `${ob.name}`, handles: {} }, position: { x: epX, y: epY } });
                    }
                }
            });

            // For each cycle, draw a 4-turn right-angle return path from last -> first (no duplicate nodes)
            if (cycles.length > 0) {
                cycles.forEach((cyc, ci) => {
                    const firstIdx = cyc[0];
                    const lastIdx = cyc[cyc.length - 1];
                    const lastPos = posByIdx.get(lastIdx) || { x: 0, y: 0 };
                    const firstPos = posByIdx.get(firstIdx) || { x: 0, y: 0 };
                    const bendY1 = lastPos.y + MAIN_NODE_HEIGHT + 80; // first horizontal below last (more downward offset)
                    const bendY2 = Math.min(firstPos.y - 50, bendY1 + 140); // second horizontal near head (more top offset)
                    // vertical return slightly left of nodes, but not too far
                    const bendX = Math.min(firstPos.x, lastPos.x) - 20;
                    const data = { avoidNodes: true, bendY1, bendY2, bendX };
                    edges.push({ id: `c-${ci}-return`, source: `p-${lastIdx}`, target: `m-${firstIdx}`, sourceHandle: 'B', targetHandle: 'T', type: 'rightangle', data, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                });
            }

            // Add innerRed/innerGreen nodes around their main node
            comp.forEach((idx) => {
                const pos = posByIdx.get(idx) || { x: 0, y: 0, offsetLeft: 0, offsetRight: 0 };
                const mainId = `m-${idx}`;
                const reds = graph[idx].innerRed || [];
                const greens = graph[idx].innerGreen || [];

                const redCenterOffset = reds.length > 0 ? (reds.length - 1) / 2 : 0;
                reds.forEach((txt, k) => {
                    const redId = `${mainId}-R-${k}`;
                    const ry = pos.y + (k - redCenterOffset) * subItemGap - 32; // offset upward by 8px
                    const contentLeft = pos.x + (pos.offsetLeft || 0);
                    const redX = contentLeft - (LINK_LENGTH + SIDE_NODE_WIDTH);
                    nodes.push({ id: redId, type: 'red', data: { label: txt }, position: { x: redX, y: ry } });
                    const redArrow = (txt === '自化權')
                      ? { markerStart: { type: MarkerType.ArrowClosed, color: '#ef4444', width: 20, height: 20 } }
                      : { markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444', width: 20, height: 20 } };
                    edges.push({ id: `r-${idx}-${k}`, source: redId, target: mainId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#ef4444' }, animated: false, ...redArrow });
                });

                const greenCenterOffset = greens.length > 0 ? (greens.length - 1) / 2 : 0;
                greens.forEach((txt, k) => {
                    const greenId = `${mainId}-G-${k}`;
                    const gy = pos.y + (k - greenCenterOffset) * subItemGap - 32; // offset upward by 8px
                    const contentRight = pos.x + (pos.offsetLeft || 0) + NODE_WIDTH;
                    const greenX = contentRight + LINK_LENGTH;
                    nodes.push({ id: greenId, type: 'green', data: { label: txt }, position: { x: greenX, y: gy } });
                    const greenArrow = (txt === '自化祿')
                      ? { markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a', width: 20, height: 20 } }
                      : { markerStart: { type: MarkerType.ArrowClosed, color: '#16a34a', width: 20, height: 20 } };
                    edges.push({ id: `g-${idx}-${k}`, source: mainId, target: greenId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#16a34a' }, animated: false, ...greenArrow });
                });
            });

            // Compute width/height bounds to ensure ReactFlow area can contain loop bends
            const getNodeWidth = (n) => {
                if (n.type === 'star') {
                    // star container width includes reserve on both sides
                    const reserve = LINK_LENGTH + SIDE_NODE_WIDTH;
                    return NODE_WIDTH + reserve * 2;
                }
                if (n.type === 'eclipse') return ELLIPSE_WIDTH;
                if (n.type === 'last') return NODE_WIDTH;
                // red/green/blue nodes
                return SIDE_NODE_WIDTH;
            };
            const getNodeHeight = (n) => {
                if (n.type === 'star' || n.type === 'last') return MAIN_NODE_HEIGHT;
                if (n.type === 'eclipse') return ELLIPSE_HEIGHT;
                return SIDE_NODE_HEIGHT;
            };
            let minXBound = Infinity;
            let maxXBound = -Infinity;
            let minYBound = Infinity;
            let maxYBound = -Infinity;
            nodes.forEach((n) => {
                const w = getNodeWidth(n);
                const h = getNodeHeight(n);
                minXBound = Math.min(minXBound, n.position.x);
                maxXBound = Math.max(maxXBound, n.position.x + w);
                minYBound = Math.min(minYBound, n.position.y);
                maxYBound = Math.max(maxYBound, n.position.y + h);
            });
            edges.forEach((e) => {
                const d = e.data || {};
                if (typeof d.bendX === 'number') {
                    minXBound = Math.min(minXBound, d.bendX - 20);
                    maxXBound = Math.max(maxXBound, d.bendX + 20);
                }
                if (typeof d.bendY1 === 'number') {
                    minYBound = Math.min(minYBound, d.bendY1 - 20);
                    maxYBound = Math.max(maxYBound, d.bendY1 + 20);
                }
                if (typeof d.bendY2 === 'number') {
                    minYBound = Math.min(minYBound, d.bendY2 - 20);
                    maxYBound = Math.max(maxYBound, d.bendY2 + 20);
                }
                if (typeof d.fixedMidY === 'number') {
                    minYBound = Math.min(minYBound, d.fixedMidY - 20);
                    maxYBound = Math.max(maxYBound, d.fixedMidY + 20);
                }
            });
            const boundsWidth = Math.max(0, (isFinite(minXBound) && isFinite(maxXBound)) ? (maxXBound - minXBound + 40) : 0);
            const boundsHeight = Math.max(0, (isFinite(minYBound) && isFinite(maxYBound)) ? (maxYBound - minYBound + 40) : 0);

            return { comp, nodes, edges, layerCount: sortedLayers.length, boundsWidth, boundsHeight };
        }).sort((a,b) => (b.comp?.length || 0) - (a.comp?.length || 0));
    }, [graph]);

    // Refs for container and each flow card to support scrollIntoView shortcuts
    const containerRef = useRef(null);
    const flowRefs = useRef([]);
    const rfInstancesRef = useRef([]);

    // Compute heading star name for a diagram (first node with no incoming in component; fallback to first)
    const getHeadingStar = (flow) => {
        if (!flow || !flow.comp || flow.comp.length === 0) return "";
        const indices = flow.comp;
        const targets = new Set();
        indices.forEach((idx) => {
            const t = graph[idx] ? graph[idx].tail : undefined;
            if (typeof t === 'number' && indices.includes(t)) targets.add(t);
        });
        const heads = indices.filter((idx) => !targets.has(idx));
        const headIdx = (heads.length > 0 ? heads[0] : indices[0]);
        return graph[headIdx] && graph[headIdx].star ? graph[headIdx].star : "";
    };

    return (
        <>
            <Head>
                <title>吉化串連 (Beta)</title>
                <meta
                    name="description"
                    content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
                    opengraph={{
                        title: "星軌堂 - 您的智能人生定位系統",
                        description: "發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。",
                        images: [
                          { url: "/og.png" },
                        ],
                      }}
                />
            </Head>
            {/* <div className={`header show`}>
                <div className="left info-header">
                    <Link href="/">
                        <div className="logo">
                            <img src={"logo.png"} alt="logo" />
                            <div className="name">星軌堂</div>
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

            <div ref={containerRef} className="container-flow" style={{ display: 'flex', gap: 16, overflowX: 'auto', alignItems: 'flex-start', height: '100vh', padding: `8px 8px 64px`, boxSizing: 'border-box' }}>
                {mounted && flows.map((flow, idx) => {
                    const isSingle = (flows.length === 1);
                    const viewportH = (typeof window !== 'undefined') ? window.innerHeight : 800;
                    const computedHeight = Math.floor(viewportH * 0.85); // 85% of window height
                    const viewportW = (typeof window !== 'undefined') ? window.innerWidth : 1200;
                    // Height:Width = 16:9 => width = height * 9 / 16, capped by 90% of window width
                    const maxWidth = Math.floor(viewportW * 0.9);
                    const ratioWidth = Math.floor(computedHeight * 9 / 16);
                    const computedWidth = Math.min(maxWidth, ratioWidth);
                    const chartWidth = `${computedWidth}px`;
                    const cardFlex = isSingle ? '1 1 auto' : '0 0 auto';
                    const cardWidth = isSingle ? '100%' : undefined;
                    return (
                    <div ref={(el) => { flowRefs.current[idx] = el; }} key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, margin: 0, flex: cardFlex, width: cardWidth, height: `${computedHeight}px` }}>
                        {/* <div style={{ fontSize: 14, marginBottom: 8 }}>圖 {idx + 1} ・ 節點 {flow.comp.length}</div> */}
                        <div style={{ width: chartWidth, minWidth: chartWidth, height: computedHeight * 0.95 }}>
                            <ReactFlow key={`rf-${idx}-${flow.nodes.length}-${flow.edges.length}`} nodes={flow.nodes} edges={flow.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} defaultEdgeOptions={{ type: 'straight' }} fitView fitViewOptions={{ padding: 0.1, includeHiddenNodes: true }} minZoom={0.2} maxZoom={1.5} proOptions={{ hideAttribution: true }} onInit={(instance) => { rfInstancesRef.current[idx] = instance; try { instance.fitView({ padding: 0.1, includeHiddenNodes: true }); } catch (e) {} }}>
                                <Controls showInteractive={false} position="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: 4 }} />
                            </ReactFlow>
                        </div>
                    </div>
                    );
                })}
            </div>
            {/* Bottom shortcut bar */}
            {mounted && flows && flows.length > 0 && (
                <div style={{ position: 'fixed', left: 0, right: 0, bottom: '12px', background: '#ffffff', borderTop: '1px solid #eee', padding: '8px 12px', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', zIndex: 10 }}>
                    {flows.map((flow, idx) => {
                        const label = getHeadingStar(flow) || `圖 ${idx + 1}`;
                        const gap = 8;
                        const buttonWidth = `calc((100% - ${gap * 4}px) / 5)`; // 5 buttons per row
                        const onClick = () => {
                            const container = containerRef.current;
                            const card = flowRefs.current[idx];
                            if (container && card) {
                                const left = card.offsetLeft - 12; // small left padding
                                container.scrollTo({ left, behavior: 'smooth' });
                            } else if (card && card.scrollIntoView) {
                                card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                            }
                        };
                        return (
                            <button key={`btn-${idx}`} onClick={onClick} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 6, background: '#fafafa', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center', flex: `0 0 ${buttonWidth}`, maxWidth: buttonWidth }}>
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}
        </>
    );
}