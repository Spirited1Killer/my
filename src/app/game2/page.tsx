import type { Metadata } from "next";
import Link from "next/link";
import { NiulaiGame2 } from "@/components/game/NiulaiGame2";

export const metadata: Metadata = {
  title: "牛来·妈妈出击",
  description:
    "游戏二：A/D 移动，小牛自动吐出妈妈攻击前方墨狼，拾取加牛与攻速道具。",
};

export default function Game2Page() {
  return (
    <section className="niulai-page">
      <div className="niulai-page__bar">
        <div>
          <p className="section__eyebrow">Mini Game 2</p>
          <h1 className="niulai-page__heading">牛来·妈妈出击</h1>
        </div>
        <div className="niulai-page__links">
          <Link href="/game" className="niulai-page__back">
            游戏一
          </Link>
          <Link href="/" className="niulai-page__back">
            ← 返回博客
          </Link>
        </div>
      </div>
      <NiulaiGame2 />
    </section>
  );
}
