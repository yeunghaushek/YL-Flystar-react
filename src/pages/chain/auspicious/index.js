// http://localhost:3000/chain/auspicious?n=&g=0&c=0&y=2025&m=8&d=21&bt=3&lm=0

import Head from "next/head";
import { useRouter } from "next/router";

import { buildAuspiciousGraph, buildGraphComponents, normalizeAstrolabe } from "@/lib/auspiciousChain";
import { createAstrolabe } from "@/lib/iztroConfig";
import { toLocalDate } from "@/lib/toLocalDate";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/header";
import AuspiciousChainFishbone from "@/components/AuspiciousChainFishbone";
import styles from "@/styles/AuspiciousChainSidebar.module.scss";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

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

function buildPickerItems(components) {
  return components.map((comp) => {
    const structs =
      comp.structures?.length > 0
        ? comp.structures
        : [
            {
              leader: comp.leader,
              chainLuCount: comp.chainLuCount,
              chainQuanCount: comp.chainQuanCount,
              indices: comp.indices,
            },
          ];

    // Multi-structure component: only show 匯合 (no duplicate per-structure chips)
    if (structs.length > 1) {
      const leaders = structs
        .map((s) => s.leader?.label || `${s.leader?.palace || ""}・${s.leader?.star || ""}`)
        .filter(Boolean)
        .join("；");
      return {
        id: `${comp.id}-merge`,
        kind: "merge",
        label: `匯合（${structs.length}條）`,
        counts: leaders,
        component: comp,
      };
    }

    const s = structs[0];
    const label = s.leader?.label || `${s.leader?.palace || ""}・${s.leader?.star || ""}`;
    const counts = `${s.chainLuCount ?? 0}祿${(s.chainQuanCount ?? 0) > 0 ? ` ${s.chainQuanCount}權` : ""}`.trim();
    return {
      id: `${comp.id}-struct-0`,
      kind: "structure",
      label,
      counts,
      component: {
        ...comp,
        indices: s.indices,
        structures: [s],
        chainLuCount: s.chainLuCount,
        chainQuanCount: s.chainQuanCount,
        leader: s.leader,
      },
    };
  });
}

export default function AuspiciousChainPage() {
  const router = useRouter();

  const [graph, setGraph] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const [name, setName] = useState("");
  const [gender, setGender] = useState(0);
  const [calendar, setCalendar] = useState(0);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthTime, setBirthTime] = useState(0);

  const today = toLocalDate();
  const [year, setYear] = useState(today.year);
  const [month, setMonth] = useState(today.month);
  const [day, setDay] = useState(today.day);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [birthTimeCounter, setBirthTimeCounter] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generateAstrolabe = () => {
    const raw = createAstrolabe({ calendar, year, month, day, birthTime, gender, isLeapMonth });
    setGraph(buildAuspiciousGraph(normalizeAstrolabe(raw)));
  };

  useEffect(() => {
    generateAstrolabe();
  }, [updateCounter]);

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

  useEffect(() => {
    if (birthTimeCounter > 0) {
      updateUrlParams();
    }
  }, [birthTimeCounter]);

  const { n, g, c, y, m, d, bt, lm } = router.query;
  useEffect(() => {
    if (g && c && y && m && d && bt && lm) {
      if (n) setName(n);
      setGender(parseInt(g));
      setCalendar(parseInt(c));
      setYear(parseInt(y));
      setMonth(parseInt(m));
      setDay(parseInt(d));
      setBirthTime(parseInt(bt));
      setIsLeapMonth(lm === "1");
      setUpdateCounter((v) => v + 1);
    }
  }, [n, g, c, y, m, d, bt, lm]);

  const addDay = () => {
    if (year % 4 != 0 && month == 2 && day == 28) {
      setMonth(3);
      setDay(1);
    } else if (year % 4 == 0 && month == 2 && day == 29) {
      setMonth(3);
      setDay(1);
    } else if (month == 12 && day == 31) {
      setYear(year + 1);
      setMonth(1);
      setDay(1);
    } else if ((month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10) && day == 31) {
      setMonth(month + 1);
      setDay(1);
    } else if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 30) {
      setMonth(month + 1);
      setDay(1);
    } else {
      setDay(day + 1);
    }
  };

  const minusDay = () => {
    if (year % 4 != 0 && month == 3 && day == 1) {
      setMonth(2);
      setDay(28);
    } else if (year % 4 == 0 && month == 3 && day == 1) {
      setMonth(2);
      setDay(29);
    } else if (month == 1 && day == 1) {
      setYear(year - 1);
      setMonth(12);
      setDay(31);
    } else if ((month == 2 || month == 4 || month == 6 || month == 8 || month == 9 || month == 11) && day == 1) {
      setMonth(month - 1);
      setDay(31);
    } else if ((month == 5 || month == 7 || month == 10 || month == 12) && day == 1) {
      setMonth(month - 1);
      setDay(30);
    } else {
      setDay(day - 1);
    }
  };

  const addBirthTime = () => {
    if (birthTime < 12) {
      setBirthTime(birthTime + 1);
    } else {
      addDay();
      setBirthTime(0);
    }
    setBirthTimeCounter((v) => v + 1);
  };

  const reduceBirthTime = () => {
    if (birthTime > 0) {
      setBirthTime(birthTime - 1);
    } else {
      minusDay();
      setBirthTime(12);
    }
    setBirthTimeCounter((v) => v + 1);
  };

  const components = useMemo(() => buildGraphComponents(graph), [graph]);
  const pickerItems = useMemo(() => buildPickerItems(components), [components]);

  useEffect(() => {
    if (pickerItems.length === 0) {
      setActiveId(null);
      return;
    }
    setActiveId((prev) => (pickerItems.some((item) => item.id === prev) ? prev : pickerItems[0].id));
  }, [pickerItems]);

  const activeItem = pickerItems.find((item) => item.id === activeId) || pickerItems[0] || null;
  const calendarLabel = calendar === 0 ? "陽曆" : "農曆";
  const genderLabel = gender === 0 ? "男" : "女";
  const dateLabel = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const timeLabel = birthTimeList[birthTime] || "";

  return (
    <>
      <Head>
        <title>吉化串連 | 星軌堂</title>
        <meta
          name="description"
          content="梁派飛星吉化串連圖：化祿轉忌、追祿追權結構化展示。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yl-flystar.pro/chain/auspicious" />
        <meta property="og:title" content="吉化串連 | 星軌堂" />
        <meta property="og:description" content="梁派飛星吉化串連圖：化祿轉忌、追祿追權結構化展示。" />
        <meta property="og:image" content="https://yl-flystar.pro/og.png" />
        <meta property="og:site_name" content="星軌堂" />
      </Head>

      <Header alwaysShow />

      <div className={styles.pageShell}>
        <div className={styles.pageToolbar}>
          <div className={styles.pageTitleRow}>
            <div className={styles.pageTitle}>吉化串連</div>
            <div className={styles.datePanel}>
              <button type="button" className={styles.dateBtn} onClick={reduceBirthTime} aria-label="減一時辰">
                <RemoveCircleIcon fontSize="small" />
              </button>
              <div className={styles.dateInfo}>
                <div className={styles.dateMain}>
                  {calendarLabel} {dateLabel}
                  {isLeapMonth ? "（閏月）" : ""} · {genderLabel}
                </div>
                <div className={styles.dateSub}>{timeLabel}</div>
              </div>
              <button type="button" className={styles.dateBtn} onClick={addBirthTime} aria-label="加一時辰">
                <AddCircleIcon fontSize="small" />
              </button>
            </div>
          </div>
          <div className={styles.legend}>
            <span className={styles.legendLu}>祿（星上斜下）</span>
            <span className={styles.legendQuan}>權（星上斜下）</span>
            <span className={styles.legendJi}>化忌</span>
            <span className={styles.legendSelf}>虛線＝自化（宮位向外）</span>
            <span className={styles.legendCycle}>紫＝循環回到重複宮星</span>
          </div>
        </div>

        {mounted && pickerItems.length > 0 ? (
          <>
            <div className={styles.pickerBar} role="tablist" aria-label="選擇結構">
              {pickerItems.map((item) => {
                const selected = item.id === activeItem?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`${styles.pickerChip} ${selected ? styles.pickerChipActive : ""} ${
                      item.kind === "merge" ? styles.pickerChipMerge : ""
                    }`}
                    onClick={() => setActiveId(item.id)}
                  >
                    <span className={styles.pickerChipLabel}>
                      {item.kind === "merge"
                        ? item.label
                        : `${item.label}${item.counts ? ` ${item.counts}` : ""}`}
                    </span>
                    {item.kind === "merge" && item.counts ? (
                      <span className={styles.pickerChipCounts}>{item.counts}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className={styles.viewerCard}>
              {activeItem?.component ? (
                <AuspiciousChainFishbone component={activeItem.component} fit="scroll" />
              ) : null}
            </div>
          </>
        ) : null}

        {mounted && pickerItems.length === 0 ? (
          <div className={styles.empty}>此命盤無吉化串連結構</div>
        ) : null}
      </div>
    </>
  );
}
