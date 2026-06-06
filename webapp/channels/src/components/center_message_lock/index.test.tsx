// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {emptyTeams} from 'tests/constants/teams';
import {screen, renderWithContext} from 'tests/react_testing_utils';

import CenterMessageLock from './';

const initialState = {
    entities: {
        teams: emptyTeams(),
        limits: {
            serverLimits: {
                activeUserCount: 0,
                maxUsersLimit: 0,
            },
        },
    },
};

const exceededLimitsState = {
    ...initialState,
    entities: {
        ...initialState.entities,
        limits: {
            serverLimits: {
                activeUserCount: 0,
                maxUsersLimit: 0,
                postHistoryLimit: 2,
            },
        },
    },
};

describe('CenterMessageLock', () => {
    it('shows message when limits are exceeded', () => {
        renderWithContext(
            <CenterMessageLock/>,
            exceededLimitsState,
        );
        screen.getByText('Limited history is displayed', {exact: false});
        screen.getByText('Full access to message history is not available on this server.');
    });

    it('does not render pricing link', () => {
        renderWithContext(
            <CenterMessageLock/>,
            exceededLimitsState,
        );
        expect(screen.queryByText('paid plans')).not.toBeInTheDocument();
    });
});
