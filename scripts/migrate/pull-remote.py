#!/usr/bin/env python3
"""
pull-remote.py — ↙️ Pull database and assets from a remote Craft server into local DDEV.

Usage:
  1. Copy scripts/migrate/production.cfg.example to scripts/migrate/production.cfg and fill in values.
  2. Make sure DDEV is running: ddev start
  3. Run from the project root:
       python3 scripts/migrate/pull-remote.py            # DB + craft up
       python3 scripts/migrate/pull-remote.py --with-assets   # DB + assets + craft up
       python3 scripts/migrate/pull-remote.py --assets-only   # Assets only
       python3 scripts/migrate/pull-remote.py --skip-craft    # DB only, no craft up

Portability:
  Copy this script and the *.cfg.example files to any Craft/DDEV project.
  Adjust the .cfg file for each project's server details and asset dirs.
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
    # Check if key is already in the agent
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

def ssh_e(cfg: configparser.SectionProxy) -> str:
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
    """Build rsync include/exclude flags for a given filter type."""
    if filter_type == "all":
        return []
    exts = IMAGE_EXTS if filter_type == "images" else PDF_EXTS
    flags = ["--include=*/"]  # always descend into directories
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
    """Parse and print key stats from rsync --dry-run --stats output."""
    for line in rsync_stdout.splitlines():
        if "Number of files:" in line or "Number of created files:" in line:
            print(f"   {line.strip()}")
        elif "Total transferred file size:" in line:
            # Humanize the byte count
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
def pull_database(cfg: configparser.SectionProxy, dry_run: bool = False) -> bool:
    remote_root = cfg["remote_path"].rstrip("/")
    backup_dir  = PROJECT_ROOT / "storage" / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    local_gz    = backup_dir / "latest.sql.gz"
    previous_gz = backup_dir / "previous.sql.gz"

    if dry_run:
        step("Dry run — DB pull preview (no changes will be made)")
        print(f"   Remote DB:  {cfg['ssh_user']}@{cfg['ssh_host']}:{remote_root}/storage/backups/latest.sql.gz")
        print(f"   Download →  {local_gz.relative_to(PROJECT_ROOT)}")
        if local_gz.exists():
            print(f"   ⚠  Existing backup would be moved → {previous_gz.relative_to(PROJECT_ROOT)}")
        print(f"   Import via: ddev import-db")
        success("Dry run complete — nothing was changed.")
        return True

    # 1. Backup + gzip on the remote server, keeping the original .sql
    step("Backing up and compressing remote database…")
    run(ssh_base(cfg) + [
        f"cd {remote_root} && php craft db/backup storage/backups/latest.sql --overwrite=1 && gzip -kf storage/backups/latest.sql"
    ])
    success("Remote backup created and compressed.")

    # 2. rsync the .gz down (no -z flag; file is already compressed)
    step("Downloading backup via rsync…")
    if local_gz.exists():
        local_gz.rename(previous_gz)
        print(f"  Previous backup moved → {previous_gz.relative_to(PROJECT_ROOT)}")
    rsync_with_progress([
        "rsync", "-av", RSYNC_PROGRESS, "--partial",
        "-e", ssh_e(cfg),
        f"{cfg['ssh_user']}@{cfg['ssh_host']}:{remote_root}/storage/backups/latest.sql.gz",
        str(local_gz),
    ])
    success(f"Backup downloaded → {local_gz.relative_to(PROJECT_ROOT)}")

    # 3. Confirm before importing — this overwrites the local DDEV database
    dl_size = _human_size(str(local_gz.stat().st_size)) if local_gz.exists() else "unknown size"
    warn(f"About to import {dl_size} backup into local DDEV — this will overwrite your local database.")
    if not _confirm("Proceed with import?"):
        print("  Import cancelled. The backup file is still at storage/backups/latest.sql.gz")
        return False

    # 4. Import into DDEV (natively handles .sql.gz)
    step("Importing database into DDEV…")
    run(["ddev", "import-db", f"--file={local_gz}"], cwd=PROJECT_ROOT)
    success("Database imported.")

    # 5. Decompress locally so latest.sql stays current for push:dev
    step("Decompressing backup to keep latest.sql current…")
    run(["gunzip", "-kf", str(local_gz)])
    success(f"Decompressed → {(backup_dir / 'latest.sql').relative_to(PROJECT_ROOT)}")

    return True


def pull_assets(cfg: configparser.SectionProxy, filter_type: str = "all", subdir: str = None) -> bool:
    remote_root = cfg["remote_path"].rstrip("/")
    asset_dirs = cfg.get("asset_dirs", "web/uploads").split()
    _ssh_e = ssh_e(cfg)
    ran = False

    for asset_dir in asset_dirs:
        # If --subdir is set, target that specific subdirectory
        remote_dir = f"{remote_root}/{asset_dir}/{subdir}" if subdir else f"{remote_root}/{asset_dir}"
        local_dir  = PROJECT_ROOT / asset_dir / subdir if subdir else PROJECT_ROOT / asset_dir
        dest = str(local_dir.parent) + "/"
        local_dir.mkdir(parents=True, exist_ok=True)

        rsync_filter = _build_filter(filter_type)
        base_cmd = ["rsync", "-az", "--partial", "-e", _ssh_e] + rsync_filter

        label = f"{asset_dir}/{subdir}" if subdir else asset_dir
        step(f"Checking size of remote {label} ({filter_type} files)…")
        dry = subprocess.run(
            base_cmd + ["--dry-run", "--stats", f"{cfg['ssh_user']}@{cfg['ssh_host']}:{remote_dir}", dest],
            capture_output=True, text=True,
        )
        _print_transfer_stats(dry.stdout)
        if not _confirm("Proceed with sync?"):
            print("  Skipped.")
            continue

        step(f"Syncing assets: {label} ({filter_type} files)…")
        rsync_with_progress(base_cmd + [RSYNC_PROGRESS, f"{cfg['ssh_user']}@{cfg['ssh_host']}:{remote_dir}", dest])
        success(f"Synced {label}")
        ran = True

    return ran


def craft_up():
    step("Running 'ddev composer install'…")
    run(["ddev", "composer", "install"], cwd=PROJECT_ROOT)
    success("Composer dependencies installed.")
    step("Running 'ddev craft up' (migrations + project-config)…")
    run(["ddev", "craft", "up"], cwd=PROJECT_ROOT)
    success("Craft is up to date.")


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="↙️ Pull remote DB and assets into local DDEV.",
        epilog=(
            "Examples:\n"
            "  python3 pull-remote.py                          # DB only (default)\n"
            "  python3 pull-remote.py --with-assets           # DB + assets\n"
            "  python3 pull-remote.py --assets-only           # Assets only, skip DB\n"
            "  python3 pull-remote.py --assets-only --filter all               # All asset types\n"
            "  python3 pull-remote.py --assets-only --subdir generalImages     # One subdir only\n"
            "  python3 pull-remote.py --skip-craft            # DB only, skip craft up\n"
            "  python3 pull-remote.py --env staging           # Use staging.cfg instead of production.cfg"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--env", default="production", metavar="ENV",
                        help="Config environment to use, e.g. production or dev (default: production)")
    parser.add_argument("--with-assets", action="store_true", help="Also sync assets from remote (optional)")
    parser.add_argument("--assets-only", action="store_true", help="Only sync assets, skip database")
    parser.add_argument("--filter", default="images", choices=["all", "images", "pdfs"],
                        help="Filter asset sync by type: images, pdfs, or all (default: images)")
    parser.add_argument("--subdir", default=None, metavar="DIR",
                        help="Sync only a specific subdirectory within each asset dir, e.g. --subdir generalImages")
    parser.add_argument("--skip-craft", action="store_true", help="Skip 'ddev craft up' after DB import")
    parser.add_argument("--dry-run", action="store_true", help="Preview what the DB pull would do without making any changes")
    args = parser.parse_args()

    print("\033[1m🚀 Remote → Local DDEV Pull\033[0m")

    config_file = SCRIPT_DIR / f"{args.env}.cfg"
    cfg = load_config(config_file)
    print(f"   Env:    {args.env} ({config_file.name})")
    print(f"   Remote: {cfg['ssh_user']}@{cfg['ssh_host']}:{cfg['remote_path']}")
    print(f"   Local:  {PROJECT_ROOT}")

    pull_db = not args.assets_only
    pull_files = args.with_assets or args.assets_only

    print("\n\033[1mThis will:\033[0m")
    if pull_db:
        print("   • Back up + compress the remote database")
        print("   • Download it to storage/backups/latest.sql.gz")
        print("   • Prompt to confirm before importing into local DDEV")
        print("   • Import into local DDEV via ddev import-db")
        if not args.skip_craft:
            print("   • Run ddev composer install")
            print("   • Run ddev craft up")
    if pull_files:
        asset_dirs = cfg.get("asset_dirs", "web/uploads").split()
        label = f"{args.filter} files" if args.filter != "all" else "all files"
        subdir_label = f"/{args.subdir}" if args.subdir else ""
        for d in asset_dirs:
            print(f"   1. Check transfer size: {cfg['ssh_host']}:{d}{subdir_label} → local ({label})")
            print( "   2. Prompt to confirm before syncing")
    print()

    DIM   = "\033[90m"
    BOLD  = "\033[1m"
    GREEN = "\033[1;32m"
    RESET = "\033[0m"
    def _opt(name, val, desc):
        print(f"   {BOLD}{name:<16}{RESET}  {GREEN}{str(val):<14}{RESET}  {DIM}{desc}{RESET}")
    print(f"{BOLD}Options:{RESET}")
    _opt("--env",          args.env,                            "config to use (e.g. --env dev)")
    _opt("--dry-run",      "yes" if args.dry_run else "no",     "preview DB pull, make no changes")
    _opt("--filter",       args.filter,                         "asset type: images | pdfs | all")
    _opt("--subdir",       args.subdir or "[none]",             "sync only a subdirectory (e.g. --subdir generalImages)")
    _opt("--skip-craft",   "yes" if args.skip_craft else "no",  "skip ddev composer install + craft up")
    _opt("--with-assets",  "yes" if args.with_assets else "no", "also sync assets alongside DB pull")
    _opt("--assets-only",  "yes" if args.assets_only else "no", "skip DB, sync assets only")

    # Build a copy-paste example command from active options
    base_cmd = "npm run mm-pull:assets" if args.assets_only else ("npm run mm-pull:all" if args.with_assets else "npm run mm-pull")
    extra = []
    if args.env != "production":  extra.append(f"--env {args.env}")
    if args.filter != "images":   extra.append(f"--filter {args.filter}")
    if args.subdir:               extra.append(f"--subdir {args.subdir}")
    if args.skip_craft:           extra.append("--skip-craft")
    example = base_cmd + (f" -- {' '.join(extra)}" if extra else "")
    print(f"\n{BOLD}Example:{RESET}")
    print(f"   {GREEN}{example}{RESET}")
    print()

    ensure_ssh_key(cfg)

    db_done = False
    if pull_db:
        db_done = pull_database(cfg, dry_run=args.dry_run)

    assets_ran = False
    if pull_files:
        assets_ran = pull_assets(cfg, args.filter, args.subdir)

    if db_done and not args.dry_run and not args.skip_craft:
        craft_up()

    summary = []
    if db_done and args.dry_run:
        summary.append("✔ Dry run complete — DB pull previewed, no changes made.")
    elif db_done:
        summary.append("✔ Database pulled and imported via ddev import-db")
        summary.append("✔ composer install + craft up ran" if not args.skip_craft else "✔ Database imported (craft up skipped)")
    elif pull_db:
        summary.append("❌ Database import cancelled.")
    if assets_ran:
        asset_dirs = cfg.get("asset_dirs", "web/uploads").split()
        label = f"{args.filter} files" if args.filter != "all" else "all files"
        subdir_label = f" ({args.subdir})" if args.subdir else ""
        summary.append(f"✔ Assets synced: {', '.join(asset_dirs)}{subdir_label} — {label}")
    elif pull_files and not assets_ran:
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

