# AgentCompanyOS Collaboration Frontend

This fork is a slimmed-down Mattermost-derived collaboration frontend for AgentCompanyOS. The target is not to preserve the full upstream Mattermost product surface; the target is a lightweight team/chat interface that keeps the collaboration capabilities AgentCompanyOS needs.

## Protected Capabilities

- Login and session handling
- Teams and channels
- Sending and receiving messages
- Direct and group messages
- Thread replies
- Search
- File uploads
- Basic user and member management
- Mattermost-compatible APIs required by AgentCompanyOS

## Slimming Direction

Remove product surfaces that are not part of the AgentCompanyOS collaboration frontend, including Cloud, Billing, Trial, Marketplace discovery, official help and documentation links, product switchers, official onboarding and tours, Playbooks, Boards, Calls, enterprise upsell flows, unused plugin entry points, mobile and desktop client download pages, and official brand assets.

## Development Guardrails

Before each slimming pass, work from the WSL checkout:

```bash
cd /home/ziho/CodeXProject/mattermost-slimming-windows
source tools/agentcompanyos-slimming-env.sh
```

After each delete family, run the fixed verification gates:

```bash
git diff --check
cd webapp/channels
npm run check-types
npm run build
```

Also run the Go compile-only sentinel for the protected server packages before committing. Keep one feature family per commit so regressions are easy to isolate.
