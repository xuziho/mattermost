// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import type {Channel} from '@mattermost/types/channels';

import {fetchChannelRemotes} from 'mattermost-redux/actions/shared_channels';
import {makeGetChannelUnreadCount} from 'mattermost-redux/selectors/entities/channels';
import {getMyChannelMemberships} from 'mattermost-redux/selectors/entities/common';
import {getRemoteNamesForChannel} from 'mattermost-redux/selectors/entities/shared_channels';
import {isChannelMuted} from 'mattermost-redux/utils/channel_utils';

import {markMostRecentPostInChannelAsUnread, unsetEditingPost} from 'actions/post_actions';
import {clearChannelSelection, multiSelectChannelAdd, multiSelectChannelTo} from 'actions/views/channel_sidebar';
import {closeRightHandSide} from 'actions/views/rhs';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {isChannelSelected} from 'selectors/views/channel_sidebar';

import type {GlobalState} from 'types/store';

import SidebarChannelLink from './sidebar_channel_link';

type OwnProps = {
    channel: Channel;
}

function makeMapStateToProps() {
    const getUnreadCount = makeGetChannelUnreadCount();

    return (state: GlobalState, ownProps: OwnProps) => {
        const member = getMyChannelMemberships(state)[ownProps.channel.id];
        const unreadCount = getUnreadCount(state, ownProps.channel.id);

        const remoteNames = ownProps.channel?.shared ?
            getRemoteNamesForChannel(state, ownProps.channel.id) : [];

        return {
            unreadMentions: unreadCount.mentions,
            unreadMsgs: unreadCount.messages,
            isUnread: unreadCount.showUnread,
            isMuted: isChannelMuted(member),
            hasUrgent: unreadCount.hasUrgent,
            isChannelSelected: isChannelSelected(state, ownProps.channel.id),
            rhsState: getRhsState(state),
            rhsOpen: getIsRhsOpen(state),
            remoteNames,
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            markMostRecentPostInChannelAsUnread,
            unsetEditingPost,
            clearChannelSelection,
            multiSelectChannelTo,
            multiSelectChannelAdd,
            closeRightHandSide,
            fetchChannelRemotes,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(SidebarChannelLink);
