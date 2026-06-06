// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen} from '@testing-library/react';
import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import InviteAs, {InviteType} from './invite_as';

describe('components/invitation_modal/invite_as', () => {
    const props = {
        setInviteAs: jest.fn(),
        inviteType: InviteType.MEMBER,
        titleClass: 'title',
        canInviteGuests: true,
    };

    test('should match snapshot', () => {
        const {container} = renderWithContext(
            <InviteAs {...props}/>,
            {},
            {useMockedStore: true},
        );
        expect(container).toMatchSnapshot();
    });

    test('shows the radio buttons', () => {
        renderWithContext(
            <InviteAs {...props}/>,
            {},
            {useMockedStore: true},
        );
        expect(screen.getAllByRole('radio')).toHaveLength(2);
    });

    test('guest radio-button is disabled when canInviteGuests prop is false', () => {
        renderWithContext(
            <InviteAs
                {...props}
                canInviteGuests={false}
            />,
            {},
            {useMockedStore: true},
        );

        const guestRadioButton = screen.getByDisplayValue('GUEST');
        expect(guestRadioButton).toBeDisabled();
    });

    test('guest radio-button is enabled when canInviteGuests prop is true', () => {
        renderWithContext(
            <InviteAs {...props}/>,
            {},
            {useMockedStore: true},
        );

        const guestRadioButton = screen.getByDisplayValue('GUEST');
        expect(guestRadioButton).not.toBeDisabled();
    });
});
