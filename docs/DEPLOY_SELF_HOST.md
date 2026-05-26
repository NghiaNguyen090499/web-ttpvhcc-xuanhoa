# Deploy server riêng

Hướng dẫn này dùng Docker Compose để chạy Next.js, PostgreSQL và Nginx reverse proxy trên VPS Ubuntu.

## 1. Chuẩn bị server

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-plugin nginx certbot python3-certbot-nginx
sudo systemctl enable --now docker nginx
```

## 2. Clone code

```bash
git clone <repo-github> web-ttpvhcc-xuanhoa
cd web-ttpvhcc-xuanhoa
cp .env.production.example .env.production
```

Sửa `.env.production`:

- `POSTGRES_PASSWORD` và `DATABASE_URL` phải dùng cùng mật khẩu.
- `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` đổi thành domain thật.
- `NEXTAUTH_SECRET`, `ENCRYPTION_KEY`, `SEED_ADMIN_PASSWORD` đổi sang chuỗi mạnh.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` dùng cho upload CMS.

## 3. Tạo bucket Supabase Storage

Trong Supabase Dashboard:

1. Vào Storage, tạo bucket `portal-uploads`.
2. Đặt bucket public để các file CMS hiển thị được ngoài trang public.
3. Copy `Project URL` vào `SUPABASE_URL`.
4. Copy `service_role` key vào `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Khởi động DB và seed dữ liệu

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
docker compose --env-file .env.production -f docker-compose.prod.yml --profile setup run --rm migrate
```

## 5. Chạy app

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
```

Kiểm tra nội bộ:

```bash
curl -I http://127.0.0.1:3000
```

## 6. Cấu hình Nginx và SSL

Copy file mẫu:

```bash
sudo cp ops/nginx/xuanhoa.conf /etc/nginx/sites-available/xuanhoa.conf
sudo sed -i 's/your-domain.vn/domain-cua-anh.vn/g' /etc/nginx/sites-available/xuanhoa.conf
sudo ln -s /etc/nginx/sites-available/xuanhoa.conf /etc/nginx/sites-enabled/xuanhoa.conf
sudo nginx -t
sudo systemctl reload nginx
```

Cấp SSL:

```bash
sudo certbot --nginx -d domain-cua-anh.vn -d www.domain-cua-anh.vn
```

## 7. Deploy bản mới

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml build app migrate
docker compose --env-file .env.production -f docker-compose.prod.yml --profile setup run --rm migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

## 8. Backup DB

```bash
mkdir -p backups/postgres
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backups/postgres/xuanhoa-$(date +%F-%H%M).sql
```
