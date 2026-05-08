// Cấu hình Prisma v7
// DATABASE_URL có thể để placeholder khi chưa kết nối DB thực
// prisma generate vẫn hoạt động mà không cần DB connection
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback URL cho prisma generate khi chưa có DB thực
    url: process.env["DATABASE_URL"] || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
