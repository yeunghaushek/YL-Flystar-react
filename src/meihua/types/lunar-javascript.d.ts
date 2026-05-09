declare module "lunar-javascript" {
  export interface EightCharLike {
    getYearZhi(): string;
    getMonthZhi(): string;
    getDayZhi(): string;
  }

  export interface LunarLike {
    getEightChar(): EightCharLike;
  }

  export interface SolarLike {
    getLunar(): LunarLike;
  }

  export const Solar: {
    fromDate(date: Date): SolarLike;
  };
}
