import Head from "next/head";

import { Header } from "@/components/header";

import blogStyle from "@/styles/Blog.module.scss";
import aboutStyle from "@/styles/About.module.scss";

import { myBlogs } from "@/constants/blogs";

const BlogCate = () => {
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
              <a href={`/blog/${cate.blogCate}/${cate.blogs[0].blogId}`}>{`${cate.blogCate}. ${cate.cateTitle}`}</a>
              {cate.blogs.map((blog, bIndex) => (
                <div key={`blog${bIndex}`}>
                  <a href={`/blog/${cate.blogCate}/${blog.blogId}`}>{`${blog.blogId}. ${blog.blogTitle}`}</a>
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
