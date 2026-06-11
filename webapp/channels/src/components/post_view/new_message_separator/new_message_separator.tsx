// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage} from 'react-intl';

import * as PostList from 'mattermost-redux/utils/post_list';

import NotificationSeparator from 'components/widgets/separator/notification-separator';

type Props = {
    separatorId: string;
    wrapperRef?: React.RefObject<HTMLDivElement>;
}

const NewMessageSeparator = ({
    wrapperRef,
    separatorId,
}: Props) => {
    PostList.getTimestampForStartOfNewMessages(separatorId);

    return (
        <div
            ref={wrapperRef}
            className='new-separator'
        >
            <NotificationSeparator>
                <FormattedMessage
                    id='posts_view.newMsg'
                    defaultMessage='New Messages'
                />
            </NotificationSeparator>
        </div>
    );
};

export default memo(NewMessageSeparator);
