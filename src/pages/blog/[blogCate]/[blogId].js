import Head from "next/head";
import Link from "next/link";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Header } from "@/components/header";
import landing from "@/styles/HomeLanding.module.scss";
import blogStyles from "@/styles/BlogPages.module.scss";
import {
  getAllPostParams,
  getCategories,
  getCategoryBySlug,
  getPostBySlug,
} from "@/lib/blog";

const SITE_URL = "https://yl-flystar.pro";
const sanitizeHtml = (html = "") =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");

export default function BlogArticlePage({ categories, category, post }) {
  const articleUrl = `${SITE_URL}/blog/${encodeURIComponent(post.categorySlug)}/${encodeURIComponent(
    post.slug
  )}`;

  return (
    <div className={`${landing.page} ${blogStyles.page}`}>
      <Head>
        <title>{`${post.title}｜星軌堂 Blog`}</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={`${post.title}｜星軌堂 Blog`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <link rel="canonical" href={articleUrl} />
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
            <h1 className={landing.serif}>{post.title}</h1>
          </header>

          <div className={blogStyles.grid}>
            <aside className={blogStyles.sidebar}>
              <div className={blogStyles.sidebarTitle}>分類導覽</div>
              <div className={blogStyles.categoryList}>
                {categories.map((item) => (
                  <div key={item.slug}>
                    <Link
                      href={`/blog/${encodeURIComponent(item.slug)}`}
                      className={`${blogStyles.categoryLink} ${
                        item.slug === category.slug ? blogStyles.active : ""
                      }`}
                    >
                      {item.title}
                    </Link>
                    {item.slug === category.slug ? (
                      <div className={blogStyles.nested}>
                        {item.posts.map((nestedPost) => (
                          <Link
                            key={nestedPost.id}
                            href={`/blog/${encodeURIComponent(
                              nestedPost.categorySlug
                            )}/${encodeURIComponent(nestedPost.slug)}`}
                            className={`${blogStyles.postLink} ${
                              nestedPost.slug === post.slug ? blogStyles.active : ""
                            }`}
                          >
                            {nestedPost.title}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </aside>

            <article className={blogStyles.panel}>
              <nav className={blogStyles.breadcrumbs} aria-label="breadcrumb">
                <Link href="/blog">網誌</Link>
                <span>/</span>
                <Link href={`/blog/${encodeURIComponent(category.slug)}`}>{category.title}</Link>
              </nav>

              <h2 className={blogStyles.articleTitle}>{post.title}</h2>
              <p className={blogStyles.articleMeta}>{category.title}</p>
              <p className={blogStyles.readingMeta}>
                全篇字數：{post.wordCount.toLocaleString()} 字 · 預估閱讀時間：約 {post.readingMinutes} 分鐘
              </p>
              <div className={blogStyles.articleBody}>
                {post.contentHtmls.map((contentHtml, index) => (
                  <div key={`${post.id}-${index}`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }} />
                ))}
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const paths = getAllPostParams().map((params) => ({ params }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const categories = getCategories();
  const category = getCategoryBySlug(params.blogCate);
  const post = getPostBySlug(params.blogCate, params.blogId);

  if (!category || !post) {
    return { notFound: true };
  }

  const plainText = post.contentHtmls
    .join(" ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainText.replace(/\s/g, "").length;
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 450));

  return {
    props: {
      categories,
      category,
      post: {
        ...post,
        wordCount,
        readingMinutes,
      },
    },
  };
}
