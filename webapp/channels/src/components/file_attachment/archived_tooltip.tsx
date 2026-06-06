// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

export default function ArchivedTooltip() {
    const intl = useIntl();

    return (
        <>
            <div className='post-image__archived-tooltip-title'>
                {intl.formatMessage({
                    id: 'workspace_limits.archived_file.tooltip_title',
                    defaultMessage: 'This file is archived',
                })}
            </div>
            <div className='post-image__archived-tooltip-description'>
                {intl.formatMessage({
                    id: 'workspace_limits.archived_file.tooltip_description',
                    defaultMessage: 'This file is no longer available from the current archive.',
                })}
            </div>
        </>
    );
}
