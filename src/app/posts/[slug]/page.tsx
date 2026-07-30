import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatDate,
  getAllPosts,
  getPostBySlug,
  getPostSlugs,
} from "@/lib/posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    return {
      title: post.title,
      description: post.description,
    };
  } catch {
    return { title: "文章未找到" };
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const slugs = getPostSlugs();
  if (!slugs.includes(slug)) notFound();

  const post = await getPostBySlug(slug);
  const related = getAllPosts()
    .filter((item) => item.slug !== slug)
    .slice(0, 2);

  return (
    <article>
      <header
        className={
          post.cover ? "article-hero" : "article-hero article-hero--plain"
        }
      >
        {post.cover ? (
          <div className="article-hero__media">
            <Image
              src={post.cover}
              alt=""
              fill
              priority
              sizes="100vw"
            />
            <div className="article-hero__veil" />
          </div>
        ) : null}
        <div className="article-hero__content">
          <p className="article-kicker">
            {formatDate(post.date)} · {post.readingTime}
            {post.tags.length > 0 ? ` · ${post.tags.join(" / ")}` : ""}
          </p>
          <h1 className="article-title">{post.title}</h1>
          {post.description ? (
            <p className="article-desc">{post.description}</p>
          ) : null}
        </div>
      </header>

      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      <section className="section section--narrow" style={{ paddingTop: 0 }}>
        <Link href="/posts" className="article-back">
          ← 返回文章列表
        </Link>
        {related.length > 0 ? (
          <div style={{ marginTop: "3rem" }}>
            <p className="section__eyebrow">Continue</p>
            <h2 className="section__title" style={{ fontSize: "1.75rem" }}>
              继续阅读
            </h2>
            <ul className="post-list" style={{ marginTop: "1.25rem" }}>
              {related.map((item) => (
                <li key={item.slug} className="post-list__item">
                  <Link href={`/posts/${item.slug}`} className="post-list__link">
                    <time dateTime={item.date} className="post-list__date">
                      {formatDate(item.date)}
                    </time>
                    <h3 className="post-list__title">{item.title}</h3>
                    <p className="post-list__desc">{item.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </article>
  );
}
