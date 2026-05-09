"use client";

import type { ReactNode } from "react";
import type { HexagramLines } from "@/meihua/lib/hexagram";
import { splitHexagram } from "@/meihua/lib/hexagram";
import { elementYaoBarClass, getTrigram, type Element } from "@/meihua/lib/bagua";
import { cn } from "@/meihua/lib/cn";

type Props = {
  lines: HexagramLines;
  /** 1–6 — mark moving yao with ring */
  movingLine?: number | null;
  /** 僅本卦：點上卦 / 下卦區塊以選卦 */
  interactive?: boolean;
  onPickUpper?: () => void;
  onPickLower?: () => void;
  className?: string;
  /**
   * 與五爻（idx 4）、二爻（idx 1）列等高對齊的左側字（體／用）。
   * 字在卦象背框外，與六爻列用同一套 gap，避免「太高／太低」。
   */
  tiYongLabels?: { line5: ReactNode; line2: ReactNode };
  /**
   * 置於卦盤總外框內：去掉單卦小背框、縮小手機版爻寬／間距，避免本互變換行。
   */
  embeddedInBoard?: boolean;
};

/** 與 HexagramFigure 內部一致的列高／間距（左側體用欄必須同步） */
export const HEX_LINE_ROW_CLASS =
  "flex h-6 w-full min-w-0 shrink-0 items-center justify-center sm:h-8 md:h-9 lg:h-10 xl:h-11";
export const HEX_LINE_INNER_GAP_CLASS = "gap-1.5 sm:gap-2.5 md:gap-3 lg:gap-3.5";
export const HEX_BLOCK_GAP_CLASS = "gap-2 sm:gap-3 md:gap-3.5 lg:gap-4";

/** 獨立小背框模式：與原設計相同寬度 */
const BAR_WRAP_STANDALONE =
  "mx-auto w-[6.75rem] min-w-[6.5rem] sm:w-36 sm:min-w-[8rem] md:w-44 md:min-w-[10rem] lg:w-[12rem] lg:min-w-[11rem] xl:w-[13rem] xl:min-w-[12rem]";

/** 卦盤總框內：極窄屏仍容納 體用+三本卦 */
const BAR_WRAP_BOARD =
  "mx-auto w-[4.5rem] min-w-[4.25rem] sm:w-[7.1rem] sm:min-w-[6.85rem] md:w-44 md:min-w-[10rem] lg:w-[12rem] lg:min-w-[11rem] xl:w-[13rem] xl:min-w-[12rem]";

/** 六爻背框固定寬度（獨立小框用） */
const BOARD_PANEL_CLASS =
  "mx-auto w-[7.75rem] shrink-0 sm:w-[10.25rem] md:w-[12.5rem] lg:w-[13.25rem] xl:w-[14.25rem]";

/** Top → bottom: line 6 … line 1 */
export function HexagramFigure({
  lines,
  movingLine = null,
  interactive = false,
  onPickUpper,
  onPickLower,
  className,
  tiYongLabels,
  embeddedInBoard = false,
}: Props) {
  const { lowerId, upperId } = splitHexagram(lines);
  const upperEl = getTrigram(upperId).element;
  const lowerEl = getTrigram(lowerId).element;

  const upperIdxs = [5, 4, 3] as const;
  const lowerIdxs = [2, 1, 0] as const;

  function barClass(idx: number): string {
    const el: Element = upperIdxs.includes(idx as 5 | 4 | 3)
      ? upperEl
      : lowerEl;
    return elementYaoBarClass(el);
  }

  const lineRowClass = embeddedInBoard
    ? "flex h-[1.28rem] w-full min-w-0 shrink-0 items-center justify-center sm:h-8 md:h-9 lg:h-10 xl:h-11"
    : HEX_LINE_ROW_CLASS;
  const lineInnerGap = embeddedInBoard
    ? "gap-1 sm:gap-2.5 md:gap-3 lg:gap-3.5"
    : HEX_LINE_INNER_GAP_CLASS;
  const blockGap = embeddedInBoard
    ? "gap-1.5 sm:gap-3 md:gap-3.5 lg:gap-4"
    : HEX_BLOCK_GAP_CLASS;
  const barWrapClass = embeddedInBoard ? BAR_WRAP_BOARD : BAR_WRAP_STANDALONE;
  const barH = embeddedInBoard
    ? "h-2.5 w-full rounded-full sm:h-5 md:h-6 lg:h-7"
    : "h-4 w-full rounded-full sm:h-5 md:h-6 lg:h-7";
  const barHSplit = embeddedInBoard
    ? "h-2.5 min-w-0 flex-1 rounded-full sm:h-5 md:h-6 lg:h-7"
    : "h-4 min-w-0 flex-1 rounded-full sm:h-5 md:h-6 lg:h-7";
  const yinGap = embeddedInBoard
    ? "gap-0.5 sm:gap-2 md:gap-2.5 lg:gap-3.5"
    : "gap-1 sm:gap-2 md:gap-2.5 lg:gap-3.5";

  function renderLineRow(idx: number) {
    const line = lines[idx];
    const n = idx + 1;
    const isMoving = movingLine === n;
    const segClass = barClass(idx);

    return (
      <div key={idx} className={cn(lineRowClass)}>
        <div
          className={cn(
            "flex items-center justify-center rounded-lg py-[1px]",
            barWrapClass,
            isMoving &&
              "rounded-md border-2 border-[#8b5a3c] bg-amber-50/35 px-0.5 py-0.5 shadow-none sm:rounded-lg sm:px-1 sm:py-1",
          )}
        >
          {line === "yang" ? (
            <div className={cn(barH, segClass)} />
          ) : (
            <div className={cn("flex w-full justify-between", yinGap)}>
              <div className={cn(barHSplit, segClass)} />
              <div className={cn(barHSplit, segClass)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const upperBlock = (
    <div
      className={cn(
        "flex w-full flex-col",
        lineInnerGap,
        interactive &&
          "cursor-pointer rounded-lg ring-amber-900/0 transition-shadow hover:ring-2 hover:ring-amber-700/45",
      )}
      onClick={interactive ? onPickUpper : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPickUpper?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {upperIdxs.map((idx) => renderLineRow(idx))}
    </div>
  );

  const lowerBlock = (
    <div
      className={cn(
        "flex w-full flex-col",
        lineInnerGap,
        interactive &&
          "cursor-pointer rounded-lg ring-amber-900/0 transition-shadow hover:ring-2 hover:ring-amber-700/45",
      )}
      onClick={interactive ? onPickLower : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPickLower?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {lowerIdxs.map((idx) => renderLineRow(idx))}
    </div>
  );

  /** 左欄列序與右側一致：上經 idx 5,4,3 → 間隙 → 下經 idx 2,1,0；五爻=idx4、二爻=idx1 */
  const leftStrip =
    tiYongLabels != null ? (
      <div
        className={cn(
          "flex shrink-0 flex-col",
          embeddedInBoard
            ? "w-5 min-w-[1.15rem] sm:w-[38px] md:w-[42px] lg:w-[44px]"
            : "w-[34px] sm:w-[38px] md:w-[42px] lg:w-[44px]",
          blockGap,
        )}
      >
        <div className={cn("flex flex-col", lineInnerGap)}>
          <div className={lineRowClass} aria-hidden />
          <div
            className={cn(
              lineRowClass,
              embeddedInBoard
                ? "text-[1.2rem] font-bold leading-none text-stone-900 sm:text-[2rem] md:text-[2.35rem] lg:text-[2.75rem]"
                : "text-[1.65rem] font-bold leading-none text-stone-900 sm:text-[2rem] md:text-[2.35rem] lg:text-[2.75rem]",
            )}
          >
            <span className="block w-full text-center">{tiYongLabels.line5}</span>
          </div>
          <div className={lineRowClass} aria-hidden />
        </div>
        <div className={cn("flex flex-col", lineInnerGap)}>
          <div className={lineRowClass} aria-hidden />
          <div
            className={cn(
              lineRowClass,
              embeddedInBoard
                ? "text-[1.2rem] font-bold leading-none text-stone-900 sm:text-[2rem] md:text-[2.35rem] lg:text-[2.75rem]"
                : "text-[1.65rem] font-bold leading-none text-stone-900 sm:text-[2rem] md:text-[2.35rem] lg:text-[2.75rem]",
            )}
          >
            <span className="block w-full text-center">{tiYongLabels.line2}</span>
          </div>
          <div className={lineRowClass} aria-hidden />
        </div>
      </div>
    ) : null;

  const lineStack = (
    <div className={cn("flex w-full flex-col items-stretch", blockGap)}>
      {upperBlock}
      {lowerBlock}
    </div>
  );

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-row items-start",
        embeddedInBoard
          ? tiYongLabels != null
            ? "justify-start gap-0.5 sm:gap-2 md:gap-2.5"
            : "justify-center gap-0"
          : "justify-center gap-1.5 sm:gap-2 md:gap-2.5",
      )}
    >
      {leftStrip}
      {embeddedInBoard ? (
        <div className={cn("min-w-0 flex-1 overflow-visible", className)} aria-label="六爻卦象">
          {lineStack}
        </div>
      ) : (
        <div
          className={cn(
            BOARD_PANEL_CLASS,
            "overflow-visible rounded-xl border border-amber-900/25 bg-amber-50/40 px-2 py-2 shadow-inner sm:px-2.5 sm:py-2.5 md:px-3 md:py-3 lg:py-4",
            className,
          )}
          aria-label="六爻卦象"
        >
          {lineStack}
        </div>
      )}
    </div>
  );
}
