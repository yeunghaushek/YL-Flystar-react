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
    const [simpleRoutes, setSimpleRoutes] = useState([]);
    const [selectedRoutes, setSelectedRoutes] = useState(new Set());

    useEffect(() => {
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
                    {handles.BT && <Handle type="target" position={Position.Bottom} id="BT" />}
                    {handles.RT && <Handle type="target" position={Position.Right} id="RT" />}
                </div>
            </div>
        );
    };

    // Palace (ellipse) node: shows palace name only; supports left target and right/bottom source/target
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
                {handles.BT && <Handle type="target" position={Position.Bottom} id="BT" />}
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

        // Two-segment HV variant: horizontal first, then vertical into target
        if (data && data.twoSegment === 'HV') {
            // Exact align to the target handle X (bottom dot)
            const bx = targetX;
            const path = `M ${sourceX} ${sourceY} L ${bx} ${sourceY} L ${bx} ${targetY}`;
            return <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />;
        }

        // Four-segment HVHV variant: horizontal -> vertical -> horizontal -> vertical
        if (data && data.mode === 'HVHV') {
            const bx = (typeof data.bendX === 'number') ? data.bendX : Math.round((sourceX + targetX) / 2);
            const by = (typeof data.bendY1 === 'number') ? data.bendY1 : Math.round((sourceY + targetY) / 2);
            const path = `M ${sourceX} ${sourceY} L ${bx} ${sourceY} L ${bx} ${by} L ${targetX} ${by} L ${targetX} ${targetY}`;
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

        setAstrolabe(myAstrolabe);


    };


    useEffect(() => {
        if (!astrolabe) return;

        const mutagenStars = astrolabe.palaces.flatMap((p) => 
            {
              /* if (p.majorStars.find((s) => s.mutagen === "祿") || p.majorStars.find((s) => s.mutagen === "權")) {
                  let star = p.majorStars.find((s) => s.mutagen === "祿") || p.majorStars.find((s) => s.mutagen === "權");
                  return [{name: p.name, star: star.name, mutagen: star.mutagen}];
              }
              if (p.minorStars.find((s) => s.mutagen === "祿") || p.minorStars.find((s) => s.mutagen === "權")) {
                  let star = p.minorStars.find((s) => s.mutagen === "祿") || p.minorStars.find((s) => s.mutagen === "權");
                  return [{name: p.name, star: star.name, mutagen: star.mutagen}];
              } */
              if (p.majorStars.find((s) => s.mutagen === "忌") || p.minorStars.find((s) => s.mutagen === "忌")) {
                  let star = p.majorStars.find((s) => s.mutagen === "忌") || p.minorStars.find((s) => s.mutagen === "忌");
                  return [{name: p.name, star: star.name, mutagen: star.mutagen}];
              }
              return [];
            });
            
        //console.log(mutagenStars);

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


        
        let rIndex = routes.findIndex((route) => route.length > 0 && route[0].name === "生年忌");
        //console.log(routes[rIndex])
        
        if (rIndex > -1) {
            if (routes[rIndex][routes[rIndex].length - 1].outerBlue.name === "自化忌") {
                // 生年忌 + 自化忌
                routes.push(routes[rIndex]);
                routes[rIndex] = routes[rIndex].slice(1);
            } else {
                // 生年忌
                routes.push(routes[rIndex].slice(0,2));
                routes[rIndex] = routes[rIndex].slice(1);
            }
        }

        setRoutes(routes);

        // Build simplified string arrays for easy flow drawing
        const simplifiedRoutes = routes.map((rt) => {
            const seq = [];
            const seen = new Set();
            const pushUnique = (s) => { if (s && !seen.has(s)) { seen.add(s); seq.push(s); } };
            (rt || []).forEach((item) => {
                if (!item) return;
                const ob = item.outerBlue || {};
                if (item.name === "生年忌") {
                    // Add 生年忌, followed by its star and target palace
                    pushUnique("生年忌");
                    if (ob && ob.star) pushUnique(ob.star);
                    if (ob && ob.name) pushUnique(ob.name === "自化忌" ? "自化忌" : ob.name);
                    return;
                }
                pushUnique(item.name);
                if (ob && ob.star) pushUnique(ob.star);
                if (ob && ob.name) pushUnique(ob.name === "自化忌" ? "自化忌" : ob.name);
            });
            // Ensure the route does not end with a star; if so, append the final destination palace
            const isStarTokenLocal = (s) => typeof s === "string" && s.length === 2 && !s.endsWith("宮") && s !== "自化忌" && s !== "生年忌";
            if (seq.length > 0 && isStarTokenLocal(seq[seq.length - 1])) {
                const last = (rt && rt.length > 0) ? rt[rt.length - 1] : null;
                const lastDest = last && last.outerBlue && last.outerBlue.name;
                if (lastDest) {
                    // append even if duplicate to keep star not being the last token
                    seq.push(lastDest);
                }
            }
            return seq;
        });

        console.log(simplifiedRoutes);

        setSimpleRoutes(simplifiedRoutes);
    }, [astrolabe]);


    const [updateCounter, setUpdateCounter] = useState(0);
    useEffect(() => {
        generateAstrolabe();
    }, [updateCounter]);


    const { n, g, c, y, m, d, bt, lm } = router.query;
    useEffect(() => {
        
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
    const bottomBarRef = useRef(null);
    const [bottomBarHeight, setBottomBarHeight] = useState(SHORTCUT_BAR_HEIGHT);
    const measureBottomBar = useCallback(() => {
        try {
            if (bottomBarRef.current) {
                const rect = bottomBarRef.current.getBoundingClientRect();
                const h = Math.max(0, Math.ceil(rect.height || 0));
                if (h !== bottomBarHeight) setBottomBarHeight(h);
            }
        } catch (_) {}
    }, [bottomBarHeight]);
    useEffect(() => {
        measureBottomBar();
        const onResize = () => measureBottomBar();
        if (typeof window !== 'undefined') window.addEventListener('resize', onResize);
        const t = setTimeout(measureBottomBar, 0);
        return () => { if (typeof window !== 'undefined') window.removeEventListener('resize', onResize); clearTimeout(t); };
    }, [measureBottomBar, selectedRoutes]);

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

    // Build ReactFlow graphs for each simplified route using existing node/edge styles
    const routeFlows = useMemo(() => {
        if (!simpleRoutes || simpleRoutes.length === 0) return [];
        // Build a set of route head names that are currently selected
        const selectedHeadNames = new Set();
        const getHeadForSelection = (seq) => {
            if (!seq || seq.length === 0) return '';
            const headPal = seq.find((s) => typeof s === 'string' && s.endsWith('宮'));
            return headPal || '';
        };
        simpleRoutes.forEach((seq, idx) => {
            if (!selectedRoutes.has(idx) || !seq || seq.length === 0) return;
            const headName = getHeadForSelection(seq);
            if (headName) selectedHeadNames.add(headName);
        });
        const gapA = 40; // gap: palace -> star (adjustable, increased)
        const gapB = 4; // gap: star -> dest palace (adjustable, shorter)
        const isBirthJi = (s) => s === '生年忌';
        const isSelfJi = (s) => s === '自化忌';
        const isPalaceToken = (s) => typeof s === 'string' && s.endsWith('宮');
        const isStarToken = (s) => typeof s === 'string' && s.length === 2 && !s.endsWith('宮') && !isSelfJi(s) && !isBirthJi(s);
        const makeFlow = (seq, routeIndex, offsetY = 0) => {
            const nodes = [];
            const edges = [];
            if (!seq || seq.length === 0) return { nodes, edges, height: 0, width: 0 };

            const baseY = offsetY; // lane vertical offset
            // Initial current palace (head of route)
            const startPalId = `r${routeIndex}-p0`;
            const startPalX = 0;
            const startPalY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
            const displayHeadLabel = seq[0] || '';
            const isRouteSelected = selectedRoutes.has(routeIndex);
            const isHeadSelectedForDisplay = isBirthJi(displayHeadLabel)
                ? true // always blue ellipse for 生年忌
                : selectedHeadNames.has(displayHeadLabel);
            nodes.push({ id: startPalId, type: 'eclipse', data: { label: `${displayHeadLabel}`, handles: { R: true }, isHeadSelected: isHeadSelectedForDisplay }, position: { x: startPalX, y: startPalY } });

            let curPalId = startPalId;
            let curPalX = startPalX;
            let finalRight = startPalX + ELLIPSE_WIDTH;

            // Iterate tokens after the head, placing nodes based on type
            let j = 1;
            while (j < seq.length) {
                const token = seq[j];
                const blueY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);

                // 自化忌: blue dashed node; ensure left spacing >= gapA
                if (isSelfJi(token)) {
                    const x = curPalX + ELLIPSE_WIDTH + gapA; // ensure gapA spacing
                    const blueId = `r${routeIndex}-b${j}`;
                    nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x, y: blueY } });
                    edges.push({ id: `r${routeIndex}-e${j}-blue`, source: curPalId, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                    finalRight = Math.max(finalRight, x + SIDE_NODE_WIDTH);
                    break;
                }

                // 生年忌 token in sequence: render blue ellipse node as a palace-like marker and continue
                if (isBirthJi(token)) {
                    const x = curPalX + ELLIPSE_WIDTH + gapA;
                    const palId = `r${routeIndex}-pb-${j}`;
                    nodes.push({ id: palId, type: 'eclipse', data: { label: '生年忌', handles: { R: true }, isHeadSelected: true }, position: { x, y: startPalY } });
                    curPalId = palId;
                    curPalX = x;
                    finalRight = Math.max(finalRight, x + ELLIPSE_WIDTH);
                    j += 1;
                    continue;
                }

                // Palace token: place palace ellipse to the right and advance
                if (isPalaceToken(token)) {
                    const palId = `r${routeIndex}-p${j}`;
                    const palX = curPalX + ELLIPSE_WIDTH + gapA;
                    const palY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                    nodes.push({ id: palId, type: 'eclipse', data: { label: `${token}`, handles: { R: true }, isHeadSelected: selectedHeadNames.has(token) }, position: { x: palX, y: palY } });
                    curPalId = palId;
                    curPalX = palX;
                    finalRight = Math.max(finalRight, palX + ELLIPSE_WIDTH);
                    j += 1;
                    continue;
                }

                // Star token: draw star, then optional following palace or 自化忌
                if (isStarToken(token)) {
                    const starX = curPalX + ELLIPSE_WIDTH + gapA;
                    const starId = `r${routeIndex}-s${j}`;
                const starY = baseY;
                    const nextToken = seq[j + 1];
                    const starHandles = isSelfJi(nextToken) ? { L: true, R: true } : { L: true };
                    nodes.push({ id: starId, type: 'star', data: { label: `${token}`, handles: starHandles, offsetLeft: 0, offsetRight: 0 }, position: { x: starX, y: starY } });
                    edges.push({ id: `r${routeIndex}-e${j}-a`, source: curPalId, target: starId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });

                    // If followed by 自化忌: place blue dashed node to the right of star using gapA and connect from star
                    if (isSelfJi(nextToken)) {
                        const blueX = starX + NODE_WIDTH + gapA; // ensure gapA spacing after star
                        const blueY2 = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);
                        const blueId = `r${routeIndex}-b${j + 1}`;
                        nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: blueX, y: blueY2 } });
                        edges.push({ id: `r${routeIndex}-e${j}-blue-from-star`, source: starId, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        finalRight = Math.max(finalRight, blueX + SIDE_NODE_WIDTH);
                        // route ends after 自化忌
                        break;
                    }

                    const dest = nextToken;
                    if (isPalaceToken(dest)) {
                        const destPalId = `r${routeIndex}-p${(j + 1) / 2}`;
                const destPalX = starX + NODE_WIDTH + gapB;
                const destPalY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                        nodes.push({ id: destPalId, type: 'eclipse', data: { label: `${dest}`, handles: { R: true }, isHeadSelected: selectedHeadNames.has(dest) }, position: { x: destPalX, y: destPalY } });
                curPalId = destPalId;
                curPalX = destPalX;
                finalRight = Math.max(finalRight, destPalX + ELLIPSE_WIDTH);
                        j += 2;
                        continue;
                    }
                    j += 1;
                    continue;
                }

                // Fallback: unrecognized token, skip
                j += 1;
            }

            const width = finalRight + 40;
            const height = Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 40;
            return { nodes, edges, height, width };
        };
        // Merge logic across selected routes: if no conflicts and at least one shared token, merge
        const selectedIdxs = Array.from(selectedRoutes).sort((a, b) => a - b);
        if (selectedIdxs.length === 0) {
            // No selection: build flows for all routes so the bottom panel stays visible
            return simpleRoutes.map((seq, i) => makeFlow(seq, i));
        }

        // Multi-group merge: only consider user-selected routes (no auto-expansion)
        const overlapLenGroup = (A, B) => {
            const maxL = Math.min(A.length, B.length);
            for (let L = maxL; L >= 1; L--) {
                let ok = true;
                for (let i = 0; i < L; i++) { if (A[A.length - L + i] !== B[i]) { ok = false; break; } }
                if (ok) return L;
            }
            return 0;
        };
        const seqsAll = simpleRoutes.map((seq, i) => ({ idx: i, seq: [...(seq || [])] }));
        const contextKeyAt = (seq, idx) => {
            const tok = seq[idx];
            if (typeof tok !== 'string') return tok;
            if (isPalaceToken(tok) && idx > 0 && isStarToken(seq[idx - 1])) return `${seq[idx - 1]}->${tok}`;
            return tok;
        };
        const buildContextKeys = (seq) => seq.map((_, i) => contextKeyAt(seq, i));
        const hasSharedTokenCtx = (A, B) => {
            const setA = new Set(buildContextKeys(A));
            const keysB = buildContextKeys(B);
            for (const k of keysB) { if (setA.has(k)) return true; }
            return false;
        };
        const seqs = selectedIdxs.map((i) => ({ idx: i, seq: [...(simpleRoutes[i] || [])] }));
        const nSel = seqs.length;
        // Build connectivity within expanded subset (stable with indices 0..nSel-1 mapped to seqs)
        const adj = Array.from({ length: nSel }, () => Array(nSel).fill(false));
        for (let i = 0; i < nSel; i++) {
            for (let j = i + 1; j < nSel; j++) {
                if (
                    overlapLenGroup(seqs[i].seq, seqs[j].seq) > 0 ||
                    overlapLenGroup(seqs[j].seq, seqs[i].seq) > 0 ||
                    hasSharedTokenCtx(seqs[i].seq, seqs[j].seq)
                ) {
                    adj[i][j] = adj[j][i] = true;
                }
            }
        }
        // Connected components on expanded subset
        const visitedSel = Array(nSel).fill(false);
        const comps = [];
        for (let i = 0; i < nSel; i++) {
            if (visitedSel[i]) continue;
            const q = [i]; visitedSel[i] = true; const comp = [i];
            while (q.length) {
                const u = q.shift();
                for (let v = 0; v < nSel; v++) {
                    if (!visitedSel[v] && adj[u][v]) { visitedSel[v] = true; q.push(v); comp.push(v); }
                }
            }
            comps.push(comp);
        }
        const flowsByIndexGroup = Array(simpleRoutes.length).fill(null);
        comps.forEach((comp) => {
            // Build items for this component
            const items = comp.map((k) => ({ idx: seqs[k].idx, seq: seqs[k].seq }));
            // Choose primary by effective length (ignoring leading 生年忌), prefer non-生年忌 heads on tie
            const effectiveLen = (s) => (Array.isArray(s) ? (s[0] === '生年忌' ? s.length - 1 : s.length) : 0);
            items.sort((a, b) => (effectiveLen(b.seq) - effectiveLen(a.seq)) || ((a.seq && a.seq[0] === '生年忌') - (b.seq && b.seq[0] === '生年忌')));
            const primaryIdx = items[0].idx;
            let curPrimarySeq = [...items[0].seq];
            const primaryFlow = makeFlow(curPrimarySeq, primaryIdx, 0);
            // Map of label -> node for primary
            const primaryNodeByLabel = new Map();
            primaryFlow.nodes.forEach((n) => { if (n && n.data && typeof n.data.label === 'string') primaryNodeByLabel.set(n.data.label, n); });
            // Helpers
            const KA = () => buildContextKeys(curPrimarySeq);
            const dropBirthJi = (seq) => {
                if (!Array.isArray(seq) || seq.length === 0) return seq;
                if (seq[0] === '生年忌') return seq.slice(1);
                return seq;
            };
            // raw token overlap (fallback when context keys don't match at boundaries)
            const longestOverlapRaw = (A, B) => {
                const maxL = Math.min(A.length, B.length);
                for (let L = maxL; L >= 1; L--) {
                    let ok = true;
                    for (let i = 0; i < L; i++) { if (A[A.length - L + i] !== B[i]) { ok = false; break; } }
                    if (ok) return L;
                }
                return 0;
            };
            const internalSuffixOverlapRaw = (A, B) => {
                const maxL = Math.min(A.length, B.length);
                for (let L = maxL; L >= 1; L--) {
                    for (let s = 0; s <= B.length - L; s++) {
                        let ok = true;
                        for (let i = 0; i < L; i++) { if (A[A.length - L + i] !== B[s + i]) { ok = false; break; } }
                        if (ok) return { start: s, len: L };
                    }
                }
                return { start: -1, len: 0 };
            };
            const internalPrefixOverlapRaw = (A, B) => {
                const maxL = Math.min(A.length, B.length);
                for (let L = maxL; L >= 1; L--) {
                    for (let s = 0; s <= B.length - L; s++) {
                        let ok = true;
                        for (let i = 0; i < L; i++) { if (A[i] !== B[s + i]) { ok = false; break; } }
                        if (ok) return { start: s, len: L };
                    }
                }
                return { start: -1, len: 0 };
            };
            // context-aware overlap using star->palace keys, with raw fallback when none
            const longestOverlap = (A, B) => {
                const kA = buildContextKeys(A);
                const kB = buildContextKeys(dropBirthJi(B));
                const maxL = Math.min(kA.length, kB.length);
                for (let L = maxL; L >= 1; L--) {
                    let ok = true;
                    for (let i = 0; i < L; i++) { if (kA[kA.length - L + i] !== kB[i]) { ok = false; break; } }
                    if (ok) return L;
                }
                // fallback: raw token overlap (handles head-palace vs star->palace boundary)
                return longestOverlapRaw(A, dropBirthJi(B));
            };
            const internalSuffixOverlap = (A, B) => {
                const kA = buildContextKeys(A);
                const kB = buildContextKeys(dropBirthJi(B));
                const maxL = Math.min(kA.length, kB.length);
                for (let L = maxL; L >= 1; L--) {
                    for (let s = 0; s <= kB.length - L; s++) {
                        let ok = true;
                        for (let i = 0; i < L; i++) { if (kA[kA.length - L + i] !== kB[s + i]) { ok = false; break; } }
                        if (ok) return { start: s, len: L };
                    }
                }
                // fallback to raw when no context-key match
                return internalSuffixOverlapRaw(A, dropBirthJi(B));
            };
            const internalPrefixOverlap = (A, B) => {
                const kA = buildContextKeys(dropBirthJi(A));
                const kB = buildContextKeys(B);
                const maxL = Math.min(kA.length, kB.length);
                for (let L = maxL; L >= 1; L--) {
                    for (let s = 0; s <= kB.length - L; s++) {
                        let ok = true;
                        for (let i = 0; i < L; i++) { if (kA[i] !== kB[s + i]) { ok = false; break; } }
                        if (ok) return { start: s, len: L };
                    }
                }
                // fallback to raw when no context-key match
                return internalPrefixOverlapRaw(dropBirthJi(A), B);
            };
            const getLastMainPalace = () => {
                const palNodes = primaryFlow.nodes.filter((n) => n.type === 'eclipse');
                if (palNodes.length === 0) return null;
                const minY = Math.min(...palNodes.map((n) => n.position?.y || 0));
                const mainPals = palNodes.filter((n) => (n.position?.y || 0) === minY);
                if (mainPals.length === 0) return null;
                return mainPals.reduce((a, b) => ((a.position?.x || 0) > (b.position?.x || 0) ? a : b));
            };
            let extCounter = 0;
            const appendToMain = (tokens) => {
                if (!tokens || tokens.length === 0) return;
                let lastPal = getLastMainPalace();
                if (!lastPal) return;
                let curPalId = lastPal.id;
                let curPalX = lastPal.position?.x || 0;
                let lastStarId = null;
                let lastStarX = 0;
                const baseY = 0;
                // Pre-scan tokens to decide a single, earliest-destination loopback target if duplicates exist
                const primaryKeysSet = new Set(buildContextKeys(curPrimarySeq));
                const loopCandidates = [];
                for (let i = 0; i < tokens.length - 1; i++) {
                    const s = tokens[i];
                    const p = tokens[i + 1];
                    if (!isStarToken(s) || !isPalaceToken(p)) continue;
                    const key = `${s}->${p}`;
                    if (!primaryKeysSet.has(key)) continue;
                    // find earliest occurrence of star s on the main line (y == 0) by x
                    let destNode = null;
                    try {
                        const mainStars = (primaryFlow.nodes || []).filter((n) => n && n.type === 'star' && n.data && n.data.label === s && Math.round((n.position?.y || 0)) === 0);
                        if (mainStars && mainStars.length > 0) {
                            mainStars.sort((a,b) => (a.position?.x || 0) - (b.position?.x || 0));
                            destNode = mainStars[0];
                        }
                    } catch (_) {}
                    if (destNode) loopCandidates.push({ idx: i, star: s, palace: p, x: destNode.position?.x || 0, destNode });
                }
                if (loopCandidates.length > 0) {
                    loopCandidates.sort((a,b) => a.x - b.x);
                    const best = loopCandidates[0];
                    const destNode = best.destNode;
                    // 先把重複點之前的 tokens 加到主線，例如先加上「天同→交友宮」，再回折到「文曲」
                    const limit = best.idx; // star index of first duplicate pair
                    let j2 = 0;
                    while (j2 < limit) {
                        const tk2 = tokens[j2];
                        if (isSelfJi(tk2)) {
                            const blueId = `r${primaryIdx}-ext-b${extCounter++}`;
                            const blueY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);
                            const blueX = curPalX + ELLIPSE_WIDTH + gapA;
                            primaryFlow.nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: blueX, y: blueY } });
                            primaryFlow.edges.push({ id: `r${primaryIdx}-ext-e-blue-${extCounter}`, source: curPalId, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                            break;
                        }
                        if (isPalaceToken(tk2)) {
                            const palId = `r${primaryIdx}-ext-p${extCounter++}`;
                            const palX = curPalX + ELLIPSE_WIDTH + gapA;
                            const palY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                            primaryFlow.nodes.push({ id: palId, type: 'eclipse', data: { label: `${tk2}`, handles: { R: true } }, position: { x: palX, y: palY } });
                            curPalId = palId;
                            curPalX = palX;
                            j2 += 1;
                            continue;
                        }
                        if (isStarToken(tk2)) {
                            const starId = `r${primaryIdx}-ext-s${extCounter++}`;
                            const starX = curPalX + ELLIPSE_WIDTH + gapA;
                            const starY = baseY;
                            const nextTk2 = tokens[j2 + 1];
                            const handles2 = (nextTk2 === '自化忌') ? { L: true, R: true } : { L: true };
                            primaryFlow.nodes.push({ id: starId, type: 'star', data: { label: `${tk2}`, handles: handles2, offsetLeft: 0, offsetRight: 0 }, position: { x: starX, y: starY } });
                            primaryFlow.edges.push({ id: `r${primaryIdx}-ext-e${extCounter}`, source: curPalId, target: starId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                            if (isPalaceToken(nextTk2)) {
                                const destPalId = `r${primaryIdx}-ext-p${extCounter++}`;
                                const destPalX = starX + NODE_WIDTH + gapB;
                                const destPalY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                                primaryFlow.nodes.push({ id: destPalId, type: 'eclipse', data: { label: `${nextTk2}`, handles: { R: true } }, position: { x: destPalX, y: destPalY } });
                                curPalId = destPalId;
                                curPalX = destPalX;
                                j2 += 2;
                                continue;
                            }
                            j2 += 1;
                            continue;
                        }
                        j2 += 1;
                    }
                    // ensure destination can receive from top
                    const destHandles = (destNode.data && destNode.data.handles) ? destNode.data.handles : {};
                    destNode.data = { ...destNode.data, handles: { ...destHandles, T: true } };
                    // create HVHV from current palace ellipse to dest star
                    const srcId = curPalId;
                    const srcNode = primaryFlow.nodes.find((n) => n.id === srcId);
                    const srcRightX = (srcNode?.position?.x || 0) + ELLIPSE_WIDTH;
                    const targetCenterX = (destNode?.position?.x || 0) + NODE_WIDTH / 2;
                    const bendX = Math.max(srcRightX, targetCenterX) + 40;
                    const topY = Math.min((srcNode?.position?.y || 0), (destNode?.position?.y || 0));
                    const bendY1 = topY - 60;
                    primaryFlow.edges.push({ id: `r${primaryIdx}-ext-loop-${extCounter++}`, source: srcId, target: destNode.id, sourceHandle: 'B', targetHandle: 'T', type: 'rightangle', data: { mode: 'HVHV', bendX, bendY1 }, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                    return; // stop further processing to avoid secondary loopbacks (e.g., 天同)
                }
                for (let ti = 0; ti < tokens.length; ti++) {
                    const tk = tokens[ti];
                    if (typeof tk !== 'string') continue;
                    // Lookahead palace for repeated star->palace loopback
                    const nextTk = tokens[ti + 1];
                    const isNextPal = isPalaceToken(nextTk);
                    const pairKey = (isNextPal && isStarToken(tk)) ? `${tk}->${nextTk}` : '';
                    const primaryKeys = new Set(buildContextKeys(curPrimarySeq));
                    if (pairKey && primaryKeys.has(pairKey)) {
                        // Do not create duplicated nodes; draw HVHV loopback from current palace to the earliest occurrence on main line
                        let destNode = primaryNodeByLabel.get(tk);
                        try {
                            const mainStars = (primaryFlow.nodes || []).filter((n) => n && n.type === 'star' && n.data && n.data.label === tk && Math.round((n.position?.y || 0)) === 0);
                            if (mainStars && mainStars.length > 0) {
                                mainStars.sort((a,b) => (a.position?.x || 0) - (b.position?.x || 0));
                                destNode = mainStars[0] || destNode;
                            }
                        } catch (_) {}
                        if (destNode) {
                            // ensure destination star can receive from top
                            const destHandles = (destNode.data && destNode.data.handles) ? destNode.data.handles : {};
                            destNode.data = { ...destNode.data, handles: { ...destHandles, T: true } };
                            // ensure source is the current palace ellipse node
                            const srcId = curPalId;
                            const srcNode = primaryFlow.nodes.find((n) => n.id === srcId);
                            // Bend planning: draw above the route
                            const srcRightX = (srcNode?.position?.x || 0) + ELLIPSE_WIDTH;
                            const targetCenterX = (destNode?.position?.x || 0) + NODE_WIDTH / 2;
                            const bendX = Math.max(srcRightX, targetCenterX) + 40; // go rightwards first
                            const topY = Math.min((srcNode?.position?.y || 0), (destNode?.position?.y || 0));
                            const bendY1 = topY - 60; // go above both
                            primaryFlow.edges.push({ id: `r${primaryIdx}-ext-loop-${extCounter++}`, source: srcId, target: destNode.id, sourceHandle: 'R', targetHandle: 'T', type: 'rightangle', data: { mode: 'HVHV', bendX, bendY1 }, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                            // finish after first loopback to avoid creating subsequent loopbacks to later parts
                            return;
                        }
                    }
                    if (isSelfJi(tk)) {
                        const blueId = `r${primaryIdx}-ext-b${extCounter++}`;
                        const blueY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - SIDE_NODE_HEIGHT) / 2);
                        if (lastStarId) {
                            const blueX = lastStarX + NODE_WIDTH + gapA; // ensure 40px after star
                            primaryFlow.nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: blueX, y: blueY } });
                            primaryFlow.edges.push({ id: `r${primaryIdx}-ext-e-blue-${extCounter}`, source: lastStarId, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        } else {
                            const blueX = curPalX + ELLIPSE_WIDTH + gapA; // fallback: after palace
                            primaryFlow.nodes.push({ id: blueId, type: 'blue', data: { label: '自化忌', handles: { L: true } }, position: { x: blueX, y: blueY } });
                            primaryFlow.edges.push({ id: `r${primaryIdx}-ext-e-blue-${extCounter}`, source: curPalId, target: blueId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        }
                        break;
                    }
                    if (isStarToken(tk)) {
                        const starId = `r${primaryIdx}-ext-s${extCounter++}`;
                        const starX = curPalX + ELLIPSE_WIDTH + gapA;
                        const starY = baseY;
                        const nextTk = tokens[ti + 1];
                        const handles = (nextTk === '自化忌') ? { L: true, R: true } : { L: true };
                        primaryFlow.nodes.push({ id: starId, type: 'star', data: { label: `${tk}`, handles, offsetLeft: 0, offsetRight: 0 }, position: { x: starX, y: starY } });
                        primaryFlow.edges.push({ id: `r${primaryIdx}-ext-e${extCounter}`, source: curPalId, target: starId, sourceHandle: 'R', targetHandle: 'L', type: 'straight', style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                        lastStarId = starId;
                        lastStarX = starX;
                        continue;
                    }
                    if (isPalaceToken(tk)) {
                        const palId = `r${primaryIdx}-ext-p${extCounter++}`;
                        const starX = curPalX + ELLIPSE_WIDTH + gapA;
                        const palX = starX + NODE_WIDTH + gapB;
                        const palY = baseY + Math.max(0, (MAIN_NODE_HEIGHT - ELLIPSE_HEIGHT) / 2);
                        primaryFlow.nodes.push({ id: palId, type: 'eclipse', data: { label: `${tk}`, handles: { R: true } }, position: { x: palX, y: palY } });
                        curPalId = palId;
                        curPalX = palX;
                        lastStarId = null; // reset after reaching palace
                        primaryFlow.width = Math.max(primaryFlow.width, palX + ELLIPSE_WIDTH + 40);
                    }
                }
                primaryFlow.height = Math.max(primaryFlow.height, Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 40);
            };
            const branchGapY = 80;
            let branchRow = 1;
            // Track kept segments per destination token to absorb shorter lanes into longer ones
            const processedLaneKeptByDest = new Map(); // token -> Array<Array<string>>
            // Pre-merge pass: repeatedly absorb any sequence whose prefix/suffix overlaps primary
            let remaining = items.slice(1);
            const isContainedRaw = (A, B) => {
                if (!Array.isArray(A) || !Array.isArray(B)) return false;
                if (B.length === 0 || B.length > A.length) return false;
                for (let start = 0; start <= A.length - B.length; start++) {
                    let ok = true;
                    for (let i = 0; i < B.length; i++) { if (A[start + i] !== B[i]) { ok = false; break; } }
                    if (ok) return true;
                }
                return false;
            };
            // Remove any sequence that is already a contiguous subsequence of the current primary
            remaining = remaining.filter((r) => !isContainedRaw(curPrimarySeq, r.seq));
            let mergedSomethingOnce = true;
            while (mergedSomethingOnce && remaining.length > 0) {
                mergedSomethingOnce = false;
                for (let r = 0; r < remaining.length; r++) {
                    const seq = remaining[r].seq;
                    // Guard: if this sequence is already a contiguous subsequence of primary, drop it early
                    if (isContainedRaw(curPrimarySeq, seq)) {
                        remaining.splice(r, 1);
                        mergedSomethingOnce = true;
                        break;
                    }
                    // compute overlap ignoring leading 生年忌 on either side
                    const curForOverlap = (curPrimarySeq[0] === '生年忌') ? curPrimarySeq.slice(1) : curPrimarySeq;
                    const seqForOverlap = (seq[0] === '生年忌') ? seq.slice(1) : seq;
                    const L1 = longestOverlap(curForOverlap, seqForOverlap); // primary suffix vs seq prefix (adjusted)
                    if (L1 >= 1 && seq.length > L1) {
                        const tail = seqForOverlap.slice(L1);
                        appendToMain(tail);
                        // rebuild curPrimarySeq by appending tail to original curPrimarySeq (no extra 生年忌)
                        curPrimarySeq = curPrimarySeq.concat(tail);
                        primaryNodeByLabel.clear();
                        primaryFlow.nodes.forEach((n) => { if (n && n.data) primaryNodeByLabel.set(n.data.label, n); });
                        // If original sequence starts with 生年忌，保留「生年忌」作為次行，指向本次重疊的第一個星（如「太陰」）
                        if (seq && seq[0] === '生年忌') {
                            const laneY = branchRow * branchGapY;
                            let { nodes: bjNodes, edges: bjEdges, width: bjW } = makeFlow(['生年忌'], primaryIdx, laneY);
                            const destTok = seqForOverlap[0]; // first token after 生年忌（預期為星）
                            const destNode = primaryNodeByLabel.get(destTok);
                            if (destNode) {
                                destNode.data = { ...destNode.data, handles: { ...(destNode.data?.handles || {}), BT: true } };
                                // 將「生年忌」單節點靠右對齊至目標左側，縮短 HV 水平段
                                if (bjNodes.length > 0) {
                                    const lastNode = bjNodes[bjNodes.length - 1];
                                    const lastWidth = (lastNode.type === 'eclipse') ? ELLIPSE_WIDTH : (lastNode.type === 'star' ? NODE_WIDTH : SIDE_NODE_WIDTH);
                                    const targetX = (destNode && destNode.position && typeof destNode.position.x === 'number') ? destNode.position.x : 0;
                                    const desiredRightGap = 40;
                                    const desiredLeftX = Math.floor(targetX - desiredRightGap - lastWidth);
                                    const dx = desiredLeftX - (lastNode.position?.x || 0);
                                    if (dx !== 0) bjNodes.forEach((n) => { if (n && n.position && typeof n.position.x === 'number') n.position.x += dx; });
                                }
                                const lastNodeId = (bjNodes.length > 0) ? bjNodes[bjNodes.length - 1].id : null;
                                if (lastNodeId) {
                                    let attach = { id: `r${primaryIdx}-lane-${items[r].idx}-attach-bj`, source: lastNodeId, target: destNode.id, sourceHandle: 'R', targetHandle: 'BT', type: 'rightangle', data: { twoSegment: 'HV' }, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } };
                                    const idSuffix = `-lane-${items[r].idx}-bj`;
                                    const remapId = (id) => `${id}${idSuffix}`;
                                    const originalIds = new Set(bjNodes.map((n) => n.id));
                                    bjNodes.forEach((n) => { n.id = remapId(n.id); });
                                    bjEdges.forEach((e) => { e.id = remapId(e.id); if (originalIds.has(e.source)) e.source = remapId(e.source); if (originalIds.has(e.target)) e.target = remapId(e.target); });
                                    // also remap the attach edge endpoints and id if needed
                                    if (originalIds.has(attach.source)) attach.source = remapId(attach.source);
                                    attach.id = remapId(attach.id);
                                    primaryFlow.nodes.push(...bjNodes);
                                    primaryFlow.edges.push(...bjEdges, attach);
                                    primaryFlow.width = Math.max(primaryFlow.width, bjW);
                                    primaryFlow.height = Math.max(primaryFlow.height, laneY + Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 80);
                                    branchRow += 1;
                                }
                            }
                        }
                        remaining.splice(r, 1);
                        mergedSomethingOnce = true;
                        break;
                    }
                    const L2 = longestOverlap(seqForOverlap, curForOverlap); // seq suffix vs primary prefix (adjusted)
                    if (L2 >= 1 && curPrimarySeq.length > L2) {
                        const head = seqForOverlap.slice(0, seqForOverlap.length - L2);
                        const combined = head.concat(curPrimarySeq);
                        curPrimarySeq = combined;
                        const rebuilt = makeFlow(curPrimarySeq, primaryIdx, 0);
                        primaryFlow.nodes = rebuilt.nodes;
                        primaryFlow.edges = rebuilt.edges;
                        primaryFlow.width = rebuilt.width;
                        primaryFlow.height = rebuilt.height;
                        primaryNodeByLabel.clear();
                        primaryFlow.nodes.forEach((n) => { if (n && n.data) primaryNodeByLabel.set(n.data.label, n); });
                        remaining.splice(r, 1);
                        mergedSomethingOnce = true;
                        break;
                    }
                    // Internal suffix overlap: primary suffix matches seq somewhere inside -> append the remaining tail
                    const suf = internalSuffixOverlap(curPrimarySeq, seq);
                    if (suf.len >= 1 && suf.start + suf.len < seq.length) {
                        // 先吸收尾巴（overlap 後的部分）
                        const tail = seq.slice(suf.start + suf.len);
                        if (tail.length > 0) {
                            appendToMain(tail);
                            curPrimarySeq = curPrimarySeq.concat(tail);
                            primaryNodeByLabel.clear();
                            primaryFlow.nodes.forEach((n) => { if (n && n.data) primaryNodeByLabel.set(n.data.label, n); });
                        }
                        // 再為前段 head（overlap 之前的部分）建立次行並接到主線的共享節點
                        const headTokens = seq.slice(0, suf.start);
                        if (headTokens.length > 0) {
                            const laneY = branchRow * branchGapY;
                            let { nodes: laneNodes, edges: laneEdges, width: laneW } = makeFlow(headTokens, primaryIdx, laneY);
                            // 找到重疊區中的優先共享星作為目標，否則第一個共享節點
                            const overlapTokens = seq.slice(suf.start, suf.start + suf.len);
                            let destTok = overlapTokens.find((t) => isStarToken(t) && primaryNodeByLabel.has(t));
                            if (!destTok) destTok = overlapTokens.find((t) => primaryNodeByLabel.has(t));
                            if (destTok) {
                                const destNode = primaryNodeByLabel.get(destTok);
                                destNode.data = { ...destNode.data, handles: { ...(destNode.data?.handles || {}), BT: true } };
                                const keptNodes = laneNodes; // 保留整段 headTokens
                                // Align this head lane to the right near destination
                                if (keptNodes.length > 0) {
                                    const lastNode = keptNodes[keptNodes.length - 1];
                                    const lastWidth = (lastNode.type === 'eclipse') ? ELLIPSE_WIDTH : (lastNode.type === 'star' ? NODE_WIDTH : SIDE_NODE_WIDTH);
                                    const targetX = (destNode && destNode.position && typeof destNode.position.x === 'number') ? destNode.position.x : 0;
                                    const desiredRightGap = 16;
                                    const desiredLeftX = Math.floor(targetX - desiredRightGap - lastWidth);
                                    const dx = desiredLeftX - (lastNode.position?.x || 0);
                                    if (dx !== 0) keptNodes.forEach((n) => { if (n && n.position && typeof n.position.x === 'number') n.position.x += dx; });
                                }
                                const keptIds = new Set(keptNodes.map((n) => n.id));
                                let keptEdges = laneEdges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));
                                const lastNodeId = keptNodes.length > 0 ? keptNodes[keptNodes.length - 1].id : null;
                                if (lastNodeId) {
                                    keptEdges = keptEdges.concat({ id: `r${primaryIdx}-lane-${items[r+1] ? items[r+1].idx : items[r].idx}-attach-head`, source: lastNodeId, target: destNode.id, sourceHandle: 'R', targetHandle: 'BT', type: 'rightangle', data: { twoSegment: 'HV' }, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                                }
                                const idSuffix = `-lane-${items[r].idx}-head`;
                                const remapId = (id) => `${id}${idSuffix}`;
                                const originalLaneIds = new Set(keptNodes.map((n) => n.id));
                                keptNodes.forEach((n) => { n.id = remapId(n.id); });
                                keptEdges.forEach((e) => { e.id = remapId(e.id); if (originalLaneIds.has(e.source)) e.source = remapId(e.source); if (originalLaneIds.has(e.target)) e.target = remapId(e.target); });
                                primaryFlow.nodes.push(...keptNodes);
                                primaryFlow.edges.push(...keptEdges);
                                primaryFlow.width = Math.max(primaryFlow.width, laneW);
                                primaryFlow.height = Math.max(primaryFlow.height, laneY + Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 80);
                                keptNodes.forEach((n) => { if (n && n.data && typeof n.data.label === 'string') primaryNodeByLabel.set(n.data.label, n); });
                                // 記錄此 head 次行，供後續較長次行吸收
                                const keptLabelsHead = keptNodes.map((n) => n && n.data && n.data.label).filter(Boolean);
                                const entryHead = { labels: keptLabelsHead, nodeIds: new Set(keptNodes.map((n) => n.id)), edgeIds: new Set(keptEdges.map((e) => e.id)) };
                                const prevHead = processedLaneKeptByDest.get(destTok) || [];
                                prevHead.push(entryHead);
                                processedLaneKeptByDest.set(destTok, prevHead);
                                branchRow += 1;
                            }
                        }
                        // 移除此序列（已處理 head 與 tail）
                        remaining.splice(r, 1);
                        mergedSomethingOnce = true;
                        break;
                    }
                    // Internal prefix overlap: primary prefix matches seq somewhere inside -> prepend the earlier head
                    const pre = internalPrefixOverlap(curPrimarySeq, seq);
                    if (pre.len >= 1 && pre.start > 0) {
                        const head = seq.slice(0, pre.start);
                        const combined = head.concat(curPrimarySeq);
                        curPrimarySeq = combined;
                        const rebuilt = makeFlow(curPrimarySeq, primaryIdx, 0);
                        primaryFlow.nodes = rebuilt.nodes;
                        primaryFlow.edges = rebuilt.edges;
                        primaryFlow.width = rebuilt.width;
                        primaryFlow.height = rebuilt.height;
                        primaryNodeByLabel.clear();
                        primaryFlow.nodes.forEach((n) => { if (n && n.data) primaryNodeByLabel.set(n.data.label, n); });
                        remaining.splice(r, 1);
                        mergedSomethingOnce = true;
                        break;
                    }
                }
            }

            // 依「裁切前保留長度」由大到小建立剩餘次行，確保較長的先渲染
            const primaryContextSet = new Set(buildContextKeys(curPrimarySeq));
            const calcKeepLen = (seq) => {
                // earliest shared star, then earliest shared token with context-aware matching
                for (let t = 0; t < seq.length; t++) { const tok = seq[t]; if (isStarToken(tok) && primaryNodeByLabel.has(tok)) return t; }
                for (let t = 0; t < seq.length; t++) { const key = contextKeyAt(seq, t); if (primaryContextSet.has(key)) return t; }
                return seq.length; // no shared token -> keep whole
            };
            remaining.sort((a, b) => (calcKeepLen(b.seq) - calcKeepLen(a.seq)) || (b.seq.length - a.seq.length));
            // Process leftover sequences in this component as lanes
            for (let k = 0; k < remaining.length; k++) {
                const seq = remaining[k].seq;
                if (!seq || seq.length === 0) continue;
                // If this sequence is already a contiguous subsequence of the primary, skip rendering
                const containsAsSubsequence = (() => {
                    const A = curPrimarySeq, B = seq;
                    if (B.length === 0 || B.length > A.length) return false;
                    for (let start = 0; start <= A.length - B.length; start++) {
                        let ok = true;
                        for (let i = 0; i < B.length; i++) { if (A[start + i] !== B[i]) { ok = false; break; } }
                        if (ok) return true;
                    }
                    return false;
                })();
                if (containsAsSubsequence) continue;
                // Try to append tail if primary suffix overlaps this prefix
                const L = longestOverlap(curPrimarySeq, seq);
                if (L >= 1) {
                    const tail = seq.slice(L);
                    appendToMain(tail);
                    curPrimarySeq = curPrimarySeq.concat(tail);
                    // refresh primary nodes map after extension
                    primaryNodeByLabel.clear();
                    primaryFlow.nodes.forEach((n) => { if (n && n.data) primaryNodeByLabel.set(n.data.label, n); });
                    continue;
                }
                // Otherwise create a lane and point to the last shared token with primary
                // If the entire sequence is already present in primary as a subsequence, skip creating the lane
                {
                    const A = curPrimarySeq, B = seq;
                    let contained = false;
                    if (Array.isArray(A) && Array.isArray(B) && B.length <= A.length) {
                        outer_check: for (let start = 0; start <= A.length - B.length; start++) {
                            for (let i = 0; i < B.length; i++) { if (A[start + i] !== B[i]) continue outer_check; }
                            contained = true; break;
                        }
                    }
                    if (contained) { branchRow += 0; continue; }
                }
                const laneY = branchRow * branchGapY;
                let { nodes: laneNodes, edges: laneEdges, width: laneW } = makeFlow(seq, primaryIdx, laneY);
                // Find earliest shared STAR token (preferred), fallback to earliest shared token
                const findCut = () => {
                    // 優先用「星」作為共享節點；若沒有共享星，再退回到共享「宮」。
                    for (let t = 0; t < seq.length; t++) {
                        const tok = seq[t]; if (isStarToken(tok) && primaryNodeByLabel.has(tok)) return { token: tok, index: t };
                    }
                    for (let t = 0; t < seq.length; t++) {
                        const tok = seq[t]; if (isPalaceToken(tok) && primaryNodeByLabel.has(tok)) return { token: tok, index: t };
                    }
                    return null;
                };
                const cut = findCut();
                if (cut && cut.index > 0) {
                    const destNode = primaryNodeByLabel.get(cut.token);
                    if (destNode) {
                        destNode.data = { ...destNode.data, handles: { ...(destNode.data?.handles || {}), BT: true } };
                        const cutIdx = laneNodes.findIndex((n) => n && n.data && n.data.label === cut.token);
                        if (cutIdx > 0) {
                            const keptNodes = laneNodes.slice(0, cutIdx);
                            const keptLabelsA = keptNodes.map((n) => n && n.data && n.data.label).filter(Boolean);
                            // Absorb rule: if this kept segment is a suffix of any previously created lane for the same dest, skip this lane
                            const prevList = processedLaneKeptByDest.get(cut.token) || [];
                            const isSuffixOfPrev = prevList.some((prev) => {
                                const prevLabels = Array.isArray(prev) ? prev : (prev && Array.isArray(prev.labels) ? prev.labels : []);
                                if (prevLabels.length < keptLabelsA.length) return false;
                                for (let i = 1; i <= keptLabelsA.length; i++) {
                                    if (prevLabels[prevLabels.length - i] !== keptLabelsA[keptLabelsA.length - i]) return false;
                                }
                                return true;
                            });
                            if (isSuffixOfPrev) {
                                // shorter lane absorbed by an existing longer lane; do not render this lane
                                continue;
                            }
                            // 若僅保留 1 節點，確保它為該次行之起點（如「疾厄宮」），即使主線已有同名節點仍保留
                            // If僅剩 1 節點：
                            // - 若該節點已存在於目前已渲染的任一行（主線或較早加入的次行）則略過
                            // - 若未出現在已渲染內容，則保留並接到主線共享節點
                            if (keptNodes.length <= 1) {
                                const singleLabel = (keptNodes[0] && keptNodes[0].data && keptNodes[0].data.label) ? keptNodes[0].data.label : undefined;
                                if (!singleLabel) { continue; }
                            }
                            // Align this lane to the right near destination
                            if (keptNodes.length > 0) {
                                const lastNode = keptNodes[keptNodes.length - 1];
                                const lastWidth = (lastNode.type === 'eclipse') ? ELLIPSE_WIDTH : (lastNode.type === 'star' ? NODE_WIDTH : SIDE_NODE_WIDTH);
                                const targetX = (destNode && destNode.position && typeof destNode.position.x === 'number') ? destNode.position.x : 0;
                                const desiredRightGap = 40;
                                const desiredLeftX = Math.floor(targetX - desiredRightGap - lastWidth);
                                const dx = desiredLeftX - (lastNode.position?.x || 0);
                                if (dx !== 0) keptNodes.forEach((n) => { if (n && n.position && typeof n.position.x === 'number') n.position.x += dx; });
                            }
                            const keptIds = new Set(keptNodes.map((n) => n.id));
                            let keptEdges = laneEdges.filter((e) => keptIds.has(e.source) && keptIds.has(e.target));
                            const lastNodeId = keptNodes.length > 0 ? keptNodes[keptNodes.length - 1].id : null;
                            if (lastNodeId) {
                                keptEdges = keptEdges.concat({ id: `r${primaryIdx}-lane-${items[k].idx}-attach`, source: lastNodeId, target: destNode.id, sourceHandle: 'R', targetHandle: 'BT', type: 'rightangle', data: { twoSegment: 'HV' }, style: { stroke: '#3b82f6' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6', width: 20, height: 20 } });
                            }
                            // Remap lane ids to avoid collision
                            const idSuffix = `-lane-${items[k].idx}`;
                            const remapId = (id) => `${id}${idSuffix}`;
                            const originalLaneIds = new Set(keptNodes.map((n) => n.id));
                            keptNodes.forEach((n) => { n.id = remapId(n.id); });
                            keptEdges.forEach((e) => { e.id = remapId(e.id); if (originalLaneIds.has(e.source)) e.source = remapId(e.source); if (originalLaneIds.has(e.target)) e.target = remapId(e.target); });
                            // If the kept segment is entirely a suffix of primary (already present), keep only the loopback edge
                            const keptLabels = keptNodes.map((n) => n && n.data && n.data.label).filter(Boolean);
                            const A = curPrimarySeq;
                            const B = keptLabels;
                            const isSuffixAlready = (() => {
                                if (B.length === 0 || B.length > A.length) return false;
                                for (let start = A.length - B.length; start >= 0; start--) {
                                    let ok = true;
                                    for (let i = 0; i < B.length; i++) { if (A[start + i] !== B[i]) { ok = false; break; } }
                                    if (ok) return true;
                                }
                                return false;
                            })();
                            if (!isSuffixAlready) {
                                // Remove previously-added shorter lanes that are suffix of current kept segment (absorb them)
                                const prevArr = processedLaneKeptByDest.get(cut.token) || [];
                                const toRemove = [];
                                prevArr.forEach((prev, idx) => {
                                    const pl = Array.isArray(prev) ? prev : (prev && prev.labels ? prev.labels : []);
                                    if (pl.length === 0 || pl.length > keptLabelsA.length) return;
                                    let ok = true;
                                    for (let i = 1; i <= pl.length; i++) {
                                        if (pl[pl.length - i] !== keptLabelsA[keptLabelsA.length - i]) { ok = false; break; }
                                    }
                                    if (ok) toRemove.push(idx);
                                });
                                if (toRemove.length > 0) {
                                    const removeSets = toRemove.map((idx) => prevArr[idx]).filter(Boolean);
                                    const nodeIdSet = new Set(removeSets.flatMap((e) => Array.from((e && e.nodeIds) ? e.nodeIds : [])));
                                    const edgeIdSet = new Set(removeSets.flatMap((e) => Array.from((e && e.edgeIds) ? e.edgeIds : [])));
                                    // Reuse the removed lane's Y row for the new longer lane
                                    let targetY = undefined;
                                    const anyId = (removeSets[0] && removeSets[0].nodeIds) ? Array.from(removeSets[0].nodeIds)[0] : undefined;
                                    if (anyId) {
                                        const remNode = primaryFlow.nodes.find((n) => n.id === anyId);
                                        if (remNode && typeof remNode.position?.y === 'number') targetY = remNode.position.y;
                                    }
                                    primaryFlow.nodes = primaryFlow.nodes.filter((n) => !nodeIdSet.has(n.id));
                                    primaryFlow.edges = primaryFlow.edges.filter((e) => !edgeIdSet.has(e.id));
                                    // prune prevArr entries
                                    for (let i = toRemove.length - 1; i >= 0; i--) prevArr.splice(toRemove[i], 1);
                                    processedLaneKeptByDest.set(cut.token, prevArr);
                                    if (typeof targetY === 'number') {
                                        const deltaY = targetY - laneY;
                                        keptNodes.forEach((n) => { if (n && n.position && typeof n.position.y === 'number') n.position.y += deltaY; });
                                    }
                                }
                                // Now add current lane
                                primaryFlow.nodes.push(...keptNodes);
                                primaryFlow.edges.push(...keptEdges);
                                // Register current lane for future absorption checks
                                const entry = { labels: keptLabelsA, nodeIds: new Set(keptNodes.map((n) => n.id)), edgeIds: new Set(keptEdges.map((e) => e.id)) };
                                const prev = processedLaneKeptByDest.get(cut.token) || [];
                                prev.push(entry);
                                processedLaneKeptByDest.set(cut.token, prev);
                            } else {
                                // 完全為主線尾段的重複，該次行不渲染任何節點或邊，也不佔用列
                                continue;
                            }
                            primaryFlow.width = Math.max(primaryFlow.width, laneW);
                            primaryFlow.height = Math.max(primaryFlow.height, laneY + Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 80);
                            // shared label map refresh
                            // refresh shared label map so後續車道可偵測與已加入的次行重疊
                            keptNodes.forEach((n) => { if (n && n.data && typeof n.data.label === 'string') primaryNodeByLabel.set(n.data.label, n); });
                            branchRow += 1;
                            continue;
                        }
                    }
                }
                // 若沒有任何共享節點，仍允許以獨立一行呈現（避免整段不顯示）
                if (!cut) {
                    const idSuffix = `-lane-${items[k].idx}`;
                    const remapId = (id) => `${id}${idSuffix}`;
                    const originalLaneIds = new Set(laneNodes.map((n) => n.id));
                    laneNodes.forEach((n) => { n.id = remapId(n.id); });
                    laneEdges.forEach((e) => { e.id = remapId(e.id); if (originalLaneIds.has(e.source)) e.source = remapId(e.source); if (originalLaneIds.has(e.target)) e.target = remapId(e.target); });
                    primaryFlow.nodes.push(...laneNodes);
                    primaryFlow.edges.push(...laneEdges);
                    primaryFlow.width = Math.max(primaryFlow.width, laneW);
                    primaryFlow.height = Math.max(primaryFlow.height, laneY + Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 80);
                    branchRow += 1;
                    continue;
                }
                // If overlap is entirely contained within primary already, do not render this lane
                const isContained = (() => {
                    const A = curPrimarySeq, B = seq;
                    if (B.length === 0 || B.length > A.length) return false;
                    for (let start = 0; start <= A.length - B.length; start++) {
                        let ok = true;
                        for (let i = 0; i < B.length; i++) { if (A[start + i] !== B[i]) { ok = false; break; } }
                        if (ok) return true;
                    }
                    return false;
                })();
                if (isContained) continue;
                const idSuffix = `-lane-${items[k].idx}`;
                const remapId = (id) => `${id}${idSuffix}`;
                const originalLaneIds = new Set(laneNodes.map((n) => n.id));
                laneNodes.forEach((n) => { n.id = remapId(n.id); });
                laneEdges.forEach((e) => { e.id = remapId(e.id); if (originalLaneIds.has(e.source)) e.source = remapId(e.source); if (originalLaneIds.has(e.target)) e.target = remapId(e.target); });
                primaryFlow.nodes.push(...laneNodes);
                primaryFlow.edges.push(...laneEdges);
                primaryFlow.width = Math.max(primaryFlow.width, laneW);
                primaryFlow.height = Math.max(primaryFlow.height, laneY + Math.max(MAIN_NODE_HEIGHT, ELLIPSE_HEIGHT) + 80);
                branchRow += 1;
            }
            // After all lanes are added/removed, compact lane rows to close gaps
            (function compactLaneRows() {
                const laneRows = new Set();
                const rowOf = (n) => {
                    const y = (n && n.position && typeof n.position.y === 'number') ? n.position.y : 0;
                    return Math.round(y / branchGapY);
                };
                primaryFlow.nodes.forEach((n) => {
                    const r = rowOf(n);
                    if (r >= 1) laneRows.add(r);
                });
                if (laneRows.size <= 1) return;
                const sorted = Array.from(laneRows).sort((a,b) => a-b);
                const map = new Map();
                let next = 1;
                sorted.forEach((r) => { map.set(r, next++); });
                if (sorted.every((r, i) => map.get(r) === r)) return; // already compact
                const adjust = (n) => {
                    const r = rowOf(n);
                    if (r < 1) return;
                    const nr = map.get(r) || r;
                    const dy = (nr - r) * branchGapY;
                    if (dy !== 0 && n && n.position && typeof n.position.y === 'number') n.position.y += dy;
                };
                primaryFlow.nodes.forEach(adjust);
            })();
            // Assign flow to representative index and hide others in this component
            const owners = new Set(items.map((it) => it.idx));
            const rep = Math.min(...owners);
            flowsByIndexGroup[rep] = primaryFlow;
            owners.forEach((i) => { if (i !== rep) flowsByIndexGroup[i] = { nodes: [], edges: [], height: 0, width: 0, aliasOf: rep }; });
        });
        return flowsByIndexGroup;

    }, [simpleRoutes, selectedRoutes]);

    return (
        <>
            <Head>
                <title>藍線路徑</title>
                <meta name="description" content="外藍線 12 條路徑，每條最多 13 項" />
            </Head>
            <div ref={containerRef} className="container-flow" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', alignItems: 'stretch', height: '85vh', padding: `8px 8px 64px`, boxSizing: 'border-box' }}>
                {mounted && routeFlows && routeFlows.length > 0 ? (() => {
                    // Map selected indexes to their representative (aliasOf) if needed
                    const mapped = Array.from(selectedRoutes).map((idx) => {
                        const f = routeFlows[idx];
                        if (f && typeof f.aliasOf === 'number') return f.aliasOf;
                        return idx;
                    });
                    // Deduplicate after mapping
                    const unique = Array.from(new Set(mapped));
                    const visibleIdxs = unique
                        .filter((idx) => {
                            const f = routeFlows[idx];
                            return f && ((f.nodes && f.nodes.length > 0) || (f.edges && f.edges.length > 0));
                        })
                        .sort((a, b) => {
                            const fa = routeFlows[a] || {}; const fb = routeFlows[b] || {};
                            const la = (fa.nodes ? fa.nodes.length : 0);
                            const lb = (fb.nodes ? fb.nodes.length : 0);
                            return lb - la; // longer (more nodes) first, shorter under
                        });
                    const visibleCount = Math.max(1, visibleIdxs.length);
                    return visibleIdxs.map((idx) => {
                        const flow = routeFlows[idx];
                        const viewportW = (typeof window !== 'undefined') ? window.innerWidth : 1200;
                        const viewportH = (typeof window !== 'undefined') ? window.innerHeight : 800;
                        const computedWidth = Math.max(Math.floor(viewportW * 0.9), flow.width);
                        const chartWidth = `${computedWidth}px`;
                        // Container height uses window height percentage: ~80% / visibleCount
                        const containerRatio = 0.9 / visibleCount; // 1:80%, 2:40%, 3:26.6%, 4:20%
                        const computedHeight = Math.max(160, Math.floor(viewportH * containerRatio));
                        // Rendering area uses ~90% of container height
                        const renderHeight = Math.floor(computedHeight * 0.9);
                        const cardFlex = '1 1 auto';
                        const cardWidth = '100%';
                        return (
                            <div ref={(el) => { flowRefs.current[idx] = el; }} key={idx} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, margin: 0, flex: cardFlex, width: cardWidth, height: `${computedHeight}px` }}>
                                <div style={{ width: chartWidth, minWidth: chartWidth, height: renderHeight }}>
                                    <ReactFlow key={`rf-route-${idx}-${flow.nodes.length}-${flow.edges.length}`} nodes={flow.nodes} edges={flow.edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} defaultEdgeOptions={{ type: 'straight' }} fitView fitViewOptions={{ padding: 0.05, includeHiddenNodes: true }} minZoom={0.2} maxZoom={1.5} proOptions={{ hideAttribution: true }} onInit={(instance) => { rfInstancesRef.current[idx] = instance; try { instance.fitView({ padding: 0.05, includeHiddenNodes: true }); } catch (e) {} }}>
                                        <Controls showInteractive={false} position="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: 4 }} />
                                    </ReactFlow>
                                </div>
                            </div>
                        );
                    });
                })() : (
                    <div>尚無資料，請先產生盤局。</div>
                )}
            </div>
            {/* Bottom shortcut bar */}
            {mounted && routeFlows && routeFlows.length > 0 && (
                <div ref={bottomBarRef} style={{ position: 'fixed', left: 0, right: 0, bottom: '12px', background: '#ffffff', borderTop: '1px solid #eee', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                    {(() => {
                        const getHeadPalace = (i) => {
                            const seq = (simpleRoutes && simpleRoutes[i]) ? simpleRoutes[i] : [];
                            const headPal = (seq || []).find((s) => typeof s === 'string' && s.endsWith('宮'));
                            return headPal || `Route ${i + 1}`;
                        };
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