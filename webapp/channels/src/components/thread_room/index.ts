// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ConnectedProps} from 'react-redux';

import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams';

import {closeCenterThread} from 'actions/views/thread_room';
import {
    getCenterThreadRoomSelectedChannel,
    getCenterThreadRoomSelectedPost,
} from 'selectors/thread_room';

import type {GlobalState} from 'types/store';

import ThreadRoom from './thread_room';

function mapStateToProps(state: GlobalState) {
    return {
        selected: getCenterThreadRoomSelectedPost(state),
        channel: getCenterThreadRoomSelectedChannel(state),
        currentTeam: getCurrentTeam(state),
    };
}

const mapDispatchToProps = {
    closeCenterThread,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(ThreadRoom);
