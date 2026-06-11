// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package metrics

func (mi *MetricsInterfaceImpl) ObservePluginHookDuration(pluginID, hookName string, success bool, elapsed float64) {
}

func (mi *MetricsInterfaceImpl) ObservePluginMultiHookDuration(elapsed float64) {
}

func (mi *MetricsInterfaceImpl) ObservePluginMultiHookIterationDuration(pluginID string, elapsed float64) {
}

func (mi *MetricsInterfaceImpl) ObservePluginAPIDuration(pluginID, apiName string, success bool, elapsed float64) {
}
