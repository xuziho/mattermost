// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
)

func TestGetUserForLogin(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t).InitBasic(t)

	t.Run("Should get user with username when sign in with username is enabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithUsername = model.NewPointer(true)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, "", th.BasicUser.Username)
		require.Nil(t, appErr)
		require.NotNil(t, user)
		require.Equal(t, th.BasicUser.Username, user.Username)
	})

	t.Run("Should not get user with username when sign in with username is disabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithUsername = model.NewPointer(false)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, "", th.BasicUser.Username)
		require.NotNil(t, appErr)
		require.Equal(t, http.StatusBadRequest, appErr.StatusCode)
		require.Nil(t, user)
	})

	t.Run("Should get user with email when sign in with email is enabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithEmail = model.NewPointer(true)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, "", th.BasicUser.Email)
		require.Nil(t, appErr)
		require.NotNil(t, user)
		require.Equal(t, th.BasicUser.Username, user.Username)
	})

	t.Run("Should not user with email when sign in with email is disabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithEmail = model.NewPointer(false)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, "", th.BasicUser.Email)
		require.NotNil(t, appErr)
		require.Equal(t, http.StatusBadRequest, appErr.StatusCode)
		require.Nil(t, user)
	})

	t.Run("Should get user with user ID when sign in with email is enabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithEmail = model.NewPointer(true)
			config.EmailSettings.EnableSignInWithUsername = model.NewPointer(false)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, th.BasicUser.Id, "")
		require.Nil(t, appErr)
		require.NotNil(t, user)
		require.Equal(t, th.BasicUser.Username, user.Username)
	})

	t.Run("Should get user with user ID when sign in with username is enabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithEmail = model.NewPointer(false)
			config.EmailSettings.EnableSignInWithUsername = model.NewPointer(true)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, th.BasicUser.Id, "")
		require.Nil(t, appErr)
		require.NotNil(t, user)
		require.Equal(t, th.BasicUser.Username, user.Username)
	})

	t.Run("Should not get user with user ID when both sign in with email and username are disabled", func(t *testing.T) {
		th.UpdateConfig(t, func(config *model.Config) {
			config.EmailSettings.EnableSignInWithEmail = model.NewPointer(false)
			config.EmailSettings.EnableSignInWithUsername = model.NewPointer(false)
		})

		user, appErr := th.App.GetUserForLogin(th.Context, th.BasicUser.Id, "")
		require.NotNil(t, appErr)
		require.Equal(t, http.StatusBadRequest, appErr.StatusCode)
		require.Nil(t, user)
	})
}
