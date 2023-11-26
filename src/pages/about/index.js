import Head from "next/head";
import Link from "next/link";

import aboutStyle from "@/styles/About.module.scss";

import {
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  SpeedDial,
  SpeedDialAction,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import CallIcon from "@mui/icons-material/Call";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { useEffect, useState } from "react";


const actions = [
  {
    icon: (
      <a target="_blank" href="https://www.instagram.com/yaoling_flystar/">
        <InstagramIcon />
      </a>
    ),
    name: "Instagram",
  },
  { icon: <WhatsAppIcon />, name: "WhatsApp" },
  { icon: <FacebookIcon />, name: "Facebook" },
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
        <title>曜靈飛星排盤</title>
      </Head>
      <div className={`header ${scrollTop && scrollTop >= bannerOffset - 120 ? `show` : ``}`}>
        <div className="left">
          <div className="logo">
            <img src={"logo.png"} alt="logo" />
            <div className="name">曜靈飛星排盤</div>
          </div>
          <Link href="/">
          <button>排盤</button>
          </Link>
          
          <button>遇見命理師</button>
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
            <div className={aboutStyle.title}>
            曜靈飛星排盤
            </div>
            <div className={aboutStyle.caption}>
              Ling is Big
            </div>
            <div className={aboutStyle.link}>
              <Link href="/">
                立即排盤
              </Link>
              <a href="#begin">
                瞭解更多
              </a>
            </div>
          </div>
        </div>
        <div className="container"  id="begin">
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className={aboutStyle.pageTitle}>遇見命理師</div>
          <div className={aboutStyle.pageText}>
            從邏輯嚴謹的軟體工程師到對玄學充滿信仰的命理師，我的職業轉變蘊含了不凡的故事和深刻的理解。原本，我是一個堅信邏輯和科學的IT專家，對任何形式的玄學都抱持懷疑態度。然而，一連串神奇的緣分引導我逐漸走入了這個神秘而古老的領域。
            我的轉變始於一次偶然的相遇 ——
            在網路上遇到了我的命理導師，張世賢老師。他不僅是一位精通飛星紫微鬥數的大師，也是我人生軌跡上的重要指引者。令我深受震撼的是，張老師不僅準確地預言了我內心深處的事業夢想，甚至連我將要面臨的挑戰和危機都提前揭示給我。
            這次經歷徹底改變了我的看法。我開始認真學習飛星紫微鬥數，深入探索命理學的奧秘。我的目標很明確：將這門古老智慧的美好和力量傳遞給更多的人。我希望透過我的專業知識和經驗，幫助他們提升自我，避開生活中的險阻，將危機轉化為跳板，走向更輝煌的人生旅程。
          </div>
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>命理分析服務</div>
          <div className={aboutStyle.pageText}>
            在我們提供的全面命理分析服務中，我們將為您詮釋生命的藍圖——命盤。命盤不僅蘊含了您生命中無限的可能性，它更是一張詳盡的地圖，指示著生命旅途中的每一個分叉路口以及選擇每條道路可能帶來的結果。它預示著旅途中可能遭遇的挑戰、突如其來的意外，以及不經意間的機遇。
          </div>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>全面命理分析</div>
                價格：$1,500
                <br />
                時長：2 - 3小時
                <br />
                <br />
                深入核對命盤並進行全面分析。包括但不限於事業、婚姻、家庭、子女、財運、學業、移民等人生各主題。
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>特定事件分析</div>
                價格：$800
                <br />
                條件：先完成一次全面分析
                <br />
                <br />
                針對最近遇到的特定事件、計劃或人際關係進行深入分析，判斷這些因素對命主的積極或消極影響。
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>流年及大運分析</div>
                價格：$800
                <br />
                條件：先完成一次全面分析
                <br />
                <br />
                專注於流年和大運的詳細分析，提供針對性的洞見和建議。
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>命盤核對</div>
                價格：$500
                <br />
                <br />
                <br />
                專業核對命盤，確保準確無誤。
              </div>
            </Grid>
          </Grid>
          <br />
          <br />
          <div className={aboutStyle.pageText}>
            通過對命盤的深入解讀，我們可以協助您洞悉人生的每一步，當面臨關鍵決策時，提供明智的選擇方向。我們的分析覆蓋人生的各個主題：從職業發展到人際關係，從創業機遇到潛在風險，從感情婚姻的和諧相處到潛在的分歧點，我們的目標是讓您能夠預見並規避可能的障礙，擁抱生命中的每一份貴人相助。
            <br />
            <br />
            我們的服務不僅是預言未來，更是一場深刻的自我發現之旅。它能揭露您與身邊人的深層聯繫，識別那些在您的事業或生活中起到關鍵作用的人。通過分析您事業的每一階段，我們可以協助您規劃最佳的職業路徑，並指出那些可能導致失敗的陷阱。在感情和婚姻的領域，我們的分析可以幫助雙方建立更加和諧、舒適的相處模式，並提醒您注意可能的「地雷區」。
            <br />
            <br />
            這項服務是為了讓您能夠掌握自己的命運，無論是職業選擇、家庭和諧，還是個人成長，我們都會為您提供量身訂製的洞見和策略。讓我們攜手揭開命盤中編織的人生故事，找到最符合您個人命運的人生道路。
          </div>
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>教學課程</div>
          <div className={aboutStyle.pageText}>
            在我們提供的全面命理分析服務中，我們將為您詮釋生命的藍圖——命盤。命盤不僅蘊含了您生命中無限的可能性，它更是一張詳盡的地圖，指示著生命旅途中的每一個分叉路口以及選擇每條道路可能帶來的結果。它預示著旅途中可能遭遇的挑戰、突如其來的意外，以及不經意間的機遇。
          </div>
          <br />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>飛星紫微鬥數基礎</div>
                價格：$3,800
                <br />
                時長：約十節課
                <br />
                <br />
                涵蓋排盤、宮位解釋、四化解釋、星曜解釋及梁氏飛星核心技術等基礎知識。
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>進階課程</div>
                價格：$6,800
                <br />
                時長：約十五節課
                <br />
                <br />
                深入探討人生十三大主題，如家庭、性格、事業、感情等，為學員打下堅實的命理基礎。
              </div>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <div className={aboutStyle.price}>
                <div className={aboutStyle.title}>深造課程</div>
                價格：$12,800
                <br />
                時長：約二十節課
                <br />
                <br />
                在基礎和進階課程之後，此課程將深入細節，學習分析命盤如同觀看電影一般，洞察人生事件的細微差別。
              </div>
            </Grid>
          </Grid>
          <br />
          <br />
          <div className={aboutStyle.pageText}>
            通過對命盤的深入解讀，我們可以協助您洞悉人生的每一步，當面臨關鍵決策時，提供明智的選擇方向。我們的分析覆蓋人生的各個主題：從職業發展到人際關係，從創業機遇到潛在風險，從感情婚姻的和諧相處到潛在的分歧點，我們的目標是讓您能夠預見並規避可能的障礙，擁抱生命中的每一份貴人相助。
            <br />
            <br />
            我們的服務不僅是預言未來，更是一場深刻的自我發現之旅。它能揭露您與身邊人的深層聯繫，識別那些在您的事業或生活中起到關鍵作用的人。通過分析您事業的每一階段，我們可以協助您規劃最佳的職業路徑，並指出那些可能導致失敗的陷阱。在感情和婚姻的領域，我們的分析可以幫助雙方建立更加和諧、舒適的相處模式，並提醒您注意可能的「地雷區」。
            <br />
            <br />
            這項服務是為了讓您能夠掌握自己的命運，無論是職業選擇、家庭和諧，還是個人成長，我們都會為您提供量身訂製的洞見和策略。讓我們攜手揭開命盤中編織的人生故事，找到最符合您個人命運的人生道路。
          </div>
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>甚麼是紫微斗數？</div>
          <div className={aboutStyle.pageText}>
            紫微斗數，這門源遠流長的占星術，融合了天文位置與人生命運的神秘學說。作為一種精確的預測工具，它的歷史悠久，而我們這一派，梁氏飛星紫微斗數，傳承至今僅為第三代，卻以其獨特的解讀方式和精緻的理論基礎，在命理學界佔有一席之地。
            <br />
            <br />
            根據紫微斗數的經典理論，四化星被視為命盤中最為關鍵的用神。我們梁氏飛星紫微斗數派，堅持以四化星為分析核心，認為它們是影響人生成敗的關鍵。搭配本派的核心技術，我們能夠將任何事件詳細分析，彷彿身臨其境。
            <br />
            <br />
            在這門學問的傳承中，第一代創始人梁若瑜老師，從仙神處獲得了這套學說的啟示。他不僅將其終身研究，更放棄了仙神賜予的直接信息，僅以斗數學術本身的力量來進行占卜，以期使這門學問得到真正的進步。而第二代傳人張世賢老師，則將梁氏飛星紫微斗數發揚光大，使其成為一門可供後人繼承與發展的精湛藝術。
            <br />
            <br />
            我們派系的紫微斗數注重邏輯和系統性，它的分析過程猶如數學公式，通過宮位、四化、星曜的組合來論述事情。與其他流派使用的格局分析或象徵主義不同，我們的方法更具推理性和進化性。正如數學一般，只要遵循理論基礎，我們的學術就能不斷演進，甚至有可能超越前人的成就。
            <br />
            <br />
            透過紫微斗數，我們不僅能預測未來，還能深入理解個人的性格、人生趨勢及其面對的挑戰與機遇。這不僅是一項占卜技術，更是一種智慧的傳承，它教導我們如何在瞬息萬變的世界中，找到最符合自己命運的道路。
          </div>
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
        </div>
        <Carousel centerMode centerSlidePercentage={75} showArrows showStatus={false} autoPlay interval={6000} infiniteLoop>
          <div className={aboutStyle.carousel}>
            <img src="https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
          </div>
          <div className={aboutStyle.carousel}>
            <img src="https://images.pexels.com/photos/104827/cat-pet-animal-domestic-104827.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
          </div>
          <div className={aboutStyle.carousel}>
            <img src="https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
          </div>
          <div className={aboutStyle.carousel}>
            <img src="https://images.pexels.com/photos/2558605/pexels-photo-2558605.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
          </div>
        </Carousel>
        <div className="container">
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>常見問題</div>
          <div className={aboutStyle.pageText}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                甚麼是紫微斗數？
              </AccordionSummary>
              <AccordionDetails>
                紫微斗數，這門源遠流長的占星術，融合了天文位置與人生命運的神秘學說。作為一種精確的預測工具，它的歷史悠久，而我們這一派，梁氏飛星紫微斗數，傳承至今僅為第三代，卻以其獨特的解讀方式和精緻的理論基礎，在命理學界佔有一席之地。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                甚麼是紫微斗數？
              </AccordionSummary>
              <AccordionDetails>
                根據紫微斗數的經典理論，四化星被視為命盤中最為關鍵的用神。我們梁氏飛星紫微斗數派，堅持以四化星為分析核心，認為它們是影響人生成敗的關鍵。搭配本派的核心技術，我們能夠將任何事件詳細分析，彷彿身臨其境。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                甚麼是紫微斗數？
              </AccordionSummary>
              <AccordionDetails>
                我們派系的紫微斗數注重邏輯和系統性，它的分析過程猶如數學公式，通過宮位、四化、星曜的組合來論述事情。與其他流派使用的格局分析或象徵主義不同，我們的方法更具推理性和進化性。正如數學一般，只要遵循理論基礎，我們的學術就能不斷演進，甚至有可能超越前人的成就。
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                甚麼是紫微斗數？
              </AccordionSummary>
              <AccordionDetails>
                透過紫微斗數，我們不僅能預測未來，還能深入理解個人的性格、人生趨勢及其面對的挑戰與機遇。這不僅是一項占卜技術，更是一種智慧的傳承，它教導我們如何在瞬息萬變的世界中，找到最符合自己命運的道路。
              </AccordionDetails>
            </Accordion>
          </div>
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageTitle}>聯絡我們</div>
          <div className={aboutStyle.contact}>
            <a target="_blank" href="https://www.instagram.com/yaoling_flystar/">
              <img src="/ig.jpg" alt="instagram" />
            </a>
          </div>
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <br />
          <br />
          <br />
          <br />
          <SpeedDial
            ariaLabel="SpeedDial basic example"
            sx={{ position: "fixed", bottom: 64, right: 64 }}
            FabProps={{ sx: { backgroundColor: "#009", "&:hover": { backgroundColor: "#009" } } }}
            icon={<CallIcon />}
          >
            {actions.map((action) => (
              <SpeedDialAction key={action.name} icon={action.icon} tooltipTitle={action.name} sx={{ lineHeight: "unset" }} />
            ))}
          </SpeedDial>
        </div>
      </div>
      <div className="footer">{`${new Date().getFullYear()} © 曜靈飛星排盤 版權所有`}</div>
    </>
  );
}
