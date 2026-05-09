import type { TrigramId } from "./bagua";
import { TRIGRAM_NATURE, getTrigram } from "./bagua";
import type { HexagramLines } from "./hexagram";
import { linesFromTrigrams, splitHexagram } from "./hexagram";

/**
 * King Wen sequence: inner (lower) trigram, outer (upper) trigram, short name.
 * Names use Traditional Chinese where applicable (e.g. 無妄).
 */
const KING_WEN: { lower: TrigramId; upper: TrigramId; name: string }[] = [
  { lower: "qian", upper: "qian", name: "乾" },
  { lower: "kun", upper: "kun", name: "坤" },
  { lower: "zhen", upper: "kan", name: "屯" },
  { lower: "kan", upper: "gen", name: "蒙" },
  { lower: "qian", upper: "kan", name: "需" },
  { lower: "kan", upper: "qian", name: "訟" },
  { lower: "kan", upper: "kun", name: "師" },
  { lower: "kun", upper: "kan", name: "比" },
  { lower: "qian", upper: "xun", name: "小畜" },
  { lower: "dui", upper: "qian", name: "履" },
  { lower: "qian", upper: "kun", name: "泰" },
  { lower: "kun", upper: "qian", name: "否" },
  { lower: "li", upper: "qian", name: "同人" },
  { lower: "qian", upper: "li", name: "大有" },
  { lower: "gen", upper: "kun", name: "謙" },
  { lower: "kun", upper: "zhen", name: "豫" },
  { lower: "zhen", upper: "dui", name: "隨" },
  { lower: "xun", upper: "gen", name: "蠱" },
  { lower: "dui", upper: "kun", name: "臨" },
  { lower: "kun", upper: "xun", name: "觀" },
  { lower: "zhen", upper: "li", name: "噬嗑" },
  { lower: "li", upper: "gen", name: "賁" },
  { lower: "kun", upper: "gen", name: "剝" },
  { lower: "zhen", upper: "kun", name: "復" },
  { lower: "zhen", upper: "qian", name: "無妄" },
  { lower: "qian", upper: "gen", name: "大畜" },
  { lower: "zhen", upper: "gen", name: "頤" },
  { lower: "xun", upper: "dui", name: "大過" },
  { lower: "kan", upper: "kan", name: "坎" },
  { lower: "li", upper: "li", name: "離" },
  { lower: "gen", upper: "dui", name: "咸" },
  { lower: "xun", upper: "zhen", name: "恆" },
  { lower: "gen", upper: "qian", name: "遯" },
  { lower: "qian", upper: "zhen", name: "大壯" },
  { lower: "kun", upper: "li", name: "晉" },
  { lower: "li", upper: "kun", name: "明夷" },
  { lower: "li", upper: "xun", name: "家人" },
  { lower: "dui", upper: "li", name: "睽" },
  { lower: "gen", upper: "kan", name: "蹇" },
  { lower: "kan", upper: "zhen", name: "解" },
  { lower: "dui", upper: "gen", name: "損" },
  { lower: "zhen", upper: "xun", name: "益" },
  { lower: "qian", upper: "dui", name: "夬" },
  { lower: "xun", upper: "qian", name: "姤" },
  { lower: "kun", upper: "dui", name: "萃" },
  { lower: "xun", upper: "kun", name: "升" },
  { lower: "kan", upper: "dui", name: "困" },
  { lower: "xun", upper: "kan", name: "井" },
  { lower: "li", upper: "dui", name: "革" },
  { lower: "xun", upper: "li", name: "鼎" },
  { lower: "zhen", upper: "zhen", name: "震" },
  { lower: "gen", upper: "gen", name: "艮" },
  { lower: "gen", upper: "xun", name: "漸" },
  { lower: "dui", upper: "zhen", name: "歸妹" },
  { lower: "li", upper: "zhen", name: "豐" },
  { lower: "gen", upper: "li", name: "旅" },
  { lower: "xun", upper: "xun", name: "巽" },
  { lower: "dui", upper: "dui", name: "兌" },
  { lower: "kan", upper: "xun", name: "渙" },
  { lower: "dui", upper: "kan", name: "節" },
  { lower: "dui", upper: "xun", name: "中孚" },
  { lower: "gen", upper: "zhen", name: "小過" },
  { lower: "li", upper: "kan", name: "既濟" },
  { lower: "kan", upper: "li", name: "未濟" },
];

function linesToKey(lines: HexagramLines): string {
  return lines.map((l) => (l === "yang" ? "1" : "0")).join("");
}

const NAME_BY_KEY = new Map<string, string>();
for (const row of KING_WEN) {
  const lines = linesFromTrigrams(row.lower, row.upper);
  NAME_BY_KEY.set(linesToKey(lines), row.name);
}

/**
 * 卦名：例 水雷屯；上下同卦則 乾為天、坤為地（卦名＋為＋象），非「天天乾」。
 */
export function kingWenCompoundTitle(lines: HexagramLines): string {
  const { lowerId, upperId } = splitHexagram(lines);
  if (upperId === lowerId) {
    const t = getTrigram(upperId);
    return `${t.symbol}為${TRIGRAM_NATURE[upperId]}`;
  }
  const key = linesToKey(lines);
  const name = NAME_BY_KEY.get(key);
  if (!name) return `${TRIGRAM_NATURE[upperId]}${TRIGRAM_NATURE[lowerId]}（？）`;
  return `${TRIGRAM_NATURE[upperId]}${TRIGRAM_NATURE[lowerId]}${name}`;
}
