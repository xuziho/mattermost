// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Permissions} from 'mattermost-redux/constants';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import SidebarHeader from './sidebar_header';
import type {Props} from './sidebar_header';

describe('SidebarHeader', () => {
    const defaultProps: Props = {
        showNewChannelModal: jest.fn(),
        showMoreChannelsModal: jest.fn(),
        invitePeopleModal: jest.fn(),
        showCreateCategoryModal: jest.fn(),
        canCreateChannel: true,
        canJoinPublicChannel: true,
        handleOpenDirectMessagesModal: jest.fn(),
        unreadFilterEnabled: true,
        showCreateUserGroupModal: jest.fn(),
        canCreateCustomGroups: true,
    };

    const team = TestHelper.getTeamMock({
        display_name: 'Steadfast',
    });

    const initialState = {
        entities: {
            general: {
                config: {},
            },
            preferences: {
                myPreferences: {},
            },
            teams: {
                currentTeamId: team.id,
                teams: {
                    [team.id]: team,
                },
                myMembers: {
                    [team.id]: {
                        roles: 'team_user',
                    },
                },
            },
            users: {
                profiles: {
                    uid: {
                        id: 'uid',
                        roles: 'system_user system_admin',
                    },
                },
                currentUserId: 'uid',
            },
            roles: {
                roles: {
                    system_admin: {
                        permissions: [Permissions.MANAGE_TEAM],
                    },
                    system_user: {
                        permissions: [],
                    },
                    team_user: {
                        permissions: [],
                    },
                },
            },
        },
    };

    test('should render the team menu button', () => {
        renderWithContext(<SidebarHeader {...defaultProps}/>, initialState);

        expect(screen.getByText('Steadfast')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: team.display_name})).toBeInTheDocument();
    });

    test('should render the \'Browse or create channels\' menu button', () => {
        renderWithContext(<SidebarHeader {...defaultProps}/>, initialState);

        expect(screen.getByRole('button', {name: /Browse or create channels/i})).toBeInTheDocument();
    });

    test('should not render anything when team is empty', () => {
        const state = {...initialState};
        state.entities.teams.currentTeamId = '';
        renderWithContext(<SidebarHeader {...defaultProps}/>, state);

        expect(screen.queryByRole('button', {name: team.display_name})).toBeNull();
        expect(screen.queryByRole('button', {name: /Add Channel Dropdown/i})).toBeNull();
    });
});
