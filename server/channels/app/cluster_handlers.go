// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

// registerClusterHandlers registers the cluster message handlers that are handled by the server.
//
// The cluster event handlers are spread across this function and NewLocalCacheLayer.
// Be careful to not have duplicated handlers here and there.
func (s *Server) registerClusterHandlers() {
	s.platform.RegisterClusterHandlers()
}
