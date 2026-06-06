// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {DeepPartial} from '@mattermost/types/utilities';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import type {GlobalState} from 'types/store';

import RenewalLicenseCard from './renew_license_card';

const initialState: DeepPartial<GlobalState> = {
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
                Cloud: 'true',
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_user'},
            },
        },
        preferences: {
            myPreferences: {},
        },
    },
};

describe('components/RenewalLicenseCard', () => {
    const props = {
        license: {
            id: 'license_id',
            ExpiresAt: new Date().getMilliseconds().toString(),
            SkuShortName: 'skuShortName',
        },
        isLicenseExpired: false,
        totalUsers: 10,
        isDisabled: false,
    };

    test('should render renewal message without Contact sales button', () => {
        renderWithContext(<RenewalLicenseCard {...props}/>, initialState);

        expect(screen.getByText('Renew your Enterprise Advanced license to avoid any disruption.')).toBeInTheDocument();
        expect(screen.queryByText('Contact Sales')).not.toBeInTheDocument();
    });
});
