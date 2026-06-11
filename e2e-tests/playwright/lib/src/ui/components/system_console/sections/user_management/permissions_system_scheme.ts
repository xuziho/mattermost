// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, expect} from '@playwright/test';

/**
 * System Console -> User Management -> Permissions -> System Scheme (Edit Scheme).
 */
export default class PermissionsSystemScheme {
    readonly container: Locator;

    readonly systemSchemeHeader: Locator;
    readonly channelAdministratorsSection: Locator;
    readonly teamAdministratorsSection: Locator;
    readonly systemAdministratorsSection: Locator;

    constructor(container: Locator) {
        this.container = container;

        this.systemSchemeHeader = container.locator('.admin-console__header').getByText('System Scheme', {exact: true});
        this.channelAdministratorsSection = container
            .locator('.permissions-block')
            .filter({hasText: 'Channel Administrators'});
        this.teamAdministratorsSection = container
            .locator('.permissions-block')
            .filter({hasText: 'Team Administrators'});
        this.systemAdministratorsSection = container
            .locator('.permissions-block')
            .filter({hasText: 'System Administrators'});
    }

    async toBeVisible() {
        await expect(this.systemSchemeHeader).toBeVisible();
    }
}
