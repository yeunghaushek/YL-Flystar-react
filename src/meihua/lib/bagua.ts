/** Single line: yin (broken) or yang (solid). Bottom of trigram is index 0. */
export type Line = "yin" | "yang";

export type Element = "wood" | "fire" | "earth" | "metal" | "water";

export type TrigramId =
  | "qian"
  | "dui"
  | "li"
  | "zhen"
  | "xun"
  | "kan"
  | "gen"
  | "kun";

export type Trigram = {
  id: TrigramId;
  /** Chinese character */
  symbol: string;
  /** Short label */
  name: string;
  lines: [Line, Line, Line];
  element: Element;
};

/** Later Heaven (后天) — clockwise from South 离 at top of wheel */
export const LATER_HEAVEN_ORDER: TrigramId[] = [
  "li",
  "kun",
  "dui",
  "qian",
  "kan",
  "gen",
  "zhen",
  "xun",
];

const T: Record<TrigramId, Trigram> = {
  qian: {
    id: "qian",
    symbol: "乾",
    name: "乾",
    lines: ["yang", "yang", "yang"],
    element: "metal",
  },
  dui: {
    id: "dui",
    symbol: "兌",
    name: "兌",
    lines: ["yang", "yang", "yin"],
    element: "metal",
  },
  li: {
    id: "li",
    symbol: "離",
    name: "離",
    lines: ["yang", "yin", "yang"],
    element: "fire",
  },
  zhen: {
    id: "zhen",
    symbol: "震",
    name: "震",
    lines: ["yang", "yin", "yin"],
    element: "wood",
  },
  xun: {
    id: "xun",
    symbol: "巽",
    name: "巽",
    lines: ["yin", "yang", "yang"],
    element: "wood",
  },
  kan: {
    id: "kan",
    symbol: "坎",
    name: "坎",
    lines: ["yin", "yang", "yin"],
    element: "water",
  },
  gen: {
    id: "gen",
    symbol: "艮",
    name: "艮",
    lines: ["yin", "yin", "yang"],
    element: "earth",
  },
  kun: {
    id: "kun",
    symbol: "坤",
    name: "坤",
    lines: ["yin", "yin", "yin"],
    element: "earth",
  },
};

export function getTrigram(id: TrigramId): Trigram {
  return T[id];
}

/** 象傳式卦象題名：上象下象（五行物象） */
export const TRIGRAM_NATURE: Record<TrigramId, string> = {
  qian: "天",
  dui: "澤",
  li: "火",
  zhen: "雷",
  xun: "風",
  kan: "水",
  gen: "山",
  kun: "地",
};

/** Solid / yin bar segments colored by trigram element */
export function elementYaoBarClass(element: Element): string {
  switch (element) {
    case "wood":
      return "bg-emerald-700";
    case "fire":
      return "bg-red-600";
    case "earth":
      return "bg-amber-900";
    case "metal":
      return "bg-yellow-500";
    case "water":
      return "bg-slate-700";
  }
}

/** Tailwind classes for trigram buttons / accents */
export function elementButtonClasses(element: Element): string {
  switch (element) {
    case "wood":
      return "bg-emerald-700 text-emerald-50 ring-emerald-900/40 hover:bg-emerald-600";
    case "fire":
      return "bg-red-600 text-red-50 ring-red-900/40 hover:bg-red-500";
    case "earth":
      return "bg-amber-900 text-amber-50 ring-amber-950/40 hover:bg-amber-800";
    case "metal":
      return "bg-yellow-500 text-yellow-950 ring-yellow-800/50 hover:bg-yellow-400";
    case "water":
      return "bg-slate-700 text-slate-100 ring-slate-900/50 hover:bg-slate-600";
  }
}

export function elementMutedBorder(element: Element): string {
  switch (element) {
    case "wood":
      return "border-emerald-800/40";
    case "fire":
      return "border-red-700/40";
    case "earth":
      return "border-amber-950/35";
    case "metal":
      return "border-yellow-700/45";
    case "water":
      return "border-slate-800/45";
  }
}
