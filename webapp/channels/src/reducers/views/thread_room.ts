// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import {UserTypes} from 'mattermost-redux/action_types';

import {ActionTypes} from 'utils/constants';

import type {MMAction} from 'types/store';

function selectedPostId(state = '', action: MMAction) {
    switch (action.type) {
    case ActionTypes.OPEN_CENTER_THREAD:
        return action.postId;
    case ActionTypes.CLOSE_CENTER_THREAD:
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function selectedChannelId(state = '', action: MMAction) {
    switch (action.type) {
    case ActionTypes.OPEN_CENTER_THREAD:
        return action.channelId;
    case ActionTypes.CLOSE_CENTER_THREAD:
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

function openedAt(state = 0, action: MMAction) {
    switch (action.type) {
    case ActionTypes.OPEN_CENTER_THREAD:
        return action.timestamp || 0;
    case ActionTypes.CLOSE_CENTER_THREAD:
    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

export default combineReducers({
    selectedPostId,
    selectedChannelId,
    openedAt,
});
