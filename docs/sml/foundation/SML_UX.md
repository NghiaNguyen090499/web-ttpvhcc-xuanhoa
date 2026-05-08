---
type: sml-foundation
tags: [ux, foundation]
status: active
date: 2026-05-08
---

# SML_UX — UX/UI Guidelines

## Nguyên tắc thiết kế

1. **Trang trọng & Chuyên nghiệp** — Giao diện chuẩn cơ quan nhà nước cấp phường
2. **Mobile-first** — >70% người dân truy cập bằng điện thoại
3. **Dễ tiếp cận** — WCAG 2.1 Level AA, cỡ chữ tối thiểu 16px
4. **Tra cứu nhanh** — Người dân tìm được thủ tục trong ≤ 3 thao tác
5. **Tin cậy** — Giao diện rõ ràng, thông tin chính xác, bảo mật cao

## Design Tokens

```css
/* Màu sắc chính */
--color-primary:    #003087;  /* Xanh chính phủ */
--color-secondary:  #D4A017;  /* Vàng accent */
--color-success:    #1A7A3A;  /* Xanh lá — nộp online được */
--color-danger:     #C0392B;  /* Đỏ — thông báo khẩn */
--color-text:       #1A1A1A;  /* Đen chữ */
--color-surface:    #F5F5F5;  /* Nền phụ */
--color-white:      #FFFFFF;  /* Nền chính */

/* Typography */
--font-heading:     "Be Vietnam Pro", sans-serif;
--font-body:        "Be Vietnam Pro", sans-serif;
--font-size-body:   16px;     /* Tối thiểu */
--font-size-h1:     32px;
--font-size-h2:     24px;
--font-size-h3:     20px;

/* Spacing & Radius */
--border-radius:    8px;
--spacing-unit:     8px;

/* Tương phản */
/* Tất cả cặp màu phải đạt WCAG AA (≥ 4.5:1) */
```

## Breakpoints (Mobile-first)

```
Mobile:   < 768px   → 1 cột, hamburger menu, chatbot thu gọn
Tablet:   768–1024px → 2 cột
Desktop:  > 1024px   → Full layout 3 cột
```

## Layout chính

### Trang công dân (public)

```
Header
  ├── Logo TTPVHCC + Tên đơn vị (quốc huy bên trái)
  ├── Nav: Trang chủ · Thủ tục HCC · Tin tức · Giới thiệu · Liên hệ
  └── [Nộp hồ sơ online] CTA button (highlight vàng)

Main content (theo từng trang)

Footer
  ├── Thông tin đơn vị · Giờ làm việc · SĐT · Email
  ├── Links: UBND TP.HCM · Cổng DVC Quốc gia · Cổng DVC TP.HCM
  └── Bản quyền · Chính sách bảo mật · Phiên bản

Chatbot Widget (góc phải dưới, nổi, thu gọn được)
```

### Trang admin CMS

```
Sidebar (trái)
  ├── Dashboard
  ├── Thủ tục HC
  ├── Tin tức
  ├── FAQ Chatbot
  ├── Nội dung tĩnh
  └── Cài đặt

Main content (phải)
  ├── Data tables
  ├── Forms (CRUD)
  └── Stats cards
```

## Components chính

| Component | Mô tả |
|-----------|-------|
| HeroBanner | Tên đơn vị, địa chỉ, giờ làm việc, bản đồ, CTA |
| QuickAccess | 4 nút: Nộp hồ sơ · Tra cứu · Lịch hẹn · Biểu mẫu |
| EmergencyBanner | Thông báo khẩn màu đỏ, bật/tắt qua CMS |
| ProcedureCard | Tên thủ tục, lĩnh vực, badge "Nộp online", link chi tiết |
| ProcedureDetail | Hồ sơ, trình tự, phí, biểu mẫu download, nút DVC |
| SearchBar | Tìm kiếm full-text thủ tục, icon, kết quả realtime |
| NewsCard | Ảnh cover, tiêu đề, excerpt, ngày, danh mục |
| ChatbotWidget | Floating widget, gợi ý câu hỏi, lịch sử phiên |
| ContactForm | Form phản ánh kiến nghị (gửi email, KHÔNG lưu DB) |
| MapEmbed | Google Maps nhúng, hiển thị vị trí TTPVHCC |
| AuthButton | Đăng nhập Google (chỉ admin) |
| AdminSidebar | Navigation CMS |
| DataTable | Bảng dữ liệu CRUD (thủ tục, tin tức, FAQ) |

## Accessibility (Khả năng tiếp cận)

- WCAG 2.1 Level AA
- Alt text cho tất cả hình ảnh
- Keyboard navigation cho forms và navigation
- Color contrast ≥ 4.5:1
- Semantic HTML (header, main, nav, footer, article, section)
- ARIA labels cho interactive elements
- Focus visible rõ ràng
- Screen reader friendly

## Animations

- **Nhẹ nhàng, trang trọng** — Không lạm dụng
- Fade-in cho sections khi scroll vào viewport
- Slide cho mobile menu
- Hover effect nhẹ cho buttons và cards
- Loading skeleton cho data fetching
