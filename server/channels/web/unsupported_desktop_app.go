// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package web

import (
	"time"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/request"
	"github.com/mattermost/mattermost/server/v8/platform/shared/templates"
)

func renderUnsupportedDesktopApp(rctx request.CTX, cfg *model.Config, currentVersion, subpath string) templates.Data {
	return templates.Data{
		Props: map[string]any{
			"Subpath": ensureTrailingSlash(subpath),
			"Title":   rctx.T("web.error.unsupported_desktop_app.title"),
			"MessageString": rctx.T("web.error.unsupported_desktop_app.message", map[string]any{
				"SiteName":       *cfg.TeamSettings.SiteName,
				"CurrentVersion": currentVersion,
				"MinimumVersion": *cfg.ServiceSettings.MinimumDesktopAppVersion,
			}),
			"AssistanceString": rctx.T("web.error.unsupported_desktop_app.assistance"),
			"CopyrightYear":    time.Now().Year(),
			"SiteName":         *cfg.TeamSettings.SiteName,
		},
	}
}
