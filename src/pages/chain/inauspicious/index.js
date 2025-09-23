// http://localhost:3000/flow?n=&g=0&c=0&y=2025&m=8&d=21&bt=3&lm=0

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { astro } from "iztro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Controls, Handle, Position, MarkerType, BaseEdge, useNodesState, useEdgesState, addEdge, Background } from "reactflow";

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
    const [selectedRoutes, setSelectedRoutes] = useState([]);

    useEffect(() => {
        console.log(selectedRoutes);
    }, [selectedRoutes]);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                outerBlue: { name: owner || "", star: star || "" },
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

    // React Flow template: node/edge types + state
    const nodeTypes = useMemo(() => ({
        palace: PalaceNode,
        star: StarNode,
        dashedBlue: DashedBlueNode,
    }), []);

    const edgeTypes = useMemo(() => ({
        straightBlue: StraightBlueEdge,
        rightUp: RightUpEdge,
        rightUpRight: RightUpRightEdge,
        dashedArrowBoth: DashedArrowBothEdge,
    }), []);

    const defaultEdgeOptions = useMemo(() => ({ type: "straightBlue" }), []);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const routesForFlow = selectedRoutes;
        if (!routesForFlow || routesForFlow.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }
        const { nodes: genNodes, edges: genEdges } = generateRoutes(routesForFlow);
        setNodes(genNodes);
        setEdges(genEdges);
    }, [selectedRoutes]);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, type: "straightBlue" }, eds));
    }, []);

    // ===== Bottom shortcut bar helpers =====
    const routeKey = useCallback((r) => (Array.isArray(r) ? r.join("\x1f") : String(r)), []);
    const fixedGroupA = useMemo(() => ["命宮", "福德宮", "遷移宮", "生年忌"], []);
    const fixedGroupB = useMemo(
        () => ["兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "交友宮", "事業宮", "田宅宮", "父母宮"],
        []
    );
    const splitRoutes = useMemo(() => {
        const groupA = [];
        const groupB = [];
        if (!Array.isArray(simpleRoutes)) return { groupA, groupB };

        const findRouteForLabel = (label) => {
            if (!Array.isArray(simpleRoutes)) return { index: -1, route: undefined };
            let idx = -1;
            if (label === "生年忌") {
                idx = simpleRoutes.findIndex((rt) => Array.isArray(rt) && rt.includes("生年忌"));
            } else {
                idx = simpleRoutes.findIndex((rt) => Array.isArray(rt) && rt.includes(label));
            }
            if (idx > -1) {
                return { index: idx, route: simpleRoutes[idx] };
            }
            return { index: -1, route: undefined };
        };

        // Build groupA strictly in the fixed order
        fixedGroupA.forEach((label) => {
            const { index, route } = findRouteForLabel(label);
            groupA.push({ index, route, label, available: !!route });
        });

        // For groupB, ensure unique labels and no duplicates across groups
        const seenLabels = new Set(fixedGroupA);
        fixedGroupB.forEach((label) => {
            if (seenLabels.has(label)) return;
            const { index, route } = findRouteForLabel(label);
            groupB.push({ index, route, label, available: !!route });
            seenLabels.add(label);
        });

        return { groupA, groupB };
    }, [simpleRoutes, fixedGroupA, fixedGroupB]);

    const isSelected = useCallback((rt) => {
        const k = routeKey(rt);
        return selectedRoutes.findIndex((r) => routeKey(r) === k) > -1;
    }, [selectedRoutes, routeKey]);

    const toggleSelect = useCallback((rt) => {
        const k = routeKey(rt);
        setSelectedRoutes((prev) => {
            const idx = prev.findIndex((r) => routeKey(r) === k);
            if (idx > -1) {
                const next = prev.slice();
                next.splice(idx, 1);
                return next;
            }
            return [...prev, rt];
        });
    }, [routeKey]);

    return (
        <>
            <Head>
                <title>凶化串連 (Beta)</title>
                <meta
                    name="description"
                    content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
                />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://yl-flystar.pro/`} />
                <meta property="og:title" content="星軌堂 - 您的智能人生定位系統" />
                <meta property="og:description" content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。" />
                <meta property="og:image" content={`https://yl-flystar.pro/og.png`} />
                <meta property="og:site_name" content="星軌堂" />
            </Head>
            <div className="container-flow" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', alignItems: 'stretch', height: '100vh', padding: `8px 8px 164px`, boxSizing: 'border-box' }}>
                <div style={{ flex: 1, minHeight: 520, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        defaultEdgeOptions={defaultEdgeOptions}
                        fitView
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background gap={16} color="#f3f4f6" />
                        <Controls showInteractive={false} />
                    </ReactFlow>
                </div>
            </div>
            {/* Bottom shortcut bar */}
            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: 8, boxShadow: '0 -4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 8 }}>
                    {splitRoutes.groupA.map(({ index, route, label, available }) => {
                        const active = route && isSelected(route);
                        return (
                            <button
                                key={`sr-a-${label}`}
                                onClick={() => available && toggleSelect(route)}
                                style={{
                                    width: '100%',
                                    padding: '10px 8px',
                                    borderRadius: 6,
                                    border: '1px solid ' + (available ? (active ? '#3b82f6' : '#e5e7eb') : '#e5e7eb'),
                                    background: available ? (active ? '#3b82f6' : '#f9fafb') : '#f3f4f6',
                                    color: available ? (active ? '#fff' : '#111827') : '#9ca3af',
                                    fontWeight: 500,
                                    cursor: available ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {splitRoutes.groupB.map(({ index, route, label, available }) => {
                        const active = route && isSelected(route);
                        return (
                            <button
                                key={`sr-b-${label}`}
                                onClick={() => available && toggleSelect(route)}
                                style={{
                                    width: '100%',
                                    padding: '10px 8px',
                                    borderRadius: 6,
                                    border: '1px solid ' + (available ? (active ? '#3b82f6' : '#e5e7eb') : '#e5e7eb'),
                                    background: available ? (active ? '#3b82f6' : '#f9fafb') : '#f3f4f6',
                                    color: available ? (active ? '#fff' : '#111827') : '#9ca3af',
                                    fontWeight: 500,
                                    cursor: available ? 'pointer' : 'not-allowed'
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
            
        </>
    );
}

//////////////////////////////////////////////////////////////////////////////////////////

const STARS = ["太陽", "太陰", "巨門", "貪狼", "天機", "天同", "文昌", "文曲", "武曲", "廉貞"];
const PALACE_STAR_OFFSET = 40;
const STAR_PALACE_OFFSET = 2;
function generateRoutes(routes) {
    console.log(routes);
    const nodes = [];
    const edges = [];
    routes.forEach((route, routeIndex) => {
        const y = 80 * routeIndex;
        route.some((item, itemIndex) => {
            const id = `r${routeIndex}-${itemIndex}-${item}`;
            const type = item.startsWith("自化") ? "dashedBlue" : STARS.includes(item) ? "star" : "palace";

            // X - GAP Calculation
            const Lps = PALACE_WIDTH + PALACE_STAR_OFFSET; // 80 + 40 = 120
            const Lsp = STAR_WIDTH + STAR_PALACE_OFFSET; // 60 + 10 = 70
            const cycle = Lps + Lsp; // 190
            const x =
                type === "star"
                    ? Math.floor(itemIndex / 2) * cycle + Lps
                    : type === "dashedBlue"
                    ? Math.floor(itemIndex / 2) * cycle + Lps - PALACE_WIDTH
                    : Math.floor(itemIndex / 2) * cycle;

            // Skip duplicate nodes
            const existedNodeIndex = nodes.findIndex((node) => node.data.label === item);
            if (existedNodeIndex > -1) {
                if (type === "palace" && itemIndex > 0 && nodes[existedNodeIndex].id.split("-")[1] !== "0") {
                    // Make sure both the duplicated palace and the existed palace are not the first node
                    console.log("duplicate node", item);

                    // Move the new star to the bottom of the existed star, duplicated palace
                    nodes[nodes.length - 1].position.x = nodes[existedNodeIndex - 1].position.x;
                    nodes[nodes.length - 1].position.y = nodes[existedNodeIndex - 1].position.y + STAR_HEIGHT;

                    // Change the edge type to rightUpRight
                    edges[edges.length - 1].type = "rightUpRight";

                    // Move the following nodes to fit the new y-position of double star
                    let count = existedNodeIndex;
                    while (nodes[count].position.y === nodes[existedNodeIndex - 1].position.y) {
                        if (nodes[count].type === "palace") {
                            nodes[count].position.y += PALACE_HEIGHT / 2;
                        }
                        if (nodes[count].type === "star") {
                            nodes[count].position.y += STAR_HEIGHT / 2;
                        }
                        count++;
                    }

                    return true;
                }

                if (type === "star") {
                    console.log("duplicate node", item);
                    nodes[existedNodeIndex].data.handles.bottom = "target";

                    const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
                    edges.push({
                        id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`,
                        source: prevId,
                        target: nodes[existedNodeIndex].id,
                        targetHandle: "bottom",
                        type: "rightUp",
                    });

                    return true;
                }
            }

            nodes.push({
                id,
                type,
                position: { x, y: y + (type === "dashedBlue" ? 4 : 0) },
                data: {
                    label: item,
                    handles: {
                        left: type === "star" || type === "dashedBlue" ? "target" : null,
                        right: type === "palace" && itemIndex !== route.length - 1 ? "source" : null,
                        top: null,
                        bottom: null,
                    },
                },
            });

            if (type === "star") {
                const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
                edges.push({ id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`, source: prevId, target: id, targetHandle: "left" });
            }

            // Edge Handle for 自化忌
            if (type === "dashedBlue") {
                // Node Previous of 自化忌
                nodes[nodes.length - 2].data.handles.right = "source";
                const prevId = `r${routeIndex}-${itemIndex - 1}-${route[itemIndex - 1]}`;
                edges.push({ id: `r${routeIndex}-e${route[itemIndex - 1]}-${route[itemIndex]}`, source: prevId, target: id, targetHandle: "left" });
            }

            return false;
        });
    });

    console.log(nodes);
    console.log(edges);

    /* let node1Index = nodes.findIndex((node) => node.data.label === "財帛宮");
    let node2Index = nodes.findIndex((node) => node.data.label === "福德宮");
    nodes[node1Index].data.handles.bottom = "source";
    nodes[node2Index].data.handles.top = "target";
    edges.push({
        id: `r1-e${node1Index}-${node2Index}`,
        source: nodes[node1Index].id,
        target: nodes[node2Index].id,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "dashedArrowBoth",
    });

    let node3Index = nodes.findIndex((node) => node.data.label === "田宅宮");
    let node4Index = nodes.findIndex((node) => node.data.label === "子女宮");
    nodes[node3Index].data.handles.bottom = "source";
    nodes[node4Index].data.handles.top = "target";
    edges.push({
        id: `r1-e${node3Index}-${node4Index}`,
        source: nodes[node3Index].id,
        target: nodes[node4Index].id,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "dashedArrowBoth",
    }); */

    return { nodes, edges };
}

// Right → Up edge (two-segment orthogonal)
function RightUpEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  // go horizontally to targetX, then vertically to targetY
  const p1x = targetX;
  const p1y = sourceY;
  const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${targetX},${targetY}`;
  const blue = '#3b82f6';
  const endId = `${id}-rup-end`;

  return (
    <g>
      <defs>
        <marker id={endId} markerWidth="4" markerHeight="4" viewBox="0 0 4 4" refX="3.2" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={blue} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={style?.stroke || blue}
        strokeWidth={style?.strokeWidth || 2}
        markerEnd={`url(#${endId})`}
      />
    </g>
  );
}

// Right → Up → Right edge (three-segment orthogonal)
function RightUpRightEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  const horizontalOffset = 40; // final right width
  // Swap widths: first horizontal goes to (targetX - horizontalOffset), last horizontal = horizontalOffset
  const p1x = targetX - horizontalOffset;
  const p1y = sourceY;
  const p2x = p1x;
  const p2y = targetY; // vertical segment to align with target Y (up/down as needed)
  const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${targetX},${targetY}`;
  const blue = '#3b82f6';
  const endId = `${id}-rur-end`;

  return (
    <g>
      <defs>
        <marker id={endId} markerWidth="4" markerHeight="4" viewBox="0 0 4 4" refX="3.2" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={blue} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={style?.stroke || blue}
        strokeWidth={style?.strokeWidth || 2}
        markerEnd={`url(#${endId})`}
      />
    </g>
  );
}

// Straight blue edge with arrow end (replaces previous default styling)
function StraightBlueEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
  const d = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
  const blue = '#3b82f6';
  const endId = `${id}-sbe-end`;
  return (
    <g>
      <defs>
        <marker id={endId} markerWidth="4" markerHeight="4" viewBox="0 0 4 4" refX="3.2" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={blue} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={style?.stroke || blue}
        strokeWidth={style?.strokeWidth || 2}
        strokeLinecap="round"
        markerEnd={`url(#${endId})`}
      />
    </g>
  );
}
// Animated dashed bidirectional arrow (straight)
function DashedArrowBothEdge({ id, sourceX, sourceY, targetX, targetY, markerEnd, markerStart, style = {} }) {
  const grey = '#babdc5'; // gray-500
  const startId = `${id}-marker-start`;
  const endId = `${id}-marker-end`;

  // Shorten the path near both ends to avoid being covered by handle dots
  const offset = 6; // px
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const sx = sourceX + ux * (offset + 4);
  const sy = sourceY + uy * (offset + 4);
  const ex = targetX - ux * (offset - 4);
  const ey = targetY - uy * (offset - 4);
  const d = `M ${sx},${sy} L ${ex},${ey}`;

  return (
    <g>
      <defs>
        {/* Start arrow */}
        <marker id={startId} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" viewBox="0 0 4 4" refX="0" refY="2" orient="auto-start-reverse">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={grey} />
        </marker>
        {/* End arrow */}
        <marker id={endId} markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" viewBox="0 0 4 4" refX="4" refY="2" orient="auto">
          <path d="M 0 0 L 4 2 L 0 4 z" fill={grey} />
        </marker>
      </defs>
      <path
        id={id}
        d={d}
        fill="none"
        stroke={grey}
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeLinecap="butt"
        markerStart={`url(#${startId})`}
        markerEnd={`url(#${endId})`}
      >
        {/* <animate attributeName="stroke-dashoffset" from="2" to="22" dur="0.8s" repeatCount="indefinite" /> */}
      </path>
    </g>
  );
}
// DashedBlueNode: 自化忌
const DASHED_BLUE_WIDTH = 80;
const DASHED_BLUE_HEIGHT = 32;
function DashedBlueNode({ data }) {
    const handlesConfig = data?.handles || {
        left: "target",
        right: "source",
        top: null,
        bottom: null,
    };

    const color = "#3b82f6";
    const handleStyle = { width: 6, height: 6, borderRadius: 6, background: color, border: "1px solid #fff" };

    return (
        <div
            style={{
                width: DASHED_BLUE_WIDTH,
                height: DASHED_BLUE_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #93c5fd",
                borderRadius: 6,
                background: "#eff6ff",
                textAlign: "center",
            }}
        >
            {handlesConfig.top && <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />}
            {handlesConfig.right && <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />}
            {handlesConfig.bottom && <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />}
            {handlesConfig.left && <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />}
            <div style={{ fontWeight: 400, textAlign: "center", fontSize: "16px", lineHeight: "1.5" }}>{data.label}</div>
        </div>
    );
}

// PalaceNode: ellipse-like shape with fixed size and full rounding
const PALACE_WIDTH = 80;
const PALACE_HEIGHT = 40;
function PalaceNode({ data }) {
    const handlesConfig = data?.handles || {
        left: "target",
        right: "source",
        top: null,
        bottom: null,
    };

    const color = "#3b82f6";
    const handleStyle = { width: 6, height: 6, borderRadius: 6, background: color, border: "1px solid #fff" };

    return (
        <div
            style={{
                width: PALACE_WIDTH,
                height: PALACE_HEIGHT,
                borderRadius: 9999,
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
        >
            {handlesConfig.top && <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />}
            {handlesConfig.right && <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />}
            {handlesConfig.bottom && <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />}
            {handlesConfig.left && <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />}
            <div style={{ fontWeight: 400, textAlign: "center", fontSize: "16px", lineHeight: "1.5" }}>{data.label}</div>
        </div>
    );
}

// StarNode: rounded rectangle with fixed size
const STAR_WIDTH = 60;
const STAR_HEIGHT = 40;
function StarNode({ data }) {
    const handlesConfig = data?.handles || {
        left: "target",
        right: "source",
        top: null,
        bottom: null,
    };

    const color = "#3b82f6";
    const handleStyle = { width: 6, height: 6, borderRadius: 6, background: color, border: "1px solid #fff" };

    return (
        <div
            style={{
                width: STAR_WIDTH,
                height: STAR_HEIGHT,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
            }}
        >
            {handlesConfig.top && <Handle id="top" type={handlesConfig.top} position={Position.Top} style={handleStyle} />}
            {handlesConfig.right && <Handle id="right" type={handlesConfig.right} position={Position.Right} style={handleStyle} />}
            {handlesConfig.bottom && <Handle id="bottom" type={handlesConfig.bottom} position={Position.Bottom} style={handleStyle} />}
            {handlesConfig.left && <Handle id="left" type={handlesConfig.left} position={Position.Left} style={handleStyle} />}
            <div style={{ fontWeight: 600, textAlign: "center", fontSize: "14px", lineHeight: "1.5" }}>{data.label}</div>
        </div>
    );
}