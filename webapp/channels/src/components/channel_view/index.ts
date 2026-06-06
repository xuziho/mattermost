// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ConnectedProps} from 'react-redux';
import {withRouter} from 'react-router-dom';

import type {Channel} from '@mattermost/types/channels';

import {fetchIsRestrictedDM} from 'mattermost-redux/actions/channels';
import {
    getCurrentChannel,
    getMyChannelMembership,
    isDeactivatedDirectChannel,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getRoles} from 'mattermost-redux/selectors/entities/roles_helpers';
import {getCurrentRelativeTeamUrl} from 'mattermost-redux/selectors/entities/teams';

import {goToLastViewedChannel} from 'actions/views/channel';
import {closeCenterThread} from 'actions/views/thread_room';
import {
    getCenterThreadRoomSelectedChannelId,
    getIsCenterThreadRoomOpen,
} from 'selectors/thread_room';

import {getIsChannelBookmarksEnabled} from 'components/channel_bookmarks/utils';

import type {GlobalState} from 'types/store';

import ChannelView from './channel_view';

function isMissingChannelRoles(state: GlobalState, channel?: Channel) {
    const channelRoles = channel ? getMyChannelMembership(state, channel.id)?.roles || '' : '';
    return !channelRoles.split(' ').some((v) => Boolean(getRoles(state)[v]));
}

function mapStateToProps(state: GlobalState) {
    const channel = getCurrentChannel(state);

    const config = getConfig(state);

    const enableWebSocketEventScope = config.FeatureFlagWebSocketEventScope === 'true';

    const missingChannelRole = isMissingChannelRoles(state, channel);

    return {
        channelId: channel ? channel.id : '',
        deactivatedChannel: channel ? isDeactivatedDirectChannel(state, channel.id) : false,
        channelIsArchived: channel ? channel.delete_at !== 0 : false,
        isCloud: false,
        teamUrl: getCurrentRelativeTeamUrl(state),
        enableWebSocketEventScope,
        canRestrictDirectMessage: config.RestrictDirectMessage === 'team' && (channel?.type === 'D' || channel?.type === 'G'),
        restrictDirectMessage: channel ? state.entities.channels.restrictedDMs[channel.id] : false,
        isChannelBookmarksEnabled: getIsChannelBookmarksEnabled(state),
        missingChannelRole,
        isCenterThreadRoomOpen: getIsCenterThreadRoomOpen(state),
        centerThreadRoomChannelId: getCenterThreadRoomSelectedChannelId(state),
    };
}

const mapDispatchToProps = ({
    goToLastViewedChannel,
    fetchIsRestrictedDM,
    closeCenterThread,
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default withRouter(connector(ChannelView));
