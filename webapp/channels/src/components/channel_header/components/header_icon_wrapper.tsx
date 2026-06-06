// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import WithTooltip from 'components/with_tooltip';
import type {ShortcutDefinition} from 'components/with_tooltip/tooltip_shortcut';

type Props = {

    /**
     * ariaLabelOverride lets you override the aria-label which would otherwise use the tooltip text. This typically
     * shouldn't be needed.
     */
    ariaLabelOverride?: string;

    buttonClass?: string;
    buttonId: string;
    children: React.ReactNode;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    tooltip: string;
    tooltipShortcut?: ShortcutDefinition;
    isRhsOpen?: boolean;
    pluginId?: string;
}

const HeaderIconWrapper = (props: Props) => {
    const {
        ariaLabelOverride,
        buttonClass,
        buttonId,
        children,
        onClick,
        tooltip: tooltipText,
        tooltipShortcut,
        isRhsOpen,
    } = props;

    const ariaLabelText = ariaLabelOverride ?? tooltipText;

    return (
        <>
            <WithTooltip
                title={isRhsOpen ? '' : tooltipText}
                shortcut={tooltipShortcut}
            >
                <button
                    id={buttonId}
                    aria-label={ariaLabelText}
                    className={buttonClass || 'channel-header__icon'}
                    onClick={onClick}
                >
                    {children}
                </button>
            </WithTooltip>
        </>
    );
};

export default HeaderIconWrapper;
