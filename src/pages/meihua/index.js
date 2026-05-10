import Head from "next/head";

import { Header } from "@/components/header";
import { MeiHuaBoard } from "@/meihua/components/MeiHuaBoard";
import landing from "@/styles/HomeLanding.module.scss";

export default function MeiHuaPage() {
  return (
    <>
      <Head>
        <title>星軌堂 · 梅花易數排盤</title>
      </Head>
      
      <Header />

      {/* Original Beige Background for Meihua */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: "radial-gradient(circle at center, #f3e9d2 0%, #e8dcc4 100%)",
        zIndex: -1
      }} />

      {/* Animated Background Elements (Dark Gold/Ink Watermark for Meihua) */}
      <div className={landing.bgDecoration} style={{ opacity: 0.12 }}>
        <div className={landing.baguaContainer}>
          {/* CSS Yin-Yang */}
          <div className={landing.yinYang} style={{ opacity: 0.4 }}></div>
          
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
              
              {/* Trigram Definitions */}
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

      <main
        style={{
          minHeight: "100svh",
          paddingTop: "30px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <MeiHuaBoard />
      </main>
    </>
  );
}
