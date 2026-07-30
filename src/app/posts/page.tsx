import type { Metadata } from "next";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
  description: "SJL 的全部文章。",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <section className="section">
      <p className="section__eyebrow">Writing</p>
      <h1 className="section__title">全部文章</h1>
      <p className="section__lead" style={{ marginBottom: "2.5rem" }}>
        按时间倒序排列。没有分类墙，只有一篇一篇认真写过的字。
      </p>
      <PostList posts={posts} />
    </section>
  );
}
