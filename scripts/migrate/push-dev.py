#!/usr/bin/env python3
"""
push-dev.py — ↗️ Push local database and assets to a remote dev Craft server.

Usage:
  1. Copy scripts/migrate/dev.cfg.example to scripts/migrate/dev.cfg and fill in values.
  2. Run from the project root:
       python3 scripts/migrate/push-dev.py            # DB only
       python3 scripts/migrate/push-dev.py --with-assets  # DB + assets
       python3 scripts/migrate/push-dev.py --assets-only
       python3 scripts/migrate/push-dev.py --skip-craft   # Skip 'php craft up' on remote

Flow (DB):
  1. Gzip local storage/backups/latest.sql → latest.sql.gz
  2. rsync latest.sql.gz → remote storage/backups/
  3. SSH: read DB credentials from remote .env, stream gunzip | mysql
  4. SSH: gunzip -kf to restore latest.sql on server, delete .gz
  5. SSH: php craft up

Flow (assets, optional):
  rsync local asset dirs → remote asset dirs
"""

import argparse
import configparser
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

# ── Helpers ────────────────────────────────────────────────────────────────────
def step(msg: str):
    print(f"\n\033[1;34m▶ {msg}\033[0m")

def success(msg: str):
    print(f"\033[1;32m✔ {msg}\033[0m")

def error(msg: str):
    print(f"\033[1;31m✖ {msg}\033[0m", file=sys.stderr)

def warn(msg: str):
    print(f"\033[1;33m⚠  {msg}\033[0m")

def run(cmd: list, **kwargs) -> subprocess.CompletedProcess:
    print(f"  $ {' '.join(str(c) for c in cmd)}")
    result = subprocess.run(cmd, **kwargs)
    if result.returncode != 0:
        if hasattr(result, 'stderr') and result.stderr:
            print(result.stderr if isinstance(result.stderr, str) else result.stderr.decode("utf-8", errors="replace"), file=sys.stderr)
        error(f"Command failed (exit {result.returncode})")
        sys.exit(result.returncode)
    return result

# ── Progress bar ───────────────────────────────────────────────────────────────
_SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

def _bar(done: int, total: int, width: int = 28) -> str:
    n = int(width * done / total) if total else 0
    return "\033[32m" + "█" * n + "\033[90m" + "░" * (width - n) + "\033[0m"

def rsync_with_progress(cmd: list):
    """Run rsync and render a yarn-style animated progress bar from its output."""
    print(f"  $ {' '.join(str(c) for c in cmd)}")
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0)

    spin_i = 0
    files_done = 0
    total_files = 0
    speed = ""
    buf = b""

    def _render():
        nonlocal spin_i
        spin = _SPINNER[spin_i % len(_SPINNER)]
        spin_i += 1
        term_w = shutil.get_terminal_size((80, 24)).columns
        if total_files > 0:
            pct  = int(100 * files_done / total_files)
            bar  = _bar(files_done, total_files)
            spd  = f"  {speed}" if speed else ""
            line = f"  \033[36m{spin}\033[0m [{bar}] {files_done}/{total_files} ({pct}%){spd}"
        else:
            line = f"  \033[36m{spin}\033[0m  Syncing…  {speed}"
        visible = re.sub(r'\033\[[0-9;]*m', '', line)
        pad = max(0, term_w - len(visible) - 1)
        sys.stdout.write(f"\r{line}{' ' * pad}")
        sys.stdout.flush()

    while True:
        chunk = proc.stdout.read(512)
        if not chunk:
            break
        buf += chunk
        parts = re.split(b'[\r\n]', buf)
        buf = parts[-1]
        for raw in parts[:-1]:
            line = raw.decode("utf-8", errors="replace").strip()
            if not line:
                continue
            m = re.search(r'to-chk=(\d+)/(\d+)', line)
            if m:
                remaining   = int(m.group(1))
                total_files = int(m.group(2))
                files_done  = total_files - remaining
            sm = re.search(r'(\d[\d,.]*\s*[KMGT]B/s)', line)
            if sm:
                speed = sm.group(1).strip()
            _render()

    proc.wait()

    # Final: filled green bar
    term_w = shutil.get_terminal_size((80, 24)).columns
    if total_files > 0:
        bar   = _bar(total_files, total_files)
        spd   = f"  {speed}" if speed else ""
        final = f"  \033[32m✔\033[0m [{bar}] {total_files}/{total_files} (100%){spd}"
    else:
        final = "  \033[32m✔\033[0m  Transfer complete."
    visible = re.sub(r'\033\[[0-9;]*m', '', final)
    pad = max(0, term_w - len(visible) - 1)
    sys.stdout.write(f"\r{final}{' ' * pad}\n")
    sys.stdout.flush()

    if proc.returncode != 0:
        stderr_out = proc.stderr.read().decode("utf-8", errors="replace")
        if stderr_out.strip():
            print(stderr_out, file=sys.stderr)
        error(f"rsync failed (exit {proc.returncode})")
        sys.exit(proc.returncode)

def load_config(config_file: Path) -> configparser.SectionProxy:
    if not config_file.exists():
        error(f"Config file not found: {config_file}")
        error(f"Copy {config_file.with_suffix('.cfg.example')} → {config_file} and fill in your values.")
        sys.exit(1)
    cfg = configparser.ConfigParser()
    with open(config_file) as f:
        cfg.read_string("[remote]\n" + f.read())
    return cfg["remote"]

def ensure_ssh_key(cfg: configparser.SectionProxy):
    """Add SSH key to agent if not already loaded — prompts for passphrase once."""
    key = os.path.expanduser(cfg.get("ssh_key", "~/.ssh/id_rsa"))
    loaded = subprocess.run(["ssh-add", "-l"], capture_output=True, text=True)
    if key in loaded.stdout:
        return
    step("Adding SSH key to agent…")
    print(f"\033[90m  💡 Tip (macOS): to avoid this prompt permanently, run:\033[0m")
    print(f"\033[90m     ssh-add --apple-use-keychain {key}\033[0m")
    print(f"\033[90m     and add 'UseKeychain yes' to your ~/.ssh/config\033[0m\n")
    result = subprocess.run(["ssh-add", key])
    if result.returncode != 0:
        error("Failed to add SSH key. Check your passphrase and key path.")
        sys.exit(1)
    success("SSH key added.")

def ssh_base(cfg: configparser.SectionProxy) -> list:
    return [
        "ssh",
        "-p", cfg.get("ssh_port", "22"),
        "-i", os.path.expanduser(cfg.get("ssh_key", "~/.ssh/id_rsa")),
        "-o", "StrictHostKeyChecking=accept-new",
        f"{cfg['ssh_user']}@{cfg['ssh_host']}",
    ]

def rsync_e(cfg: configparser.SectionProxy) -> str:
    return f"ssh -p {cfg.get('ssh_port', '22')} -i {os.path.expanduser(cfg.get('ssh_key', '~/.ssh/id_rsa'))} -o StrictHostKeyChecking=accept-new"

def rsync_progress_flag() -> str:
    """Use --info=progress2 on rsync 3.1+, fall back to --progress on older macOS rsync."""
    result = subprocess.run(["rsync", "--version"], capture_output=True, text=True)
    first_line = result.stdout.splitlines()[0] if result.stdout else ""
    try:
        version_str = first_line.split("version ")[1].split()[0]
        major, minor = int(version_str.split(".")[0]), int(version_str.split(".")[1])
        if (major, minor) >= (3, 1):
            return "--info=progress2"
    except (IndexError, ValueError):
        pass
    return "--progress"

RSYNC_PROGRESS = rsync_progress_flag()

# ── Asset helpers ──────────────────────────────────────────────────────────────
IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "ico", "tif", "tiff"]
PDF_EXTS   = ["pdf"]

def _build_filter(filter_type: str) -> list:
    if filter_type == "all":
        return []
    exts = IMAGE_EXTS if filter_type == "images" else PDF_EXTS
    flags = ["--include=*/"]
    for ext in exts:
        flags += [f"--include=*.{ext}", f"--include=*.{ext.upper()}"]
    flags += ["--exclude=*"]
    return flags

def _human_size(byte_str: str) -> str:
    """Convert a byte count string (possibly with commas) to a human-readable size."""
    try:
        b = int(byte_str.replace(",", "").split()[0])
        for unit in ("B", "KB", "MB", "GB", "TB"):
            if b < 1024:
                return f"{b:.1f} {unit}"
            b /= 1024
        return f"{b:.1f} PB"
    except (ValueError, IndexError):
        return byte_str

def _print_transfer_stats(rsync_stdout: str):
    for line in rsync_stdout.splitlines():
        if "Number of files:" in line or "Number of created files:" in line:
            print(f"   {line.strip()}")
        elif "Total transferred file size:" in line:
            raw = line.split(":", 1)[1].strip().split()[0]
            print(f"   Total transferred file size: {_human_size(raw)}")

def _confirm(prompt: str) -> bool:
    try:
        answer = input(f"\n  {prompt} [y/N] ").strip().lower()
        return answer in ("y", "yes")
    except (KeyboardInterrupt, EOFError):
        print()
        return False

# ── Steps ──────────────────────────────────────────────────────────────────────
def push_database(cfg: configparser.SectionProxy, skip_craft: bool, dry_run: bool = False) -> bool:
    remote_root = cfg["remote_path"].rstrip("/")
    backup_dir  = PROJECT_ROOT / "storage" / "backups"
    local_sql   = backup_dir / "latest.sql"
    local_gz    = backup_dir / "latest.sql.gz"

    if not local_sql.exists():
        error(f"Local backup not found: {local_sql.relative_to(PROJECT_ROOT)}")
        error("Run 'npm run pull' first, or: ddev craft db/backup storage/backups/latest.sql --overwrite=1")
        sys.exit(1)

    if dry_run:
        step("Dry run — DB push preview (no changes will be made)")
        sql_size = _human_size(str(local_sql.stat().st_size))
        print(f"   Local DB:   {local_sql.relative_to(PROJECT_ROOT)} ({sql_size})")
        print(f"   Upload →    {cfg['ssh_user']}@{cfg['ssh_host']}:{remote_root}/storage/backups/")
        print(f"   Import via: mysql (credentials from remote .env)")
        if not skip_craft:
            print(f"   Then:       php craft up on remote")
        success("Dry run complete — nothing was changed.")
        return True

    # Confirm before touching anything — this overwrites the remote dev database
    sql_size = _human_size(str(local_sql.stat().st_size))
    warn(f"About to push {sql_size} backup to {cfg['ssh_host']} — this will overwrite the remote dev database.")
    print(f"\033[90m  💡 Cloudways: if this fails, increase MySQL Buffer Pool Size to 512 MB\033[0m")
    print(f"\033[90m     under Settings & Packages > Advanced > MySQL.\033[0m")
    if not _confirm("Proceed with DB push?"):
        print("  DB push cancelled.")
        return False

    # 1. Gzip locally (-k keeps original, -f overwrites existing .gz)
    step("Compressing local database backup…")
    run(["gzip", "-kf", str(local_sql)])
    success(f"Compressed → {local_gz.relative_to(PROJECT_ROOT)}")

    # 2. rsync .gz up (no -z; already compressed)
    step("Uploading compressed backup to dev server…")
    rsync_with_progress([
        "rsync", "-av", RSYNC_PROGRESS, "--partial",
        "-e", rsync_e(cfg),
        str(local_gz),
        f"{cfg['ssh_user']}@{cfg['ssh_host']}:{remote_root}/storage/backups/",
    ])
    success("Upload complete.")

    # 3. Read DB creds from remote .env, stream gunzip | mysql, keep latest.sql, clean up .gz
    step("Restoring database on dev server via mysql… This may take awhile.")
    remote_cmd = (
        f"cd {remote_root} && "
        "DB_SERVER=$(grep '^DB_SERVER=' .env | cut -d= -f2 | tr -d '\"') && "
        "DB_DATABASE=$(grep '^DB_DATABASE=' .env | cut -d= -f2 | tr -d '\"') && "
        "DB_USER=$(grep '^DB_USER=' .env | cut -d= -f2 | tr -d '\"') && "
        "DB_PASSWORD=$(grep '^DB_PASSWORD=' .env | cut -d= -f2 | tr -d '\"') && "
        "DB_PORT=$(grep '^DB_PORT=' .env | cut -d= -f2 | tr -d '\"') && "
        "gunzip -c storage/backups/latest.sql.gz | "
        "mysql -h \"${DB_SERVER}\" -P \"${DB_PORT:-3306}\" -u \"${DB_USER}\" -p\"${DB_PASSWORD}\" \"${DB_DATABASE}\" && "
        "gunzip -kf storage/backups/latest.sql.gz && "
        "rm storage/backups/latest.sql.gz"
    )
    run(ssh_base(cfg) + [remote_cmd])
    success("Database restored on dev server.")

    # 4. Run craft up on remote
    if not skip_craft:
        step("Running 'php craft up' on dev server…")
        run(ssh_base(cfg) + [f"cd {remote_root} && php craft up"])
        success("Dev server Craft is up to date.")

    # Clean up local .gz (original .sql is kept)
    local_gz.unlink(missing_ok=True)

    return True


def push_assets(cfg: configparser.SectionProxy, filter_type: str = "all", subdir: str = None) -> bool:
    remote_root = cfg["remote_path"].rstrip("/")
    asset_dirs = cfg.get("asset_dirs", "web/uploads").split()
    _rsync_e = rsync_e(cfg)
    ran = False

    for asset_dir in asset_dirs:
        local_dir  = PROJECT_ROOT / asset_dir / subdir if subdir else PROJECT_ROOT / asset_dir
        remote_dir = f"{remote_root}/{asset_dir}/{subdir}" if subdir else f"{remote_root}/{asset_dir}"

        if not local_dir.exists():
            error(f"Local asset dir not found, skipping: {local_dir.relative_to(PROJECT_ROOT)}")
            continue

        label = f"{asset_dir}/{subdir}" if subdir else asset_dir
        src = f"{local_dir}/"
        dest = f"{cfg['ssh_user']}@{cfg['ssh_host']}:{remote_dir}/"
        rsync_filter = _build_filter(filter_type)
        base_cmd = ["rsync", "-az", "--partial", "-e", _rsync_e] + rsync_filter

        step(f"Checking size of local {label} ({filter_type} files)…")
        dry = subprocess.run(
            base_cmd + ["--dry-run", "--stats", src, dest],
            capture_output=True, text=True,
        )
        _print_transfer_stats(dry.stdout)
        if not _confirm("Proceed with push?"):
            print("  Skipped.")
            continue

        step(f"Pushing assets: {label} ({filter_type} files)…")
        rsync_with_progress(base_cmd + [RSYNC_PROGRESS, src, dest])
        success(f"Pushed {label}")
        ran = True

    return ran


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="↗️ Push local DB and assets to the dev server.",
        epilog=(
            "Examples:\n"
            "  python3 push-dev.py                            # DB only (default)\n"
            "  python3 push-dev.py --with-assets              # DB + assets\n"
            "  python3 push-dev.py --assets-only              # Assets only, skip DB\n"
            "  python3 push-dev.py --assets-only --filter all                  # All asset types\n"
            "  python3 push-dev.py --assets-only --subdir generalImages        # One subdir only\n"
            "  python3 push-dev.py --skip-craft               # DB only, skip craft up on remote"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--with-assets", action="store_true", help="Also push assets to dev (optional)")
    parser.add_argument("--assets-only", action="store_true", help="Only push assets, skip database")
    parser.add_argument("--filter", default="images", choices=["all", "images", "pdfs"],
                        help="Filter asset sync by type: images, pdfs, or all (default: images)")
    parser.add_argument("--subdir", default=None, metavar="DIR",
                        help="Sync only a specific subdirectory within each asset dir, e.g. --subdir generalImages")
    parser.add_argument("--skip-craft", action="store_true", help="Skip 'php craft up' on remote after DB restore")
    parser.add_argument("--dry-run", action="store_true", help="Preview what the DB push would do without making any changes")
    args = parser.parse_args()

    print("\033[1m🚀 Local → Dev Server Push\033[0m")

    config_file = SCRIPT_DIR / "dev.cfg"
    cfg = load_config(config_file)
    print(f"   Local:  {PROJECT_ROOT}")
    print(f"   Remote: {cfg['ssh_user']}@{cfg['ssh_host']}:{cfg['remote_path']}")

    push_db = not args.assets_only
    push_files = args.with_assets or args.assets_only

    print("\n\033[1mThis will:\033[0m")
    if push_db:
        print("   • Prompt to confirm before making any changes")
        print("   • Compress local storage/backups/latest.sql")
        print("   • Upload it to the dev server via rsync")
        print("   • Import into the dev database via mysql")
        if not args.skip_craft:
            print("   • Run php craft up on the dev server")
    if push_files:
        asset_dirs = cfg.get("asset_dirs", "web/uploads").split()
        label = f"{args.filter} files" if args.filter != "all" else "all files"
        subdir_label = f"/{args.subdir}" if args.subdir else ""
        for d in asset_dirs:
            print(f"   1. Check transfer size: local {d}{subdir_label} → {cfg['ssh_host']} ({label})")
            print( "   2. Prompt to confirm before pushing")
    print()

    DIM   = "\033[90m"
    BOLD  = "\033[1m"
    GREEN = "\033[1;32m"
    RESET = "\033[0m"
    def _opt(name, val, desc):
        print(f"   {BOLD}{name:<16}{RESET}  {GREEN}{str(val):<14}{RESET}  {DIM}{desc}{RESET}")
    print(f"{BOLD}Options:{RESET}")
    _opt("--filter",       args.filter,                         "asset type: images | pdfs | all")
    _opt("--subdir",       args.subdir or "[none]",             "sync only a subdirectory (e.g. --subdir generalImages)")
    _opt("--skip-craft",   "yes" if args.skip_craft else "no",  "skip php craft up on remote after DB restore")
    _opt("--dry-run",      "yes" if args.dry_run else "no",     "preview DB push, make no changes")
    _opt("--with-assets",  "yes" if args.with_assets else "no", "also push assets alongside DB")
    _opt("--assets-only",  "yes" if args.assets_only else "no", "skip DB, push assets only")

    # Build a copy-paste example command from active options
    base_cmd = "npm run mm-push:dev:assets" if args.assets_only else ("npm run mm-push:dev:all" if args.with_assets else "npm run mm-push:dev")
    extra = []
    if args.filter != "images":  extra.append(f"--filter {args.filter}")
    if args.subdir:              extra.append(f"--subdir {args.subdir}")
    if args.skip_craft:          extra.append("--skip-craft")
    example = base_cmd + (f" -- {' '.join(extra)}" if extra else "")
    print(f"\n{BOLD}Example:{RESET}")
    print(f"   {GREEN}{example}{RESET}")
    print()

    ensure_ssh_key(cfg)

    db_done = False
    if push_db:
        db_done = push_database(cfg, args.skip_craft, dry_run=args.dry_run)

    assets_ran = False
    if push_files:
        assets_ran = push_assets(cfg, args.filter, args.subdir)

    summary = []
    if db_done and args.dry_run:
        summary.append("✔ Dry run complete — DB push previewed, no changes made.")
    elif db_done:
        summary.append("✔ Database pushed to dev via mysql")
        summary.append("✔ craft up ran on dev" if not args.skip_craft else "✔ Database restored (craft up skipped)")
    elif push_db:
        summary.append("❌ Database push cancelled.")
    if assets_ran:
        asset_dirs = cfg.get("asset_dirs", "web/uploads").split()
        label = f"{args.filter} files" if args.filter != "all" else "all files"
        subdir_label = f" ({args.subdir})" if args.subdir else ""
        summary.append(f"✔ Assets pushed: {', '.join(asset_dirs)}{subdir_label} — {label}")
    elif push_files and not assets_ran:
        summary.append("❌ Asset sync cancelled.")

    if not summary:
        print("\n\033[1;31m❌ Process cancelled.\033[0m\n")
        return

    print("\n\033[1;32m🦸‍♀️ Done!\033[0m")
    for line in summary:
        print(f"   {line}")
    print()


if __name__ == "__main__":
    main()
