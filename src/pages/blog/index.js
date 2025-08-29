import Head from "next/head";

import { Header } from "@/components/header";

import blogStyle from "@/styles/Blog.module.scss";
import aboutStyle from "@/styles/About.module.scss";

import { myBlogs } from "@/constants/blogs";

const BlogCate = () => {
  return (
    <>
      <Head>
        <title>星軌堂 - 您的智能人生定位系統</title>
        <meta
          name="description"
          content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
          opengraph={{
            title: "星軌堂 - 您的智能人生定位系統",
            description: "發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。",
            images: [
              { url: "/og.png" },
            ],
          }}
        />
        <meta name="robots" content="noindex" />
      </Head>
      <Header />
      <div className={aboutStyle.bg}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className={`${blogStyle.blogContent}`}>
          {myBlogs.map((cate, cIndex) => (
            <div key={`cate${cIndex}`}>
              <a href={`/blog/${cate.blogCate}/${cate.blogs[0].blogId}`}>{`${cate.cateTitle}`}</a>
              {cate.blogs.map((blog, bIndex) => (
                <div key={`blog${bIndex}`}>
                  <a href={`/blog/${cate.blogCate}/${blog.blogId}`}>{`${blog.blogTitle}`}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogCate;
