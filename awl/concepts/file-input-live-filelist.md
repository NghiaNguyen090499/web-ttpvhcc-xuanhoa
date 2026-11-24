# File input và `FileList` dạng live

Ngày ghi nhận: 2026-10-08

## Hiện tượng

Người dùng chọn PDF/ảnh tại CMS niêm yết nhưng giao diện không gửi request `POST /api/admin/uploads`.

## Nguyên nhân

`HTMLInputElement.files` trả về một `FileList` dạng live. Nếu giữ tham chiếu này rồi đặt `input.value = ''`, danh sách có thể bị xóa trước khi hàm upload đọc nó.

## Pattern sửa lỗi

Sao chép file thành mảng độc lập trước khi reset input:

```ts
const files = Array.from(event.currentTarget.files || [])
event.currentTarget.value = ''
void handleUpload(files)
```

## Xác minh

- ESLint đạt.
- Next.js production build đạt.
- Production upload PDF trả `200`.
- URL file vừa upload trả `200` với `Content-Type: application/pdf`.
- Bundle production xác nhận thứ tự thực thi: `Array.from(files)` trước khi reset `value`.

