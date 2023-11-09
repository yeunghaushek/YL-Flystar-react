import Head from "next/head";

import { astro } from "iztro";
import { useEffect, useState } from "react";

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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { ArcherContainer, ArcherElement } from "react-archer";

import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import InfoIcon from "@mui/icons-material/Info";
import MobiledataOffIcon from "@mui/icons-material/MobiledataOff";
import AssignmentIcon from "@mui/icons-material/Assignment";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  borderRadius: "10px",
  border: "0",
  width: "70%",
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
  const [astrolabe, setAstrolabe] = useState(null);
  const [lifePalaceIndex, setLifePalaceIndex] = useState(-1);
  const [currentDecadalIndex, setCurrentDecadalIndex] = useState(-1);
  const [currentAgeIndex, setCurrentAgeIndex] = useState(-1);
  const [showBigLuck, setShowBigLuck] = useState(false);
  const [showSmallLuck, setShowSmallLuck] = useState(false);

  const clickDecadal = (palaceIndex) => {
    setCurrentDecadalIndex(palaceIndex);
    if (!showBigLuck) setShowBigLuck(true);
    if (showSmallLuck) setShowSmallLuck(false);
    if (currentAgeIndex > -1) setCurrentAgeIndex(-1);
  };

  const getDecadalAge = (ages) => {
    if (currentDecadalIndex < 0) return -1;
    let range = astrolabe.palaces[currentDecadalIndex].decadal.range;
    return ages.find((age) => age >= range[0] && age <= range[1]);
  };

  const isChild = (palaceIndex) => {
    if (currentDecadalIndex !== lifePalaceIndex) return false;
    if (getDecadalAge(astrolabe.palaces[palaceIndex].ages) <= astrolabe.palaces[lifePalaceIndex].decadal.range[1]) return true;
    return false;
  };

  const clickAge = (palaceIndex) => {
    setCurrentAgeIndex(palaceIndex);
    if (!showSmallLuck) setShowSmallLuck(true);
  };

  const [currentArrows, setCurrentArrows] = useState([]);
  const toggleArrows = (palaceIndex, targetStarIndex, mutagenIndex) => {
    let arrows = currentArrows.slice();
    let targetArrowIndex = arrows.findIndex((arr) => arr[0] === palaceIndex && arr[1] === targetStarIndex);
    if (targetArrowIndex === -1) {
      arrows.push([palaceIndex, targetStarIndex, mutagenIndex]);
    } else {
      arrows.splice(targetArrowIndex, 1);
    }
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
      setCurrentArrows(arrows);
    }
    closeMutagenPanel();
  };

  const closeMutagenPanel = () => {
    if (currentMutagenPanelIndex > -1) setCurrentMutagenPanelIndex(-1);
    if (revMutagenPanelIndex > -1) setRevMutagenPanelIndex(-1);
  };

  const [showInfo, setShowInfo] = useState(true);
  const toggleInfo = () => {
    setShowInfo(!showInfo);
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

  const [gender, setGender] = useState(0);
  const [calendar, setCalendar] = useState(0);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthTime, setBirthTime] = useState(0);

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

  const handleBirthday = (event) => {
    if (!event.target.value && event.target.value != 0) {
      setBirthday("");
    } else {
      setBirthday(event.target.value);
    }
  };

  const handleYear = (event) => {
    if (event.target.value.length > 4) return;
    let yystr = event.target.value.replace(/[+\-e]/g, "");
    console.log(yystr);
    if (!yystr) {
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

  const [year, setYear] = useState("1999");
  const [month, setMonth] = useState(7);
  const [day, setDay] = useState(15);
  const [isValidBirthday, setIsValidBirthday] = useState(true);

  useEffect(() => {
    if (calendar == 1) {
      if (day > 30) setDay(30);
    }
  }, [calendar]);

  const generateAstrolabe = () => {
    // console.log(`${year}-${month}-${day}`, birthTime);
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

    let myAstrolabe = {
      chineseDate: astrolabe.chineseDate.replaceAll("醜", "丑"),
      solarDate: astrolabe.solarDate,
      fiveElementsClass: astrolabe.fiveElementsClass,
      lunarDate: `${astrolabe.lunarDate.replaceAll("腊", "臘")}`,
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
          ages: pItem.ages
            .map((age, index) => (pIndex < 6 ? age + ((6 - pIndex) % 6) * -2 : age + (pIndex % 6) * 2))
            .concat(pItem.ages.map((age) => age + 84)),
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
      gender: gender == 0 ? "男命" : gender == 1 ? "女命" : "",
      isLeapMonth: isLeapMonth,
    };

    setLifePalaceIndex(lifePalaceIndex);
    setAstrolabe(myAstrolabe);
    setShowSearch(false);
    setShowInfo(true);
    setShowSmallLuck(false);
    setCurrentAgeIndex(-1);
    setCurrentArrows([]);

    let currentDecadalIndex = myAstrolabe.palaces.findIndex(
      (palace) =>
        new Date().getFullYear() - myAstrolabe.lunarYear + 1 >= palace.decadal.range[0] &&
        new Date().getFullYear() - myAstrolabe.lunarYear + 1 <= palace.decadal.range[1]
    );
    if (currentDecadalIndex > -1) clickDecadal(currentDecadalIndex);

    console.log(myAstrolabe);
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
      setUpdateCounter(updateCounter + 1);
    } else {
      addDay();
      setBirthTime(0);
      setUpdateCounter(updateCounter + 1);
    }
  };

  const reduceBirthTime = () => {
    if (birthTime > 0) {
      setBirthTime(birthTime - 1);
      setUpdateCounter(updateCounter + 1);
    } else {
      minusDay();
      setBirthTime(12);
      setUpdateCounter(updateCounter + 1);
    }
  };

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
    setUpdateCounter(updateCounter + 1);
  }, []);

  useEffect(() => {
    /* let ast1 = astro.astrolabeByLunarDate(`1999-07-15`, birthTime, gender, true, true, "zh-TW");
    let ast2 = astro.astrolabeByLunarDate(`1999-07-15`, birthTime, gender, false, true, "zh-TW");

    console.log(ast1);
    console.log(ast2); */
  }, []);

  return (
    <>
      <Head>
        <title>曜靈飛星紫微</title>
      </Head>
      <div className="header">
        <div className="logo">
          <img src={"logo.png"} alt="logo" />
          <div className="name">曜靈飛星紫微</div>
        </div>
        <button>排盤</button>
        <button variant="text">關於我們</button>
      </div>
      <div className="container">
        <Modal open={showSearch} onClose={toggleSearch} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
          <Box sx={modalStyle}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <FormControl>
                    <RadioGroup row aria-labelledby="gender-radio" name="gender-radio-group" value={gender} onChange={handleGender}>
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
                <Grid item xs={4}>
                  <FormControl>
                    <RadioGroup row aria-labelledby="calendar-radio" name="calendar-radio-group" value={calendar} onChange={handleCalendar}>
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
                <Grid item xs={3}>
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
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <TextField label="年" name="year" value={year} onChange={handleYear} type="number" />
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
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
                <Grid item xs={4}>
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
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField label="出生日期" name="birthday" value={`${year}-${month}-${day}`} onChange={() => {}} />
                  </FormControl>
                </Grid>
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
                      onClick={() => setUpdateCounter(updateCounter + 1)}
                    >
                      <AssignmentIcon />
                    </Button>
                  </FormControl>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        </Modal>
        <ArcherContainer lineStyle={"straight"} strokeWidth={1} svgContainerStyle={{ zIndex: 10 }}>
          {astrolabe ? (
            <div className={astrolabeStyle.astrolabe}>
              {astrolabe.palaces.map((palaceItem, palaceIndex) => {
                return (
                  <div className={palaceStyle.palace} style={{ gridArea: `g${palaceIndex}` }} key={`key-palace-${palaceIndex}`}>
                    <div className={palaceStyle.header}>
                      <div className={palaceStyle.left}>{palaceIndex}</div>
                      <div className={palaceStyle.right}>
                        {palaceItem.minorStars.map((star, sIndex) => {
                          return (
                            <div className={palaceStyle.minor} key={`key-minorStars-${sIndex}`}>
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
                                        backgroundColor: "#cc0",
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
                                <button className={palaceStyle.star} onClick={() => clickStar(starList.findIndex((s) => s === star.name))}>
                                  <div>{star.name[0]}</div>
                                  <ArcherElement id={`star-${starList.findIndex((s) => s === star.name)}`}>
                                    <div>{star.name[1]}</div>
                                  </ArcherElement>
                                </button>
                              </StyledTooltipForStar>

                              {star.mutagen ? (
                                <div className={`${palaceStyle.mutagen} ${palaceStyle[getMutagenStyle(mutagenToIndex[star.mutagen])]}`}>
                                  {star.mutagen}
                                </div>
                              ) : null}
                              <div
                                className={`${palaceStyle.hollowMutagen} ${
                                  palaceStyle[getMutagenStyle(mutagenToIndex[star.hollowMutagen])]
                                }`}
                              >
                                {star.hollowMutagen}
                              </div>
                            </div>
                          );
                        })}
                        {palaceItem.majorStars.map((star, sIndex) => {
                          return (
                            <div className={palaceStyle.major} key={`key-majorStars-${sIndex}`}>
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
                                        backgroundColor: "#cc0",
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
                                <button className={palaceStyle.star} onClick={() => clickStar(starList.findIndex((s) => s === star.name))}>
                                  <div>{star.name[0]}</div>
                                  <ArcherElement id={`star-${starList.findIndex((s) => s === star.name)}`}>
                                    <div>{star.name[1]}</div>
                                  </ArcherElement>
                                </button>
                              </StyledTooltipForStar>

                              {star.mutagen ? (
                                <div className={`${palaceStyle.mutagen} ${palaceStyle[getMutagenStyle(mutagenToIndex[star.mutagen])]}`}>
                                  {star.mutagen}
                                </div>
                              ) : null}
                              <div
                                className={`${palaceStyle.hollowMutagen} ${
                                  palaceStyle[getMutagenStyle(mutagenToIndex[star.hollowMutagen])]
                                }`}
                              >
                                {star.hollowMutagen}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className={palaceStyle.body}>
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
                                        ? "#cc0"
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
                    <div className={palaceStyle.footer}>
                      <div className={palaceStyle.left}>
                        {currentDecadalIndex > -1 && getDecadalAge(palaceItem.ages) ? (
                          <button
                            className={`${palaceStyle.age} ${currentAgeIndex === palaceIndex ? palaceStyle.selected : ``}`}
                            onClick={() => clickAge(palaceIndex)}
                          >
                            <div>{getDecadalAge(palaceItem.ages)}</div>
                            <div>{`(${astrolabe.lunarYear + getDecadalAge(palaceItem.ages) - 1})`}</div>
                          </button>
                        ) : null}
                      </div>
                      <div className={palaceStyle.middle}>
                        {showSmallLuck ? (
                          <div className={palaceStyle.smallLuck}>
                            {`流年${astrolabe.palaces[(lifePalaceIndex - currentAgeIndex + palaceIndex + 12) % 12].name.slice(0, 2)}`}
                          </div>
                        ) : null}
                        {showBigLuck ? (
                          <div className={palaceStyle.bigLuck}>
                            {`大運${astrolabe.palaces[(lifePalaceIndex - currentDecadalIndex + palaceIndex + 12) % 12].name.slice(0, 2)}`}
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
                                  padding: "1px 3px",
                                  margin: "1px",
                                  fontSize: "14px",
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
                                  padding: "1px 3px",
                                  margin: "1px",
                                  fontSize: "14px",
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
                                  padding: "1px 3px",
                                  margin: "1px",
                                  fontSize: "14px",
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
                                  backgroundColor: "#cc0",
                                  padding: "1px 3px",
                                  margin: "1px",
                                  fontSize: "14px",
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
                          <button className={palaceStyle.name} onClick={() => clickPalace(palaceIndex)}>
                            {palaceItem.name}
                          </button>
                        </StyledTooltip>
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
                  <button className={centerPalaceStyle.previous} onClick={reduceBirthTime}>
                    <RemoveCircleIcon />
                  </button>
                  <button className={centerPalaceStyle.next} onClick={addBirthTime}>
                    <AddCircleIcon />
                  </button>
                  <button className={centerPalaceStyle.info} onClick={toggleInfo}>
                    <InfoIcon />
                  </button>
                  <button className={centerPalaceStyle.arrow} onClick={cleanArrows}>
                    <MobiledataOffIcon />
                  </button>
                </div>
                <div className={centerPalaceStyle.body}>
                  {showInfo ? (
                    <>
                      {`四柱: ${astrolabe.chineseDate}`}
                      <br />
                      {`陽曆: ${astrolabe.solarDate}`}
                      <br />
                      {`五行局: ${astrolabe.fiveElementsClass}`}
                      <br />
                      {`農曆: ${astrolabe.lunarDate} ${astrolabe.isLeapMonth ? `(閏月)` : ``}`}
                      <br />
                      {`時辰: ${astrolabe.time} (${astrolabe.timeRange})`}
                      <br />
                      {`性別: ${astrolabe.gender}`}
                    </>
                  ) : null}
                </div>
                <div className={centerPalaceStyle.footer}>
                  <button className={centerPalaceStyle.search} onClick={toggleSearch}>
                    <AssignmentIcon />
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </ArcherContainer>
      </div>
    </>
  );
}