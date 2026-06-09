// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {RefObject} from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';

import {FileTypes} from 'utils/constants';

import './starter_edition.scss';
export interface StarterEditionProps {
    currentPlan: JSX.Element;
    fileInputRef: RefObject<HTMLInputElement>;
    handleChange: () => void;
}

export const messages = defineMessages({
    key: {id: 'admin.license.key', defaultMessage: 'License Key: '},
});

const StarterLeftPanel: React.FC<StarterEditionProps> = ({
    currentPlan,
    fileInputRef,
    handleChange,
}: StarterEditionProps) => {
    return (
        <div className='StarterLeftPanel'>
            <div className='title'>
                <FormattedMessage
                    id='admin.license.freeEdition.title'
                    defaultMessage='Free'
                />
            </div>
            <div className='currentPlanLegend'>
                {currentPlan}
            </div>
            <div className='subtitle'>
                <FormattedMessage
                    id='admin.license.freeEdition.subtitle'
                    defaultMessage='Upload a license to unlock licensed features.'
                />
            </div>
            <hr/>
            <div className='content'>
                <p>
                    {'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.'}
                </p>
            </div>
            <div className='licenseInformation'>
                <div className='licenseKeyTitle'>
                    <FormattedMessage {...messages.key}/>
                </div>
                <div className='uploadButtons'>
                    <button
                        className='btn btn-primary'
                        onClick={() => fileInputRef.current?.click()}
                        id='open-modal'
                    >
                        <FormattedMessage
                            id='admin.license.uploadFile'
                            defaultMessage='Upload File'
                        />
                    </button>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept={FileTypes.LICENSE_EXTENSION}
                        onChange={handleChange}
                        style={{display: 'none'}}
                    />
                </div>
            </div>
        </div>
    );
};

export default React.memo(StarterLeftPanel);
