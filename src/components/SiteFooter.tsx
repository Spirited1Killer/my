import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__brand">无敌杀手</p>
        <p className="site-footer__copy">
          © {new Date().getFullYear()} · 无敌杀手
        </p>
        <div className="site-footer__links">
          <Link href="/posts">文章</Link>
          <Link href="/about">关于</Link>
        </div>
      </div>
    </footer>
  );
}
