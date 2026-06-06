// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/v8/channels/utils/fileutils"
)

const (
	// MaxPluginMemory is the maximum number of bytes to hold in memory when reading a plugin bundle.
	MaxPluginMemory = 50 * 1024 * 1024
)

func (api *API) InitPlugin() {
	api.BaseRoutes.Plugins.Handle("", api.APISessionRequired(uploadPlugin, handlerParamFileAPI)).Methods(http.MethodPost)
	api.BaseRoutes.Plugins.Handle("", api.APISessionRequired(getPlugins)).Methods(http.MethodGet)
	api.BaseRoutes.Plugin.Handle("", api.APISessionRequired(removePlugin)).Methods(http.MethodDelete)
	api.BaseRoutes.Plugins.Handle("/install_from_url", api.APISessionRequired(installPluginFromURL)).Methods(http.MethodPost)

	api.BaseRoutes.Plugins.Handle("/statuses", api.APISessionRequired(getPluginStatuses)).Methods(http.MethodGet)
	api.BaseRoutes.Plugin.Handle("/enable", api.APISessionRequired(enablePlugin)).Methods(http.MethodPost)
	api.BaseRoutes.Plugin.Handle("/disable", api.APISessionRequired(disablePlugin)).Methods(http.MethodPost)

	api.BaseRoutes.Plugins.Handle("/webapp", api.APIHandler(getWebappPlugins)).Methods(http.MethodGet)

}

func uploadPlugin(c *Context, w http.ResponseWriter, r *http.Request) {
	config := c.App.Config()
	if !*config.PluginSettings.Enable || !*config.PluginSettings.EnableUploads || *config.PluginSettings.RequirePluginSignature {
		c.Err = model.NewAppError("uploadPlugin", "app.plugin.upload_disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	auditRec := c.MakeAuditRecord(model.AuditEventUploadPlugin, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleWritePlugins) {
		c.SetPermissionError(model.PermissionSysconsoleWritePlugins)
		return
	}

	if err := r.ParseMultipartForm(MaxPluginMemory); err != nil {
		if err.Error() == "http: request body too large" {
			c.Err = model.NewAppError("uploadPlugin", "api.plugin.upload.file_too_large.app_error", nil, "", http.StatusRequestEntityTooLarge)
			return
		}
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	m := r.MultipartForm

	pluginArray, ok := m.File["plugin"]
	if !ok {
		c.Err = model.NewAppError("uploadPlugin", "api.plugin.upload.no_file.app_error", nil, "", http.StatusBadRequest)
		return
	}

	if len(pluginArray) <= 0 {
		c.Err = model.NewAppError("uploadPlugin", "api.plugin.upload.array.app_error", nil, "", http.StatusBadRequest)
		return
	}
	model.AddEventParameterToAuditRec(auditRec, "filename", pluginArray[0].Filename)

	file, err := pluginArray[0].Open()
	if err != nil {
		c.Err = model.NewAppError("uploadPlugin", "api.plugin.upload.file.app_error", nil, "", http.StatusBadRequest)
		return
	}
	defer file.Close()

	force := false
	if len(m.Value["force"]) > 0 && m.Value["force"][0] == "true" {
		force = true
	}

	installPlugin(c, w, file, force)
	auditRec.Success()
}

func installPluginFromURL(c *Context, w http.ResponseWriter, r *http.Request) {
	if !*c.App.Config().PluginSettings.Enable ||
		*c.App.Config().PluginSettings.RequirePluginSignature ||
		!*c.App.Config().PluginSettings.EnableUploads {
		c.Err = model.NewAppError("installPluginFromURL", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	auditRec := c.MakeAuditRecord(model.AuditEventInstallPluginFromURL, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleWritePlugins) {
		c.SetPermissionError(model.PermissionSysconsoleWritePlugins)
		return
	}

	force, _ := strconv.ParseBool(r.URL.Query().Get("force"))
	downloadURL := r.URL.Query().Get("plugin_download_url")
	model.AddEventParameterToAuditRec(auditRec, "url", downloadURL)

	pluginFileBytes, err := c.App.DownloadFromURL(downloadURL)
	if err != nil {
		c.Err = model.NewAppError("installPluginFromURL", "api.plugin.install.download_failed.app_error", nil, "", http.StatusBadRequest).Wrap(err)
		return
	}

	installPlugin(c, w, bytes.NewReader(pluginFileBytes), force)
	auditRec.Success()
}

func getPlugins(c *Context, w http.ResponseWriter, r *http.Request) {
	if !*c.App.Config().PluginSettings.Enable {
		c.Err = model.NewAppError("getPlugins", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleReadPlugins) {
		c.SetPermissionError(model.PermissionSysconsoleReadPlugins)
		return
	}

	response, err := c.App.GetPlugins()
	if err != nil {
		c.Err = err
		return
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}

func getPluginStatuses(c *Context, w http.ResponseWriter, r *http.Request) {
	if !*c.App.Config().PluginSettings.Enable {
		c.Err = model.NewAppError("getPluginStatuses", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleReadPlugins) {
		c.SetPermissionError(model.PermissionSysconsoleReadPlugins)
		return
	}

	response, err := c.App.GetClusterPluginStatuses()
	if err != nil {
		c.Err = err
		return
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}

func removePlugin(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequirePluginId()
	if c.Err != nil {
		return
	}

	if !*c.App.Config().PluginSettings.Enable {
		c.Err = model.NewAppError("removePlugin", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	auditRec := c.MakeAuditRecord(model.AuditEventRemovePlugin, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)
	model.AddEventParameterToAuditRec(auditRec, "plugin_id", c.Params.PluginId)

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleWritePlugins) {
		c.SetPermissionError(model.PermissionSysconsoleWritePlugins)
		return
	}

	err := c.App.Channels().RemovePlugin(c.Params.PluginId)
	if err != nil {
		c.Err = err
		return
	}

	auditRec.Success()
	ReturnStatusOK(w)
}

func getWebappPlugins(c *Context, w http.ResponseWriter, r *http.Request) {
	if !*c.App.Config().PluginSettings.Enable {
		c.Err = model.NewAppError("getWebappPlugins", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	manifests, appErr := c.App.GetActivePluginManifests()
	if appErr != nil {
		c.Err = appErr
		return
	}

	clientManifests := []*model.Manifest{}
	for _, m := range manifests {
		if m.HasClient() {
			manifest := m.ClientManifest()

			// There is no reason to expose the SettingsSchema in this API call; it's not used in the webapp.
			manifest.SettingsSchema = nil
			clientManifests = append(clientManifests, manifest)
		}
	}

	js, err := json.Marshal(clientManifests)
	if err != nil {
		c.Err = model.NewAppError("getWebappPlugins", "api.marshal_error", nil, "", http.StatusInternalServerError).Wrap(err)
		return
	}

	if _, err := w.Write(js); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}

func enablePlugin(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequirePluginId()
	if c.Err != nil {
		return
	}

	if !*c.App.Config().PluginSettings.Enable {
		c.Err = model.NewAppError("activatePlugin", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	auditRec := c.MakeAuditRecord(model.AuditEventEnablePlugin, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)
	model.AddEventParameterToAuditRec(auditRec, "plugin_id", c.Params.PluginId)

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleWritePlugins) {
		c.SetPermissionError(model.PermissionSysconsoleWritePlugins)
		return
	}

	if err := c.App.EnablePlugin(c.Params.PluginId); err != nil {
		c.Err = err
		return
	}

	auditRec.Success()
	ReturnStatusOK(w)
}

func disablePlugin(c *Context, w http.ResponseWriter, r *http.Request) {
	c.RequirePluginId()
	if c.Err != nil {
		return
	}

	if !*c.App.Config().PluginSettings.Enable {
		c.Err = model.NewAppError("deactivatePlugin", "app.plugin.disabled.app_error", nil, "", http.StatusNotImplemented)
		return
	}

	auditRec := c.MakeAuditRecord(model.AuditEventDisablePlugin, model.AuditStatusFail)
	defer c.LogAuditRec(auditRec)
	model.AddEventParameterToAuditRec(auditRec, "plugin_id", c.Params.PluginId)

	if !c.App.SessionHasPermissionTo(*c.AppContext.Session(), model.PermissionSysconsoleWritePlugins) {
		c.SetPermissionError(model.PermissionSysconsoleWritePlugins)
		return
	}

	if err := c.App.DisablePlugin(c.Params.PluginId); err != nil {
		c.Err = err
		return
	}

	auditRec.Success()
	ReturnStatusOK(w)
}

func installPlugin(c *Context, w http.ResponseWriter, plugin io.ReadSeeker, force bool) {
	conflict, err := fileutils.CheckDirectoryConflict(*c.App.Config().PluginSettings.Directory, *c.App.Config().ImportSettings.Directory)
	if err != nil {
		c.Err = model.NewAppError("installPlugin", "api.plugin.install.check_directory.app_error", nil, "", http.StatusInternalServerError).Wrap(err)
		return
	}
	if conflict {
		c.Err = model.NewAppError("installPlugin", "api.plugin.install.directory_conflict.app_error", nil, "", http.StatusForbidden)
		return
	}

	manifest, appErr := c.App.InstallPlugin(plugin, force)
	if appErr != nil {
		c.Err = appErr
		return
	}
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(manifest); err != nil {
		c.Logger.Warn("Error while writing response", mlog.Err(err))
	}
}
