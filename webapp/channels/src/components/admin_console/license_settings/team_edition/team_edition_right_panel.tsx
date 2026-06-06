// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import SetupSystemSvg from 'components/common/svg_images_components/setup_system_svg';

const TeamEditionRightPanel: React.FC = () => {
    const licensedFeatures = [
        'AD/LDAP Group Sync',
        'High Availability',
        'Advanced compliance',
        'And more...',
    ];

    return (
        <div className='TeamEditionRightPanel'>
            <div className='svg-image'>
                <SetupSystemSvg
                    width={197}
                    height={120}
                />
            </div>
            <div className='upgrade-title'>
                <FormattedMessage
                    id='admin.license.enterprise.localLicenseFeatures'
                    defaultMessage='Licensed server features'
                />
            </div>
            <div className='upgrade-subtitle'>
                <FormattedMessage
                    id='admin.license.enterprise.license_required_upgrade'
                    defaultMessage='A local license file is required to unlock licensed features'
                />
            </div>
            <div className='advantages-list'>
                {licensedFeatures.map((item: string) => {
                    return (
                        <div
                            className='item'
                            key={item}
                        >
                            <i className='fa fa-lock'/>{item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(TeamEditionRightPanel);
