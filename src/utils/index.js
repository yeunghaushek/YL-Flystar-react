//import {  STARS } from "@/samples";
import { mergeOnOverlap, removeDuplicatesAndSubsets, removeArraysWithSameDistinct, unionArrays, sortArraysByLengthDesc, sortArraysByTailSimilarity, sortArraysByHeadSimilarityIgnoringFirst, sortArraysByHeadThenTail } from "./merge";
const STARS = ["太陽", "太陰", "巨門", "貪狼", "天機", "天同", "文昌", "文曲", "武曲", "廉貞"];
// distinct Helper
function onlyUnique(value, index, array) {
    return array.indexOf(value) === index;
}

// Star Palace Map Helper
/* function getStarPalaceMap(chartNumber) {
    const chart = getChart(chartNumber);
    const starPalaceMap = new Map();
    for (const route of chart) {
        for (let i = 0; i < route.length; i++) {
            if (STARS.includes(route[i])) {
                starPalaceMap.set(route[i], route[i+1]);
            }
        }
    }
    //console.log(starPalaceMap);
    return starPalaceMap;
} */

// Get Most Frequent Star Helper
/**
 * 
 * [
        [ '疾厄宮', '文曲', '財帛宮', '天同', '疾厄宮' ],
        [ '財帛宮', '天同', '疾厄宮', '文曲', '財帛宮' ],
        [ '夫妻宮', '武曲', '財帛宮', '天同', '疾厄宮' ],
        [ '交友宮', '文曲', '財帛宮', '天同', '疾厄宮' ]
    ];
 */
export function getMostFrequentStarPalace(routesGroup, starPalaceMap) {
    if (!Array.isArray(routesGroup)) {
        return { stars: [], count: 0 };
    }

    const frequencyMap = {};

    for (const route of routesGroup) {
        if (!Array.isArray(route)) {
            continue;
        }
        for (const name of route) {
            if (!STARS.includes(name)) {
                continue;
            }
            frequencyMap[name] = (frequencyMap[name] || 0) + 1;
        }
    }

    let maxCount = 0;
    for (const count of Object.values(frequencyMap)) {
        if (count > maxCount) {
            maxCount = count;
        }
    }

    const starsWithMaxCount = Object.entries(frequencyMap)
        .filter(([, count]) => count === maxCount)
        .map(([star]) => ({ star, palace: starPalaceMap.get(star), count: maxCount }));

      //  console.log(starsWithMaxCount);

    return  starsWithMaxCount
}

export function getPalaceGroup(sample) {
    //const chart = getChart(chartNumber);
    let chart = sample;
    const palacesGroup = [];
    /* let onlyInHeads = chart.map((route) => route[0]);
    for (let i = 0; i < chart.length; i++) {
        for (let j = 1; j < chart[i].length - 1; j++) {
            if (chart[i][j].endsWith("宮")) {
                onlyInHeads = onlyInHeads.filter((head) => head !== chart[i][j]);
            }
        }
    } */
   let specialIndex = chart.findIndex((route) => route[route.length - 1] === "自化忌");
   if (specialIndex !== -1) {
     let targetRouteIndex = chart.findIndex((route) => route[route.length - 1] === chart[specialIndex][0]);
     if (targetRouteIndex !== -1) {
        chart[targetRouteIndex] = [...chart[targetRouteIndex], ...chart[specialIndex].slice(1)];
     }
   }

    for (const route of chart) {
        let filteredRoute = route.flatMap((item, index) => {
            /* if (index === 0 && item.endsWith("宮")) {
                onlyInHeads.push(item);
                //console.log(onlyInHeads);
            } */
            if (STARS.includes(item)) {
                return [];
            }
            if (item === "自化忌") {
                if (STARS.includes(route[index - 2])) {
                    return [];
                }
                return [route[index - 2]]
            }
            // A -> B
            if (index > 0 && index < route.length - 1) {
                return [route[index - 2], item]
            }
            // B -> C, B is another route A
            if (index === route.length - 1) {
                if (chart.find((r) => r[0] === route[index - 2])) {
                    return [route[index - 2], item]
                }
                let t1 = chart.find((r) => r.length > 5 && r[r.length - 5] === item);
                if (t1) {
                    return [t1[t1.length - 5], item]
                }
                let t2 = chart.find((r) => r.length > 3 && r[r.length - 3] === item);
                if (t2) {
                    return [t2[t2.length - 3], item]
                }
            }

            // C is another route C
            if (index === route.length - 1) {
                //console.log(item);
                let tIndex = chart.findIndex((r) => r[r.length - 1] === item && r[0] !== route[0] && r[0] !== "生年忌" && route[0] !== "生年忌");
                //console.log(chart[tIndex]);
                if (tIndex !== -1 && tIndex !== index) {
                    return [item]
                }
            }




            return [];
            /* if (index === route.length - 1 && onlyInHeads.includes(item)) {
                return [];
            } */
            /* if (index !== 0 && onlyInHeads.includes(item)) {
                onlyInHeads = onlyInHeads.filter((head) => head !== item);
            } */
            //return [item];
        });

        if (palacesGroup.length === 0) {
            palacesGroup.push(filteredRoute);
        } else {
            let found = false;
            for (const palaces of palacesGroup) {
                if (palaces.some((palace) => filteredRoute.includes(palace) && palace !== "自化忌")) {
                    palaces.push(...filteredRoute);
                    found = true;
                    break;
                }
            }
            if (!found) {
                palacesGroup.push(filteredRoute);
            }
        }
    }

    for (let i = 0; i < palacesGroup.length; i++) {
        palacesGroup[i] = palacesGroup[i].filter(onlyUnique);
    }

    //console.log(onlyInHeads);
   

    return unionArrays(palacesGroup);
}

const PALACE_SORT_ORDER = [
    "生年忌",
    "命宮",
    "福德宮",
    "遷移宮",
    "兄弟宮",
    "夫妻宮",
    "子女宮",
    "財帛宮",
    "疾厄宮",
    "交友宮",
    "事業宮",
    "田宅宮",
    "父母宮"
];

function sortRoutes(routes) {
    const orderIndexMap = new Map(PALACE_SORT_ORDER.map((name, idx) => [name, idx]));
    return routes.sort((a, b) => {
        const aHead = Array.isArray(a) && a.length > 0 ? a[0] : "";
        const bHead = Array.isArray(b) && b.length > 0 ? b[0] : "";
        const aIdx = orderIndexMap.has(aHead) ? orderIndexMap.get(aHead) : Number.MAX_SAFE_INTEGER;
        const bIdx = orderIndexMap.has(bHead) ? orderIndexMap.get(bHead) : Number.MAX_SAFE_INTEGER;
        if (aIdx !== bIdx) {
            return aIdx - bIdx;
        }
        return a.length - b.length;
    });
}

function mergeRoutes(routes, k, strongRoutes) {
    //console.log("mergeRoutes");
    //console.log(routes);
    if (routes.length === 1) {
        return routes;
    }
    let mergedRoutes = [];
    for (let x = 0; x < routes.length; x++) {
        let found = false;
        for (let y = 0; y < routes.length; y++) {
            if (x !== y) {
                const merged = mergeOnOverlap(routes[x], routes[y], k);
                if (merged) {
                    mergedRoutes.push(merged);
                    found = true;
                }
            }
        }
        if (!found) {
            mergedRoutes.push(routes[x]);
        }
    }
    if (mergedRoutes.length === 0) {
        return routes;
    }
    //console.log(mergedRoutes);
    /* if (strongRoutes && strongRoutes.length > 0 && !mergedRoutes.find((route) => route[0] === strongRoutes[0][0])) {
        mergedRoutes.push(strongRoutes[0]);
    } */
    return removeDuplicatesAndSubsets(mergedRoutes);
}

export function mergeSample(sample, extendRoutes) {
    //const palacesGroup = getPalaceGroup(chartNumber);

    let sample_ = [...sample];
    
    if (extendRoutes && extendRoutes.length > 0) {
        for (let j = 0; j < extendRoutes.length; j++) {
            
            for (let k = 0; k < sample_.length; k++) {
                if (sample_[k].length > 2 &&sample_[k][sample_[k].length - 1] === extendRoutes[j][2] && sample_[k][sample_[k].length - 3] === extendRoutes[j][0]) {
                    sample_[k] = sample_[k].slice(0, sample_[k].length - 2);
                }
            }
        }
    }

    const palacesGroup = getPalaceGroup(sample_)
    console.log(palacesGroup);


    const routesGroup = palacesGroup.map((palaces) => {
        return palaces.flatMap((palace) => {
            let sIndex = sample_.findIndex((route) => route[0] === palace);
            if (sIndex !== -1) {
                return [sample_[sIndex]];
            }
            return [];
        });
    });
    //console.log(routesGroup);
    let finalRoutes = [];
    for (let i = 0; i < routesGroup.length; i++) {

        // special case handling
     /* let specialCaseIndex = routesGroup[i].findIndex((route) => route[0] === "生年忌" && route[route.length - 1] === "自化忌" && route.length < 5)
     if (specialCaseIndex !== -1) {
         finalRoutes.push([routesGroup[i][specialCaseIndex]]);
         continue;
     } */
        let specialCaseIndex = routesGroup[i].findIndex((route) => route.length === 4);
        if (specialCaseIndex !== -1) {
            routesGroup[i][specialCaseIndex] = [...routesGroup[i][specialCaseIndex].slice(0, 3), routesGroup[i][specialCaseIndex][1], routesGroup[i][specialCaseIndex][3]];
            console.log(routesGroup[i][specialCaseIndex]);
        }
        

        let sorted = sortRoutes(routesGroup[i]);
        let distinctRoutes = removeArraysWithSameDistinct(sorted);
        let strongRoutes = distinctRoutes.filter((route) => route[0] === route[route.length - 1]);

        //console.log(distinctRoutes);
        
        if (strongRoutes.length > 0) {
            for (let j = 0; j < distinctRoutes.length; j++) {
                let targetIndex = distinctRoutes[j].findIndex((item) => item === strongRoutes[0][0]);
                if (targetIndex > 0) {
                    distinctRoutes[j] = distinctRoutes[j].slice(0, targetIndex + 1);
                }
            }
            //mergedRoutes = mergeRoutes(mergedRoutes, 5);
        }

        let mergeNumber = 3;
        let mergeFinished = false;
        // default. not yet merged
        let mergedRoutes = distinctRoutes;

        //console.log(mergedRoutes);

        //console.log(mergedRoutes);

        while (!mergeFinished) {
            /* if (mergeNumber === 3) {
                console.log(mergeNumber);
                console.log(mergedRoutes);
            } */
           
            let mergedRoutes_ = mergeRoutes(mergedRoutes, mergeNumber, strongRoutes);
            
            /* if (mergeNumber === 3) {
                console.log(mergedRoutes_);
            } */
            if (mergedRoutes_.length === mergedRoutes.length) {
                // second Check Strong Routes
                mergeFinished = true;
                mergedRoutes = sortRoutes(mergedRoutes_);
                //console.log(mergedRoutes);

                let strongRoutes_ = mergedRoutes.filter((route) => route[0] === route[route.length - 1]);
                if (strongRoutes_.length > 0) {
                    strongRoutes = strongRoutes_;
                    for (let j = 0; j < mergedRoutes.length; j++) {
                        let targetIndex = mergedRoutes[j].findIndex((item) => item === strongRoutes[0][0]);
                        if (targetIndex > 0 && targetIndex + 1 < mergedRoutes[j].length) {
                            mergedRoutes[j] = mergedRoutes[j].slice(0, targetIndex + 1);
                           
                            // something updated. try again
                            mergeFinished = false;
                            
                        } 
                    }
                }
            } else {
                mergeNumber = mergeNumber + 2;
                mergedRoutes = mergedRoutes_;
            }
        }

        
        // connect the final B -> C, but the expected raw A is not selected
        /* let mergedRoutes_ = [];
        if (mergedRoutes.length > 1) {
            for (let j = 0; j < mergedRoutes.length; j++) {
                let found = false;
                for (let k = 0; k < mergedRoutes.length; k++) {
                    if (j !== k) {
                        if (mergedRoutes[j][mergedRoutes[j].length - 1] === mergedRoutes[k][mergedRoutes[k].length - 3]) {
                            mergedRoutes_.push([...mergedRoutes[j], ...mergedRoutes[k].slice(3)]);
                            found = true;
                        }
                    }
                }
                if (!found) {
                    mergedRoutes_.push(mergedRoutes[j]);
                }
            }
        } */

        // Last Sort
        mergedRoutes = sortArraysByHeadThenTail(mergedRoutes);
        
        //console.log(mergedRoutes);
        //console.log("--------------------------------");
        finalRoutes.push(mergedRoutes);
    }

    finalRoutes = sortArraysByLengthDesc(finalRoutes);

    return finalRoutes;
}





/* export function getStrongTail(sample, chartNumber) {
    if (sample.length === 0) {
        return [];
    }
    const palacesGroup = getPalaceGroup(chartNumber);
    const routesGroup = palacesGroup.map((palaces) => {
        return palaces.flatMap((palace) => {
            let sIndex = sample.findIndex((route) => route[0] === palace);
            if (sIndex !== -1) {
                return [sample[sIndex]];
            }
            return [];
        });
    });
    //console.log(routesGroup);

    const tailsOfRoutesGroup = routesGroup.flatMap((routes) => {
        // Rule 1. 自化忌
        const self = routes.filter((route) => route[route.length - 1] === "自化忌");
        if (self.length > 0) {
            return ["自化忌"];
        }
        
        // Rule 2. 頭宮 === 尾宮
        
        const starPalaceMap = getStarPalaceMap(chartNumber);
        const mostFrequentStarPalaces = getMostFrequentStarPalace(routes, starPalaceMap).map((starPalace) => starPalace.palace);

        const loopingPalacesRoutes = routes.filter((route) => route[0] === route[route.length - 1]);

        if (loopingPalacesRoutes.length === 1) {
            return [loopingPalacesRoutes[0][0]];
        }  else if (loopingPalacesRoutes.length > 1) {
            const commonLoopingPalacesRoutes = loopingPalacesRoutes.filter((route) => ["命宮", "福德宮", "遷移宮"].includes(route[0]));
            if (commonLoopingPalacesRoutes.length === 1) {
                return [commonLoopingPalacesRoutes[0][0]];
            } else if (commonLoopingPalacesRoutes.length > 1) {
                const starPalaces = getMostFrequentStarPalace(commonLoopingPalacesRoutes, starPalaceMap).map((starPalace) => starPalace.palace);
                return [starPalaces[0]];
            } else {
                const starPalaces = getMostFrequentStarPalace(loopingPalacesRoutes, starPalaceMap).map((starPalace) => starPalace.palace);
                // looping x overall highest frequency
                const target = starPalaces.filter((starPalace => mostFrequentStarPalaces.includes(starPalace)));
                if (target.length > 0) {
                    return [target[0]];
                } else {
                    return [starPalaces[0]];
                }
                
            }
        } else {
            return []
        }
        
        
        /* else if (mostFrequentStarPalaces.length > 1) {
            const target = ["命宮", "福德宮", "遷移宮"].filter((starPalace => mostFrequentStarPalaces.includes(starPalace)));
            if (target.length > 0) {
                return [target[0]];
            } else {
                return [mostFrequentStarPalaces[0]];
            }
        } else {
            return [mostFrequentStarPalaces[0]];
        }


    });

    console.log(tailsOfRoutesGroup);
    return routesGroup;

}; */