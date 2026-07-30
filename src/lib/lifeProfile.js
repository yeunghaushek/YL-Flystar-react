/**
 * 星軌理數 · 生命檔案 domain model.
 */

import {
  getJiInboundEntries,
  getJiZhuanJiEntries,
  getLuZhuanJiEntries,
  getQuanEntries,
} from "@/lib/auspiciousChain";

export const MODULE_IDS = [
  "Life",
  "Sibling",
  "Spouse",
  "Children",
  "Wealth",
  "Health",
  "Travel",
  "Friends",
  "Career",
  "Property",
  "Spirit",
  "Parents",
];

export const MODULES = {
  Life: { id: "Life", title: "本原", subtitle: "自我設定", zone: "axis" },
  Sibling: { id: "Sibling", title: "基石", subtitle: "事業規模與基礎", zone: "inner" },
  Spouse: { id: "Spouse", title: "親密", subtitle: "對待關係", zone: "inner" },
  Children: { id: "Children", title: "繁衍", subtitle: "晚輩與衍生", zone: "inner" },
  Wealth: { id: "Wealth", title: "價值", subtitle: "現金緣與資源分配", zone: "inner" },
  Health: { id: "Health", title: "載體", subtitle: "實踐動能與硬體", zone: "axis" },
  Travel: { id: "Travel", title: "際遇", subtitle: "廣大社會與市場", zone: "outer" },
  Friends: { id: "Friends", title: "社交", subtitle: "人際競爭與客戶", zone: "outer" },
  Career: { id: "Career", title: "實踐", subtitle: "工作執行與運作", zone: "outer" },
  Property: { id: "Property", title: "歸屬", subtitle: "資產與底層庫藏", zone: "inner" },
  Spirit: { id: "Spirit", title: "願景", subtitle: "精神與潛意識", zone: "axis" },
  Parents: { id: "Parents", title: "啟蒙", subtitle: "源頭與規範", zone: "inner" },
};

export const PALACE_TO_MODULE = {
  命宮: "Life",
  兄弟宮: "Sibling",
  夫妻宮: "Spouse",
  子女宮: "Children",
  財帛宮: "Wealth",
  疾厄宮: "Health",
  遷移宮: "Travel",
  交友宮: "Friends",
  事業宮: "Career",
  田宅宮: "Property",
  福德宮: "Spirit",
  父母宮: "Parents",
};

export const MODULE_TO_PALACE = Object.fromEntries(
  Object.entries(PALACE_TO_MODULE).map(([palace, id]) => [id, palace])
);

export const STAR_SHORT = {
  廉貞: "廉",
  破軍: "破",
  武曲: "武",
  太陽: "陽",
  天機: "機",
  天梁: "梁",
  紫微: "微",
  太陰: "陰",
  天同: "同",
  文昌: "昌",
  巨門: "巨",
  貪狼: "貪",
  右弼: "弼",
  文曲: "曲",
  左輔: "輔",
  七殺: "殺",
  天府: "府",
  天相: "相",
};

export const ManifestationState = {
  NoManifestation: "NoManifestation",
  SelfManifestation: "SelfManifestation",
  ProjectedManifestation: "ProjectedManifestation",
  StateManifestation: "StateManifestation",
};

export const MANIFESTATION_LABELS = {
  NoManifestation: "無顯化",
  SelfManifestation: "自顯化",
  ProjectedManifestation: "投射顯化",
  StateManifestation: "狀態顯化",
};

export const ENERGY_KIND = {
  expand: { id: "expand", label: "擴張", mutagenIndex: 0, color: "expand" },
  control: { id: "control", label: "掌控", mutagenIndex: 1, color: "control" },
  converge: { id: "converge", label: "收斂", mutagenIndex: 3, color: "converge" },
};

const MANIFESTATION_PRIORITY = {
  [ManifestationState.NoManifestation]: 0,
  [ManifestationState.SelfManifestation]: 1,
  [ManifestationState.StateManifestation]: 2,
  [ManifestationState.ProjectedManifestation]: 3,
};

export const PILLAR_BOARDS = [
  {
    id: "life",
    title: "本原",
    subtitle: "心",
    moduleId: "Life",
    zones: [
      { id: "expand", title: "發散區", kind: "lu" },
      { id: "control", title: "意志區", kind: "quan" },
      { id: "focus", title: "聚焦區", kind: "ji" },
    ],
  },
  {
    id: "spirit",
    title: "精神",
    subtitle: "靈",
    moduleId: "Spirit",
    zones: [
      { id: "drive", title: "驅動區", kind: "lu" },
      { id: "compete", title: "競爭區", kind: "quan" },
      { id: "boundary", title: "界線區", kind: "ji" },
    ],
  },
  {
    id: "travel",
    title: "際遇",
    subtitle: "大社會",
    moduleId: "Travel",
    zones: [
      { id: "flex", title: "靈活區", kind: "lu" },
      { id: "strength", title: "實力區", kind: "quan" },
      { id: "blind", title: "盲區", kind: "ji" },
    ],
  },
];

export const INNATE_COLUMNS = [
  { id: "fate", title: "緣份", mutagen: "祿" },
  { id: "prosper", title: "壯盛", mutagen: "權" },
  { id: "obstacle", title: "阻礙", mutagen: "忌" },
];

export const LESSON_COLUMNS = [
  { id: "self", title: "本我課題", palace: "命宮" },
  { id: "spirit", title: "精神課題", palace: "福德宮" },
  { id: "practice", title: "實踐課題", palace: "疾厄宮" },
];

function palaceForModule(palaces, moduleId) {
  return palaces.find((p) => PALACE_TO_MODULE[p.name] === moduleId);
}

export function formatEntry(palaceName, starName) {
  const moduleId = PALACE_TO_MODULE[palaceName];
  const moduleTitle = moduleId ? MODULES[moduleId].title : palaceName;
  const starShort = STAR_SHORT[starName] || starName.slice(-1);
  return {
    label: `${moduleTitle}（${starShort}）`,
    moduleTitle,
    starShort,
    palaceName,
    starName,
    moduleId,
  };
}

/** 分開計算：祿 / 權 / 忌 各自的顯化狀態 */
export function detectManifestationByKind(palace, mutagenIndex) {
  const color = { 0: "expand", 1: "control", 3: "converge" }[mutagenIndex];

  if (!palace) {
    return {
      state: ManifestationState.NoManifestation,
      label: MANIFESTATION_LABELS.NoManifestation,
      mutagenIndex,
      color,
    };
  }

  let state = ManifestationState.NoManifestation;
  if (palace.outsideMutagenIndexes?.includes(mutagenIndex)) {
    state = ManifestationState.SelfManifestation;
  } else if (palace.insideMutagenIndexes?.includes(mutagenIndex)) {
    state = ManifestationState.ProjectedManifestation;
  }

  return {
    state,
    label: MANIFESTATION_LABELS[state],
    mutagenIndex,
    color,
  };
}

function pickHigherManifestation(current, next) {
  if (!next) return current;
  if (!current) return next;
  return MANIFESTATION_PRIORITY[next.state] >= MANIFESTATION_PRIORITY[current.state]
    ? next
    : current;
}

function getOppositePalaceName(palaces, palaceName) {
  const idx = palaces.findIndex((p) => p.name === palaceName);
  if (idx < 0) return "";
  return palaces[(idx + 6) % 12]?.name || "";
}

function resolveZoneManifestationByRoutes(palaces, rootPalaceName, mutagenIndex, routes = []) {
  const color = { 0: "expand", 1: "control", 3: "converge" }[mutagenIndex];
  const statePalaces = new Set(["遷移宮", "父母宮"]);
  const rootOpposite = getOppositePalaceName(palaces, rootPalaceName);

  let best = {
    state: ManifestationState.NoManifestation,
    label: MANIFESTATION_LABELS.NoManifestation,
    mutagenIndex,
    color,
  };

  routes.forEach((route) => {
    if (!route?.length || route[0] !== rootPalaceName) return;

    const b = route[1];
    const c = route[2];
    const bOpposite = b ? getOppositePalaceName(palaces, b) : "";

    if (b && b === rootPalaceName) {
      // A → A（停下）＝自顯化
      best = pickHigherManifestation(best, {
        state: ManifestationState.SelfManifestation,
        label: MANIFESTATION_LABELS.SelfManifestation,
        mutagenIndex,
        color,
      });
    }

    // A → B → A 回歸，或路徑終點回到本宮，亦屬自顯化
    if (c && c === rootPalaceName) {
      best = pickHigherManifestation(best, {
        state: ManifestationState.SelfManifestation,
        label: MANIFESTATION_LABELS.SelfManifestation,
        mutagenIndex,
        color,
      });
    }

    if (
      (b && b === rootOpposite) ||
      (c && bOpposite && c === bOpposite) ||
      (c && rootOpposite && c === rootOpposite)
    ) {
      best = pickHigherManifestation(best, {
        state: ManifestationState.ProjectedManifestation,
        label: MANIFESTATION_LABELS.ProjectedManifestation,
        mutagenIndex,
        color,
      });
    }

    if ((b && statePalaces.has(b)) || (c && statePalaces.has(c))) {
      best = pickHigherManifestation(best, {
        state: ManifestationState.StateManifestation,
        label: MANIFESTATION_LABELS.StateManifestation,
        mutagenIndex,
        color,
      });
    }
  });

  return best;
}

function buildZone(palaces, rootPalaceName, zoneConfig) {
  const mutagenIndex = { lu: 0, quan: 1, ji: 3 }[zoneConfig.kind];
  let rawEntries = [];
  let routes = [];

  if (zoneConfig.kind === "lu") {
    const result = getLuZhuanJiEntries(palaces, rootPalaceName);
    rawEntries = result.entries;
    routes = result.routes || [];
  } else if (zoneConfig.kind === "quan") {
    const result = getQuanEntries(palaces, rootPalaceName);
    rawEntries = result.entries;
    routes = result.routes || [];
  } else {
    const result = getJiZhuanJiEntries(palaces, rootPalaceName);
    rawEntries = result.entries;
    routes = result.routes || [];
  }

  const manifestation = resolveZoneManifestationByRoutes(
    palaces,
    rootPalaceName,
    mutagenIndex,
    routes
  );

  // 自顯化：三柱任一區都必須有本宮中心，不可空白
  if (manifestation.state === ManifestationState.SelfManifestation) {
    const hasRoot = rawEntries.some((e) => e.palaceName === rootPalaceName);
    if (!hasRoot) {
      const rootPalace = palaces.find((p) => p.name === rootPalaceName);
      const starName =
        rootPalace?.mutagenStars?.[mutagenIndex] ||
        rawEntries[0]?.starName ||
        "";
      if (starName) {
        rawEntries = [{ palaceName: rootPalaceName, starName }, ...rawEntries];
      }
    }
  }

  const maxEntries = zoneConfig.kind === "quan" ? 1 : 2;
  // 自顯化時優先保留本宮中心
  if (
    manifestation.state === ManifestationState.SelfManifestation &&
    rawEntries.length > maxEntries
  ) {
    const rootEntry = rawEntries.find((e) => e.palaceName === rootPalaceName);
    const others = rawEntries.filter((e) => e.palaceName !== rootPalaceName);
    rawEntries = rootEntry ? [rootEntry, ...others].slice(0, maxEntries) : rawEntries.slice(0, maxEntries);
  } else {
    rawEntries = rawEntries.slice(0, maxEntries);
  }

  const entries = rawEntries.map((e) => formatEntry(e.palaceName, e.starName));

  return {
    ...zoneConfig,
    entries,
    manifestation,
    color: ENERGY_KIND[{ 0: "expand", 1: "control", 3: "converge" }[mutagenIndex]].color,
  };
}

function buildPillarBoards(palaces) {
  return PILLAR_BOARDS.map((pillar) => {
    const rootPalace = MODULE_TO_PALACE[pillar.moduleId];
    return {
      ...pillar,
      zones: pillar.zones.map((zone) => buildZone(palaces, rootPalace, zone)),
    };
  });
}

function findBirthMutagenEntry(palaces, mutagenKey) {
  for (const palace of palaces) {
    const stars = [...(palace.majorStars || []), ...(palace.minorStars || [])];
    const star = stars.find((s) => s.mutagen === mutagenKey);
    if (star) {
      return formatEntry(palace.name, star.name);
    }
  }
  return null;
}

function buildInnateBoard(palaces) {
  return {
    id: "innate",
    title: "與生俱來",
    columns: INNATE_COLUMNS.map((col) => ({
      ...col,
      entry: findBirthMutagenEntry(palaces, col.mutagen),
    })),
  };
}

function buildLessonBoard(palaces) {
  return {
    id: "lessons",
    title: "人生課題",
    columns: LESSON_COLUMNS.map((col) => {
      const rawEntries = getJiInboundEntries(palaces, col.palace);
      return {
        ...col,
        entries: rawEntries.map((e) => formatEntry(e.palaceName, e.starName)),
      };
    }),
  };
}

function buildEnergyFlows(palaces) {
  const edges = [];
  const kindByIndex = { 0: "expand", 1: "control", 3: "converge" };

  for (const from of palaces) {
    const fromModule = PALACE_TO_MODULE[from.name];
    if (!fromModule) continue;

    (from.mutagenStars || []).forEach((starName, mIndex) => {
      const kind = kindByIndex[mIndex];
      if (!kind) return;

      const to = palaces.find(
        (p) =>
          p.majorStars.some((s) => s.name === starName) ||
          p.minorStars.some((s) => s.name === starName)
      );
      if (!to) return;
      const toModule = PALACE_TO_MODULE[to.name];
      if (!toModule) return;

      // 同模組＝自化祿／權／忌：星軌圖畫「向外一圈回到自己」
      const self = toModule === fromModule;

      edges.push({
        id: `${fromModule}-${kind}-${toModule}-${starName}${self ? "-self" : ""}`,
        from: fromModule,
        to: toModule,
        kind,
        self,
        label: ENERGY_KIND[kind].label,
      });
    });
  }

  return edges;
}

export function buildLifeProfile(normalized) {
  const { palaces } = normalized;

  const nodes = MODULE_IDS.map((id) => {
    const meta = MODULES[id];
    const palace = palaceForModule(palaces, id);

    const manifestations = {
      expand: detectManifestationByKind(palace, 0),
      control: detectManifestationByKind(palace, 1),
      converge: detectManifestationByKind(palace, 3),
    };

    return {
      ...meta,
      palaceIndex: palace?.index,
      manifestations,
    };
  });

  return {
    nodes,
    nodeById: Object.fromEntries(nodes.map((n) => [n.id, n])),
    pillarBoards: buildPillarBoards(palaces),
    innateBoard: buildInnateBoard(palaces),
    lessonBoard: buildLessonBoard(palaces),
    flows: buildEnergyFlows(palaces),
  };
}

/** 正方形星軌佈局（適配手機直向；左側基石／際遇／實踐拉開） */
export const ORBIT_LAYOUT = {
  Spirit: { x: 50, y: 12 },
  Life: { x: 50, y: 50 },
  Health: { x: 50, y: 88 },
  Spouse: { x: 34, y: 26 },
  Children: { x: 66, y: 26 },
  Sibling: { x: 26, y: 50 },
  Wealth: { x: 78, y: 34 },
  Parents: { x: 34, y: 74 },
  Property: { x: 66, y: 74 },
  Travel: { x: 10, y: 26 },
  Friends: { x: 88, y: 70 },
  Career: { x: 10, y: 76 },
};
