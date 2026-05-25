#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.postgres"
BACKUP_DIR="${ROOT_DIR}/backups/postgres"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.postgres.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy .env.postgres.example and configure it first." >&2
  exit 1
fi

set -a
source "${ENV_FILE}"
set +a

mkdir -p "${BACKUP_DIR}"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="${BACKUP_DIR}/${POSTGRES_DB:-xuanhoa}-${STAMP}.dump"

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T postgres \
  pg_dump -U "${POSTGRES_USER:-xuanhoa_app}" -d "${POSTGRES_DB:-xuanhoa}" \
  --format=custom --no-owner --no-acl \
  > "${OUT_FILE}"

gzip -9 "${OUT_FILE}"

find "${BACKUP_DIR}" -name "*.dump.gz" -type f -mtime +14 -delete

echo "Backup created: ${OUT_FILE}.gz"
