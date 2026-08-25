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
        <h2 className="section__title">牛来·梦境奔跑</h2>
        <div className="home-game__frame">
          <div className="home-game__copy">
            <p>
              致敬水墨动画《牛来》。化身初生小牛，在宣纸梦境里拾金羽、避墨狼，跑完梦醒前的最后一程。
            </p>
            <p>三车道跑酷，速度渐增，最高分本地保存。桌面与手机都能玩。</p>
            <Link href="/game" className="btn btn--pine">
              开始入梦
            </Link>
          </div>
          <div className="home-game__visual" aria-hidden>
            <span className="home-game__visual-mark">牛来</span>
            <p className="home-game__visual-sub">宣纸 · 墨色 · 无尽奔跑</p>
          </div>
        </div>
      </section>
    </>
  );
}
