# Crewlight Project Brief

## Naming

- Display name: `Crewlight`
- Repository slug: `Crewlight`
- Repository URL: `https://github.com/QianQIUlp/Crewlight`
- Latest public release: `v0.5.0` (Windows-first candidate prerelease, 2026-08-28)
- Previous release: `v0.4.0` (archived prototype, 2026-06-23)

## Current Status

Crewlight is a local activity radar for AI coding agents. `v0.5.0` is published as a Windows-first candidate prerelease.

Windows x64 is the planned Supported platform. Its artifacts are unsigned and include the Desktop portable ZIP, NSIS installer, and standalone CLI ZIP. The frozen portable artifact completed local acceptance on a tested Windows Server 2025 host: normal launch, local service start/stop, Codex-shaped event ingestion, onboarding, demo state, read-only integration inspection, companion view, and raw-work-content exclusion all passed. The NSIS installer's graphical install path was not manually accepted in this candidate.

Linux and macOS remain source-validation targets and publish no native v0.5 binaries. Remote remains Beta.

## Confirmed Facts

- Crewlight is local-first and read-only with respect to agent control.
- It gathers running, waiting, permission-request, completed, and failed states from concurrent AI coding work without retaining prompts, transcripts, tool I/O, or complete platform payloads.
- Current sessions can be organized in Desktop, floating Companion, browser Dashboard, and CLI surfaces.
- The default network boundary is the local loopback; it does not depend on a cloud service, control agents, or automatically approve permissions.
- Explicit safety boundaries cover event size, timeouts, duplicate notifications, malformed input, SSH host verification, and notifier failures.
- Sessions remain in memory only, retaining at most the latest 1,000 by default; stable events are exactly deduplicated during their retention period.
- Formal integrations are Claude Code and Codex Hooks, both requiring a manual snippet merge. Crewlight inspects these configuration files read-only and never writes them.
- Prompt Preview is off by default.
- All v0.5.0 release artifacts are unsigned.
- The single Attention Engine priority order is `needs_action > error > stale > active > ready > hidden`. A `completed` turn means "ready for review," not that an entire task is finished.

## Portfolio Positioning

Present Crewlight as a local-first activity radar for developers running parallel AI coding agents. Its read-only Desktop, Companion, Dashboard, and CLI surfaces help show which task is running, waiting, requesting permission, complete, or failed without exposing complete work contents.

Do not present it as a cloud observability service, agent orchestrator, permission approver, transcript archive, complete cross-platform release, or production-ready product.

## Display Copy Guidance

- Use the visible status `v0.5.0 已发布 / Windows 优先候选版本` ("v0.5.0 released / Windows-first candidate") and the subtitle `本地优先的 AI Agent 活动雷达` ("local-first AI agent activity radar").
- State that Windows x64 is the planned Supported platform and that its artifacts are unsigned.
- Keep the platform boundary explicit: Linux and macOS publish no native v0.5 binaries and remain source-validation targets; Remote remains Beta.
- Name the NSIS graphical install path as unverified rather than implying the installer was fully accepted.
- Limit visible project actions to the repository, Chinese README, and the real `v0.5.0` Release URL. Never invent a download link for an unshipped platform.
- Use `summary`, `positioning`, `caseStudy`, `highlights`, and `limitations` from `src/data/projects.ts` for the visible page copy.

## Links

- Repository: `https://github.com/QianQIUlp/Crewlight`
- Chinese README: `https://github.com/QianQIUlp/Crewlight/blob/main/README.zh-CN.md`
- Latest public release (`v0.5.0`): `https://github.com/QianQIUlp/Crewlight/releases/tag/v0.5.0`
