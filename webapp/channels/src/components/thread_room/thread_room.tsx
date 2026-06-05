// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useEffect} from 'react';
import {FormattedMessage} from 'react-intl';

import ThreadViewer from 'components/threading/thread_viewer';

import type {PropsFromRedux} from './index';

import './thread_room.scss';

const ThreadRoom = ({
    selected,
    channel,
    currentTeam,
    closeCenterThread,
}: PropsFromRedux) => {
    useEffect(() => {
        if (channel?.team_id && channel.team_id !== currentTeam?.id) {
            closeCenterThread();
        }
    }, [channel, currentTeam, closeCenterThread]);

    if (!selected || !channel) {
        return null;
    }

    return (
        <div
            id='centerThreadRoom'
            className='CenterThreadRoom'
        >
            <div className='CenterThreadRoom__header'>
                <button
                    className='btn btn-icon btn-sm CenterThreadRoom__back'
                    type='button'
                    onClick={closeCenterThread}
                    aria-label='Back to channel'
                >
                    <i className='icon icon-arrow-back-ios'/>
                </button>
                <div className='CenterThreadRoom__title'>
                    <div className='CenterThreadRoom__eyebrow'>
                        <FormattedMessage
                            id='center_thread_room.header.eyebrow'
                            defaultMessage='Thread'
                        />
                    </div>
                    <div className='CenterThreadRoom__channel'>
                        {channel.display_name}
                    </div>
                </div>
            </div>
            <ThreadViewer
                className='CenterThreadRoom__viewer'
                rootPostId={selected.id}
                useRelativeTimestamp={true}
                isThreadView={false}
                inputPlaceholder='Reply in this thread...'
            />
        </div>
    );
};

export default memo(ThreadRoom);
