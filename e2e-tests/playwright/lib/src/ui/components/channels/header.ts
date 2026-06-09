// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator, expect} from '@playwright/test';

export default class ChannelsHeader {
    readonly container: Locator;

    readonly title: Locator;
    readonly channelMenuDropdown;

    constructor(container: Locator) {
        this.container = container;

        this.title = container.locator('#channelHeaderTitle');
        this.channelMenuDropdown = container.locator('[aria-controls="channelHeaderDropdownMenu"]');
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }

    async toHaveTitle(title: string) {
        await expect(this.title).toContainText(title);
    }

    async openChannelMenu() {
        await this.channelMenuDropdown.isVisible();
        await this.channelMenuDropdown.click();
    }
}
