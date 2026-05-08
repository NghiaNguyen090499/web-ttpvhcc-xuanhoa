---
type: sml-foundation
tags: [tech-stack, foundation]
status: active
date: 2026-05-08
---

# SML_STACK — Tech Stack Foundation

> Website TTPVHCC Phường Xuân Hòa — Cổng thông tin hành chính công

## Stack chính thức

| Tầng | Công nghệ | Phiên bản | Vai trò |
|------|-----------|-----------|---------|
| Framework | Next.js (App Router) | 16.x | Fullstack React framework — SSR/SSG |
| Styling | TailwindCSS | v4 | Utility-first CSS |
| Database | Supabase (PostgreSQL) | latest | Managed relational database |
| ORM | Prisma | v7 | Type-safe database access (driver adapter) |
| Auth | Google OAuth 2.0 thuần | - | Xác thực cán bộ quản trị |
| AI Chatbot | Google Gemini API | latest | Trợ lý ảo tra cứu thủ tục 24/7 |
| Hosting | Vercel | - | Deployment & CDN |
| Language | TypeScript | latest | Type safety |
| Analytics | Plausible | latest | Privacy-first analytics (không cookie) |

## Quy tắc stack

1. **Prisma v7 dùng `@prisma/adapter-pg`** — KHÔNG dùng `datasourceUrl` trực tiếp
2. **Prisma là data access layer duy nhất** — Không query PostgreSQL trực tiếp
3. **TailwindCSS v4** — CSS-first config, không dùng `tailwind.config.js`
4. **TypeScript strict mode** — Không dùng `any`
5. **Server Components mặc định** — `"use client"` chỉ khi cần interactivity
6. **Auth chỉ cho admin CMS** — Người dân truy cập KHÔNG cần đăng nhập
7. **Không thu thập dữ liệu cá nhân** — Tuân thủ Luật BVDLCN 91/2025/QH15
8. **SEO-first** — Mọi trang công khai dùng SSG/ISR, metadata đầy đủ
9. **Font chính: Be Vietnam Pro** — Phù hợp tiếng Việt, đã chọn trong PRD

## Dependencies chính

```
# Core
next, react, react-dom
@prisma/client, @prisma/adapter-pg, pg, prisma

# Auth (admin only)
jose (JWT trên Edge Runtime)

# AI Chatbot
@google/genai

# Dev
@tailwindcss/postcss, tailwindcss
tsx, typescript
@types/node, @types/pg, @types/react, @types/react-dom
```

## Khác biệt so với ShopHoa

| Điểm | ShopHoa | Xuân Hòa |
|------|---------|----------|
| Lĩnh vực | E-commerce | Cổng thông tin chính quyền |
| Auth | Tất cả users | Chỉ admin CMS |
| AI | Không | Chatbot Gemini + RAG |
| Upload | UploadThing | Chưa cần (biểu mẫu PDF static) |
| Bảo mật | Tiêu chuẩn | Cao — OWASP, SSL A+, HSTS |
| Analytics | Không | Plausible (privacy-first) |
