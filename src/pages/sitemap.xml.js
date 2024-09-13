//pages/sitemap.xml.js
//const EXTERNAL_DATA_URL = 'https://jsonplaceholder.typicode.com/posts';

import { myBlogs } from "@/constants/blogs";

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!--We manually set the two URLs we know already-->
     <url>
       <loc>https://yl-flystar.pro</loc>
     </url>
     <url>
       <loc>https://yl-flystar.pro/chart</loc>
     </url>
     <url>
       <loc>https://yl-flystar.pro/blog</loc>
     </url>
      ${myBlogs
        .map((cate) => {
          return `${cate.blogs
            .map((blog) => {
              return `<url>
          <loc>https://yl-flystar.pro/blog/${cate.blogCate}/${blog.blogId}</loc>
        </url>`;
            })
            .join("")}`;
        })
        .join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  // We make an API call to gather the URLs for our site
  //const request = await fetch(EXTERNAL_DATA_URL);
  //const posts = await request.json();

  // We generate the XML sitemap with the posts data
  //const sitemap = generateSiteMap(posts);
  const sitemap = generateSiteMap();

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
