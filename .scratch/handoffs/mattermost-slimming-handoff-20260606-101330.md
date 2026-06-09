# Mattermost Fork Slimming Handoff

Created: 2026-06-06 10:13 UTC

## Purpose

Continue the slimming work in `/home/xu/CodeXProject/mattermost-thread-room-fork`.

The user wants to keep using a self-modified Mattermost fork and remove heavy or unused official/commercial/product-suite functionality. They prefer direct execution over repeated approval steps. They asked for this handoff so a fresh window can continue.

## Original Slimming Checklist

This checklist was derived from the conversation, not from a separate PRD file:

1. Remove official Help and official documentation entry points.
2. Remove Native App download/landing flows.
3. Remove official Mattermost brand/footer/About links, then later replace visual branding/logo/loading assets.
4. Remove Plugin Marketplace.
5. Remove Cloud, Billing, trials, upgrade, paid-plan, and official monetization flows.
6. Remove Product Notices, Onboarding, Tours, Feature Discovery, and official guidance surfaces.
7. Remove Calls official suite.
8. Remove Playbooks official workflow/runbook suite.
9. Remove Boards official kanban suite.
10. Remove official documentation links from Integrations.
11. Remove Product Switcher, product-suite registration framework, and remote product initialization.
12. Remove mmctl Marketplace commands/docs where they only support removed official marketplace flows.
13. Remove upstream e2e tests tied to removed feature surfaces.
14. Clean i18n, snapshots, constants, permissions, types, tests, and stale imports.
15. Finish with compile/test/runtime verification.

## Completed Or Mostly Completed

### Help and official docs entry points

- Removed internal `/help` frontend route/components.
- Removed help popout, text editor HelpButton, footer/mobile Help.
- Removed Admin Console `HelpLink` / `EnableAskCommunityLink` exposure.
- Removed `/help` slash command and related tests.

### Native App download

- Removed `/landing` route/page.
- Removed Download Apps from product/global menus and mobile menu.
- Removed Admin Console app download settings.
- Removed welcome-email App download block and `appIcons.png`.
- Changed notification/magic links away from `/landing#...`.
- Removed public client exposure of app download links.

### Official brand/footer/About first pass

- Login/header/footer no longer render external About/Privacy/Terms links.
- Footer copyright uses `SiteName`.
- Unsupported desktop footer external About/Privacy/Terms links removed.
- About modal no longer links to `mattermost.com/community`, `mattermost.com`, Terms, or Privacy.
- NOTICE/GitHub license links were intentionally left.

### Plugin Marketplace

- Removed official marketplace UI/linkage from plugin management.
- Removed marketplace action types, selectors, feature flag, fake marketplace plugin data, comments, i18n keys, and server/platform marketplace service/model pieces.
- Removed mmctl plugin marketplace command/docs/tests:
  - `server/cmd/mmctl/commands/plugin_marketplace*`
  - `server/cmd/mmctl/docs/mmctl_plugin_marketplace*`
- Deleted large upstream marketplace snapshot tests where they mainly preserved official marketplace links.

### Cloud/Billing/Trials/official monetization

Large amounts are already removed or disconnected. Current `git status` shows many deleted/modified files in:

- `server/channels/api4/cloud.go`, `hosted_customer.go`, `notify_admin.go`
- `server/channels/app/cloud.go`, `hosted_customer.go`, `notify_admin.go`, `onboarding.go`, `product_notices.go`
- cloud/billing/trial frontend components
- e2e cloud/billing/self-hosted purchase specs
- cloud billing test helpers
- cloud templates and email partials

Do not assume the full cloud/billing cut is final. Treat it as advanced but still requiring final audit.

### Calls

Already removed a major frontend chunk:

- `webapp/channels/src/plugins/call_button/*`
- profile popover call button components
- calls sounds
- calls selectors/types in several places

Do not assume every server/plugin/API reference to Calls is gone. Needs final scan.

### Integrations official documentation links

Completed in the last verified cut.

Source-level residual scan was empty for:

```bash
rg -n "DeveloperLinks|TRUSTED_CONNECTION|api\\.mattermost\\.com|mattermost\\.com/pl/(custom-slash-commands|setup-custom-slash-commands|incoming-webhooks|setup-incoming-webhooks|outgoing-webhooks|setup-outgoing-webhooks|setup-oauth-2\\.0|enable-oauth|interactive-messages|interactive-dialogs|personal-access-tokens|outgoing-oauth-connections|default-bot-accounts|default-allow-untrusted-internal-connections)" webapp/channels/src/components/integrations webapp/channels/src/components/admin_console webapp/channels/src/components/user_settings/security webapp/channels/src/utils/constants.tsx webapp/channels/src/i18n server/i18n --glob '!**/node_modules/**'
```

Changes included:

- Removed `DeveloperLinks`.
- Removed `DocLinks.TRUSTED_CONNECTION`.
- Removed Integrations list-page official help links for slash commands, incoming/outgoing webhooks, OAuth apps, outgoing OAuth connections.
- Removed confirm-page official docs links.
- Removed Bot/PAT official docs links.
- Removed Admin Console integration-management official docs links.
- Removed old i18n keys and scrubbed snapshots.

### Product Switcher / Product pluggable framework

Completed in the last verified cut.

Residual scan was empty for:

```bash
rg -n "registerProduct|ProductComponent|ProductSubComponentNames|Product menu|product menu|product switch|product switcher|initializeProducts|utils/products|plugins/products|selectors/products|productMenu|isInProduct" webapp/channels/src webapp/platform/types/src --glob '!**/node_modules/**'
```

Changes included:

- Deleted `webapp/channels/src/plugins/products.ts`.
- Root no longer calls `initializeProducts()`.
- Root no longer mounts Product routes.
- Removed global header product switcher UI:
  - `webapp/channels/src/components/global_header/left_controls/product_menu/`
  - action/reducer/selector for `product_menu`
  - related store type and i18n keys
- Removed `registerProduct` from `plugins/registry.ts`.
- Removed `ProductComponent` and Product-specific pluggable branch.
- AppBar, TeamSidebar, SidebarRight no longer consult current product context.
- Removed `isInProduct` from TeamButton.

## Not Done / Needs Follow-Up

### Playbooks

Not fully complete.

Some Playbooks files and permissions have been removed in prior cuts, but no final all-repo Playbooks audit has been completed. Continue with:

```bash
rg -n "Playbook|playbook|RunCreate|RUN_|PLAYBOOK_|run_view|run_create" server webapp api e2e-tests --glob '!**/node_modules/**'
```

Then remove or consciously retain each remaining reference.

### Boards

Not fully complete.

Some Boards test data/support files were deleted, but no final all-repo Boards audit has been completed. Continue with:

```bash
rg -n "Boards|boards|board|ProductBoards|ProductIdentifier.*boards|custom_board" server webapp api e2e-tests --glob '!**/node_modules/**'
```

Be careful: generic word `board` may be noisy.

### AppBar / Apps Framework product scope tail

`ProductScope` remains in:

- `webapp/platform/types/src/products.ts`
- `webapp/platform/types/src/apps.ts`
- `webapp/channels/src/components/app_bar/app_bar.tsx`
- `webapp/channels/src/types/store/plugins.ts`

This currently means "Channels-compatible app/plugin bindings", not active product-suite routing. If the user wants no product concept at all, this is a follow-up cut.

### Official docs links outside Integrations

Integrations scope is clean, but Admin Console still has other official docs links through `DocLinks` and hardcoded docs URLs. This is not yet fully audited.

Suggested scan:

```bash
rg -n "docs\\.mattermost\\.com|mattermost\\.com/pl/" webapp/channels/src/components/admin_console webapp/channels/src/utils/constants.tsx server --glob '!**/node_modules/**'
```

Decide which are license/NOTICE-critical versus removable official guidance.

### Branding visual replacement

Not started.

The user explicitly wants later:

- custom logo
- loading screen icon/spinner
- favicon/app icons
- page style/brand feel

Do this after functional slimming stabilizes.

### Full verification

Not complete.

Completed:

- repeated `git diff --check`
- i18n JSON parse for `webapp/channels/src/i18n` and `server/i18n`
- targeted residual scans
- targeted ESLint for the Product Switcher cut:

```bash
cd /home/xu/CodeXProject/mattermost-thread-room-fork/webapp/channels/src
../../node_modules/.bin/eslint --quiet components/root/root.tsx components/root/index.ts components/global_header/global_header.tsx components/global_header/left_controls/left_controls.tsx components/global_header/center_controls/center_controls.tsx components/global_header/right_controls/right_controls.tsx components/sidebar_right/index.ts components/sidebar_right/sidebar_right.tsx components/team_sidebar/index.ts components/team_sidebar/team_sidebar.tsx components/team_sidebar/components/team_button.tsx components/app_bar/app_bar.tsx plugins/pluggable/pluggable.tsx plugins/registry.ts components/async_load.tsx reducers/plugins/index.ts reducers/views/index.ts types/store/plugins.ts types/store/views.ts utils/test_helper.ts
```

Attempted but not completed:

```bash
cd /home/xu/CodeXProject/mattermost-thread-room-fork/webapp/channels
npm run check-types
```

It ran `tsc -b` for about a minute with no output and was terminated to avoid a lingering background process. This is not a pass.

Earlier Go validation was partially successful for narrow packages, but full backend tests are still not green because of existing shared compile gaps mentioned in the conversation:

- `AccessControlPolicy...`
- `EnableWatermark`
- `remotecluster mlog`

Treat those as existing repo compile gaps unless a fresh run proves otherwise.

## Known Current Worktree Shape

The worktree is very dirty. Many deletions are intentional slimming work. Do not revert unrelated changes.

Important changed/deleted areas include:

- `server/channels/api4`
- `server/channels/app`
- `server/channels/jobs`
- `server/channels/store`
- `server/public/model`
- `server/public/plugin`
- `server/cmd/mmctl`
- `webapp/channels/src/components/admin_console`
- `webapp/channels/src/components/global_header`
- `webapp/channels/src/components/app_bar`
- `webapp/channels/src/components/integrations`
- `webapp/channels/src/plugins`
- `webapp/channels/src/reducers`
- `webapp/channels/src/selectors`
- `webapp/channels/src/types`
- `webapp/channels/src/i18n`
- `e2e-tests`
- `api`

Use `git diff -- <path>` for exact current state instead of relying on this handoff.

## Suggested Next Session Plan

1. Start with `git status --short` and targeted residual scans.
2. Pick one remaining product-suite family only:
   - recommended next cut: Playbooks final audit
   - alternate: Boards final audit
   - alternate: full official docs-link audit outside Integrations
3. For the chosen family:
   - scan source, tests, API docs, i18n, snapshots
   - delete or disconnect runtime paths
   - remove stale tests/snapshots/i18n
   - run residual scan until empty or documented intentionally retained
   - run JSON parse and `git diff --check`
   - run targeted ESLint/type checks where practical
4. Do not mark the global slimming objective complete until all remaining checklist items have current evidence.

## Suggested Skills

- `handoff`: use again before switching windows or after a major cut.
- `diagnose`: use if compile/test failures appear and the cause is unclear.
- `zoom-out`: use if the next agent needs to understand how a remaining subsystem fits the Mattermost app.
- `improve-codebase-architecture`: useful later after feature removal stabilizes, to consolidate abstractions and dead types.

## Notes For The Next Agent

- The user is comfortable with aggressive deletion and explicitly said they do not like the conservative option.
- Still avoid destructive git commands. The worktree contains many intentional edits.
- Prefer `rg` and targeted scans.
- Use `apply_patch` for manual edits.
- The user wants concise Chinese progress updates and clear verification.
- The final answer in this repo context should include the short call inventory if the AGENTS instruction is still present in the new session.
