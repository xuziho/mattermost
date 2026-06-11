// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Locator} from '@playwright/test';

import {expect, test} from '@mattermost/playwright-lib';

/**
 * @objective Verify that using the emoji picker adds emojis to the correct place in the post textbox based on the
 * location of the keyboard caret, that keyboard focus is moved back to the post textbox correctly, and that the
 * keyboard caret is placed in the correct place.
 */
test(
    'Should add emoji to post textbox correctly and handle focus/selection correctly',
    {tag: '@emoji_picker'},
    async ({pw}) => {
        const slightlySmilingFace = '\u{1F642}';
        const upsideDownFace = '\u{1F643}';
        const faceWithRaisedEyebrow = '\u{1F928}';
        const neutralFace = '\u{1F610}';

        // # Initialize a test user
        const {user} = await pw.initSetup();

        // # Log in as a user in new browser context
        const {channelsPage} = await pw.testBrowser.login(user);
        const {emojiPickerPopup} = channelsPage;
        const {postCreate} = channelsPage.centerView;

        // # Navigate to default channel page
        await channelsPage.goto();
        await channelsPage.toBeVisible();

        // # Open emoji picker from center textbox
        await postCreate.openEmojiPicker();

        // * Verify emoji picker popup appears
        await emojiPickerPopup.toBeVisible();

        // # Click on an emoji
        await emojiPickerPopup.clickEmoji('slightly smiling face');

        // * Verify emoji picker popup disappears
        await emojiPickerPopup.notToBeVisible();

        // * Verify that the emoji was correctly added to the post textbox (as unicode), followed by a space
        await expectPostCreateState(postCreate.input, `${slightlySmilingFace} `, '');

        // # Repeat those steps with another emoji
        await postCreate.openEmojiPicker();
        await emojiPickerPopup.clickEmoji('upside down face');

        // * Verify that the second emoji was correctly added to the post textbox (as unicode), also followed by a space
        await expectPostCreateState(postCreate.input, `${slightlySmilingFace} ${upsideDownFace} `, '');

        // # Clear the textbox and replace it with some text
        await postCreate.writeMessage('ab');

        // # Move left so that the caret is in the middle of the text
        await postCreate.input.press('ArrowLeft');

        // * Verify that the caret is in the right place
        await expectPostCreateState(postCreate.input, 'a', 'b');

        // # Open the emoji picker again and select another emoji
        await postCreate.openEmojiPicker();
        await emojiPickerPopup.clickEmoji('face with raised eyebrow');

        // * Verify that the emoji was added with surrounding whitespace (as unicode) and that the caret is placed after that
        await expectPostCreateState(postCreate.input, `a ${faceWithRaisedEyebrow} `, 'b');

        // # Clear the textbox and replace it with some words
        await postCreate.writeMessage('this is a test');

        // # Move left again so that the caret is between words but after a space
        await postCreate.input.press('ArrowLeft');
        await postCreate.input.press('ArrowLeft');
        await postCreate.input.press('ArrowLeft');
        await postCreate.input.press('ArrowLeft');

        // * Again, verify that the caret is in the right place
        await expectPostCreateState(postCreate.input, 'this is a ', 'test');

        // # Open the emoji picker again and select another emoji
        await postCreate.openEmojiPicker();
        await emojiPickerPopup.clickEmoji('neutral face');

        // * Verify that the emoji was added without an extra space before it (as unicode)
        await expectPostCreateState(postCreate.input, `this is a ${neutralFace} `, 'test');
    },
);

async function expectPostCreateState(input: Locator, textBeforeCaret: string, textAfterCaret: string) {
    // * Verify that the post textbox is focused
    await expect(input).toBeFocused();

    // * Verify that the text in it is as expected
    await expect(input).toHaveValue(textBeforeCaret + textAfterCaret);

    // * Verify that the keyboard caret is in the correct place
    const selectionStart = await input.evaluate((element: HTMLTextAreaElement) => element.selectionStart);
    expect(selectionStart).toEqual(textBeforeCaret.length);
    const selectionEnd = await input.evaluate((element: HTMLTextAreaElement) => element.selectionEnd);
    expect(selectionEnd).toEqual(textBeforeCaret.length);
}
