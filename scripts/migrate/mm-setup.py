#!/usr/bin/env python3
"""
mm-setup.py — 🪄 Interactive setup wizard for Mighty Migration tooling.

Run from the project root:
    npm run mm-setup
"""

import json
import sys
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
PKG_JSON     = PROJECT_ROOT / "package.json"

# ── ANSI helpers ───────────────────────────────────────────────────────────────
CYAN   = "\033[1;36m"
BOLD   = "\033[1m"
DIM    = "\033[90m"
RESET  = "\033[0m"
GREEN  = "\033[1;32m"
YELLOW = "\033[1;33m"
PURPLE = "\033[1;35m"
RED    = "\033[1;31m"
WHITE  = "\033[1;97m"

def header():
    title  = " 🧙🏼‍♀️ Mighty Migration — Setup Wizard"
    border = "─" * (len(title) + 2)
    print(f"\n{PURPLE}╭{border}╮{RESET}")
    print(f"{PURPLE}│{RESET}{WHITE}{title}{RESET}{PURPLE}│{RESET}")
    print(f"{PURPLE}╰{border}╯{RESET}\n")

def section(msg: str):
    print(f"\n{CYAN}{msg}{RESET}")
    print(f"{DIM}{'─' * (len(msg))}{RESET}")

def success(msg: str):
    print(f"{GREEN}  ✔ {msg}{RESET}")

def warn(msg: str):
    print(f"{YELLOW}  ⚠  {msg}{RESET}")

def info(msg: str):
    print(f"{DIM}  {msg}{RESET}")

def prompt(label: str, default: str = "", required: bool = True) -> str:
    """Prompt the user for input, showing the default in brackets."""
    default_hint = f" {DIM}[{default}]{RESET}" if default else ""
    while True:
        try:
            raw = input(f"  {BOLD}{label}{RESET}{default_hint}: ").strip()
        except (KeyboardInterrupt, EOFError):
            print(f"\n\n{RED}  Setup cancelled.{RESET}\n")
            sys.exit(0)
        value = raw or default
        if value or not required:
            return value
        warn("This field is required.")

def confirm(label: str, default: bool = True) -> bool:
    hint = "Y/n" if default else "y/N"
    try:
        raw = input(f"  {BOLD}{label}{RESET} {DIM}[{hint}]{RESET}: ").strip().lower()
    except (KeyboardInterrupt, EOFError):
        print(f"\n\n{RED}  Setup cancelled.{RESET}\n")
        sys.exit(0)
    if not raw:
        return default
    return raw in ("y", "yes")

# ── Config writer ──────────────────────────────────────────────────────────────
def collect_ssh_config(env_label: str) -> dict:
    """Ask for SSH + path config values and return as a dict."""
    print()
    info(f"Enter the {env_label} server connection details.")
    info("Press Enter to accept the default shown in [brackets].\n")
    return {
        "SSH_HOST": prompt("SSH host (IP or hostname)", required=True),
        "SSH_USER": prompt("SSH user", default="master"),
        "SSH_PORT": prompt("SSH port", default="22"),
        "SSH_KEY":  prompt("Path to SSH private key", default="~/.ssh/id_rsa"),
        "REMOTE_PATH": prompt(
            "Absolute path to project root on server",
            required=True,
        ),
        "ASSET_DIRS": prompt("Asset directories to sync (space-separated)", default="web/uploads"),
    }

def write_cfg(cfg_path: Path, values: dict, example_path: Path):
    """Write key=value pairs to a .cfg file with comments matching the example format."""
    lines = []
    comments = {
        "SSH_HOST":     "# Remote server SSH connection",
        "REMOTE_PATH":  "# Remote Craft project root (absolute path on the server)\n# e.g. /home/master/applications/[APP_DIR]/public_html",
        "ASSET_DIRS":   "# Asset directories to sync (space-separated, relative to project root)",
    }
    prev_block = None
    for key, val in values.items():
        block = comments.get(key)
        if block and block != prev_block:
            if lines:
                lines.append("")
            lines.append(block)
            prev_block = block
        lines.append(f"{key}={val}")
    lines.append("")  # trailing newline
    cfg_path.write_text("\n".join(lines))

def handle_cfg(env: str, filename: str, env_label: str) -> bool:
    """Guide the user through setting up one .cfg file. Returns True if configured."""
    cfg_path     = SCRIPT_DIR / filename
    example_path = SCRIPT_DIR / f"{filename}.example"

    if cfg_path.exists():
        warn(f"{filename} already exists.")
        if not confirm(f"Overwrite {filename}?", default=False):
            info(f"Keeping existing {filename}.")
            return True  # already configured
        print()

    values = collect_ssh_config(env_label)

    # Preview
    section(f"Preview — {filename}")
    for k, v in values.items():
        print(f"  {DIM}{k}{RESET}={GREEN}{v}{RESET}")

    print()
    if not confirm("Write this config?", default=True):
        info(f"Skipped writing {filename}.")
        return False

    write_cfg(cfg_path, values, example_path)
    success(f"Written → scripts/migrate/{filename}")
    return True

# ── package.json ───────────────────────────────────────────────────────────────
MM_SCRIPTS = {
    "mm":               "python3 scripts/migrate/mm-help.py",
    "mm-help":          "python3 scripts/migrate/mm-help.py",
    "mm-pull":          "python3 scripts/migrate/pull-remote.py",
    "mm-pull:assets":   "python3 scripts/migrate/pull-remote.py --assets-only",
    "mm-pull:all":      "python3 scripts/migrate/pull-remote.py --with-assets",
    "mm-push:dev":      "python3 scripts/migrate/push-dev.py",
    "mm-push:dev:assets": "python3 scripts/migrate/push-dev.py --assets-only",
    "mm-push:dev:all":  "python3 scripts/migrate/push-dev.py --with-assets",
    "mm-setup":         "python3 scripts/migrate/mm-setup.py",
}

def handle_package_json() -> bool:
    """Offer to merge mm-* scripts into package.json. Returns True if updated."""
    if not PKG_JSON.exists():
        warn("package.json not found at project root — skipping.")
        return False

    try:
        raw  = PKG_JSON.read_text(encoding="utf-8")
        data = json.loads(raw)
    except (json.JSONDecodeError, OSError) as e:
        warn(f"Could not read package.json: {e}")
        return False

    scripts  = data.setdefault("scripts", {})
    existing = {k for k in MM_SCRIPTS if k in scripts}
    new_keys = {k for k in MM_SCRIPTS if k not in scripts}

    if not new_keys:
        info("All mm-* scripts are already present in package.json.")
        return False

    section("package.json — Scripts to add")
    for k in sorted(new_keys):
        print(f"  {DIM}{k:<26}{RESET}  {GREEN}{MM_SCRIPTS[k]}{RESET}")

    if existing:
        print()
        info(f"Already present (will not be changed): {', '.join(sorted(existing))}")

    print()
    if not confirm("Add these scripts to package.json?", default=True):
        info("Skipped updating package.json.")
        return False

    for k in new_keys:
        scripts[k] = MM_SCRIPTS[k]

    # Write back with 2-space indent, preserving a trailing newline
    updated = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    PKG_JSON.write_text(updated, encoding="utf-8")
    success("package.json updated.")
    return True

# ── SSH key reminder ───────────────────────────────────────────────────────────
def ssh_key_reminder():
    box_lines = [
        "  Before running any mm- commands, make sure your public   ",
        "  SSH key is added to the server application (e.g. in the  ",
        "  Cloudways SSH Keys panel or your hosting provider's       ",
        "  equivalent). Without this step, all remote commands will  ",
        "  fail with a 'Permission denied' error.                    ",
        "                                                             ",
        "  To copy your public key, run:                             ",
        "    cat ~/.ssh/id_rsa.pub                                   ",
        "                                                             ",
        "  Then paste it into the server's Authorized Keys section.  ",
    ]
    width  = max(len(l) for l in box_lines) + 2
    border = "─" * width
    print(f"\n{YELLOW}╭{border}╮{RESET}")
    print(f"{YELLOW}│{RESET}{BOLD}  🔑  SSH Key Reminder{RESET}{' ' * (width - 22)}{YELLOW}│{RESET}")
    print(f"{YELLOW}├{border}┤{RESET}")
    for line in box_lines:
        pad = width - len(line)
        print(f"{YELLOW}│{RESET}{line}{' ' * pad}{YELLOW}│{RESET}")
    print(f"{YELLOW}╰{border}╯{RESET}\n")

# ── Help ──────────────────────────────────────────────────────────────────────
def print_help():
    header()
    print(f"{BOLD}  Interactive setup wizard for Mighty Migration.{RESET}")
    print(f"{DIM}  Configures SSH connection details and writes .cfg files for each environment.{RESET}\n")

    print(f"{CYAN}Usage{RESET}")
    print(f"{DIM}  ────────────────────────────────────────────────────────{RESET}")
    rows = [
        ("python3 scripts/migrate/mm-setup.py",        "Run the wizard (first-time setup)"),
        ("npm run mm-setup",                           "Re-run the wizard via npm alias"),
        ("python3 scripts/migrate/mm-setup.py --help", "Show this help"),
    ]
    for cmd, desc in rows:
        print(f"  {GREEN}{cmd:<48}{RESET}  {DIM}{desc}{RESET}")

    print(f"\n{CYAN}What it does{RESET}")
    print(f"{DIM}  ────────────────────────────────────────────────────────{RESET}")
    steps = [
        "Prompts for SSH host, user, port, key, and remote path",
        "Writes production.cfg and/or dev.cfg in scripts/migrate/",
        "Offers to add mm-* shortcut scripts to your package.json",
        "Reminds you to add your SSH public key to the server",
    ]
    for s in steps:
        print(f"  {DIM}•{RESET}  {s}")

    print(f"\n{CYAN}Config files{RESET}")
    print(f"{DIM}  ────────────────────────────────────────────────────────{RESET}")
    print(f"  {DIM}production.cfg{RESET}   Used by mm-pull commands (pull from production)")
    print(f"  {DIM}dev.cfg{RESET}          Used by mm-push:dev commands (push to dev server)")
    print(f"  {DIM}*.cfg.example{RESET}    Templates — copy and fill in manually if preferred")
    print(f"\n  {YELLOW}⚠  .cfg files are gitignored — never committed to source control.{RESET}\n")


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        print_help()
        sys.exit(0)

    header()

    # ── Early detection: mm-* scripts already in package.json ─────────────────
    if PKG_JSON.exists():
        try:
            data = json.loads(PKG_JSON.read_text(encoding="utf-8"))
            if "mm-setup" in data.get("scripts", {}):
                print(f"{CYAN}  ℹ  mm-* scripts are already in your package.json.{RESET}")
                print(f"{DIM}     You can run {RESET}{GREEN}npm run mm-setup{RESET}{DIM} next time instead.{RESET}\n")
                if not confirm("Continue with setup wizard anyway?", default=True):
                    print(f"\n{DIM}  Tip: run {RESET}{GREEN}npm run mm-setup{RESET}{DIM} to launch the wizard.{RESET}\n")
                    sys.exit(0)
                print()
        except (json.JSONDecodeError, OSError):
            pass

    print(f"{BOLD}  This wizard will help you configure Mighty Migration for this project.{RESET}")
    print(f"{DIM}  Config files are gitignored — they will never be committed.\n{RESET}")

    # ── Production config ──────────────────────────────────────────────────────
    section("1 · Production config  (pull-remote.py)")
    print(f"  {DIM}Used by: npm run mm-pull, mm-pull:assets, mm-pull:all{RESET}\n")
    setup_prod = confirm("Set up production.cfg?", default=True)
    prod_done  = handle_cfg("production", "production.cfg", "production") if setup_prod else False
    if not setup_prod:
        info("Skipped production.cfg.")

    # ── Dev server config ──────────────────────────────────────────────────────
    section("2 · Dev server config  (push-dev.py)")
    print(f"  {DIM}Used by: npm run mm-push:dev, mm-push:dev:assets, mm-push:dev:all{RESET}\n")
    setup_dev = confirm("Set up dev.cfg?", default=True)
    dev_done  = handle_cfg("dev", "dev.cfg", "dev server") if setup_dev else False
    if not setup_dev:
        info("Skipped dev.cfg.")

    # ── package.json ───────────────────────────────────────────────────────────
    section("3 · package.json scripts")
    pkg_done = handle_package_json()

    # ── SSH key reminder ───────────────────────────────────────────────────────
    if prod_done or dev_done:
        ssh_key_reminder()

    # ── Summary ────────────────────────────────────────────────────────────────
    section("Setup complete")
    if prod_done:
        success("production.cfg configured")
    if dev_done:
        success("dev.cfg configured")
    if pkg_done:
        success("package.json updated with mm-* scripts")
    if not any([prod_done, dev_done, pkg_done]):
        info("Nothing was changed.")
    else:
        print(f"\n  {DIM}Run {RESET}{GREEN}npm run mm{RESET}{DIM} to see all available commands.{RESET}\n")


if __name__ == "__main__":
    main()
