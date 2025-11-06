// http://localhost:3000/flow?n=&g=0&c=0&y=2025&m=8&d=21&bt=3&lm=0

import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { astro } from "iztro";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, { Controls, Handle, Position, MarkerType, BaseEdge, useNodesState, useEdgesState, addEdge, Background } from "reactflow";

import { trimThenMergeWithMostFrequentTailThenFilterThenSort, findOppositePalaceRoutes } from "../../../../inauspicious-utils";
import { mergeSample } from "../../../utils";

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
        // console.log(selectedRoutes);
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

        // console.log(myAstrolabe);
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
            
        // console.log(mutagenStars);

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
        //// console.log(routes[rIndex])
        
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

    /* const [palacePairs, setPalacePairs] = useState([]);
    const [extendRoutes, setExtendRoutes] = useState([]);
    useEffect(() => {
        const {pairs, extendRoutes} = findOppositePalaceRoutes(simpleRoutes);
        setPalacePairs(pairs);
        setExtendRoutes(extendRoutes)
    },[simpleRoutes]) */

    const [updateCounter, setUpdateCounter] = useState(0);
    useEffect(() => {
        generateAstrolabe();
    }, [updateCounter]);

    const { n, g, c, y, m, d, bt, lm } = router.query;
    useEffect(() => {
        //// console.log(n, g, c, y, m, d, bt, lm);
        //// console.log(router.pathname);
        //// console.log(router.query);
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
        rightUpRight2: RightUpRightEdge2,
        rightUpRight3: RightUpRightEdge3,
        rightUpRight4: RightUpRightEdge4,
        dashedArrowBoth: DashedArrowBothEdge,
    }), []);

    const defaultEdgeOptions = useMemo(() => ({ type: "straightBlue" }), []);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        //const {allRoutes} = trimThenMergeWithMostFrequentTailThenFilterThenSort(selectedRoutes, simpleRoutes);
        const { pairs, extendRoutes } = findOppositePalaceRoutes(simpleRoutes);
        const allRoutes = mergeSample(selectedRoutes, extendRoutes);
        if (!allRoutes || allRoutes.length === 0) {
            setNodes([]);
            setEdges([]);
            return;
        }
        const { nodes: genNodes, edges: genEdges } = generateRoutes(allRoutes, simpleRoutes);
        const genNodes_ = genNodes.map((nodes) => {return {...nodes, data: {...nodes.data, isSelected: selectedHeads.includes(nodes.data.label) ? 1: selectedHeads2.includes(nodes.data.label) ? 2 : 0}}})
        setNodes(genNodes_);
        setEdges(genEdges);
    }, [selectedRoutes]);

    const onConnect = useCallback((params) => {
        setEdges((eds) => addEdge({ ...params, type: "straightBlue" }, eds));
    }, []);

    // ===== Bottom shortcut bar helpers =====
    const [selectedHeads, setSelectedHeads] = useState([]);
    const [selectedHeads2, setSelectedHeads2] = useState([]);
    const toggleRoute = (headingPalace) => {
        let selectedHeadsClone = [...selectedHeads]
        let sIndex = selectedHeadsClone.findIndex((item) => item === headingPalace)
        let selectedHeadsClone2 = [...selectedHeads2]
        let sIndex2 = selectedHeadsClone2.findIndex((item) => item === headingPalace)

        if (sIndex === -1 && sIndex2 > -1) {
            selectedHeadsClone2.splice(sIndex2, 1)
            setSelectedHeads2(selectedHeadsClone2)
        } else if (sIndex > -1 && sIndex2 === -1) {
            selectedHeadsClone.splice(sIndex, 1)
            setSelectedHeads(selectedHeadsClone)
            selectedHeadsClone2.push(headingPalace)
            setSelectedHeads2(selectedHeadsClone2)
        } else if (sIndex > -1 && sIndex2 > -1) {
            selectedHeadsClone.splice(sIndex, 1)
            setSelectedHeads(selectedHeadsClone)
            selectedHeadsClone2.splice(sIndex2, 1)
            setSelectedHeads2(selectedHeadsClone2)
        } else {
            selectedHeadsClone.push(headingPalace)
            setSelectedHeads(selectedHeadsClone)
        }
    }

    useEffect(() => {
        // console.log(selectedHeads,selectedHeads2)
        let targetRoutes = simpleRoutes.filter((route) => selectedHeads.includes((route[0])) || selectedHeads2.includes((route[0])) || route[0] === "生年忌")
        setSelectedRoutes(targetRoutes)
    }, [selectedHeads,selectedHeads2])

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
            <div className="container-flow" style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', alignItems: 'stretch', height: '100vh', padding: `8px 8px 100px`, boxSizing: 'border-box' }}>
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
                        <Controls showInteractive={false} position="bottom-right" style={{ display: 'flex', flexDirection: 'column', gap: 4 }} />
                    </ReactFlow>
                </div>
            </div>
            {/* Bottom shortcut bar */}
            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, background: '#fff', borderTop: '1px solid #e5e7eb', padding: 4, boxShadow: '0 -4px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, marginBottom: 2 }}>
                    {PALACE_BUTTONS.map(item => {
                        let active = selectedHeads.includes(item) || selectedHeads2.includes(item);
                        return (
                            <button
                                key={`sr-a-${item}`}
                                onClick={() => toggleRoute(item)}
                                style={{
                                    width: '100%',
                                    padding: '2px 4px 6px 4px',
                                    borderRadius: 6,
                                    border: `3px solid ${active ? selectedHeads.includes(item) ? '#93c5fd' : selectedHeads2.includes(item) ? '#fca5a5' : '#e5e7eb': '#e5e7eb'}` ,
                                    background:  active ? selectedHeads.includes(item) ? '#eff6ff' : selectedHeads2.includes(item) ? '#fff4f4' : '#f9fafb': '#f9fafb',
                                    color: '#111827',
                                    fontWeight: 400,
                                    fontSize: 20,
                                    cursor: 'pointer'
                                }}
                            >
                                {item[0] === "交" ? "友" : item[0]}
                            </button>
                        );
                    })}
                </div>
                {/* <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 8 }}>
                    {PALACE_B.map(item => {
                        let active = selectedHeads.includes(item);
                        return (
                            <button
                                key={`sr-a-${item}`}
                                onClick={() => toggleRoute(item)}
                                style={{
                                    width: '100%',
                                    padding: '10px 8px',
                                    borderRadius: 6,
                                    border: `3px solid ${active ? '#fca5a5' : '#e5e7eb'}` ,
                                    background:  active ? '#fff4f4' : '#f9fafb',
                                    color: '#111827',
                                    fontWeight: 400,
                                    cursor: 'pointer'
                                }}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div> */}
            </div>
            
        </>
    );
}

//////////////////////////////////////////////////////////////////////////////////////////
const PALACE_BUTTONS = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮","遷移宮",  "交友宮", "事業宮", "田宅宮", "福德宮", "父母宮"]
const PALACE_A = ["命宮", "福德宮", "遷移宮", "生年忌"]
const PALACE_B = ["兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "交友宮", "事業宮", "田宅宮", "父母宮"]

const STARS = ["太陽", "太陰", "巨門", "貪狼", "天機", "天同", "文昌", "文曲", "武曲", "廉貞"];
const PALACE_STAR_OFFSET = 40;
const STAR_PALACE_OFFSET = 2;
const ROW_OFFSET = 80;
function generateRoutes(allRoutes, rawRoutes) {
    try {

    console.log("start generateRoutes")
     console.log(allRoutes);
    if (allRoutes.length === 0) return [];
    

    // handle pairs
    let nodes = [];
    const edges = [];
    for (let i = 0; i < allRoutes.length; i++) {
        const routes = allRoutes[i];
        let startY = nodes.length > 0 ? Math.max(...nodes.map((node) => node.position.y)) + ROW_OFFSET * 2 : 0;

        console.log("checkpoint 1")

        for (let j = 0; j < routes.length; j++) {
            //console.log(routes[j])
            console.log("test")
            let x = 0;
            let y = startY + (j * ROW_OFFSET);
            
            for (let k = 0; k < routes[j].length; k++) {
                
                const comingNodeId = `g${i}r${j}-${k}-${routes[j][k]}`;
                const comingNodeType = routes[j][k].startsWith("自化") ? "dashedBlue" : STARS.includes(routes[j][k]) ? "star" : "palace";
                let existedNodeIndex = nodes.findLastIndex((node) => node.data.label === routes[j][k] && node.id.split("-")[0] !== comingNodeId.split("-")[0] && node.id.split("-")[1] !== "0");
                //console.log(existedNodeIndex)
                  //  console.log(comingNodeId)

                    if (existedNodeIndex > -1 && y === nodes[existedNodeIndex].position.y && x !== nodes[existedNodeIndex].position.x) {
                        // they are in the same row.but not the same x-position. so it is a repeated node but not the actually same node
                        existedNodeIndex = -1;
                    }
                

                if (existedNodeIndex > -1 && k !== 0 && comingNodeType !== "dashedBlue") {
                    const existedNode = nodes[existedNodeIndex];


                    /* if (existedNode.type === "dashedBlue" && existedNode.id.split("-")[0] !== comingNodeId.split("-")[0]) {
                        continue;
                    } */
                    if (existedNode.type === "palace" && k < routes[j].length - 1) {
                        nodes[existedNodeIndex].data.handles.right = "source";
                    }

                    const previousExistedNode = nodes[existedNodeIndex - 1];
                    const previousNode = nodes.findLast((node) => node.id.startsWith(comingNodeId.split("-")[0]));

                    if (previousNode.type === "star" && previousExistedNode.type === "star" && previousNode.data.label !== previousExistedNode.data.label ) {
                        // set the star to the bottom of the another star of the same palace.
                        // adjust the y-position of other following nodes
                        let partsOfPrevId = `${previousExistedNode.id.split("-")[0]}-${previousExistedNode.id.split("-")[1]}`
                        let count = nodes.filter((node) => node.id.startsWith(partsOfPrevId)).length;

                        nodes[nodes.length - 1].position.x = previousExistedNode.position.x;
                        nodes[nodes.length - 1].position.y = previousExistedNode.position.y + (STAR_HEIGHT * count);
                        nodes[nodes.length - 1].id = `${partsOfPrevId}-${nodes[nodes.length - 1].id.split("-")[2]}`

                        let originalY = nodes.find((node) => node.id.split("-")[0] === previousExistedNode.id.split("-")[0]).position.y;

                        let index = existedNodeIndex;
                        while (nodes[index].id.startsWith(partsOfPrevId.split("-")[0])) {
                            if (nodes[index].type === "dashedBlue") {
                                nodes[index].position.y =  nodes[index-1].position.y + 4;
                            }
                            if (nodes[index].type === "palace") {
                               // console.log(count)
                               // console.log(previousExistedNode.position.y)
                                nodes[index].position.y = previousExistedNode.position.y + (PALACE_HEIGHT * count) / (2);
                            }
                            if (nodes[index].type === "star") {
                                nodes[index].position.y = previousExistedNode.position.y  + (STAR_HEIGHT * count) / (2);
                            }
                            index++;
                        }
                        
                    }

                    x = existedNode.position.x;
                    y = existedNode.position.y;
                    x += comingNodeType === "star" ? STAR_WIDTH + STAR_PALACE_OFFSET : PALACE_WIDTH + PALACE_STAR_OFFSET;


                    // console.log(edges)
                    continue;
                }

                if (comingNodeType === "dashedBlue") {
                    y += 4;
                }


                let node = {
                    id: comingNodeId,
                    type: comingNodeType,
                    position: { x: x, y: y },
                    data: {
                        label: routes[j][k],
                        handles: {
                            left: comingNodeType === "star" ? "target" : comingNodeType === "dashedBlue" && nodes[nodes.length - 1].type === "palace" ? "target" : null,
                            right: comingNodeType === "palace" && k !== routes[j].length - 1 ? "source" : null,
                            top: null,
                            bottom: null,
                        },
                        isSpeciallyDashed: comingNodeType === "palace" && k === 0 && routes[j].length <= 3 && routes[j][routes[j].length - 1] === "自化忌" ? true : false,
                    }
                }
                nodes.push(node);

                /* if (comingNodeType === "star") {
                    let sourceId = nodes.findLast((node) => node.id.startsWith(comingNodeId.split("-")[0]) && node.type === "palace").id;
                    edges.push({
                        id: `g${i}r${j}-e${routes[j][k - 1]}-${routes[j][k]}`,
                        source: sourceId,
                        target: comingNodeId,
                        targetHandle: "left",
                    });
                } */


                x += comingNodeType === "star" ? STAR_WIDTH + STAR_PALACE_OFFSET : PALACE_WIDTH + PALACE_STAR_OFFSET;
                
            }
        }

        // debugging: remove all the nodes with the exactly the same position and label. keep the first one
        nodes = nodes.filter((node, index, self) =>
            index === self.findIndex((t) => t.position.x === node.position.x && t.position.y === node.position.y && t.data.label === node.data.label)
        );

        for (let j = 0; j < routes.length; j++) {
            for (let k = 0; k < routes[j].length; k++) {
                if (k === 0) {
                    // must be the head
                    let sourceNode = nodes.find((node) => node.data.label === routes[j][k] && node.id.split("-")[1] === "0" && node.data.handles.right === "source");
                    let targetNode = nodes.find((node) => node.data.label === routes[j][k + 1] && node.id.split("-")[1] !== "0" && node.data.handles.left === "target");
                    let edge = {
                        id: `g${i}r${j}-e${sourceNode.data.label}-${targetNode.data.label}`,
                        source: sourceNode.id,
                        target: targetNode.id,
                        //type: sourceNode.position.y !== targetNode.position.y ? "rightUpRight" : undefined,
                    }
                    if (sourceNode.position.y !== targetNode.position.y) {
                        edge.type = "rightUpRight";
                    }
                    edges.push(edge);
                }
                if (k > 0 && k < routes[j].length - 1 && !STARS.includes(routes[j][k])) {
                    // must not be the head
                    let sourceNode = nodes.find((node) => node.data.label === routes[j][k] && node.id.split("-")[1] !== "0" && node.data.handles.right === "source");
                    let targetNode = nodes.find((node) => node.data.label === routes[j][k + 1] && node.id.split("-")[1] !== "0" && node.data.handles.left === "target");

                    if (sourceNode && targetNode) {
                        if (sourceNode.id.split("-")[0] === targetNode.id.split("-")[0] && sourceNode.position.x > targetNode.position.x) {
                            // should be have a repeated node in the same group following
                            targetNode = nodes.findLast((node) => node.data.label === routes[j][k + 1] && node.id.split("-")[1] !== "0");
                        }

                        let edge = {
                            id: `g${i}r${j}-e${sourceNode.data.label}-${targetNode.data.label}`,
                            source: sourceNode.id,
                            target: targetNode.id,
                            //type: sourceNode.position.y !== targetNode.position.y ? "rightUpRight" : undefined,
                        }
                        if (sourceNode.position.y !== targetNode.position.y) {
                            edge.type = "rightUpRight";
                        }
                        edges.push(edge);
                    } else {
                        
                    }
                }
            }
        }
    }
    

   

    // handle extra dashedBlue
    for (let i = 0; i < allRoutes.length; i++) {
        let groupNodes = nodes.filter((node) => node.id.startsWith(`g${i}r`) && node.type === "dashedBlue");
        if (groupNodes.length <= 1) continue;

        let toHoldDashedBlueNode = groupNodes.sort((a, b) => b.position.x - a.position.y)[0];

        nodes = nodes.flatMap((node) => {
            if (node.id.split("r")[0] === toHoldDashedBlueNode.id.split("r")[0]) {
                if (node.type === "dashedBlue" && node.id !== toHoldDashedBlueNode.id) {
                    return []
                } 
                return [node];
            } else {
                return [node];
            }
        });

    }

    
    // Check the count of stars of the same palace
        let starNodes = nodes.filter((node) => node.type === "star");
        for (let i = 0; i < starNodes.length; i++) {
            let starCountId = starNodes[i].id.split("-")[0] + "-" + starNodes[i].id.split("-")[1];
            let starNodesWithSamePalace = starNodes.filter((node) => node.id.startsWith(starCountId));

            let starIndexCount = 1;
            if (starNodesWithSamePalace.length > 1) {
                starIndexCount = starNodesWithSamePalace.findIndex((node) => node.id === starNodes[i].id) + 1;
                if (starIndexCount > 1 && starIndexCount < 5) {
                    // starIndex < 5 for some prevention, have not prepared many rightUpRight edges
                    for (let j = 0; j < edges.length; j++) {
                        if (edges[j].target === starNodes[i].id && edges[j].type === "rightUpRight") {
                            edges[j].type = `rightUpRight${starIndexCount}`;
                        }
                    }
                }
            } 

            let targetNodeIndex = nodes.findIndex((node) => node.id === starNodes[i].id);
            nodes[targetNodeIndex].data.starCount = starIndexCount;
        }
        console.log("checkpoint 2")
    // shift x-position to the left if there is failure of rightUpRight Edge
    for (let i = 0; i < edges.length; i++) {
        if (edges[i].type && edges[i].type.startsWith("rightUpRight") && edges[i].source.split("-")[1] > edges[i].target.split("-")[1]) {

            const sourceNodeIndex = nodes.findIndex((node) => node.id === edges[i].source);
            const targetNodeIndex = nodes.findIndex((node) => node.id === edges[i].target);
            console.log("checkpoint 3")

            let maxtry = 10;
            let tryCount = 0;
            console.log(nodes[sourceNodeIndex].id)
            console.log(nodes[targetNodeIndex].id)
           
            while (nodes[targetNodeIndex].position.x < nodes[sourceNodeIndex].position.x && 
                nodes[targetNodeIndex].id.split("-")[0] !== nodes[sourceNodeIndex].id.split("-")[0] &&
                
                tryCount < maxtry) {

                console.log("checkpoint 4")
                console.log(nodes[targetNodeIndex].position.x, nodes[sourceNodeIndex].position.x)
                nodes = nodes.flatMap((node) => {
                    if (node.id.startsWith(nodes[sourceNodeIndex].id.split("-")[0])) {
                        node.position.x -= (PALACE_WIDTH + PALACE_STAR_OFFSET + STAR_PALACE_OFFSET + STAR_WIDTH);
                        return node;
                    } else {
                        return node;
                    }
                });
                //nodes[sourceNodeIndex].position.x -= (PALACE_WIDTH + PALACE_STAR_OFFSET + STAR_PALACE_OFFSET + STAR_WIDTH);
                tryCount++;
            }

        }
    }

    console.log("checkpoint 5")
    const { pairs, extendRoutes } = findOppositePalaceRoutes(rawRoutes);

    // handle pairs
    for (let i = 0; i < pairs.length; i++) {
        let firstNodes = nodes.filter((node) => node.data.label === pairs[i][0]);
        let secondNodes = nodes.filter((node) => node.data.label === pairs[i][1]);
        
        if (firstNodes.length === 0 || secondNodes.length === 0) continue;
        // Make sure the selected nodes not the head if there are multiple selections
        if (firstNodes.length > 1) {
            const firstNodes_ = firstNodes.filter((node) => node.id.split("-")[1] !== "0");
            if (firstNodes_.length === 0) firstNodes = firstNodes[0]; else firstNodes = firstNodes_;
        }
        if (secondNodes.length > 1) {
            const secondNodes_ = secondNodes.filter((node) => node.id.split("-")[1] !== "0");
            if (secondNodes_.length === 0) secondNodes = secondNodes[0]; else secondNodes = secondNodes_;
        }

        // if same group, skip
        if (firstNodes[0].id.split("r")[0] === secondNodes[0].id.split("r")[0]) {
            continue;
        }

        let firstNodeIndex = nodes.findIndex((node)=> node === firstNodes[0]);
        let secondNodeIndex = nodes.findIndex((node)=> node === secondNodes[0]);
        // if is head, check is there any 自化忌 following
        if (firstNodes[0].id.split("-")[1] === "0") {
            let targetIndex = firstNodeIndex + 2;
            if (!nodes[targetIndex] || nodes[targetIndex].data.label !== "自化忌") continue;
        }
        if (secondNodes[0].id.split("-")[1] === "0") {
            let targetIndex = secondNodeIndex + 2;
            if (!nodes[targetIndex] || nodes[targetIndex].data.label !== "自化忌") continue;
        }
        // all checked, add the edge.
        if (firstNodeIndex < secondNodeIndex) {
            // firstNode at top. secondNode at bottom
            nodes[firstNodeIndex].data.handles.bottom = "source";
            nodes[secondNodeIndex].data.handles.top = "target";
            edges.push({
                id: `g${i}r1-e${firstNodes[0].data.label}-${secondNodes[0].data.label}`,
                source: nodes[firstNodeIndex].id,
                target: nodes[secondNodeIndex].id,
                sourceHandle: "bottom",
                targetHandle: "top",
                type: "dashedArrowBoth",
            });
        } else {
             // firstNode at bottom. secondNode at top
             nodes[secondNodeIndex].data.handles.bottom = "source";
             nodes[firstNodeIndex].data.handles.top = "target";
             edges.push({
                 id: `g${i}r1-e${secondNodes[0].data.label}-${firstNodes[0].data.label}`,
                 source: nodes[secondNodeIndex].id,
                 target: nodes[firstNodeIndex].id,
                 sourceHandle: "bottom",
                 targetHandle: "top",
                 type: "dashedArrowBoth",
             });
        }

    }

    // handle extend
    for (let i = 0; i < allRoutes.length; i++) {
        let groupNodes = nodes.filter((node) => node.id.startsWith(`g${i}r`));
        let clonedNodes = [...groupNodes];
        clonedNodes.sort((a, b) => b.position.x - a.position.x);
        const tailNode = clonedNodes[0];
        const toExtend = extendRoutes.find((exRoute) => exRoute[0] === tailNode.data.label);
        if (toExtend) {
           // console.log(toExtend)
           let targetOriginalNodeIndex = nodes.findIndex((node) => node.id === tailNode.id);
           nodes[targetOriginalNodeIndex].data.handles.right = "source";
           const finalToExtend = toExtend.flatMap((extend, exIndex) => {
            if (exIndex === 0) return [];
            else {
                let type = STARS.includes(extend) ? "star" : "palace";
                let x = type === "star" ? tailNode.position.x + PALACE_WIDTH + PALACE_STAR_OFFSET : tailNode.position.x + PALACE_WIDTH + PALACE_STAR_OFFSET + STAR_WIDTH + STAR_PALACE_OFFSET
                let y = tailNode.position.y + Math.floor(ROW_OFFSET/4);
                return [
                    {
                        id: `ex-g${i}-${extend}`,
                        type: type,
                        position: { x: x, y: y},
                        data: {
                            label: extend,
                            handles: {
                                left: type === "star" ? "target" : null,
                                right: null,
                                top: null,
                                bottom: null,
                            },
                        },
                    }
                ]
            }
        })
        edges.push({ id: `ex-g${i}-e${nodes[targetOriginalNodeIndex].data.label}-${finalToExtend[0].data.label}`, source: nodes[targetOriginalNodeIndex].id, target: finalToExtend[0].id, targetHandle: "left" });
            nodes.push(...finalToExtend);
        }
    }


    // handle extendRoutes
    /* const tailItems = routes.map((route) => route[route.length - 1]);
    const distinctTails = [...new Set(tailItems)];




    for (let i = 0; i < distinctTails.length; i++) {
        const toExtend = extendRoutes.find((exRoute) => exRoute[0] === distinctTails[i])
        if (toExtend) {
            // if the extend route is already in the routes, skip
            if (isOrderedContiguousInAny(routes, toExtend)) continue;

            let targetOrignalNodes = nodes.filter((item) => item.data.label === distinctTails[i]);
            // console.log(targetOrignalNodes)
            if (targetOrignalNodes.length === 0) continue;
            if (targetOrignalNodes.length > 1) {
                targetOrignalNodes = targetOrignalNodes.filter((item) => item.id.startsWith("r") && item.id.split("-")[1] !== "0");
            }
            const targetOriginalNodesIndex = nodes.findIndex((node)=> node === targetOrignalNodes[0]);
            nodes[targetOriginalNodesIndex].data.handles.right = "source";

            const finalToExtend = toExtend.flatMap((extend, exIndex) => {
                if (exIndex === 0) return [];
                else {
                    let type = STARS.includes(extend) ? "star" : "palace";
                    let x = type === "star" ? targetOrignalNodes[0].position.x + PALACE_WIDTH + PALACE_STAR_OFFSET : targetOrignalNodes[0].position.x + PALACE_WIDTH + PALACE_STAR_OFFSET + STAR_WIDTH + STAR_PALACE_OFFSET
                    let y = targetOrignalNodes[0].position.y + Math.floor(ROW_OFFSET/4);
                    return [
                        {
                            id: `ex-${i}-${extend}`,
                            type: type,
                            position: { x: x, y: y},
                            data: {
                                label: extend,
                                handles: {
                                    left: type === "star" ? "target" : null,
                                    right: null,
                                    top: null,
                                    bottom: null,
                                },
                            },
                        }
                    ]
                }
            })

            edges.push({ id: `ex${i}-e${nodes[targetOriginalNodesIndex].data.label}-${finalToExtend[0].data.label}`, source: nodes[targetOriginalNodesIndex].id, target: finalToExtend[0].id, targetHandle: "left" });
            nodes.push(...finalToExtend);
        }
    } */

     console.log(nodes)
     console.log(edges)
    return { nodes, edges };
} catch (error) {
    console.log(error)
    return { nodes: [], edges: [] };
}
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
  const horizontalOffset = 18; // final right width
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

function RightUpRightEdge2({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
    const horizontalOffset = 21; // final right width
    // Swap widths: first horizontal goes to (targetX - horizontalOffset), last horizontal = horizontalOffset
    const p1x = targetX - horizontalOffset;
    const p1y = sourceY;
    const p2x = p1x;
    const p2y = targetY; // vertical segment to align with target Y (up/down as needed)
    const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${targetX},${targetY}`;
    const blue = '#0950c3';
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

  function RightUpRightEdge3({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
    const horizontalOffset = 18; // final right width
    // Swap widths: first horizontal goes to (targetX - horizontalOffset), last horizontal = horizontalOffset
    const p1x = targetX - horizontalOffset;
    const p1y = sourceY;
    const p2x = p1x;
    const p2y = targetY; // vertical segment to align with target Y (up/down as needed)
    const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${targetX},${targetY}`;
    const blue = '#0b64f4';
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

  function RightUpRightEdge4({ id, sourceX, sourceY, targetX, targetY, markerEnd, style = {} }) {
    const horizontalOffset = 15; // final right width
    // Swap widths: first horizontal goes to (targetX - horizontalOffset), last horizontal = horizontalOffset
    const p1x = targetX - horizontalOffset;
    const p1y = sourceY;
    const p2x = p1x;
    const p2y = targetY; // vertical segment to align with target Y (up/down as needed)
    const d = `M ${sourceX},${sourceY} L ${p1x},${p1y} L ${p2x},${p2y} L ${targetX},${targetY}`;
    const blue = '#073c92';
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
            <div style={{ fontWeight: 400, textAlign: "center", fontSize: "16px", lineHeight: "1.5" }}>{`自化忌出`}</div>
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

    const border = data.label === "生年忌" ? "3px solid #93c5fd" :
                 data.isSelected !== 0 ? 
                    data.isSelected === 1 ? data.isSpeciallyDashed ? "2px dashed #93c5fd" : "3px solid #93c5fd" : 
                    data.isSelected === 2 ? data.isSpeciallyDashed ? "2px dashed #fca5a5" : "3px solid #fca5a5" : 
                "1px solid #e5e7eb" :
                "1px solid #e5e7eb";


    return (
        <div
            style={{
                width: PALACE_WIDTH,
                height: PALACE_HEIGHT,
                borderRadius: 9999,
                border:border,
                background: data.label === "生年忌" ? "#eff6ff" : data.isSelected !== 0 ? data.isSelected === 1 ? "#eff6ff" : data.isSelected === 2 ? "#fff4f4" : "#fff": "#fff",
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

// Subarray check helper function
const isOrderedContiguousInAny = (list, target) =>
    list.some(sub => {
      if (target.length === 0) return true;
      for (let i = 0; i <= sub.length - target.length; i++) {
        let ok = true;
        for (let j = 0; j < target.length; j++) {
          if (sub[i + j] !== target[j]) { ok = false; break; }
        }
        if (ok) return true;
      }
      return false;
    });