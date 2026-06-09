package pluginapi_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/plugintest"
	"github.com/mattermost/mattermost/server/public/pluginapi"
)

func TestGetPluginAssetURL(t *testing.T) {
	siteURL := "https://mattermost.example.com"
	api := &plugintest.API{}
	api.On("GetConfig").Return(&model.Config{ServiceSettings: model.ServiceSettings{SiteURL: &siteURL}})

	client := pluginapi.NewClient(api, &plugintest.Driver{})

	t.Run("Valid asset directory was provided", func(t *testing.T) {
		pluginID := "mattermost-1234"
		dir := "assets"
		wantedURL := "https://mattermost.example.com/mattermost-1234/assets"
		gotURL, err := client.System.GetPluginAssetURL(pluginID, dir)

		assert.Equalf(t, wantedURL, gotURL, "GetPluginAssetURL(%q, %q) got=%q; want=%v", pluginID, dir, gotURL, wantedURL)
		assert.NoError(t, err)
	})

	t.Run("Valid asset directory path was provided", func(t *testing.T) {
		pluginID := "mattermost-1234"
		dirPath := "/mattermost/assets"
		wantedURL := "https://mattermost.example.com/mattermost-1234/mattermost/assets"
		gotURL, err := client.System.GetPluginAssetURL(pluginID, dirPath)

		assert.Equalf(t, wantedURL, gotURL, "GetPluginAssetURL(%q, %q) got=%q; want=%q", pluginID, dirPath, gotURL, wantedURL)
		assert.NoError(t, err)
	})

	t.Run("Valid pluginID was provided", func(t *testing.T) {
		pluginID := "mattermost-1234"
		dir := "assets"
		wantedURL := "https://mattermost.example.com/mattermost-1234/assets"
		gotURL, err := client.System.GetPluginAssetURL(pluginID, dir)

		assert.Equalf(t, wantedURL, gotURL, "GetPluginAssetURL(%q, %q) got=%q; want=%q", pluginID, dir, gotURL, wantedURL)
		assert.NoError(t, err)
	})

	t.Run("Invalid asset directory name was provided", func(t *testing.T) {
		pluginID := "mattermost-1234"
		dir := ""
		want := ""
		gotURL, err := client.System.GetPluginAssetURL(pluginID, dir)

		assert.Emptyf(t, gotURL, "GetPluginAssetURL(%q, %q) got=%s; want=%q", pluginID, dir, gotURL, want)
		assert.Error(t, err)
	})

	t.Run("Invalid pluginID was provided", func(t *testing.T) {
		pluginID := ""
		dir := "assets"
		want := ""
		gotURL, err := client.System.GetPluginAssetURL(pluginID, dir)

		assert.Emptyf(t, gotURL, "GetPluginAssetURL(%q, %q) got=%q; want=%q", pluginID, dir, gotURL, want)
		assert.Error(t, err)
	})

	siteURL = ""
	api.On("GetConfig").Return(&model.Config{ServiceSettings: model.ServiceSettings{SiteURL: &siteURL}})

	t.Run("Empty SiteURL was configured", func(t *testing.T) {
		pluginID := "mattermost-1234"
		dir := "assets"
		want := ""
		gotURL, err := client.System.GetPluginAssetURL(pluginID, dir)

		assert.Emptyf(t, gotURL, "GetPluginAssetURL(%q, %q) got=%q; want=%q", pluginID, dir, gotURL, want)
		assert.Error(t, err)
	})
}
