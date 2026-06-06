// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"testing"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/stretchr/testify/assert"
)

func TestPostCardTypeCheckWithApp(t *testing.T) {
	mainHelper.Parallel(t)

	t.Run("returns error for card post", func(t *testing.T) {
		th := Setup(t)

		appErr := PostCardTypeCheckWithApp("test", th.App, model.PostTypeCard)
		assert.NotNil(t, appErr)
		assert.Equal(t, "api.post.create_post.card_type_disabled.app_error", appErr.Id)
	})

	t.Run("returns nil for non-card post", func(t *testing.T) {
		th := Setup(t)

		appErr := PostCardTypeCheckWithApp("test", th.App, "")
		assert.Nil(t, appErr)
	})
}
