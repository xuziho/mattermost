// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Channel} from '@mattermost/types/channels';
import type {Post, PostType} from '@mattermost/types/posts';

import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {makeGetChannel} from 'mattermost-redux/selectors/entities/channels';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';

import {PostTypes} from 'utils/constants';
import {localizeMessage} from 'utils/utils';

import type {GlobalState} from 'types/store';
import type {FakePost} from 'types/store/rhs';

export function getCenterThreadRoomSelectedPostId(state: GlobalState): Post['id'] {
    return state.views.threadRoom?.selectedPostId || '';
}

export function getCenterThreadRoomSelectedChannelId(state: GlobalState): Channel['id'] {
    return state.views.threadRoom?.selectedChannelId || '';
}

export function getCenterThreadRoomOpenedAt(state: GlobalState): number {
    return state.views.threadRoom?.openedAt || 0;
}

export function getIsCenterThreadRoomOpen(state: GlobalState): boolean {
    return Boolean(getCenterThreadRoomSelectedPostId(state));
}

export const getCenterThreadRoomSelectedChannel = (() => {
    const getChannel = makeGetChannel();

    return (state: GlobalState) => {
        const channelId = getCenterThreadRoomSelectedChannelId(state);

        return getChannel(state, channelId);
    };
})();

function getRealSelectedPost(state: GlobalState) {
    return state.entities.posts.posts[getCenterThreadRoomSelectedPostId(state)];
}

export const getCenterThreadRoomSelectedPost = createSelector(
    'getCenterThreadRoomSelectedPost',
    getCenterThreadRoomSelectedPostId,
    getRealSelectedPost,
    getCenterThreadRoomSelectedChannelId,
    getCurrentUserId,
    (
        selectedPostId: Post['id'],
        selectedPost: Post,
        selectedPostChannelId: Channel['id'],
        currentUserId,
    ): Post | FakePost | undefined => {
        if (!selectedPostId) {
            return undefined;
        }

        if (selectedPost) {
            return selectedPost;
        }

        return {
            id: selectedPostId,
            exists: false,
            type: PostTypes.FAKE_PARENT_DELETED as PostType,
            message: localizeMessage({
                id: 'rhs_thread.rootPostDeletedMessage.body',
                defaultMessage:
                    'Part of this thread has been deleted due to a data retention policy. You can no longer reply to this thread.',
            }),
            channel_id: selectedPostChannelId,
            user_id: currentUserId,
            reply_count: 0,
        };
    },
);
