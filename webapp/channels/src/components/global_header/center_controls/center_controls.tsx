// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import GlobalSearchNav from './global_search_nav/global_search_nav';
import UserGuideDropdown from './user_guide_dropdown';

const CenterControlsContainer = styled.div`
    display: flex;
    align-items: center;
    height: 40px;
    justify-content: center;
    flex-grow: 1;
    flex-basis: 40%;

    > * + * {
        margin-left: 8px;
    }
`;

const CenterControls = (): JSX.Element => {
    return (
        <CenterControlsContainer>
            <GlobalSearchNav/>
            <UserGuideDropdown/>
        </CenterControlsContainer>
    );
};

export default CenterControls;
