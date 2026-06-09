// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function MattermostLogo(props: React.HTMLAttributes<HTMLSpanElement>) {
    const {formatMessage} = useIntl();
    return (
        <span {...props}>
            <svg
                viewBox='0 0 48 48'
                role='img'
                aria-label={formatMessage({id: 'generic_icons.agentcompanyos', defaultMessage: 'AgentCompanyOS Logo'})}
            >
                <circle
                    cx='24'
                    cy='24'
                    r='22'
                    fill='currentColor'
                    opacity='0.16'
                />
                <path
                    d='M14 33.5L22.4 14h3.2L34 33.5h-4.1l-1.7-4.2h-8.5L18 33.5h-4zm7-7.7h5.9L24 18.3l-3 7.5zm14.8 7.7V14h3.7v19.5h-3.7z'
                    fill='currentColor'
                />
            </svg>
        </span>
    );
}
