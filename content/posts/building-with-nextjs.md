---
title: 用 Next.js 搭一个可读的个人站点
description: App Router、Markdown 内容层，以及把阅读体验放在第一位的设计取舍。
date: 2026-07-30
tags: [技术, Next.js]
cover: https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80
---

这个站点本身就是用 **Next.js** 搭的。目标很明确：快、清晰、好维护。

## 内容怎么组织

文章以 Markdown 的形式放在 `content/posts` 目录。每篇文章有 frontmatter：

```yaml
title: 文章标题
description: 一句话摘要
date: 2026-07-30
tags: [技术]
```

构建时读取文件、解析 frontmatter，再用 `remark` 转成 HTML。没有数据库，发布一篇文章就是新增一个 `.md` 文件。

## 页面结构

- `/` — 首页，品牌与入口
- `/posts` — 全部文章
- `/posts/[slug]` — 单篇文章
- `/about` — 关于

路由尽量少，读者不会迷路。

## 设计上的取舍

个人博客最容易做成「功能齐全的小仪表盘」。我刻意反过来做：

- 首页先让人记住品牌，而不是塞满统计
- 列表用排版层次，而不是卡片墙
- 正文优先可读性：行宽、字号、留白

技术可以很新，但阅读体验应该很旧——旧得像一本认真排过版的书。
