import Head from "next/head";
import { useRef, useState } from "react";
import SchoolIcon from "@mui/icons-material/School";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Header } from "@/components/header";
import styles from "@/styles/CoursesPage.module.scss";
import landing from "@/styles/HomeLanding.module.scss";

const ACCORDION_ITEMS = [
  {
    id: "g1",
    num: "01",
    grade: "Grade 1",
    title: "認識性格",
    section: "foundation",
    defaultOpen: true,
  },
  {
    id: "g2",
    num: "02",
    grade: "Grade 2",
    title: "人生十二維度",
    section: "foundation",
    defaultOpen: false,
  },
  {
    id: "g3",
    num: "03",
    grade: "Grade 3",
    title: "吉凶斷事",
    subtitle: "命運軌跡解析",
    section: "foundation",
    defaultOpen: false,
  },
  {
    id: "g4",
    num: "04",
    grade: "Grade 4",
    title: "核心技法與百日築基",
    section: "advanced",
    defaultOpen: false,
  },
  {
    id: "g5",
    num: "05",
    grade: "Grade 5",
    title: "人生主題模組",
    subtitle: "可自由選修",
    section: "advanced",
    defaultOpen: false,
  },
  {
    id: "g6",
    num: "06",
    grade: "Grade 6",
    title: "六親與時空",
    section: "advanced",
    defaultOpen: false,
  },
  {
    id: "g7",
    num: "07",
    grade: "Grade 7",
    title: "執業實戰與師門認證",
    section: "advanced",
    defaultOpen: true,
    pinnacle: true,
  },
];

const INITIAL_OPEN = ACCORDION_ITEMS.reduce(
  (acc, item) => ({ ...acc, [item.id]: item.defaultOpen }),
  {}
);

const HEADER_OFFSET = 72;

const CourseCta = () => (
  <a className={styles.ctaButton} href="#" onClick={(e) => e.preventDefault()}>
    立即查詢開班時間
  </a>
);

export default function CoursesPage() {
  const [openMap, setOpenMap] = useState(INITIAL_OPEN);
  const itemRefs = useRef({});

  const toggleItem = (id) => {
    setOpenMap((prev) => {
      const willOpen = !prev[id];
      const next = { ...prev, [id]: willOpen };

      if (willOpen) {
        window.setTimeout(() => {
          const node = itemRefs.current[id];
          if (!node) return;
          const top = node.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top, behavior: "smooth" });
        }, 280);
      }

      return next;
    });
  };

  const renderItem = (id) => {
    switch (id) {
      case "g1":
        return (
          <>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>8 課</span>
              <span className={styles.metaChip}>$3,600</span>
              <span className={`${styles.metaChip} ${styles.earlyBird}`}>早鳥 $2,800</span>
            </div>
            <p className={styles.sectionLabel}>課程大綱</p>
            <ul className={styles.list}>
              <li>飛星派命盤建構與基礎排盤原理</li>
              <li>十二宮位象義解析（認識生命各領域舞台）</li>
              <li>四化象義初探（祿權科忌的基本能量）</li>
              <li>命盤核心動能：命宮四化與生年四化</li>
              <li>基礎單宮飛化（命、疾、福、遷四化到十二宮）</li>
            </ul>
          </>
        );
      case "g2":
        return (
          <>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>8 課</span>
              <span className={styles.metaChip}>$4,800</span>
              <span className={`${styles.metaChip} ${styles.earlyBird}`}>早鳥 $3,800</span>
            </div>
            <p className={styles.sectionLabel}>課程大綱</p>
            <ul className={styles.list}>
              <li>十四主星本質象義，以及星曜在四化下的能量狀態</li>
              <li>兄弟、夫妻、子女、財帛、交友、事業、田宅、父母 — 八宮四化象義與飛化邏輯</li>
              <li>事業格局與感情緣分的基礎判讀</li>
            </ul>
          </>
        );
      case "g3":
        return (
          <>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>8 - 12 課</span>
              <span className={styles.metaChip}>$6,800</span>
              <span className={`${styles.metaChip} ${styles.earlyBird}`}>早鳥 $5,800</span>
            </div>
            <p className={styles.sectionLabel}>課程大綱</p>
            <ul className={styles.list}>
              <li>宮位飛化配合星曜象義的綜合推理</li>
              <li>梁氏飛星獨門技法核心介紹</li>
              <li>祿轉忌應用（追蹤資源與順境流向）</li>
              <li>忌轉忌應用（追蹤執著與破壞點的癥結）</li>
            </ul>
          </>
        );
      case "g4":
        return (
          <>
            <div className={styles.alert}>
              <WarningAmberIcon fontSize="small" />
              <span>入學門檻：需完成 Grade 1-3 訓練。</span>
            </div>
            <p className={styles.sectionLabel}>課程大綱與收費機制</p>
            <div className={styles.phaseCard}>
              <p className={styles.phaseTitle}>Phase 1：核心技法</p>
              <p className={styles.phaseFee}>$4,800</p>
              <ul className={styles.list}>
                <li>梁氏飛星派排盤安星法</li>
                <li>吉化串連規則：化祿轉忌、同星曜追祿串連</li>
                <li>凶化串連規則：化忌轉忌、同宮相迫、對宮互沖串連</li>
              </ul>
              <p className={styles.unlockNote}>完成此階段即可開始報讀 Grade 5 任何主題，邊練邊讀</p>
            </div>
            <div className={styles.phaseCard}>
              <p className={styles.phaseTitle}>Phase 2：百日築基</p>
              <p className={styles.phaseFee}>$4,800</p>
              <ul className={styles.list}>
                <li>以連續 100 日完整功課為築基門檻，建立穩固的盤感與修煉紀律</li>
                <li>深度消化命盤架構，強化基本功、排盤速度與熟練度</li>
              </ul>
              <p className={styles.unlockNote}>必須從本階段畢業，才能取得後續 Grade 6 報讀資格</p>
            </div>
          </>
        );
      case "g5":
        return (
          <>
            <p className={styles.inlineNote}>入學門檻：需完成 Grade 4 的 Phase 1。</p>
            <p className={styles.sectionLabel}>主題模組（可自由選修順序）</p>
            <div className={styles.moduleGrid}>
              {[
                ["5A【立命】", "家道、性格及價值觀", "6 - 8 課", "$4,800"],
                ["5B【謀財】", "財運、事業運及投資理財", "6 - 8 課", "$4,800"],
                ["5C【問情】", "感情觀、婚姻、人際及兩性關係", "6 - 8 課", "$4,800"],
                ["5D【護體】", "身形體重外表、健康疾病意外", "6 - 8 課", "$3,800"],
                ["5E【乘風】", "學習、天份、根器、驛馬移民", "4 - 6 課", "$3,800"],
                ["5F【安居】", "斗數陽宅（選修科）", "", "$6,800"],
              ].map(([code, name, lessons, fee]) => (
                <div key={code} className={styles.moduleCard}>
                  <p className={styles.moduleCode}>{code}</p>
                  <p className={styles.moduleName}>{name}</p>
                  <p>{lessons ? `${lessons} · ${fee}` : fee}</p>
                </div>
              ))}
            </div>
          </>
        );
      case "g6":
        return (
          <>
            <div className={styles.alert}>
              <WarningAmberIcon fontSize="small" />
              <span>
                嚴格門檻：必須從 Grade 4 畢業，並在 Grade 5 修讀任意一個主題（5A–5E，不包括 5F），方可報讀。
              </span>
            </div>
            <div className={styles.phaseCard}>
              <p className={styles.phaseTitle}>6A 論時間點與契應</p>
              <p className={styles.phaseFee}>$9,800</p>
              <ul className={styles.list}>
                <li>十年大運：掌握人生階段性的主旋律與轉折</li>
                <li>流年運：鎖定當年吉凶走向與關鍵契機</li>
                <li>流月運：精準對位事件發生的時間窗口</li>
              </ul>
            </div>
            <div className={styles.phaseCard}>
              <p className={styles.phaseTitle}>6B 借盤論六親</p>
              <p className={styles.phaseFee}>$9,800</p>
              <ul className={styles.list}>
                <li>精準推算六親狀態、際遇與互動能量</li>
                <li>延伸解讀六親以外的遠親、姻親等複雜人際（如父親的姐姐的丈夫），仍能定位具體人物與事件細節</li>
              </ul>
            </div>
          </>
        );
      case "g7":
        return (
          <>
            <div className={styles.alertStrong}>
              <WarningAmberIcon fontSize="small" />
              <span>終極門檻：必須完成 Grade 4 至 Grade 6 全部學程，方可參加。</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>約 12 課</span>
              <span className={styles.metaChip}>$5,800</span>
            </div>
            <p className={styles.sectionLabel}>課程大綱</p>
            <ul className={styles.list}>
              <li>星軌理數論命師的職業道德與執業規範</li>
              <li>建立系統化、可複製的論命思路</li>
              <li>實戰案例論命考核（達最低及格標準方可畢業）</li>
            </ul>
            <p className={styles.certBadge}>
              <VerifiedIcon fontSize="small" />
              完成考核後，除正式頒發「星軌理數 專業分析師證書（梁氏飛星體系）」外，將於星軌理數學院登記，成為合資格星軌理數分析師。
            </p>
          </>
        );
      default:
        return null;
    }
  };

  const renderAccordion = (section) =>
    ACCORDION_ITEMS.filter((item) => item.section === section).map((item) => {
      const isOpen = openMap[item.id];
      return (
        <article
          key={item.id}
          ref={(node) => {
            itemRefs.current[item.id] = node;
          }}
          className={[
            styles.gradeCard,
            isOpen ? styles.open : "",
            item.pinnacle ? styles.pinnacle : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            className={styles.gradeTrigger}
            aria-expanded={isOpen}
            onClick={() => toggleItem(item.id)}
          >
            <span className={styles.gradeNum}>{item.num}</span>
            <span className={styles.titleWrap}>
              <span className={styles.gradeLabel}>{item.grade}</span>
              <span className={`${styles.gradeTitle} ${landing.goldText}`}>
                {item.title}
                {item.subtitle ? (
                  <span className={styles.gradeSubtitle}> · {item.subtitle}</span>
                ) : null}
              </span>
            </span>
            <span className={styles.chevronWrap}>
              <ExpandMoreIcon className={styles.chevron} />
            </span>
          </button>

          <div className={styles.gradeBody} aria-hidden={!isOpen}>
            <div className={styles.gradeBodyInner}>
              <div className={styles.gradeContent}>
                {renderItem(item.id)}
                <CourseCta />
              </div>
            </div>
          </div>
        </article>
      );
    });

  return (
    <div className={`${styles.page} ${landing.page}`}>
      <Head>
        <title>紫微斗數課程體系｜星軌理數七階認證藍圖</title>
        <meta
          name="description"
          content="星軌理數七階專業分析師認證藍圖，從飛星紫微斗數基礎到梁氏飛星專業傳承班。"
        />
      </Head>

      <div className={landing.bgDecoration}>
        <div className={landing.baguaContainer}>
          <div className={landing.yinYang} />
          <div className={landing.compassRing1} />
          <div className={landing.compassRing2} />
        </div>
      </div>

      <div className={landing.headerWrapper}>
        <Header show />
      </div>

      <main className={styles.main}>
        <div className={styles.container}>
          <header className={styles.header}>
            <span className={styles.kicker}>
              <SchoolIcon fontSize="small" /> 紫微斗數課程體系
            </span>
            <h1 className={landing.serif}>
              星軌理數 —— <span className={landing.goldText}>七階專業分析師認證藍圖</span>
            </h1>
            <p className={styles.subtitle}>
              從基礎覺醒到大師傳承，邏輯最嚴密的飛星紫微斗數學習路徑
            </p>
          </header>

          <section className={styles.trackSection}>
            <h2 className={`${styles.trackTitle} ${landing.serif}`}>
              <span className={landing.goldText}>飛星紫微斗數</span>基礎
            </h2>
            <div className={styles.gradeStack}>{renderAccordion("foundation")}</div>
          </section>

          <section className={`${styles.trackSection} ${styles.trackAdvanced}`}>
            <h2 className={`${styles.trackTitle} ${landing.serif}`}>
              星軌理數（梁氏飛星）<span className={landing.goldText}>專業傳承班</span>
            </h2>
            <div className={styles.gradeStack}>{renderAccordion("advanced")}</div>
          </section>
        </div>
      </main>
    </div>
  );
}
