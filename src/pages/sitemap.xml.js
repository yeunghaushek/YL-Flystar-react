import { getAllPosts, getCategories } from "@/lib/blog";

function generateSiteMap() {
  const categories = getCategories();
  const posts = getAllPosts();

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://yl-flystar.pro</loc>
     </url>
     <url>
       <loc>https://yl-flystar.pro/theory</loc>
     </url>
     <url>
       <loc>https://yl-flystar.pro/chart</loc>
     </url>
     <url>
       <loc>https://yl-flystar.pro/meihua</loc>
     </url>
     <url>
       <loc>https://yl-flystar.pro/blog</loc>
     </url>
      ${categories
        .map(
          (category) => `<url>
        <loc>https://yl-flystar.pro/blog/${encodeURIComponent(category.slug)}</loc>
      </url>`
        )
        .join("")}
      ${posts
        .map(
          (post) => `<url>
        <loc>https://yl-flystar.pro/blog/${encodeURIComponent(post.categorySlug)}/${encodeURIComponent(
            post.slug
          )}</loc>
      </url>`
        )
        .join("")}
   </urlset>
 `;
}

function SiteMap() {
  return null;
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSiteMap();

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
