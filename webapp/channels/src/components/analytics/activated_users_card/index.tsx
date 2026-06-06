// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import StatisticCount from 'components/analytics/statistic_count';

import Title from './title';

type ActivatedUserCardProps = {
    activatedUsers: number | undefined;
    guestAccountsEnabled?: boolean;
}

const ActivatedUserCard = ({activatedUsers, guestAccountsEnabled = false}: ActivatedUserCardProps) => {
    return (
        <StatisticCount
            title={<Title guestAccountsEnabled={guestAccountsEnabled}/>}
            icon='fa-users'
            count={activatedUsers}
            id='totalActiveUsers'
        />
    );
};

export default ActivatedUserCard;
