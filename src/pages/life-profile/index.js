import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { Header } from "@/components/header";
import LifeProfileCards from "@/components/LifeProfileCards";
import LifeProfileOrbit from "@/components/LifeProfileOrbit";
import { normalizeAstrolabe } from "@/lib/auspiciousChain";
import { calculateIdentity } from "@/lib/identityCalculator";
import { createAstrolabe } from "@/lib/iztroConfig";
import { buildLifeProfile } from "@/lib/lifeProfile";
import { toLocalDate } from "@/lib/toLocalDate";
import styles from "@/styles/LifeProfile.module.scss";

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

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;
const YEAR_OPTIONS = Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i);

const SOLAR_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}月`,
}));

const LUNAR_MONTH_OPTIONS = [
  "正月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
].map((label, i) => ({ value: i + 1, label }));

function daysInMonth(year, month, calendar) {
  if (calendar === 1) return 30;
  return new Date(year, month, 0).getDate();
}

function clampDateParts(year, month, day, calendar) {
  const y = Math.min(YEAR_MAX, Math.max(YEAR_MIN, Number(year) || YEAR_MIN));
  const m = Math.min(12, Math.max(1, Number(month) || 1));
  const maxDay = daysInMonth(y, m, calendar);
  const d = Math.min(maxDay, Math.max(1, Number(day) || 1));
  return { year: y, month: m, day: d };
}

function BirthForm({
  name,
  setName,
  gender,
  setGender,
  calendar,
  setCalendar,
  isLeapMonth,
  setIsLeapMonth,
  birthTime,
  setBirthTime,
  year,
  setYear,
  month,
  setMonth,
  day,
  setDay,
  addBirthTime,
  minusBirthTime,
  onSubmit,
  compact = false,
}) {
  const monthOptions = calendar === 1 ? LUNAR_MONTH_OPTIONS : SOLAR_MONTH_OPTIONS;
  const dayOptions = Array.from(
    { length: daysInMonth(year, month, calendar) },
    (_, i) => i + 1
  );

  const handleYearChange = (nextYear) => {
    const next = clampDateParts(nextYear, month, day, calendar);
    setYear(next.year);
    setDay(next.day);
  };

  const handleMonthChange = (nextMonth) => {
    const next = clampDateParts(year, nextMonth, day, calendar);
    setMonth(next.month);
    setDay(next.day);
  };

  const handleDayChange = (nextDay) => {
    const next = clampDateParts(year, month, nextDay, calendar);
    setDay(next.day);
  };

  const chartHref = `/chart?n=${encodeURIComponent(name || "")}&g=${gender}&c=${calendar}&y=${year}&m=${month}&d=${day}&bt=${birthTime}&lm=${isLeapMonth ? "1" : "0"}`;

  return (
    <form
      className={compact ? styles.sidebarForm : styles.introForm}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {!compact && (
        <>
          <h1 className={styles.introTitle}>生命檔案</h1>
          <p className={styles.introLead}>輸入出生資料，生成你的星軌理數生命檔案。</p>
        </>
      )}
      {compact && (
        <>
          <h2 className={styles.sideTitle}>調整資料</h2>
          <p className={styles.sideHint}>修改後重新生成。</p>
        </>
      )}

      <div className={styles.field}>
        <label htmlFor="lp-name">名稱</label>
        <input
          id="lp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="選填"
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="lp-gender">性別</label>
          <select
            id="lp-gender"
            value={gender}
            onChange={(e) => setGender(parseInt(e.target.value, 10))}
          >
            <option value={0}>男</option>
            <option value={1}>女</option>
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="lp-cal">曆法</label>
          <select
            id="lp-cal"
            value={calendar}
            onChange={(e) => {
              const nextCal = parseInt(e.target.value, 10);
              setCalendar(nextCal);
              const next = clampDateParts(year, month, day, nextCal);
              setYear(next.year);
              setMonth(next.month);
              setDay(next.day);
            }}
          >
            <option value={0}>西曆</option>
            <option value={1}>農曆</option>
          </select>
        </div>
      </div>

      {calendar === 1 && (
        <div className={styles.field}>
          <label htmlFor="lp-leap">閏月</label>
          <select
            id="lp-leap"
            value={isLeapMonth ? 1 : 0}
            onChange={(e) => setIsLeapMonth(e.target.value === "1")}
          >
            <option value={0}>否</option>
            <option value={1}>是</option>
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label>日期</label>
        <div className={styles.dateRow}>
          <select
            value={year}
            onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
            aria-label="年"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
            aria-label="月"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => handleDayChange(parseInt(e.target.value, 10))}
            aria-label="日"
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="lp-time">時辰</label>
        <div className={styles.timeRow}>
          <button type="button" aria-label="上一時辰" onClick={minusBirthTime}>
            <RemoveCircleIcon fontSize="small" />
          </button>
          <select
            id="lp-time"
            value={birthTime}
            onChange={(e) => setBirthTime(parseInt(e.target.value, 10))}
          >
            {birthTimeList.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
          <button type="button" aria-label="下一時辰" onClick={addBirthTime}>
            <AddCircleIcon fontSize="small" />
          </button>
        </div>
      </div>

      <button type="submit" className={styles.submit}>
        {compact ? "重新生成" : "生成檔案"}
      </button>

      <a
        className={styles.chartLink}
        href={chartHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        打開命盤
      </a>
    </form>
  );
}

export default function LifeProfilePage() {
  const router = useRouter();
  const today = toLocalDate();

  const [name, setName] = useState("");
  const [gender, setGender] = useState(0);
  const [calendar, setCalendar] = useState(0);
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthTime, setBirthTime] = useState(0);
  const [year, setYear] = useState(Number(today.year));
  const [month, setMonth] = useState(Number(today.month));
  const [day, setDay] = useState(Number(today.day));
  const [normalized, setNormalized] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [orbitOpen, setOrbitOpen] = useState(true);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const prevBodyBgImage = body.style.backgroundImage;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowX = body.style.overflowX;

    html.style.background = "#05070c";
    body.style.background = "#05070c";
    body.style.backgroundImage = "none";
    html.style.overflowX = "hidden";
    body.style.overflowX = "hidden";

    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      body.style.backgroundImage = prevBodyBgImage;
      html.style.overflowX = prevHtmlOverflowX;
      body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  const profile = useMemo(
    () => (normalized ? buildLifeProfile(normalized) : null),
    [normalized]
  );

  const identity = useMemo(
    () => (normalized ? calculateIdentity(normalized) : null),
    [normalized]
  );

  const generate = () => {
    try {
      const raw = createAstrolabe({
        calendar,
        year,
        month,
        day,
        birthTime,
        gender,
        isLeapMonth,
      });
      setNormalized(normalizeAstrolabe(raw));
      setHasGenerated(true);
    } catch (err) {
      console.error("Life profile generate failed:", err);
      setNormalized(null);
    }
  };

  const syncUrl = () => {
    router.push(
      {
        pathname: router.pathname,
        query: {
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

  const handleSubmit = () => {
    generate();
    syncUrl();
  };

  const { n, g, c, y, m, d, bt, lm } = router.query;
  useEffect(() => {
    if (!router.isReady || hydratedFromUrl) return;

    const q = (v) => (Array.isArray(v) ? v[0] : v);
    const qg = q(g);
    const qc = q(c);
    const qy = q(y);
    const qm = q(m);
    const qd = q(d);
    const qbt = q(bt);
    const qlm = q(lm);

    if (
      qg === undefined ||
      qc === undefined ||
      qy === undefined ||
      qm === undefined ||
      qd === undefined ||
      qbt === undefined ||
      qlm === undefined
    ) {
      return;
    }

    if (n) setName(String(q(n)));
    const nextCal = parseInt(String(qc), 10);
    const next = clampDateParts(
      parseInt(String(qy), 10),
      parseInt(String(qm), 10),
      parseInt(String(qd), 10),
      nextCal
    );
    setGender(parseInt(String(qg), 10));
    setCalendar(nextCal);
    setYear(next.year);
    setMonth(next.month);
    setDay(next.day);
    setBirthTime(parseInt(String(qbt), 10));
    setIsLeapMonth(qlm === "1");
    setHydratedFromUrl(true);

    try {
      const raw = createAstrolabe({
        calendar: nextCal,
        year: next.year,
        month: next.month,
        day: next.day,
        birthTime: parseInt(String(qbt), 10),
        gender: parseInt(String(qg), 10),
        isLeapMonth: qlm === "1",
      });
      setNormalized(normalizeAstrolabe(raw));
      setHasGenerated(true);
    } catch (err) {
      console.error(err);
    }
  }, [router.isReady, n, g, c, y, m, d, bt, lm, hydratedFromUrl]);

  const addBirthTime = () => {
    setBirthTime((prev) => (prev + 1) % birthTimeList.length);
  };

  const minusBirthTime = () => {
    setBirthTime((prev) => (prev - 1 + birthTimeList.length) % birthTimeList.length);
  };

  const formProps = {
    name,
    setName,
    gender,
    setGender,
    calendar,
    setCalendar,
    isLeapMonth,
    setIsLeapMonth,
    birthTime,
    setBirthTime,
    year,
    setYear,
    month,
    setMonth,
    day,
    setDay,
    addBirthTime,
    minusBirthTime,
    onSubmit: handleSubmit,
  };

  return (
    <div className={styles.root}>
      <Head>
        <title>生命檔案｜星軌理數</title>
        <meta
          name="description"
          content="星軌理數生命檔案：將核心模組轉譯為商業戰略儀表板，呈現擴張、掌控與收斂能量動向。"
        />
        <link rel="canonical" href="https://yl-flystar.pro/life-profile" />
      </Head>

      <Header alwaysShow />

      {!hasGenerated ? (
        <div className={styles.introShell}>
          <BirthForm {...formProps} />
        </div>
      ) : (
        <div className={styles.shell}>
          <aside className={styles.sidebar}>
            <BirthForm {...formProps} compact />
          </aside>

          <main className={styles.main}>
            <header className={styles.resultHeader}>
              <div>
                <p className={styles.kicker}>星軌理數 · 生命檔案</p>
                {name?.trim() ? <h1 className={styles.title}>{name.trim()}</h1> : null}
              </div>
            </header>

            <LifeProfileOrbit
              profile={profile}
              collapsed={!orbitOpen}
              onToggle={() => setOrbitOpen((v) => !v)}
            />
            <LifeProfileCards profile={profile} identity={identity} />
          </main>
        </div>
      )}
    </div>
  );
}
