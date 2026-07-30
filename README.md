# 无敌杀手个人博客

基于 **Next.js** 的个人博客站点：Markdown 写作、App Router 路由、注重阅读体验的界面。

## 快速开始

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 写文章

在 `content/posts/` 新建 Markdown 文件，例如 `my-post.md`：

```yaml
---
title: 文章标题
description: 一句话摘要
date: 2026-07-30
tags: [随笔]
cover: https://images.unsplash.com/photo-xxx?w=1600&q=80
---

正文从这里开始……
```

文件名即文章 slug，访问路径为 `/posts/my-post`。

## 页面

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/posts` | 文章列表 |
| `/posts/[slug]` | 文章详情 |
| `/about` | 关于 |

## 脚本

- `npm run dev` — 本地开发
- `npm run build` — 生产构建
- `npm run start` — 启动生产服务
- `npm run lint` — 代码检查
- `npm run preview` — 用 Workers 运行时本地预览
- `npm run deploy` — 构建并部署到 Cloudflare Workers

## Cloudflare 部署

Workers Builds 建议填写：

- **Build command**: `npx opennextjs-cloudflare build`
- **Deploy command**: `npx opennextjs-cloudflare deploy`
