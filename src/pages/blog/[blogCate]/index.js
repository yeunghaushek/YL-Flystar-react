import Head from "next/head";

import { useRouter } from "next/router";
import { useEffect } from "react";

import { Header } from "@/components/header";

import aboutStyle from "@/styles/About.module.scss";
import blogStyle from "@/styles/Blog.module.scss";

import { myBlogs } from "@/constants/blogs";

const BlogCate = () => {
  const router = useRouter();
  const { blogCate } = router.query;

  useEffect(() => {
    if (blogCate) {
      const myBlogCate = myBlogs.find((cate) => cate.blogCate == blogCate);
      if (!myBlogCate) {
        router.push("/error");
      }
    }
  }, [blogCate]);

  return (
    <>
      <Head>
        <title>曜靈星軌理數 - 您的智能人生定位系統</title>
        <meta
          name="description"
          content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
        />
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
              {cate.blogCate === blogCate
                ? cate.blogs.map((blog, bIndex) => (
                    <div key={`blog${bIndex}`}>
                      <a href={`/blog/${cate.blogCate}/${blog.blogId}`}>{`${blog.blogTitle}`}</a>
                    </div>
                  ))
                : null}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BlogCate;
