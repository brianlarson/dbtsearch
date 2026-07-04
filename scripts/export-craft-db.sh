#!/usr/bin/env bash
# Export Craft MySQL to storage/backups/craft-export.sql
# Run from anywhere. Uses DDEV primary MySQL (database: craft).
set -e
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/storage/backups"
mkdir -p "$BACKUP_DIR"
OUTPUT="${BACKUP_DIR}/craft-export.sql"
cd "$PROJECT_ROOT"
ddev exec -s db mysqldump -u db -pdb --no-tablespaces craft > "$OUTPUT"
if [[ ! -s "$OUTPUT" ]]; then
  echo "Error: export is empty. Is DDEV running? Check: ddev describe" >&2
  exit 1
fi
echo "Craft DB exported to: $OUTPUT ($(wc -l < "$OUTPUT") lines)"
