// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import "github.com/mattermost/mattermost/server/v8/platform/services/searchengine"

func (a *App) SetSearchEngine(se *searchengine.Broker) {
	a.ch.srv.platform.SearchEngine = se
}

func (a *App) ActiveSearchBackend() string {
	return a.ch.srv.platform.SearchEngine.ActiveEngine()
}
