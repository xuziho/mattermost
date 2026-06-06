// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {RouteComponentProps} from 'react-router-dom';
import {Redirect} from 'react-router-dom';

import * as GlobalActions from 'actions/global_actions';

import {renderWithContext} from 'tests/react_testing_utils';

import RootRedirect from './root_redirect';
import type {Props} from './root_redirect';

jest.mock('actions/global_actions', () => ({
    redirectUserToDefaultTeam: jest.fn(),
}));

jest.mock('react-router-dom', () => {
    const actual = jest.requireActual('react-router-dom');
    return {
        ...actual,
        Redirect: jest.fn(() => null),
    };
});

describe('components/RootRedirect', () => {
    const baseProps: Props = {
        currentUserId: '',
    };

    const defaultProps = {
        ...baseProps,
        location: {
            pathname: '/',
        },
    } as Props & RouteComponentProps;

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should redirect to /login when currentUserId is empty', () => {
        renderWithContext(<RootRedirect {...defaultProps}/>);

        expect(Redirect).toHaveBeenCalledTimes(1);
        expect(Redirect).toHaveBeenCalledWith(
            expect.objectContaining({
                to: expect.objectContaining({
                    pathname: '/login',
                }),
            }),
            {},
        );
    });

    test('should call GlobalActions.redirectUserToDefaultTeam when user is logged in', () => {
        const props = {
            ...defaultProps,
            currentUserId: 'test-user-id',
        };

        renderWithContext(<RootRedirect {...props}/>);

        expect(GlobalActions.redirectUserToDefaultTeam).toHaveBeenCalledTimes(1);
    });
});
