---
title: "Luồng upload file CMS Admin"
type: entity
sources: ["sources/bugfix-admin-niem-yet-upload-2026-10-08"]
created: 2026-10-08
updated: 2026-10-08
tags: [admin, cms, upload, nextjs]
---

# Luồng upload file CMS Admin

Trang niêm yết sao chép `FileList` thành `File[]` trước khi reset input, sau đó gửi từng file qua upload client tới API CMS. Điều này tránh việc `FileList` dạng live bị làm rỗng và request không được tạo. [[sources/bugfix-admin-niem-yet-upload-2026-10-08]]

API yêu cầu phiên tối thiểu `EDITOR`, giới hạn file 300 MB, và lưu file niêm yết dưới thư mục cấu hình `UPLOAD_DIR/niem-yet`. [[sources/bugfix-admin-niem-yet-upload-2026-10-08]]

Production dùng Docker volume gắn tại `/app/uploads`, nhờ đó file tồn tại sau khi thay container. [[sources/bugfix-admin-niem-yet-upload-2026-10-08]]

