// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
package api4

import (
	"context"
	"testing"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin/plugintest/mock"
	"github.com/mattermost/mattermost/server/v8/einterfaces/mocks"
	"github.com/stretchr/testify/require"
)

func Test_getIPFilters(t *testing.T) {
	t.Run("No IP filtering interface returns 501", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		_, _, err := th.Client.Login(context.Background(), th.BasicUser.Email, th.BasicUser.Password)
		require.NoError(t, err)

		ipFilters, r, err := th.Client.GetIPFilters(context.Background())
		require.Error(t, err)
		require.Nil(t, ipFilters)
		require.Equal(t, 501, r.StatusCode)
	})

	t.Run("IP filtering interface but no permission", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		ipFiltering := &mocks.IPFilteringInterface{}
		th.App.Srv().IPFiltering = ipFiltering

		_, _, err := th.Client.Login(context.Background(), th.BasicUser2.Email, th.BasicUser2.Password)
		require.NoError(t, err)

		ipFilters, r, err := th.Client.GetIPFilters(context.Background())
		require.Error(t, err)
		require.Nil(t, ipFilters)
		require.Equal(t, 403, r.StatusCode)
	})

	t.Run("IP filtering interface and permission", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		ipFiltering := &mocks.IPFilteringInterface{}
		ipFiltering.Mock.On("GetIPFilters").Return(&model.AllowedIPRanges{
			model.AllowedIPRange{
				CIDRBlock:   "127.0.0.1/32",
				Description: "test",
			},
		}, nil)
		th.App.Srv().IPFiltering = ipFiltering

		_, _, err := th.Client.Login(context.Background(), th.SystemAdminUser.Email, th.SystemAdminUser.Password)
		require.NoError(t, err)

		ipFilters, r, err := th.Client.GetIPFilters(context.Background())
		require.NoError(t, err)
		require.NotNil(t, ipFilters)
		require.Equal(t, 200, r.StatusCode)
	})
}

func Test_applyIPFilters(t *testing.T) {
	allowedRanges := &model.AllowedIPRanges{
		model.AllowedIPRange{
			CIDRBlock:   "127.0.0.1/32",
			Description: "test",
		},
	}

	t.Run("No IP filtering interface returns 501", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		_, _, err := th.Client.Login(context.Background(), th.BasicUser.Email, th.BasicUser.Password)
		require.NoError(t, err)

		ipFilters, r, err := th.Client.ApplyIPFilters(context.Background(), allowedRanges)
		require.Error(t, err)
		require.Nil(t, ipFilters)
		require.Equal(t, 501, r.StatusCode)
	})

	t.Run("IP filtering interface but no permission", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		_, _, err := th.Client.Login(context.Background(), th.BasicUser.Email, th.BasicUser.Password)
		require.NoError(t, err)

		ipFiltering := &mocks.IPFilteringInterface{}
		th.App.Srv().IPFiltering = ipFiltering

		ipFilters, r, err := th.Client.ApplyIPFilters(context.Background(), allowedRanges)
		require.Error(t, err)
		require.Nil(t, ipFilters)
		require.Equal(t, 403, r.StatusCode)
	})

	t.Run("IP filtering interface and permission", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		ipFiltering := &mocks.IPFilteringInterface{}
		ipFiltering.Mock.On("ApplyIPFilters", mock.Anything).Return(&model.AllowedIPRanges{
			model.AllowedIPRange{
				CIDRBlock:   "127.0.0.1/32",
				Description: "test",
			},
		}, nil)
		th.App.Srv().IPFiltering = ipFiltering

		_, _, err := th.Client.Login(context.Background(), th.SystemAdminUser.Email, th.SystemAdminUser.Password)
		require.NoError(t, err)

		ipFilters, r, err := th.Client.ApplyIPFilters(context.Background(), allowedRanges)
		require.NoError(t, err)
		require.NotNil(t, ipFilters)
		require.Equal(t, 200, r.StatusCode)
	})
}

func Test_getMyIP(t *testing.T) {
	t.Run("No IP filtering interface returns 501", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		_, _, err := th.Client.Login(context.Background(), th.BasicUser.Email, th.BasicUser.Password)
		require.NoError(t, err)

		myIP, r, err := th.Client.GetMyIP(context.Background())
		require.Error(t, err)
		require.Nil(t, myIP)
		require.Equal(t, 501, r.StatusCode)
	})

	t.Run("IP filtering interface returns current IP", func(t *testing.T) {
		th := Setup(t).InitBasic(t)

		_, _, err := th.Client.Login(context.Background(), th.BasicUser.Email, th.BasicUser.Password)
		require.NoError(t, err)

		ipFiltering := &mocks.IPFilteringInterface{}
		th.App.Srv().IPFiltering = ipFiltering

		myIP, r, err := th.Client.GetMyIP(context.Background())
		require.NoError(t, err)
		require.NotNil(t, myIP)
		require.Equal(t, 200, r.StatusCode)
	})
}
