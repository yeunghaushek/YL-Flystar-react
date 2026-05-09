import type { HexagramLines } from "./hexagram";
import * as OpenCC from "opencc-js";

export type IChingLine = {
  id: number;
  name: string;
  scripture: string;
};

export type IChingHex = {
  id: number;
  name: string;
  symbol: string;
  scripture: string;
  lines: IChingLine[];
};

const SOURCE_URL =
  "https://raw.githubusercontent.com/john-walks-slow/open-iching/main/iching/iching.json";
const s2t = OpenCC.Converter({ from: "cn", to: "tw" });

function keyFromBits(bits: number[]): string {
  return bits.map((b) => (b ? "1" : "0")).join("");
}

function keyFromLines(lines: HexagramLines): string {
  return lines.map((l) => (l === "yang" ? "1" : "0")).join("");
}

export async function fetchIChingMap(): Promise<Record<string, IChingHex>> {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch I Ching text: ${res.status}`);
  }
  const data = (await res.json()) as Array<{
    id: number;
    name: string;
    symbol: string;
    array: number[];
    scripture: string;
    lines: IChingLine[];
  }>;
  const out: Record<string, IChingHex> = {};
  for (const row of data) {
    out[keyFromBits(row.array)] = {
      id: row.id,
      name: s2t(row.name),
      symbol: row.symbol,
      scripture: s2t(row.scripture),
      lines: (row.lines ?? []).map((line) => ({
        ...line,
        name: s2t(line.name),
        scripture: s2t(line.scripture),
      })),
    };
  }
  return out;
}

export function getHexTextByLines(
  map: Record<string, IChingHex>,
  lines: HexagramLines,
): IChingHex | null {
  return map[keyFromLines(lines)] ?? null;
}

