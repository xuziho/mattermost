// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';
import {LicenseSkus} from 'utils/constants';

import EnterpriseEditionRightPanel from './enterprise_edition_right_panel';
import type {EnterpriseEditionProps} from './enterprise_edition_right_panel';

const initialState = {
    views: {
        announcementBar: {
            announcementBarState: {
                announcementBarCount: 1,
            },
        },
    },
    entities: {
        general: {
            license: {
                IsLicensed: 'true',
                Cloud: 'true',
            },
        },
        users: {
            currentUserId: 'current_user_id',
            profiles: {
                current_user_id: {roles: 'system_user'},
            },
        },
        preferences: {
            myPreferences: {},
        },
    },
};

describe('components/admin_console/license_settings/enterprise_edition/enterprise_edition_right_panel', () => {
    const license = {
        IsLicensed: 'true',
        IssuedAt: '1517714643650',
        StartsAt: '1517714643650',
        ExpiresAt: '1620335443650',
        SkuShortName: LicenseSkus.Starter,
        Name: 'LicenseName',
        Company: 'Mattermost Inc.',
        Users: '1000000',
    };

    const props = {
        license,
    } as EnterpriseEditionProps;

    test('should render for Professional license', () => {
        const {container} = renderWithContext(
            <EnterpriseEditionRightPanel
                license={{...props.license, SkuShortName: LicenseSkus.Professional}}
            />,
            initialState,
        );

        expect(container.querySelector('.license-title')?.textContent).toEqual('Local license details');

        const subtitleItems = container.querySelectorAll('.license-subtitle .item');
        expect(subtitleItems[0].textContent).toEqual('File-based local license management');
        expect(subtitleItems[1].textContent).toEqual('Compatibility with existing license APIs');
        expect(subtitleItems[2].textContent).toEqual('Works without external billing or account services');
    });

    test('should render for Enterprise license', () => {
        const {container} = renderWithContext(
            <EnterpriseEditionRightPanel
                license={{...props.license, SkuShortName: LicenseSkus.Enterprise}}
            />,
            initialState,
        );

        expect(container.querySelector('.license-title')?.textContent).toEqual('Local license details');

        const subtitleItems = container.querySelectorAll('.license-subtitle .item');
        expect(subtitleItems[0].textContent).toEqual('File-based local license management');
        expect(subtitleItems[1].textContent).toEqual('Compatibility with existing license APIs');
        expect(subtitleItems[2].textContent).toEqual('Works without external billing or account services');
    });

    test('should render for Enterprise Advanced license', () => {
        const {container} = renderWithContext(
            <EnterpriseEditionRightPanel
                license={{...props.license, SkuShortName: LicenseSkus.EnterpriseAdvanced}}
            />,
            initialState,
        );

        expect(container.querySelector('.license-title')?.textContent).toEqual('Licensed seat count');
        expect(container.querySelector('.license-subtitle')?.textContent).toEqual('Upload an updated license if you need to increase your licensed headcount.');
    });

    test('should render for Entry license', () => {
        const {container} = renderWithContext(
            <EnterpriseEditionRightPanel
                license={{...props.license, SkuShortName: LicenseSkus.Entry}}
            />,
            initialState,
        );

        expect(container.querySelector('.license-title')?.textContent).toEqual('Local license capacity');
        expect(container.querySelector('.license-subtitle')?.textContent).toEqual('Upload a local license file if this deployment needs licensed capacity controls.');
    });

});
