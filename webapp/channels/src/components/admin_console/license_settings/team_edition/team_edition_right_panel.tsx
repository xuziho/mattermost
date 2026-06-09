// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import SetupSystemSvg from 'components/common/svg_images_components/setup_system_svg';

const TeamEditionRightPanel: React.FC = () => {
    const licensedFeatures = [
        'Optional local license file support',
        'Seat and expiration visibility',
        'Compatibility with existing license APIs',
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
	                    defaultMessage='Local license management'
	                />
	            </div>
	            <div className='upgrade-subtitle'>
	                <FormattedMessage
	                    id='admin.license.enterprise.license_required_upgrade'
	                    defaultMessage='Upload a local license file only if this AgentCompanyOS deployment needs one.'
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
