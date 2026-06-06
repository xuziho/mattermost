// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import styled from 'styled-components';

import {getLicense} from 'mattermost-redux/selectors/entities/general';

import {TrialPeriodDays} from 'utils/constants';
import {getRemainingDaysFromFutureTimestamp} from 'utils/utils';

type PlanLabelProps = {
    text: string;
    bgColor: string;
    color: string;
    firstSvg: JSX.Element;
    secondSvg?: JSX.Element;
    renderLastDaysOnTrial?: boolean;
}

type StyledProps = {
    bgColor?: string;
    color?: string;
}

const StyledPlanLabel = styled.div<StyledProps>`
background-color: ${(props) => props.bgColor};
color: ${(props) => props.color};
`;

function PlanLabel(props: PlanLabelProps) {
    const {formatMessage} = useIntl();
    const license = useSelector(getLicense);
    const isSelfHostedEnterpriseTrial = license.IsTrial === 'true';

    let text = props.text;

    if (props.renderLastDaysOnTrial && isSelfHostedEnterpriseTrial) {
        const daysLeftOnTrial = Math.min(
            getRemainingDaysFromFutureTimestamp(parseInt(license.ExpiresAt, 10)),
            TrialPeriodDays.TRIAL_30_DAYS,
        );
        text = formatMessage({id: 'pricing_modal.plan_label_trialDays', defaultMessage: '{days} DAYS LEFT ON TRIAL'}, {days: daysLeftOnTrial});
    }

    return (
        <StyledPlanLabel
            className='planLabel'
            bgColor={props.bgColor}
            color={props.color}
        >
            {props.firstSvg}
            {text}
            {props.secondSvg}
        </StyledPlanLabel>
    );
}

export default PlanLabel;
