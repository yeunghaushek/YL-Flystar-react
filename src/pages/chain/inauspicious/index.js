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
    const [routes, setRoutes] = useState([]);
    const [selectedRoutes, setSelectedRoutes] = useState(new Set());

    useEffect(() => {
        console.log(selectedRoutes);
    }, [selectedRoutes]);

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
                    {handles.B && <Handle type="target" position={Position.Bottom} id="B" />}
                    {handles.RT && <Handle type="target" position={Position.Right} id="RT" />}
                </div>
            </div>
        );
    };

    // Palace (ellipse) node: shows palace name only; supports left target and right/bottom source
    const EclipseNode = ({ data }) => {
        const { handles = {} } = data;
        const highlightSet = new Set(['命宮', '福德宮', '遷移宮']);
        const shouldHighlightInRed = data && data.isHeadSelected === true && typeof data.label === 'string' && highlightSet.has(data.label);
        const shouldHighlightInBlue = data && data.isHeadSelected === true && typeof data.label === 'string' && (data.label == "生年忌" || !highlightSet.has(data.label));
        const borderStyle = shouldHighlightInRed ? '2px solid #fca5a5' : shouldHighlightInBlue ? '2px solid #93c5fd' : '1px solid #ddd';
        const backgroundStyle = shouldHighlightInRed ? '#fff4f4' : shouldHighlightInBlue ? '#eff6ff' : '#fff';
        return (
            <div style={{ width: ELLIPSE_WIDTH, height: ELLIPSE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: borderStyle, borderRadius: 9999, background: backgroundStyle, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", textAlign: 'center' }}>
                <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
                {handles.L && <Handle type="target" position={Position.Left} id="L" />}
                {handles.B && <Handle type="source" position={Position.Bottom} id="B" />}
                {handles.R && <Handle type="source" position={Position.Right} id="R" />}
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
        const { handles = { L: true } } = data;
        return (
            <div style={{ width: SIDE_NODE_WIDTH, height: SIDE_NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: data.label.startsWith("自化") ? "1px dashed #93c5fd" : "2px solid #93c5fd", borderRadius: 6, background: data.label.startsWith("自化") ? "#eff6ff" : "#eff6ff", textAlign: 'center' }}>
                <div style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px', lineHeight: '1.5' }}>{data.label}</div>
                {handles.L && <Handle type="target" position={Position.Left} id="L" />}
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

        // Single-bend (L-shape) mode
        if (data && (data.lshape === true || data.lshape === 'VH' || data.lshape === 'HV')) {
            const isHV = data.lshape === 'HV';
            const path = isHV
                // Horizontal then vertical
                ? `M ${sourceX} ${sourceY} L ${targetX} ${sourceY} L ${targetX} ${targetY}`
                // Vertical then horizontal (default)
                : `M ${sourceX} ${sourceY} L ${sourceX} ${targetY} L ${targetX} ${targetY}`;
            return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
        }

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
              if (p.majorStars.find((s) => s.mutagen === "忌") || p.minorStars.find((s) => s.mutagen === "忌")) {
                  let star = p.majorStars.find((s) => s.mutagen === "忌") || p.minorStars.find((s) => s.mutagen === "忌");
                  return [{name: p.name, star: star.name, mutagen: star.mutagen}];
              }
              return [];
            });
            console.log(mutagenStars);

        const palaces = astrolabe.palaces.map((p) => ({
            name: p.name,
            mutagenStars: p.mutagenStars,
            majorStarNames: (p.majorStars || []).map((s) => s.name),
            minorStarNames: (p.minorStars || []).map((s) => s.name),
        }));

        // star name -> palace name (owner)
        const starToPalaceName = new Map();
        for (const p of palaces) {
            for (const s of p.majorStarNames) starToPalaceName.set(s, p.name);
            for (const s of p.minorStarNames) if (!starToPalaceName.has(s)) starToPalaceName.set(s, p.name);
        }

        const myStarPalaceMap = palaces.map((p) => {
            const star = p.mutagenStars && p.mutagenStars.length >= 4 ? p.mutagenStars[3] : undefined;
            const owner = star ? starToPalaceName.get(star) : undefined;
            return {
                name: p.name,
                outerBlue: owner ? { star, name: owner } : "",
            };
        });

        console.log(palaces);
        console.log(myStarPalaceMap);

        // Build 12 routes following outerBlue links; stop on self-loop/seen loop; cap length at 13
        const nameToEntry = new Map(myStarPalaceMap.map((e) => [e.name, e]));
        const routes = myStarPalaceMap.map((startEntry) => {
            const route = [];
            const seenNames = new Set();
            let current = startEntry;
            let steps = 0;
            let prevStar = ""; // head star should be empty string

            // 生年忌
            const blueMutagenStar = mutagenStars.find((s) => s.name === current.name && s.mutagen === "忌");
            if (blueMutagenStar) {
                route.push({ name: "生年忌", star: "", outerBlue: { name: blueMutagenStar.name, star: blueMutagenStar.star } });
                prevStar = blueMutagenStar.star || "";
            }



            while (current && current.outerBlue && current.outerBlue.name) {
                route.push({ ...current, star: prevStar });
                steps += 1;
                if (steps >= 2) break;
                const nextName = current.outerBlue.name;
                if (nextName === current.name) break; // keep first when self-loop, then stop
                if (seenNames.has(nextName)) break; // avoid longer cycles
                seenNames.add(current.name);
                prevStar = current.outerBlue.star || "";
                const next = nameToEntry.get(nextName);
                if (!next) break;
                current = next;
            }

            // 自化忌
            const targetPalace = palaces.find((p) => p.name === current.outerBlue.name);
            if (targetPalace && targetPalace.mutagenStars && targetPalace.mutagenStars.length >= 4 && targetPalace.mutagenStars[3] && targetPalace.mutagenStars[3] === current.outerBlue.star) {
                route.push({ name: current.outerBlue.name, star: current.outerBlue.star, outerBlue: { name: "自化忌", star: "" } });
            }

            return route;
        });

        console.log(routes);
        setRoutes(routes);
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
                        nodes.push({ id: blueId, type: 'blue', data: { label: ob.name, handles: { L: true } }, position: { x: blueX, y: by } });
                        // connect from ellipse bottom to BlueNode left handle
                        edges.push({ id: `ob-${idx}`, source: `p-${idx}`, target: blueId, sourceHandle: 'B', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
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

    // Build ReactFlow graphs with route merging by shared (star, palace)
    const routeFlows = useMemo(() => {
        if (!routes || routes.length === 0) return [];

        const selectedIdx = Array.from(selectedRoutes);
        if (selectedIdx.length === 0) {
            // Keep button panel visible by returning placeholder flows for all routes
            return Array(routes.length).fill(null).map(() => ({ nodes: [], edges: [], height: 0, width: 0 }));
        }

        const getPairKey = (star, palace) => `pair:${star || ''}|${palace || ''}`;

        // Build set of (star,palace) pairs and palace-name sets per selected route
        const routePairs = new Map();
        const routePalaces = new Map(); // idx -> Set(palaceName)
        selectedIdx.forEach((idx) => {
            const rt = routes[idx] || [];
            const s = new Set();
            const pn = new Set();
            for (let i = 0; i < rt.length; i++) {
                const ob = rt[i] && rt[i].outerBlue ? rt[i].outerBlue : undefined;
                if (ob && ob.name) pn.add(ob.name);
                if (ob && ob.star && ob.name) s.add(getPairKey(ob.star, ob.name));
            }
            routePairs.set(idx, s);
            routePalaces.set(idx, pn);
        });

        // Build neighbor graph by shared pair, plus: if a route's head palace has no star,
        // relate it to any route that contains that palace with a star in any item (no 自化忌 requirement)
        const neighbors = new Map();
        selectedIdx.forEach((i) => neighbors.set(i, new Set()));
        const getEffectiveHeadPalace = (rt) => {
            if (!rt || !rt[0]) return '';
            return (rt[0].name === '生年忌' && rt[0].outerBlue && rt[0].outerBlue.name) ? rt[0].outerBlue.name : rt[0].name;
        };
        const headInfo = new Map(); // idx -> { name, hasStar }
        selectedIdx.forEach((idx) => {
            const rt = routes[idx] || [];
            const name = getEffectiveHeadPalace(rt);
            const hasStar = !!(rt[0] && rt[0].star);
            headInfo.set(idx, { name, hasStar });
        });
        for (let a = 0; a < selectedIdx.length; a++) {
            for (let b = a + 1; b < selectedIdx.length; b++) {
                const i = selectedIdx[a];
                const j = selectedIdx[b];
                const si = routePairs.get(i) || new Set();
                const sj = routePairs.get(j) || new Set();
                let related = false;
                for (const k of si) { if (sj.has(k)) { related = true; break; } }
                if (!related) {
                    const pi = routePalaces.get(i) || new Set();
                    const pj = routePalaces.get(j) || new Set();
                    const hi = headInfo.get(i) || { name: '', hasStar: false };
                    const hj = headInfo.get(j) || { name: '', hasStar: false };
                    // Merge-by-head when the head has no star and the other route contains that palace with a star somewhere.
                    if (!hi.hasStar && hi.name && pj.has(hi.name)) related = true;
                    if (!related && !hj.hasStar && hj.name && pi.has(hj.name)) related = true;
                }
                if (related) { neighbors.get(i)?.add(j); neighbors.get(j)?.add(i); }
            }
        }

        // Connected components among selected routes
        const groups = [];
        const visited = new Set();
        for (const i of selectedIdx) {
            if (visited.has(i)) continue;
            const q = [i];
            visited.add(i);
            const comp = [i];
            while (q.length) {
                const cur = q.shift();
                for (const nb of (neighbors.get(cur) || [])) {
                    if (!visited.has(nb)) { visited.add(nb); q.push(nb); comp.push(nb); }
                }
            }
            groups.push(comp);
        }

        const getDisplayHead = (rt) => (rt && rt[0]) ? rt[0].name : '';
        const selectedHeadNames = new Set();
        groups.forEach((comp) => {
            comp.forEach((idx) => {
                const name = getDisplayHead(routes[idx]);
                if (name) selectedHeadNames.add(name);
            });
        });

        const flows = Array(routes.length).fill(null).map(() => ({ nodes: [], edges: [], height: 0, width: 0 }));
        const byLengthDesc = (a, b) => (routes[b]?.length || 0) - (routes[a]?.length || 0);

        const gapA = 40;
        const gapB = 4;
        const laneHeight = Math.max(ELLIPSE_HEIGHT, MAIN_NODE_HEIGHT) + 40;

        groups.forEach((comp) => {
            const ordered = [...comp].sort(byLengthDesc);
            const leader = ordered[0];
            const nodes = [];
            const edges = [];
            let maxRight = 0;
            const pairToStar = new Map(); // pairKey -> {id,x,y}
            const appendedInlinePalaces = new Set(); // palace names already inlined in this comp

            // Precompute inlining: routes whose head star is empty and last is 自化忌, and
            // some route in this comp contains that head palace with a star. These will not render
            // their own lane; they'll be treated as part of the main line.
            const compHasPalaceWithStar = new Set();
            comp.forEach((idx) => {
                const rt = routes[idx] || [];
                for (let i = 0; i < rt.length; i++) {
                    const ob = rt[i] && rt[i].outerBlue ? rt[i].outerBlue : undefined;
                    if (ob && ob.name && ob.star) compHasPalaceWithStar.add(ob.name);
                }
            });
            const shouldInline = new Set();
            comp.forEach((idx) => {
                const rt = routes[idx] || [];
                if (!rt || !rt[0]) return;
                const headEmptyStar = !rt[0].star;
                const headPalace = getDisplayHead(rt);
                // Only inline if some OTHER route in this comp contains the same palace with a star
                const otherHasPalaceWithStar = comp.some((o) => {
                    if (o === idx) return false;
                    const ort = routes[o] || [];
                    for (let k = 0; k < ort.length; k++) {
                        const oob = ort[k] && ort[k].outerBlue ? ort[k].outerBlue : undefined;
                        if (oob && oob.name === headPalace && !!oob.star) return true;
                    }
                    return false;
                });
                if (headEmptyStar && otherHasPalaceWithStar) {
                    shouldInline.add(idx);
                }
            });

            // Map for inline extension: palaceName -> { firstStar, routeIdx }
            const inlineByPalace = new Map();
            comp.forEach((idx) => {
                if (!shouldInline.has(idx)) return;
                const rt = routes[idx] || [];
                if (!rt || rt.length === 0) return;
                const headPalace = getDisplayHead(rt);
                const firstStar = (rt[0] && rt[0].outerBlue && rt[0].outerBlue.star) ? rt[0].outerBlue.star : (rt[1] && rt[1].star ? rt[1].star : '');
                if (headPalace && firstStar) inlineByPalace.set(headPalace, { firstStar, routeIdx: idx });
            });

            ordered.forEach((routeIndex, lane) => {
                // If it's marked inline but there is NO other route providing the same palace with star
                // (i.e., user只選這一條), fallback to render it as a standalone lane
                const rt = routes[routeIndex] || [];
                const headPalaceForThis = getDisplayHead(rt);
                const hasProvider = comp.some((o) => {
                    if (o === routeIndex) return false;
                    const ort = routes[o] || [];
                    for (let k = 0; k < ort.length; k++) {
                        const oob = ort[k] && ort[k].outerBlue ? ort[k].outerBlue : undefined;
                        if (oob && oob.name === headPalaceForThis && !!oob.star) return true;
                    }
                    return false;
                });
                if (shouldInline.has(routeIndex) && hasProvider) return; // skip; will be inline into provider
                // else render normally as its own lane (provider not selected)
                const baseY = lane * laneHeight;
                const startPalId = `g${leader}-r${routeIndex}-p0`;
                const startPalX = 0;
                const startPalY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                const first = (rt && rt[0]) ? rt[0] : undefined;
                const displayHeadLabel = getDisplayHead(rt);
                const isHeadSelectedForDisplay = (displayHeadLabel === '生年忌') ? true : selectedHeadNames.has(displayHeadLabel);
                nodes.push({ id: startPalId, type: 'eclipse', data: { label: `${displayHeadLabel}`, handles: { R: true }, isHeadSelected: isHeadSelectedForDisplay }, position: { x: startPalX, y: startPalY } });

                let curPalId = startPalId;
                let curPalX = startPalX;
                let currentPalaceName = displayHeadLabel; // track current palace name for duplicate detection
                let lastStar = null; // track last created star node in this lane

                for (let idx = 0; idx < rt.length; idx++) {
                    const item = rt[idx];
                    const ob = item && item.outerBlue ? item.outerBlue : undefined;
                    const starX = curPalX + ELLIPSE_WIDTH + gapA;
                    const starY = baseY;
                    const blueY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);

                    if (ob && ob.name === '自化忌') {
                        // Skip duplicate palace and place BlueNode to the right of the last star if exists
                        if (lastStar && (lastStar.label ? lastStar.label === (item?.star || ob?.star || '') : true)) {
                            // prevent duplicate 自化忌 for the same current palace
                            if (currentPalaceName) {
                                const keyZJ = `zj:${currentPalaceName}`;
                                if (pairToStar.has(keyZJ)) { break; }
                            }
                            const blueId = `g${leader}-r${routeIndex}-b${idx}`;
                            const blueX = lastStar.x + NODE_WIDTH + 40; // widen spacing when skipping duplicate palace
                            const blueY2 = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);
                            nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: blueX, y: blueY2 } });
                            // connect from star right to blue left
                            edges.push({ id: `g${leader}-r${routeIndex}-e${idx}-blue`, source: lastStar.id, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                            maxRight = Math.max(maxRight, blueX + SIDE_NODE_WIDTH);
                            if (currentPalaceName) {
                                pairToStar.set(`zj:${currentPalaceName}`, { id: blueId, x: blueX, y: blueY2 });
                            }
                            break;
                        } else {
                            // Fallback: no star yet, render Blue to the right of current palace
                            if (currentPalaceName) {
                                const keyZJ = `zj:${currentPalaceName}`;
                                if (pairToStar.has(keyZJ)) { break; }
                            }
                            const blueId = `g${leader}-r${routeIndex}-b${idx}`;
                            nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: starX, y: blueY } });
                            edges.push({ id: `g${leader}-r${routeIndex}-e${idx}-blue`, source: curPalId, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                            maxRight = Math.max(maxRight, starX + SIDE_NODE_WIDTH);
                            if (currentPalaceName) {
                                pairToStar.set(`zj:${currentPalaceName}`, { id: blueId, x: starX, y: blueY });
                            }
                            break;
                        }
                    }

                    const pairKey = ob ? getPairKey(ob.star, ob.name) : '';
                    const existing = pairToStar.get(pairKey);
                    if (existing) {
                        edges.push({ id: `g${leader}-r${routeIndex}-merge-${idx}`,
                            source: curPalId,
                            target: existing.id,
                            sourceHandle: 'R',
                            targetHandle: 'B',
                            type: 'rightangle', data: { lshape: 'HV' },
                            style: { stroke: '#3b82f6' },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        maxRight = Math.max(maxRight, existing.x + NODE_WIDTH + gapB + ELLIPSE_WIDTH);
                        break;
                    }

                    const starId = `g${leader}-r${routeIndex}-s${idx}`;
                    let starLabel = `${ob?.star || ''}`;
                    // If at the moment of reaching a palace which is the head of an inlined route,
                    // ensure the star label aligns with that route's first star for continuity
                    const inlineInfo = inlineByPalace.get(ob?.name || '');
                    if (inlineInfo && (!starLabel || starLabel === '')) starLabel = inlineInfo.firstStar;
                    nodes.push({ id: starId, type: 'star', data: { label: starLabel, handles: { L: true, R: true, B: true }, offsetLeft: 0, offsetRight: 0 }, position: { x: starX, y: starY } });
                    lastStar = { id: starId, x: starX, y: starY, label: (ob?.star || '') };
                    pairToStar.set(pairKey, { id: starId, x: starX, y: starY });

                    // Detect duplicate palace: if destination palace equals the current palace shown on canvas
                    const isDuplicateCurrentPalace = !!(ob && ob.name && ob.name === currentPalaceName);
                    if (!isDuplicateCurrentPalace) {
                        const destPalId = `g${leader}-r${routeIndex}-p${idx + 1}`;
                        const destPalX = starX + NODE_WIDTH + gapB;
                        const destPalY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                        nodes.push({ id: destPalId, type: 'eclipse', data: { label: `${ob?.name || ''}`, handles: { R: true }, isHeadSelected: selectedHeadNames.has(ob?.name || '') }, position: { x: destPalX, y: destPalY } });

                        edges.push({ id: `g${leader}-r${routeIndex}-e${idx}-a`, source: curPalId, target: starId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });

                        // Advance to destination palace as current
                        curPalId = destPalId;
                        curPalX = destPalX;
                        currentPalaceName = ob?.name || currentPalaceName;
                        maxRight = Math.max(maxRight, destPalX + ELLIPSE_WIDTH);

                        // Inline extension: if this destination palace is the head of an inlined route
                        // that ends with 自化忌, append its first star and 自化忌 to the same lane once.
                        const inlineInfoAtDest = inlineByPalace.get(ob?.name || '');
                        if (inlineInfoAtDest && !appendedInlinePalaces.has(ob?.name || '')) {
                            appendedInlinePalaces.add(ob?.name || '');
                            // Append star to the right of this destination palace (if not already created)
                            const inlineStarKey = getPairKey(inlineInfoAtDest.firstStar, ob?.name || '');
                            const inlineStarX = destPalX + ELLIPSE_WIDTH + gapA;
                            const inlineStarY = starY;
                            let inlineStarRef = pairToStar.get(inlineStarKey);
                            if (!inlineStarRef) {
                                const inlineStarId = `g${leader}-inline-s-${routeIndex}-${idx}`;
                                nodes.push({ id: inlineStarId, type: 'star', data: { label: `${inlineInfoAtDest.firstStar}`, handles: { L: true, R: true, B: true }, offsetLeft: 0, offsetRight: 0 }, position: { x: inlineStarX, y: inlineStarY } });
                                edges.push({ id: `g${leader}-inline-e-${routeIndex}-${idx}` , source: destPalId, target: inlineStarId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                                inlineStarRef = { id: inlineStarId, x: inlineStarX, y: inlineStarY };
                                pairToStar.set(inlineStarKey, inlineStarRef);
                                maxRight = Math.max(maxRight, inlineStarX + NODE_WIDTH);
                            }
                            // If the inlined route ends with 自化忌, append BlueNode; otherwise stop here
                            const inlinedRt = routes[inlineInfoAtDest.routeIdx] || [];
                            const inlinedLast = inlinedRt[inlinedRt.length - 1];
                            const hasZJ = !!(inlinedLast && inlinedLast.outerBlue && inlinedLast.outerBlue.name === '自化忌');
                            if (hasZJ) {
                                const inlineBlueId = `g${leader}-inline-b-${routeIndex}-${idx}`;
                                const inlineBlueX = inlineStarRef.x + NODE_WIDTH + 40;
                                const inlineBlueY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);
                                nodes.push({ id: inlineBlueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: inlineBlueX, y: inlineBlueY } });
                                edges.push({ id: `g${leader}-inline-eb-${routeIndex}-${idx}`, source: inlineStarRef.id, target: inlineBlueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                                maxRight = Math.max(maxRight, inlineBlueX + SIDE_NODE_WIDTH);
                            }
                        }
                    } else {
                        // Edge to star still needed when skipping duplicate palace
                        edges.push({ id: `g${leader}-r${routeIndex}-e${idx}-a`, source: curPalId, target: starId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        // Stay at current palace and expand width to star
                        maxRight = Math.max(maxRight, starX + NODE_WIDTH);
                    }
                }
            });

            const width = maxRight + 40;
            const height = Math.max(laneHeight * ordered.length, Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 40);
            flows[leader] = { nodes, edges, height, width };
        });

        return flows;
    }, [routes, selectedRoutes]);

    return (
        <>
            <Head>
                <title>藍線路徑</title>
                <meta name="description" content="外藍線 12 條路徑，每條最多 13 項" />
            </Head>
            <div ref={containerRef} className="container-flow" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', alignItems: 'stretch', height: '100vh', padding: `8px 8px 64px`, boxSizing: 'border-box' }}>
                {mounted && routeFlows && routeFlows.length > 0 ? (
                    Array.from(selectedRoutes).sort((a,b) => a-b).map((idx) => {
                        const flow = routeFlows[idx];
                        if (!flow || !flow.nodes || flow.nodes.length === 0) return null; // hide empty flows
                        const isSingle = (routeFlows.length === 1);
                        const viewportW = (typeof window !== 'undefined') ? window.innerWidth : 1200;
                        const computedWidth = Math.max(Math.floor(viewportW * 0.9), flow.width);
                        const chartWidth = `${computedWidth}px`;
                        const computedHeight = Math.max(200, flow.height);
                        const cardFlex = '1 1 auto';
                        const cardWidth = '100%';
                        return (
                            <div ref={(el) => { flowRefs.current[idx] = el; }} key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, margin: 0, flex: cardFlex, width: cardWidth, height: `${computedHeight}px` }}>
                                <div style={{ width: chartWidth, minWidth: chartWidth, height: computedHeight * 0.95 }}>
                                    <ReactFlow key={`rf-route-${idx}-${flow.nodes.length}-${flow.edges.length}`} nodes={flow.nodes} edges={flow.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} defaultEdgeOptions={{ type: 'straight' }} fitView fitViewOptions={{ padding: 0.1, includeHiddenNodes: true }} minZoom={0.2} maxZoom={1.5} proOptions={{ hideAttribution: true }} onInit={(instance) => { rfInstancesRef.current[idx] = instance; try { instance.fitView({ padding: 0.1, includeHiddenNodes: true }); } catch (e) {} }}>
                                        <Controls showInteractive={false} position="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: 4 }} />
                                    </ReactFlow>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div>尚無資料，請先產生盤局。</div>
                )}
            </div>
            {/* Bottom shortcut bar */}
            {mounted && routeFlows && routeFlows.length > 0 && (
                <div style={{ position: 'fixed', left: 0, right: 0, bottom: '12px', background: '#ffffff', borderTop: '1px solid #eee', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                    {(() => {
                        const getHeadPalace = (i) => (routes && routes[i] && routes[i][0] && routes[i][0].name) ? routes[i][0].name === "生年忌" ? routes[i][0].outerBlue.name : routes[i][0].name : `Route ${i + 1}`;
                        const priorityOrder = ['命宮', '福德宮', '遷移宮'];
                        const weight = new Map(priorityOrder.map((n, i) => [n, i]));
                        const primary = [];
                        const secondary = [];
                        routeFlows.forEach((_, idx) => {
                            const name = getHeadPalace(idx);
                            if (weight.has(name)) primary.push(idx); else secondary.push(idx);
                        });
                        primary.sort((a, b) => (weight.get(getHeadPalace(a)) ?? 99) - (weight.get(getHeadPalace(b)) ?? 99));

                        const gap = 8;
                        const colsPrimary = Math.max(1, Math.min(5, primary.length || 1));
                        const colsSecondary = 5;
                        const buttonWidthPrimary = `calc((100% - ${gap * (colsPrimary - 1)}px) / ${colsPrimary})`;
                        const buttonWidthSecondary = `calc((100% - ${gap * (colsSecondary - 1)}px) / ${colsSecondary})`;
                        const renderBtn = (idx, width, isPrimary) => {
                            const label = getHeadPalace(idx);
                            const pressed = selectedRoutes.has(idx);
                            const onClick = () => {
                                setSelectedRoutes((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(idx)) next.delete(idx); else next.add(idx);
                                    return next;
                                });
                                // Scroll after render when becoming visible
                                if (!pressed) {
                                    setTimeout(() => {
                                        const container = containerRef.current;
                                        const card = flowRefs.current[idx];
                                        if (container && card) {
                                            const top = Math.max(0, card.offsetTop - 12);
                                            container.scrollTo({ top, behavior: 'smooth' });
                                        } else if (card && card.scrollIntoView) {
                                            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                                        }
                                    }, 0);
                                }
                            };
                            const bg = pressed ? (isPrimary ? '#fee2e2' : '#e0f2fe') : '#fafafa';
                            const borderColor = pressed ? (isPrimary ? '#ef4444' : '#60a5fa') : '#ddd';
                            const color = pressed ? (isPrimary ? '#b91c1c' : '#1d4ed8') : '#111827';
                            return (
                                <button key={`btn-${idx}`} onClick={onClick} style={{ padding: '6px 10px', border: `1px solid ${borderColor}`, borderRadius: 6, background: bg, color, cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center', flex: `0 0 ${width}`, maxWidth: width }}>
                                    {label}
                                </button>
                            );
                        };

                        return (
                            <>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                                    {primary.map((i) => renderBtn(i, buttonWidthPrimary, true))}
                                </div>
                                <div style={{ width: '100%', height: 1, background: '#e5e7eb', margin: '6px 0' }} />
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                                    {secondary.map((i) => renderBtn(i, buttonWidthSecondary, false))}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </>
    );
}