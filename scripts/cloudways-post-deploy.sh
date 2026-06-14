#!/usr/bin/env bash
# Cloudways post-deploy helper for Craft.
# Runs from anywhere and applies the standard deploy sequence.
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: ./scripts/cloudways-post-deploy.sh [options]

Options:
  --cms-dir <path>     Path to Craft project directory (auto-detected)
  --skip-composer      Skip composer install
  --with-up            Run `php craft up` instead of explicit apply/migrate steps
  -h, --help           Show this help message
EOF
}

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CMS_DIR="${PROJECT_ROOT}"
SKIP_COMPOSER=0
WITH_UP=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cms-dir)
      if [[ $# -lt 2 ]]; then
        echo "Error: --cms-dir requires a value." >&2
        exit 1
      fi
      CMS_DIR="$2"
      shift 2
      ;;
    --skip-composer)
      SKIP_COMPOSER=1
      shift
      ;;
    --with-up)
      WITH_UP=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown option '$1'." >&2
      usage >&2
      exit 1
      ;;
  esac
done

run_step() {
  echo "+ $*"
  "$@"
}

if [[ ! -f "${CMS_DIR}/craft" ]] && [[ -f "${PROJECT_ROOT}/cms/craft" ]]; then
  CMS_DIR="${PROJECT_ROOT}/cms"
fi

if [[ ! -d "${CMS_DIR}" ]]; then
  echo "Error: Craft project directory not found: ${CMS_DIR}" >&2
  exit 1
fi

if [[ ! -f "${CMS_DIR}/craft" ]]; then
  echo "Error: Craft CLI script missing at ${CMS_DIR}/craft" >&2
  exit 1
fi

if [[ "${SKIP_COMPOSER}" -eq 0 ]] && ! command -v composer >/dev/null 2>&1; then
  echo "Error: composer not found. Install Composer or use --skip-composer." >&2
  exit 1
fi

if ! command -v php >/dev/null 2>&1; then
  echo "Error: php not found in PATH." >&2
  exit 1
fi

cd "${CMS_DIR}"

if [[ "${SKIP_COMPOSER}" -eq 0 ]]; then
  run_step composer install --no-dev --optimize-autoloader
fi

if [[ "${WITH_UP}" -eq 1 ]]; then
  run_step php craft up --interactive=0
else
  run_step php craft project-config/apply --force --interactive=0
  run_step php craft migrate/all --interactive=0
fi

run_step php craft clear-caches/all --interactive=0

echo "Cloudways post-deploy sequence complete."
