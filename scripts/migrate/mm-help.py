#!/usr/bin/env python3
"""`mm` — Mighty Migration command reference."""

COMMANDS = [
    ("Setup", [
        ("mm-setup",               "Interactive setup wizard — configure .cfg files and package.json scripts"),
        ("mm-doctor",              "Pre-flight diagnostics — verify SSH, DDEV, configs, and remote paths"),
    ]),
    ("Help / List Commands", [
        ("'mm'",                   "List Mighty Migration commands (usage: `npm run [command]`)"),
    ]),
    ("Pull (Production → Local)", [
        ("mm-pull",              "Pull DB from production, import locally, run `composer install` + `craft up`"),
        ("mm-pull:assets",       "Sync assets only (images by default)"),
        ("mm-pull:all",          "Pull DB + assets"),
    ]),
    ("Push (Local → Dev Server)", [
        ("mm-push:dev",          "Push local DB to dev server, run craft up"),
        ("mm-push:dev:assets",   "Push assets only (images by default)"),
        ("mm-push:dev:all",      "Push DB + assets to dev"),
    ]),
    ("Asset flags (append after --)", [
        ("--filter images",                "Sync image files only (default)"),
        ("--filter pdfs",                  "Sync PDF files only"),
        ("--filter all",                   "Sync all file types"),
        ("--subdir generalImages",         "Sync only a specific subdirectory within web/uploads"),
    ]),
    ("Other flags", [
        ("--dry-run",                      "Preview DB push/pull without making any changes"),
        ("--skip-craft",                   "Skip 'composer install' + 'craft up' after DB import"),
        ("--env dev",                      "Pull from dev server instead of production (pull only)"),
    ]),
]

EXAMPLES = [
    ("First-time project setup",            "npm run mm-setup"),
    ("Pull DB only",                        "npm run mm-pull"),
    ("Pull images from a specific folder",  "npm run mm-pull:assets -- --subdir generalImages"),
    ("Pull all assets",                     "npm run mm-pull:assets -- --filter all"),
    ("Push DB + all assets to dev",         "npm run mm-push:dev:all -- --filter all"),
]

W = 42  # column width for command

def main():
    cyan  = "\033[1;36m"
    bold  = "\033[1m"
    dim   = "\033[90m"
    reset = "\033[0m"
    green = "\033[1;32m"

    title  = " ✨  Mighty Migration v1.1.0  ✨ "
    border = "─" * (len(title) + 2)
    print(f"\n\033[1;35m╭{border}╮\033[0m")
    print(f"\033[1;35m│\033[0m\033[1;97m{title}\033[0m\033[1;35m│\033[0m")
    print(f"\033[1;35m╰{border}╯\033[0m\n")

    for section, cmds in COMMANDS:
        print(f"{cyan}{section}{reset}")
        for cmd, desc in cmds:
            print(f"  {bold}{cmd:<{W}}{reset}  {desc}")
        print()

    print(f"{cyan}Examples{reset}")
    for desc, cmd in EXAMPLES:
        print(f"  {dim}{desc}{reset}")
        print(f"    {green}{cmd}{reset}")
    print()

if __name__ == "__main__":
    main()
