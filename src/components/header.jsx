import Link from "next/link";

export const Header = () => {
  return (
    <>
      <div className={`header show`}>
        <div className="left info-header">
          <Link href="/">
            <div className="logo">
              <img src={"/logo.png"} alt="logo" />
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
        {/* <div className="right">
          <a target="_blank" href="https://buy.stripe.com/cN2cPsa6XaLMauQ001">
            支持我們
          </a>
        </div> */}
      </div>
    </>
  );
};
