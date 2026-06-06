// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {UserProfile} from '@mattermost/types/users';

export const inferNames = (user: UserProfile, cardName: string): [string, string] => {
    if (user.first_name) {
        return [user.first_name, user.last_name];
    }
    const names = cardName.split(' ');
    if (cardName.length === 2) {
        return [names[0], names[1]];
    }
    return [names[0], names.slice(1).join(' ')];
};
