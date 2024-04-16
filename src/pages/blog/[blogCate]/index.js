import Head from "next/head";

import { useRouter } from "next/router";
import { useEffect } from "react";

import { Header } from "@/components/header";
import { Divider } from "@mui/material";

import aboutStyle from "@/styles/About.module.scss";
import blogStyle from "@/styles/Blog.module.scss";

import { myBlogs } from "@/constants/blogs";

const BlogCate = () => {
  const router = useRouter();
  const { blogCate } = router.query;

  return (
    <>
      <Head>
        <title>曜靈星軌理數 - 您的智能人生定位系統</title>
        <meta name="description" content="您的智能人生定位系統" />
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
