// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package platform

// allocateCacheTargets is used to fill target value types for cache GetMulti calls.
func allocateCacheTargets[T any](l int) []any {
	toPass := make([]any, 0, l)
	for range l {
		toPass = append(toPass, new(T))
	}
	return toPass
}
