// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {useDispatch} from 'react-redux';

import {AccountOutlineIcon} from '@mattermost/compass-icons/components';

import {openModal} from 'actions/views/modals';

import * as Menu from 'components/menu';
import UserSettingsModal from 'components/user_settings/modal';

import {ModalIdentifiers} from 'utils/constants';

export default function UserAccountProfileMenuItem() {
    const dispatch = useDispatch();

    function handleClick() {
        dispatch(openModal({
            modalId: ModalIdentifiers.USER_SETTINGS,
            dialogType: UserSettingsModal,
            dialogProps: {
                isContentProductSettings: false,
                focusOriginElement: 'userAccountMenuButton',
            },
        }));
    }

    return (
        <Menu.Item
            leadingElement={
                <AccountOutlineIcon
                    size={18}
                    aria-hidden='true'
                />
            }
            labels={
                <FormattedMessage
                    id='userAccountMenu.profileMenuItem.label'
                    defaultMessage='Profile'
                />
            }
            aria-haspopup={true}
            onClick={handleClick}
        />
    );
}
