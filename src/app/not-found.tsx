import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section section--narrow" style={{ paddingTop: "6rem" }}>
      <p className="section__eyebrow">404</p>
      <h1 className="section__title">这一页不在这里</h1>
      <p className="section__lead" style={{ marginBottom: "1.75rem" }}>
        可能是链接写错了，也可能文章已经被挪走。回首页或文章列表看看吧。
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn--pine">
          回首页
        </Link>
        <Link
          href="/posts"
          className="btn"
          style={{
            border: "1px solid var(--line)",
            color: "var(--pine-deep)",
          }}
        >
          看文章
        </Link>
      </div>
    </section>
  );
}
