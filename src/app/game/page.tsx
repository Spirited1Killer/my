import type { Metadata } from "next";
import Link from "next/link";
import { NiulaiGame } from "@/components/game/NiulaiGame";

export const metadata: Metadata = {
  title: "牛来·梦境奔跑",
  description:
    "致敬水墨动画《牛来》的 3D 网页跑酷：化身小牛在宣纸梦境中奔跑、拾羽、避障。",
};

export default function GamePage() {
  return (
    <section className="niulai-page">
      <div className="niulai-page__bar">
        <div>
          <p className="section__eyebrow">Mini Game</p>
          <h1 className="niulai-page__heading">牛来·梦境奔跑</h1>
        </div>
        <Link href="/" className="niulai-page__back">
          ← 返回博客
        </Link>
      </div>
      <NiulaiGame />
    </section>
  );
}
