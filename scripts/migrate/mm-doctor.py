#!/usr/bin/env python3
"""
mm-doctor.py — 🩺 Pre-flight diagnostics for Mighty Migration.

Checks everything that needs to be in place before a pull or push will succeed:
  • Required tools installed (rsync, ssh, ddev, gzip, mysql)
  • Config files present and required keys populated
  • SSH key exists on disk and is loaded in the agent
  • SSH connectivity to each configured server
  • Remote project root exists and is readable
  • Local DDEV project is running
  • Local backup file presence (for push operations)

Run from the project root:
    npm run mm-doctor
    python3 scripts/migrate/mm-doctor.py
    python3 scripts/migrate/mm-doctor.py --env dev   # check dev config only
"""

import argparse
import configparser
import os
import subprocess
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

# ── ANSI ───────────────────────────────────────────────────────────────────────
BOLD   = "\033[1m"
DIM    = "\033[90m"
RESET  = "\033[0m"
GREEN  = "\033[1;32m"
YELLOW = "\033[1;33m"
RED    = "\033[1;31m"
CYAN   = "\033[1;36m"
WHITE  = "\033[1;97m"
PURPLE = "\033[1;35m"

# ── Results collector ──────────────────────────────────────────────────────────
_results: list[tuple[bool | None, str, str]] = []  # (pass, label, detail)

def _pass(label: str, detail: str = ""):
    _results.append((True, label, detail))

def _fail(label: str, detail: str = ""):
    _results.append((False, label, detail))

def _warn(label: str, detail: str = ""):
    _results.append((None, label, detail))

# ── Checks ─────────────────────────────────────────────────────────────────────
def check_tools():
    """Verify required CLI tools are installed."""
    tools = {
        "rsync":  "Required for asset and DB transfer",
        "ssh":    "Required for all remote operations",
        "gzip":   "Required to compress/decompress SQL backups",
        "ddev":   "Required to import DB and run craft commands locally",
        "mysql":  "Needed on remote server (checked via SSH later)",
    }
    for tool, desc in tools.items():
        if tool == "mysql":
            # mysql client is optional locally — only needed on remote
            result = subprocess.run(["which", tool], capture_output=True)
            if result.returncode == 0:
                _pass(f"Tool: {tool}", desc)
            else:
                _warn(f"Tool: {tool}", f"Not found locally — only required on the remote server ({desc})")
        else:
            result = subprocess.run(["which", tool], capture_output=True)
            if result.returncode == 0:
                _pass(f"Tool: {tool}", desc)
            else:
                _fail(f"Tool: {tool}", f"Not found in PATH — {desc}")


def check_ddev():
    """Check that DDEV is running for the local project."""
    result = subprocess.run(
        ["ddev", "describe", "--json-output"],
        capture_output=True, text=True, cwd=PROJECT_ROOT,
    )
    if result.returncode != 0:
        _fail("DDEV: project running", "ddev describe failed — is DDEV started? Run: ddev start")
        return
    try:
        import json
        data = json.loads(result.stdout)
        status = data.get("raw", {}).get("status", "")
        if status == "running":
            name = data.get("raw", {}).get("name", "unknown")
            _pass("DDEV: project running", f"Project '{name}' is running")
        else:
            _fail("DDEV: project running", f"Status is '{status}' — run: ddev start")
    except (ValueError, KeyError):
        _warn("DDEV: project running", "Could not parse ddev describe output — check manually")


def load_config(cfg_path: Path) -> configparser.SectionProxy | None:
    if not cfg_path.exists():
        return None
    cfg = configparser.ConfigParser()
    with open(cfg_path) as f:
        cfg.read_string("[remote]\n" + f.read())
    return cfg["remote"]


def check_config(env: str):
    """Check that the .cfg file exists and has all required keys."""
    required_keys = ["ssh_host", "ssh_user", "remote_path"]
    cfg_path = SCRIPT_DIR / f"{env}.cfg"

    if not cfg_path.exists():
        example = cfg_path.with_suffix(".cfg.example")
        hint = f"Copy {example.name} → {cfg_path.name} and fill in your values"
        _fail(f"Config: {env}.cfg", hint)
        return None

    cfg = load_config(cfg_path)
    missing = [k for k in required_keys if not cfg.get(k, "").strip()
               or cfg.get(k, "").startswith("000.")]
    if missing:
        _fail(f"Config: {env}.cfg keys", f"Missing or placeholder values for: {', '.join(missing)}")
    else:
        host = cfg.get("ssh_host", "")
        user = cfg.get("ssh_user", "")
        path = cfg.get("remote_path", "")
        _pass(f"Config: {env}.cfg", f"{user}@{host}:{path}")

    return cfg


def check_ssh_key(cfg: configparser.SectionProxy, env: str):
    """Check that the configured SSH key file exists and is loaded in the agent."""
    key_path = Path(os.path.expanduser(cfg.get("ssh_key", "~/.ssh/id_rsa")))

    if not key_path.exists():
        _fail(f"SSH key: {env}", f"Key file not found: {key_path}")
        return

    _pass(f"SSH key file: {env}", str(key_path))

    loaded = subprocess.run(["ssh-add", "-l"], capture_output=True, text=True)
    if str(key_path) in loaded.stdout or loaded.returncode == 0 and loaded.stdout.strip():
        _pass(f"SSH key loaded: {env}", "Key is available in ssh-agent")
    else:
        _warn(
            f"SSH key loaded: {env}",
            f"Key may not be in ssh-agent — run: ssh-add {key_path}"
            + (f"\n   (macOS tip: ssh-add --apple-use-keychain {key_path})" if sys.platform == "darwin" else ""),
        )


def check_ssh_connectivity(cfg: configparser.SectionProxy, env: str):
    """Attempt a lightweight SSH connection to verify reachability."""
    host = cfg.get("ssh_host", "")
    user = cfg.get("ssh_user", "")
    port = cfg.get("ssh_port", "22")
    key  = os.path.expanduser(cfg.get("ssh_key", "~/.ssh/id_rsa"))

    result = subprocess.run(
        [
            "ssh",
            "-p", port,
            "-i", key,
            "-o", "StrictHostKeyChecking=accept-new",
            "-o", "ConnectTimeout=8",
            "-o", "BatchMode=yes",
            f"{user}@{host}",
            "echo ok",
        ],
        capture_output=True, text=True,
    )
    if result.returncode == 0 and "ok" in result.stdout:
        _pass(f"SSH connect: {env}", f"{user}@{host}:{port}")
    else:
        detail = result.stderr.strip().splitlines()[0] if result.stderr.strip() else "Connection failed"
        _fail(f"SSH connect: {env}", detail)
        return False
    return True


def check_remote_path(cfg: configparser.SectionProxy, env: str):
    """Verify that the remote project root directory exists."""
    host        = cfg.get("ssh_host", "")
    user        = cfg.get("ssh_user", "")
    port        = cfg.get("ssh_port", "22")
    key         = os.path.expanduser(cfg.get("ssh_key", "~/.ssh/id_rsa"))
    remote_path = cfg.get("remote_path", "").rstrip("/")

    result = subprocess.run(
        [
            "ssh",
            "-p", port,
            "-i", key,
            "-o", "StrictHostKeyChecking=accept-new",
            "-o", "ConnectTimeout=8",
            "-o", "BatchMode=yes",
            f"{user}@{host}",
            f"test -d {remote_path} && echo exists || echo missing",
        ],
        capture_output=True, text=True,
    )
    if result.returncode == 0 and "exists" in result.stdout:
        _pass(f"Remote path: {env}", remote_path)
    else:
        _fail(f"Remote path: {env}", f"Directory not found or inaccessible: {remote_path}")


def check_local_backup():
    """Check whether a local SQL backup exists (needed for push-dev)."""
    backup = PROJECT_ROOT / "storage" / "backups" / "latest.sql"
    if backup.exists():
        size_mb = backup.stat().st_size / (1024 * 1024)
        _pass("Local backup: latest.sql", f"{size_mb:.1f} MB — ready for push-dev")
    else:
        _warn(
            "Local backup: latest.sql",
            "Not found — run 'npm run mm-pull' before pushing to dev",
        )


# ── Report ─────────────────────────────────────────────────────────────────────
def print_report():
    title  = " 🩺 Mighty Migration — Doctor Report "
    border = "─" * (len(title) + 2)
    print(f"\n{PURPLE}╭{border}╮{RESET}")
    print(f"{PURPLE}│{RESET}{WHITE}{title}{RESET}{PURPLE}│{RESET}")
    print(f"{PURPLE}╰{border}╯{RESET}\n")

    passes = warns = fails = 0
    for status, label, detail in _results:
        if status is True:
            icon = f"{GREEN}✔{RESET}"
            passes += 1
        elif status is None:
            icon = f"{YELLOW}⚠{RESET}"
            warns += 1
        else:
            icon = f"{RED}✖{RESET}"
            fails += 1

        print(f"  {icon}  {BOLD}{label}{RESET}")
        if detail:
            for line in detail.splitlines():
                print(f"      {DIM}{line}{RESET}")

    print()
    summary_color = GREEN if fails == 0 else RED
    warn_str = f"  {YELLOW}{warns} warning{'s' if warns != 1 else ''}{RESET}" if warns else ""
    fail_str = f"  {RED}{fails} failure{'s' if fails != 1 else ''}{RESET}" if fails else ""
    print(f"  {summary_color}{passes} passed{RESET}{warn_str}{fail_str}")
    print()

    return fails


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="🩺 Pre-flight diagnostics for Mighty Migration.",
        epilog=(
            "Examples:\n"
            "  python3 mm-doctor.py              # Check production + dev configs\n"
            "  python3 mm-doctor.py --env dev    # Check dev config only\n"
            "  python3 mm-doctor.py --skip-ssh   # Skip live SSH connectivity tests\n"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--env", default=None, metavar="ENV",
        help="Check a specific config only (e.g. production, dev). Defaults to all found configs.",
    )
    parser.add_argument(
        "--skip-ssh", action="store_true",
        help="Skip live SSH connectivity + remote path checks (faster, offline-safe).",
    )
    args = parser.parse_args()

    # Determine which envs to check
    if args.env:
        envs = [args.env]
    else:
        envs = [p.stem for p in SCRIPT_DIR.glob("*.cfg") if not p.name.endswith(".example")]
        if not envs:
            # Fall back to checking for the example files so we still report missing configs
            envs = [p.stem.replace(".cfg", "") for p in SCRIPT_DIR.glob("*.cfg.example")]

    # ── Tool checks ────────────────────────────────────────────────────────────
    check_tools()

    # ── DDEV ──────────────────────────────────────────────────────────────────
    check_ddev()

    # ── Local backup ──────────────────────────────────────────────────────────
    check_local_backup()

    # ── Per-environment checks ────────────────────────────────────────────────
    for env in sorted(envs):
        cfg = check_config(env)
        if cfg is None:
            continue

        check_ssh_key(cfg, env)

        if not args.skip_ssh:
            reachable = check_ssh_connectivity(cfg, env)
            if reachable:
                check_remote_path(cfg, env)
        else:
            _warn(f"SSH connect: {env}", "Skipped (--skip-ssh)")

    # ── Report ────────────────────────────────────────────────────────────────
    failures = print_report()
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
