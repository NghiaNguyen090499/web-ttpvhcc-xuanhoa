-- PostgreSQL baseline for Web TTPVHCC Xuân Hòa.
-- File này chỉ chạy khi volume database được khởi tạo lần đầu.

ALTER DATABASE xuanhoa SET timezone TO 'Asia/Ho_Chi_Minh';
ALTER DATABASE xuanhoa SET statement_timeout TO '30s';
ALTER DATABASE xuanhoa SET idle_in_transaction_session_timeout TO '60s';

CREATE EXTENSION IF NOT EXISTS pgcrypto;
