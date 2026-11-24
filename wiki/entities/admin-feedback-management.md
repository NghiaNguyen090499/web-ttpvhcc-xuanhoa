---
title: "Quản lý phản ánh trong CMS Admin"
type: entity
sources: ["sources/bugfix-admin-phan-anh-ui-2026-10-15"]
created: 2026-10-15
updated: 2026-10-15
tags: [admin, cms, feedback, ui, rbac]
---

# Quản lý phản ánh trong CMS Admin

Trang `/admin/phan-anh` cho phép lọc phản ánh bằng cả thẻ thống kê và nhóm nút trạng thái. Các điều khiển lọc dùng `button` cùng `aria-pressed` để thể hiện trạng thái đang chọn. [[sources/bugfix-admin-phan-anh-ui-2026-10-15]]

Chi tiết phản ánh có vùng cuộn độc lập; trên mobile hiển thị dạng bottom sheet. Nội dung, email và phản hồi dài được wrap để không phá bố cục. [[sources/bugfix-admin-phan-anh-ui-2026-10-15]]

Quyền đọc yêu cầu tối thiểu `VIEWER`; gửi phản hồi và đổi trạng thái yêu cầu `EDITOR`. Giao diện hiển thị rõ kết quả thành công hoặc lỗi do API trả về. [[sources/bugfix-admin-phan-anh-ui-2026-10-15]]

