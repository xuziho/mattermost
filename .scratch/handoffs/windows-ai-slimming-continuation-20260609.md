# Mattermost Slimming Continuation Guide For Windows AI

Created: 2026-06-09

## Goal

Continue the Mattermost fork slimming branch as a side experiment on a stronger Windows machine, preferably inside WSL2 Ubuntu or a Linux Docker environment.

The objective is to turn the parked brutal slimming checkpoint into a buildable, runnable, browser-verified lightweight Mattermost frontend/image for AgentCompanyOS.

## Repository

- GitHub: https://github.com/xuziho/mattermost
- Branch: `codex/brutal-slimming-20260606`
- Local source on mini host: `/home/xu/CodeXProject/mattermost-thread-room-fork`

Clone on the Windows machine:

```bash
git clone https://github.com/xuziho/mattermost.git
cd mattermost
git checkout codex/brutal-slimming-20260606
```

Recommended runtime on Windows:

- WSL2 Ubuntu for source work and builds.
- Docker Desktop with WSL integration enabled.
- Avoid native Windows shell builds unless the repo documentation proves they work, because this fork expects Linux-like paths and scripts.

## Important Context

This branch is a source checkpoint only. It has not replaced the live mini-host deployment.

The active mini-host service was still the existing Docker container:

- container: `docker-mattermost-1`
- image family: `mattermost/agentcompanyos-thread-room:11.7.2-local`
- live public domain observed: `agentco.aiziho.click`

Do not assume this branch is production-ready. Treat it as a rebuild-and-verify branch.

## Previous Slimming Progress

See:

- `BRUTAL_SLIMMING_CHECKPOINT_20260606.md`
- `.scratch/handoffs/mattermost-slimming-handoff-20260606-101330.md`

At checkpoint time, the branch had:

- 1327 files changed.
- 646 files deleted.
- About 140715 deleted lines.
- A large cut of Cloud, billing, trial, marketplace, onboarding, product notices, notify-admin, hosted-customer, product-switcher/product framework, and some Calls surfaces.

Verification that had passed:

- `git diff --check`
- `webapp/platform/types`: `tsc -b --pretty false`
- several narrow Go compile sentinels
- targeted Jest updates/tests for specific Cloud prop removal
- targeted residual scans for major Cloud/product terms

Not yet proven:

- `webapp/channels` full TypeScript check.
- production webpack build.
- replacement Docker image.
- browser smoke test.

## Recent Branding And Loading Work

After the checkpoint, additional source changes were made on the mini host to replace visible Mattermost startup/brand assets:

- lightweight initial loading screen
- shorter minimum loading delay
- AgentCompanyOS root title/manifest text
- AgentCompanyOS SVG logo
- replacement favicon PNGs
- header/footer route brand text changes

There was also a live-container hotpatch on the mini host to bypass Cloudflare caching for old JS chunk names. That hotpatch is not the durable path. The durable path is to rebuild from source on this branch and produce fresh hashed assets or a new image.

## Current Performance Findings

The live production frontend had two main loading contributors:

1. Initial JS/CSS resources.
   - The entry `main` pulled 16 initial chunks.
   - Local uncompressed initial JS/CSS was about 6.35 MB.
   - Large chunks included roughly 2.15 MB, 1.72 MB, 1.21 MB, and 0.61 MB assets.
   - Source maps showed likely slimming targets: repeated crypto/browser polyfills, full emoji index, moment locales, Compass icon index, tippy, CSS variable compatibility code.

2. Data initialization.
   - The centered channel loading screen is gated by `initialChannelsLoaded && teamLoaded`.
   - Source path: `webapp/channels/src/components/team_controller/team_controller.tsx`
   - It waits for team and channel loading before rendering the center channel.
   - Startup logs showed many API calls: config, license, users/me, preferences, teams, channel members, categories, threads, drafts, stats, agents status, trial license, plugins webapp.

This means pure UI hiding is not enough. Good slimming should remove or defer code and startup calls that are actually in the first load path.

## Recommended Continuation Plan

Phase 1: revive the checkpoint.

1. Start from a clean clone of `codex/brutal-slimming-20260606`.
2. Run:

```bash
git status --short
git diff --check
```

3. Re-run the previously passing narrow checks first.
4. Focus on `webapp/channels` type/build blockers before deleting more features.
5. Do not run broad full-suite tests first; use split verification to avoid losing hours.

Phase 2: produce a runnable artifact.

1. Get `webapp/channels` TypeScript or targeted type checks to a known state.
2. Run the production webapp build.
3. Build or assemble a Docker image/static client bundle.
4. Start a local test Mattermost instance.
5. Browser smoke test:
   - login
   - open team/channel
   - send message
   - receive/reload message
   - direct message
   - thread/reply
   - search

Phase 3: first-load performance slimming.

Only after build works, target first-load evidence:

- remove/defer trial/license upsell calls
- remove/defer analytics and user stats
- remove/defer agents status if the plugin is absent
- remove/defer drafts/threads prefetch if not needed on first paint
- reduce emoji payload
- reduce moment locales
- avoid importing whole icon indexes
- remove old browser compatibility/polyfills if target browsers allow it

Measure before and after:

- initial JS/CSS bytes
- number of startup API calls
- time spent on centered channel loading screen
- browser smoke test pass/fail

## What Not To Do

- Do not continue broad aggressive deletion before making the checkpoint buildable.
- Do not treat mini-host live hotpatches as source of truth.
- Do not overwrite the mini-host production deployment from this branch until the branch has a browser-verified build artifact.
- Do not run destructive git commands such as `git reset --hard` unless the human explicitly asks.
- Do not remove license/NOTICE files casually.

## Suggested Handoff Prompt For The Next AI

Use this prompt in the Windows AI session:

```text
You are continuing the Mattermost fork slimming side branch.

Clone https://github.com/xuziho/mattermost, checkout branch codex/brutal-slimming-20260606, then read:
- BRUTAL_SLIMMING_CHECKPOINT_20260606.md
- .scratch/handoffs/mattermost-slimming-handoff-20260606-101330.md
- .scratch/handoffs/windows-ai-slimming-continuation-20260609.md

Goal: revive the brutal slimming checkpoint into a buildable, runnable, browser-smoke-tested lightweight Mattermost frontend/image. Do not keep deleting features until the current checkpoint build state is understood.

First actions:
1. report git status and environment
2. run git diff --check
3. run the previously documented narrow verification checks
4. localize webapp/channels type/build blockers
5. only then attempt production webapp build

Success means: a built artifact or Docker image can launch, open a team/channel, send/receive messages, use DMs, threads, and search, with before/after first-load measurements.
```

