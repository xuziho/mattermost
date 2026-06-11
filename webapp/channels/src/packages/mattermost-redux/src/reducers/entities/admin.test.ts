// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {AdminTypes, UserTypes} from 'mattermost-redux/action_types';
import reducer, {convertAnalyticsRowsToStats} from 'mattermost-redux/reducers/entities/admin';
import deepFreezeAndThrowOnMutation from 'mattermost-redux/utils/deep_freeze';

type ReducerState = ReturnType<typeof reducer>;

describe('reducers.entities.admin', () => {
    describe('convertAnalyticsRowsToStats', () => {
        it('data should not be mutated', () => {
            const data = deepFreezeAndThrowOnMutation([{name: '1', value: 1}, {name: '2', value: 2}, {name: '3', value: 3}]);
            convertAnalyticsRowsToStats(data, 'post_counts_day');
            convertAnalyticsRowsToStats(data, 'bot_post_counts_day');
        });
    });

    describe('ldapGroups', () => {
        it('initial state', () => {
            const state = {};
            const action = {type: 'testinit'};
            const expectedState = {};

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });

        it('RECEIVED_LDAP_GROUPS, empty initial state', () => {
            const state = {};
            const action = {
                type: AdminTypes.RECEIVED_LDAP_GROUPS,
                data: {
                    count: 2,
                    groups: [
                        {
                            primary_key: 'test1',
                            name: 'test1',
                            mattermost_group_id: null,
                            has_syncables: null,
                        },
                        {
                            primary_key: 'test2',
                            name: 'test2',
                            mattermost_group_id: 'mattermost-id',
                            has_syncables: true,
                        },
                    ],
                },
            };
            const expectedState = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });

        it('RECEIVED_LDAP_GROUPS, previously populated', () => {
            const state = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };
            const action = {
                type: AdminTypes.RECEIVED_LDAP_GROUPS,
                data: {
                    count: 2,
                    groups: [
                        {
                            primary_key: 'test3',
                            name: 'test3',
                            mattermost_group_id: null,
                            has_syncables: null,
                        },
                        {
                            primary_key: 'test4',
                            name: 'test4',
                            mattermost_group_id: 'mattermost-id',
                            has_syncables: false,
                        },
                    ],
                },
            };
            const expectedState = {
                test3: {
                    primary_key: 'test3',
                    name: 'test3',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test4: {
                    primary_key: 'test4',
                    name: 'test4',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: false,
                },
            };

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });

        it('LINKED_LDAP_GROUP', () => {
            const state = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };
            const action = {
                type: AdminTypes.LINKED_LDAP_GROUP,
                data: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: 'new-mattermost-id',
                    has_syncables: false,
                },
            };
            const expectedState = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: 'new-mattermost-id',
                    has_syncables: false,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });

        it('UNLINKED_LDAP_GROUP', () => {
            const state = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };
            const action = {
                type: AdminTypes.UNLINKED_LDAP_GROUP,
                data: 'test2',
            };
            const expectedState = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: undefined,
                    has_syncables: undefined,
                    failed: false,
                },
            };

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });

        it('LINK_LDAP_GROUP_FAILURE', () => {
            const state = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };
            const action = {
                type: AdminTypes.LINK_LDAP_GROUP_FAILURE,
                data: 'test1',
            };
            const expectedState = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                    failed: true,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });

        it('LINK_LDAP_GROUP_FAILURE', () => {
            const state = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                },
            };
            const action = {
                type: AdminTypes.LINK_LDAP_GROUP_FAILURE,
                data: 'test2',
            };
            const expectedState = {
                test1: {
                    primary_key: 'test1',
                    name: 'test1',
                    mattermost_group_id: null,
                    has_syncables: null,
                },
                test2: {
                    primary_key: 'test2',
                    name: 'test2',
                    mattermost_group_id: 'mattermost-id',
                    has_syncables: true,
                    failed: true,
                },
            };

            const actualState = reducer({ldapGroups: state} as ReducerState, action);
            expect(actualState.ldapGroups).toEqual(expectedState);
        });
    });

    describe('Data Retention', () => {
        it('initial state', () => {
            const state = {};
            const action = {type: 'testinit'};
            const expectedState = {};

            const actualState = reducer({dataRetentionCustomPolicies: state} as ReducerState, action);
            expect(actualState.dataRetentionCustomPolicies).toEqual(expectedState);
        });

        it('RECEIVED_DATA_RETENTION_CUSTOM_POLICIES', () => {
            const state = {};
            const action = {
                type: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICIES,
                data: {
                    policies: [
                        {
                            id: 'id1',
                            display_name: 'Test Policy',
                            post_duration: 100,
                            team_count: 2,
                            channel_count: 1,
                        },
                        {
                            id: 'id2',
                            display_name: 'Test Policy 2',
                            post_duration: 365,
                            team_count: 0,
                            channel_count: 9,
                        },
                    ],
                    total_count: 2,
                },
            };
            const expectedState = {
                id1: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
                id2: {
                    id: 'id2',
                    display_name: 'Test Policy 2',
                    post_duration: 365,
                    team_count: 0,
                    channel_count: 9,
                },
            };

            const actualState = reducer({dataRetentionCustomPolicies: state} as ReducerState, action);
            expect(actualState.dataRetentionCustomPolicies).toEqual(expectedState);
        });

        it('RECEIVED_DATA_RETENTION_CUSTOM_POLICY', () => {
            const state = {};
            const action = {
                type: AdminTypes.RECEIVED_DATA_RETENTION_CUSTOM_POLICY,
                data: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
            };
            const expectedState = {
                id1: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
            };

            const actualState = reducer({dataRetentionCustomPolicies: state} as ReducerState, action);
            expect(actualState.dataRetentionCustomPolicies).toEqual(expectedState);
        });

        it('DELETE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS', () => {
            const state = {
                id1: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
            };
            const action = {
                type: AdminTypes.DELETE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS,
                data: {
                    id: 'id1',
                },
            };
            const expectedState = {};

            const actualState = reducer({dataRetentionCustomPolicies: state} as unknown as ReducerState, action);
            expect(actualState.dataRetentionCustomPolicies).toEqual(expectedState);
        });

        it('CREATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS', () => {
            const state = {};
            const action = {
                type: AdminTypes.CREATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS,
                data: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
            };
            const expectedState = {
                id1: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
            };

            const actualState = reducer({dataRetentionCustomPolicies: state} as ReducerState, action);
            expect(actualState.dataRetentionCustomPolicies).toEqual(expectedState);
        });

        it('UPDATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS', () => {
            const state = {
                id1: {
                    id: 'id1',
                    display_name: 'Test Policy',
                    post_duration: 100,
                    team_count: 2,
                    channel_count: 1,
                },
            };
            const action = {
                type: AdminTypes.CREATE_DATA_RETENTION_CUSTOM_POLICY_SUCCESS,
                data: {
                    id: 'id1',
                    display_name: 'Test Policy 123',
                    post_duration: 365,
                    team_count: 2,
                    channel_count: 1,
                },
            };
            const expectedState = {
                id1: {
                    id: 'id1',
                    display_name: 'Test Policy 123',
                    post_duration: 365,
                    team_count: 2,
                    channel_count: 1,
                },
            };

            const actualState = reducer({dataRetentionCustomPolicies: state} as unknown as ReducerState, action);
            expect(actualState.dataRetentionCustomPolicies).toEqual(expectedState);
        });
    });
});
