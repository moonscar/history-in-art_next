// lib/stories.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";

const CONTENT_DIR = path.join(process.cwd(), "content", "stories");

export type Story = {
  slug: string;
  locale: string;
  title: string;
  author?: string;
  excerpt?: string;
  date?: string;
  image?: string;
  excerpt?: string;
  location?: string;
  period?: string;
  readTime?: string;
  publishDate?: string;
};


/**
 * 读取单个 story 文件
 */
// export async function getStory(slug: string, locale: string = "zh") {
//   const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);

//   if (!fs.existsSync(filePath)) {
//     throw new Error(`Story not found: ${locale}/${slug}`);
//   }

//   const source = fs.readFileSync(filePath, "utf-8");
//   const { content, data } = matter(source);

//   const mdxSource = await serialize(content, {
//     mdxOptions: {
//       remarkPlugins: [require("remark-gfm")],
//       rehypePlugins: [require("rehype-slug"), require("rehype-autolink-headings")],
//     },
//   });

//   const meta: Story = {
//     slug,
//     locale,
//     title: data.title ?? slug,
//     description: data.description ?? "",
//     date: data.date ?? "",
//     image: data.image ?? "/placeholder.jpg",
//     excerpt: data.excerpt ?? "",
//     location: data.location ?? "",
//     period: data.period ?? "",
//     readTime: data.readTime ?? "",
//   };

//   return {
//     meta,
//     mdxSource,
//   };
// }

export function getStory(slug: string, locale: string = "zh") {
  const realSlug = slug.replace(/\.mdx$/, "");
  // const fullPath = path.join(storiesDirectory, `${realSlug}.mdx`);
  const fullPath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const meta: Story = {
    slug,
    locale,
    title: data.title,
    description: data.description ?? "",
    date: data.date ?? "",
    image: data.image ?? "/placeholder.jpg",
    excerpt: data.excerpt ?? "",
    location: data.location ?? "",
    period: data.period ?? "",
    readTime: data.readTime ?? "",
  };

  return { slug: realSlug, meta: meta, content };
}

/**
 * 获取所有 story slugs
 */
export function getAllStories(locale: string = "zh"): string[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files.filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""));
}
