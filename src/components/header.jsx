import Link from "next/link";
import { useState } from "react";

export const Header = ({ show = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { href: "/chart", label: "紫微斗數排盤" },
    { href: "/meihua", label: "梅花易數排盤" },
    { href: "/info#begin", label: "遇見命理師" },
    { href: "/blog", label: "網誌" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className={`header ${show ? "show" : ""}`}>
        <div className="left info-header">
          <Link href="/" onClick={closeMenu}>
            <div className="logo">
              <img src={"/logo.png"} alt="logo" />
              <div className="name">星軌堂</div>
            </div>
          </Link>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button>{item.label}</button>
            </Link>
          ))}
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
        </div>
        <button
          type="button"
          className={`mobile-menu-toggle${menuOpen ? " open" : ""}`}
          aria-label={menuOpen ? "關閉選單" : "開啟選單"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`mobile-menu-panel${menuOpen ? " open" : ""}`}>
          {navItems.map((item) => (
            <Link key={`mobile-${item.href}`} href={item.href} onClick={closeMenu}>
              <button>{item.label}</button>
            </Link>
          ))}
        </div>
        {menuOpen ? (
          <button
            type="button"
            className="mobile-menu-backdrop"
            aria-label="關閉選單遮罩"
            onClick={closeMenu}
          />
        ) : null}
        {/* <div className="right">
          <a target="_blank" href="https://buy.stripe.com/cN2cPsa6XaLMauQ001">
            支持我們
          </a>
        </div> */}
      </div>
    </>
  );
};
