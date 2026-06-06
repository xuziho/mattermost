// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {test} from '@mattermost/playwright-lib';

/**
 * @objective Capture visual snapshot of the intro channel view for a regular user
 */
test(
    'displays intro to channel view for regular user',
    {tag: ['@visual', '@channel_page', '@snapshots']},
    async ({pw, browserName, viewport}, testInfo) => {
        // # Create and sign in a new user
        const {user} = await pw.initSetup();

        // # Log in a user in new browser context
        const {page, channelsPage} = await pw.testBrowser.login(user);

        // # Visit a default channel page
        await channelsPage.goto();
        await channelsPage.toBeVisible();

        // # Wait for the App Bar to finish rendering
        await channelsPage.appBar.toBeVisible();

        // # Hide dynamic elements of Channels page
        await pw.hideDynamicChannelsContent(page);

        // * Verify channel intro page appears as expected
        const testArgs = {page: page, browserName, viewport};
        await pw.matchSnapshot(testInfo, testArgs);
    },
);
