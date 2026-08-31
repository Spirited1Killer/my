import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
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
  /** 文件上传/修改时间，用于「最近写下的」排序 */
  uploadedAt: number;
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

function dateFromMtime(mtimeMs: number): string {
  const d = new Date(mtimeMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseFrontmatter(slug: string, fileContents: string, mtimeMs: number) {
  const { data, content } = matter(fileContents);
  const date = normalizeDate(data.date) || dateFromMtime(mtimeMs);
  return {
    content,
    meta: {
      slug,
      title: (data.title as string) ?? slug,
      description: (data.description as string) ?? "",
      date,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      cover: data.cover as string | undefined,
      uploadedAt: mtimeMs,
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

/** 兼容 URL 编码 / Unicode 规范化，避免中文 slug 误判 404 */
export function resolvePostSlug(raw: string): string | null {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  const normalized = decoded.normalize("NFC");
  const slugs = getPostSlugs();
  return (
    slugs.find(
      (slug) =>
        slug === raw ||
        slug === decoded ||
        slug.normalize("NFC") === normalized,
    ) ?? null
  );
}

function readPostFile(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const stat = fs.statSync(fullPath);
  return { fileContents, mtimeMs: stat.mtimeMs };
}

export function getPostMeta(slug: string): PostMeta {
  const { fileContents, mtimeMs } = readPostFile(slug);
  const { content, meta } = parseFrontmatter(slug, fileContents, mtimeMs);
  const stats = readingTime(content);

  return {
    ...meta,
    readingTime: stats.text,
  };
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map(getPostMeta)
    .sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const resolved = resolvePostSlug(slug) ?? slug;
  const { fileContents, mtimeMs } = readPostFile(resolved);
  const { content, meta } = parseFrontmatter(resolved, fileContents, mtimeMs);
  // Typora 等本地编辑器用相对路径 ../images/...；站点从 public/images 提供
  const webContent = content.replace(
    /(!\[[^\]]*\]\()(?:\.\.\/)+images\//g,
    "$1/images/",
  );
  const processed = await remark()
    .use(remarkGfm)
    .use(html, { sanitize: false })
    .process(webContent);
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
