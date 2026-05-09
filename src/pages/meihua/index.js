import Head from "next/head";

import { Header } from "@/components/header";
import { MeiHuaBoard } from "@/meihua/components/MeiHuaBoard";

export default function MeiHuaPage() {
  return (
    <>
      <Head>
        <title>星軌堂 · 梅花易數排盤</title>
      </Head>
      <Header />
      <main
        style={{
          minHeight: "100svh",
          /* 再縮短約 1/3（45 → 30） */
          paddingTop: "30px",
          background:
            "radial-gradient(circle at center, rgba(243,233,210,0.95) 0%, rgba(232,220,196,0.95) 100%)",
        }}
      >
        <MeiHuaBoard />
      </main>
    </>
  );
}
