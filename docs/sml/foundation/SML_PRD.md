---
type: sml-foundation
tags: [prd, foundation]
status: active
date: 2026-05-08
---

# SML_PRD — Product Requirements Document

## Sản phẩm

**Web TTPVHCC Xuân Hòa** — Cổng thông tin điện tử Trung tâm Phục vụ Hành chính Công phường Xuân Hòa

## Tham chiếu

- KH 157/KH-UBND ngày 05/5/2026
- HĐ 01/2026/HĐTKPM/ARAR (v2)
- Domain dự kiến: `https://ttpvhcc-xuanhoa-hcm.gov.vn`

## Đối tượng

| Vai trò | Mô tả |
|---------|-------|
| Người dân | Tra cứu thủ tục HC, biểu mẫu, tin tức — chủ yếu mobile (>70%) |
| Doanh nghiệp | Tra cứu thủ tục đăng ký kinh doanh, nộp hồ sơ qua Cổng DVC |
| Cán bộ phường | Quản trị nội dung (CMS): tin tức, thủ tục, FAQ chatbot |

## Bài toán

- Website hiện tại thiếu bảo mật, không responsive, chưa tích hợp DVC
- Đáp ứng NQ 57-NQ/TW về chuyển đổi số
- Tuân thủ Luật An ninh mạng 116/2025/QH15 và Luật BVDLCN 91/2025/QH15

## Chức năng cốt lõi (6 module)

1. **Trang chủ** — Hero, truy cập nhanh DVC, thông báo khẩn, tin tức, chatbot widget
2. **Thủ tục hành chính** — Danh mục, tìm kiếm, chi tiết (hồ sơ + biểu mẫu + link DVC)
3. **AI Chatbot** — Trả lời 24/7, RAG trên knowledge base thủ tục, fallback hotline
4. **Tin tức & Thông báo** — CMS-driven, phân loại, banner khẩn
5. **Giới thiệu & Liên hệ** — Thông tin đơn vị, bản đồ, form phản ánh kiến nghị
6. **CMS Admin** — CRUD nội dung, quản lý thủ tục, FAQ chatbot, phân quyền, MFA, audit log

## Tích hợp Cổng DVC

- Website **KHÔNG** xử lý hồ sơ — chỉ thông tin và **điều hướng** sang DVC
- Mỗi thủ tục map URL: `dichvucong.gov.vn` + `dichvucong.hochiminhcity.gov.vn`
- Badge "Có thể nộp online" / "Nộp trực tiếp" trên mỗi thủ tục

## Ràng buộc

- KHÔNG xử lý/nhận hồ sơ trực tiếp (chuyển hướng DVC)
- KHÔNG tích hợp VNeID (roadmap v2)
- KHÔNG đa ngôn ngữ
- KHÔNG ứng dụng mobile native
- KHÔNG lưu dữ liệu cá nhân trong DB (form phản ánh → gửi email)
- Chatbot KHÔNG lưu lịch sử sau khi đóng phiên

## Chỉ số thành công

| Chỉ số | Mục tiêu |
|--------|----------|
| Bảo mật | OWASP Top 10 pass · SSL Labs A+ |
| PageSpeed Mobile | ≥ 80 |
| PageSpeed Desktop | ≥ 90 |
| LCP | < 2.5s |
| Chatbot accuracy | ≥ 80% trên bộ 50 câu test |
| Uptime | ≥ 99.5% |
