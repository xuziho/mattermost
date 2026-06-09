// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api4

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/utils"
	"github.com/mattermost/mattermost/server/v8"
	"github.com/mattermost/mattermost/server/v8/channels/testlib"
	"github.com/mattermost/mattermost/server/v8/channels/utils/fileutils"
)

func TestPlugin(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	th.TestForSystemAdminAndLocal(t, func(t *testing.T, client *model.Client4) {
		statesJson, err := json.Marshal(th.App.Config().PluginSettings.PluginStates)
		require.NoError(t, err)
		states := map[string]*model.PluginState{}
		err = json.Unmarshal(statesJson, &states)
		require.NoError(t, err)

		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		path, _ := fileutils.FindDir("tests")
		tarData, err := os.ReadFile(filepath.Join(path, "testplugin.tar.gz"))
		require.NoError(t, err)

		// Successful upload
		manifest, _, err := client.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.NoError(t, err)
		assert.Equal(t, "testplugin", manifest.Id)

		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.EnableUploads = true })

		manifest, _, err = client.UploadPluginForced(context.Background(), bytes.NewReader(tarData))
		defer os.RemoveAll("plugins/testplugin")
		require.NoError(t, err)

		assert.Equal(t, "testplugin", manifest.Id)

		// Stored in File Store: Upload Plugin case
		pluginStored, appErr := th.App.FileExists("./plugins/" + manifest.Id + ".tar.gz")
		assert.Nil(t, appErr)
		assert.True(t, pluginStored)

		// Upload error cases
		_, resp, err := client.UploadPlugin(context.Background(), bytes.NewReader([]byte("badfile")))
		require.Error(t, err)
		CheckBadRequestStatus(t, resp)

		plugin_sz := int64(111 * 1024 * 1024)
		fd, err := os.Create(filepath.Join(path, "big_testplugin.tar.gz"))
		require.NoError(t, err)
		_, err = fd.Seek(plugin_sz-1, 0)
		require.NoError(t, err)
		_, err = fd.Write([]byte{0})
		require.NoError(t, err)
		err = fd.Close()
		require.NoError(t, err)
		bigData, err := os.ReadFile(filepath.Join(path, "big_testplugin.tar.gz"))
		require.NoError(t, err)
		_, resp, err = client.UploadPlugin(context.Background(), bytes.NewReader(bigData))
		require.Error(t, err)
		CheckRequestEntityTooLargeStatus(t, resp)
		err = os.Remove(filepath.Join(path, "big_testplugin.tar.gz"))
		require.NoError(t, err)

		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.Enable = false })
		_, resp, err = client.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.Error(t, err)
		CheckNotImplementedStatus(t, resp)

		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = false
		})
		_, resp, err = client.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.Error(t, err)
		CheckNotImplementedStatus(t, resp)

		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.EnableUploads = true })
		_, resp, err = th.Client.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)

		// Successful gets
		pluginsResp, _, err := client.GetPlugins(context.Background())
		require.NoError(t, err)

		found := false
		for _, m := range pluginsResp.Inactive {
			if m.Id == manifest.Id {
				found = true
			}
		}

		assert.True(t, found)

		found = false
		for _, m := range pluginsResp.Active {
			if m.Id == manifest.Id {
				found = true
			}
		}

		assert.False(t, found)

		// Successful activate
		_, err = client.EnablePlugin(context.Background(), manifest.Id)
		require.NoError(t, err)

		pluginsResp, _, err = client.GetPlugins(context.Background())
		require.NoError(t, err)

		found = false
		for _, m := range pluginsResp.Active {
			if m.Id == manifest.Id {
				found = true
			}
		}

		assert.True(t, found)

		// Activate error case
		resp, err = client.EnablePlugin(context.Background(), "junk")
		require.Error(t, err)
		CheckNotFoundStatus(t, resp)

		resp, err = client.EnablePlugin(context.Background(), "JUNK")
		require.Error(t, err)
		CheckNotFoundStatus(t, resp)

		// Successful deactivate
		_, err = client.DisablePlugin(context.Background(), manifest.Id)
		require.NoError(t, err)

		pluginsResp, _, err = client.GetPlugins(context.Background())
		require.NoError(t, err)

		found = false
		for _, m := range pluginsResp.Inactive {
			if m.Id == manifest.Id {
				found = true
			}
		}

		assert.True(t, found)

		// Deactivate error case
		resp, err = client.DisablePlugin(context.Background(), "junk")
		require.Error(t, err)
		CheckNotFoundStatus(t, resp)

		// Get error cases
		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.Enable = false })
		_, resp, err = client.GetPlugins(context.Background())
		require.Error(t, err)
		CheckNotImplementedStatus(t, resp)

		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.Enable = true })
		_, resp, err = th.Client.GetPlugins(context.Background())
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)

		// Successful webapp get
		_, err = client.EnablePlugin(context.Background(), manifest.Id)
		require.NoError(t, err)

		manifests, _, err := th.Client.GetWebappPlugins(context.Background())
		require.NoError(t, err)

		found = false
		for _, m := range manifests {
			if m.Id == manifest.Id {
				found = true
			}
		}

		assert.True(t, found)

		// Successful remove
		_, err = client.RemovePlugin(context.Background(), manifest.Id)
		require.NoError(t, err)

		// Remove error cases
		resp, err = client.RemovePlugin(context.Background(), manifest.Id)
		require.Error(t, err)
		CheckNotFoundStatus(t, resp)

		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.Enable = false })
		resp, err = client.RemovePlugin(context.Background(), manifest.Id)
		require.Error(t, err)
		CheckNotImplementedStatus(t, resp)

		th.App.UpdateConfig(func(cfg *model.Config) { *cfg.PluginSettings.Enable = true })
		resp, err = th.Client.RemovePlugin(context.Background(), manifest.Id)
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)

		resp, err = client.RemovePlugin(context.Background(), "bad.id")
		require.Error(t, err)
		CheckNotFoundStatus(t, resp)
	})
}

func TestPluginInstallDirectoryConflict(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.Enable = true
		*cfg.PluginSettings.EnableUploads = true
	})

	path, _ := fileutils.FindDir("tests")
	tarData, err := os.ReadFile(filepath.Join(path, "testplugin.tar.gz"))
	require.NoError(t, err)

	t.Run("plugin directory is subdirectory of import directory", func(t *testing.T) {
		originalPluginDir := *th.App.Config().PluginSettings.Directory
		originalImportDir := *th.App.Config().ImportSettings.Directory

		// Use non-existent paths to test conflict detection without filesystem dependencies
		importDir := "/nonexistent/conflict-test/data"
		pluginDir := "/nonexistent/conflict-test/data/plugins"

		defer th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Directory = originalPluginDir
			*cfg.ImportSettings.Directory = originalImportDir
		})

		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.ImportSettings.Directory = importDir
			*cfg.PluginSettings.Directory = pluginDir
		})

		_, resp, err := th.SystemAdminClient.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)
		CheckErrorID(t, err, "api.plugin.install.directory_conflict.app_error")
	})

	t.Run("import directory is subdirectory of plugin directory", func(t *testing.T) {
		originalPluginDir := *th.App.Config().PluginSettings.Directory
		originalImportDir := *th.App.Config().ImportSettings.Directory

		// Use non-existent paths to test conflict detection without filesystem dependencies
		pluginDir := "/nonexistent/conflict-test/plugins"
		importDir := "/nonexistent/conflict-test/plugins/imports"

		defer th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Directory = originalPluginDir
			*cfg.ImportSettings.Directory = originalImportDir
		})

		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Directory = pluginDir
			*cfg.ImportSettings.Directory = importDir
		})

		_, resp, err := th.SystemAdminClient.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)
		CheckErrorID(t, err, "api.plugin.install.directory_conflict.app_error")
	})

	t.Run("same directory", func(t *testing.T) {
		originalPluginDir := *th.App.Config().PluginSettings.Directory
		originalImportDir := *th.App.Config().ImportSettings.Directory

		// Use non-existent path to test conflict detection without filesystem dependencies
		sharedDir := "/nonexistent/conflict-test/shared"

		defer th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Directory = originalPluginDir
			*cfg.ImportSettings.Directory = originalImportDir
		})

		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Directory = sharedDir
			*cfg.ImportSettings.Directory = sharedDir
		})

		_, resp, err := th.SystemAdminClient.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.Error(t, err)
		CheckForbiddenStatus(t, resp)
		CheckErrorID(t, err, "api.plugin.install.directory_conflict.app_error")
	})

	t.Run("separate directories should succeed", func(t *testing.T) {
		manifest, _, err := th.SystemAdminClient.UploadPlugin(context.Background(), bytes.NewReader(tarData))
		require.NoError(t, err)
		assert.Equal(t, "testplugin", manifest.Id)

		_, err = th.SystemAdminClient.RemovePlugin(context.Background(), manifest.Id)
		require.NoError(t, err)
	})
}

func TestNotifyClusterPluginEvent(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	testCluster := &testlib.FakeClusterInterface{}
	th.Server.Platform().SetCluster(testCluster)

	th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.Enable = true
		*cfg.PluginSettings.EnableUploads = true
	})

	path, _ := fileutils.FindDir("tests")
	tarData, err := os.ReadFile(filepath.Join(path, "testplugin.tar.gz"))
	require.NoError(t, err)

	testCluster.ClearMessages()

	// Successful upload
	manifest, _, err := th.SystemAdminClient.UploadPlugin(context.Background(), bytes.NewReader(tarData))
	require.NoError(t, err)
	require.Equal(t, "testplugin", manifest.Id)

	// Stored in File Store: Upload Plugin case
	expectedPath := filepath.Join("./plugins", manifest.Id) + ".tar.gz"
	pluginStored, appErr := th.App.FileExists(expectedPath)
	require.Nil(t, appErr)
	require.True(t, pluginStored)

	messages := testCluster.GetMessages()
	expectedPluginData := model.PluginEventData{
		Id: manifest.Id,
	}

	buf, _ := json.Marshal(expectedPluginData)
	expectedInstallMessage := &model.ClusterMessage{
		Event:            model.ClusterEventInstallPlugin,
		SendType:         model.ClusterSendReliable,
		WaitForAllToSend: true,
		Data:             buf,
	}
	actualMessages := findClusterMessages(model.ClusterEventInstallPlugin, messages)
	require.Equal(t, []*model.ClusterMessage{expectedInstallMessage}, actualMessages)

	// Upgrade
	testCluster.ClearMessages()
	manifest, _, err = th.SystemAdminClient.UploadPluginForced(context.Background(), bytes.NewReader(tarData))
	require.NoError(t, err)
	require.Equal(t, "testplugin", manifest.Id)

	// Successful remove
	webSocketClient := th.CreateConnectedWebSocketClientWithClient(t, th.SystemAdminClient)

	done := make(chan bool)
	go func() {
		for {
			select {
			case resp := <-webSocketClient.EventChannel:
				if resp.EventType() == model.WebsocketEventPluginStatusesChanged && len(resp.GetData()["plugin_statuses"].([]any)) == 0 {
					done <- true
					return
				}
			case <-time.After(5 * time.Second):
				done <- false
				return
			}
		}
	}()

	testCluster.ClearMessages()
	_, err = th.SystemAdminClient.RemovePlugin(context.Background(), manifest.Id)
	require.NoError(t, err)

	result := <-done
	require.True(t, result, "plugin_statuses_changed websocket event was not received")

	messages = testCluster.GetMessages()

	expectedRemoveMessage := &model.ClusterMessage{
		Event:            model.ClusterEventRemovePlugin,
		SendType:         model.ClusterSendReliable,
		WaitForAllToSend: true,
		Data:             buf,
	}
	actualMessages = findClusterMessages(model.ClusterEventRemovePlugin, messages)
	require.Equal(t, []*model.ClusterMessage{expectedRemoveMessage}, actualMessages)

	pluginStored, appErr = th.App.FileExists(expectedPath)
	require.Nil(t, appErr)
	require.False(t, pluginStored)
}

func TestDisableOnRemove(t *testing.T) {
	mainHelper.Parallel(t)
	path, _ := fileutils.FindDir("tests")
	tarData, err := os.ReadFile(filepath.Join(path, "testplugin.tar.gz"))
	require.NoError(t, err)

	testCases := []struct {
		Description string
		Upgrade     bool
	}{
		{
			"Remove without upgrading",
			false,
		},
		{
			"Remove after upgrading",
			true,
		},
	}

	th := Setup(t).InitBasic(t)

	for _, tc := range testCases {
		t.Run(tc.Description, func(t *testing.T) {
			th.TestForSystemAdminAndLocal(t, func(t *testing.T, client *model.Client4) {
				th.App.UpdateConfig(func(cfg *model.Config) {
					*cfg.PluginSettings.Enable = true
					*cfg.PluginSettings.EnableUploads = true
				})

				// Upload
				manifest, _, err := client.UploadPlugin(context.Background(), bytes.NewReader(tarData))
				require.NoError(t, err)
				require.Equal(t, "testplugin", manifest.Id)

				// Check initial status
				pluginsResp, _, err := client.GetPlugins(context.Background())
				require.NoError(t, err)
				require.Empty(t, pluginsResp.Active)
				require.Equal(t, pluginsResp.Inactive, []*model.PluginInfo{{
					Manifest: *manifest,
				}})

				// Enable plugin
				_, err = client.EnablePlugin(context.Background(), manifest.Id)
				require.NoError(t, err)

				// Confirm enabled status
				pluginsResp, _, err = client.GetPlugins(context.Background())
				require.NoError(t, err)
				require.Empty(t, pluginsResp.Inactive)
				require.Equal(t, pluginsResp.Active, []*model.PluginInfo{{
					Manifest: *manifest,
				}})

				if tc.Upgrade {
					// Upgrade
					manifest, _, err = client.UploadPluginForced(context.Background(), bytes.NewReader(tarData))
					require.NoError(t, err)
					require.Equal(t, "testplugin", manifest.Id)

					// Plugin should remain active
					pluginsResp, _, err = client.GetPlugins(context.Background())
					require.NoError(t, err)
					require.Empty(t, pluginsResp.Inactive)
					require.Equal(t, pluginsResp.Active, []*model.PluginInfo{{
						Manifest: *manifest,
					}})
				}

				// Remove plugin
				_, err = client.RemovePlugin(context.Background(), manifest.Id)
				require.NoError(t, err)

				// Plugin should have no status
				pluginsResp, _, err = client.GetPlugins(context.Background())
				require.NoError(t, err)
				require.Empty(t, pluginsResp.Inactive)
				require.Empty(t, pluginsResp.Active)

				// Upload same plugin
				manifest, _, err = client.UploadPlugin(context.Background(), bytes.NewReader(tarData))
				require.NoError(t, err)
				require.Equal(t, "testplugin", manifest.Id)

				// Plugin should be inactive
				pluginsResp, _, err = client.GetPlugins(context.Background())
				require.NoError(t, err)
				require.Empty(t, pluginsResp.Active)
				require.Equal(t, pluginsResp.Inactive, []*model.PluginInfo{{
					Manifest: *manifest,
				}})

				// Clean up
				_, err = client.RemovePlugin(context.Background(), manifest.Id)
				require.NoError(t, err)
			})
		})
	}
}

func findClusterMessages(event model.ClusterEvent, msgs []*model.ClusterMessage) []*model.ClusterMessage {
	var result []*model.ClusterMessage
	for _, msg := range msgs {
		if msg.Event == event {
			result = append(result, msg)
		}
	}
	return result
}

func TestPluginWebSocketSession(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic(t)

	pluginID := "com.mattermost.websocket_session_test"

	// Compile plugin
	fullPath := filepath.Join(server.GetPackagePath(), "channels", "app", "plugin_api_tests", "manual.test_websocket_session", "main.go")
	pluginCode, err := os.ReadFile(fullPath)
	require.NoError(t, err)
	require.NotEmpty(t, pluginCode)
	pluginDir, err := filepath.Abs(*th.App.Config().PluginSettings.Directory)
	require.NoError(t, err)
	backend := filepath.Join(pluginDir, pluginID, "backend.exe")
	utils.CompileGo(t, string(pluginCode), backend)
	err = os.WriteFile(filepath.Join(pluginDir, pluginID, "plugin.json"), []byte(`{"id": "`+pluginID+`", "server": {"executable": "backend.exe"}}`), 0600)
	require.NoError(t, err)

	// Activate the plugin
	manifest, activated, reterr := th.App.GetPluginsEnvironment().Activate(pluginID)
	require.NoError(t, reterr)
	require.NotNil(t, manifest)
	require.True(t, activated)

	// Connect through WebSocket and send a message
	reqURL := fmt.Sprintf("ws://localhost:%d", th.Server.ListenAddr.Port)
	wsc, err := model.NewWebSocketClient4(reqURL, th.Client.AuthToken)
	require.NoError(t, err)
	require.NotNil(t, wsc)
	wsc.Listen()
	defer wsc.Close()
	resp := <-wsc.ResponseChannel
	require.Equal(t, resp.Status, model.StatusOk)
	wsc.SendMessage("custom_action", map[string]any{"value": "test"})

	// Get session for user
	sessions, _, err := th.Client.GetSessions(context.Background(), th.BasicUser.Id, "")
	require.NoError(t, err)
	require.NotEmpty(t, sessions)

	// Verify the session has been set correctly. Check plugin code in
	// channels/app/plugin_api_tests/manual.test_websocket_session
	//
	// Here the MessageWillBePosted hook is used purely as a way to
	// communicate with the plugin side.
	hooks, err := th.App.GetPluginsEnvironment().HooksForPlugin(pluginID)
	require.NoError(t, err)
	require.NotNil(t, hooks)
	_, sessionID := hooks.MessageWillBePosted(nil, nil)
	require.Equal(t, sessions[0].Id, sessionID)
}

func TestPluginWebSocketRemoteAddress(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic(t)

	pluginID := "com.mattermost.websocket_remote_address_test"

	// Compile plugin
	fullPath := filepath.Join(server.GetPackagePath(), "channels", "app", "plugin_api_tests", "manual.test_websocket_remote_address", "main.go")
	pluginCode, err := os.ReadFile(fullPath)
	require.NoError(t, err)
	require.NotEmpty(t, pluginCode)
	pluginDir, err := filepath.Abs(*th.App.Config().PluginSettings.Directory)
	require.NoError(t, err)
	backend := filepath.Join(pluginDir, pluginID, "backend.exe")
	utils.CompileGo(t, string(pluginCode), backend)
	err = os.WriteFile(filepath.Join(pluginDir, pluginID, "plugin.json"), []byte(`{"id": "`+pluginID+`", "server": {"executable": "backend.exe"}}`), 0600)
	require.NoError(t, err)

	// Activate the plugin
	manifest, activated, reterr := th.App.GetPluginsEnvironment().Activate(pluginID)
	require.NoError(t, reterr)
	require.NotNil(t, manifest)
	require.True(t, activated)

	// Connect through WebSocket and send a message
	reqURL := fmt.Sprintf("ws://localhost:%d", th.Server.ListenAddr.Port)
	wsc, err := model.NewWebSocketClient4(reqURL, th.Client.AuthToken)
	require.NoError(t, err)
	require.NotNil(t, wsc)
	wsc.Listen()
	defer wsc.Close()
	resp := <-wsc.ResponseChannel
	require.Equal(t, resp.Status, model.StatusOk)
	wsc.SendMessage("custom_action", map[string]any{"value": "test"})

	// Verify the remote address has been set correctly. Check plugin code in
	// channels/app/plugin_api_tests/manual.test_websocket_remote_address
	//
	// Here the MessageWillBePosted hook is used purely as a way to
	// communicate with the plugin side.
	hooks, err := th.App.GetPluginsEnvironment().HooksForPlugin(pluginID)
	require.NoError(t, err)
	require.NotNil(t, hooks)
	_, remoteAddr := hooks.MessageWillBePosted(nil, nil)
	require.NotEmpty(t, remoteAddr)
}
