// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import GlobalHeader from 'components/global_header/global_header';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import * as hooks from './hooks';

jest.mock('./hooks');

// Mock child components to avoid deep dependency issues
jest.mock('./left_controls/left_controls', () => () => <div id='mock-left-controls'/>);
jest.mock('./center_controls/center_controls', () => () => <div id='mock-center-controls'/>);
jest.mock('./right_controls/right_controls', () => () => <div id='mock-right-controls'/>);

describe('components/global/global_header', () => {
    test('should not render when user is not logged in', () => {
        jest.spyOn(hooks, 'useIsLoggedIn').mockReturnValue(false);

        const {container} = renderWithContext(<GlobalHeader/>);

        expect(container.firstChild).toBeNull();
    });

    describe('when user is logged in', () => {
        beforeEach(() => {
            jest.spyOn(hooks, 'useIsLoggedIn').mockReturnValue(true);
        });

        test('should render header', () => {
            renderWithContext(<GlobalHeader/>);

            expect(screen.getByRole('banner')).toBeInTheDocument();
        });

    });
});
