// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MessageDescriptor} from 'react-intl';

import AdminSectionPanel from 'components/widgets/admin_console/admin_section_panel';

import {LicenseSkus} from 'utils/constants';

type OwnProps = {
    settingsList: React.ReactNode[];
    requiredSku?: LicenseSkus;
    sectionTitle?: string | MessageDescriptor;
    sectionDescription?: string | MessageDescriptor;
};

const LicensedSectionContainer: React.FC<OwnProps> = ({
    settingsList,
    requiredSku,
    sectionTitle,
    sectionDescription,
}) => {
    return (
        <AdminSectionPanel
            title={sectionTitle}
            description={sectionDescription}
            licenseSku={requiredSku || LicenseSkus.EnterpriseAdvanced}
        >
            {settingsList}
        </AdminSectionPanel>
    );
};

export default LicensedSectionContainer;
