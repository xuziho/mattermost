// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {type ReactNode} from 'react';
import {useIntl} from 'react-intl';
import type {MessageDescriptor} from 'react-intl';

import WithTooltip from 'components/with_tooltip';

import './restricted_indicator.scss';

type Props = {
    blocked?: boolean;
    minimumPlanRequiredForFeature?: string;
    tooltipTitle?: ReactNode;
    tooltipMessage?: ReactNode;
    tooltipMessageBlocked?: string | MessageDescriptor;
    ctaExtraContent?: ReactNode;
    clickCallback?: () => void;
}

function capitalizeFirstLetter(s: string) {
    return s?.charAt(0)?.toUpperCase() + s?.slice(1);
}

const RestrictedIndicator = ({
    blocked,
    tooltipTitle,
    tooltipMessage,
    tooltipMessageBlocked,
    ctaExtraContent,
    clickCallback,
    minimumPlanRequiredForFeature,
}: Props) => {
    const {formatMessage} = useIntl();

    const getTooltipMessageBlocked = () => {
        if (!tooltipMessageBlocked) {
            return formatMessage(
                {
                    id: 'restricted_indicator.tooltip.message.blocked',
                    defaultMessage: 'This feature is not available on this server.',
                },
            );
        }

        return typeof tooltipMessageBlocked === 'string' ? tooltipMessageBlocked : formatMessage(tooltipMessageBlocked, {
            minimumPlanRequiredForFeature,
        });
    };

    const icon = <i className={classNames('RestrictedIndicator__icon-tooltip', 'icon', 'icon-key-variant')}/>;

    const handleClickCallback = () => {
        if (clickCallback) {
            clickCallback();
        }
    };

    return (
        <span className='RestrictedIndicator__icon-tooltip-container'>
            <WithTooltip
                title={
                    <div className='RestrictedIndicator__icon-tooltip'>
                        <span className='title'>
                            {tooltipTitle || formatMessage({id: 'restricted_indicator.tooltip.title', defaultMessage: '{minimumPlanRequiredForFeature} feature'}, {minimumPlanRequiredForFeature: capitalizeFirstLetter(minimumPlanRequiredForFeature!)})}
                        </span>
                        <span className='message'>
                            {blocked ? (
                                getTooltipMessageBlocked()
                            ) : (
                                tooltipMessage || formatMessage({id: 'restricted_indicator.tooltip.mesage', defaultMessage: 'This feature is available on this server.'})
                            )}
                        </span>
                    </div>
                }
            >
                <div
                    className='RestrictedIndicator__content'
                    onClick={handleClickCallback}
                >
                    {icon}
                    {ctaExtraContent}
                </div>
            </WithTooltip>
        </span>
    );
};

export default RestrictedIndicator;
