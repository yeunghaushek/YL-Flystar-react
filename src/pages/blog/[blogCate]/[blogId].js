import Head from "next/head";

import { useRouter } from "next/router";
import { useEffect } from "react";

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
              <a href={`/blog`} target="_blank">
                網誌
              </a>
            </span>
            <span>{`>>`}</span>

            <span>
              {" "}
              <a href={`/blog/${myBlogCate.blogCate}/1`} target="_blank">
                {myBlogCate.cateTitle}
              </a>
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

  return (
    <>
      <Head>
        <title>曜靈星軌理數 - 您的智能人生定位系統</title>
        <meta name="description" content="您的智能人生定位系統" />
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
                <a href={`/blog/${cate.blogCate}/${cate.blogs[0].blogId}`}>{`${cate.blogCate}. ${cate.cateTitle}`}</a>
                {cate.blogCate === blogCate
                  ? cate.blogs.map((blog, bIndex) => (
                      <div key={`blog${bIndex}`}>
                        <a href={`/blog/${cate.blogCate}/${blog.blogId}`}>{`${blog.blogId}. ${blog.blogTitle}`}</a>
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
