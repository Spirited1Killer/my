import type { Metadata } from "next";
import Link from "next/link";
import { SmokeSession } from "@/components/SmokeSession";

export const metadata: Metadata = {
  title: "抽根烟 · 无敌杀手",
  description: "选个口味，点燃，抽一口，弹烟灰。",
};

export default function SmokePage() {
  return (
    <main className="smoke-page">
      <div className="smoke-page__bar">
        <div>
          <p className="section__eyebrow">Break</p>
          <h1 className="smoke-page__heading">抽根烟</h1>
        </div>
        <div className="smoke-page__links">
          <Link href="/" className="smoke-page__back">
            ← 回首页
          </Link>
        </div>
      </div>
      <SmokeSession />
    </main>
  );
}
