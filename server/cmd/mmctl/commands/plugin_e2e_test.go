// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package commands

import (
	"fmt"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/v8"

	"path/filepath"

	"github.com/spf13/cobra"

	"github.com/mattermost/mattermost/server/v8/cmd/mmctl/client"
	"github.com/mattermost/mattermost/server/v8/cmd/mmctl/printer"
)

func removePluginIfInstalled(c client.Client, s *MmctlE2ETestSuite, pluginID string) {
	appErr := pluginDeleteCmdF(c, &cobra.Command{}, []string{pluginID})
	if appErr != nil {
		s.Require().Contains(appErr.Error(), "Unable to delete plugin.")
	}
}

func (s *MmctlE2ETestSuite) TestPluginAddCmd() {
	s.SetupTestHelper().InitBasic(s.T())

	pluginPath := filepath.Join(server.GetPackagePath(), "tests", "testplugin.tar.gz")

	s.RunForSystemAdminAndLocal("add an already installed plugin without force", func(c client.Client) {
		printer.Clean()

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
			*cfg.PluginSettings.EnableUploads = false
		})

		err := pluginAddCmdF(c, &cobra.Command{}, []string{pluginPath})
		s.Require().Nil(err)

		s.Require().Equal(1, len(printer.GetLines()))
		s.Require().Contains(printer.GetLines()[0], "Added plugin: ")

		printer.Clean()

		err = pluginAddCmdF(c, &cobra.Command{}, []string{pluginPath})
		s.Require().ErrorContains(err, "Unable to install plugin. A plugin with the same ID is already installed.")

		s.Require().Equal(0, len(printer.GetLines()))
		s.Require().Equal(1, len(printer.GetErrorLines()))
		s.Require().Contains(printer.GetErrorLines()[0], "Unable to install plugin. A plugin with the same ID is already installed.")

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 1)

		// teardown
		pInfo := plugins.Inactive[0]
		err = pluginDeleteCmdF(c, &cobra.Command{}, []string{pInfo.Id})
		s.Require().Nil(err)
	})

	s.RunForSystemAdminAndLocal("add an already installed plugin with force", func(c client.Client) {
		printer.Clean()

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
			*cfg.PluginSettings.EnableUploads = false
		})

		err := pluginAddCmdF(c, &cobra.Command{}, []string{pluginPath})
		s.Require().Nil(err)

		s.Require().Equal(1, len(printer.GetLines()))
		s.Require().Contains(printer.GetLines()[0], "Added plugin: ")

		printer.Clean()

		cmd := &cobra.Command{}
		cmd.Flags().Bool("force", true, "")
		err = pluginAddCmdF(c, cmd, []string{pluginPath})
		s.Require().Nil(err)

		s.Require().Equal(1, len(printer.GetLines()))
		s.Require().Equal(0, len(printer.GetErrorLines()))
		s.Require().Contains(printer.GetLines()[0], "Added plugin: ")

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 1)

		// teardown
		pInfo := plugins.Inactive[0]
		err = pluginDeleteCmdF(c, &cobra.Command{}, []string{pInfo.Id})
		s.Require().Nil(err)
	})

	s.RunForSystemAdminAndLocal("admin and local can't add plugins if the config doesn't allow it", func(c client.Client) {
		printer.Clean()

		err := pluginAddCmdF(c, &cobra.Command{}, []string{pluginPath})
		s.Require().ErrorContains(err, "Plugins and/or plugin uploads have been disabled.")
		s.Require().Equal(1, len(printer.GetErrorLines()))
		s.Require().Contains(printer.GetErrorLines()[0], "Plugins and/or plugin uploads have been disabled.")
	})

	s.RunForSystemAdminAndLocal("admin and local can add a plugin if the config allows it", func(c client.Client) {
		printer.Clean()

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
			*cfg.PluginSettings.EnableUploads = false
		})

		err := pluginAddCmdF(c, &cobra.Command{}, []string{pluginPath})
		s.Require().Nil(err)

		s.Require().Equal(1, len(printer.GetLines()))
		s.Require().Contains(printer.GetLines()[0], "Added plugin: ")

		res, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Equal(1, len(res.Inactive))

		// teardown
		pInfo := res.Inactive[0]
		err = pluginDeleteCmdF(c, &cobra.Command{}, []string{pInfo.Id})
		s.Require().Nil(err)
	})

	s.Run("normal user can't add plugin", func() {
		printer.Clean()

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
			*cfg.PluginSettings.EnableUploads = false
		})

		err := pluginAddCmdF(s.th.Client, &cobra.Command{}, []string{pluginPath})
		s.Require().ErrorContains(err, "You do not have the appropriate permissions")
		s.Require().Equal(1, len(printer.GetErrorLines()))
		s.Require().Contains(printer.GetErrorLines()[0], "You do not have the appropriate permissions")
	})
}

func (s *MmctlE2ETestSuite) TestPluginDeleteCmd() {
	s.SetupTestHelper().InitBasic(s.T())

	const (
		pluginID      = "testplugin"
		dummyPluginID = "randompluginxz" // This will be used to check response when tried to delete this plugin with randomchars which was not installed/enabled already
	)
	pluginPath := filepath.Join(server.GetPackagePath(), "tests", "testplugin.tar.gz")

	s.RunForSystemAdminAndLocal("Delete Plugin", func(c client.Client) {
		printer.Clean()

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
			*cfg.PluginSettings.EnableUploads = false
		})

		errInstall := pluginAddCmdF(c, &cobra.Command{}, []string{pluginPath})
		s.Require().Nil(errInstall)
		s.Require().Len(printer.GetLines(), 1)
		s.Require().Len(printer.GetErrorLines(), 0)
		s.Require().Equal("Added plugin: "+pluginPath, printer.GetLines()[0])

		pluginsAvail, appErrInstall := s.th.App.GetPlugins()
		s.Require().Nil(appErrInstall)
		s.Require().Len(pluginsAvail.Active, 0)
		s.Require().Len(pluginsAvail.Inactive, 1)

		err := pluginDeleteCmdF(c, &cobra.Command{}, []string{pluginID})
		s.Require().Nil(err)

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 0)
	})

	s.RunForSystemAdminAndLocal("Delete Unknown Plugin", func(c client.Client) {
		printer.Clean()

		err := pluginDeleteCmdF(c, &cobra.Command{}, []string{dummyPluginID})
		s.Require().ErrorContains(err, "Plugins have been disabled.")
		s.Require().Len(printer.GetLines(), 0)
		s.Require().Len(printer.GetErrorLines(), 1)
		s.Require().Contains(printer.GetErrorLines()[0], fmt.Sprintf("Unable to delete plugin: %s.", dummyPluginID))
		s.Require().Contains(printer.GetErrorLines()[0], "Plugins have been disabled.")
	})

	s.Run("Delete a Plugin without permissions", func() {
		printer.Clean()

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
			*cfg.PluginSettings.EnableUploads = true
		})

		defer func() {
			errDelete := pluginDeleteCmdF(s.th.SystemAdminClient, &cobra.Command{}, []string{pluginID})
			s.Require().Nil(errDelete)
			s.th.App.UpdateConfig(func(cfg *model.Config) {
				*cfg.PluginSettings.Enable = false
				*cfg.PluginSettings.EnableUploads = false
			})
		}()

		// Installs plugin using SystemAdmin privilege so that delete plugin test can be done.
		errInstall := pluginAddCmdF(s.th.SystemAdminClient, &cobra.Command{}, []string{pluginPath})
		s.Require().Nil(errInstall)
		s.Require().Len(printer.GetLines(), 1)
		s.Require().Len(printer.GetErrorLines(), 0)
		s.Require().Equal("Added plugin: "+pluginPath, printer.GetLines()[0])

		pluginsAvail, appErrInstall := s.th.App.GetPlugins()
		s.Require().Nil(appErrInstall)
		s.Require().Len(pluginsAvail.Active, 0)
		s.Require().Len(pluginsAvail.Inactive, 1)

		// Delete Test
		err := pluginDeleteCmdF(s.th.Client, &cobra.Command{}, []string{pluginID})
		s.Require().ErrorContains(err, "You do not have the appropriate permissions.")
		s.Require().Len(printer.GetLines(), 1)
		s.Require().Len(printer.GetErrorLines(), 1)
		s.Require().Contains(printer.GetErrorLines()[0], fmt.Sprintf("Unable to delete plugin: %s.", pluginID))
		s.Require().Contains(printer.GetErrorLines()[0], "You do not have the appropriate permissions.")

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 1)
	})
}

func (s *MmctlE2ETestSuite) TestPluginListCmdF() {
	s.SetupTestHelper().InitBasic(s.T())

	s.Run("Error when appropriate permissions are not available", func() {
		printer.Clean()

		enablePlugin := *s.th.App.Config().PluginSettings.Enable
		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
		})
		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = enablePlugin
		})

		cmd := &cobra.Command{}

		err := pluginListCmdF(s.th.Client, cmd, []string{})
		s.Require().Error(err)
		s.Require().Len(printer.GetLines(), 0)
		s.Require().Len(printer.GetErrorLines(), 0)
		s.Equal("Unable to list plugins. Error: You do not have the appropriate permissions.", err.Error())
	})

	s.RunForSystemAdminAndLocal("Error when plugins are disabled", func(c client.Client) {
		printer.Clean()

		enablePlugin := *s.th.App.Config().PluginSettings.Enable
		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
		})
		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = enablePlugin
		})

		cmd := &cobra.Command{}

		err := pluginListCmdF(c, cmd, []string{})
		s.Require().Error(err)
		s.Require().Len(printer.GetLines(), 0)
		s.Require().Len(printer.GetErrorLines(), 0)
		s.Equal("Unable to list plugins. Error: Plugins have been disabled. Please check your logs for details.", err.Error())
	})

	s.RunForSystemAdminAndLocal("Success when appropriate permissions are available", func(c client.Client) {
		printer.Clean()

		enablePlugin := *s.th.App.Config().PluginSettings.Enable
		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
		})
		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = enablePlugin
		})

		cmd := &cobra.Command{}

		err := pluginListCmdF(c, cmd, []string{})
		s.Require().Nil(err)
		s.Require().Len(printer.GetLines(), 3)
		s.Require().Len(printer.GetErrorLines(), 0)
	})

	s.RunForSystemAdminAndLocal("Success when appropriate permissions are available but prints json plugins", func(c client.Client) {
		printer.Clean()

		enablePlugin := *s.th.App.Config().PluginSettings.Enable
		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = true
		})
		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = enablePlugin
		})

		cmd := &cobra.Command{}
		cmd.Flags().String("format", "json", "")

		err := pluginListCmdF(c, cmd, []string{})
		s.Require().Nil(err)
		s.Require().Len(printer.GetLines(), 1)
		s.Require().Len(printer.GetErrorLines(), 0)
	})
}

func (s *MmctlE2ETestSuite) TestPluginDisableCmd() {
	s.SetupTestHelper().InitBasic(s.T())

	pluginID := "testplugin"
	pluginURL := filepath.Join(server.GetPackagePath(), "tests", "testplugin.tar.gz")
	nonExistentPluginID := "nonExistentPluginID"

	enablePlugin := *s.th.App.Config().PluginSettings.Enable
	enableUploads := *s.th.App.Config().PluginSettings.EnableUploads
	defer func() {
		appErr := s.th.App.Channels().RemovePlugin(pluginID)
		if appErr != nil {
			s.Require().Contains(appErr.Error(), "Plugin is not installed.")
		}
		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 0)

		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = enablePlugin
			*cfg.PluginSettings.EnableUploads = enableUploads
		})
	}()
	// Enable plugin uploads
	s.th.App.UpdateConfig(func(cfg *model.Config) {
		*cfg.PluginSettings.Enable = true
		*cfg.PluginSettings.EnableUploads = true
	})

	// Install plugin first
	err := pluginAddCmdF(s.th.SystemAdminClient, &cobra.Command{}, []string{pluginURL})
	s.Require().Nil(err)

	s.RunForSystemAdminAndLocal("Successful disable plugin", func(c client.Client) {
		printer.Clean()

		appErr := s.th.App.EnablePlugin(pluginID)
		s.Require().Nil(appErr)

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 1)
		s.Require().Len(plugins.Inactive, 0)

		cmd := &cobra.Command{}
		err := pluginDisableCmdF(c, cmd, []string{pluginID})
		s.Require().Nil(err)

		plugins, appErr = s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 1)
		s.Require().Len(printer.GetLines(), 1)
		s.Require().Equal(printer.GetLines()[0], "Disabled plugin: "+pluginID)
	})

	s.Run("error for disable plugin due insufficient permissions", func() {
		printer.Clean()

		appErr := s.th.App.EnablePlugin(pluginID)
		s.Require().Nil(appErr)

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 1)
		s.Require().Len(plugins.Inactive, 0)

		cmd := &cobra.Command{}
		err := pluginDisableCmdF(s.th.Client, cmd, []string{pluginID})
		s.Require().NotNil(err)
		s.Require().ErrorContains(err, "You do not have the appropriate permissions.")
		s.Require().Len(printer.GetLines(), 0)
		s.Require().Len(printer.GetErrorLines(), 1)
		s.Require().Equal(printer.GetErrorLines()[0], "Unable to disable plugin: "+pluginID+". Error: You do not have the appropriate permissions.")

		plugins, appErr = s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 1)
		s.Require().Len(plugins.Inactive, 0)

		appErr = s.th.App.DisablePlugin(pluginID)
		s.Require().Nil(appErr)
	})

	s.RunForSystemAdminAndLocal("error for disabling non existent plugin", func(c client.Client) {
		printer.Clean()

		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 1)

		cmd := &cobra.Command{}
		err := pluginDisableCmdF(c, cmd, []string{nonExistentPluginID})
		s.Require().NotNil(err)
		s.Require().ErrorContains(err, "Plugin is not installed.")
		s.Require().Len(printer.GetLines(), 0)
		s.Require().Len(printer.GetErrorLines(), 1)
		s.Require().Equal(printer.GetErrorLines()[0], "Unable to disable plugin: "+nonExistentPluginID+". Error: Plugin is not installed.")

		plugins, appErr = s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 0)
		s.Require().Len(plugins.Inactive, 1)
	})

	s.RunForSystemAdminAndLocal("error when plugin configs are disabled", func(c client.Client) {
		printer.Clean()

		appErr := s.th.App.EnablePlugin(pluginID)
		s.Require().Nil(appErr)
		plugins, appErr := s.th.App.GetPlugins()
		s.Require().Nil(appErr)
		s.Require().Len(plugins.Active, 1)
		s.Require().Len(plugins.Inactive, 0)

		enablePlugin2 := *s.th.App.Config().PluginSettings.Enable
		defer s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = enablePlugin2
		})
		s.th.App.UpdateConfig(func(cfg *model.Config) {
			*cfg.PluginSettings.Enable = false
		})

		cmd := &cobra.Command{}
		err := pluginDisableCmdF(c, cmd, []string{pluginID})
		s.Require().NotNil(err)
		s.Require().ErrorContains(err, "Plugins have been disabled. Please check your logs for details.")
		s.Require().Len(printer.GetLines(), 0)
		s.Require().Len(printer.GetErrorLines(), 1)
		s.Require().Equal(printer.GetErrorLines()[0], "Unable to disable plugin: "+pluginID+". Error: Plugins have been disabled. Please check your logs for details.")
	})
}
