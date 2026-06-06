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
    const upgradeAdvantages = [
        intl.formatMessage({
            id: 'admin.license.upgradeAdvantage.adLdapSync',
            defaultMessage: 'AD/LDAP Group sync',
        }),
        intl.formatMessage({
            id: 'admin.license.upgradeAdvantage.highAvailability',
            defaultMessage: 'High Availability',
        }),
        intl.formatMessage({
            id: 'admin.license.upgradeAdvantage.advancedCompliance',
            defaultMessage: 'Advanced compliance',
        }),
        intl.formatMessage({
            id: 'admin.license.upgradeAdvantage.advancedRoles',
            defaultMessage: 'Advanced roles and permissions',
        }),
        intl.formatMessage({
            id: 'admin.license.upgradeAdvantage.andMore',
            defaultMessage: 'And more...',
        }),
    ];

    const enterpriseToAdvancedAdvantages = [
        intl.formatMessage({
            id: 'admin.license.enterpriseToAdvancedAdvantage.dynamicAttributeBasedAccessControls',
            defaultMessage: 'Dynamic attribute-based access controls',
        }),
        intl.formatMessage({
            id: 'admin.license.enterpriseToAdvancedAdvantage.dataSpillageHandling',
            defaultMessage: 'Data spillage handling',
        }),
        intl.formatMessage({
            id: 'admin.license.enterpriseToAdvancedAdvantage.burnOnReadMessages',
            defaultMessage: 'Burn-on-read messages',
        }),
        intl.formatMessage({
            id: 'admin.license.enterpriseToAdvancedAdvantage.mobileBiometricsAndAdvancedSecurity',
            defaultMessage: 'Mobile biometrics & advanced security',
        }),
        intl.formatMessage({
            id: 'admin.license.enterpriseToAdvancedAdvantage.automaticChannelTranslations',
            defaultMessage: 'Automatic channel translations',
        }),
        intl.formatMessage({
            id: 'admin.license.enterpriseToAdvancedAdvantage.channelBanners',
            defaultMessage: 'Channel banners',
        }),
        intl.formatMessage({
            id: 'admin.license.upgradeAdvantage.andMore',
            defaultMessage: 'And more...',
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
                    defaultMessage='Get access to full message history, AI-powered coordination, and secure workflow continuity'
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
                    defaultMessage='Additional licensed features'
                />
            );
        }
        if (isProfessional) {
            return (
                <FormattedMessage
                    id='admin.license.additionalLicensedFeatures'
                    defaultMessage='Additional licensed features'
                />
            );
        }
        return (
            <FormattedMessage
                id='admin.license.additionalLicensedFeatures'
                defaultMessage='Additional licensed features'
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
                    defaultMessage='Upload a license to unlock full access.'
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
        const advantages = isEnterprise ? enterpriseToAdvancedAdvantages : upgradeAdvantages;

        return (
            <div className='advantages-list'>
                {advantages.map((item, i) => {
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
                <div className='upgrade-title'>
                    {title()}
                </div>
                <div className='upgrade-subtitle'>
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
            <div className='upgrade-title'>
                {title()}
            </div>
            <div className='upgrade-subtitle'>
                {subtitle()}
            </div>
        </div>
    );
};

export default memo(EnterpriseEditionRightPanel);
