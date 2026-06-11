// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package searchengine

import (
	"testing"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/stretchr/testify/assert"
)

func TestActiveEngine(t *testing.T) {
	newBroker := func(disableDatabaseSearch bool) *Broker {
		cfg := &model.Config{}
		cfg.SetDefaults()
		cfg.SqlSettings.DisableDatabaseSearch = model.NewPointer(disableDatabaseSearch)

		return NewBroker(cfg)
	}

	t.Run("default to database", func(t *testing.T) {
		b := newBroker(false)
		assert.Equal(t, "database", b.ActiveEngine())
		assert.Empty(t, b.GetActiveEngines())
	})

	t.Run("no active engine when DisableDatabaseSearch", func(t *testing.T) {
		// Disable database search
		b := newBroker(true)

		assert.Equal(t, "none", b.ActiveEngine())
		assert.Empty(t, b.GetActiveEngines())
	})
}
