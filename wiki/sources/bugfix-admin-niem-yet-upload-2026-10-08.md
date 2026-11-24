---
title: "Nguồn kiểm chứng bugfix upload niêm yết 2026-10-08"
type: source
sources: []
created: 2026-10-08
updated: 2026-10-08
tags: [admin, upload, niem-yet, bugfix]
---

# Nguồn kiểm chứng bugfix upload niêm yết

Nguồn nội bộ được kiểm tra ngày 2026-10-08:

- `src/app/admin/niem-yet/page.tsx`: xử lý sự kiện chọn file và gọi upload client.
- `src/lib/cms-upload-client.ts`: gửi multipart request tới `/api/admin/uploads`.
- `src/app/api/admin/uploads/route.ts`: xác thực và lưu PDF/ảnh.
- Log truy cập Nginx trước khi sửa: không có `POST /api/admin/uploads` khi người dùng chọn file.
- Kiểm thử production sau triển khai: upload PDF `200`, tải lại file `200`, MIME `application/pdf`.
- Image production mới: `sha256:b77bd530831a93550f55bcb6a31b89869ec534fb5c6782bc390d49ebd175a951`.
- Image rollback: `web-ttpvhcc-xuanhoa-app:rollback-pre-niem-yet-upload-20261008`.

