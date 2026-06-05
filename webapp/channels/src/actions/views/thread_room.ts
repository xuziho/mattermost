// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@mattermost/types/posts';

import {getPost as fetchPost} from 'mattermost-redux/actions/posts';
import {getPost} from 'mattermost-redux/selectors/entities/posts';

import {ActionTypes} from 'utils/constants';

import type {ActionFuncAsync} from 'types/store';

export function openCenterThread(post: Post) {
    return {
        type: ActionTypes.OPEN_CENTER_THREAD,
        postId: post.root_id || post.id,
        channelId: post.channel_id,
        timestamp: Date.now(),
    };
}

export function openCenterThreadById(postId: string): ActionFuncAsync {
    return async (dispatch, getState) => {
        const state = getState();
        const post: Post | undefined = getPost(state, postId) ?? (await dispatch(fetchPost(postId))).data;

        if (post && post.state !== 'DELETED' && post.delete_at === 0) {
            dispatch(openCenterThread(post));
            return {data: true};
        }

        return {error: true};
    };
}

export function closeCenterThread() {
    return {
        type: ActionTypes.CLOSE_CENTER_THREAD,
    };
}
