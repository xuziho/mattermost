// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import SystemAnalytics from 'components/analytics/system_analytics';

import {renderWithContext, screen, userEvent} from 'tests/react_testing_utils';
import Constants from 'utils/constants';

const StatTypes = Constants.StatTypes;

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

describe('components/analytics/system_analytics/system_analytics.tsx', () => {
    const baseProps = {};

    const initialState = {
        entities: {
            general: {
                license: {
                    IsLicensed: 'true',
                    Cloud: 'true',
                },
                config: {
                    TelemetryId: 'test123',
                },
            },
            users: {
                currentUserId: 'current_user_id',
                profiles: {
                    current_user_id: {roles: 'system_admin'},
                },
            },
            admin: {
                analytics: {},
            },
            limits: {
                serverLimits: {
                    activeUserCount: 0,
                    maxUsersLimit: 0,
                    singleChannelGuestCount: 0,
                    singleChannelGuestLimit: 0,
                },
            },
        },
        plugins: {
            siteStatsHandlers: {},
        },
    };

    test('no data', () => {
        renderWithContext(<SystemAnalytics {...baseProps}/>, initialState, {useMockedStore: true});

        expect(screen.getByTestId('totalPosts')).toHaveTextContent('Loading...');
        expect(screen.queryByTestId('totalPostsLineChart')).not.toBeInTheDocument();
    });

    test('system data', async () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                admin: {
                    analytics: {
                        [StatTypes.TOTAL_POSTS]: 45,
                        [StatTypes.POST_PER_DAY]: [
                            {
                                name: '2024-05-20',
                                value: 45,
                            },
                            {
                                name: '2024-05-21',
                                value: 45,
                            },
                            {
                                name: '2024-05-22',
                                value: 45,
                            },
                        ],
                        [StatTypes.TOTAL_PUBLIC_CHANNELS]: 4545,
                        [StatTypes.TOTAL_PRIVATE_GROUPS]: 45,
                    },
                },
            },
        };

        renderWithContext(<SystemAnalytics {...baseProps}/>, state, {useMockedStore: true});

        const detailsElement = screen.getByText('Load Advanced Statistics');
        await userEvent.click(detailsElement);

        await screen.findByTestId('totalPostsLineChart');

        expect(screen.getByTestId('totalPosts')).toHaveTextContent('45');
        expect(screen.getByTestId('totalPostsLineChart')).toBeInTheDocument();
    });

    test('shows single-channel guests card when licensed, not entry, and guest accounts enabled', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState.entities.general,
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'false',
                        SkuShortName: 'enterprise',
                        GuestAccounts: 'true',
                        Users: '100',
                    },
                    config: {
                        ...initialState.entities.general.config,
                        EnableGuestAccounts: 'true',
                    },
                },
                admin: {
                    analytics: {
                        [StatTypes.SINGLE_CHANNEL_GUESTS]: 500,
                    },
                },
                limits: {
                    serverLimits: {
                        singleChannelGuestCount: 0,
                        singleChannelGuestLimit: 1000,
                        activeUserCount: 0,
                        maxUsersLimit: 0,
                    },
                },
            },
        };

        renderWithContext(<SystemAnalytics {...baseProps}/>, state, {useMockedStore: true});

        expect(screen.getByTestId('singleChannelGuests')).toBeInTheDocument();
    });

    test('does not show single-channel guests card for Entry SKU', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState.entities.general,
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'false',
                        SkuShortName: 'entry',
                        GuestAccounts: 'true',
                        Users: '100',
                    },
                    config: {
                        ...initialState.entities.general.config,
                        EnableGuestAccounts: 'true',
                    },
                },
                admin: {
                    analytics: {
                        [StatTypes.SINGLE_CHANNEL_GUESTS]: 500,
                    },
                },
                limits: {
                    serverLimits: {
                        singleChannelGuestCount: 0,
                        singleChannelGuestLimit: 1000,
                        activeUserCount: 0,
                        maxUsersLimit: 0,
                    },
                },
            },
        };

        renderWithContext(<SystemAnalytics {...baseProps}/>, state, {useMockedStore: true});

        expect(screen.queryByTestId('singleChannelGuests')).not.toBeInTheDocument();
    });

    test('does not show single-channel guests card when guest accounts disabled', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState.entities.general,
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'false',
                        SkuShortName: 'enterprise',
                        GuestAccounts: 'true',
                        Users: '100',
                    },
                    config: {
                        ...initialState.entities.general.config,
                        EnableGuestAccounts: 'false',
                    },
                },
                admin: {
                    analytics: {
                        [StatTypes.SINGLE_CHANNEL_GUESTS]: 500,
                    },
                },
                limits: {
                    serverLimits: {
                        singleChannelGuestCount: 0,
                        singleChannelGuestLimit: 1000,
                        activeUserCount: 0,
                        maxUsersLimit: 0,
                    },
                },
            },
        };

        renderWithContext(<SystemAnalytics {...baseProps}/>, state, {useMockedStore: true});

        expect(screen.queryByTestId('singleChannelGuests')).not.toBeInTheDocument();
    });

    test('shows error status when single-channel guests exceed limit', () => {
        const state = {
            ...initialState,
            entities: {
                ...initialState.entities,
                general: {
                    ...initialState.entities.general,
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'false',
                        SkuShortName: 'enterprise',
                        GuestAccounts: 'true',
                        Users: '100',
                    },
                    config: {
                        ...initialState.entities.general.config,
                        EnableGuestAccounts: 'true',
                    },
                },
                admin: {
                    analytics: {
                        [StatTypes.SINGLE_CHANNEL_GUESTS]: 150,
                    },
                },
                limits: {
                    serverLimits: {
                        singleChannelGuestCount: 0,
                        singleChannelGuestLimit: 100,
                        activeUserCount: 0,
                        maxUsersLimit: 0,
                    },
                },
            },
        };

        renderWithContext(<SystemAnalytics {...baseProps}/>, state, {useMockedStore: true});

        const titleElement = screen.getByTestId('singleChannelGuestsTitle');
        expect(titleElement).toHaveClass('team_statistics--error');
    });
});
