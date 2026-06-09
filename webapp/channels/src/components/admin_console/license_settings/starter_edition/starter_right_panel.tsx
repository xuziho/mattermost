// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import SetupSystemSvg from 'components/common/svg_images_components/setup_system_svg';

const StarterRightPanel = () => {
    const intl = useIntl();
    const licenseDetails = [
        intl.formatMessage({
            id: 'admin.license.localLicenseDetail.fileBased',
            defaultMessage: 'File-based local license management',
        }),
        intl.formatMessage({
            id: 'admin.license.localLicenseDetail.compatibility',
            defaultMessage: 'Compatibility with existing license APIs',
        }),
        intl.formatMessage({
            id: 'admin.license.localLicenseDetail.noCloudBilling',
            defaultMessage: 'No cloud billing or trial workflow is required',
        }),
    ];

    return (
        <div className='StarterEditionRightPannel'>
            <div className='svg-image'>
                <SetupSystemSvg
                    width={197}
                    height={120}
                />
            </div>
	            <div className='upgrade-title'>
	                <FormattedMessage
	                    id='admin.license.upgradeTitle'
	                    defaultMessage='Manage local license files'
	                />
	            </div>
	            <div className='advantages-list'>
	                {licenseDetails.map((item, i) => {
                    return (
                        <div
                            className='item'
                            key={i.toString()}
                        >
                            <i className='fa fa-lock'/>
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default memo(StarterRightPanel);
