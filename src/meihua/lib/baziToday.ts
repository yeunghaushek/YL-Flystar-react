import { Solar } from "lunar-javascript";

/** 今日八字之地支（年、月、日），依節氣換月（庫內建邏輯） */
export function todayEarthlyBranches(date: Date = new Date()): {
  year: string;
  month: string;
  day: string;
} {
  try {
    const solar = Solar.fromDate(date);
    const ec = solar.getLunar().getEightChar();
    return {
      year: ec.getYearZhi(),
      month: ec.getMonthZhi(),
      day: ec.getDayZhi(),
    };
  } catch {
    return { year: "？", month: "？", day: "？" };
  }
}
