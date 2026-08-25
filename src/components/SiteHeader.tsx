"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AudioPlayer } from "@/components/AudioPlayer";

const links = [
  { href: "/", label: "首页" },
  { href: "/posts", label: "文章" },
  { href: "/game", label: "小游戏" },
  { href: "/about", label: "关于" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-logo" aria-label="无敌杀手 首页">
          <Image src="/images/avatar.jpg" alt="无敌杀手" width={32} height={32} />
          <span style={{ marginLeft: "10px" }}>无敌杀手</span>
        </Link>
        <div className="site-header__right">
          <nav className="site-nav" aria-label="主导航">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active ? "site-nav__link is-active" : "site-nav__link"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <AudioPlayer />
        </div>
      </div>
    </header>
  );
}
