import Link from "next/link";
import { formatDate, type PostMeta } from "@/lib/posts";

type PostListProps = {
  posts: PostMeta[];
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="empty-state">还没有文章，去 content/posts 写第一篇吧。</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((post, index) => (
        <li
          key={post.slug}
          className="post-list__item"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <Link href={`/posts/${post.slug}`} className="post-list__link">
            <time dateTime={post.date} className="post-list__date">
              {formatDate(post.date)}
            </time>
            <h2 className="post-list__title">{post.title}</h2>
            <p className="post-list__desc">{post.description}</p>
            <span className="post-list__meta">
              {post.readingTime}
              {post.tags.length > 0 ? ` · ${post.tags.join(" / ")}` : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
