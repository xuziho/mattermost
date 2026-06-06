// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost/server/public/model"
)

func TestFileAccessIsUnrestricted(t *testing.T) {
	mainHelper.Parallel(t)
	th := Setup(t)

	files := []*model.FileInfo{
		{Id: "file_a", CreateAt: 1},
		{Id: "file_b", CreateAt: 2},
	}

	firstInaccessibleFileTime, appErr := th.App.removeInaccessibleContentFromFilesSlice(files)
	require.Nil(t, appErr)
	assert.Equal(t, int64(0), firstInaccessibleFileTime)
	for _, file := range files {
		assert.False(t, file.Archived)
	}

	fileList := &model.FileInfoList{
		FileInfos: map[string]*model.FileInfo{
			"file_a": files[0],
			"file_b": files[1],
		},
		Order: []string{"file_a", "file_b"},
	}
	appErr = th.App.filterInaccessibleFiles(fileList, filterFileOptions{assumeSortedCreatedAt: true})
	require.Nil(t, appErr)
	assert.Equal(t, []string{"file_a", "file_b"}, fileList.Order)
	assert.Equal(t, int64(0), fileList.FirstInaccessibleFileTime)

	filteredFiles, firstInaccessibleFileTime, appErr := th.App.getFilteredAccessibleFiles(files, filterFileOptions{assumeSortedCreatedAt: true})
	require.Nil(t, appErr)
	assert.Equal(t, files, filteredFiles)
	assert.Equal(t, int64(0), firstInaccessibleFileTime)

	firstInaccessibleFileTime, appErr = th.App.isInaccessibleFile(files[0])
	require.Nil(t, appErr)
	assert.Equal(t, int64(0), firstInaccessibleFileTime)
}
