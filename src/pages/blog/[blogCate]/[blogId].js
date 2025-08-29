import Head from "next/head";

import { notFound } from "next/navigation";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

import { Header } from "@/components/header";
import { Divider } from "@mui/material";

import aboutStyle from "@/styles/About.module.scss";
import blogStyle from "@/styles/Blog.module.scss";

import { myBlogs } from "@/constants/blogs";

const BlogContent = ({ blogCate, blogId }) => {
  try {
    const myBlogCate = myBlogs.find((cate) => cate.blogCate == blogCate);
    if (!myBlogCate) throw new Error("<blogCate> not found");
    const blog = myBlogCate.blogs.find((blog) => blog.blogId == blogId);
    if (!blog) throw new Error("<blogId> not found");

    return (
      <>
        <div className={`${blogStyle.container}`}>
          <br />
          <br />
          <br />
          <br />

          <div>
            <span>
              <a href={`/blog`}>網誌</a>
            </span>
            <span>{`>>`}</span>

            <span>
              {" "}
              <a href={`/blog/${myBlogCate.blogCate}/${myBlogCate.blogs[0].blogId}`}>{myBlogCate.cateTitle}</a>
            </span>

            <span> {`>>`}</span>

            <span>{blog.blogTitle}</span>
          </div>
          <br />
          <div className={aboutStyle.pageTitle}>{blog.blogTitle}</div>
          <div className={aboutStyle.pageText}>
            {blog.contentHtmls && blog.contentHtmls.length > 0
              ? blog.contentHtmls.map((contentHtml, cIndex) => (
                  <div key={`${blog.blogTitle}content${cIndex}`}>
                    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                    <br />
                  </div>
                ))
              : null}
          </div>
          <br />
          <br />
          <Divider light variant="middle" sx={{ margin: "20px 0" }} />
          <br />
          <div className={aboutStyle.pageText}>
            如果想瞭解更多？ <a href={"/#contact"}>聯絡我們</a>
          </div>
        </div>
      </>
    );
  } catch (e) {
    console.log(e);
    return null;
  }
};

const BlogCate = () => {
  const router = useRouter();
  const { blogCate, blogId } = router.query;
  const [myBlog, setMyBlog] = useState(null);

  useEffect(() => {
    if (blogCate && blogId) {
      const myBlogCate = myBlogs.find((cate) => cate.blogCate == blogCate);
      if (!myBlogCate) {
        router.push("/error");
      } else {
        const blog = myBlogCate.blogs.find((blog) => blog.blogId == blogId);
        if (!blog) {
          router.push("/error");
        } else {
          setMyBlog(blog);
        }
      }
    }
  }, [blogCate, blogId]);

  return (
    <>
      <Head>
        <title>星軌堂 - 您的智能人生定位系統</title>
        <meta
          name="description"
          content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。"
        />
                        <meta property="og:type" content="website" />
                <meta property="og:url" content={`https://yl-flystar.pro/`} />
                <meta property="og:title" content="星軌堂 - 您的智能人生定位系統" />
                <meta property="og:description" content="發掘您的人生地圖！我們提供專業命理分析，助您預見未來趨勢與機遇，規劃事業與人生策略。立即探索，打造成功的人生藍圖。" />
                <meta property="og:image" content={`https://yl-flystar.pro/og.png`} />
                <meta property="og:site_name" content="星軌堂" />
        <link rel="canonical" href={`https://yl-flystar.pro/blog/${blogCate}/${blogId}`} />
      </Head>
      <Header />
      <div className={aboutStyle.bg}>
        <div className={`${blogStyle.split} ${blogStyle.left}`}>
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className={`${blogStyle.content}`}>
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
        <div className={`${blogStyle.split} ${blogStyle.right}`}>
          <BlogContent blogCate={blogCate} blogId={blogId} />
          <br />
          <br />
          <br />
          <br />
        </div>{" "}
      </div>
    </>
  );
};

export default BlogCate;
