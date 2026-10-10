# Workspace Migration Notes

`scripts/bootstrap-qiu-workspace.sh` restores the three public repositories in the current
`~/src` workspace on a new Linux or macOS machine, along with the development environments that can be rebuilt from their lock files.

## One-command restore

Copy the script to the new machine and read it first, then run:

```bash
chmod +x bootstrap-qiu-workspace.sh
WORKSPACE_ROOT="$HOME/src" ./bootstrap-qiu-workspace.sh
```

By default the script restores each repository's `main` branch. Before the current site pull request is merged, reproduce this branch with:

```bash
QIU_SITE_REF=codex/immersive-home-hotspots \
  WORKSPACE_ROOT="$HOME/src" \
  ./bootstrap-qiu-workspace.sh
```

After dependencies are restored, run it again with `RUN_CHECKS=1` to execute each of the three repositories' builds, type checks
and tests. This switch faithfully reports each upstream repository's current test status; test failures are not ignored.

The script will:

- install `mise 2026.7.7` and `uv 0.8.22` as the current regular user, without calling `sudo`;
- use `mise` to provide an isolated `Node 22.23.1`, restoring the site's npm dependencies and Crewlight's
  pnpm dependencies;
- use `uv` to create MealCircuit's own `.venv`, restoring all optional features and
  development tools from `uv.lock`;
- clone the public repositories over HTTPS, without relying on the old machine's SSH private keys;
- stop when a target directory has uncommitted changes, never overwriting existing work.

The new machine must already have Git, curl, CA certificates and tar. When the script detects something missing it only reports it and does not
call `sudo` itself. If a system administrator install is needed, review the install commands appropriate for the new machine's distribution first.

## What cannot safely go in the script

The following are bound to accounts, machines or operating systems, so they are explicitly excluded from the migration script:

- `.env`, API keys, GitHub tokens, SSH/GPG keys;
- Codex login sessions, plugin caches and browser login data;
- `node_modules`, `.venv`, Astro build directories and Playwright/Chromium caches;
- MealCircuit's real user data;
- Crewlight's Windows Electron installer and signing material;
- the MealCircuit sync server's database, PostgreSQL password and HTTPS configuration.

None of these can be safely solved by "copying the whole home directory". Dependencies and browser binaries should be re-downloaded on the target platform;
credentials should be re-entered from a password manager; the Windows desktop package should be rebuilt in a Windows build environment.

## MealCircuit data migration

Create an encrypted backup in the MealCircuit repository on the old machine:

```bash
cd "$HOME/src/meal-circuit"
uv run python -m mealcircuit.agent_cli export-data --output mealcircuit-backup.mcx
```

Copy `mealcircuit-backup.mcx` to the new machine over a trusted channel. Preview first, then explicitly apply the restore:

```bash
cd "$HOME/src/meal-circuit"
uv run python -m mealcircuit.agent_cli import-data /path/to/mealcircuit-backup.mcx --preview --mode restore
uv run python -m mealcircuit.agent_cli import-data /path/to/mealcircuit-backup.mcx --mode restore --apply
```

If an AI provider is configured, create `.env` from `.env.example` on the new machine, then fill in
new or existing API keys from the password manager; never commit `.env` to Git.

## Browser plugin and visual testing

The Browser/Codex plugin is a user-level tool and does not belong to any project repository. Reinstall it from the plugin directory in Codex
on the new machine; the first time you run frontend browser tests, the plugin downloads a browser matching the target operating system.
Do not copy the old machine's `~/.codex` or browser profile, which may contain tokens, cookies
and private sessions.

## MealCircuit sync server

The current machine has no Docker installed and no sync database running, so the script does not fabricate that deployment state.
If the new machine needs the sync service, install Docker separately, then use
`meal-circuit/sync_server/compose.yaml` to create a separate PostgreSQL password and domain configuration; database
contents must be migrated with a database backup, not by copying the project directory.
