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

## Kiểm tra

```bash
npm run lint
npm run build
```
