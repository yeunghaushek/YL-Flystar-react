import Head from "next/head";
import Link from "next/link";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Header } from "@/components/header";
import landing from "@/styles/HomeLanding.module.scss";
import blogStyles from "@/styles/BlogPages.module.scss";
import { getCategories, getCategoryBySlug, getCategorySlugs } from "@/lib/blog";

const SITE_URL = "https://yl-flystar.pro";

export default function BlogCategoryPage({ categories, category }) {
  return (
    <div className={`${landing.page} ${blogStyles.page}`}>
      <Head>
        <title>{`${category.title}｜星軌堂 Blog`}</title>
        <meta
          name="description"
          content={`${category.title}，共 ${category.posts.length} 篇文章，完整掌握飛星紫微斗數知識脈絡。`}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/blog/${encodeURIComponent(category.slug)}`} />
        <meta property="og:title" content={`${category.title}｜星軌堂 Blog`} />
        <meta
          property="og:description"
          content={`${category.title}，共 ${category.posts.length} 篇文章，完整掌握飛星紫微斗數知識脈絡。`}
        />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <link rel="canonical" href={`${SITE_URL}/blog/${encodeURIComponent(category.slug)}`} />
      </Head>

      <div className={landing.headerWrapper}>
        <Header show />
      </div>

      <main className={blogStyles.main}>
        <div className={blogStyles.container}>
          <header className={blogStyles.header}>
            <span className={blogStyles.kicker}>
              <MenuBookIcon fontSize="small" /> Blog Category
            </span>
            <h1 className={landing.serif}>{category.title}</h1>
          </header>

          <div className={blogStyles.grid}>
            <aside className={blogStyles.sidebar}>
              <div className={blogStyles.sidebarTitle}>分類導覽</div>
              <div className={blogStyles.categoryList}>
                {categories.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${encodeURIComponent(item.slug)}`}
                    className={`${blogStyles.categoryLink} ${
                      item.slug === category.slug ? blogStyles.active : ""
                    }`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </aside>

            <section className={blogStyles.panel}>
              <div className={blogStyles.posts}>
                {category.posts.map((post) => (
                  <Link
                    key={post.id}
                    className={blogStyles.cardLink}
                    href={`/blog/${encodeURIComponent(post.categorySlug)}/${encodeURIComponent(
                      post.slug
                    )}`}
                  >
                    <article className={blogStyles.card}>
                      <h3>{post.title}</h3>
                      <p>{post.excerpt}</p>
                      <span className={blogStyles.readMore}>閱讀全文 →</span>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = getCategorySlugs().map((blogCate) => ({
    params: { blogCate },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const categories = getCategories();
  const category = getCategoryBySlug(params.blogCate);
  if (!category) return { notFound: true };
  return {
    props: {
      categories,
      category,
    },
  };
}
