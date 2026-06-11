// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Post} from '@mattermost/types/posts';

import {Posts} from 'mattermost-redux/constants';

import PostBodyAdditionalContent from 'components/post_view/post_body_additional_content';
import PostMessageView from 'components/post_view/post_message_view';

type Props = {
    id?: string;
    post: Post;
    isEmbedVisible?: boolean;
    isRHS: boolean;
    compactDisplay?: boolean;
}

export default function MessageWithAdditionalContent({
    post,
    isEmbedVisible,
    isRHS,
    compactDisplay,
}: Props) {
    let msg;
    const messageWrapper = (
        <PostMessageView
            post={post}
            isRHS={isRHS}
            compactDisplay={compactDisplay}
        />
    );
    if (post.state === Posts.POST_DELETED) {
        msg = messageWrapper;
    } else {
        msg = (
            <PostBodyAdditionalContent
                post={post}
                isEmbedVisible={isEmbedVisible}
            >
                {messageWrapper}
            </PostBodyAdditionalContent>
        );
    }
    return msg;
}
