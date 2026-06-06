// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import "github.com/mattermost/mattermost/server/public/model"

// removeInaccessibleContentFromFilesSlice keeps all file content accessible on self-hosted deployments.
func (a *App) removeInaccessibleContentFromFilesSlice(files []*model.FileInfo) (int64, *model.AppError) {
	return 0, nil
}

// filterInaccessibleFiles keeps all files accessible on self-hosted deployments.
func (a *App) filterInaccessibleFiles(fileList *model.FileInfoList, options filterFileOptions) *model.AppError {
	return nil
}

// isInaccessibleFile returns 0 because files are not limited by a hosted plan.
func (a *App) isInaccessibleFile(file *model.FileInfo) (int64, *model.AppError) {
	return 0, nil
}

// getFilteredAccessibleFiles returns all files because self-hosted file history is unrestricted.
func (a *App) getFilteredAccessibleFiles(files []*model.FileInfo, options filterFileOptions) ([]*model.FileInfo, int64, *model.AppError) {
	return files, 0, nil
}

type filterFileOptions struct {
	assumeSortedCreatedAt bool
}

// linearFilterFileList make no assumptions about ordering, go through files one by one
// this is the slower fallback that is still safe
// if we can not assume files are ordered by CreatedAt
func linearFilterFileList(fileList *model.FileInfoList, earliestAccessibleTime int64) {
	files := fileList.FileInfos
	order := fileList.Order

	n := 0
	for i, fileID := range order {
		if createAt := files[fileID].CreateAt; createAt >= earliestAccessibleTime {
			order[n] = order[i]
			n++
		} else {
			if createAt > fileList.FirstInaccessibleFileTime {
				fileList.FirstInaccessibleFileTime = createAt
			}
			delete(files, fileID)
		}
	}
	fileList.Order = order[:n]
}

// linearFilterFilesSlice make no assumptions about ordering, go through files one by one
// this is the slower fallback that is still safe
// if we can not assume files are ordered by CreatedAt
func linearFilterFilesSlice(files []*model.FileInfo, earliestAccessibleTime int64) ([]*model.FileInfo, int64) {
	var firstInaccessibleFileTime int64
	n := 0
	for i := range files {
		if createAt := files[i].CreateAt; createAt >= earliestAccessibleTime {
			files[n] = files[i]
			n++
		} else {
			if createAt > firstInaccessibleFileTime {
				firstInaccessibleFileTime = createAt
			}
		}
	}
	return files[:n], firstInaccessibleFileTime
}
