"use client";

import {
  LATER_HEAVEN_ORDER,
  elementButtonClasses,
  getTrigram,
  type TrigramId,
} from "@/meihua/lib/bagua";
import { cn } from "@/meihua/lib/cn";

type Props = {
  value: TrigramId;
  onChange: (id: TrigramId) => void;
  /** Outer radius in px from center to button centers */
  radius?: number;
  className?: string;
  /** Show center 「後天八卦」 pill */
  showCompassLabel?: boolean;
};

/**
 * Later Heaven order on a circle: 離正上、坎正下，順時針排列。
 */
export function TrigramWheel({
  value,
  onChange,
  radius = 108,
  className,
  showCompassLabel = false,
}: Props) {
  /** 依半徑縮放卦鈕，避免手機上整圖超出視窗 */
  const btnSize = Math.min(58, Math.max(36, Math.round(radius * 0.28 + 10)));
  const half = btnSize / 2;
  const size = radius * 2 + btnSize + 24;

  return (
    <div
      className={cn("relative mx-auto shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute rounded-full border-2 border-amber-900/30 bg-gradient-to-br from-amber-100/90 to-orange-100/70 shadow-md"
        style={{
          width: size - 8,
          height: size - 8,
          left: 4,
          top: 4,
        }}
      >
        <div className="absolute inset-6 rounded-full border border-amber-900/15 bg-amber-50/30" />
        {LATER_HEAVEN_ORDER.map((id, index) => {
          const t = getTrigram(id);
          const phi = (index * Math.PI) / 4;
          const offsetX = Math.sin(phi) * radius;
          const offsetY = -Math.cos(phi) * radius;
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              title={`${t.symbol} ${t.name}`}
              onClick={() => onChange(id)}
              className={cn(
                "absolute flex items-center justify-center rounded-full font-bold shadow ring-2 transition-transform",
                btnSize >= 52 ? "text-xl sm:text-2xl" : btnSize >= 44 ? "text-lg sm:text-xl" : "text-base sm:text-lg",
                elementButtonClasses(t.element),
                selected
                  ? "z-10 scale-110 ring-amber-950 ring-offset-2 ring-offset-amber-100"
                  : "opacity-90 ring-black/10 hover:z-10 hover:scale-105",
              )}
              style={{
                width: btnSize,
                height: btnSize,
                left: `calc(50% + ${offsetX}px - ${half}px)`,
                top: `calc(50% + ${offsetY}px - ${half}px)`,
              }}
            >
              {t.symbol}
            </button>
          );
        })}
        {showCompassLabel ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-amber-200/50 px-2 py-1 text-xs font-medium text-stone-700 ring-1 ring-amber-900/20">
              後天八卦
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
