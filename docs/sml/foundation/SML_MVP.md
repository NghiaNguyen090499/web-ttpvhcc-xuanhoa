---
type: sml-foundation
tags: [mvp, foundation]
status: active
date: 2026-05-08
---

# SML_MVP — MVP Scope & Roadmap

> Deadline tổng: 31/05/2026 (bàn giao + go-live)
> Triển khai theo 3 giai đoạn, 4 tuần.

## Phase 1 — Nền tảng & Phát triển (01–15/05)

| # | Chức năng | Tiêu chí hoàn thành |
|---|-----------|---------------------|
| 1 | **Setup hạ tầng** | Next.js + Prisma v7 + Supabase + TailwindCSS v4 chạy OK |
| 2 | **Trang chủ** | Hero, truy cập nhanh, thông báo khẩn, tin tức grid, chatbot widget |
| 3 | **Thủ tục HC** | Danh mục + tìm kiếm + chi tiết + biểu mẫu download + link DVC |
| 4 | **Tin tức** | Listing + chi tiết + phân loại + banner khẩn |
| 5 | **Giới thiệu & Liên hệ** | Thông tin đơn vị, bản đồ Google Maps, form phản ánh |
| 6 | **CMS Admin** | Auth MFA + CRUD tin tức + CRUD thủ tục + phân quyền |

## Phase 2 — AI Chatbot & Polish (08–15/05)

| # | Chức năng | Tiêu chí hoàn thành |
|---|-----------|---------------------|
| 7 | **AI Chatbot** | Gemini API + RAG pipeline + widget UI + fallback hotline |
| 8 | **FAQ CMS** | Admin thêm/sửa câu hỏi-trả lời cho knowledge base chatbot |
| 9 | **SEO & Performance** | Metadata đầy đủ, SSG/ISR, PageSpeed ≥ 80 mobile |
| 10 | **Responsive** | Mobile-first, test iOS Safari + Android Chrome |

## Phase 3 — Kiểm thử & Go-live (16–31/05)

| # | Chức năng | Tiêu chí hoàn thành |
|---|-----------|---------------------|
| 11 | **Bảo mật** | OWASP scan, SSL Labs A+, HSTS, CSP headers |
| 12 | **Pentest** | Đơn vị độc lập, 0 lỗ hổng High/Critical |
| 13 | **Kiểm thử chức năng** | Toàn bộ 10 test cases (TC-01 → TC-10) pass |
| 14 | **Đào tạo** | 2 buổi cho cán bộ phường |
| 15 | **Go-live** | Deploy production, theo dõi vận hành |

## Definition of Done (Tiêu chí hoàn thành tổng)

- [ ] 6 module chức năng hoạt động trên production
- [ ] Responsive (mobile + tablet + desktop)
- [ ] SEO-friendly (SSG/ISR, metadata, semantic HTML)
- [ ] SSL Labs A+ · OWASP pass
- [ ] Chatbot accuracy ≥ 80%
- [ ] PageSpeed mobile ≥ 80, desktop ≥ 90
- [ ] Deploy thành công, uptime ≥ 99.5%
- [ ] Tài liệu bàn giao + đào tạo cán bộ

## DB Schema (dự kiến)

```
Procedure        — Thủ tục HC (tên, lĩnh vực, hồ sơ, URL DVC, biểu mẫu...)
ProcedureField   — Lĩnh vực thủ tục (Hộ tịch, Đất đai, Xây dựng...)
News             — Tin tức/Thông báo (tiêu đề, nội dung, loại, ảnh, ngày)
NewsCategory     — Phân loại tin (Tin tức, Thông báo, Văn bản pháp quy...)
FAQ              — Câu hỏi thường gặp cho chatbot
PageContent      — Nội dung trang tĩnh (giới thiệu, liên hệ...)
User             — Tài khoản admin CMS (email, role, MFA)
AuditLog         — Nhật ký thao tác admin
```
