// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, expect} from '@playwright/test';

/**
 * System Console -> Site Configuration -> Localization
 * Covers the Languages section.
 */
export default class Localization {
    readonly container: Locator;

    readonly header: Locator;
    readonly saveButton: Locator;

    constructor(container: Locator) {
        this.container = container;

        this.header = container.getByText('Localization', {exact: true});
        this.saveButton = container.getByRole('button', {name: 'Save'});
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
        await expect(this.header).toBeVisible();
    }

    async save() {
        await this.saveButton.click();
    }
}
