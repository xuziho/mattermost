// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';
import {TestHelper} from 'utils/test_helper';

import {TeamProfile} from './team_profile';

describe('admin_console/team_channel_settings/team/TeamProfile', () => {
    const baseProps = {
        team: TestHelper.getTeamMock(),
        onToggleArchive: jest.fn(),
        isArchived: false,
    };

    const initialState = {
        views: {
            announcementBar: {
                announcementBarState: {
                    announcementBarCount: 1,
                },
            },
        },
        entities: {
            general: {
                license: {
                    IsLicensed: 'true',
                    Cloud: 'false',
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin'},
                },
            },
        },
    };

    test('should match snapshot (not cloud, freemium disabled', () => {
        const {container} = renderWithContext(<TeamProfile {...baseProps}/>, initialState);
        expect(container).toMatchSnapshot();
    });

    test('should match snapshot with isArchived true', () => {
        const props = {
            ...baseProps,
            isArchived: true,
        };

        const {container} = renderWithContext(<TeamProfile {...props}/>, initialState);
        expect(container).toMatchSnapshot();
    });
});
