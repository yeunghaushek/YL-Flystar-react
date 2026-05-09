/** 以月支論五行旺相休囚死（含丑辰未戌四季土月） */

const ZHI_GROUP: Record<string, "spring" | "summer" | "autumn" | "winter" | "long"> =
  {
    寅: "spring",
    卯: "spring",
    巳: "summer",
    午: "summer",
    申: "autumn",
    酉: "autumn",
    亥: "winter",
    子: "winter",
    丑: "long",
    辰: "long",
    未: "long",
    戌: "long",
  };

export type QiRow = {
  phase: "旺" | "相" | "休" | "囚" | "死";
  element: "木" | "火" | "土" | "金" | "水";
};

/** 回傳結構化資料，供表格化顯示 */
export function monthQiTable(monthZhi: string): QiRow[] {
  const g = ZHI_GROUP[monthZhi];
  if (!g) return [];

  switch (g) {
    case "spring":
      return [
        { phase: "旺", element: "木" },
        { phase: "相", element: "火" },
        { phase: "休", element: "水" },
        { phase: "囚", element: "金" },
        { phase: "死", element: "土" },
      ];
    case "summer":
      return [
        { phase: "旺", element: "火" },
        { phase: "相", element: "土" },
        { phase: "休", element: "木" },
        { phase: "囚", element: "水" },
        { phase: "死", element: "金" },
      ];
    case "autumn":
      return [
        { phase: "旺", element: "金" },
        { phase: "相", element: "水" },
        { phase: "休", element: "土" },
        { phase: "囚", element: "火" },
        { phase: "死", element: "木" },
      ];
    case "winter":
      return [
        { phase: "旺", element: "水" },
        { phase: "相", element: "木" },
        { phase: "休", element: "金" },
        { phase: "囚", element: "土" },
        { phase: "死", element: "火" },
      ];
    case "long":
      return [
        { phase: "旺", element: "土" },
        { phase: "相", element: "金" },
        { phase: "休", element: "火" },
        { phase: "囚", element: "木" },
        { phase: "死", element: "水" },
      ];
  }
}
