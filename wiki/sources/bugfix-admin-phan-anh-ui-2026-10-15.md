---
title: "Nguồn kiểm chứng bugfix UI phản ánh 2026-10-15"
type: source
sources: []
created: 2026-10-15
updated: 2026-10-15
tags: [admin, feedback, ui, bugfix, production]
---

# Nguồn kiểm chứng bugfix UI phản ánh

Nguồn nội bộ được kiểm tra ngày 2026-10-15:

- `src/app/admin/phan-anh/page.tsx`: bộ lọc trạng thái, chi tiết phản ánh, cập nhật trạng thái và thông báo API.
- `src/app/api/admin/feedback/route.ts`: `GET` yêu cầu `VIEWER`, `PUT` yêu cầu `EDITOR`.
- `src/components/admin/AdminRoleContext.tsx`: `ADMIN` và `EDITOR` có quyền chỉnh sửa.
- Kiểm tra production: tài khoản đang vận hành có role `ADMIN`.
- Kiểm thử API production: đổi `PENDING → PROCESSING` trả `200`, hoàn tác về `PENDING` trả `200`.
- Kiểm tra font WOFF2 production: trả `200` với cache immutable.
- Image production: `sha256:aed545084249154f9aeb2716324e008c771407ff3f20d017ff448401e30af39b`.

