# Web TTPVHCC Xuân Hòa

Cổng thông tin Trung tâm Phục vụ Hành chính Công phường Xuân Hòa.

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Khi chưa cấu hình `DATABASE_URL`, app chạy chế độ demo bằng dữ liệu JSON trong `data/`.

## PostgreSQL self-host

Dự án ưu tiên production với PostgreSQL thuần + Prisma.

```bash
cp .env.postgres.example .env.postgres
npm run db:up
npm run db:push
npm run db:seed
```

Chi tiết: [docs/DEPLOY_POSTGRES_SELF_HOST.md](docs/DEPLOY_POSTGRES_SELF_HOST.md)

## Deploy server riêng

Production self-host dùng Docker Compose + PostgreSQL + Nginx:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d postgres
docker compose --env-file .env.production -f docker-compose.prod.yml --profile setup run --rm migrate
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

Chi tiết: [docs/DEPLOY_SELF_HOST.md](docs/DEPLOY_SELF_HOST.md)

## Kiểm tra

```bash
npm run lint
npm run build
```
