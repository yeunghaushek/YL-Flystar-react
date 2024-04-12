import Head from "next/head";
import Link from "next/link";

import aboutStyle from "@/styles/About.module.scss";
import blogStyle from "@/styles/Blog.module.scss";
import { Divider } from "@mui/material";

import { blogs } from "@/constants/blogs";

const BlogContent = ({ blog }) => {
  return (
    <>
      <div className={`${blogStyle.container}`} id={`blog${blog.id}`}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className={aboutStyle.pageTitle}>{blog.title}</div>
        <div className={aboutStyle.pageText}>
          {blog.contentHtmls && blog.contentHtmls.length > 0
            ? blog.contentHtmls.map((contentHtml, cIndex) => (
                <div key={`${blog.title}content${cIndex}`}>
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
};

export default function Blog() {
  return (
    <>
      <Head>
        <title>曜靈星軌理數 - 您的智能人生定位系統</title>
        <meta name="description" content="您的智能人生定位系統" />
      </Head>
      <div className={`header show`}>
        <div className="left info-header">
          <Link href="/">
            <div className="logo">
              <img src={"logo.png"} alt="logo" />
              <div className="name">曜靈星軌理數</div>
            </div>
          </Link>
          <Link href="/chart">
            <button>線上排盤</button>
          </Link>
          <Link href="/info#begin">
            <button>遇見命理師</button>
          </Link>
          {/* <Link href="/info#analysis">
            <button>命理分析</button>
          </Link>
          <Link href="/info#course">
            <button>教學課程</button>
          </Link>
          <Link href="/info#question">
            <button>常見問題</button>
          </Link>
          <Link href="/info#contact">
            <button>立即預約</button>
          </Link> */}
          <Link href="/blog">
            <button>網誌</button>
          </Link>
        </div>
        <div className="right">
          <a target="_blank" href="https://buy.stripe.com/cN2cPsa6XaLMauQ001">
            支持我們
          </a>
        </div>
      </div>

      <div className={`${blogStyle.split} ${blogStyle.left}`}>
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className={`${blogStyle.content}`}>
          {blogs.map((blog, bIndex) => (
            <div key={`blogContent${bIndex}`}>
              <a href={`#blog${blog.id}`}>{`${blog.id}. ${blog.title}`}</a>
            </div>
          ))}
        </div>
      </div>
      <div className={`${blogStyle.split} ${blogStyle.right}`}>
        {blogs.map((blog, bIndex) => (
          <BlogContent blog={blog} key={`blog${bIndex}`} />
        ))}

        <br />
        <br />
        <br />
        <br />
      </div>
    </>
  );
}
