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
- `UPLOAD_DIR=/app/uploads` để file CMS được lưu vào Docker volume.

## 3. Khởi động DB và seed dữ liệu

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
docker compose --env-file .env.production -f docker-compose.prod.yml --profile setup run --rm migrate
```

## 4. Chạy app

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
```

Kiểm tra nội bộ:

```bash
curl -I http://127.0.0.1:3000
```

File upload CMS được lưu trong Docker volume `uploads_data` và phục vụ qua đường dẫn `/uploads/...`.

## 5. Cấu hình Nginx và SSL

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

## 6. Deploy bản mới

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml build app migrate
docker compose --env-file .env.production -f docker-compose.prod.yml --profile setup run --rm migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

## 7. Backup DB và file upload

```bash
mkdir -p backups/postgres
docker compose --env-file .env.production -f docker-compose.prod.yml exec postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backups/postgres/xuanhoa-$(date +%F-%H%M).sql
```

Backup file upload:

```bash
docker run --rm \
  -v web-ttpvhcc-xuanhoa_uploads_data:/uploads:ro \
  -v "$PWD/backups:/backups" \
  alpine tar -czf /backups/uploads-$(date +%F-%H%M).tar.gz -C /uploads .
```
