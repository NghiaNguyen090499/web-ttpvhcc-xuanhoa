# Web TTPVHCC Xuân Hòa — Hướng dẫn cho Agent

> File này định nghĩa ngữ cảnh dự án và công cụ hỗ trợ.
> Agent phải đọc TOÀN BỘ trước khi bắt đầu làm việc.
> Được tạo ngày: 2026-05-08

---

## 1. DỰ ÁN — Bạn đang xây dựng gì

| Thông tin | Chi tiết |
|-----------|----------|
| **Tên dự án** | Web TTPVHCC Xuân Hòa |
| **Lĩnh vực** | Cổng thông tin điện tử / Hành chính công |
| **Mô tả** | Website Trung tâm Phục vụ Hành chính Công phường Xuân Hòa — người dân tra cứu thủ tục, biểu mẫu, tin tức; cán bộ quản lý nội dung qua CMS; chatbot AI hỗ trợ 24/7 |
| **Tech Stack** | Next.js (App Router) · TailwindCSS v4 · Supabase (PostgreSQL) · Prisma v7 · Google OAuth 2.0 · Gemini API · Vercel |
| **Mục tiêu** | Xây dựng đầy đủ 6 module: Trang chủ, Thủ tục HC, Chatbot AI, Tin tức, Giới thiệu & Liên hệ, CMS Admin |

### Cấu trúc dự án (mục tiêu)

```
web-ttpvhcc-xuanhoa/
├── AGENTS.md          ← File này — agent đọc trước tiên
├── src/
│   ├── app/           ← Next.js App Router (pages, layouts, API routes)
│   │   ├── (public)/  ← Layout công dân (trang chủ, thủ tục, tin tức, liên hệ)
│   │   ├── admin/     ← Dashboard CMS quản trị (CRUD thủ tục, tin tức, FAQ)
│   │   └── api/       ← API Routes (auth, chatbot, procedures, news)
│   ├── components/    ← UI components tái sử dụng
│   ├── lib/           ← Utilities, DB client, auth helpers, chatbot
│   └── types/         ← TypeScript types
├── prisma/            ← Schema & migrations & seed
├── public/            ← Static assets (images, favicon, biểu mẫu PDF)
├── docs/              ← Tài liệu dự án (SML, handover, bugfix)
│   ├── sml/           ← Shared Memory Layer
│   ├── handover/      ← Bàn giao phiên
│   └── bugfix/        ← Ghi nhận lỗi đã fix
├── awl/               ← Agent Work Log
│   ├── process-logs/  ← Nhật ký task
│   ├── indexes/       ← Index tra cứu
│   └── templates/     ← Templates
└── wiki/              ← Cơ sở tri thức dự án
```

### Ưu tiên tuyệt đối

> **MỤC TIÊU SỐ 1:** Xây dựng và triển khai website TTPVHCC Xuân Hòa theo PRD.
>
> Wiki/SML là **công cụ hỗ trợ** — KHÔNG PHẢI mục tiêu chính.
> Agent chỉ thao tác wiki khi được kích hoạt bởi sự kiện cụ thể (xem mục 3).

---

## 2. CÔNG CỤ TRI THỨC — Shared Memory Layer (SML)

Dự án sử dụng SML để lưu trữ tri thức tích lũy qua các phiên làm việc.
Tri thức ở đây là: specs API, quyết định thiết kế, tài liệu kỹ thuật — **phục vụ cho việc xây dựng sản phẩm**.

### Nguyên tắc vận hành wiki

1. **Mọi thông tin phải có nguồn.** Trích dẫn bằng wikilink `[[sources/ten-nguon]]`.
2. **Mâu thuẫn = ghi nhận, không chọn.** Dùng block `> [!CONFLICT]`.
3. **Index luôn cập nhật.** Mỗi lần tạo/xóa trang → cập nhật `wiki/index.md`.
4. **Log là append-only.** Chỉ thêm, không sửa, không xóa.

### Frontmatter bắt buộc cho mọi trang wiki

```yaml
---
title: "Tiêu đề"
type: entity|concept|source|synthesis
sources: ["sources/ten-nguon"]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [tag1, tag2]
---
```

### Naming Convention (Quy ước đặt tên)

- File: `kebab-case.md` — chữ thường, nối gạch, không dấu
- Wikilink: `[[category/ten-trang]]`

---

## 3. KHI NÀO SỬ DỤNG SML — Event-Driven Triggers

> Agent KHÔNG chủ động quản lý wiki. Agent CHỈ kích hoạt SML khi gặp sự kiện dưới đây.

### Triggers tự động (agent tự phát hiện)

| Sự kiện trong quá trình dev | Hành động SML |
|-----------------------------|---------------|
| Dự án mới khởi tạo | Chạy phiên kickoff thảo luận với người dùng |
| Người dùng cung cấp tài liệu kỹ thuật mới | Nạp vào wiki để tham chiếu sau |
| Cần tra cứu quyết định thiết kế | Tìm trong wiki trước, trả lời có nguồn |
| Hoàn thành migration / refactor lớn | Đồng bộ wiki với code hiện tại |
| Hoàn thành milestone | Cập nhật AWL indexes + Lint Wiki + Sync |
| Bugfix xác nhận thành công | Tạo CONCEPT doc + cập nhật Wiki entity |
| Kết thúc phiên làm việc | Tạo HANDOVER doc + liên kết AWL |

### Triggers thủ công (người dùng ra lệnh)

| Lệnh người dùng | Ý nghĩa |
|------------------|---------|
| `kickoff` / `khởi động dự án` | Thảo luận & xác định dự án |
| `nạp <file>` | Nạp tài liệu vào wiki |
| `hỏi <câu hỏi>` | Tra cứu trong wiki |
| `kiểm tra wiki` | Quét sức khỏe wiki |
| `đồng bộ wiki` | Sync code → wiki |
| `handover` / `bàn giao` | Tạo tài liệu bàn giao phiên |

---

## 4. DANH MỤC WIKI

| Danh mục | Đường dẫn | Nội dung |
|----------|-----------|----------|
| Entities | `wiki/entities/` | Dịch vụ, thư viện, API, công cụ sử dụng trong dự án |
| Concepts | `wiki/concepts/` | Patterns, quyết định thiết kế, kiến trúc |
| Sources | `wiki/sources/` | Tóm tắt mỗi tài liệu đã nạp |
| Synthesis | `wiki/synthesis/` | So sánh, phân tích, sync reports |

---

## 5. AWL — Agent Work Log

> AWL ghi nhận **nhật ký làm việc** theo từng task — khác với SML ghi nhận tri thức công nghệ.
> Agent KHÔNG nhầm lẫn: SML = "biết gì", AWL = "đã làm gì".

### Decision Matrix — Ghi AWL hay SML?

| Tình huống | Ghi vào đâu | Lý do |
|------------|-------------|-------|
| Nhật ký task hôm nay | **AWL** `process-logs/` | Lịch sử hành động |
| Quyết định kỹ thuật trong task | **AWL** TASK doc → Decisions | Gắn context task |
| Tài liệu tính năng đã xây | **AWL** `features/` | Implementation cụ thể |
| Pattern tái sử dụng | **AWL** `concepts/` | Kinh nghiệm dev |
| Tài liệu tech stack | **SML** `wiki/entities/` | Tri thức công nghệ |
| Tóm tắt article bên ngoài | **SML** `wiki/sources/` | Nguồn tri thức |
| Bug fix + bài học | **CẢ HAI** AWL concept + Wiki entity | Giải pháp + gotcha |

---

## 6. ĐẶC THÙ DỰ ÁN — Lưu ý quan trọng

### Bảo mật (ưu tiên cao nhất)

- Tuân thủ OWASP Top 10
- SSL Labs A+ · TLS 1.3 · HSTS
- MFA bắt buộc cho admin CMS
- CSP · X-Frame-Options · X-Content-Type-Options headers
- KHÔNG lưu dữ liệu cá nhân người dân

### Tích hợp Cổng DVC

- Website CHỈ thông tin + điều hướng → dichvucong.gov.vn
- KHÔNG tự xử lý hồ sơ
- Kiểm tra broken link DVC định kỳ

### Quy ước code (kế thừa từ ShopHoa)

- Server Components mặc định — `"use client"` chỉ khi cần
- Queries tập trung `src/lib/queries.ts` — pages KHÔNG import Prisma trực tiếp
- API routes validate input trước khi query DB
- Prisma v7: dùng `@prisma/adapter-pg` — KHÔNG `datasourceUrl`
- Font: Be Vietnam Pro
- Giá trị tiền tệ: `Int` (VNĐ) — KHÔNG float
