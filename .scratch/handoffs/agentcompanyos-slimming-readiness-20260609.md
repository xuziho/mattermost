# AgentCompanyOS Mattermost Slimming Readiness - 2026-06-09

## Product Boundary

This fork is not intended to preserve full Mattermost. It is the lightweight collaboration frontend for AgentCompanyOS.

Must keep:

- Login.
- Teams and channels.
- Sending and receiving messages.
- Direct messages.
- Thread replies.
- Search.
- File upload.
- Basic user and member management.
- Mattermost APIs required by AgentCompanyOS.

Can delete:

- Cloud, Billing, Trial, Marketplace.
- Official help and documentation links.
- Product switcher and product-suite framework.
- Official onboarding, tours, and feature discovery.
- Playbooks, Boards, Calls.
- Enterprise upsell surfaces.
- Unused plugin entry points.
- Mobile and desktop client download pages.
- Official Mattermost brand assets.

## Current Baseline

Branch: `codex/brutal-slimming-20260606`

Remote checkpoint before this preparation:

- `7e8b098525 Add Mattermost slimming continuation handoff`

The previous Windows-native build path is intentionally avoided. Use WSL2/Linux paths, not `D:\...`, for build work.

Known good WSL source path:

```bash
cd /home/ziho/CodeXProject/mattermost-slimming-windows
source tools/agentcompanyos-slimming-env.sh
```

## Prepared Tooling

User-local WSL tooling:

- Node: installed through nvm, default `24.11` -> `v24.11.1`.
- npm: Node-bundled npm 11.x.
- Go: installed at `~/sdk/go1.25.10`, matching `server/go.mod`.
- Environment helper: `tools/agentcompanyos-slimming-env.sh`.

Docker is still an external dependency. It requires Docker Desktop WSL integration or a working Docker daemon visible from WSL.

Readiness check:

```bash
source tools/agentcompanyos-slimming-env.sh
tools/agentcompanyos-slimming-env.sh --check
docker ps
```

`docker ps` must succeed before image build or browser-runtime smoke testing.

## Verified Frontend Baseline

The current slimmed frontend baseline is expected to pass:

```bash
git diff --check

cd webapp/platform/types
../../node_modules/.bin/tsc -b --pretty false

cd ../../channels
npm run check-types -- --pretty false
npm run build
```

If `node_modules` is missing:

```bash
cd webapp
npm ci
```

Do not run native Windows `npm ci` in this repo path; Parcel can mis-handle absolute paths when the Windows path contains spaces.

## Verified Backend Compile Baseline

Go is available through the environment helper and matches `server/go.mod`.

Compile-only sentinels:

```bash
source tools/agentcompanyos-slimming-env.sh
cd server
go test -c ./channels/app -o /tmp/mm-channels-app.test && rm -f /tmp/mm-channels-app.test
go test -c ./channels/api4 -o /tmp/mm-channels-api4.test && rm -f /tmp/mm-channels-api4.test
go test -c ./cmd/mmctl/commands -o /tmp/mm-mmctl-commands.test && rm -f /tmp/mm-mmctl-commands.test
go test -c ./config -o /tmp/mm-config.test && rm -f /tmp/mm-config.test
go test -c ./enterprise/metrics -o /tmp/mm-enterprise-metrics.test && rm -f /tmp/mm-enterprise-metrics.test
go test -c ./platform/shared/filestore -o /tmp/mm-filestore.test && rm -f /tmp/mm-filestore.test
```

`go test ./channels/app ./channels/api4 ./config ./enterprise/metrics -run TestDoesNotExist` currently requires a local Postgres service because package test setup creates temporary databases on `127.0.0.1:5432`. Treat Postgres as part of the runtime/test-environment gate, not as a compile gate.

## Next Phase Gate

Only start deleting more feature families after:

- Current preparation commit is clean.
- The WSL frontend checks above pass.
- Docker daemon availability is confirmed, or Docker-dependent work is explicitly deferred.

Recommended next feature-family cuts:

- Playbooks final audit.
- Boards final audit.
- Remaining official docs links outside Integrations.
- First-load API/code slimming, after local runtime smoke test is available.

## Smoke Test Target

Before replacing any live service, build a local artifact or image and verify:

- Login.
- Open team and channel.
- Send a message.
- Receive/reload message.
- Direct message.
- Thread reply.
- Search.
- File upload.
- Basic user/member management.

Do not overwrite the mini-host production deployment from this branch until those browser checks pass.
