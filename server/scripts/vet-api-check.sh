#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# Our API vet checks haven't been running for a long time, and there are lots of undocumented APIs.
# To stem the introduction of new, undocumented APIs while we find time to document the old ones,
# filter out all the "known issues" to support the automated CI check.

API_YAML=$ROOT../api/v4/html/static/mattermost-openapi-v4.yaml
OUTPUT=$($GO vet -vettool=$GOBIN/mattermost-govet -openApiSync -openApiSync.spec=$API_YAML ./... 2>&1 || true)

echo "All output, some ignored"
echo "========================"
echo "$OUTPUT"

OUTPUT_EXCLUDING_IGNORED=$(echo "$OUTPUT" | grep -Fv \
    -e 'go: downloading' \
    -e 'github.com/mattermost/mattermost/server/v8/channels/api4' \
    -e 'Cannot find /api/v4/channels/members/{user_id}/mark_read method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/channels/members/{user_id}/mark_read method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/channels/stats/member_count method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/channels/{channel_id}/convert_to_channel method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/client_perf method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/drafts method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/users/{user_id}/teams/{team_id}/drafts method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/users/{user_id}/channels/{channel_id}/drafts/{thread_id} method: DELETE in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/users/{user_id}/channels/{channel_id}/drafts method: DELETE in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/exports/{export_name:.+\\.zip}/presign-url method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/posts/{post_id}/edit_history method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/posts/{post_id}/info method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/posts/search method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/logs/query method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/latest_version method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/system/onboarding/complete method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/system/onboarding/complete method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/system/schema/version method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/usage/teams method: GET in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/users/login/desktop_token method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/users/notify-admin method: POST in OpenAPI 3 spec.' \
    -e 'Cannot find /api/v4/users/trigger-notify-admin-posts method: POST in OpenAPI 3 spec.' \
2>&1 || true)

if [[ ! -z "${OUTPUT_EXCLUDING_IGNORED// }" ]]; then
    echo "Failing vet output"
    echo "=================="
    echo "$OUTPUT_EXCLUDING_IGNORED"
    exit 1
else
    echo "Ignoring above errors."
    exit 0
fi
