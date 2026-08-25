import Image from "next/image";
import Link from "next/link";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const latest = getAllPosts().slice(0, 3);

  return (
    <>
      <section className="hero" aria-label="无敌杀手首页">
        <div className="hero__media">
          <Image
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=2000&q=80"
            alt="晨雾中的松林与远山"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero__veil" />
        </div>
        <div className="hero__content">
          <p className="hero__brand">无敌杀手</p>
          <h1 className="hero__headline">一间留给文字的小窗</h1>
          <p className="hero__support">
            写技术、写观察、写一点点值得留下的想法。慢慢读，也慢慢写。
          </p>
          <div className="hero__actions">
            <Link href="/posts" className="btn btn--solid">
              阅读文章
            </Link>
            <Link href="/game" className="btn btn--ghost">
              玩小游戏
            </Link>
          </div>
        </div>
      </section>

      <section className="section home-latest">
        <div className="home-latest__head">
          <div>
            <p className="section__eyebrow">Latest</p>
            <h2 className="section__title">最近写下的</h2>
            <p className="section__lead">从最新的一篇开始，顺着往下看就好。</p>
          </div>
          <Link href="/posts" className="home-latest__more">
            全部文章 →
          </Link>
        </div>
        <PostList posts={latest} />
      </section>

      <section className="section home-game">
        <p className="section__eyebrow">Play</p>
        <h2 className="section__title">牛来小游戏</h2>
        <div className="home-game__list">
          <article className="home-game__card">
            <h3>游戏一 · 梦境奔跑</h3>
            <p>三车道跑酷，拾金羽、躲障碍，跑完梦醒前最后一程。</p>
            <Link href="/game" className="btn btn--pine">
              开始入梦
            </Link>
          </article>
          <article className="home-game__card">
            <h3>游戏二 · 妈妈出击</h3>
            <p>A/D 移动，自动吐出妈妈攻击墨狼；掉落可加牛数与攻速。</p>
            <Link href="/game2" className="btn btn--pine">
              开始出击
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}
