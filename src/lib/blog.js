import fs from "fs";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "src/content/blog");
const POSTS_DIR = path.join(CONTENT_ROOT, "posts");
const CATEGORIES_INDEX = path.join(CONTENT_ROOT, "categories.json");

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const stripHtml = (value = "") =>
  value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getExcerpt = (contentHtmls = [], maxLength = 140) => {
  const text = stripHtml(contentHtmls.join(" "));
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
};

export const sanitizeHtml = (html = "") =>
  html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");

export const getAllPosts = () => {
  const fileNames = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith(".json"));
  return fileNames
    .map((fileName) => readJson(path.join(POSTS_DIR, fileName)))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((post) => ({
      ...post,
      excerpt: getExcerpt(post.contentHtmls),
    }));
};

export const getCategories = () => {
  const categories = readJson(CATEGORIES_INDEX);
  const posts = getAllPosts();

  return categories.map((category) => ({
    ...category,
    posts: category.postIds
      .map((postId) => posts.find((post) => post.id === postId))
      .filter(Boolean),
  }));
};

export const getCategorySlugs = () => getCategories().map((category) => category.slug);

export const getPostsByCategory = (categorySlug) =>
  getAllPosts().filter((post) => post.categorySlug === categorySlug);

export const getCategoryBySlug = (categorySlug) =>
  getCategories().find((category) => category.slug === categorySlug) || null;

export const getPostBySlug = (categorySlug, postSlug) =>
  getAllPosts().find((post) => post.categorySlug === categorySlug && post.slug === postSlug) || null;

export const getAllPostParams = () =>
  getAllPosts().map((post) => ({
    blogCate: post.categorySlug,
    blogId: post.slug,
  }));

