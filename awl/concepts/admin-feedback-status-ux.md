# Trạng thái phản ánh: phân biệt bộ lọc và thao tác cập nhật

Ngày ghi nhận: 2026-10-15

## Vấn đề

Các thẻ thống kê trạng thái có hình thức giống nút nhưng chỉ là `div`, khiến người dùng bấm mà không có phản hồi. Khi API cập nhật thất bại, giao diện cũ cũng không hiển thị lỗi.

## Pattern sửa lỗi

- Thành phần có affordance tương tác phải dùng `button` thật và có `aria-pressed` khi đóng vai trò bộ lọc.
- Bộ lọc trạng thái và nút cập nhật trạng thái là hai thao tác khác nhau, cần phân biệt bằng vị trí và phản hồi trực quan.
- Luôn đọc response JSON và kiểm tra `response.ok`; không nuốt lỗi API.
- Sau cập nhật thành công, đồng bộ state cục bộ ngay để số liệu và trạng thái đổi tức thì.
- Nội dung chi tiết dài cần `max-height` cùng `overflow-y-auto`, đặc biệt khi nằm trong layout `h-screen`.

## Xác minh

- API đổi trạng thái production trả `200` cho `PENDING → PROCESSING`.
- Hoàn tác về `PENDING` trả `200`.
- Production build và ESLint đạt.

