import Head from "next/head";
import Link from "next/link";
import { Header } from "@/components/header";
import landing from "@/styles/HomeLanding.module.scss";

// MUI Icons
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PsychologyIcon from '@mui/icons-material/Psychology';

export default function TheoryPage() {
  return (
    <div className={landing.page}>
      <Head>
        <title>星軌理數 / 梁氏飛星 - 星軌堂</title>
        <meta
          name="description"
          content="不敢說是最精準的命理學，只敢說是最具邏輯的命理學。在星軌堂，我們不談玄學靈感，只談穩定、精密的命運演算法。"
        />
      </Head>

      {/* Animated Background Elements from Landing */}
      <div className={landing.bgDecoration}>
        <div className={landing.baguaContainer}>
          <div className={landing.yinYang}></div>
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

            <use href="#tri-li" transform="rotate(0) translate(0, -420)" />
            <use href="#tri-kun" transform="rotate(45) translate(0, -420)" />
            <use href="#tri-dui" transform="rotate(90) translate(0, -420)" />
            <use href="#tri-qian" transform="rotate(135) translate(0, -420)" />
            <use href="#tri-kan" transform="rotate(180) translate(0, -420)" />
            <use href="#tri-gen" transform="rotate(225) translate(0, -420)" />
            <use href="#tri-zhen" transform="rotate(270) translate(0, -420)" />
            <use href="#tri-xun" transform="rotate(315) translate(0, -420)" />
          </svg>
          <div className={landing.compassRing1}></div>
          <div className={landing.compassRing2}></div>
        </div>
      </div>

      <div className={landing.headerWrapper}>
        <Header show />
      </div>

      <main>
        {/* Section 1: Hero */}
        <section className={landing.heroSection} style={{ textAlign: 'center', paddingTop: '180px', paddingBottom: '100px' }}>
          <div className={landing.container}>
            <h1 className={`${landing.heroTitle} ${landing.serif}`} style={{ marginBottom: '30px' }}>
              不敢說是<span className={`${landing.goldText} ${landing.nowrap}`}>最精準</span>的命理學，<br className={landing.desktopBreak} />
              只敢說是<span className={`${landing.goldText} ${landing.nowrap}`}>最具邏輯</span>的命理學。
            </h1>
            <p className={landing.heroSubtitle} style={{ textAlign: 'center', borderLeft: 'none', paddingLeft: 0, margin: '0 auto', maxWidth: '800px' }}>
              在星軌堂，我們不談玄學靈感，只談穩定、精密的命運演算法。
            </p>
          </div>
        </section>

        {/* Section 2: 品牌起源 - 星軌理數 */}
        <section className={landing.sectionAlt}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>為何命名為「星軌理數」？</h2>
            </div>
            <div className={landing.compareContainer} style={{ gridTemplateColumns: '1fr' }}>
              <div className={`${landing.compareBox} ${landing.newWay}`}>
                <p style={{ marginBottom: '20px' }}>
                  在香港，紫微斗數常被與傳統三合派混為一談。但我們所運用的技術，從底層邏輯到斷法，與坊間概念完全不同。我們借用了紫微斗數的盤，卻運行著另一套更高級、更精密的技術體系。
                </p>
                <p>
                  <strong className={landing.serif} style={{ color: '#daa520' }}>星軌：</strong> 捕捉能量在星曜之間流動的精確軌跡。<br/><br/>
                  <strong className={landing.serif} style={{ color: '#daa520' }}>理數：</strong> 每一句推論，都源於嚴密的邏輯運算與理據。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: 門派傳承 - 梁氏飛星 */}
        <section className={landing.section}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>源於「發現」，忠於「傳承」</h2>
            </div>
            <div className={landing.servicesGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={landing.serviceCard}>
                <div className={landing.serviceIcon}>
                  <TrackChangesIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>梁氏飛星紫微斗數</h3>
                <p>由台灣 <strong>梁若瑜大師</strong> 歸納發現。這是一套穩定的術數系統，沒有「老師說」，只有「學理證明」。</p>
                <div style={{ marginTop: '24px', padding: '16px 20px', background: 'rgba(218, 165, 32, 0.1)', borderLeft: '4px solid #daa520', borderRadius: '0 8px 8px 0' }}>
                  <p style={{ margin: 0, color: '#fcf6ba', fontWeight: 600 }}>Jeff 作為梁氏飛星第三代傳人（師承台灣張世賢大師），是目前香港極少數擁有純正北派飛星傳承的導航師。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: 核心優勢 - 極致精準 */}
        <section className={landing.sectionAlt}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>哪怕是一顆門牙，也要極致精緻</h2>
            </div>
            <div className={landing.compareContainer} style={{ gridTemplateColumns: '1fr' }}>
              <div className={`${landing.compareBox} ${landing.oldWay}`} style={{ borderRight: 'none' }}>
                <p>
                  我們的要求是 <span className={`${landing.goldText} ${landing.nowrap}`}>九成準確</span> 率。如果命盤連你生活中的細節（如門牙受損）都無法對應，我們會重新核對，絕不含糊。這就是「理數」的威力，不容許模糊的猜測。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: 應用場景 - 落地實戰 */}
        <section className={landing.section}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>像看電影一樣，預見你的事業路徑</h2>
            </div>
            <div className={landing.servicesGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={landing.serviceCard}>
                <div className={landing.serviceIcon}>
                  <AutoGraphIcon fontSize="large" />
                </div>
                <h3 className={landing.serif}>具體、貼地、可執行</h3>
                <p>
                  我們不只給結果，更給具體的建議。不需要靈感天賦，只要掌握邏輯，你也能學會如何從今天開始改變人生。曾經有客戶透過我們的導航，達成了 <span className={`${landing.goldText} ${landing.nowrap}`}>27倍</span> 的收入增長。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: 學習挑戰 */}
        <section className={landing.sectionAlt}>
          <div className={landing.container}>
            <div className={landing.sectionHeader}>
              <h2 className={landing.serif}>為什麼它被稱為「最難學」的派別？</h2>
            </div>
            <div className={landing.compareContainer} style={{ gridTemplateColumns: '1fr' }}>
              <div className={`${landing.compareBox} ${landing.newWay}`}>
                <p>
                  因為梁氏飛星涉及複雜的「化祿轉忌、化忌轉忌、吉凶串連」，如同進行一場多維數學運算。但也正因如此，我們論得更細、更準。一旦掌握，這將是你一生受用的決策演算法。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Final CTA */}
        <section className={`${landing.section} ${landing.finalCta}`}>
          <div className={landing.container}>
            <h2 className={landing.serif} style={{ fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: '40px' }}>
              準備好解鎖你的<span className={`${landing.goldText} ${landing.nowrap}`}>人生演算法</span>了嗎？
            </h2>
            <div className={landing.contactCards}>
              <a href="https://wa.me/85294780643?text=你好，我想預約深度試算" target="_blank" rel="noreferrer">
                <span className={landing.contactIcon}><WhatsAppIcon /></span> WhatsApp 預約深度試算
              </a>
              <a href="https://wa.me/85294780643?text=你好，我想查詢星軌理數課程" target="_blank" rel="noreferrer" className={landing.addressLink}>
                <span className={landing.contactIcon}><MenuBookIcon /></span> 獲取課程大綱
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
