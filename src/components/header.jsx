import Link from "next/link";
import { useState, useEffect, useRef } from "react";

export const Header = ({
  show = true,
  alwaysShow = false,
  /** When idle-hidden: keep a floating logo (chart page only). */
  collapsedLogo = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(show || alwaysShow);
  const lastScrollY = useRef(0);
  const idleTimer = useRef(null);

  useEffect(() => {
    if (alwaysShow) {
      setIsVisible(true);
      return undefined;
    }

    const handleScroll = (e) => {
      // Capture scroll from any container (body, html, or window)
      const target = e.target === document ? document.documentElement : e.target;
      const currentScrollY = target.scrollTop || window.scrollY || 0;
      
      // Show if scrolling up, hide if scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
      resetIdleTimer();
    };

    const handleMouseMove = (e) => {
      if (e.clientY < 80) {
        setIsVisible(true);
      }
      resetIdleTimer();
    };

    const resetIdleTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        setIsVisible(false);
        setMenuOpen(false);
      }, 5000);
    };

    // Use capture: true to catch scroll events from any scrollable container
    window.addEventListener("scroll", handleScroll, { passive: true, capture: true });
    window.addEventListener("mousemove", handleMouseMove);
    resetIdleTimer();

    return () => {
      window.removeEventListener("scroll", handleScroll, { capture: true });
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [alwaysShow]);

  const navItems = [
    { href: "/chart", label: "紫微斗數排盤" },
    { href: "/meihua", label: "梅花易數排盤" },
    { href: "/courses", label: "課程資訊" },
    { href: "/theory", label: "星軌理數" },
    { href: "/blog", label: "網誌" },
  ];

  const closeMenu = () => setMenuOpen(false);

  const visibilityClass =
    menuOpen || isVisible ? "show" : collapsedLogo ? "collapsed" : "";

  return (
    <>
      <div className={`header ${visibilityClass}`.trim()}>
        <div className="left info-header">
          <Link href="/" onClick={closeMenu}>
            <div className="logo">
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
