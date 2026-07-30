import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "关于",
  description: "关于无敌杀手：写作者、想法与这个小站。",
};

export default function AboutPage() {
  return (
    <section className="section">
      <p className="section__eyebrow">About</p>
      <h1 className="section__title">关于无敌杀手</h1>
      <div className="about-layout" style={{ marginTop: "2.5rem" }}>
        <div className="about-copy">
          <p>
            你好，我是这个站点的作者。无敌杀手
            是一间很小的个人博客：用来放下技术笔记、阅读感想，以及那些还不够成熟、但值得被写下来的想法。
          </p>
          <p>
            我更在意把事情说清楚，而不是把页面做满。所以这里没有复杂的功能，只有文章本身——标题、日期、一段可读的文字。
          </p>
          <p>
            如果你也在写，欢迎把这里当成一个参考：用 Next.js
            搭一个干净的站点，把 Markdown 当作内容源，把阅读体验放在第一位。
          </p>
          <p style={{ marginTop: "1.75rem" }}>
            <Link href="/posts" className="btn btn--pine">
              去看文章
            </Link>
          </p>
        </div>
        <div className="about-portrait">
          <Image
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5040?w=1200&q=80"
            alt="窗边的书桌与书本"
            fill
            sizes="(max-width: 860px) 100vw, 40vw"
          />
        </div>
      </div>
    </section>
  );
}
