import Head from "next/head";
import Link from "next/link";

import aboutStyle from "@/styles/About.module.scss";

import { Grid, Divider, Accordion, AccordionSummary, AccordionDetails, SpeedDial, SpeedDialAction, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CallIcon from "@mui/icons-material/Call";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import YouTubeIcon from "@mui/icons-material/YouTube";
import FacebookIcon from "@mui/icons-material/Facebook";
/* import FacebookIcon from "@mui/icons-material/Facebook"; */

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { useEffect, useState } from "react";

const actions = [
  {
    icon: (
      <a target="_blank" href="https://www.instagram.com/yl_astrologix?igsh=N2psYm8wZzhjNDJ1">
        <InstagramIcon />
      </a>
    ),
    name: "Instagram",
  },
  {
    icon: (
      <a target="_blank" href="https://www.facebook.com/profile.php?id=61556268658653&mibextid=ZbWKwL">
        <FacebookIcon />
      </a>
    ),
    name: "Facebook",
  },
  {
    icon: (
      <a target="_blank" href="https://www.threads.net/@yl_astrologix">
        <img src={`/thread_icon.png`} alt="thread_icon" width="24" />
      </a>
    ),
    name: "Thread",
  },
  {
    icon: (
      <a target="_blank" href="https://wa.me/85294780643?text=你好，我想了解一下命理分析服務">
        <WhatsAppIcon />
      </a>
    ),
    name: "WhatsApp",
  },
  {
    icon: (
      <a target="_blank" href="https://www.youtube.com/@yl-astrologix">
        <YouTubeIcon />
      </a>
    ),
    name: "Youtube",
  },
  {
    icon: (
      <a href="#contact">
        <img src={`/wechat_icon.png`} alt="wechat_icon" width="24" />
      </a>
    ),
    name: "Wechat",
  },
  {
    icon: (
      <a href="#contact">
        <CallIcon />
      </a>
    ),
    name: "Phone",
  },
  /* {
    icon: (
      <a href="#">
        <FaLine size={24} />
      </a>
    ),
    name: "Line", 
  },
  {
    icon: (
      <a href="#">
        <IoLogoWechat size={24} />
      </a>
    ),
    name: "WeChat",
  },
  {
    icon: (
      <a href="#">
        <FaDiscord size={24} />
      </a>
    ),
    name: "Discord",
  }, */
];

const columns = [
  {
    field: "level",
    headerName: "課程階段",
    sortable: false,
    flex: 1,
    minWidth: 150,
    renderCell: (params) => {
      return <strong>{params.value}</strong>;
    },
    renderHeader: (params) => {
      return <strong>{"課程階段"}</strong>;
    },
  },
  {
    field: "description",
    headerName: "課程簡介",
    sortable: false,
    flex: 3,
    minWidth: 300,
    renderHeader: (params) => {
      return <strong>{"課程簡介"}</strong>;
    },
  },
  {
    field: "target",
    headerName: "課程目標",
    sortable: false,
    flex: 3,
    minWidth: 300,
    renderHeader: (params) => {
      return <strong>{"課程目標"}</strong>;
    },
  },
  /* {
    field: "price",
    headerName: "費用",
    sortable: false,
    flex: 2,
    minWidth: 225,
    renderHeader: (params) => {
      return <strong>{"費用"}</strong>;
    },
  }, */
];

const rows = [
  {
    id: 1,
    level: "基礎課程",
    description: "學習星軌理數命盤的符號意義，排盤方法，以及宮位、星曜、四化、飛化的基本象義。",
    target: "掌握命盤的基本結構和符號解讀，為進一步的學習打下堅實基礎。",
    price: "HKD $3,800 / 一期 (總共6-10節課)",
  },
  {
    id: 2,
    level: "核心技術",
    description: "星軌理數的核心技術和獨特命盤結構的教學，並進行每日排盤和核心技術練習。",
    target: "使學員能夠熟練運用星軌理數的核心技術，準確解讀命盤。",
    price: "HKD $3,800 / 一期 (總共6-10節課)",
  },
  {
    id: 3,
    level: "主題深入",
    description: "針對人生各個主題（如工作、感情等）進行深入討論，學習主題的主要結構和判斷方法。",
    target: "學會針對各主題進行準確的預測和分析，為深造課程做準備。",
    price: "HKD $4,800 / 一期 (共2期, 每期6-10節課)",
  },
  {
    id: 4,
    level: "借盤論述與時間判斷",
    description: "通過命主的命盤，學習分析與命主相關人物的情況，以及時間判斷方法。",
    target: "能夠運用命盤分析他人，並準確預測未來發展的時間點。",
    price: "HKD $5,800 / 一期 (總共 6-10節課)",
  },
  {
    id: 5,
    level: "深造課程",
    description: "深入探討更高級的分析技巧，並學習如何精確地論述事件的細節，就如同觀看一部電影一般。",
    target: "為已經掌握了基礎和核心技術的學生提供進階學習機會，以持續提升他們的命理分析能力和深度理解。",
    price: "HKD $6,800 / 10節",
  },
];

export default function About() {
  const [bannerOffset, setBannerOffset] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(document.body.scrollTop);
    };
    // just trigger this so that the initial state
    // is updated as soon as the component is mounted
    // related: https://stackoverflow.com/a/63408216
    handleScroll();
    document.body.addEventListener("scroll", handleScroll);
    return () => {
      document.body.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let banner = document.getElementById("banner1");
    setBannerOffset(banner.offsetHeight);
  }, []);
  return (
    <>
      <Head>
        <title>曜靈星軌理數 - 您的智能人生定位系統</title>
        <meta
          name="description"
          content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
        />
        <meta name="google-site-verification" content="GgRiozFx3jLZsdTn2Tqpxhao0v52utKt4__I2Je4csY" />
      </Head>
      <div className={`header ${scrollTop && scrollTop >= bannerOffset - 120 ? `show` : ``}`}>
        <div className="left info-header">
          <Link href="/">
            <div className="logo">
              <img src={"logo.png"} alt="logo" />
              <div className="name">曜靈星軌理數</div>
            </div>
          </Link>
          <Link href="/chart">
            <button>線上排盤</button>
          </Link>
          <Link href="#begin">
            <button>遇見命理師</button>
          </Link>
          {/* <Link href="#analysis">
            <button>命理分析</button>
          </Link>
          <Link href="#course">
            <button>教學課程</button>
          </Link>
          <Link href="#question">
            <button>常見問題</button>
          </Link>
          <Link href="#contact">
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
      <div className={aboutStyle.bg}>
        <div className={aboutStyle.banner} id="banner1">
          <div className={aboutStyle.left}></div>
          <div className={aboutStyle.right}>
            <div className={aboutStyle.title}>曜靈星軌理數</div>
            <div className={aboutStyle.caption}>您的智能人生定位系統</div>
            <br />
            <br />
            <div className={aboutStyle.link}>
              <Link href="#contact">
                <button>立即預約</button>
              </Link>{" "}
            </div>
            {/* <a href="#begin">瞭解更多</a> */}
            <div className={aboutStyle.link}>
              <Link href="/chart">
                <button>線上排盤</button>
              </Link>{" "}
            </div>
            <div className={aboutStyle.link}>
              <Link href="/blog">
                <button>網誌</button>
              </Link>{" "}
            </div>
          </div>
        </div>
        <div className="container" id="begin">
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className={aboutStyle.pageTitle}>命理之旅的啟程</div>
          <div className={aboutStyle.pageText}>
            從一位堅持邏輯與科學的軟件工程師，到成為一名深諳命理學的專家，我的職業轉變是一段充滿洞察和轉變的旅程。在這條路上，我從最初對於玄學的質疑，走到了深入探索這一領域的深奧智慧。
            <br />
            <br />
            這一轉變的關鍵，來自於與命理導師張世賢老師的邂逅。他不僅精通飛星紫微斗數，更在我的人生軌跡上發揮了重要的指導作用。張老師不僅精準地指出了我當時的處境，也揭示了我未曾預料到的現實挑戰，甚至將我的夢想和想法一一點出，這讓我深受觸動。
            <br />
            <br />
            經過這段經歷，我開始認真學習飛星紫微斗數，致力於深入了解這門學問。我的目標是將其美好和力量傳遞給更多的人，幫助他們提升自我，面對生活中的挑戰，並從中找到轉機和機遇，開創更加輝煌的人生。
          </div>
          <br id="analysis" />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>命理分析服務：深入您的人生藍圖</div>
          <div className={aboutStyle.pageText}>
            在我們提供的命理分析服務中，我們致力於為您提供遠超於傳統占卜或預測的深度洞察。這不僅是一次全面的自我發現之旅，更是一個深入探索和理解您的生命藍圖的過程。透過精確的命盤分析，我們能揭示您生命中的關鍵趨勢、轉折點以及潛在的挑戰和機遇。
          </div>
          <br />
          <div className={aboutStyle.pageSubheading}>核心服務</div>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={2}></Grid>
            <Grid item xs={12} sm={8}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>全面命理分析會談</div>
                {/* 價格：HKD $2,000
                <br /> */}
                形式：面對面或在線會談
                <br />
                <br />
                首先核對命盤，以命主過往經歷確認其準確性。
                <br />
                隨後針對命主感興趣的問題進行深入討論。
                <br />
                包括工作、事業、創業、感情、桃花、婚姻、家庭、健康、才華等多個主題。
              </div>
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
          <br />
          <br />
          <br />
          <div className={aboutStyle.pageSubheading}>持續諮詢服務</div>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>深度跟進分析</div>
                {/* 價格：HKD $1,200
                <br /> */}
                <br />
                <br />
                針對已經接受過全面命理分析的客戶，提供針對性的深入跟進。
                <br />
                涵蓋新的問題或生活中的變化，提供更新的洞察和建議。
                <br />* 適用於已完成全面命理分析的客戶。
              </div>
            </Grid>
            <Grid item xs={12} sm={6}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>年度命理更新</div>
                {/* 價格：HKD $1,200
                <br /> */}
                <br />
                <br />
                為長期客戶提供每年的命理更新，反映最新的生活變化和即將到來的機遇。
                <br />
                幫助客戶持續調整和優化他們的人生策略。
                <br />* 適用於已完成全面命理分析的客戶。
              </div>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={12} sm={6}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>長期諮詢計劃</div>
                {/* 價格：HKD $5,000 / 年
                <br /> */}
                <br />
                <br />
                為有持續諮詢需求的客戶提供定期會談服務。
                <br />
                每月一次的全面命理分析和無限次的簡短諮詢。
                <br />* 適用於已完成全面命理分析的客戶。
              </div>
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
          <br />
          <br />
          <br />
          <div className={aboutStyle.pageSubheading}>專題探討</div>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>創業與事業規劃</div>
                {/* 價格：HKD $1,500
                <br /> */}
                <br />
                <br />
                專注於創業機會評估、事業發展策略、職場機遇。
                <br />
              </div>
            </Grid>
            <Grid item xs={6} sm={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>感情與婚姻</div>
                {/* 價格：HKD $1,500
                <br /> */}
                <br />
                <br />
                專注於感情生活、人際互動、婚姻諮詢等。
                <br />
              </div>
            </Grid>
            <Grid item xs={6} sm={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>財富與投資規劃</div>
                {/* 價格：HKD $1,500
                <br /> */}
                <br />
                <br />
                針對財務規劃、投資機會、財富管理提供指導。
                <br />
              </div>
            </Grid>

            <Grid item xs={6} sm={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>個人成長與自我實現</div>
                {/* 價格：HKD $1,000
                <br /> */}
                <br />
                <br />
                專注於個人目標設定、生活技能提升、自我實現的途徑。
                <br />
              </div>
            </Grid>
            <Grid item xs={6} sm={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>教育與學業發展</div>
                {/* 價格：HKD $1,000
                <br /> */}
                <br />
                <br />
                針對學業規劃、職業教育選擇、專業技能提升提供諮詢。
                <br />
              </div>
            </Grid>
            <Grid item xs={6} sm={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>人際關係與社交網絡</div>
                {/* 價格：HKD $1,000
                <br /> */}
                <br />
                <br />
                針對建立和維護健康的人際關係、擴大社交網絡提供專業建議。
                <br />
              </div>
            </Grid>
          </Grid>
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className={aboutStyle.pageText}>
            我們的服務專注於核對命盤與命主過往經歷的完美對應，並針對命主關心的問題提供具體的討論和解答。無論是職業選擇、感情問題還是健康和財運，我們的分析都旨在為您帶來新的視角和具體建議，幫助您在生活中做出更明智的決策。
            <br />
            <br />
            命理分析的真正價值在於它提供的深層次洞察，這些洞察不僅涉及未來的趨勢，還包括個人的內在特質、潛在能力和生活中的重要決策。這種深入的自我理解是實現個人目標和夢想的關鍵。透過我們的專業分析，您將能夠更好地理解自己，掌握自己的命運，並在人生的旅程中做出更有意義和更有成效的選擇。
          </div>
          <br id="course" />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>星軌理數：邏輯與深度的命理探索</div>
          <div className={aboutStyle.pageText}>
            星軌理數，源自於梁氏飛星紫微斗數的深厚基礎，代表了當代命理學中的一個創新分支。它採用了一種獨特且系統化的方法，用以解析個人的命運和人生軌迹。這一新派系之所以突出，是因為它在邏輯性和系統性上的重視，使得對個人命運的分析既準確又富有深度，提升了可靠性。
            <br />
            <br />
            在星軌理數的框架下，四化被認為是命盤中的關鍵元素，它們是塑造個人成功或失敗的核心因素。透過獨到的分析技巧，結合宮位、四化及星曜的綜合解讀，我們提供了對個人命運深層次的洞察。這種分析方法就像是解碼一個複雜數學公式，其中每個部分都是解讀整體的關鍵。
          </div>
          <br />
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
            disableDensitySelector
            disableRowSelectionOnClick
            disableVirtualization
            hideFooter
            hideFooterPagination
            hideFooterSelectedRowCount
            showCellVerticalBorder
            showColumnVerticalBorder
            rowHeight={96}
            sx={{
              fontSize: "16px",
              "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
                outline: "none !important",
              },
            }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
          />
          <br />
          所有課程的節數均根據學生的學習進度進行彈性安排，確保學生能夠充分掌握每一階段的學習內容。每一期的課程費用包含了學習到該階段的完整進度。
          <br />
          <br />
          <div className={aboutStyle.pageText}>
            學習星軌理數，您將掌握如何運用這套系統來揭示個性的細節、未來可能的轉變點，以及如何面對挑戰與抓住機遇的策略。這門學科不僅為我們預示未來，更重要的是，它幫助學習者深入了解生活中的每一次選擇和經歷，從而更主動地操控自己的命運。
            <br />
            <br />
            參與我們的教學課程，您將有機會深入學習這門融合傳統智慧與現代邏輯的命理學。這不僅能為您自己帶來深刻的自我認識，還能為他人提供專業的生命指導。加入我們，啟程一段充滿洞見與發現的學習旅程。
          </div>
          {/* <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br /> */}
        </div>
        {/* <Carousel centerMode centerSlidePercentage={75} showArrows showStatus={false} autoPlay interval={6000} infiniteLoop>
          <div className={aboutStyle.carousel}>
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/DEYHzTA8NGw?si=4C3-Vgn6ytTdGYUJ"
              title="YouTube video player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </div>
          <div className={aboutStyle.carousel}>
            <img
              src="https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="carousel2"
            />
          </div>
          <div className={aboutStyle.carousel}>
            <img
              src="https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="carousel3"
            />
          </div>
          <div className={aboutStyle.carousel}>
            <img
              src="https://images.pexels.com/photos/2558605/pexels-photo-2558605.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="carousel4"
            />
          </div>
        </Carousel> */}
        <div className="container">
          <br id="question" />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>常見問題</div>
          <div className={aboutStyle.pageText}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel0a-content" id="panel0a-header">
                所有事情都是注定的嗎？還是可以改變的？
              </AccordionSummary>
              <AccordionDetails sx={{ fontSize: "16px" }}>
                在命理學的理解中，雖然出生環境等某些因素是預先設定的，但絕大多數的人生事件和結果都是可變的，它們會隨著命主的選擇和決定而變化。
                <br />
                <br />
                我們的命理分析正是基於這樣的理念，旨在指引您做出最佳的選擇，從而引導您走向最理想的人生結果。通过命理分析，我們能夠為您提供關於如何做出明智決策的指導，以最大程度地實現個人潛能和達成生活目標。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                甚麼人適合進行命理分析，甚麼人則不適合？
              </AccordionSummary>
              <AccordionDetails sx={{ fontSize: "16px" }}>
                命理分析最適合那些渴望自我提升、希望讓自己變得更好的人。無論年齡大小，只要懷著積極進取的心態，命理分析都能提供相關的洞察和指引。對於年輕人來說，進行命理分析能在人生早期提供寶貴的方向指引；即使是在50到60歲，只要有決心和動力，依然可以透過命理分析來發展事業或探索新的人生機遇。此外，命理分析也適用於那些希望了解關於子孫未來的人。
                <br />
                <br />
                相反地，那些持有認命或怨天尤人心態的人則不太適合進行命理分析。因為即使我們提供了改善生活和前景的建議，如果他們不願意採取行動，這些分析也無法發揮實質的作用。命理分析需要一個願意積極行動、對生活懷有希望的態度來發揮其最大的效用。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                命理分析能得到甚麼？為甚麼我們要進行命理分析？
              </AccordionSummary>
              <AccordionDetails sx={{ fontSize: "16px" }}>
                命理分析提供三大關鍵洞察，幫助您更好地規劃和導航您的人生：
                <br />
                <br />
                1.
                識別資源、機會和選擇：命理分析能讓您了解在人生旅程中將會遇到的重要資源和機會，以及您面臨的選擇。這些信息對於制定成功策略和實現目標至關重要。
                <br />
                <br />
                2. 預見選擇後的結果：透過對您命盤的深入分析，您能夠預知特定選擇可能帶來的後果，這有助於您在生活中做出更明智和有見地的決策。
                <br />
                <br />
                3.
                識別潛在陷阱：命理分析同時揭示您人生道路上可能遇到的障礙和陷阱，讓您能夠提前做好準備，或選擇更適合的路徑來避免不必要的困難。
                <br />
                <br />
                進行命理分析的主要原因在於，它能夠幫助您選擇對的道路，減少走彎路的可能性。擁有這樣的洞察和指導，您可以更自信地面對生活的挑戰，把握每一個轉折點，並朝著更充實和滿意的生活邁進。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3a-content" id="panel3a-header">
                完成命理分析，能幫我賺錢嗎？
              </AccordionSummary>
              <AccordionDetails sx={{ fontSize: "16px" }}>
                根據我們門派的豐富論命經驗，許多命主在接受命理分析後，並且根據分析結果來進行事業規劃，通常會在5至10年內經歷顯著的收入增長。事實上，我們有記錄顯示，部分命主的收入在這段時間內增長了高達27倍。特別是對於創業者或有創業意願的人士來說，命理分析對於收入增長的影響尤為明顯。
                <br />
                <br />
                當然，命理分析並非直接的「賺錢工具」，而是一種提供洞察和指導的服務。透過分析，我們能夠幫助命主識別最有潛力的事業方向、最佳時機以及避免潛在陷阱。這些信息對於制定有效的職業策略、把握商業機會以及實現長期財富積累是非常有幫助的。因此，如果命主能夠根據命理分析的建議採取行動，確實有可能實現顯著的財務增長。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
                如果我來做命理分析，但覺得不準，怎麼辦？
              </AccordionSummary>
              <AccordionDetails sx={{ fontSize: "16px" }}>
                在我們進行命理分析時，我們的首要目標是確保分析結果與命主的實際情況完全一致。我們對分析的準確性要求極高，期望達到100%的吻合度。如果在分析過程中，您發現任何不準確之處，我們鼓勵您立即提出，因為這有助於我們更準確地核對命盤，並進行更精確的預測。
                <br />
                <br />
                我們理解客戶對準確性的期望，因此如果您在分析完成後仍然覺得結果不準確，我們承諾將全額退回您的論命費用。我們的這項退款保證旨在讓您安心嘗試我們的服務，確保您能夠在不滿意的情況下無風險地獲得滿意的解決方案。
              </AccordionDetails>
            </Accordion>
          </div>
          <br id="contact" />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          {/* <div className={aboutStyle.pageTitle}>立即預約</div>
          <div className={aboutStyle.contact}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfOT_w2D4V7WxUP_BHPHv1PFJAUsU8z2IXKn17uCrh7nzcaoQ/viewform?embedded=true"
              width="640"
              height="960"
              frameBorder="0"
            >
              正在載入…
            </iframe>
          </div> */}
          <div className={aboutStyle.pageTitle}>聯絡我們</div>
          {/* <div className={aboutStyle.contact}>
            <a target="_blank" href="https://www.instagram.com/yl_astrologix?igsh=N2psYm8wZzhjNDJ1">
              <img src="/ig.jpg" alt="instagram" />
            </a>
            <a target="_blank" href="https://www.facebook.com/profile.php?id=61556268658653&mibextid=ZbWKwL">
              <img src="/facebook.png" alt="facebook" />
            </a>
            <a target="_blank" href="https://www.threads.net/@yl_astrologix">
              <img src="/thread.png" alt="thread" />
            </a>
          </div> */}
          <div className={aboutStyle.contact}>
            <a target="_blank" href="https://wa.me/85294780643?text=你好，我想了解一下命理分析服務">
              <img src="/whatsapp.png" alt="whatsapp" />
            </a>
            {/*  <a target="_blank" href="https://www.youtube.com/@yl-astrologix">
              <img src="/youtube.png" alt="youtube" />
            </a>
            <img src="/wechat.png" alt="wechat" /> */}
          </div>
          <br />
          <div className={aboutStyle.contact}>
            <IconButton>
              <CallIcon />
            </IconButton>
            {`+852 9478 0643`}
          </div>

          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <br />
          <br />
          <br />
          <br />
          <a target="_blank" href="https://wa.me/85294780643?text=你好，我想了解一下命理分析服務">
            <SpeedDial
              ariaLabel="SpeedDial basic example"
              sx={{ position: "fixed", bottom: 64, right: 64 }}
              FabProps={{ sx: { backgroundColor: "#090", "&:hover": { backgroundColor: "#090" } } }}
              icon={<WhatsAppIcon />}
            >
              {/*  {actions.map((action) => (
              <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} sx={{ lineHeight: "unset" }} />
            ))} */}
            </SpeedDial>
          </a>
        </div>
      </div>
      <div className="footer">{`${new Date().getFullYear()} © 曜靈紫微飛星 版權所有`}</div>
    </>
  );
}
