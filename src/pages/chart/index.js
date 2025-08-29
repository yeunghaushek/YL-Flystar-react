import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import { astro } from "iztro";
import { useEffect, useMemo, useState } from "react";

import astrolabeStyle from "@/styles/Astrolabe.module.scss";
import palaceStyle from "@/styles/Palace.module.scss";
import centerPalaceStyle from "@/styles/CenterPalace.module.scss";

import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Checkbox,
  TextField,
  Autocomplete,
  Button,
  InputLabel,
  MenuItem,
  Tooltip,
  Modal,
} from "@mui/material";
import Select from "@mui/material/Select";
import { ArcherContainer, ArcherElement } from "react-archer";

import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InfoIcon from "@mui/icons-material/Info";
import RttIcon from "@mui/icons-material/Rtt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import SwitchAccessShortcutAddIcon from "@mui/icons-material/SwitchAccessShortcutAdd";
import MobiledataOffIcon from "@mui/icons-material/MobiledataOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import AssignmentIcon from "@mui/icons-material/Assignment";

Date.prototype.toLocalDate = function () {
  let tzoffset = this.getTimezoneOffset() * 60000; //offset in milliseconds
  let formattedDateStr = new Date(this.getTime() - tzoffset).toISOString();
  return {
    year: formattedDateStr.substring(0, 4),
    month: parseInt(formattedDateStr.substring(5, 7)),
    day: parseInt(formattedDateStr.substring(8, 10)),
  };
};

const modalStyle = {
  position: "absolute",
  top: "47.5%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "10px",
  border: "0",
  width: "80%",
  maxWidth: "900px",
  backgroundColor: "#ddd",
  boxShadow: 24,
  padding: "20px",
};

const StyledTooltip = ({ title, children, ...props }) => (
  <Tooltip
    {...props}
    title={title}
    placement="right-end"
    arrow
    componentsProps={{
      tooltip: {
        sx: {
          marginLeft: "2px !important",
          padding: "4px 4px",
          backgroundColor: "rgb(16,16,16,0.8)",
        },
      },
      arrow: {
        sx: {
          color: "rgb(16,16,16,0.8)",
        },
      },
    }}
  >
    {children}
  </Tooltip>
);

const StyledTooltipForStar = ({ title, children, ...props }) => (
  <Tooltip
    {...props}
    title={title}
    placement="bottom-end"
    arrow
    componentsProps={{
      tooltip: {
        sx: {
          marginTop: "2px !important",
          padding: "4px 4px",
          backgroundColor: "rgb(16,16,16,0.8)",
        },
      },
      arrow: {
        sx: {
          color: "rgb(16,16,16,0.8)",
        },
      },
    }}
  >
    {children}
  </Tooltip>
);

const birthTimeList = [
  "早子時 (00:00~01:00)",
  "丑時 (01:00~03:00)",
  "寅時 (03:00~05:00)",
  "卯時 (05:00~07:00)",
  "辰時 (07:00~09:00)",
  "巳時 (09:00~11:00)",
  "午時 (11:00~13:00)",
  "未時 (13:00~15:00)",
  "申時 (15:00~17:00)",
  "酉時 (17:00~19:00)",
  "戌時 (19:00~21:00)",
  "亥時 (21:00~23:00)",
  "晚子時 (23:00~00:00)",
];

const starList = [
  "廉貞",
  "破軍",
  "武曲",
  "太陽",
  "天機",
  "天梁",
  "紫微",
  "太陰",
  "天同",
  "文昌",
  "巨門",
  "貪狼",
  "右弼",
  "文曲",
  "左輔",
  "七殺",
  "天府",
  "天相",
];

const solarDayList = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
];

const solarMonthList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

const lunarDayList = [
  "初一",
  "初二",
  "初三",
  "初四",
  "初五",
  "初六",
  "初七",
  "初八",
  "初九",
  "初十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "廿一",
  "廿二",
  "廿三",
  "廿四",
  "廿五",
  "廿六",
  "廿七",
  "廿八",
  "廿九",
  "三十",
];

const lunarMonthList = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

const heavenlyStemToStarIndex = {
  甲: [0, 1, 2, 3],
  乙: [4, 5, 6, 7],
  丙: [8, 4, 9, 0],
  丁: [7, 8, 4, 10],
  戊: [11, 7, 12, 4],
  己: [2, 11, 5, 13],
  庚: [3, 2, 7, 8],
  辛: [10, 3, 13, 9],
  壬: [5, 6, 14, 2],
  癸: [1, 10, 7, 11],
};

const mutagenToIndex = {
  祿: 0,
  權: 1,
  科: 2,
  忌: 3,
};

const getMutagenStyle = (mutagenIndex) => {
  switch (mutagenIndex) {
    case 0:
      return "green";
    case 1:
      return "red";
    case 2:
      return "yellow";
    case 3:
      return "blue";
    default:
      return;
  }
};

export default function Astrolabe() {
  const router = useRouter();
  const [clientWidth, setClientWidth] = useState(-1);
  useEffect(() => {
    setClientWidth(document.body.clientWidth);
  }, []);

  /* useEffect(() => {
    if (clientWidth > -1 && clientWidth <= 767) {
      router.push("/info");
    }
  }, [clientWidth]); */

  const [astrolabe, setAstrolabe] = useState(null);
  const [lifePalaceIndex, setLifePalaceIndex] = useState(-1);
  const [couplePalaceIndex, setCouplePalaceIndex] = useState(-1);
  const [currentDecadalIndex, setCurrentDecadalIndex] = useState(-1);
  const [currentAgeIndex, setCurrentAgeIndex] = useState(-1);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(-1);
  const [currentFirstMonthIndex, setCurrentFirstMonthIndex] = useState(-1);
  const [currentBorrowIndex, setCurrentBorrowIndex] = useState(-1);

  const [showBigLuck, setShowBigLuck] = useState(false);
  const [showSmallLuck, setShowSmallLuck] = useState(false);
  const [showChildLuck, setShowChildLuck] = useState(false);
  const [showSmallMonth, setShowSmallMonth] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);

  const clickDecadal = (palaceIndex) => {
    if (palaceIndex === couplePalaceIndex && currentDecadalIndex === couplePalaceIndex) {
      setShowChildLuck(!showChildLuck);
    } else {
      setCurrentDecadalIndex(palaceIndex);
      if (!showBigLuck) setShowBigLuck(true);
      if (showSmallLuck) setShowSmallLuck(false);
      if (showChildLuck) setShowChildLuck(false);
      if (showSmallMonth) setShowSmallMonth(false);
      if (currentAgeIndex > -1) setCurrentAgeIndex(-1);
      if (currentMonthIndex > -1) setCurrentMonthIndex(-1);
    }
  };

  const getDecadalAge = (ages) => {
    if (currentDecadalIndex < 0) return -1;
    if (showChildLuck) {
      let range = astrolabe.palaces[lifePalaceIndex].decadal.range;
      return ages.find((age) => age >= range[0] && age <= range[1]);
    }
    let range = astrolabe.palaces[currentDecadalIndex].decadal.range;
    return ages.find((age) => age >= range[0] && age <= range[1]);
  };

  const clickAge = (palaceIndex) => {
    setCurrentAgeIndex(palaceIndex);

    let smallLuckPalaces = [];
    for (let i = 0; i < 12; i++) {
      smallLuckPalaces.push(astrolabe.palaces[(lifePalaceIndex - palaceIndex + i + 12) % 12].name);
    }
    let firstMonthIndex = smallLuckPalaces.findIndex((smp) => smp === astrolabe.palaces[0].name);
    setCurrentFirstMonthIndex(firstMonthIndex);

    if (!showSmallLuck) setShowSmallLuck(true);
    if (showSmallMonth) setShowSmallMonth(false);
    if (currentMonthIndex > -1) setCurrentMonthIndex(-1);
  };

  const clickMonth = (palaceIndex) => {
    setCurrentMonthIndex(palaceIndex);
    if (!showSmallMonth) setShowSmallMonth(true);
  };

  const clickBorrow = (palaceIndex) => {
    setCurrentBorrowIndex(palaceIndex);
    if (!showBorrow) setShowBorrow(true);
  };

  const [currentArrows, setCurrentArrows] = useState([]);
  const toggleArrows = (palaceIndex, targetStarIndex, mutagenIndex) => {
    let arrows = currentArrows.slice();
    let targetArrowIndex = arrows.findIndex((arr) => arr[0] === palaceIndex && arr[1] === targetStarIndex);
    if (targetArrowIndex === -1) {
      arrows.push([palaceIndex, targetStarIndex, mutagenIndex]);

      // handle plugin arrow
      if (pluginQuickArrow && (mutagenIndex == 0 || mutagenIndex == 3)) {
        let pluginPalaceIndex = astrolabe.palaces.findIndex(
          (palace) =>
            palace.majorStars.findIndex((star) => star.name === starList[targetStarIndex]) > -1 ||
            palace.minorStars.findIndex((star) => star.name === starList[targetStarIndex]) > -1
        );

        if (pluginPalaceIndex > -1) {
          let pluginStarIndex = starList.findIndex((star) => star === astrolabe.palaces[pluginPalaceIndex].mutagenStars[3]);
          let pluginArrowIndex = arrows.findIndex((arr) => arr[0] === pluginPalaceIndex && arr[1] === pluginStarIndex);
          if (pluginArrowIndex === -1) {
            arrows.push([pluginPalaceIndex, pluginStarIndex, 3]);
          }
        }
      }
      // --------------------
    } else {
      arrows.splice(targetArrowIndex, 1);
    }

    // sort the arrows by mutagen
    arrows.sort((a, b) => a[2] - b[2]);
    setCurrentArrows(arrows);
    closeMutagenPanel();
  };

  const [currentMutagenPanelIndex, setCurrentMutagenPanelIndex] = useState(-1);
  const clickPalace = (palaceIndex) => {
    if (revMutagenPanelIndex > -1) setRevMutagenPanelIndex(-1);
    if (currentMutagenPanelIndex === palaceIndex) setCurrentMutagenPanelIndex(-1);
    else setCurrentMutagenPanelIndex(palaceIndex);
  };

  const [revMutagenPanelIndex, setRevMutagenPanelIndex] = useState(-1);
  const clickStar = (starIndex) => {
    if (currentMutagenPanelIndex > -1) setCurrentMutagenPanelIndex(-1);
    if (revMutagenPanelIndex === starIndex) setRevMutagenPanelIndex(-1);
    else setRevMutagenPanelIndex(starIndex);
  };

  const toggleRevArrows = (targetStarIndex, mutagenIndex) => {
    let targetPalaceIndexes = astrolabe.palaces.flatMap((palace, palaceIndex) => {
      if (palace.mutagenStars[mutagenIndex] === starList[targetStarIndex]) {
        return [palaceIndex];
      }
      return [];
    });

    if (targetPalaceIndexes.length > 0) {
      let arrows = currentArrows.slice();
      let existArrowIndexes = 0;
      for (let i = 0; i < targetPalaceIndexes.length; i++) {
        let targetArrowIndex = arrows.findIndex((arr) => arr[0] === targetPalaceIndexes[i] && arr[2] === mutagenIndex);
        if (targetArrowIndex === -1) {
          arrows.push([targetPalaceIndexes[i], targetStarIndex, mutagenIndex]);
        } else {
          existArrowIndexes++;
        }
      }
      if (existArrowIndexes === targetPalaceIndexes.length) {
        arrows = arrows.filter((arr) => !(targetPalaceIndexes.includes(arr[0]) && arr[2] === mutagenIndex));
      }

      // handle plugin arrow
      if (pluginQuickArrow && (mutagenIndex == 0 || mutagenIndex == 3)) {
        let pluginPalaceIndex = astrolabe.palaces.findIndex(
          (palace) =>
            palace.majorStars.findIndex((star) => star.name === starList[targetStarIndex]) > -1 ||
            palace.minorStars.findIndex((star) => star.name === starList[targetStarIndex]) > -1
        );

        if (pluginPalaceIndex > -1) {
          let pluginStarIndex = starList.findIndex((star) => star === astrolabe.palaces[pluginPalaceIndex].mutagenStars[3]);
          let pluginArrowIndex = arrows.findIndex((arr) => arr[0] === pluginPalaceIndex && arr[1] === pluginStarIndex);
          if (pluginArrowIndex === -1) {
            arrows.push([pluginPalaceIndex, pluginStarIndex, 3]);
          }
        }
      }
      // --------------------

      // sort the arrows by mutagen
      arrows.sort((a, b) => a[2] - b[2]);
      setCurrentArrows(arrows);
      //console.log(arrows);
    }
    closeMutagenPanel();
  };

  const closeMutagenPanel = () => {
    if (currentMutagenPanelIndex > -1) setCurrentMutagenPanelIndex(-1);
    if (revMutagenPanelIndex > -1) setRevMutagenPanelIndex(-1);
  };

  const [showInfo, setShowInfo] = useState(true);
  const toggleInfo = () => {
    if (showTextfield) setShowTextfield(false);
    setShowInfo(!showInfo);
  };

  const [showTextfield, setShowTextfield] = useState(false);
  const [note, setNote] = useState("");
  const toggleTextfield = () => {
    if (showInfo) setShowInfo(false);
    setShowTextfield(!showTextfield);
  };

  const handleNote = (event) => {
    setNote(event.target.value);
  };

  const [pluginSmallMonth, setPluginSmallMonth] = useState(true);
  const togglePluginSmallMonth = () => {
    if (pluginSmallMonth) {
      setShowSmallMonth(false);
      setCurrentMonthIndex(-1);
    }
    setPluginSmallMonth(!pluginSmallMonth);
  };

  const [pluginBorrow, setPluginBorrow] = useState(false);
  const togglePluginBorrow = () => {
    if (pluginBorrow) {
      setShowBorrow(false);
      setCurrentBorrowIndex(-1);
    }
    setPluginBorrow(!pluginBorrow);
  };

  const [pluginUnderline, setPluginUnderline] = useState(false);
  const togglePluginUnderline = () => {
    setPluginUnderline(!pluginUnderline);
  };

  const [pluginQuickArrow, setPluginQuickArrow] = useState(false);
  const togglePluginQuickArrow = () => {
    setPluginQuickArrow(!pluginQuickArrow);
  };

  const cleanArrows = () => {
    if (currentMutagenPanelIndex > -1) setCurrentMutagenPanelIndex(-1);
    if (revMutagenPanelIndex > -1) setRevMutagenPanelIndex(-1);
    setCurrentArrows([]);
  };

  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const [name, setName] = useState("");
  const [gender, setGender] = useState(0);
  const [calendar, setCalendar] = useState(0);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthTime, setBirthTime] = useState(0);

  const handleName = (event) => {
    setName(event.target.value);
  };

  const handleGender = (event) => {
    setGender(event.target.value);
  };

  const handleCalendar = (event) => {
    setCalendar(event.target.value);
    if (event.target.value == 0) setIsLeapMonth(false);
  };

  const handleLeapMonth = (event) => {
    setIsLeapMonth(event.target.checked);
  };

  const today = new Date().toLocalDate();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [day, setDay] = useState(today.day);
  const [isValidBirthday, setIsValidBirthday] = useState(true);

  const handleYear = (event) => {
    if (event.target.value.length > 4) return;
    let yystr = event.target.value.replace(/[^\d]/g, "");
    if (!yystr || yystr === "") {
      setYear("");
    } else setYear(yystr);
  };

  const handleMonth = (event) => {
    setMonth(event.target.value);
  };

  const handleDay = (event) => {
    setDay(event.target.value);
  };

  const handleBirthTime = (event) => {
    setBirthTime(event.target.value);
  };

  useEffect(() => {
    if (calendar == 1) {
      if (day > 30) setDay(30);
    }
  }, [calendar]);

  const generateAstrolabe = () => {
    let astrolabe;
    if (calendar == 0) {
      astrolabe = astro.astrolabeBySolarDate(`${year}-${month}-${day}`, birthTime, gender == 0 ? "male" : "female", true, "zh-TW");
    } else {
      astrolabe = astro.astrolabeByLunarDate(
        `${year}-${month}-${day}`,
        birthTime,
        gender == 0 ? "male" : "female",
        isLeapMonth,
        true,
        "zh-TW"
      );
    }
    let lifePalaceIndex = astrolabe.palaces.findIndex((pItem) => pItem.name === "命宮");
    let lifePalaceMutagenStars = heavenlyStemToStarIndex[astrolabe.palaces[lifePalaceIndex].decadal.heavenlyStem].map(
      (item) => starList[item]
    );

    let couplePalaceIndex = astrolabe.palaces.findIndex((pItem) => pItem.name === "夫妻" || pItem.name === "夫妻宮");

    let myAstrolabe = {
      chineseDate: astrolabe.chineseDate.replaceAll("醜", "丑"),
      solarDate: astrolabe.solarDate,
      fiveElementsClass: astrolabe.fiveElementsClass,
      lunarDate: `${astrolabe.lunarDate.replaceAll("腊", "臘").replaceAll("闰", "閏")}`,
      time: astrolabe.time,
      timeRange: astrolabe.timeRange,
      palaces: astrolabe.palaces.map((pItem, pIndex) => {
        let majorStars = pItem.majorStars.flatMap((star) => {
          if (starList.includes(star.name)) {
            return [
              {
                name: star.name,
                mutagen: star.mutagen,
                hollowMutagen:
                  lifePalaceMutagenStars.findIndex((s) => star.name === s) > -1
                    ? Object.keys(mutagenToIndex).find(
                        (key) => mutagenToIndex[key] === lifePalaceMutagenStars.findIndex((s) => star.name === s)
                      )
                    : "",
              },
            ];
          }
          return [];
        });
        let minorStars = pItem.minorStars.flatMap((star) => {
          if (starList.includes(star.name)) {
            return [
              {
                name: star.name,
                mutagen: star.mutagen,
                hollowMutagen:
                  // find '祿權科忌' based on mutagenIndex (0,1,2,3)
                  lifePalaceMutagenStars.findIndex((s) => star.name === s) > -1
                    ? Object.keys(mutagenToIndex).find(
                        (key) => mutagenToIndex[key] === lifePalaceMutagenStars.findIndex((s) => star.name === s)
                      )
                    : "",
              },
            ];
          }
          return [];
        });
        let mutagenStars = heavenlyStemToStarIndex[pItem.decadal.heavenlyStem].map((starIndex) => starList[starIndex]);
        return {
          name:
            pItem.name === "僕役" ? "交友宮" : pItem.name === "官祿" ? "事業宮" : pItem.name === "命宮" ? pItem.name : `${pItem.name}宮`,
          ages: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(
            (item, index) =>
              astrolabe.rawDates.lunarDate.lunarYear -
              (astrolabe.rawDates.lunarDate.lunarYear % 12) +
              6 +
              pIndex +
              index * 12 -
              astrolabe.rawDates.lunarDate.lunarYear +
              1
          ),

          decadal: { ...pItem.decadal, earthlyBranch: pItem.decadal.earthlyBranch.replaceAll("醜", "丑") },
          majorStars: majorStars,
          minorStars: minorStars,
          mutagenStars: mutagenStars,
          outsideMutagenIndexes: mutagenStars.flatMap((mStar, mIndex) => {
            if (majorStars.find((star) => star.name === mStar) || minorStars.find((star) => star.name === mStar)) {
              return [mIndex];
            }
            return [];
          }),
          insideMutagenIndexes: mutagenStars.flatMap((mStar, mIndex) => {
            if (
              astrolabe.palaces[(pIndex + 6) % 12].majorStars.find((star) => star.name === mStar) ||
              astrolabe.palaces[(pIndex + 6) % 12].minorStars.find((star) => star.name === mStar)
            ) {
              return [mIndex];
            }
            return [];
          }),
        };
      }),
      lunarYear: astrolabe.rawDates.lunarDate.lunarYear,
      name: name,
      gender:
        gender == 0
          ? astrolabe.rawDates.lunarDate.lunarYear % 2 == 0
            ? "陽男"
            : "陰男"
          : gender == 1
          ? astrolabe.rawDates.lunarDate.lunarYear % 2 == 0
            ? "陽女"
            : "陰女"
          : "",
      isLeapMonth: isLeapMonth,
    };

    //console.log(myAstrolabe);

    setLifePalaceIndex(lifePalaceIndex);
    setCouplePalaceIndex(couplePalaceIndex);
    setAstrolabe(myAstrolabe);
    setShowSearch(false);
    setShowInfo(true);
    setShowTextfield(false);
    setNote("");
    setShowSmallLuck(false);
    setShowSmallMonth(false);
    setCurrentAgeIndex(-1);
    setCurrentMonthIndex(-1);
    setCurrentArrows([]);

    let currentDecadalIndex = myAstrolabe.palaces.findIndex(
      (palace) =>
        new Date().toLocalDate().year - myAstrolabe.lunarYear + 1 >= palace.decadal.range[0] &&
        new Date().toLocalDate().year - myAstrolabe.lunarYear + 1 <= palace.decadal.range[1]
    );

    if (currentDecadalIndex > -1 && currentDecadalIndex !== lifePalaceIndex) clickDecadal(currentDecadalIndex);
    else {
      // not find -> less than liftPalace Range
      // <= lifePalace -> childLuck
      clickDecadal(couplePalaceIndex);
      setShowChildLuck(true);
    }

    if (inFavList() === -1) setCurrentFavIndex(-1);

    /* if (Object.keys(router.query).length === 0) {
      updateUrlParams();
    } */
  };

  useEffect(() => {
    let isValid = true;
    if (year === "") isValid = false;
    if (isNaN(year)) isValid = false;
    if (parseInt(year) < 1900) isValid = false;
    if (parseInt(year) > 2100) isValid = false;
    if (calendar == 0) {
      if ([4, 6, 9, 11].includes(month) && day > 30) isValid = false;
      if (month == 2 && year % 4 == 0 && day > 29) isValid = false;
      if (month == 2 && year % 4 !== 0 && day > 28) isValid = false;
    }
    setIsValidBirthday(isValid);
  }, [calendar, year, month, day]);

  const addDay = () => {
    /** Feb */
    if (year % 4 != 0 && month == 2 && day == 28) {
      setMonth(3);
      setDay(1);
    } else if (year % 4 == 0 && month == 2 && day == 29) {
      setMonth(3);
      setDay(1);
    } else if (month == 12 && day == 31) {
      /** Dec */
      setYear(year + 1);
      setMonth(1);
      setDay(1);
    } else if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10) && day == 31) {
      /** Month with 31 days */
      setMonth(month + 1);
      setDay(1);
    } else if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 30) {
      /** Month with 30 days */
      setMonth(month + 1);
      setDay(1);
    } else {
      /** Normal Add Day */
      setDay(day + 1);
    }
  };

  const minusDay = () => {
    /** Mar -> Feb */
    if (year % 4 != 0 && month == 3 && day == 1) {
      setMonth(2);
      setDay(28);
    } else if (year % 4 == 0 && month == 3 && day == 1) {
      setMonth(2);
      setDay(29);
    } else if (month == 1 && day == 1) {
      /** Jan -> Dec */
      setYear(year - 1);
      setMonth(12);
      setDay(31);
    } else if ((month == 2 || month == 4 || month == 6 || month == 8 || month == 9 || month == 11) && day == 1) {
      /** Month -> Month with 31 days */
      setMonth(month - 1);
      setDay(31);
    } else if ((month == 5 || month == 7 || month == 10 || month == 12) && day == 1) {
      /** Month -> Month with 30 days */
      setMonth(month - 1);
      setDay(30);
    } else {
      /** Normal Minus Day */
      setDay(day - 1);
    }
  };

  const addBirthTime = async () => {
    if (birthTime < 12) {
      setBirthTime(birthTime + 1);
      //setUpdateCounter(updateCounter + 1);
      setBirthTimeCounter(birthTimeCounter + 1);
    } else {
      addDay();
      setBirthTime(0);
      //setUpdateCounter(updateCounter + 1);
      setBirthTimeCounter(birthTimeCounter + 1);
    }
  };

  const reduceBirthTime = () => {
    if (birthTime > 0) {
      setBirthTime(birthTime - 1);
      //setUpdateCounter(updateCounter + 1);
      setBirthTimeCounter(birthTimeCounter + 1);
    } else {
      minusDay();
      setBirthTime(12);
      //setUpdateCounter(updateCounter + 1);
      setBirthTimeCounter(birthTimeCounter + 1);
    }
  };

  const [birthTimeCounter, setBirthTimeCounter] = useState(0);

  useEffect(() => {
    if (birthTimeCounter > 0) {
      updateUrlParams();
    }
  }, [birthTimeCounter]);

  const [favList, setFavList] = useState([]);
  const [currentFavIndex, setCurrentFavIndex] = useState(-1);
  const addFavList = () => {
    let favs = favList.slice();
    favs.push({ name, gender, calendar, year, month, day, birthTime, isLeapMonth });
    setFavList(favs);
    setCurrentFavIndex(favs.length - 1);
    localStorage.setItem("favList", JSON.stringify(favs));
  };

  const inFavList = () => {
    return favList.findIndex((fav) => {
      return (
        fav.name === name &&
        fav.gender === gender &&
        fav.calendar === calendar &&
        fav.year === year &&
        fav.month === month &&
        fav.day === day &&
        fav.birthTime === birthTime &&
        fav.isLeapMonth === isLeapMonth
      );
    });
  };

  const removeFavList = () => {
    let favs = favList.slice();
    let targetFavIndex = inFavList();
    if (targetFavIndex > -1) {
      favs.splice(targetFavIndex, 1);
      setFavList(favs);
      setCurrentFavIndex(-1);
      localStorage.setItem("favList", JSON.stringify(favs));
    }
  };

  const selectFav = (event) => {
    setCurrentFavIndex(event.target.value);
  };

  useEffect(() => {
    let savedFavList = localStorage.getItem("favList");
    if (savedFavList) setFavList(JSON.parse(savedFavList));
  }, []);

  useEffect(() => {
    if (currentFavIndex > -1) {
      setName(favList[currentFavIndex].name);
      setGender(favList[currentFavIndex].gender);
      setCalendar(favList[currentFavIndex].calendar);
      setYear(favList[currentFavIndex].year);
      setMonth(favList[currentFavIndex].month);
      setDay(favList[currentFavIndex].day);
      setBirthTime(favList[currentFavIndex].birthTime);
      setIsLeapMonth(favList[currentFavIndex].isLeapMonth);
      //setUpdateCounter(updateCounter + 1);
      setFindFavCounter(findFavCounter + 1);
    }
  }, [currentFavIndex]);

  const [findFavCounter, setFindFavCounter] = useState(0);

  useEffect(() => {
    if (findFavCounter > 0) {
      updateUrlParams();
    }
  }, [findFavCounter]);

  const [updateCounter, setUpdateCounter] = useState(0);
  useEffect(() => {
    generateAstrolabe();
  }, [updateCounter]);

  useEffect(() => {
    /**
         *  birthday: "2023-9-4",
            birthTime: 1,
            gender: "female",
            birthdayType: "solar",
            isLeapMonth: false,
            fixLeap: true,
            lang: "zh-TW",
         */
    //setUpdateCounter(updateCounter + 1);
    //updateUrlParams();
  }, []);

  useEffect(() => {
    /* let ast1 = astro.astrolabeByLunarDate(`1999-07-19`, birthTime, gender, true, true, "zh-TW");
    let ast2 = astro.astrolabeByLunarDate(`1999-07-19`, birthTime, gender, false, true, "zh-TW");
    let ast3 = astro.astrolabeByLunarDate(`1999-07-19`, birthTime, gender, true, false, "zh-TW");
    let ast4 = astro.astrolabeByLunarDate(`1999-07-19`, birthTime, gender, false, false, "zh-TW"); */
    //console.log(ast1);
    //console.log(ast2);
    //console.log(ast3);
    //console.log(ast4);
  }, []);

  const { n, g, c, y, m, d, bt, lm } = router.query;
  useEffect(() => {
    console.log(n, g, c, y, m, d, bt, lm);
    //console.log(router.pathname);
    //console.log(router.query);
    if (g && c && y && m && d && bt && lm) {
      // c == 0 ? "陽曆" : "農曆"
      // g == 0 ? "男" : "女"
      // lm == 1 ? "閏月" : "非閏月"

      if (n) setName(n);
      setName(n);
      setGender(parseInt(g));
      setCalendar(parseInt(c));
      setYear(parseInt(y));
      setMonth(parseInt(m));
      setDay(parseInt(d));
      setBirthTime(parseInt(bt));
      setIsLeapMonth(lm === "1" ? true : false);
      setUpdateCounter(updateCounter + 1);
    }
  }, [n, g, c, y, m, d, bt, lm]);

  const getFlowPath = () => {
    return `/flow?n=${name}&g=${gender}&c=${calendar}&y=${year}&m=${month}&d=${day}&bt=${birthTime}&lm=${isLeapMonth ? "1" : "0"}`
  }

  const updateUrlParams = () => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          n: name,
          g: gender,
          c: calendar,
          y: year,
          m: month,
          d: day,
          bt: birthTime,
          lm: isLeapMonth ? "1" : "0",
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <>
      <Head>
        <title>排盤 - 飛星紫微斗數</title>
        <meta
          name="description"
          content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
          opengraph={{
            title: "星軌堂 - 您的智能人生定位系統",
            description: "發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。",
            images: [
              { url: "/og.png" },
            ],
          }}
        />
      </Head>
      <div className={`header show`}>
        <div className="left info-header">
          <Link href="/">
            <div className="logo">
              <img src={"logo.png"} alt="logo" />
              <div className="name">星軌堂</div>
            </div>
          </Link>
          <Link href="/chart">
            <button>線上排盤</button>
          </Link>
          <Link href="/info#begin">
            <button>遇見命理師</button>
          </Link>
          {/* <Link href="/info#analysis">
            <button>命理分析</button>
          </Link>
          <Link href="/info#course">
            <button>教學課程</button>
          </Link>
          <Link href="/info#question">
            <button>常見問題</button>
          </Link>
          <Link href="/info#contact">
            <button>立即預約</button>
          </Link> */}
          <Link href="/blog">
            <button>網誌</button>
          </Link>
        </div>
        <div className="right">
          <a target="_blank" href="https://buy.stripe.com/cN2cPsa6XaLMauQ001">
            支持我們
          </a>
        </div>
      </div>

      <div className="container">
        <Modal open={showSearch} onClose={toggleSearch} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={modalStyle}>
            <br />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <TextField label="姓名" name="name" value={name} onChange={handleName} />
                </FormControl>
              </Grid>
              <Grid item xs={4} md={3} sx={{ marginTop: -1, textAlign: "center" }}>
                <FormControl>
                  <RadioGroup aria-labelledby="gender-radio" name="gender-radio-group" value={gender} onChange={handleGender}>
                    <FormControlLabel
                      value={0}
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                            },
                          }}
                        />
                      }
                      label="男"
                    />
                    <FormControlLabel
                      value={1}
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                            },
                          }}
                        />
                      }
                      label="女"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={4} md={3} sx={{ marginTop: -1 }}>
                <FormControl>
                  <RadioGroup aria-labelledby="calendar-radio" name="calendar-radio-group" value={calendar} onChange={handleCalendar}>
                    <FormControlLabel
                      value={0}
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                            },
                          }}
                        />
                      }
                      label="陽曆"
                    />
                    <FormControlLabel
                      value={1}
                      control={
                        <Radio
                          sx={{
                            "& .MuiSvgIcon-root": {
                              fontSize: 18,
                            },
                          }}
                        />
                      }
                      label="農曆"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={4} md={2} sx={{ marginTop: -1 }}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isLeapMonth}
                        onChange={handleLeapMonth}
                        name="leap-month"
                        disabled={calendar == 0}
                        sx={{ "& .MuiSvgIcon-root": { fontSize: 20 } }}
                      />
                    }
                    label="閏月"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <TextField label="年" name="year" value={year} onChange={handleYear} />
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                {calendar == 1 ? (
                  <FormControl fullWidth>
                    <InputLabel id="lunarMonth-label">月</InputLabel>
                    <Select labelId="lunarMonth-label" id="lunarMonth" name="lunarMonth" value={month} label="月" onChange={handleMonth}>
                      {lunarMonthList.map((item, index) => {
                        return (
                          <MenuItem value={index + 1} key={`key-lunarMonth-${index}`}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel id="solarMonth-label">月</InputLabel>
                    <Select labelId="solarMonth-label" id="solarMonth" name="solarMonth" value={month} label="月" onChange={handleMonth}>
                      {solarMonthList.map((item, index) => {
                        return (
                          <MenuItem value={index + 1} key={`key-solarMonth-${index}`}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={6} md={4}>
                {calendar == 1 ? (
                  <FormControl fullWidth>
                    <InputLabel id="lunarDay-label">日</InputLabel>
                    <Select
                      labelId="lunarDay-label"
                      id="lunarDay"
                      name="lunarDay"
                      value={day}
                      label="日"
                      onChange={handleDay}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 450 } } }}
                    >
                      {lunarDayList.map((item, index) => {
                        return (
                          <MenuItem value={index + 1} key={`key-lunarDay-${index}`}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel id="solarDay-label">日</InputLabel>
                    <Select
                      labelId="solarDay-label"
                      id="solarDay"
                      name="solarDay"
                      value={day}
                      label="日"
                      onChange={handleDay}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 450 } } }}
                    >
                      {solarDayList.map((item, index) => {
                        return (
                          <MenuItem value={index + 1} key={`key-solarDay-${index}`}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                )}
              </Grid>
              <Grid item xs={4}></Grid>
              {/* 
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField label="出生日期" name="birthday" value={`${year}-${month}-${day}`} onChange={() => {}} />
                  </FormControl>
                </Grid> */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="birthTime-label">時辰</InputLabel>
                  <Select
                    labelId="birthTime-label"
                    id="birthTime"
                    name="birthTime"
                    value={birthTime}
                    label="時辰"
                    onChange={handleBirthTime}
                  >
                    {birthTimeList.map((item, index) => {
                      return (
                        <MenuItem value={index} key={`key-birthTime-${index}`}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ height: "55px" }}
                    disabled={!isValidBirthday}
                    //onClick={() => setUpdateCounter(updateCounter + 1)}
                    onClick={updateUrlParams}
                  >
                    <AssignmentIcon />
                  </Button>
                </FormControl>
              </Grid>
            </Grid>
            <br />
          </Box>
        </Modal>
        <ArcherContainer lineStyle={"straight"} strokeWidth={1} svgContainerStyle={{ zIndex: 10 }}>
          {astrolabe ? (
            <div className={astrolabeStyle.astrolabe}>
              {astrolabe.palaces.map((palaceItem, palaceIndex) => {
                return (
                  <div className={palaceStyle.palace} style={{ gridArea: `g${palaceIndex}` }} key={`key-palace-${palaceIndex}`}>
                    <div className={palaceStyle.header}>
                      <div className={palaceStyle.left}>
                        {/* {palaceIndex} */}
                        {pluginBorrow ? (
                          <div className={`${palaceStyle.borrow} ${currentBorrowIndex === palaceIndex ? palaceStyle.selected : ``}`}>
                            <VisibilityIcon
                              sx={{
                                fontSize: "16px",
                              }}
                              onClick={() => {
                                clickBorrow(palaceIndex);
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className={palaceStyle.right}>
                        {palaceItem.minorStars.map((star, sIndex) => {
                          return (
                            <div className={palaceStyle.minor} key={`key-minorStars-${sIndex}`}>
                              <div className={palaceStyle.starContainer}>
                                <div className={palaceStyle.starLeft}>
                                  <StyledTooltipForStar
                                    onClose={closeMutagenPanel}
                                    open={revMutagenPanelIndex === starList.findIndex((s) => s === star.name)}
                                    disableFocusListener
                                    disableHoverListener
                                    disableTouchListener
                                    title={
                                      <div>
                                        <button
                                          style={{
                                            backgroundColor: "#181",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              0
                                            )
                                          }
                                        >
                                          祿
                                        </button>

                                        <button
                                          style={{
                                            backgroundColor: "#d00",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              1
                                            )
                                          }
                                        >
                                          權
                                        </button>
                                        <br />
                                        <button
                                          style={{
                                            backgroundColor: "#00d",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              3
                                            )
                                          }
                                        >
                                          忌
                                        </button>
                                        <button
                                          style={{
                                            backgroundColor: "#eb0",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              2
                                            )
                                          }
                                        >
                                          科
                                        </button>
                                      </div>
                                    }
                                  >
                                    <button
                                      className={palaceStyle.star}
                                      onClick={() => clickStar(starList.findIndex((s) => s === star.name))}
                                    >
                                      <div>{star.name[0]}</div>
                                      <ArcherElement id={`star-${starList.findIndex((s) => s === star.name)}`}>
                                        <div>{star.name[1]}</div>
                                      </ArcherElement>
                                    </button>
                                  </StyledTooltipForStar>
                                </div>
                                <div className={palaceStyle.starRight}>
                                  {pluginUnderline && currentArrows.length > 0
                                    ? currentArrows.map((arrow) => {
                                        if (arrow[1] == starList.findIndex((s) => s === star.name))
                                          return <div className={`${palaceStyle.line} ${palaceStyle[getMutagenStyle(arrow[2])]}`}></div>;
                                        return null;
                                      })
                                    : null}
                                </div>
                              </div>

                              {star.mutagen ? (
                                <div className={`${palaceStyle.mutagen} ${palaceStyle[getMutagenStyle(mutagenToIndex[star.mutagen])]}`}>
                                  {star.mutagen}
                                </div>
                              ) : null}

                              {star.hollowMutagen && palaceIndex != lifePalaceIndex ? (
                                <div
                                  className={`${palaceStyle.hollowMutagen} ${
                                    palaceStyle[getMutagenStyle(mutagenToIndex[star.hollowMutagen])]
                                  }`}
                                >
                                  {star.hollowMutagen}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                        {palaceItem.majorStars.map((star, sIndex) => {
                          return (
                            <div className={palaceStyle.major} key={`key-majorStars-${sIndex}`}>
                              <div className={palaceStyle.starContainer}>
                                <div className={palaceStyle.starLeft}>
                                  <StyledTooltipForStar
                                    onClose={closeMutagenPanel}
                                    open={revMutagenPanelIndex === starList.findIndex((s) => s === star.name)}
                                    disableFocusListener
                                    disableHoverListener
                                    disableTouchListener
                                    title={
                                      <div>
                                        <button
                                          style={{
                                            backgroundColor: "#181",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              0
                                            )
                                          }
                                        >
                                          祿
                                        </button>

                                        <button
                                          style={{
                                            backgroundColor: "#d00",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              1
                                            )
                                          }
                                        >
                                          權
                                        </button>
                                        <br />
                                        <button
                                          style={{
                                            backgroundColor: "#00d",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              3
                                            )
                                          }
                                        >
                                          忌
                                        </button>
                                        <button
                                          style={{
                                            backgroundColor: "#eb0",
                                            padding: "1px 3px",
                                            margin: "1px",
                                            fontSize: "14px",
                                            color: "#fff",
                                            border: 0,
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                          }}
                                          onClick={() =>
                                            toggleRevArrows(
                                              starList.findIndex((s) => s === star.name),
                                              2
                                            )
                                          }
                                        >
                                          科
                                        </button>
                                      </div>
                                    }
                                  >
                                    <button
                                      className={palaceStyle.star}
                                      onClick={() => clickStar(starList.findIndex((s) => s === star.name))}
                                    >
                                      <div>{star.name[0]}</div>
                                      <ArcherElement id={`star-${starList.findIndex((s) => s === star.name)}`}>
                                        <div>{star.name[1]}</div>
                                      </ArcherElement>
                                    </button>
                                  </StyledTooltipForStar>
                                </div>
                                <div className={palaceStyle.starRight}>
                                  {pluginUnderline && currentArrows.length > 0
                                    ? currentArrows.map((arrow) => {
                                        if (arrow[1] == starList.findIndex((s) => s === star.name))
                                          return <div className={`${palaceStyle.line} ${palaceStyle[getMutagenStyle(arrow[2])]}`}></div>;
                                        return null;
                                      })
                                    : null}
                                </div>
                              </div>

                              {star.mutagen ? (
                                <div className={`${palaceStyle.mutagen} ${palaceStyle[getMutagenStyle(mutagenToIndex[star.mutagen])]}`}>
                                  {star.mutagen}
                                </div>
                              ) : null}

                              {star.hollowMutagen && palaceIndex != lifePalaceIndex ? (
                                <div
                                  className={`${palaceStyle.hollowMutagen} ${
                                    palaceStyle[getMutagenStyle(mutagenToIndex[star.hollowMutagen])]
                                  }`}
                                >
                                  {star.hollowMutagen}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <StyledTooltip
                      onClose={closeMutagenPanel}
                      open={currentMutagenPanelIndex === palaceIndex}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title={
                        <div>
                          <button
                            style={{
                              backgroundColor: "#181",
                              padding: "1px 4px",
                              margin: "2px",
                              fontSize: "18px",
                              color: "#fff",
                              border: 0,
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              toggleArrows(
                                palaceIndex,
                                starList.findIndex((star) => star === palaceItem.mutagenStars[0]),
                                0
                              )
                            }
                          >
                            祿
                          </button>

                          <button
                            style={{
                              backgroundColor: "#d00",
                              padding: "1px 4px",
                              margin: "2px",
                              fontSize: "18px",
                              color: "#fff",
                              border: 0,
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              toggleArrows(
                                palaceIndex,
                                starList.findIndex((star) => star === palaceItem.mutagenStars[1]),
                                1
                              )
                            }
                          >
                            權
                          </button>
                          <br />
                          <button
                            style={{
                              backgroundColor: "#00d",
                              padding: "1px 4px",
                              margin: "2px",
                              fontSize: "18px",
                              color: "#fff",
                              border: 0,
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              toggleArrows(
                                palaceIndex,
                                starList.findIndex((star) => star === palaceItem.mutagenStars[3]),
                                3
                              )
                            }
                          >
                            忌
                          </button>
                          <button
                            style={{
                              backgroundColor: "#eb0",
                              padding: "1px 4px",
                              margin: "2px",
                              fontSize: "18px",
                              color: "#fff",
                              border: 0,
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              toggleArrows(
                                palaceIndex,
                                starList.findIndex((star) => star === palaceItem.mutagenStars[2]),
                                2
                              )
                            }
                          >
                            科
                          </button>
                        </div>
                      }
                    >
                      <div className={palaceStyle.body} onClick={() => clickPalace(palaceIndex)}>
                        {currentArrows.flatMap((arrow) => {
                          if (arrow[0] === palaceIndex) {
                            return [
                              <ArcherElement
                                id={`arrow-${arrow[0]}-${arrow[2]}`}
                                key={`key-arrow-${arrow[0]}-${arrow[2]}`}
                                relations={[
                                  {
                                    targetId: `star-${arrow[1]}`,
                                    targetAnchor: "top",
                                    sourceAnchor: "middle",
                                    style: {
                                      strokeColor:
                                        arrow[2] === 0
                                          ? "#181"
                                          : arrow[2] === 1
                                          ? "#d00"
                                          : arrow[2] === 2
                                          ? "#eb0"
                                          : arrow[2] === 3
                                          ? "#00d"
                                          : "#111",
                                      strokeWidth: 1.5,
                                    },
                                  },
                                ]}
                              >
                                <div></div>
                              </ArcherElement>,
                            ];
                          }
                          return [];
                        })}
                      </div>
                    </StyledTooltip>

                    <div className={palaceStyle.footer}>
                      <div className={palaceStyle.left}>
                        {pluginSmallMonth && currentAgeIndex > -1 ? (
                          <div className={`${palaceStyle.month} ${currentMonthIndex === palaceIndex ? palaceStyle.selected : ``}`}>
                            <button onClick={() => clickMonth(palaceIndex)}>
                              {lunarMonthList[(palaceIndex - currentFirstMonthIndex + 12) % 12]}
                              {/* <br />
                                {lunarMonthList[(palaceIndex - currentAgeIndex + 9 + 12) % 12]} */}
                            </button>
                          </div>
                        ) : null}
                        {currentDecadalIndex > -1 && getDecadalAge(palaceItem.ages) ? (
                          <div className={`${palaceStyle.age} ${currentAgeIndex === palaceIndex ? palaceStyle.selected : ``}`}>
                            <button onClick={() => clickAge(palaceIndex)}>
                              <div>{getDecadalAge(palaceItem.ages)}</div>
                              <div>{`(${astrolabe.lunarYear + getDecadalAge(palaceItem.ages) - 1})`}</div>
                            </button>
                          </div>
                        ) : (
                          <div className={`${palaceStyle.age} ${palaceStyle.empty}`}>
                            <button></button>
                          </div>
                        )}
                      </div>
                      <div className={palaceStyle.middle}>
                        {showSmallMonth ? (
                          <div className={palaceStyle.smallMonth}>
                            {`流月${astrolabe.palaces[(lifePalaceIndex - currentMonthIndex + palaceIndex + 12) % 12].name.slice(0, 2)}`}
                          </div>
                        ) : null}
                        {showSmallLuck ? (
                          <div className={palaceStyle.smallLuck}>
                            {`流年${astrolabe.palaces[(lifePalaceIndex - currentAgeIndex + palaceIndex + 12) % 12].name.slice(0, 2)}`}
                          </div>
                        ) : null}

                        {showChildLuck ? (
                          <div className={`${palaceStyle.childLuck} ${showBorrow ? `${palaceStyle.smallerByBorrow}` : ``}`}>
                            {`少小運${astrolabe.palaces[(lifePalaceIndex - currentDecadalIndex + palaceIndex + 12) % 12].name.slice(0, 2)}`}
                          </div>
                        ) : showBigLuck ? (
                          <div className={`${palaceStyle.bigLuck} ${showBorrow ? `${palaceStyle.smallerByBorrow}` : ``}`}>
                            {`大運${astrolabe.palaces[(lifePalaceIndex - currentDecadalIndex + palaceIndex + 12) % 12].name.slice(0, 2)}`}
                          </div>
                        ) : null}
                        {showBorrow ? (
                          <div className={palaceStyle.borrow}>
                            {`${astrolabe.palaces[currentBorrowIndex].name.slice(0, 2)}的${astrolabe.palaces[
                              (lifePalaceIndex - currentBorrowIndex + palaceIndex + 12) % 12
                            ].name.slice(0, 2)}`}
                          </div>
                        ) : null}
                        <div>
                          <button
                            className={`${palaceStyle.decadal} ${currentDecadalIndex === palaceIndex ? palaceStyle.selected : ``}`}
                            onClick={() => clickDecadal(palaceIndex)}
                          >
                            {palaceItem.decadal.range.toString().replace(",", " - ")}
                          </button>
                        </div>

                        <button className={palaceStyle.name} onClick={() => clickPalace(palaceIndex)}>
                          {palaceItem.name}
                        </button>
                      </div>
                      <div className={palaceStyle.right}>
                        <div className={palaceStyle.decadal}>{palaceItem.decadal.heavenlyStem}</div>
                        <div className={palaceStyle.decadal}>{palaceItem.decadal.earthlyBranch}</div>
                      </div>
                    </div>
                    {palaceItem.outsideMutagenIndexes.length > 0 ? (
                      palaceIndex === 0 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftBottom} ${palaceStyle.outside}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↙`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 1 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftMiddle}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↙`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 2 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftMiddle}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↖`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 3 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftTop} ${palaceStyle.outside}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↖`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 4 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleTop}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↖`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 5 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleTop}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`↗${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 6 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightTop} ${palaceStyle.outside}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`↗${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 7 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightMiddle}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`↗${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 8 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightMiddle}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`↘${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 9 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightBottom} ${palaceStyle.outside}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`↘${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 10 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleBottom}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`↘${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 11 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleBottom}`}>
                          {palaceItem.outsideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-outside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↙`}</div>
                            );
                          })}
                        </div>
                      ) : null
                    ) : null}
                    {palaceItem.insideMutagenIndexes.length > 0 ? (
                      palaceIndex === 0 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightTop}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`↗${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 1 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightMiddle}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`↗${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 2 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightMiddle}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`↘${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 3 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.rightBottom}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`↘${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 4 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleBottom}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`↘${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 5 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleBottom}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↙`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 6 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftBottom}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↙`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 7 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftMiddle}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↙`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 8 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftMiddle}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↖`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 9 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.leftTop}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↖`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 10 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleTop}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}↖`}</div>
                            );
                          })}
                        </div>
                      ) : palaceIndex === 11 ? (
                        <div className={`${palaceStyle.arrow} ${palaceStyle.middleTop}`}>
                          {palaceItem.insideMutagenIndexes.map((item, index) => {
                            return (
                              <div className={`${palaceStyle[getMutagenStyle(item)]}`} key={`key-inside-${index}`}>{`↗${Object.keys(
                                mutagenToIndex
                              ).find((key) => mutagenToIndex[key] === item)}`}</div>
                            );
                          })}
                        </div>
                      ) : null
                    ) : null}
                  </div>
                );
              })}
              <div className={centerPalaceStyle.centerPalace}>
                <div className={centerPalaceStyle.header}>
                  {/* <button className={centerPalaceStyle.next} onClick={addBirthTime}>
                    <AddCircleIcon />
                  </button>
                  <button className={centerPalaceStyle.previous} onClick={reduceBirthTime}>
                    <RemoveCircleIcon />
                  </button> */}

                  <button className={`${centerPalaceStyle.info} ${showInfo ? centerPalaceStyle.selected : ``}`} onClick={toggleInfo}>
                    <InfoIcon />
                  </button>
                  <button
                    className={`${centerPalaceStyle.info} ${showTextfield ? centerPalaceStyle.selected : ``}`}
                    onClick={toggleTextfield}
                  >
                    <RttIcon />
                  </button>
                  <button
                    className={`${centerPalaceStyle.info} ${pluginSmallMonth ? centerPalaceStyle.selected : ``}`}
                    onClick={togglePluginSmallMonth}
                  >
                    <CalendarMonthIcon />
                  </button>
                  <button
                    className={`${centerPalaceStyle.info} ${pluginBorrow ? centerPalaceStyle.selected : ``}`}
                    onClick={togglePluginBorrow}
                  >
                    <VisibilityIcon />
                  </button>
                  <button
                    className={`${centerPalaceStyle.info} ${pluginUnderline ? centerPalaceStyle.selected : ``}`}
                    onClick={togglePluginUnderline}
                  >
                    <UpgradeIcon />
                  </button>
                  <button
                    className={`${centerPalaceStyle.info} ${pluginQuickArrow ? centerPalaceStyle.selected : ``}`}
                    onClick={togglePluginQuickArrow}
                  >
                    <SwitchAccessShortcutAddIcon />
                  </button>
                  <button className={centerPalaceStyle.arrow} onClick={cleanArrows}>
                    <MobiledataOffIcon />
                  </button>
                </div>
                <div className={centerPalaceStyle.body}>
                  {showInfo ? (
                    <>
                      {`姓名: ${astrolabe.name}`}
                      <br />
                      {`性別: ${astrolabe.gender}`}
                      <br />
                      {`陽曆: ${astrolabe.solarDate}`}
                      <br />
                      {`農曆: ${astrolabe.lunarDate} ${astrolabe.isLeapMonth ? `(閏月)` : ``}`}
                      <br />
                      {`時辰: ${astrolabe.time} (${astrolabe.timeRange})`}
                      <br />
                      {`五行局: ${astrolabe.fiveElementsClass}`}
                      <br />
                      {`四柱: ${astrolabe.chineseDate}`}
                      <br />
                    </>
                  ) : null}
                  {showTextfield ? (
                    <TextField
                      id="standard-multiline-flexible"
                      hiddenLabel
                      multiline
                      fullWidth
                      rows={6}
                      maxRows={6}
                      value={note}
                      onChange={handleNote}
                      sx={{
                        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                          border: "1px solid #bbb",
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          border: "1px solid #bbb",
                        },
                      }}
                    />
                  ) : null}
                </div>

                <div className={centerPalaceStyle.timePanel}>
                  <button className={centerPalaceStyle.next} onClick={addBirthTime}>
                    <AddCircleIcon />
                  </button>
                  <button className={centerPalaceStyle.previous} onClick={reduceBirthTime}>
                    <RemoveCircleIcon />
                  </button>
                </div>
                <div className={centerPalaceStyle.footer}>
                  {/*  <div className={centerPalaceStyle.searchBox}>
                    <button className={centerPalaceStyle.search} onClick={toggleSearch}>
                      <AssignmentIcon />
                    </button>
                  </div> */}
                  <div className={centerPalaceStyle.starBox}>
                    {inFavList() === -1 ? (
                      <button className={centerPalaceStyle.star} onClick={addFavList}>
                        <StarBorderIcon />
                      </button>
                    ) : (
                      <button className={centerPalaceStyle.star} onClick={removeFavList}>
                        <StarIcon />
                      </button>
                    )}
                  </div>
                  <div className={centerPalaceStyle.searchBox}>
                    <button className={centerPalaceStyle.search} onClick={toggleSearch}>
                      <AssignmentIcon />
                    </button>
                  </div>
                </div>
                <div className={centerPalaceStyle.flow}>
                 
                  <button className={centerPalaceStyle.flow1}>
                  <Link href={getFlowPath()} target="_blank">
                    吉化串連 (Beta)
                    </Link>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </ArcherContainer>
        <br />
        <Select
          value={currentFavIndex}
          onChange={selectFav}
          autoWidth
          sx={{ backgroundColor: "#fff", fontSize: "12px", padding: "0", height: "32px" }}
        >
          <MenuItem disabled value={-1}>
            <em>已收藏</em>
          </MenuItem>
          {favList.map((fav, index) => {
            return (
              <MenuItem value={index} key={`key-astrolabe-list-${index}`}>
                {`${fav.name} ${fav.gender == 0 ? "男" : fav.gender == 1 ? "女" : ""} ${
                  fav.calendar == 0 ? "陽曆" : fav.calendar == 1 ? "農曆" : ""
                } ${fav.year}-${fav.month}-${fav.day} ${birthTimeList[fav.birthTime]}`}
              </MenuItem>
            );
          })}
        </Select>
      </div>

      {/* <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div className={astrolabeStyle.footer}>
        <div className={astrolabeStyle.left}>
          <div className={astrolabeStyle.logo}>
            <img src={"logo.png"} alt="logo" />
            <div className={astrolabeStyle.name}>曜靈紫微飛星</div>
          </div>
          <button>線上排盤</button>
        </div>
        <div className={astrolabeStyle.right}>
          <a target="_blank" href="https://buy.stripe.com/cN2cPsa6XaLMauQ001">
            支持我們
          </a>
        </div>
      </div> */}
    </>
  );
}
