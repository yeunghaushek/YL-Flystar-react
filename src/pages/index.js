import Head from "next/head";
import Link from "next/link";
import { Header } from "@/components/header";
import landing from "@/styles/HomeLanding.module.scss";

// MUI Icons for premium feel
import ExploreIcon from '@mui/icons-material/Explore';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DiamondIcon from '@mui/icons-material/Diamond';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

export default function Home() {
  return (
    <div className={landing.page}>
      <Head>
        <title>星軌堂 - 命格導航與商業增長 | 梁氏飛星紫微斗數</title>
        <meta
          name="description"
          content="用工程師的邏輯做命格導航，幫企業主避開燒錢坑位，精準卡位商業藍海。星軌堂提供專業飛星紫微斗數線上排盤、梅花易數即時起卦、以及1對1商業增長諮詢。"
        />
        <meta name="keywords" content="紫微斗數, 飛星紫微斗數, 梁氏飛星, 命理諮詢, 商業導航, 梅花易數, 排盤, 算命, 星軌堂" />
        <link rel="canonical" href="https://yl-flystar.pro/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yl-flystar.pro/" />
        <meta property="og:title" content="星軌堂 - 命格導航與商業增長 | 梁氏飛星紫微斗數" />
        <meta property="og:description" content="用工程師的邏輯做命格導航，幫企業主避開燒錢坑位，精準卡位商業藍海。星軌堂提供專業飛星紫微斗數線上排盤、梅花易數即時起卦、以及1對1商業增長諮詢。" />
        <meta property="og:image" content="https://yl-flystar.pro/og.png" />
        <meta property="og:site_name" content="星軌堂" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://yl-flystar.pro/" />
        <meta name="twitter:title" content="星軌堂 - 命格導航與商業增長 | 梁氏飛星紫微斗數" />
        <meta name="twitter:description" content="用工程師的邏輯做命格導航，幫企業主避開燒錢坑位，精準卡位商業藍海。星軌堂提供專業飛星紫微斗數線上排盤、梅花易數即時起卦、以及1對1商業增長諮詢。" />
        <meta name="twitter:image" content="https://yl-flystar.pro/og.png" />
      </Head>
      
      {/* Animated Background Elements */}
      <div className={landing.bgDecoration}>
        <div className={landing.baguaContainer}>
          {/* CSS Yin-Yang */}
          <div className={landing.yinYang}></div>
          
          {/* SVG Trigrams (Later Heaven Sequence) */}
          <svg viewBox="-500 -500 1000 1000" className={landing.baguaRing}>
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b6914" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#6b4e0f" />
              </linearGradient>
              <g id="yang">
                <rect x="-60" y="-10" width="120" height="20" fill="url(#goldGrad)" rx="4" />
              </g>
              <g id="yin">
                <rect x="-60" y="-10" width="52" height="20" fill="url(#goldGrad)" rx="4" />
                <rect x="8" y="-10" width="52" height="20" fill="url(#goldGrad)" rx="4" />
              </g>
              
              {/* Trigram Definitions (Yao 1 is bottom/closest to center, Yao 3 is top) */}
              <g id="tri-li">
                <use href="#yang" y="34" />
                <use href="#yin" y="0" />
                <use href="#yang" y="-34" />
              </g>
              <g id="tri-kun">
                <use href="#yin" y="34" />
                <use href="#yin" y="0" />
                <use href="#yin" y="-34" />
              </g>
              <g id="tri-dui">
                <use href="#yang" y="34" />
                <use href="#yang" y="0" />
                <use href="#yin" y="-34" />
              </g>
              <g id="tri-qian">
                <use href="#yang" y="34" />
                <use href="#yang" y="0" />
                <use href="#yang" y="-34" />
              </g>
              <g id="tri-kan">
                <use href="#yin" y="34" />
                <use href="#yang" y="0" />
                <use href="#yin" y="-34" />
              </g>
              <g id="tri-gen">
                <use href="#yin" y="34" />
                <use href="#yin" y="0" />
                <use href="#yang" y="-34" />
              </g>
              <g id="tri-zhen">
                <use href="#yang" y="34" />
                <use href="#yin" y="0" />
                <use href="#yin" y="-34" />
              </g>
              <g id="tri-xun">
                <use href="#yin" y="34" />
                <use href="#yang" y="0" />
                <use href="#yang" y="-34" />
              </g>
            </defs>

            {/* Later Heaven Sequence Positioning */}
            <use href="#tri-li" transform="rotate(0) translate(0, -420)" />
            <use href="#tri-kun" transform="rotate(45) translate(0, -420)" />
            <use href="#tri-dui" transform="rotate(90) translate(0, -420)" />
            <use href="#tri-qian" transform="rotate(135) translate(0, -420)" />
            <use href="#tri-kan" transform="rotate(180) translate(0, -420)" />
            <use href="#tri-gen" transform="rotate(225) translate(0, -420)" />
            <use href="#tri-zhen" transform="rotate(270) translate(0, -420)" />
            <use href="#tri-xun" transform="rotate(315) translate(0, -420)" />
          </svg>
          
          {/* Outer Golden Rings */}
          <div className={landing.compassRing1}></div>
          <div className={landing.compassRing2}></div>
        </div>
      </div>

      {/* Header with transparent/glassmorphism style matching the theme */}
      <div className={landing.headerWrapper}>
        <Header show />
      </div>

      <main>
        {/* Hero Section */}
        <section className={landing.heroSection}>
          <div className={landing.container}>
            <div className={landing.hero}>
              {/* Text on the Left */}
              <div className={landing.heroText}>
                <span className={landing.kicker}>
                  <ExploreIcon fontSize="small" /> 星軌堂 · 商業決策導航
                </span>
                <h1 className={`${landing.heroTitle} ${landing.serif}`}>
                  幫你的收入<span className={`${landing.goldText} ${landing.nowrap}`}>「加個零」</span><br />
                  用命格導航，精準選中<span className={landing.nowrap}>爆款產品</span>。
                </h1>
                <p className={landing.heroSubtitle}>
                  <span className={landing.highlight}>別再靠感覺創業。</span>我是 Jeff，<span className={landing.highlight}>原軟體架構工程師</span>。我運用「星軌理數」（梁氏飛星紫微斗數）——一套摒棄玄學口訣、<span className={landing.highlight}>純粹邏輯推理</span>的精密系統，為你找出<span className={landing.highlight}>獲利最高</span>的人生路徑，<span className={landing.highlight}>避開燒錢的坑</span>。
                </p>
                <div className={landing.ctaGroup}>
                  <Link href="/chart" className={landing.btnPrimary}>
                    <AutoGraphIcon /> 立即排盤：看財富從哪來
                  </Link>
                  <a
                    className={landing.btnSecondary}
                    href="https://wa.me/85294780643?text=你好，我想預約命理諮詢"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon /> WhatsApp 諮詢
                  </a>
                </div>
              </div>

              {/* Image on the Right */}
              <div className={landing.heroImage}>
                <div className={landing.imageWrapper}>
                  {/* Changed to me.webp as requested */}
                  <img
                    src="/me.webp"
                    alt="命格導航師 Jeff Yeung"
                    onError={(e) => {
                      // Fallback to og.png if me.webp is not found
                      e.currentTarget.src = "/og.png"; 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className={landing.proofSection}>
          <div className={landing.container}>
            <div className={landing.proofContent}>
              <div className={landing.proofMetric}>
                助百位客戶達成增長，最高創下
                <strong className={`${landing.serif} ${landing.goldText}`}>27 倍收入增長</strong> 案例
              </div>
              <div className={landing.proofBadges}>
                <span className={landing.badge}>
                  <span className={landing.badgeIcon}><WorkspacePremiumIcon /></span>
                  梁氏飛星紫微斗數·第三代傳人
                </span>
                <span className={landing.badge}>
                  <span className={landing.badgeIcon}><VerifiedIcon /></span>
                  IG/FB 數碼行銷專家 × 原架構工程師
                </span>
                <span className={landing.badge}>
                  <span className={landing.badgeIcon}><CalculateIcon /></span>
                  以最邏輯的思路，用最精準的命格演算法
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section className={landing.section}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>解鎖財富潛能密碼</h2>
              <p>拒絕迷信，體驗邏輯推理的力量</p>
            </div>
            <div className={landing.toolsGrid}>
              <div className={landing.toolCard}>
                <div className={landing.toolIcon}>
                  <DiamondIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>飛星紫微斗數在線排盤</h3>
                <p>你的財富天賦來自哪裡？是<span className={landing.highlight}>口才建功</span>、<span className={landing.highlight}>技術變現</span>、還是<span className={landing.highlight}>人脈整合</span>？透過「星軌理數」精確定位。</p>
                <Link href="/chart" className={landing.toolLink}>
                  獲取免費排盤報告
                </Link>
                <a href="https://wa.me/85294780643" target="_blank" rel="noopener noreferrer" className={landing.toolHintLink}>
                  <WhatsAppIcon className={landing.waIcon} />
                  <span className={landing.hintContent}>需要深度解碼？預約 Jeff 1對1 精確分析財富定位</span>
                  <span className={landing.arrow}>→</span>
                </a>
              </div>
              <div className={landing.toolCard}>
                <div className={landing.toolIcon}>
                  <ExploreIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>梅花易數即時起卦</h3>
                <p>決策不再擲硬幣。針對當下困境起一卦，<span className={landing.highlight}>減少決策損耗</span>，不再花錯錢、走錯路。</p>
                <Link href="/meihua" className={landing.toolLink}>
                  立即起卦
                </Link>
                <a href="https://wa.me/85294780643" target="_blank" rel="noopener noreferrer" className={landing.toolHintLink}>
                  <WhatsAppIcon className={landing.waIcon} /> 
                  <span className={landing.hintContent}>局勢模糊？WhatsApp 即時拆解卦象落地方案</span>
                  <span className={landing.arrow}>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section - Alternating Background */}
        <section className={landing.sectionAlt}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>「星軌理數」：沒有玄學口訣，只有邏輯推理。</h2>
            </div>
            <div className={landing.compareContainer}>
              <div className={`${landing.compareBox} ${landing.oldWay}`}>
                <span className={landing.compareLabel}>
                  <HistoryToggleOffIcon fontSize="small" /> 傳統命理
                </span>
                <p className={landing.serif}>
                  充滿模糊的古文口訣，聽起來很有道理，但你不知道明天幾點該簽約、該找誰簽。
                </p>
              </div>
              <div className={`${landing.compareBox} ${landing.newWay}`}>
                <span className={landing.compareLabel}>
                  <TrackChangesIcon fontSize="small" /> 星軌堂
                </span>
                <p>
                  <strong className={landing.serif}>梁氏飛星</strong>本質就是一套嚴密的推理系統。Jeff 結合工程師背景，將這套系統轉化為可執行的「商業地圖」，告訴你哪個月該衝刺、哪個崗位該換人、哪種模式最賺錢。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className={landing.section}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>導航諮詢與邏輯教學</h2>
            </div>
            <div className={landing.servicesGrid}>
              <div className={landing.serviceCard}>
                <div className={landing.serviceIcon}>
                  <PsychologyIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>量身訂造策略</h3>
                <p>針對事業轉機、財運佈局，提供 1 對 1 的戰略定位導航。</p>
                <a href="https://wa.me/85294780643?text=你好，我想預約1對1戰略定位導航" target="_blank" rel="noreferrer" className={landing.serviceCta}>
                  <WhatsAppIcon className={landing.waIcon} /> 立即預約諮詢
                </a>
              </div>
              <div className={landing.serviceCard}>
                <div className={landing.serviceIcon}>
                  <AutoGraphIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>飛星紫微斗數教學</h3>
                <p><strong>正式門派傳承。</strong> 從零開始教你這套「沒有口訣」的邏輯系統，掌握人生的底層演算法。</p>
              </div>
              <div className={landing.serviceCard}>
                <div className={landing.serviceIcon}>
                  <MenuBookIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>梅花易數卜卦課程</h3>
                <p>學會隨時隨地起卦。從生活萬物中提取數據，讓每一次決策都有邏輯支撐。</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Alternating Background */}
        <section className={`${landing.sectionAlt} ${landing.finalCta}`}>
          <div className={landing.container}>
            <h2 className={landing.serif}>
              想像一下，如果你的每一個商業決策都有<span className={landing.nowrap}>數據支撐</span>，不再盲目試錯，你的事業會<span className={landing.nowrap}>在哪裡</span>？
            </h2>
            <div className={landing.contactCards}>
              <a href="https://wa.me/85294780643?text=你好，我想預約諮詢" target="_blank" rel="noreferrer">
                <span className={landing.contactIcon}><WhatsAppIcon /></span> WhatsApp 9478 0643
              </a>
              <a href="https://www.instagram.com/yl_astrologix" target="_blank" rel="noreferrer">
                <span className={landing.contactIcon}><InstagramIcon /></span> IG: @yl-astrologix
              </a>
              <a 
                href="https://www.google.com/maps/search/?api=1&query=香港九龍荔枝角青山道489-491號香港工業中心A座3樓A1-09" 
                target="_blank" 
                rel="noreferrer"
                className={landing.addressLink}
              >
                <span className={landing.contactIcon}><LocationOnIcon /></span> 香港九龍荔枝角青山道 489-491 號 A 座 3 樓 A1-09
              </a>
            </div>
          </div>
        </section>
      </main>

      <div 
        className="footer" 
        style={{ 
          background: 'transparent', 
          borderTop: '1px solid rgba(218, 165, 32, 0.1)', 
          color: '#64748b', 
          padding: '32px 0', 
          textAlign: 'center',
          fontSize: '14px',
          letterSpacing: '0.05em'
        }}
      >
        {`${new Date().getFullYear()} © 星軌堂 版權所有`}
      </div>
    </div>
  );
}
