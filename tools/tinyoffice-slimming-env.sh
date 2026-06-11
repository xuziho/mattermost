#!/usr/bin/env bash

# Source this from WSL before running Mattermost slimming checks:
#   source tools/tinyoffice-slimming-env.sh

set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
    nvm use 24.11 >/dev/null
fi

export GOROOT="${GOROOT:-$HOME/sdk/go1.25.10}"
export GOPATH="${GOPATH:-$HOME/go}"
export PATH="$GOROOT/bin:$GOPATH/bin:$PATH"

# webapp/channels typecheck needs more than Node's default heap on this fork.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=8192}"

if [ "${1:-}" = "--check" ]; then
    printf 'node: '
    node --version
    printf 'npm: '
    npm --version
    printf 'go: '
    go version
    printf 'docker: '
    if command -v docker >/dev/null 2>&1; then
        docker --version
    else
        echo 'not installed or not on PATH'
    fi
fi
