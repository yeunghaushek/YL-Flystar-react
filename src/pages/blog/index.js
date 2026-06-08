import Head from "next/head";
import Link from "next/link";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Header } from "@/components/header";
import landing from "@/styles/HomeLanding.module.scss";
import blogStyles from "@/styles/BlogPages.module.scss";
import { getCategories } from "@/lib/blog";

const SITE_URL = "https://yl-flystar.pro";

export default function BlogIndex({ categories }) {
  return (
    <div className={`${landing.page} ${blogStyles.page}`}>
      <Head>
        <title>星軌堂 Blog｜飛星紫微斗數文章專區</title>
        <meta
          name="description"
          content="星軌堂飛星紫微斗數知識庫，包含十二宮位架構、命盤小知識與命理雜談。"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:title" content="星軌堂 Blog｜飛星紫微斗數文章專區" />
        <meta
          property="og:description"
          content="飛星紫微斗數知識庫，快速掌握命盤邏輯、宮位象義與實戰觀點。"
        />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
      </Head>

      <div className={landing.headerWrapper}>
        <Header show />
      </div>

      <main className={blogStyles.main}>
        <div className={blogStyles.container}>
          <header className={blogStyles.header}>
            <span className={blogStyles.kicker}>
              <MenuBookIcon fontSize="small" /> 星軌堂 Blog
            </span>
            <h1 className={landing.serif}>
              <span className={landing.goldText}>飛星紫微斗數</span>文章專區
            </h1>
            <p>系統化整理命盤觀念、宮位象義與實戰案例。</p>
          </header>

          <section className={blogStyles.panel}>
            <div className={`${blogStyles.posts} ${blogStyles.categoryGrid}`}>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  className={blogStyles.cardLink}
                  href={`/blog/${encodeURIComponent(category.slug)}`}
                >
                  <article className={blogStyles.card}>
                    <div className={blogStyles.meta}>{category.name}</div>
                    <h3>{category.title}</h3>
                    <p>共 {category.posts.length} 篇文章</p>
                    <span className={blogStyles.readMore}>進入分類 →</span>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const categories = getCategories();
  return {
    props: {
      categories,
    },
  };
}
