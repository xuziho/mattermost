// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';
import {DataSearchTypes} from 'utils/constants';

import SearchLimitsBanner from './search_limits_banner';

describe('components/select_results/SearchLimitsBanner', () => {
    test('should NOT show banner for no limits when doing messages search', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        uid: {},
                    },
                },
                limits: {
                    serverLimits: undefined,
                },
                search: {
                    results: [],
                    flagged: [],
                    isSearchingTerm: false,
                    isSearchGettingMore: false,
                    matches: {},
                    current: {},
                    truncationInfo: undefined,
                },
            },
            views: {
                rhs: {
                    rhsState: null, // No RHS state
                },
            },
        };
        const {container} = renderWithContext(<SearchLimitsBanner searchType='messages'/>, state);
        expect(container.querySelector('#messages_search_limits_banner')).toBeNull();
    });
    test('should show banner when doing messages search above the limit in Entry with limits', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        uid: {},
                    },
                },
                limits: {
                    serverLimits: {
                        postHistoryLimit: 10000,
                    },
                },
                search: {
                    results: [],
                    flagged: [],
                    isSearchingTerm: false,
                    isSearchGettingMore: false,
                    matches: {},

                    current: {},
                    truncationInfo: {
                        posts: 1, // Indicate that search is truncated
                        files: 0,
                    },
                },
            },
            views: {
                rhs: {
                    rhsState: 'search', // RHS showing search results
                },
            },
        };
        const {container} = renderWithContext(<SearchLimitsBanner searchType='messages'/>, state);
        expect(container.querySelector('#messages_search_limits_banner')).not.toBeNull();
    });

    test('should display self-managed history limit text for messages search when banner is shown', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        uid: {},
                    },
                },
                limits: {
                    serverLimits: {
                        postHistoryLimit: 10000,
                    },
                },
                search: {
                    results: [],
                    flagged: [],
                    isSearchingTerm: false,
                    isSearchGettingMore: false,
                    matches: {},

                    current: {},
                    truncationInfo: {
                        posts: 1, // Indicate that search is truncated
                        files: 0,
                    },
                },
            },
            views: {
                rhs: {
                    rhsState: 'search', // RHS showing search results
                },
            },
        };

        const {container} = renderWithContext(<SearchLimitsBanner searchType={DataSearchTypes.MESSAGES_SEARCH_TYPE}/>, state);

        expect(container.querySelector('#messages_search_limits_banner')).not.toBeNull();
        expect(container.textContent).toContain('Full access to message history is not available on this server.');
    });

    test('should display correct banner message format for messages search', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        uid: {},
                    },
                },
                limits: {
                    serverLimits: {
                        postHistoryLimit: 10000,
                    },
                },
                search: {
                    results: [],
                    flagged: [],
                    isSearchingTerm: false,
                    isSearchGettingMore: false,
                    matches: {},

                    current: {},
                    truncationInfo: {
                        posts: 1, // Indicate that search is truncated
                        files: 0,
                    },
                },
            },
            views: {
                rhs: {
                    rhsState: 'search', // RHS showing search results
                },
            },
        };

        const {container} = renderWithContext(<SearchLimitsBanner searchType={DataSearchTypes.MESSAGES_SEARCH_TYPE}/>, state);

        const bannerText = container.textContent;
        expect(bannerText).toContain('Limited history is displayed');
        expect(bannerText).toContain('Full access to message history is not available on this server.');
    });

    test('should not render CTA link when banner is shown', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        uid: {},
                    },
                },
                limits: {
                    serverLimits: {
                        postHistoryLimit: 10000,
                    },
                },
                search: {
                    results: [],
                    flagged: [],
                    isSearchingTerm: false,
                    isSearchGettingMore: false,
                    matches: {},

                    current: {},
                    truncationInfo: {
                        posts: 1, // Indicate that search is truncated
                        files: 0,
                    },
                },
            },
            views: {
                rhs: {
                    rhsState: 'search', // RHS showing search results
                },
            },
        };

        const {container} = renderWithContext(<SearchLimitsBanner searchType={DataSearchTypes.MESSAGES_SEARCH_TYPE}/>, state);

        expect(container.querySelector('#messages_search_limits_banner')).not.toBeNull();
        expect(container.textContent).not.toContain('paid plans');

        const ctaLinks = container.querySelectorAll('a');
        expect(ctaLinks).toHaveLength(0);
    });

    test('should NOT show banner when RHS is showing pinned posts even with truncated search results', () => {
        const state = {
            entities: {
                general: {
                    license: {
                        IsLicensed: 'true',
                        Cloud: 'true',
                    },
                },
                users: {
                    currentUserId: 'uid',
                    profiles: {
                        uid: {},
                    },
                },
                limits: {
                    serverLimits: {
                        postHistoryLimit: 10000,
                    },
                },
                search: {
                    results: [],
                    flagged: [],
                    isSearchingTerm: false,
                    isSearchGettingMore: false,
                    matches: {},

                    current: {},
                    truncationInfo: {
                        posts: 1, // Search is truncated, but...
                        files: 0,
                    },
                },
            },
            views: {
                rhs: {
                    rhsState: 'pin', // RHS showing pinned posts, not search results
                },
            },
        };

        const {container} = renderWithContext(<SearchLimitsBanner searchType={DataSearchTypes.MESSAGES_SEARCH_TYPE}/>, state);

        // Banner should NOT show because RHS is showing pinned posts, not search results
        expect(container.querySelector('#messages_search_limits_banner')).toBeNull();
    });
});
