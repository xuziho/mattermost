// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import UserAccountMenu from 'components/user_account_menu';

import AtMentionsButton from './at_mentions_button/at_mentions_button';
import SavedPostsButton from './saved_posts_button/saved_posts_button';
import SettingsButton from './settings_button';

const RightControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    flex-shrink: 0;
    position: relative;
    flex-basis: 30%;
    justify-content: flex-end;

    > * + * {
        margin-left: 8px;
    }
`;

const StyledCustomizeYourExperienceTour = styled.div`
    display: flex;
    align-items: center;
    height: 100%
`;

const RightControls = (): JSX.Element => {
    return (
        <RightControlsContainer
            id={'RightControlsContainer'}
        >
            <AtMentionsButton/>
            <SavedPostsButton/>
            <StyledCustomizeYourExperienceTour id='CustomizeYourExperienceTour'>
                <SettingsButton/>
                <UserAccountMenu/>
            </StyledCustomizeYourExperienceTour>
        </RightControlsContainer>
    );
};

export default RightControls;
