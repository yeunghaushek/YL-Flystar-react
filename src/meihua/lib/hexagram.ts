import type { Line, TrigramId } from "./bagua";
import { getTrigram } from "./bagua";

/** Six lines bottom → top: indices 0–2 lower trigram, 3–5 upper */
export type HexagramLines = [Line, Line, Line, Line, Line, Line];

export function linesFromTrigrams(
  lowerId: TrigramId,
  upperId: TrigramId,
): HexagramLines {
  const lower = getTrigram(lowerId).lines;
  const upper = getTrigram(upperId).lines;
  return [...lower, ...upper] as HexagramLines;
}

/** 互卦: lower inner 2–4, upper inner 3–5 (1-based: 二三四, 三四五) */
export function mutualHexagram(lines: HexagramLines): HexagramLines {
  const lowerMutual: [Line, Line, Line] = [lines[1], lines[2], lines[3]];
  const upperMutual: [Line, Line, Line] = [lines[2], lines[3], lines[4]];
  return [...lowerMutual, ...upperMutual];
}

function flip(line: Line): Line {
  return line === "yang" ? "yin" : "yang";
}

/** 變卦: flip moving line(s). `movingLine` is 1–6 (初爻–上爻). */
export function transformedHexagram(
  lines: HexagramLines,
  movingLine: number,
): HexagramLines {
  const i = movingLine - 1;
  if (i < 0 || i > 5) return lines;
  const next = [...lines] as HexagramLines;
  next[i] = flip(next[i]);
  return next;
}

export function trigramKey(lines3: [Line, Line, Line]): string {
  return lines3.map((l) => (l === "yang" ? "1" : "0")).join("");
}

const TRIGRAM_BY_BITS: Record<string, TrigramId> = {
  "111": "qian",
  "110": "dui",
  "101": "li",
  "100": "zhen",
  "011": "xun",
  "010": "kan",
  "001": "gen",
  "000": "kun",
};

export function splitHexagram(lines: HexagramLines): {
  lowerId: TrigramId;
  upperId: TrigramId;
} {
  const lowerBits = trigramKey([lines[0], lines[1], lines[2]]);
  const upperBits = trigramKey([lines[3], lines[4], lines[5]]);
  return {
    lowerId: TRIGRAM_BY_BITS[lowerBits],
    upperId: TRIGRAM_BY_BITS[upperBits],
  };
}

/** Short structural label: upper over lower (上卦 / 下卦). */
export function describeHexagram(lines: HexagramLines): string {
  const { lowerId, upperId } = splitHexagram(lines);
  const u = getTrigram(upperId).symbol;
  const l = getTrigram(lowerId).symbol;
  return `上${u}下${l}`;
}