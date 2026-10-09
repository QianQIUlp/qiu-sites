# VeriSilo Project Brief

Use this source when updating the personal site. VeriSilo is the current focus
project and the first entry in the Room project archive.

## Naming

- Display name: `VeriSilo`
- Repository slug: `VeriSilo`
- Repository URL: <https://github.com/QianQIUlp/VeriSilo>
- Product site: <https://verisilo.qiu.works>
- Current public prerelease: `v0.1.0-rc4` (2026-09-16)

## Current Status

VeriSilo is a Windows-first, open-source browser environment isolation and
privacy-auditing platform for Chrome and Edge. `v0.1.0-rc4` is published as a
public prerelease with a downloadable Windows x64 installer.

The installer is **not** signed on the outer Desktop/NSIS Authenticode layer.
The bundled Managed engine package is CMS signed and verified against a pinned
signer before launch. Windows may show an `Unknown publisher` or SmartScreen
prompt. Strict unelevated standard-user install, reinstall and uninstall
semantics remain unproven.

The release owner manually approved rc4. Commercial User Journey QA passed, but
the final exact-candidate automated installed smoke test was inconclusive
because the acceptance harness failed during Vault bootstrap/timing. No product
failure was observed in those attempts. This must not be rewritten as a passed
automated acceptance test.

## Confirmed Facts

- The README defines VeriSilo as a Windows-first, open-source Chrome and Edge
  browser environment isolation and privacy-auditing platform.
- Each Silo uses a separate, managed browser data directory. VeriSilo does not
  import, copy or modify the user's default browser Profile.
- The desktop application is the isolation core; the Companion extension only
  handles browser-context observation, verification and explanation, triggered
  by explicit user action.
- A local encrypted vault protects VeriSilo metadata and seeds. It does not
  claim to encrypt the entire Profile managed by Chrome or Edge itself.
- The project explicitly excludes device impersonation, fraud bypass, TLS/QUIC
  modification, hardware isolation and universal Worker fingerprint
  modification.
- `v0.1.0-rc4` ships a Windows x64 installer, `SHA256SUMS`, CycloneDX and SPDX
  SBOMs, provenance, dependency inventories, third-party notices and a Windows
  acceptance report.
- The product site additionally offers an interactive sample workspace that runs
  real interface components against simulated APIs and never touches the local
  machine, Vault or network exit.

## Portfolio Positioning

Present VeriSilo as browser-state separation with visible boundaries: the project
separates what a browser owns, distinguishes reliable control from best-effort
observation and unavailable capabilities, and states plainly what it does not
do.

Do not present it as an anti-detect browser, an anonymity guarantee, a device
impersonation tool, or a production-stable release. Do not describe the rc4
installer as signed.

## Display Copy Guidance

- Use the visible status `公开预发布 · v0.1.0-rc4` ("public prerelease · v0.1.0-rc4") and the subtitle
  `浏览器环境隔离与隐私审计平台` ("browser environment isolation and privacy-auditing platform").
- State that a Windows x64 installer is downloadable and that it is unsigned,
  without implying the release is stable.
- Keep the platform scope explicit: Windows-first, Chrome and Edge.
- Name the unproven standard-user install semantics rather than omitting them.
- Limit visible project actions to the product site, the repository, the real
  `v0.1.0-rc4` Release URL, and the product-scope document.
- Use `summary`, `positioning`, `caseStudy`, `highlights` and `limitations` from
  `src/data/projects.ts` for the visible page copy.

## Links

- Product site: <https://verisilo.qiu.works>
- Repository: <https://github.com/QianQIUlp/VeriSilo>
- Public prerelease (`v0.1.0-rc4`): <https://github.com/QianQIUlp/VeriSilo/releases/tag/v0.1.0-rc4>
- Product scope: <https://github.com/QianQIUlp/VeriSilo/blob/main/docs/product-scope.md>
- Threat model: <https://github.com/QianQIUlp/VeriSilo/blob/main/docs/threat-model.md>
- Capabilities: <https://github.com/QianQIUlp/VeriSilo/blob/main/docs/capabilities.md>
