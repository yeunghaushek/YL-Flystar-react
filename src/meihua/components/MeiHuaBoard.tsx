"use client";

import { useEffect, useMemo, useState } from "react";
import type { TrigramId } from "@/meihua/lib/bagua";
import { getTrigram } from "@/meihua/lib/bagua";
import { todayEarthlyBranches } from "@/meihua/lib/baziToday";
import {
  linesFromTrigrams,
  mutualHexagram,
  transformedHexagram,
} from "@/meihua/lib/hexagram";
import { kingWenCompoundTitle } from "@/meihua/lib/kingWen";
import { monthQiTable } from "@/meihua/lib/monthQi";
import { getYaoTranslation } from "@/meihua/lib/yaociTranslation";
import { HexagramFigure } from "./HexagramFigure";
import { TrigramWheel } from "./TrigramWheel";
import { cn } from "@/meihua/lib/cn";
import {
  fetchIChingMap,
  getHexTextByLines,
  type IChingHex,
} from "@/meihua/lib/ichingText";
import { getGuaciTranslation } from "@/meihua/lib/guaciTranslation";

const LINE_LABELS = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"] as const;

/** 與下方動爻／月令外框同寬、同邊框與底色（max-w-5xl 由外層包住） */
const MEIHUA_BOARD_CARD =
  "rounded-2xl border border-amber-900/20 bg-amber-50/70 p-3 shadow-inner sm:p-4 md:p-6";

const WHEEL_FALLBACK: TrigramId = "qian";

function pickTrigramWheelRadius(viewportWidth: number): number {
  // 整圖寬度 ≤ 視窗；電腦版半徑上限與原先固定 172 一致
  const pad = 56;
  const maxSize = Math.max(220, viewportWidth - pad);
  const cap = 172;
  const looseUpper = Math.min(cap, Math.floor((maxSize - 60) / 2));
  for (let r = looseUpper; r >= 56; r -= 2) {
    const btn = Math.min(58, Math.max(36, Math.round(r * 0.28 + 10)));
    if (r * 2 + btn + 24 <= maxSize) return r;
  }
  return 56;
}

export function MeiHuaBoard() {
  const [upperId, setUpperId] = useState<TrigramId | null>(null);
  const [lowerId, setLowerId] = useState<TrigramId | null>(null);
  const [movingLine, setMovingLine] = useState<number>(1);
  const [wheelFor, setWheelFor] = useState<null | "upper" | "lower">(null);
  const [wheelRadius, setWheelRadius] = useState(140);
  const [branches, setBranches] = useState<{
    year: string;
    month: string;
    day: string;
  } | null>(null);
  const [ichingMap, setIChingMap] = useState<Record<string, IChingHex> | null>(null);

  useEffect(() => {
    setBranches(todayEarthlyBranches(new Date()));
  }, []);

  useEffect(() => {
    fetchIChingMap().then(setIChingMap).catch(() => setIChingMap({}));
  }, []);

  useEffect(() => {
    function sync() {
      if (typeof window === "undefined") return;
      setWheelRadius(pickTrigramWheelRadius(window.innerWidth));
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const ready = upperId != null && lowerId != null;

  const originalLines = useMemo(() => {
    if (!ready) return null;
    return linesFromTrigrams(lowerId, upperId);
  }, [ready, lowerId, upperId]);

  const mutualLines = useMemo(() => {
    if (!originalLines) return null;
    return mutualHexagram(originalLines);
  }, [originalLines]);

  const changedLines = useMemo(() => {
    if (!originalLines) return null;
    return transformedHexagram(originalLines, movingLine);
  }, [originalLines, movingLine]);

  const monthQi = branches ? monthQiTable(branches.month) : [];
  const originalText = useMemo(() => {
    if (!originalLines || !ichingMap) return null;
    return getHexTextByLines(ichingMap, originalLines);
  }, [originalLines, ichingMap]);
  const movingLineText = useMemo(() => {
    if (!originalText) return null;
    return originalText.lines.find((l) => l.id === movingLine) ?? null;
  }, [originalText, movingLine]);

  return (
    <div className="flex max-w-full flex-col overflow-x-hidden">
      {/* 首屏：卦盤＋動爻／月令佔滿視窗，卦辭需向下捲動才見 */}
      <section className="flex min-h-[calc(100svh-30px)] flex-col justify-center gap-2 overflow-x-hidden px-2 pb-2 pt-1 sm:gap-2 sm:px-4 sm:pb-3 sm:pt-1.5 md:gap-2.5">
        <header className="shrink-0 text-center md:mb-1">
          {branches ? (
            <div className="mx-auto inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border-2 border-amber-900/30 bg-amber-50/90 px-6 py-3 shadow-inner sm:gap-x-8 sm:gap-y-2 sm:px-10 sm:py-4 md:gap-x-10">
              <p className="text-2xl font-bold tracking-wide sm:text-4xl md:text-5xl">
                <span className={cn("mx-2 sm:mx-3", zhiClass(branches.year))}>
                  {branches.year}年
                </span>
                <span className={cn("mx-2 sm:mx-3", zhiClass(branches.month))}>
                  {branches.month}月
                </span>
                <span className={cn("mx-2 sm:mx-3", zhiClass(branches.day))}>
                  {branches.day}日
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-stone-500 sm:text-base">
              今日地支載入中…
            </p>
          )}
        </header>

        <div className="relative mx-auto mt-3 w-full min-w-0 max-w-5xl shrink-0 md:mt-4 md:overflow-visible">
          <div className={MEIHUA_BOARD_CARD}>
            <div className="flex w-full min-w-0 flex-nowrap items-end justify-between gap-1 sm:gap-2 md:gap-4 lg:gap-5">
              {!ready ? (
                <div className="flex flex-1 basis-0 justify-center py-1">
                  <BenGuaColumn
                    upperId={upperId}
                    lowerId={lowerId}
                    onPickUpper={() => setWheelFor("upper")}
                    onPickLower={() => setWheelFor("lower")}
                  />
                </div>
              ) : originalLines ? (
                <HexColumn
                  compoundTitle={kingWenCompoundTitle(originalLines)}
                  lines={originalLines}
                  movingLine={movingLine}
                  movingLineForTiYong={movingLine}
                  tag="本"
                  benColumn
                  inBoardShell
                  interactive
                  onPickUpper={() => setWheelFor("upper")}
                  onPickLower={() => setWheelFor("lower")}
                />
              ) : null}
              <HexColumn
                compoundTitle={
                  mutualLines ? kingWenCompoundTitle(mutualLines) : "—"
                }
                lines={mutualLines}
                movingLine={null}
                tag="互"
                inBoardShell
                empty={!ready}
              />
              <HexColumn
                compoundTitle={
                  changedLines ? kingWenCompoundTitle(changedLines) : "—"
                }
                lines={changedLines}
                movingLine={null}
                tag="變"
                inBoardShell
                empty={!ready}
              />
            </div>
          </div>
        </div>

        {wheelFor ? (
          <div
            className="fixed inset-0 z-[100] flex items-start justify-center bg-white/55 px-3 pb-6 pt-[4.5rem] backdrop-blur-[2px] sm:items-center sm:px-4 sm:pb-8 sm:pt-8"
            role="presentation"
            onClick={() => setWheelFor(null)}
          >
            <section
              className="w-full max-w-lg rounded-2xl border-2 border-amber-900/40 bg-[#f3e9d2] p-5 shadow-2xl ring-1 ring-amber-950/15 sm:max-w-2xl sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby="wheel-dialog-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3
                  id="wheel-dialog-title"
                  className="text-xl font-bold text-stone-900 sm:text-3xl"
                >
                  {wheelFor === "upper" ? "上卦" : "下卦"}
                </h3>
                <button
                  type="button"
                  onClick={() => setWheelFor(null)}
                  className="shrink-0 rounded-full border border-amber-900/30 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-amber-100 sm:text-base"
                >
                  關閉
                </button>
              </div>
              <div className="flex w-full justify-center overflow-x-hidden">
                <TrigramWheel
                  value={
                    wheelFor === "upper"
                      ? (upperId ?? WHEEL_FALLBACK)
                      : (lowerId ?? WHEEL_FALLBACK)
                  }
                  onChange={(id) => {
                    if (wheelFor === "upper") setUpperId(id);
                    else setLowerId(id);
                    setWheelFor(null);
                  }}
                  radius={wheelRadius}
                  showCompassLabel={false}
                />
              </div>
              <p className="mt-4 text-center text-sm text-stone-600 sm:text-base">
                點選卦象確認；點此卡片外的灰色區域關閉
              </p>
            </section>
          </div>
        ) : null}

        <div className="mx-auto w-full min-w-0 max-w-5xl shrink-0 px-0">
          <div
            className={cn(
              MEIHUA_BOARD_CARD,
              "flex min-h-[11.5rem] flex-col gap-4 sm:min-h-[12rem] md:min-h-[14rem] md:gap-5",
              !ready && "opacity-60",
            )}
          >
            {/* 僅框住動爻按鈕 */}
            <div className="rounded-xl border-2 border-amber-900/35 bg-white/75 p-2.5 shadow-sm sm:p-3 md:p-4">
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center md:gap-3.5">
                {LINE_LABELS.map((lab, i) => {
                  const n = i + 1;
                  const active = movingLine === n;
                  return (
                    <button
                      key={lab}
                      type="button"
                      disabled={!ready}
                      onClick={() => setMovingLine(n)}
                      className={cn(
                        "min-h-11 w-full rounded-full border px-2 py-2 text-sm font-medium transition-colors sm:min-h-12 sm:w-auto sm:px-4 sm:text-base md:min-h-[3.25rem] md:px-6 md:text-lg lg:min-h-[3.75rem] lg:px-7 lg:text-xl",
                        !ready && "cursor-not-allowed",
                        active
                          ? "border-amber-900 bg-amber-900 text-amber-50 shadow"
                          : "border-amber-900/35 bg-white/80 text-stone-800 hover:bg-amber-100/80",
                      )}
                    >
                      {lab}
                    </button>
                  );
                })}
              </div>
            </div>
            {monthQi.length > 0 ? (
              <div className="mt-0">
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
                  {monthQi.map((item) => (
                    <div
                      key={`${item.phase}${item.element}`}
                      className="rounded-lg border border-amber-900/25 bg-white/70 px-1 py-2 text-center shadow-sm sm:px-2 sm:py-2.5 md:py-4"
                    >
                      <p className="text-xs text-stone-600 sm:text-sm md:text-base">
                        {item.phase}
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold sm:text-xl md:text-2xl lg:text-3xl",
                          elementClass(item.element),
                        )}
                      >
                        {item.element}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {ready ? (
        <section className="mx-auto mt-0.5 w-full min-w-0 max-w-5xl rounded-2xl border border-amber-900/25 bg-amber-50/60 p-3 shadow-inner sm:mt-1 sm:p-4 md:mt-1.5 md:p-6">
          {originalText ? (
            <div className="space-y-3 md:space-y-5">
              <article className="rounded-xl border border-amber-900/20 bg-white/55 p-3 sm:p-4 md:p-5">
                <p className="text-sm font-semibold text-stone-900 sm:text-base md:text-xl lg:text-2xl">
                  {kingWenCompoundTitle(originalLines)}
                </p>
                <p className="mt-1 text-base leading-relaxed text-stone-900 sm:text-lg md:text-2xl md:leading-relaxed lg:text-[1.75rem]">
                  {originalText.scripture}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-stone-700 md:text-lg md:leading-relaxed lg:text-xl">
                  白話翻譯（只供參考）：{getGuaciTranslation(originalText.id) ?? "（待補）"}
                </p>
              </article>

              <article className="rounded-xl border border-amber-900/20 bg-white/55 p-3 sm:p-4 md:p-5">
                <p className="text-sm font-semibold text-stone-900 sm:text-base md:text-xl lg:text-2xl">
                  動爻（{movingLineText?.name ?? `第${movingLine}爻`}）爻辭原文
                </p>
                <p className="mt-1 text-base leading-relaxed text-stone-900 sm:text-lg md:text-2xl md:leading-relaxed lg:text-[1.75rem]">
                  {movingLineText?.scripture ?? "此卦無對應爻辭資料。"}
                </p>
                {movingLineText ? (
                  <p className="mt-2 text-sm leading-relaxed text-stone-700 md:text-lg md:leading-relaxed lg:text-xl">
                    白話翻譯：
                    {getYaoTranslation(originalText.id, movingLine) ??
                      "（待你提供該卦該爻翻譯原文）"}
                  </p>
                ) : null}
              </article>
            </div>
          ) : (
            <p className="text-center text-sm text-stone-600 md:text-base">
              卦辭資料載入中…
            </p>
          )}
        </section>
      ) : null}

    </div>
  );
}

function BenGuaColumn({
  upperId,
  lowerId,
  onPickUpper,
  onPickLower,
}: {
  upperId: TrigramId | null;
  lowerId: TrigramId | null;
  onPickUpper: () => void;
  onPickLower: () => void;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-[7rem] shrink-0 flex-col items-center sm:max-w-[11rem] md:max-w-[13rem] lg:max-w-[14rem]">
      <p className="mb-2 min-h-[2.75rem] text-center text-sm font-semibold leading-snug text-stone-600 sm:min-h-[3rem] sm:text-base">
        請設定本卦
      </p>
      <div className="w-full rounded-lg border border-dashed border-amber-800/45 bg-amber-50/30 px-2 py-3 sm:py-5">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onPickUpper}
            className="rounded-md border border-amber-900/30 bg-white/40 py-8 text-center text-lg font-semibold text-stone-800 transition-colors hover:bg-amber-100/70 sm:py-10 sm:text-xl"
          >
            上卦
            <br />
            <span className="text-xl font-bold text-amber-950 sm:text-2xl">
              {upperId ? getTrigram(upperId).symbol : "—"}
            </span>
          </button>
          <button
            type="button"
            onClick={onPickLower}
            className="rounded-md border border-amber-900/30 bg-white/40 py-8 text-center text-lg font-semibold text-stone-800 transition-colors hover:bg-amber-100/70 sm:py-10 sm:text-xl"
          >
            下卦
            <br />
            <span className="text-xl font-bold text-amber-950 sm:text-2xl">
              {lowerId ? getTrigram(lowerId).symbol : "—"}
            </span>
          </button>
        </div>
      </div>
      <p className="mt-3 text-xl font-bold text-stone-900 sm:text-2xl">本</p>
    </div>
  );
}

function HexColumn({
  compoundTitle,
  lines,
  movingLine,
  movingLineForTiYong,
  tag,
  benColumn = false,
  inBoardShell = false,
  interactive = false,
  onPickUpper,
  onPickLower,
  empty = false,
}: {
  compoundTitle: string;
  lines: ReturnType<typeof linesFromTrigrams> | null;
  movingLine: number | null;
  movingLineForTiYong?: number | null;
  tag: string;
  /** 僅本卦：體用在 HexagramFigure 左欄與五爻／二爻對齊 */
  benColumn?: boolean;
  /** 與動爻區共用大外框：三等分、體用靠左、單卦無小背框 */
  inBoardShell?: boolean;
  interactive?: boolean;
  onPickUpper?: () => void;
  onPickLower?: () => void;
  empty?: boolean;
}) {
  const hasTiYong = movingLineForTiYong != null;
  const upperTiYong: "體" | "用" = hasTiYong && movingLineForTiYong >= 4 ? "用" : "體";
  const lowerTiYong: "體" | "用" = hasTiYong && movingLineForTiYong >= 4 ? "體" : "用";

  const titleClass = cn(
    "w-full text-center font-extrabold leading-tight",
    inBoardShell
      ? cn(
          "mb-0 min-h-[1.25rem] text-[1.2rem] sm:mb-1 sm:min-h-[2.5rem] sm:text-[2rem] md:min-h-[2.75rem] md:text-[2.35rem] lg:text-[2.75rem]",
          empty ? "text-stone-400" : "text-stone-900",
        )
      : cn(
          "mb-1 min-h-[2.75rem] text-2xl leading-snug sm:mb-1.5 sm:min-h-[2.75rem] sm:text-3xl md:min-h-[3rem] md:text-4xl lg:text-5xl",
          empty ? "text-stone-400" : "text-stone-900",
        ),
  );

  const tagClass = inBoardShell
    ? "text-[1.2rem] font-extrabold text-stone-900 sm:text-[2rem] md:text-[2.35rem] lg:text-[2.75rem]"
    : "text-lg font-extrabold text-stone-900 sm:text-2xl md:text-3xl lg:text-4xl";

  const tiYongLabels =
    benColumn && hasTiYong
      ? { line5: upperTiYong, line2: lowerTiYong }
      : undefined;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col",
        inBoardShell
          ? cn(
              "flex-1 basis-0",
              benColumn ? "items-start" : "items-center",
            )
          : cn(
              "w-full shrink-0 items-center",
              benColumn
                ? "max-w-[min(100%,21rem)] sm:max-w-[min(100%,22rem)]"
                : "max-w-[7rem] sm:max-w-[11rem] md:max-w-[13rem] lg:max-w-[14rem]",
            ),
      )}
    >
      <p
        className={cn(
          titleClass,
          inBoardShell &&
            benColumn &&
            "relative left-[0.6em] sm:left-[0.6em] md:left-[0.6em]",
        )}
      >
        {compoundTitle}
      </p>
      {lines && !empty ? (
        <div className="relative z-10 w-full min-w-0 overflow-visible">
          <HexagramFigure
            lines={lines}
            movingLine={movingLine}
            interactive={interactive}
            onPickUpper={onPickUpper}
            onPickLower={onPickLower}
            className="w-full min-w-0"
            tiYongLabels={tiYongLabels}
            embeddedInBoard={inBoardShell}
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex w-full flex-col justify-center px-1 text-center text-sm text-stone-400 sm:text-base",
            inBoardShell
              ? "min-h-[7rem] rounded-md border border-dashed border-amber-900/20 bg-amber-50/20 py-6 sm:min-h-[9rem] sm:py-10"
              : "rounded-lg border border-amber-900/15 bg-amber-50/25 px-2 py-14 sm:py-20",
          )}
        >
          —
        </div>
      )}
      <p
        className={cn(
          "mt-1 w-full text-center sm:mt-1.5",
          tagClass,
          inBoardShell &&
            benColumn &&
            "relative left-[0.6em] sm:left-[0.6em] md:left-[0.6em]",
        )}
      >
        {tag}
      </p>
    </div>
  );
}

function elementClass(el: "木" | "火" | "土" | "金" | "水"): string {
  switch (el) {
    case "木":
      return "text-emerald-700";
    case "火":
      return "text-red-600";
    case "土":
      return "text-amber-900";
    case "金":
      return "text-yellow-600";
    case "水":
      return "text-slate-700";
  }
}

function zhiClass(zhi: string): string {
  if (["寅", "卯"].includes(zhi)) return "text-emerald-700";
  if (["巳", "午"].includes(zhi)) return "text-red-600";
  if (["申", "酉"].includes(zhi)) return "text-yellow-600";
  if (["亥", "子"].includes(zhi)) return "text-slate-700";
  if (["辰", "戌", "丑", "未"].includes(zhi)) return "text-amber-900";
  return "text-stone-900";
}
