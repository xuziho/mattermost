// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {isSystemEmoji, type Emoji} from '@mattermost/types/emojis';

import {Client4} from 'mattermost-redux/client';

export {isSystemEmoji};

function unifiedToUnicode(unified: string): string {
    return unified.
        split('-').
        map((codePoint) => String.fromCodePoint(parseInt(codePoint, 16))).
        join('');
}

function getInlineEmojiImageUrl(label: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="52">${label}</text></svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getEmojiImageUrl(emoji: Emoji): string {
    // Preserve the built-in custom emoji without shipping the full static emoji image set.
    if (!isSystemEmoji(emoji) && emoji.id === 'mattermost') {
        return getInlineEmojiImageUrl('AC');
    }

    if (isSystemEmoji(emoji)) {
        if (!emoji.unified) {
            return '';
        }

        return getInlineEmojiImageUrl(unifiedToUnicode(emoji.unified));
    }

    return Client4.getEmojiRoute(emoji.id) + '/image';
}

export function getEmojiName(emoji: Emoji): string {
    return isSystemEmoji(emoji) ? emoji.short_name : emoji.name;
}

export function parseEmojiNamesFromText(text: string): string[] {
    if (!text.includes(':')) {
        return [];
    }

    const pattern = /:([A-Za-z0-9_-]+):/gi;
    const customEmojis = new Set<string>();
    let match;
    while ((match = pattern.exec(text)) !== null) {
        if (!match) {
            continue;
        }

        customEmojis.add(match[1]);
    }

    return Array.from(customEmojis);
}
