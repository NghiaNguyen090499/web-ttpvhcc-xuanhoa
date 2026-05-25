#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.postgres"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.postgres.yml"
BACKUP_FILE="${1:-}"

if [[ -z "${BACKUP_FILE}" ]]; then
  echo "Usage: npm run db:restore -- /path/to/backup.dump.gz" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy .env.postgres.example and configure it first." >&2
  exit 1
fi

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

set -a
source "${ENV_FILE}"
set +a

echo "Restoring ${BACKUP_FILE} into database ${POSTGRES_DB:-xuanhoa}."
echo "This will clean objects owned by the dump where applicable."

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  gzip -dc "${BACKUP_FILE}" | docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T postgres \
    pg_restore -U "${POSTGRES_USER:-xuanhoa_app}" -d "${POSTGRES_DB:-xuanhoa}" \
    --clean --if-exists --no-owner --no-acl
else
  docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T postgres \
    pg_restore -U "${POSTGRES_USER:-xuanhoa_app}" -d "${POSTGRES_DB:-xuanhoa}" \
    --clean --if-exists --no-owner --no-acl < "${BACKUP_FILE}"
fi

echo "Restore completed."
