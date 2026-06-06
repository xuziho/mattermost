# Brutal Slimming Checkpoint - 2026-06-06

This branch is a parked checkpoint for the aggressive Mattermost slimming pass.

## Branch

- `codex/brutal-slimming-20260606`

## Runtime Status

- This checkpoint is not the currently running web service.
- The active service on port `8065` is the existing Docker image:
  - `mattermost/agentcompanyos-thread-room:11.7.2-local`
  - container: `docker-mattermost-1`
- This branch has not been rebuilt into a replacement Docker image.

## Scope Completed

- Removed large Cloud, billing, trial, marketplace, onboarding, product notice, notify admin, and hosted-customer surfaces.
- Removed many related API routes, jobs, migrations, tests, templates, images, Redux slices, selectors, utilities, and frontend components.
- Removed backend Cloud license helpers and `Features.Cloud` exposure.
- Folded Cloud-specific runtime branches back into the self-hosted/default path.
- Kept the branch as source checkpoint only; no production switch-over has happened.

## Snapshot Size

At checkpoint time:

- 1327 files changed
- 646 files deleted
- 681 files modified
- about 140715 deleted lines
- about 7645 inserted lines

## Verification Passed

- `git diff --check`
- `webapp/platform/types`: `tsc -b --pretty false`
- Go compile sentinels:
  - `server/public`: `go test ./model ./pluginapi -run TestDoesNotExist`
  - `server`: split sentinels for `channels/app`, `channels/api4`, `cmd/mmctl/commands`, `config`, `enterprise/metrics`, `channels/jobs/s3_path_migration`, `platform/shared/filestore`
- Target Jest updates/tests for system-role Cloud prop removal.
- Target scans for high-risk Cloud structure terms such as `Features.Cloud`, `CloudBanners`, `isLicensedForCloud`, and `@mattermost/types/cloud`.

## Not Yet Proven

- `webapp/channels` full TypeScript check still timed out at 300 seconds without a concrete error.
- Webpack production build has not been proven.
- The branch has not been rebuilt into Docker.
- No browser smoke test has been run against this branch.

## Resume Strategy

If this branch is resumed:

1. Do not disturb the currently running Docker deployment unless explicitly requested.
2. Continue from frontend risk first:
   - narrow residual Cloud/trial/billing/marketplace scans,
   - localize `webapp/channels` type-check blockers,
   - only then try webpack.
3. Keep using split verification instead of broad full-suite runs.
4. Treat this as a temporary extraction branch, not as the long-term product architecture by default.

