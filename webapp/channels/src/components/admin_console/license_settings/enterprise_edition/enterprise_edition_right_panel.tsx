// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import type {ClientLicense} from '@mattermost/types/config';

import SetupSystemSvg from 'components/common/svg_images_components/setup_system_svg';

import {LicenseSkus} from 'utils/constants';

export interface EnterpriseEditionProps {
    isTrialLicense: boolean;
    license: ClientLicense;
}

const EnterpriseEditionRightPanel = ({
    isTrialLicense,
    license,
}: EnterpriseEditionProps) => {
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
            id: 'admin.license.localLicenseDetail.offline',
            defaultMessage: 'Works without external billing or account services',
        }),
    ];

    const isEnterpriseAdvanced = license?.SkuShortName === LicenseSkus.EnterpriseAdvanced;
    const isEnterprise = license?.SkuShortName === LicenseSkus.Enterprise;
    const isProfessional = license?.SkuShortName === LicenseSkus.Professional;
    const isEntry = license?.SkuShortName === LicenseSkus.Entry;

    const title = () => {
        if (isTrialLicense) {
            return (
                <FormattedMessage
                    id='admin.license.timeLimitedLicenseTitle'
                    defaultMessage='Time-limited license'
                />
            );
        }
        if (isEntry) {
            return (
                <FormattedMessage
                    id='admin.license.entryPlanTitle'
                    defaultMessage='Local license capacity'
                />
            );
        }
        if (isEnterpriseAdvanced) {
            return (
                <FormattedMessage
                    id='admin.license.enterprisePlanTitle'
                    defaultMessage='Licensed seat count'
                />
            );
        }
        if (isEnterprise) {
            return (
                <FormattedMessage
                    id='admin.license.additionalLicensedFeatures'
                    defaultMessage='Local license details'
                />
            );
        }
        if (isProfessional) {
            return (
                <FormattedMessage
                    id='admin.license.additionalLicensedFeatures'
                    defaultMessage='Local license details'
                />
            );
        }
        return (
            <FormattedMessage
                id='admin.license.additionalLicensedFeatures'
                defaultMessage='Local license details'
            />
        );
    };

    const svgImage = () => {
        if (isEnterpriseAdvanced) {
            return null; //No image
        }

        // Show the setup system image for Entry SKU and other SKUs
        return (
            <SetupSystemSvg
                width={197}
                height={120}
            />
        );
    };

    const subtitle = () => {
        if (isTrialLicense) {
            return (
                <FormattedMessage
                    id='admin.license.timeLimitedLicenseSubtitle'
                    defaultMessage='Upload a new local license file before this license expires to continue using licensed features.'
                />
            );
        }
        if (isEntry) {
            return (
                <FormattedMessage
                    id='admin.license.entryPlanSubtitle'
                    defaultMessage='Upload a local license file if this deployment needs licensed capacity controls.'
                />
            );
        }
        if (isEnterpriseAdvanced) {
            return (
                <FormattedMessage
                    id='admin.license.enterprisePlanSubtitle'
                    defaultMessage='Upload an updated license if you need to increase your licensed headcount.'
                />
            );
        }
        return (
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
        );
    };

    // For Entry SKU, render custom buttons
    if (isEntry) {
        return (
            <div className='EnterpriseEditionRightPannel entry'>
                <div className='svg-image'>
                    {svgImage()}
                </div>
                <div className='license-title'>
                    {title()}
                </div>
                <div className='license-subtitle'>
                    {subtitle()}
                </div>
            </div>
        );
    }

    return (
        <div className='EnterpriseEditionRightPannel'>
            <div className='svg-image'>
                {svgImage()}
            </div>
            <div className='license-title'>
                {title()}
            </div>
            <div className='license-subtitle'>
                {subtitle()}
            </div>
        </div>
    );
};

export default memo(EnterpriseEditionRightPanel);
