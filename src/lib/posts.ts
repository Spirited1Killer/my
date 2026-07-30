import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  cover?: string;
  readingTime: string;
};

export type Post = PostMeta & {
  contentHtml: string;
};

function ensurePostsDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
}

/** gray-matter 会把 YAML 日期解析成 Date，统一成 YYYY-MM-DD 避免 hydration 不一致 */
function normalizeDate(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function parseFrontmatter(slug: string, fileContents: string) {
  const { data, content } = matter(fileContents);
  return {
    content,
    meta: {
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      date: normalizeDate(data.date),
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      cover: data.cover as string | undefined,
    },
  };
}

export function getPostSlugs(): string[] {
  ensurePostsDirectory();
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getPostMeta(slug: string): PostMeta {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content, meta } = parseFrontmatter(slug, fileContents);
  const stats = readingTime(content);

  return {
    ...meta,
    readingTime: stats.text,
  };
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map(getPostMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content, meta } = parseFrontmatter(slug, fileContents);
  const processed = await remark().use(html).process(content);
  const stats = readingTime(content);

  return {
    ...meta,
    readingTime: stats.text,
    contentHtml: processed.toString(),
  };
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
