// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/mattermost/mattermost/server/v8/channels/testlib"
	"github.com/mattermost/mattermost/server/v8/channels/utils/fileutils"
)

func getHashedKey(key string) string {
	hash := sha256.New()
	hash.Write([]byte(key))
	return base64.StdEncoding.EncodeToString(hash.Sum(nil))
}

func TestPluginKeyValueStore(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	pluginID := "testpluginid"

	defer func() {
		assert.Nil(t, th.App.DeletePluginKey(pluginID, "key"))
		assert.Nil(t, th.App.DeletePluginKey(pluginID, "key2"))
		assert.Nil(t, th.App.DeletePluginKey(pluginID, "key3"))
		assert.Nil(t, th.App.DeletePluginKey(pluginID, "key4"))
	}()

	assert.Nil(t, th.App.SetPluginKey(pluginID, "key", []byte("test")))
	ret, err := th.App.GetPluginKey(pluginID, "key")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test"), ret)

	// Test inserting over existing entries
	assert.Nil(t, th.App.SetPluginKey(pluginID, "key", []byte("test2")))
	ret, err = th.App.GetPluginKey(pluginID, "key")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test2"), ret)

	// Test getting non-existent key
	ret, err = th.App.GetPluginKey(pluginID, "notakey")
	assert.Nil(t, err)
	assert.Nil(t, ret)

	// Test deleting non-existent keys.
	assert.Nil(t, th.App.DeletePluginKey(pluginID, "notrealkey"))

	// Verify behaviour for the old approach that involved storing the hashed keys.
	hashedKey2 := getHashedKey("key2")
	kv := &model.PluginKeyValue{
		PluginId: pluginID,
		Key:      hashedKey2,
		Value:    []byte("test"),
		ExpireAt: 0,
	}

	_, nErr := th.App.Srv().Store().Plugin().SaveOrUpdate(kv)
	assert.NoError(t, nErr)

	// Test fetch by keyname (this key does not exist but hashed key will be used for lookup)
	ret, err = th.App.GetPluginKey(pluginID, "key2")
	assert.Nil(t, err)
	assert.Equal(t, kv.Value, ret)

	// Test fetch by hashed keyname
	ret, err = th.App.GetPluginKey(pluginID, hashedKey2)
	assert.Nil(t, err)
	assert.Equal(t, kv.Value, ret)

	// Test ListKeys
	assert.Nil(t, th.App.SetPluginKey(pluginID, "key3", []byte("test3")))
	assert.Nil(t, th.App.SetPluginKey(pluginID, "key4", []byte("test4")))

	list, err := th.App.ListPluginKeys(pluginID, 0, 1)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key"}, list)

	list, err = th.App.ListPluginKeys(pluginID, 1, 1)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key3"}, list)

	list, err = th.App.ListPluginKeys(pluginID, 0, 4)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key", "key3", "key4", hashedKey2}, list)

	list, err = th.App.ListPluginKeys(pluginID, 0, 2)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key", "key3"}, list)

	list, err = th.App.ListPluginKeys(pluginID, 1, 2)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key4", hashedKey2}, list)

	list, err = th.App.ListPluginKeys(pluginID, 2, 2)
	assert.Nil(t, err)
	assert.Equal(t, []string{}, list)

	// List Keys bad input
	list, err = th.App.ListPluginKeys(pluginID, 0, 0)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key", "key3", "key4", hashedKey2}, list)

	list, err = th.App.ListPluginKeys(pluginID, 0, -1)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key", "key3", "key4", hashedKey2}, list)

	list, err = th.App.ListPluginKeys(pluginID, -1, 1)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key"}, list)

	list, err = th.App.ListPluginKeys(pluginID, -1, 0)
	assert.Nil(t, err)
	assert.Equal(t, []string{"key", "key3", "key4", hashedKey2}, list)
}

func TestPluginKeyValueStoreCompareAndSet(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	pluginID := "testpluginid"

	defer func() {
		assert.Nil(t, th.App.DeletePluginKey(pluginID, "key"))
	}()

	// Set using Set api for key2
	assert.Nil(t, th.App.SetPluginKey(pluginID, "key2", []byte("test")))
	ret, err := th.App.GetPluginKey(pluginID, "key2")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test"), ret)

	// Attempt to insert value for key2
	updated, err := th.App.CompareAndSetPluginKey(pluginID, "key2", nil, []byte("test2"))
	assert.Nil(t, err)
	assert.False(t, updated)
	ret, err = th.App.GetPluginKey(pluginID, "key2")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test"), ret)

	// Insert new value for key
	updated, err = th.App.CompareAndSetPluginKey(pluginID, "key", nil, []byte("test"))
	assert.Nil(t, err)
	assert.True(t, updated)
	ret, err = th.App.GetPluginKey(pluginID, "key")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test"), ret)

	// Should fail to insert again
	updated, err = th.App.CompareAndSetPluginKey(pluginID, "key", nil, []byte("test3"))
	assert.Nil(t, err)
	assert.False(t, updated)
	ret, err = th.App.GetPluginKey(pluginID, "key")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test"), ret)

	// Test updating using incorrect old value
	updated, err = th.App.CompareAndSetPluginKey(pluginID, "key", []byte("oldvalue"), []byte("test3"))
	assert.Nil(t, err)
	assert.False(t, updated)
	ret, err = th.App.GetPluginKey(pluginID, "key")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test"), ret)

	// Test updating using correct old value
	updated, err = th.App.CompareAndSetPluginKey(pluginID, "key", []byte("test"), []byte("test2"))
	assert.Nil(t, err)
	assert.True(t, updated)
	ret, err = th.App.GetPluginKey(pluginID, "key")
	assert.Nil(t, err)
	assert.Equal(t, []byte("test2"), ret)
}

func TestPluginKeyValueStoreSetWithOptionsJSON(t *testing.T) {
	mainHelper.Parallel(t)
	pluginID := "testpluginid"

	t.Run("storing a value without providing options works", func(t *testing.T) {
		th := Setup(t)

		result, err := th.App.SetPluginKeyWithOptions(pluginID, "key", []byte("value-1"), model.PluginKVSetOptions{})
		assert.True(t, result)
		assert.Nil(t, err)

		// and I can get it back!
		ret, err := th.App.GetPluginKey(pluginID, "key")
		assert.Nil(t, err)
		assert.Equal(t, []byte(`value-1`), ret)
	})

	t.Run("test that setting it atomic when it doesn't match doesn't change anything", func(t *testing.T) {
		th := Setup(t)

		err := th.App.SetPluginKey(pluginID, "key", []byte("value-1"))
		require.Nil(t, err)

		result, err := th.App.SetPluginKeyWithOptions(pluginID, "key", []byte("value-3"), model.PluginKVSetOptions{
			Atomic:   true,
			OldValue: []byte("value-2"),
		})
		assert.False(t, result)
		assert.Nil(t, err)

		// test that the value didn't change
		ret, err := th.App.GetPluginKey(pluginID, "key")
		assert.Nil(t, err)
		assert.Equal(t, []byte(`value-1`), ret)
	})

	t.Run("test the atomic change with the proper old value", func(t *testing.T) {
		th := Setup(t)

		err := th.App.SetPluginKey(pluginID, "key", []byte("value-2"))
		require.Nil(t, err)

		result, err := th.App.SetPluginKeyWithOptions(pluginID, "key", []byte("value-3"), model.PluginKVSetOptions{
			Atomic:   true,
			OldValue: []byte("value-2"),
		})
		assert.True(t, result)
		assert.Nil(t, err)

		// test that the value did change
		ret, err := th.App.GetPluginKey(pluginID, "key")
		assert.Nil(t, err)
		assert.Equal(t, []byte(`value-3`), ret)
	})

	t.Run("when new value is nil and old value matches with the current, it should delete the currently set value", func(t *testing.T) {
		th := Setup(t)

		// first set a value.
		result, err := th.App.SetPluginKeyWithOptions(pluginID, "nil-test-key-2", []byte("value-1"), model.PluginKVSetOptions{})
		require.Nil(t, err)
		require.True(t, result)

		// now it should delete the set value.
		result, err = th.App.SetPluginKeyWithOptions(pluginID, "nil-test-key-2", nil, model.PluginKVSetOptions{
			Atomic:   true,
			OldValue: []byte("value-1"),
		})
		assert.Nil(t, err)
		assert.True(t, result)

		ret, err := th.App.GetPluginKey(pluginID, "nil-test-key-2")
		assert.Nil(t, err)
		assert.Nil(t, ret)
	})

	t.Run("when new value is nil and there is a value set for the key already, it should delete the currently set value", func(t *testing.T) {
		th := Setup(t)

		// first set a value.
		result, err := th.App.SetPluginKeyWithOptions(pluginID, "nil-test-key-3", []byte("value-1"), model.PluginKVSetOptions{})
		require.Nil(t, err)
		require.True(t, result)

		// now it should delete the set value.
		result, err = th.App.SetPluginKeyWithOptions(pluginID, "nil-test-key-3", nil, model.PluginKVSetOptions{})
		assert.Nil(t, err)
		assert.True(t, result)

		// verify a nil value is returned
		ret, err := th.App.GetPluginKey(pluginID, "nil-test-key-3")
		assert.Nil(t, err)
		assert.Nil(t, ret)

		// verify the row is actually gone
		list, err := th.App.ListPluginKeys(pluginID, 0, 1)
		assert.Nil(t, err)
		assert.Empty(t, list)
	})

	t.Run("when old value is nil and there is no value set for the key before, it should set the new value", func(t *testing.T) {
		th := Setup(t)

		result, err := th.App.SetPluginKeyWithOptions(pluginID, "nil-test-key-4", []byte("value-1"), model.PluginKVSetOptions{
			Atomic:   true,
			OldValue: nil,
		})
		assert.Nil(t, err)
		assert.True(t, result)

		ret, err := th.App.GetPluginKey(pluginID, "nil-test-key-4")
		assert.Nil(t, err)
		assert.Equal(t, []byte("value-1"), ret)
	})

	t.Run("test that value is set and unset with ExpireInSeconds", func(t *testing.T) {
		th := Setup(t)

		result, err := th.App.SetPluginKeyWithOptions(pluginID, "key", []byte("value-1"), model.PluginKVSetOptions{
			ExpireInSeconds: 1,
		})
		assert.True(t, result)
		assert.Nil(t, err)

		// test that the value is set
		ret, err := th.App.GetPluginKey(pluginID, "key")
		assert.Nil(t, err)
		assert.Equal(t, []byte(`value-1`), ret)

		// test that the value is not longer
		time.Sleep(1500 * time.Millisecond)

		ret, err = th.App.GetPluginKey(pluginID, "key")
		assert.Nil(t, err)
		assert.Nil(t, ret)
	})
}

func TestGetPluginStatusesDisabled(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.Enable = false
	})

	_, err := th.App.GetPluginStatuses()
	require.NotNil(t, err)
	require.EqualError(t, err, "GetPluginStatuses: Plugins have been disabled. Please check your logs for details.")
}

func TestGetPluginStatuses(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.Enable = true
	})

	pluginStatuses, err := th.App.GetPluginStatuses()
	require.Nil(t, err)
	require.NotNil(t, pluginStatuses)
}

func TestPluginSync(t *testing.T) {
	mainHelper.Parallel(t)
	path, _ := fileutils.FindDir("tests")

	th := SetupConfig(t, func(cfg *model.Config) {
		cfg.PluginSettings.SignaturePublicKeyFiles = []string{
			filepath.Join(path, "development-private-key.asc"),
		}
	})

	testCases := []struct {
		Description string
		ConfigFunc  func(cfg *model.Config)
	}{
		{
			"local",
			func(cfg *model.Config) {
				cfg.FileSettings.DriverName = model.NewPointer(model.ImageDriverLocal)
			},
		},
		{
			"s3",
			func(cfg *model.Config) {
				s3Host := os.Getenv("CI_MINIO_HOST")
				if s3Host == "" {
					s3Host = "localhost"
				}

				s3Port := os.Getenv("CI_MINIO_PORT")
				if s3Port == "" {
					s3Port = "9000"
				}

				s3Endpoint := fmt.Sprintf("%s:%s", s3Host, s3Port)
				cfg.FileSettings.DriverName = model.NewPointer(model.ImageDriverS3)
				cfg.FileSettings.AmazonS3AccessKeyId = model.NewPointer(model.MinioAccessKey)
				cfg.FileSettings.AmazonS3SecretAccessKey = model.NewPointer(model.MinioSecretKey)
				cfg.FileSettings.AmazonS3Bucket = model.NewPointer(model.MinioBucket)
				cfg.FileSettings.AmazonS3PathPrefix = model.NewPointer("")
				cfg.FileSettings.AmazonS3Endpoint = model.NewPointer(s3Endpoint)
				cfg.FileSettings.AmazonS3Region = model.NewPointer("")
				cfg.FileSettings.AmazonS3SSL = model.NewPointer(false)
			},
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.Description, func(t *testing.T) {
			th.App.UpdateConfig(func(cfg *model.Config) {
				*cfg.PluginSettings.Enable = true
				testCase.ConfigFunc(cfg)
			})

			env := th.App.GetPluginsEnvironment()
			require.NotNil(t, env)

			t.Run("new bundle in the file store", func(t *testing.T) {
				th.App.UpdateConfig(func(cfg *model.Config) {
					*cfg.PluginSettings.RequirePluginSignature = false
				})

				fileReader, err := os.Open(filepath.Join(path, "testplugin.tar.gz"))
				require.NoError(t, err)
				defer fileReader.Close()

				_, appErr := th.App.WriteFile(fileReader, getBundleStorePath("testplugin"))
				checkNoError(t, appErr)

				appErr = th.App.SyncPlugins()
				checkNoError(t, appErr)

				// Check if installed
				pluginStatus, err := env.Statuses()
				require.NoError(t, err)
				require.Len(t, pluginStatus, 1)
				require.Equal(t, pluginStatus[0].PluginId, "testplugin")
			})

			t.Run("bundle removed from the file store", func(t *testing.T) {
				th.App.UpdateConfig(func(cfg *model.Config) {
					*cfg.PluginSettings.RequirePluginSignature = false
				})

				appErr := th.App.RemoveFile(getBundleStorePath("testplugin"))
				checkNoError(t, appErr)

				appErr = th.App.SyncPlugins()
				checkNoError(t, appErr)

				// Check if removed
				pluginStatus, err := env.Statuses()
				require.NoError(t, err)
				require.Empty(t, pluginStatus)
			})

			t.Run("plugin signatures required, no signature", func(t *testing.T) {
				th.App.UpdateConfig(func(cfg *model.Config) {
					*cfg.PluginSettings.RequirePluginSignature = true
				})

				pluginFileReader, err := os.Open(filepath.Join(path, "testplugin.tar.gz"))
				require.NoError(t, err)
				defer pluginFileReader.Close()
				_, appErr := th.App.WriteFile(pluginFileReader, getBundleStorePath("testplugin"))
				checkNoError(t, appErr)

				appErr = th.App.SyncPlugins()
				checkNoError(t, appErr)
				pluginStatus, err := env.Statuses()
				require.NoError(t, err)
				require.Len(t, pluginStatus, 0)
			})

			t.Run("plugin signatures required, wrong signature", func(t *testing.T) {
				th.App.UpdateConfig(func(cfg *model.Config) {
					*cfg.PluginSettings.RequirePluginSignature = true
				})

				signatureFileReader, err := os.Open(filepath.Join(path, "testplugin2.tar.gz.sig"))
				require.NoError(t, err)
				defer signatureFileReader.Close()
				_, appErr := th.App.WriteFile(signatureFileReader, getSignatureStorePath("testplugin"))
				checkNoError(t, appErr)

				appErr = th.App.SyncPlugins()
				checkNoError(t, appErr)

				pluginStatus, err := env.Statuses()
				require.NoError(t, err)
				require.Len(t, pluginStatus, 0)
			})

			t.Run("plugin signatures required, correct signature", func(t *testing.T) {
				th.App.UpdateConfig(func(cfg *model.Config) {
					*cfg.PluginSettings.RequirePluginSignature = true
				})

				signatureFileReader, err := os.Open(filepath.Join(path, "testplugin.tar.gz.sig"))
				require.NoError(t, err)
				defer signatureFileReader.Close()
				_, appErr := th.App.WriteFile(signatureFileReader, getSignatureStorePath("testplugin"))
				checkNoError(t, appErr)

				appErr = th.App.SyncPlugins()
				checkNoError(t, appErr)

				pluginStatus, err := env.Statuses()
				require.NoError(t, err)
				require.Len(t, pluginStatus, 1)
				require.Equal(t, pluginStatus[0].PluginId, "testplugin")

				appErr = th.App.DeletePublicKey("pub_key")
				checkNoError(t, appErr)

				appErr = th.App.ch.RemovePlugin("testplugin")
				checkNoError(t, appErr)
			})
		})
	}
}

// See https://github.com/mattermost/mattermost-server/issues/19189
func TestChannelsPluginsInit(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	runNoPanicTest := func(t *testing.T) {
		path, _ := fileutils.FindDir("tests")

		require.NotPanics(t, func() {
			th.Server.Channels().initPlugins(th.Context, path, path)
		})
	}

	t.Run("no panics when plugins enabled", func(t *testing.T) {
		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
		})

		runNoPanicTest(t)
	})

	t.Run("no panics when plugins disabled", func(t *testing.T) {
		th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
		})

		runNoPanicTest(t)
	})
}

func TestSyncPluginsActiveState(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.Enable = true
	})

	env := th.App.GetPluginsEnvironment()
	require.NotNil(t, env)

	th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.RequirePluginSignature = false
	})

	path, _ := fileutils.FindDir("tests")
	fileReader, err := os.Open(filepath.Join(path, "testplugin.tar.gz"))
	require.NoError(t, err)
	defer fileReader.Close()

	_, appErr := th.App.WriteFile(fileReader, getBundleStorePath("testplugin"))
	checkNoError(t, appErr)

	// Sync with file store so the plugin environment has access to this plugin.
	appErr = th.App.SyncPlugins()
	checkNoError(t, appErr)

	// Verify the plugin was installed and set to deactivated.
	pluginStatus, err := env.Statuses()
	require.NoError(t, err)
	require.Len(t, pluginStatus, 1)
	require.Equal(t, pluginStatus[0].PluginId, "testplugin")
	require.Equal(t, pluginStatus[0].State, model.PluginStateNotRunning)

	// Enable plugin by setting setting config. This implicitly calls SyncPluginsActiveState through a config listener.
	th.App.UpdateConfig(func(cfg *model.Config) {
		cfg.PluginSettings.PluginStates["testplugin"] = &model.PluginState{Enable: true}
	})

	// Verify the plugin was activated due to config change.
	pluginStatus, err = env.Statuses()
	require.NoError(t, err)
	require.Len(t, pluginStatus, 1)
	require.Equal(t, pluginStatus[0].PluginId, "testplugin")
	require.Equal(t, pluginStatus[0].State, model.PluginStateRunning)

	// Disable plugin by setting config. This implicitly calls SyncPluginsActiveState through a config listener.
	th.App.UpdateConfig(func(cfg *model.Config) {
		cfg.PluginSettings.PluginStates["testplugin"] = &model.PluginState{Enable: false}
	})

	// Verify the plugin was deactivated due to config change.
	pluginStatus, err = env.Statuses()
	require.NoError(t, err)
	require.Len(t, pluginStatus, 1)
	require.Equal(t, pluginStatus[0].PluginId, "testplugin")
	require.Equal(t, pluginStatus[0].State, model.PluginStateNotRunning)
}

func TestPluginPanicLogs(t *testing.T) {
	mainHelper.Parallel(t)
	t.Run("should panic", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		tearDown, _, _ := SetAppEnvironmentWithPlugins(t, []string{
			`
		package main

		import (
			"github.com/mattermost/mattermost/server/public/plugin"
			"github.com/mattermost/mattermost/server/public/model"
		)

		type MyPlugin struct {
			plugin.MattermostPlugin
		}

		func (p *MyPlugin) MessageWillBePosted(c *plugin.Context, post *model.Post) (*model.Post, string) {
			panic("some text from panic")
			return nil, ""
		}

		func main() {
			plugin.ClientMain(&MyPlugin{})
		}
		`,
		}, th.App, th.NewPluginAPI)

		post := &model.Post{
			UserId:    th.BasicUser.Id,
			ChannelId: th.BasicChannel.Id,
			Message:   "message_",
			CreateAt:  model.GetMillis() - 10000,
		}
		_, _, err := th.App.CreatePost(th.Context, post, th.BasicChannel, model.CreatePostFlags{SetOnline: true})
		assert.Nil(t, err)

		th.TestLogger.Flush()

		// We shutdown plugins first so that the read on the log buffer is race-free.
		th.App.ch.ShutDownPlugins()
		tearDown()

		testlib.AssertLog(t, th.LogBuffer, mlog.LvlDebug.Name, "panic: some text from panic")
	})
}

func TestPluginStatusActivateError(t *testing.T) {
	mainHelper.Parallel(t)
	t.Run("should return error from OnActivate in plugin statuses", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		pluginSource := `
		package main

		import (
			"errors"

			"github.com/mattermost/mattermost/server/public/plugin"
		)

		type MyPlugin struct {
			plugin.MattermostPlugin
		}

		func (p *MyPlugin) OnActivate() error {
			return errors.New("sample error")
		}

		func main() {
			plugin.ClientMain(&MyPlugin{})
		}
		`

		tearDown, _, _ := SetAppEnvironmentWithPlugins(t, []string{pluginSource}, th.App, th.NewPluginAPI)
		defer tearDown()

		env := th.App.GetPluginsEnvironment()
		pluginStatus, err := env.Statuses()
		require.NoError(t, err)
		require.Len(t, pluginStatus, 1)
		require.Equal(t, "sample error", pluginStatus[0].Error)
	})
}

type byID []*plugin.PrepackagedPlugin

func (a byID) Len() int           { return len(a) }
func (a byID) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a byID) Less(i, j int) bool { return a[i].Manifest.Id < a[j].Manifest.Id }

type pluginStatusById model.PluginStatuses

func (a pluginStatusById) Len() int           { return len(a) }
func (a pluginStatusById) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a pluginStatusById) Less(i, j int) bool { return a[i].PluginId < a[j].PluginId }

func TestGetPluginStateOverride(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	t.Run("no override", func(t *testing.T) {
		overrides, value := th.App.ch.getPluginStateOverride("example-plugin")
		require.False(t, overrides)
		require.False(t, value)
	})

	t.Run("apps override", func(t *testing.T) {
		t.Run("without enabled flag", func(t *testing.T) {
			overrides, value := th.App.ch.getPluginStateOverride("com.mattermost.apps")
			require.True(t, overrides)
			require.False(t, value)
		})

		t.Run("with enabled flag set to true", func(t *testing.T) {
			mainHelper.Parallel(t)
			th2 := SetupConfig(t, func(cfg *model.Config) {
				cfg.FeatureFlags.AppsEnabled = true
			})

			overrides, value := th2.App.ch.getPluginStateOverride("com.mattermost.apps")
			require.False(t, overrides)
			require.False(t, value)
		})

		t.Run("with enabled flag set to false", func(t *testing.T) {
			mainHelper.Parallel(t)
			th2 := SetupConfig(t, func(cfg *model.Config) {
				cfg.FeatureFlags.AppsEnabled = false
			})

			overrides, value := th2.App.ch.getPluginStateOverride("com.mattermost.apps")
			require.True(t, overrides)
			require.False(t, value)
		})
	})
}
