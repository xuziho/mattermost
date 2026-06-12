// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {RouteComponentProps} from 'react-router-dom';

import {initializePlugins} from 'plugins';

import Root from './root';
import type {Props} from './root';

jest.mock('plugins', () => ({
    initializePlugins: jest.fn(),
}));

jest.mock('mattermost-redux/actions/emojis', () => ({
    setSystemEmojis: jest.fn(),
}));

jest.mock('mattermost-redux/actions/general', () => ({
    setUrl: jest.fn(),
}));

jest.mock('mattermost-redux/client', () => ({
    Client4: {},
}));

jest.mock('actions/telemetry_actions.jsx', () => ({
    temporarilySetPageLoadContext: jest.fn(),
}));

jest.mock('components/global_header/global_header', () => function GlobalHeader() {
    return null;
});

jest.mock('components/header_footer_route/header_footer_route', () => ({
    HFRoute: () => null,
}));

jest.mock('components/header_footer_template_route', () => ({
    HFTRoute: () => null,
    LoggedInHFTRoute: () => null,
}));

jest.mock('components/initial_loading_screen', () => ({
    stop: jest.fn(),
}));

jest.mock('components/logged_in_route', () => () => null);
jest.mock('components/readout/readout', () => () => null);
jest.mock('components/theme_provider', () => ({
    WithUserTheme: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('utils/burn_on_read_expiration_scheduler', () => ({
    expirationScheduler: {
        initialize: jest.fn(),
        cleanup: jest.fn(),
    },
}));

jest.mock('utils/desktop_api', () => ({
    reactAppInitialized: jest.fn(),
}));

jest.mock('utils/emoji', () => ({
    EmojiIndicesByAlias: new Map(),
}));

function makeProps(): Props {
    return {
        actions: {
            handleLoginLogoutSignal: jest.fn(),
            loadConfigAndMe: jest.fn(),
            loadRecentlyUsedCustomEmojis: jest.fn(),
            migrateRecentEmojis: jest.fn(),
            redirectToDefaultTeam: jest.fn(),
        },
        dispatch: jest.fn(),
        history: {
            push: jest.fn(),
            replace: jest.fn(),
        } as unknown as RouteComponentProps['history'],
        isCloud: false,
        isConfigLoaded: true,
        isDevModeEnabled: false,
        location: {
            pathname: '/agentco/channels/collaboration-live',
            search: '',
        } as unknown as RouteComponentProps['location'],
        match: {} as RouteComponentProps['match'],
        noAccounts: false,
        permalinkRedirectTeamName: 'agentco',
        rhsIsExpanded: false,
        rhsIsOpen: false,
        rhsState: '',
        serviceEnvironment: '',
        shouldShowAppBar: false,
        showTermsOfService: false,
        siteURL: 'http://localhost:8065',
        telemetryEnabled: false,
        telemetryId: '',
        staticContext: undefined,
    };
}

describe('Root', () => {
    test('initializes webapp plugins after config and current user are loaded', () => {
        const root = new Root(makeProps());
        root.setState = jest.fn();

        root.onConfigLoaded();

        expect(initializePlugins).toHaveBeenCalledTimes(1);
    });
});
