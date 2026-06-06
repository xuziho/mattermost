// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';
import {ErrorPageTypes} from 'utils/constants';

import ErrorPage from './error_page';

describe('ErrorPage', () => {
    it('displays cloud archived page correctly', () => {
        renderWithContext(
            (
                <ErrorPage
                    location={{
                        search: `?type=${ErrorPageTypes.CLOUD_ARCHIVED}`,
                    }}
                />
            ),
        );

        screen.getByText('Message Archived');
        screen.getByText('Permalink belongs to a message that has been archived.');
    });
});
