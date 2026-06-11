// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package platform

import (
	"fmt"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/v8/einterfaces"
)

func (ps *PlatformService) Cluster() einterfaces.ClusterInterface {
	return ps.clusterIFace
}

func (ps *PlatformService) NewClusterDiscoveryService() *ClusterDiscoveryService {
	ds := &ClusterDiscoveryService{
		ClusterDiscovery: model.ClusterDiscovery{},
		platform:         ps,
		stop:             make(chan bool),
	}

	return ds
}

// PlatformService.IsLeader returns true if this server is the leader of its cluster. If the server isn't in a cluster
// (because it's not supported by the server or its license), this will always return true.
func (ps *PlatformService) IsLeader() bool {
	license := ps.License()
	if license == nil || license.Features == nil || license.Features.Cluster == nil || !*license.Features.Cluster {
		// Clustering can't be enabled without a valid license that supports it
		return true
	}

	if !*ps.Config().ClusterSettings.Enable {
		// Clustering is disabled
		return true
	}

	if ps.clusterIFace == nil {
		// Clustering isn't supported by this server
		return true
	}

	// Check with the clustering code
	return ps.clusterIFace.IsLeader()
}

func (ps *PlatformService) SetCluster(impl einterfaces.ClusterInterface) { //nolint:unused
	ps.clusterIFace = impl
}

func (ps *PlatformService) PublishWebSocketEvent(productID string, event string, payload map[string]any, broadcast *model.WebsocketBroadcast) {
	ev := model.NewWebSocketEvent(model.WebsocketEventType(fmt.Sprintf("custom_%v_%v", productID, event)), "", "", "", nil, "")
	ev = ev.SetBroadcast(broadcast).SetData(payload)
	ps.Publish(ev)
}

// Registers a given function to be called when the cluster leader may have changed. Returns a unique ID for the
// listener which can later be used to remove it. If clustering is not enabled in this build, the callback will never
// be called.
func (ps *PlatformService) AddClusterLeaderChangedListener(listener func()) string {
	id := model.NewId()
	ps.clusterLeaderListeners.Store(id, listener)
	return id
}

// Removes a listener function by the unique ID returned when AddConfigListener was called
func (ps *PlatformService) RemoveClusterLeaderChangedListener(id string) {
	ps.clusterLeaderListeners.Delete(id)
}

func (ps *PlatformService) InvokeClusterLeaderChangedListeners() {
	ps.logger.Info("Cluster leader changed. Invoking ClusterLeaderChanged listeners.")
	// This needs to be run in a separate goroutine otherwise a recursive lock happens
	// because the listener function eventually ends up calling .IsLeader().
	// Fixing this would require the changed event to pass the leader directly, but that
	// requires a lot of work.
	ps.Go(func() {
		ps.clusterLeaderListeners.Range(func(_, listener any) bool {
			listener.(func())()
			return true
		})
	})
}

func (ps *PlatformService) Publish(message *model.WebSocketEvent) {
	if ps.metricsIFace != nil {
		ps.metricsIFace.IncrementWebsocketEvent(message.EventType())
	}

	ps.PublishSkipClusterSend(message)

	if ps.clusterIFace != nil {
		data, err := message.ToJSON()
		if err != nil {
			mlog.Warn("Failed to encode message to JSON", mlog.Err(err))
		}
		cm := &model.ClusterMessage{
			Event:    model.ClusterEventPublish,
			SendType: model.ClusterSendBestEffort,
			Data:     data,
		}

		if message.EventType() == model.WebsocketEventPosted ||
			message.EventType() == model.WebsocketEventPostEdited ||
			message.EventType() == model.WebsocketEventDirectAdded ||
			message.EventType() == model.WebsocketEventGroupAdded ||
			message.EventType() == model.WebsocketEventAddedToTeam ||
			message.GetBroadcast().ReliableClusterSend {
			cm.SendType = model.ClusterSendReliable
		}

		ps.clusterIFace.SendClusterMessage(cm)
	}
}

func (ps *PlatformService) PublishSkipClusterSend(event *model.WebSocketEvent) {
	if event.GetBroadcast().UserId != "" {
		hub := ps.GetHubForUserId(event.GetBroadcast().UserId)
		if hub != nil {
			hub.Broadcast(event)
		}
	} else {
		for _, hub := range ps.hubs {
			hub.Broadcast(event)
		}
	}

	// Notify shared channel sync service
	ps.SharedChannelSyncHandler(event)
}
