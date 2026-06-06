// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getConfig} from 'mattermost-redux/selectors/entities/general';

import './footer.scss';

const Footer = () => {
    const {SiteName} = useSelector(getConfig);

    // Check if MMEMBED cookie is set and if so, don't show the footer
    if (document.cookie.includes('MMEMBED=1')) {
        return null;
    }

    return (
        <div className='hfroute-footer'>
            <span
                key='footer-copyright'
                className='footer-copyright'
            >
                {`© ${new Date().getFullYear()} ${SiteName || 'Mattermost'}`}
            </span>
        </div>
    );
};

export default Footer;
