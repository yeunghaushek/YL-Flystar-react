import * as Iztro from "iztro";

const { config, bySolar, byLunar } = Iztro.astro;

config({
  dayDivide: "forward",
  yearDivide: "normal",
  horoscopeDivide: "normal",
  algorithm: "default",
});

const LANGUAGE = "zh-TW";
const FIX_LEAP = true;

function toGenderName(gender) {
  return gender === 0 || gender === "male" ? "male" : "female";
}

/**
 * Build a raw iztro astrolabe from solar or lunar birth data.
 */
export function createAstrolabe({ calendar, year, month, day, birthTime, gender, isLeapMonth = false }) {
  const dateStr = `${year}-${month}-${day}`;
  const genderName = toGenderName(gender);

  if (calendar === 0 || calendar === "solar") {
    return bySolar(dateStr, birthTime, genderName, FIX_LEAP, LANGUAGE);
  }

  return byLunar(dateStr, birthTime, genderName, isLeapMonth, FIX_LEAP, LANGUAGE);
}
