/**
 * 生命檔案 · 專屬身份與決策引擎 Rule Engine
 * calculateIdentity(astroData) → 決策模式 + 形容詞 + 名詞
 */

import {
  getJiZhuanJiEntries,
  getLuZhuanJiEntries,
} from "@/lib/auspiciousChain";

const ROOT_PALACES = ["命宮", "福德宮"];
const STORAGE_PALACES = new Set(["田宅宮", "兄弟宮", "疾厄宮"]);
/** 狀態顯化落點 */
const STATE_MANIFEST_PALACES = new Set(["父母宮", "遷移宮"]);
/** 孤僻：命／福德化忌或轉忌落點（不含子女） */
const LONER_TARGETS = new Set(["田宅宮", "兄弟宮", "疾厄宮"]);
/** 生年忌：坐守或轉忌落點（含遷移，不含子女） */
const BIRTH_JI_TARGETS = new Set(["田宅宮", "兄弟宮", "疾厄宮", "遷移宮"]);
const DETAIL_STARS = new Set(["天機", "文昌", "文曲"]);

export const DECISION_ENGINE = {
  composite: { id: "composite", emoji: "🧬", label: "複合型", hint: "雙軌齊備" },
  assault: { id: "assault", emoji: "💥", label: "蓄勢型", hint: "潛藏顯打" },
  guerrilla: { id: "guerrilla", emoji: "🛰️", label: "試探型", hint: "潛打顯藏" },
  agile: { id: "agile", emoji: "⚡", label: "敏捷型", hint: "快決策" },
  strategic: { id: "strategic", emoji: "♟️", label: "謀略型", hint: "慢決策" },
  balanced: { id: "balanced", emoji: "⚖️", label: "均衡型", hint: "一般型" },
  iterative: { id: "iterative", emoji: "⚔️", label: "實戰型", hint: "先快後慢" },
  sniper: { id: "sniper", emoji: "🎯", label: "狙擊型", hint: "先慢後快" },
};

export const ADJECTIVES = {
  strategic: { id: "strategic", label: "策略", en: "Strategic" },
  focused: { id: "focused", label: "專注", en: "Focused" },
  pioneering: { id: "pioneering", label: "開拓", en: "Pioneering" },
  adaptive: { id: "adaptive", label: "彈性", en: "Adaptive" },
};

export const NOUNS = {
  architect: { id: "architect", label: "佈局家" },
  planner: { id: "planner", label: "策劃家" },
  observer: { id: "observer", label: "觀察家" },
  influencer: { id: "influencer", label: "影響家" },
  connector: { id: "connector", label: "連結家" },
  director: { id: "director", label: "主導家" },
  independent: { id: "independent", label: "獨立家" },
  integrator: { id: "integrator", label: "整合家" },
};

function findPalace(palaces, name) {
  return palaces.find((p) => p.name === name) || null;
}

function findPalaceOfStar(palaces, starName) {
  if (!starName) return null;
  for (const p of palaces) {
    const stars = [...(p.majorStars || []), ...(p.minorStars || [])];
    if (stars.some((s) => s.name === starName)) return p.name;
  }
  return null;
}

function findBirthJi(palaces) {
  for (const p of palaces) {
    const stars = [...(p.majorStars || []), ...(p.minorStars || [])];
    const star = stars.find((s) => s.mutagen === "忌");
    if (star) return { palaceName: p.name, starName: star.name };
  }
  return null;
}

function uniqueNames(list) {
  return [...new Set(list.filter(Boolean))];
}

function getOppositePalaceName(palaces, palaceName) {
  const idx = palaces.findIndex((p) => p.name === palaceName);
  if (idx < 0) return null;
  return palaces[(idx + 6) % 12]?.name || null;
}

/**
 * 只追「本宮化忌轉忌」鏈（不含化祿轉忌、不含他宮忌入）。
 *
 * 忌出（顯化）三種：
 * 1) 自化忌出：僅直接 A→A；A→B→A 不算
 * 2) 投射顯化：化忌／轉忌入「來時宮」對宮，或入本宮對宮
 *    例：命→交友→交友對宮(兄弟)；福→財帛；福→B→財帛
 * 3) 狀態顯化：化忌／轉忌入父母宮或遷移宮
 *
 * Special case（轉忌落點 C）：
 * - C 有自化忌出 → 也算忌出
 * - C 化忌到 C 的對宮 → 也算忌出（由下一跳的投射顯化承接）
 *
 * 鏈長上限：本宮 → B → C（兩跳即停）
 */
function analyzeRootSignals(palaces, rootName) {
  const root = findPalace(palaces, rootName);
  if (!root) {
    return {
      hasManifestation: false,
      hasStorage: false,
      firstEvent: null,
      storageTargets: [],
      routeLandings: [],
      manifestNotes: [],
      routes: [],
    };
  }

  let hasManifestation = false;
  let hasStorage = false;
  let firstEvent = null;
  const storageTargets = [];
  const routeLandings = [];
  const manifestNotes = [];
  const rootOpposite = getOppositePalaceName(palaces, rootName);

  const mark = (event) => {
    if (!firstEvent) firstEvent = event;
  };

  const noteManifest = (text) => {
    hasManifestation = true;
    mark("manifest");
    if (text) manifestNotes.push(text);
  };

  const noteStorage = (palaceName) => {
    if (!STORAGE_PALACES.has(palaceName) || palaceName === rootName) return;
    hasStorage = true;
    storageTargets.push(palaceName);
    mark("storage");
  };

  const jiStar = root.mutagenStars?.[3];
  if (!jiStar) {
    return {
      hasManifestation,
      hasStorage,
      firstEvent,
      storageTargets: uniqueNames(storageTargets),
      routeLandings: uniqueNames(routeLandings),
      manifestNotes: uniqueNames(manifestNotes),
      routes: [],
    };
  }

  let currentName = findPalaceOfStar(palaces, jiStar);
  if (!currentName) {
    return {
      hasManifestation,
      hasStorage,
      firstEvent,
      storageTargets: uniqueNames(storageTargets),
      routeLandings: uniqueNames(routeLandings),
      manifestNotes: uniqueNames(manifestNotes),
      routes: [],
    };
  }

  const route = [rootName];
  const visited = new Set();
  let fromName = rootName;
  let hop = 0;
  // 只追 命→B→C（兩跳）；例：命→父母→夫妻
  const MAX_HOPS = 2;

  while (currentName && hop < MAX_HOPS) {
    hop += 1;
    const stepKey = `${fromName}->${currentName}`;
    if (visited.has(stepKey)) break;
    visited.add(stepKey);

    route.push(currentName);
    routeLandings.push(currentName);
    noteStorage(currentName);

    const fromOpposite = getOppositePalaceName(palaces, fromName);
    const currentPalace = findPalace(palaces, currentName);

    // 1) 自化忌出：僅直接 A→A
    if (hop === 1 && currentName === rootName) {
      noteManifest(`${rootName}自化忌出`);
      break;
    }

    // Special：轉忌／化忌落點 C 有自化忌出
    if (currentName !== rootName && currentPalace?.outsideMutagenIndexes?.includes(3)) {
      noteManifest(`落點自化忌出（${currentName}）`);
      break;
    }

    // 2) 投射顯化：來時宮對宮（含本宮直接忌出對宮；含 C→C對宮）
    if (fromOpposite && currentName === fromOpposite) {
      noteManifest(`投射顯化（${fromName}→對宮${currentName}）`);
      break;
    }
    // 2b) 轉忌入本宮對宮（如福→B→財帛）
    if (rootOpposite && currentName === rootOpposite) {
      noteManifest(`投射顯化（本宮對宮${currentName}）`);
      break;
    }

    // 3) 狀態顯化：父母／遷移（成立後仍可再轉一跳到 C，供顯示 命→B→C）
    if (STATE_MANIFEST_PALACES.has(currentName)) {
      noteManifest(`狀態顯化（${currentName}）`);
    }

    // 已達 B→C，不再往下
    if (hop >= MAX_HOPS) break;

    // 回頭本宮（A→B→A）不算自化
    if (currentName === rootName) break;

    const nextJiStar = currentPalace?.mutagenStars?.[3];
    if (!nextJiStar) break;

    const nextName = findPalaceOfStar(palaces, nextJiStar);
    if (!nextName) break;

    // 下一跳若回本宮：不算自化，且非「C→C對宮」special case，停在當前宮
    // 例：命→疾厄→兄弟→命  → 停在兄弟（命不是兄弟對宮）
    if (nextName === rootName) break;

    // 化忌轉忌繼續（下一跳若為 C→C對宮，會在下輪以投射顯化承接）
    fromName = currentName;
    currentName = nextName;
  }

  if (hasManifestation && !firstEvent) mark("manifest");
  if (hasStorage && !firstEvent) mark("storage");

  return {
    hasManifestation,
    hasStorage,
    firstEvent,
    storageTargets: uniqueNames(storageTargets),
    routeLandings: uniqueNames(routeLandings),
    manifestNotes: uniqueNames(manifestNotes),
    routes: [route],
  };
}

function resolveDecisionFlags(palaces) {
  const lifeSignal = analyzeRootSignals(palaces, "命宮");
  const mentalSignal = analyzeRootSignals(palaces, "福德宮");

  const lifeManifest = lifeSignal.hasManifestation;
  const lifeStorage = lifeSignal.hasStorage;
  const mentalManifest = mentalSignal.hasManifestation;
  const mentalStorage = mentalSignal.hasStorage;

  const hasManifestation = lifeManifest || mentalManifest;
  const hasStorage = lifeStorage || mentalStorage;

  // 先命宮、後福德宮；取第一個可判定事件
  let orderFirst = lifeSignal.firstEvent || mentalSignal.firstEvent || null;

  if (hasManifestation && hasStorage && !orderFirst) {
    orderFirst = "manifest";
  }

  return {
    lifeManifest,
    lifeStorage,
    mentalManifest,
    mentalStorage,
    hasManifestation,
    hasStorage,
    orderFirst,
    lifeRouteLandings: lifeSignal.routeLandings,
    mentalRouteLandings: mentalSignal.routeLandings,
    lifeStorageTargets: lifeSignal.storageTargets,
    mentalStorageTargets: mentalSignal.storageTargets,
    lifeManifestNotes: lifeSignal.manifestNotes,
    mentalManifestNotes: mentalSignal.manifestNotes,
    lifeRoutes: lifeSignal.routes || [],
    mentalRoutes: mentalSignal.routes || [],
  };
}

function resolveDecisionEngine({
  lifeManifest,
  lifeStorage,
  mentalManifest,
  mentalStorage,
  hasManifestation,
  hasStorage,
  orderFirst,
}) {
  // 0) 複合型：命／福皆有忌出，且皆有忌入收藏
  if (lifeManifest && lifeStorage && mentalManifest && mentalStorage) {
    return DECISION_ENGINE.composite;
  }

  // 1) 蓄勢型：潛意識收藏、意識顯化
  if (mentalStorage && lifeManifest) return DECISION_ENGINE.assault;

  // 2) 試探型：潛意識顯化、意識收藏
  if (mentalManifest && lifeStorage) return DECISION_ENGINE.guerrilla;

  // 3) 實戰型：同時有顯化+收藏，且先顯化；或命福雙顯化
  if (
    hasManifestation &&
    hasStorage &&
    (orderFirst === "manifest" || (mentalManifest && lifeManifest))
  ) {
    return DECISION_ENGINE.iterative;
  }

  // 4) 狙擊型：同時有顯化+收藏，且先收藏
  if (hasManifestation && hasStorage && orderFirst === "storage") {
    return DECISION_ENGINE.sniper;
  }

  // 5) 敏捷型：只有顯化（命/福任一顯化，且命福皆不收藏）
  if ((lifeManifest || mentalManifest) && !lifeStorage && !mentalStorage) {
    return DECISION_ENGINE.agile;
  }

  // 6) 謀略型：只有收藏（命福皆不顯化，且命/福任一收藏）
  if (!lifeManifest && !mentalManifest && (lifeStorage || mentalStorage)) {
    return DECISION_ENGINE.strategic;
  }

  // 7) 均衡型：以上皆非
  return DECISION_ENGINE.balanced;
}

/** 命／福德化忌或轉忌是否串連天機／文昌／文曲 */
function detectHasDetails(palaces) {
  for (const rootName of ROOT_PALACES) {
    const ji = getJiZhuanJiEntries(palaces, rootName);
    const lu = getLuZhuanJiEntries(palaces, rootName);
    const stars = [
      ...(ji.entries || []).map((e) => e.starName),
      ...(lu.entries || []).map((e) => e.starName),
    ];
    if (stars.some((s) => DETAIL_STARS.has(s))) return true;

    const root = findPalace(palaces, rootName);
    const jiStar = root?.mutagenStars?.[3];
    const luStar = root?.mutagenStars?.[0];
    if (DETAIL_STARS.has(jiStar) || DETAIL_STARS.has(luStar)) return true;
  }
  return false;
}

/** 命宮化權，且同星曜拱兄弟宮的祿 */
function detectHasAmbition(palaces) {
  const life = findPalace(palaces, "命宮");
  const sibling = findPalace(palaces, "兄弟宮");
  if (!life || !sibling) return false;
  const quanStar = life.mutagenStars?.[1];
  const luStar = sibling.mutagenStars?.[0];
  return !!(quanStar && luStar && quanStar === luStar);
}

/**
 * 交祿追祿：
 * lead 化祿入 A → 轉同星曜忌入 B；
 * chase 化同星曜祿入 B 追祿
 */
function hasLuZhuanJiChaseLu(palaces, leadName, chaseName) {
  const chase = findPalace(palaces, chaseName);
  if (!chase) return false;

  const lu = getLuZhuanJiEntries(palaces, leadName);
  for (const route of lu.routes || []) {
    if (!route || route.length < 3) continue;
    const aName = route[1];
    const bName = route[2];
    if (!aName || !bName || aName === bName) continue;

    const aPalace = findPalace(palaces, aName);
    const jiStar = aPalace?.mutagenStars?.[3];
    const chaseLu = chase.mutagenStars?.[0];
    if (!jiStar || !chaseLu || chaseLu !== jiStar) continue;

    // 交友／遷移化同星曜祿入 B
    if (findPalaceOfStar(palaces, chaseLu) === bName) return true;
  }
  return false;
}

/** 遷移↔交友：化祿／轉忌互入，或交祿／交祿追祿 */
function detectHasPopularity(palaces) {
  const travel = findPalace(palaces, "遷移宮");
  const friends = findPalace(palaces, "交友宮");
  if (!travel || !friends) return false;

  const travelLu = getLuZhuanJiEntries(palaces, "遷移宮");
  const friendsLu = getLuZhuanJiEntries(palaces, "交友宮");
  const travelJi = getJiZhuanJiEntries(palaces, "遷移宮");
  const friendsJi = getJiZhuanJiEntries(palaces, "交友宮");

  const hitsFriends = (list) =>
    (list.entries || []).some((e) => e.palaceName === "交友宮");
  const hitsTravel = (list) =>
    (list.entries || []).some((e) => e.palaceName === "遷移宮");

  if (hitsFriends(travelLu) || hitsFriends(travelJi)) return true;
  if (hitsTravel(friendsLu) || hitsTravel(friendsJi)) return true;

  // 交祿：互化祿入對方，或同星祿
  const tLu = travel.mutagenStars?.[0];
  const fLu = friends.mutagenStars?.[0];
  if (tLu && fLu && tLu === fLu) return true;
  const tSit = findPalaceOfStar(palaces, tLu);
  const fSit = findPalaceOfStar(palaces, fLu);
  if (tSit === "交友宮" && fSit === "遷移宮") return true;

  // 遷移化祿入 A→轉忌入 B，交友同星祿入 B 追祿
  // 或 交友化祿入 A→轉忌入 B，遷移同星祿入 B 追祿
  if (hasLuZhuanJiChaseLu(palaces, "遷移宮", "交友宮")) return true;
  if (hasLuZhuanJiChaseLu(palaces, "交友宮", "遷移宮")) return true;

  return false;
}

/** 遷移權與交友祿同星曜交拱 */
function detectHasLeadership(palaces) {
  const travel = findPalace(palaces, "遷移宮");
  const friends = findPalace(palaces, "交友宮");
  if (!travel || !friends) return false;
  const quanStar = travel.mutagenStars?.[1];
  const luStar = friends.mutagenStars?.[0];
  return !!(quanStar && luStar && quanStar === luStar);
}

function rootJiHitsTargets(palaces, rootName, targets) {
  const ji = getJiZhuanJiEntries(palaces, rootName);
  const lu = getLuZhuanJiEntries(palaces, rootName);
  const names = new Set([
    ...(ji.entries || []).map((e) => e.palaceName),
    ...(lu.entries || []).map((e) => e.palaceName),
  ]);
  for (const t of targets) {
    if (names.has(t)) return true;
  }
  for (const route of [...(ji.routes || []), ...(lu.routes || [])]) {
    if (route.some((p, i) => i > 0 && targets.has(p))) return true;
  }
  return false;
}

/**
 * 孤僻格：
 * 命／福德 → 田宅／兄弟／疾厄；
 * 或命 → 遷移；或遷移 → 命；
 * 或生年忌坐／轉忌至 田宅／兄弟／疾厄／遷移
 */
function detectHasLoner(palaces) {
  if (rootJiHitsTargets(palaces, "命宮", LONER_TARGETS)) return true;
  if (rootJiHitsTargets(palaces, "福德宮", LONER_TARGETS)) return true;
  if (rootJiHitsTargets(palaces, "命宮", new Set(["遷移宮"]))) return true;
  if (rootJiHitsTargets(palaces, "遷移宮", new Set(["命宮"]))) return true;

  const birthJi = findBirthJi(palaces);
  if (birthJi) {
    if (BIRTH_JI_TARGETS.has(birthJi.palaceName)) return true;

    // 生年忌所在宮再追化忌／轉忌至上述落點
    if (rootJiHitsTargets(palaces, birthJi.palaceName, BIRTH_JI_TARGETS)) {
      return true;
    }
  }

  return false;
}

function resolveAdjective(hasDetails, hasAmbition) {
  if (hasDetails && hasAmbition) return ADJECTIVES.strategic;
  if (hasDetails && !hasAmbition) return ADJECTIVES.focused;
  if (!hasDetails && hasAmbition) return ADJECTIVES.pioneering;
  return ADJECTIVES.adaptive;
}

function resolveNoun(hasPopularity, hasLeadership, hasLoner) {
  if (hasPopularity && hasLeadership && hasLoner) return NOUNS.architect;
  if (!hasPopularity && hasLeadership && hasLoner) return NOUNS.planner;
  if (hasPopularity && !hasLeadership && hasLoner) return NOUNS.observer;
  if (hasPopularity && hasLeadership && !hasLoner) return NOUNS.influencer;
  if (hasPopularity && !hasLeadership && !hasLoner) return NOUNS.connector;
  if (!hasPopularity && hasLeadership && !hasLoner) return NOUNS.director;
  if (!hasPopularity && !hasLeadership && hasLoner) return NOUNS.independent;
  return NOUNS.integrator;
}

function buildDecisionNote(decision, flags) {
  if (decision.id === "iterative") return "先顯化後收藏";
  if (decision.id === "sniper") return "先收藏後顯化";
  return decision.hint;
}

function buildMindsetNote(flags) {
  const parts = [];
  if (flags.hasDetails) parts.push("重視細節");
  if (flags.hasAmbition) parts.push("具事業心");
  if (!parts.length) parts.push("彈性適應");
  return parts.join(" ‧ ");
}

function buildSocialNote(flags) {
  const { hasPopularity, hasLeadership, hasLoner } = flags;
  if (hasPopularity && hasLeadership && hasLoner) return "人氣與領導兼備的孤高者";
  if (hasLeadership && hasLoner) return "具領導力的孤高者";
  if (hasPopularity && hasLoner) return "有人氣的觀察者";
  if (hasPopularity && hasLeadership) return "人氣與領導兼備";
  if (hasPopularity) return "人緣暢旺";
  if (hasLeadership) return "具備領導特質";
  if (hasLoner) return "傾向獨立孤高";
  return "多方整合協調";
}

function buildDecisionDebug(flags) {
  const bothManifest = flags.lifeManifest && flags.mentalManifest;
  const bothPresent = flags.hasManifestation && flags.hasStorage;
  const onlyManifest =
    (flags.lifeManifest || flags.mentalManifest) &&
    !flags.lifeStorage &&
    !flags.mentalStorage;
  const onlyStorage =
    !flags.lifeManifest &&
    !flags.mentalManifest &&
    (flags.lifeStorage || flags.mentalStorage);

  const allFour =
    flags.lifeManifest &&
    flags.lifeStorage &&
    flags.mentalManifest &&
    flags.mentalStorage;

  const rules = [
    {
      id: "composite",
      label: "複合型",
      matched: allFour,
      checks: [
        { label: "lifeManifest == true", ok: flags.lifeManifest },
        { label: "lifeStorage == true", ok: flags.lifeStorage },
        { label: "mentalManifest == true", ok: flags.mentalManifest },
        { label: "mentalStorage == true", ok: flags.mentalStorage },
      ],
    },
    {
      id: "assault",
      label: "蓄勢型",
      matched: !allFour && flags.mentalStorage && flags.lifeManifest,
      checks: [
        { label: "mentalStorage == true", ok: flags.mentalStorage },
        { label: "lifeManifest == true", ok: flags.lifeManifest },
      ],
    },
    {
      id: "guerrilla",
      label: "試探型",
      matched: !allFour && flags.mentalManifest && flags.lifeStorage,
      checks: [
        { label: "mentalManifest == true", ok: flags.mentalManifest },
        { label: "lifeStorage == true", ok: flags.lifeStorage },
      ],
    },
    {
      id: "iterative",
      label: "實戰型",
      matched:
        !allFour &&
        !(flags.mentalStorage && flags.lifeManifest) &&
        !(flags.mentalManifest && flags.lifeStorage) &&
        bothPresent &&
        (flags.orderFirst === "manifest" || bothManifest),
      checks: [
        { label: "hasManifestation == true", ok: flags.hasManifestation },
        { label: "hasStorage == true", ok: flags.hasStorage },
        {
          label: "orderFirst == 'manifest' 或 life/mental 皆顯化",
          ok: flags.orderFirst === "manifest" || bothManifest,
        },
      ],
    },
    {
      id: "sniper",
      label: "狙擊型",
      matched:
        !allFour &&
        !(flags.mentalStorage && flags.lifeManifest) &&
        !(flags.mentalManifest && flags.lifeStorage) &&
        bothPresent &&
        flags.orderFirst === "storage",
      checks: [
        { label: "hasManifestation == true", ok: flags.hasManifestation },
        { label: "hasStorage == true", ok: flags.hasStorage },
        { label: "orderFirst == 'storage'", ok: flags.orderFirst === "storage" },
      ],
    },
    {
      id: "agile",
      label: "敏捷型",
      matched: onlyManifest,
      checks: [
        { label: "lifeManifest 或 mentalManifest", ok: flags.lifeManifest || flags.mentalManifest },
        { label: "lifeStorage == false", ok: !flags.lifeStorage },
        { label: "mentalStorage == false", ok: !flags.mentalStorage },
      ],
    },
    {
      id: "strategic",
      label: "謀略型",
      matched: onlyStorage,
      checks: [
        { label: "lifeManifest == false", ok: !flags.lifeManifest },
        { label: "mentalManifest == false", ok: !flags.mentalManifest },
        { label: "lifeStorage 或 mentalStorage", ok: flags.lifeStorage || flags.mentalStorage },
      ],
    },
    {
      id: "balanced",
      label: "均衡型",
      matched:
        !allFour &&
        !(flags.mentalStorage && flags.lifeManifest) &&
        !(flags.mentalManifest && flags.lifeStorage) &&
        !(bothPresent && (flags.orderFirst === "manifest" || bothManifest)) &&
        !(bothPresent && flags.orderFirst === "storage") &&
        !onlyManifest &&
        !onlyStorage,
      checks: [
        { label: "lifeManifest == false", ok: !flags.lifeManifest },
        { label: "mentalManifest == false", ok: !flags.mentalManifest },
        { label: "lifeStorage == false", ok: !flags.lifeStorage },
        { label: "mentalStorage == false", ok: !flags.mentalStorage },
      ],
    },
  ];

  const formatLandings = (names) => (names?.length ? names.join("、") : "—");
  const formatRoutes = (routes) => {
    if (!routes?.length) return "—";
    return routes
      .map((route) => (Array.isArray(route) ? route.join(" → ") : ""))
      .filter(Boolean)
      .join(" ； ");
  };
  const showOrder = flags.hasManifestation && flags.hasStorage;
  const orderLabel =
    flags.orderFirst === "manifest"
      ? "先顯化後收藏"
      : flags.orderFirst === "storage"
        ? "先收藏後顯化"
        : "—";

  const signals = [
    {
      id: "lifeManifest",
      label: "命宮忌出",
      ok: !!flags.lifeManifest,
      detail: flags.lifeManifest
        ? formatLandings(flags.lifeManifestNotes?.length ? flags.lifeManifestNotes : flags.lifeRouteLandings)
        : null,
    },
    {
      id: "mentalManifest",
      label: "福德宮忌出",
      ok: !!flags.mentalManifest,
      detail: flags.mentalManifest
        ? formatLandings(
            flags.mentalManifestNotes?.length ? flags.mentalManifestNotes : flags.mentalRouteLandings
          )
        : null,
    },
    {
      id: "lifeStorage",
      label: "命宮忌入收藏",
      ok: !!flags.lifeStorage,
      detail: flags.lifeStorage ? formatLandings(flags.lifeStorageTargets) : null,
    },
    {
      id: "mentalStorage",
      label: "福德忌入收藏",
      ok: !!flags.mentalStorage,
      detail: flags.mentalStorage ? formatLandings(flags.mentalStorageTargets) : null,
    },
  ];

  return {
    flags: {
      lifeManifest: flags.lifeManifest,
      lifeStorage: flags.lifeStorage,
      mentalManifest: flags.mentalManifest,
      mentalStorage: flags.mentalStorage,
      orderFirst: flags.orderFirst,
    },
    signals,
    routes: {
      life: formatRoutes(flags.lifeRoutes) || formatLandings(flags.lifeRouteLandings),
      mental: formatRoutes(flags.mentalRoutes) || formatLandings(flags.mentalRouteLandings),
    },
    order: showOrder
      ? { show: true, label: orderLabel, value: flags.orderFirst }
      : { show: false, label: null, value: null },
    rules,
  };
}

function buildSubtitle(flags) {
  const parts = [];
  if (flags.hasDetails) parts.push("重視細節");
  if (flags.hasAmbition) parts.push("具事業心");
  parts.push(buildSocialNote(flags));
  return parts.join(" / ");
}

/**
 * 由旗標組成完整身份結果（供真實計算與 Mock 共用）
 */
export function buildIdentityFromFlags(flags) {
  const decision = resolveDecisionEngine(flags);
  const adjective = resolveAdjective(flags.hasDetails, flags.hasAmbition);
  const noun = resolveNoun(
    flags.hasPopularity,
    flags.hasLeadership,
    flags.hasLoner
  );

  return {
    flags,
    decision,
    adjective,
    noun,
    title: `${adjective.label} ‧ ${noun.label}`,
    badge: `${decision.emoji} 決策引擎：${decision.label}`,
    subtitle: buildSubtitle(flags),
    metrics: {
      decision: {
        label: "決策引擎",
        value: decision.label,
        emoji: decision.emoji,
        note: buildDecisionNote(decision, flags),
      },
      mindset: {
        label: "思維動能",
        value: adjective.label,
        note: buildMindsetNote(flags),
      },
      social: {
        label: "社交邊界",
        value: noun.label,
        note: buildSocialNote(flags),
      },
    },
    decisionDebug: buildDecisionDebug(flags),
  };
}

/**
 * @param {{ palaces: Array }} astroData - normalizeAstrolabe 後的命盤
 */
export function calculateIdentity(astroData) {
  const palaces = astroData?.palaces || [];
  if (!palaces.length) {
    return buildIdentityFromFlags({
      lifeManifest: false,
      lifeStorage: false,
      mentalManifest: false,
      mentalStorage: false,
      hasManifestation: false,
      hasStorage: false,
      orderFirst: null,
      lifeRouteLandings: [],
      mentalRouteLandings: [],
      lifeStorageTargets: [],
      mentalStorageTargets: [],
      lifeManifestNotes: [],
      mentalManifestNotes: [],
      lifeRoutes: [],
      mentalRoutes: [],
      hasDetails: false,
      hasAmbition: false,
      hasPopularity: false,
      hasLeadership: false,
      hasLoner: false,
    });
  }

  const decisionFlags = resolveDecisionFlags(palaces);
  const flags = {
    ...decisionFlags,
    hasDetails: detectHasDetails(palaces),
    hasAmbition: detectHasAmbition(palaces),
    hasPopularity: detectHasPopularity(palaces),
    hasLeadership: detectHasLeadership(palaces),
    hasLoner: detectHasLoner(palaces),
  };

  return buildIdentityFromFlags(flags);
}

/** UI 渲染測試用：全 true + 先顯化 → 實戰型 / 策略 ‧ 佈局家 */
export const MOCK_IDENTITY_FLAGS = {
  lifeManifest: true,
  lifeStorage: true,
  mentalManifest: true,
  mentalStorage: true,
  hasManifestation: true,
  hasStorage: true,
  orderFirst: "manifest",
  lifeRouteLandings: ["遷移宮", "田宅宮"],
  mentalRouteLandings: ["兄弟宮"],
  lifeStorageTargets: ["田宅宮"],
  mentalStorageTargets: ["兄弟宮"],
  lifeManifestNotes: ["命宮化忌忌出"],
  mentalManifestNotes: ["福德宮化忌忌出"],
  hasDetails: true,
  hasAmbition: true,
  hasPopularity: true,
  hasLeadership: true,
  hasLoner: true,
};

export const MOCK_IDENTITY = buildIdentityFromFlags(MOCK_IDENTITY_FLAGS);
