#!/usr/bin/env bash
# Export Craft MySQL to cms/storage/backups/craft-export.sql
# Run from anywhere. Uses mysql8 if present, else primary db.
set -e
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/cms/storage/backups"
mkdir -p "$BACKUP_DIR"
OUTPUT="${BACKUP_DIR}/craft-export.sql"
cd "$PROJECT_ROOT"
if ddev describe 2>/dev/null | grep -q mysql8; then
  ddev exec -s mysql8 mysqldump -u craft -pcraft --no-tablespaces craft > "$OUTPUT"
else
  ddev exec -s db mysqldump -u db -pdb --no-tablespaces craft > "$OUTPUT"
fi
if [[ ! -s "$OUTPUT" ]]; then
  echo "Error: export is empty. Is DDEV running? Is mysql8 (or db) up? Check: ddev describe" >&2
  exit 1
fi
echo "Craft DB exported to: $OUTPUT ($(wc -l < "$OUTPUT") lines)"
