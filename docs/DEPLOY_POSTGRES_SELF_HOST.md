# Triển khai PostgreSQL self-host

Tài liệu này dùng cho hướng production gọn: Next.js + Prisma + PostgreSQL thuần. Không cần self-host full Supabase.

## 1. Chuẩn bị server

Yêu cầu tối thiểu:

- Ubuntu 22.04/24.04 hoặc tương đương
- Docker + Docker Compose plugin
- Firewall chỉ mở cổng cần thiết
- Dung lượng backup riêng hoặc đồng bộ backup ra nơi khác

Khuyến nghị bảo mật:

- Nếu app chạy cùng server DB: giữ `POSTGRES_PORT=127.0.0.1:5432`
- Nếu app chạy từ Vercel/server khác: chỉ mở cổng DB cho IP tin cậy hoặc dùng VPN/Tailscale
- Không commit `.env`, `.env.postgres`, backup dump

## 2. Cấu hình PostgreSQL

```bash
cp .env.postgres.example .env.postgres
```

Đổi ít nhất:

```bash
POSTGRES_DB=xuanhoa
POSTGRES_USER=xuanhoa_app
POSTGRES_PASSWORD=<mat-khau-dai-ngau-nhien>
POSTGRES_PORT=127.0.0.1:5432
```

Khởi động DB:

```bash
npm run db:up
npm run db:logs
```

Kiểm tra container healthy:

```bash
docker ps
```

## 3. Cấu hình app

Copy `.env.example` thành `.env` hoặc cấu hình biến môi trường trên nền tảng deploy.

Các biến bắt buộc:

```bash
DATABASE_URL="postgresql://xuanhoa_app:<password>@127.0.0.1:5432/xuanhoa?schema=public"
NEXTAUTH_SECRET="<chuoi-bi-mat-dai>"
ENCRYPTION_KEY="<chuoi-bi-mat-toi-thieu-32-ky-tu>"
ADMIN_EMAILS="admin@xuanhoa.gov.vn"
NEXT_PUBLIC_APP_URL="https://ten-mien-cua-ban"
```

Tài khoản quản trị đầu tiên được tạo bằng `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` khi chạy `npm run db:seed`.

Cho chatbot:

```bash
GEMINI_API_KEY="..."
```

## 4. Tạo schema và import dữ liệu

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

`db:seed` sẽ import dữ liệu từ `data/*.json` vào PostgreSQL:

- Tin tức
- FAQ
- Thủ tục hành chính
- Phản ánh mẫu
- Cơ cấu tổ chức

## 5. Backup và restore

Tạo backup thủ công:

```bash
npm run db:backup
```

File backup nằm ở `backups/postgres/*.dump.gz`. Script tự xóa backup cũ hơn 14 ngày.

Restore:

```bash
npm run db:restore -- backups/postgres/xuanhoa-YYYYMMDD-HHMMSS.dump.gz
```

Cron backup hằng ngày lúc 02:15:

```cron
15 2 * * * cd /path/to/web-ttpvhcc-xuanhoa && npm run db:backup >> /var/log/xuanhoa-postgres-backup.log 2>&1
```

Nên đồng bộ `backups/postgres` ra một nơi khác như S3, NAS nội bộ, hoặc server backup.

## 6. Deploy app

Nếu chạy app trên cùng VPS:

```bash
npm run build
npm run start
```

Nếu deploy Vercel:

- Cấu hình `DATABASE_URL` trỏ về DB host đã firewall/VPN
- Cấu hình `NEXT_PUBLIC_APP_URL` là domain production
- Không dùng dev login trên production; route `/api/auth/login` đã bị chặn khi `NODE_ENV=production`

## 7. Kiểm tra sau deploy

```bash
npm run lint
npm run build
```

Kiểm tra URL:

- `/`
- `/thu-tuc`
- `/tin-tuc`
- `/admin/login`
- `/api/admin/articles` sau khi đăng nhập

Kiểm tra bảo mật:

- Admin chỉ vào được sau đăng nhập
- `ADMIN_EMAILS` không để trống trên production
- `NEXTAUTH_SECRET` và `ENCRYPTION_KEY` là chuỗi riêng, đủ dài
- DB không mở public tràn lan

## 8. Phân quyền CMS

Hệ thống có 3 vai trò:

- `ADMIN`: toàn quyền, quản lý người dùng, phân quyền, xóa dữ liệu.
- `EDITOR`: tạo/sửa/xóa nội dung, FAQ, thủ tục, phản hồi phản ánh; không được quản lý user.
- `VIEWER`: chỉ xem dữ liệu CMS, không được tạo/sửa/xóa.

Trang quản lý phân quyền nằm tại `/admin/cai-dat`, chỉ `ADMIN` truy cập được.
