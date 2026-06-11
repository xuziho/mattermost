// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import Permissions from 'mattermost-redux/constants/permissions';
import {ResourceToSysConsolePermissionsTable, RESOURCE_KEYS} from 'mattermost-redux/constants/permissions_sysconsole';
import {createSelector} from 'mattermost-redux/selectors/create_selector';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {getMySystemPermissions, haveISystemPermission} from 'mattermost-redux/selectors/entities/roles_helpers';

import AdminDefinition from 'components/admin_console/admin_definition';

import {isEnterpriseLicense} from '../utils/license_utils';

export const getAdminDefinition = createSelector(
    'getAdminDefinition',
    () => AdminDefinition,
    (adminDefinition) => adminDefinition,
);

export const getAdminConsoleCustomComponents = () => ({});

export const getAdminConsoleCustomSections = () => ({});

export const getConsoleAccess = createSelector(
    'getConsoleAccess',
    getAdminDefinition,
    getMySystemPermissions,
    (adminDefinition, mySystemPermissions) => {
        const consoleAccess = {read: {}, write: {}};
        const addEntriesForKey = (entryKey) => {
            const permissions = ResourceToSysConsolePermissionsTable[entryKey].filter((x) => mySystemPermissions.has(x));
            consoleAccess.read[entryKey] = permissions.length !== 0;
            consoleAccess.write[entryKey] = permissions.some((permission) => permission.startsWith('sysconsole_write_'));
        };
        const mapAccessValuesForKey = ([key]) => {
            if (typeof RESOURCE_KEYS[key.toUpperCase()] === 'object') {
                Object.values(RESOURCE_KEYS[key.toUpperCase()]).forEach((entry) => {
                    addEntriesForKey(entry);
                });
            } else {
                addEntriesForKey(key);
            }
        };
        Object.entries(adminDefinition).forEach(mapAccessValuesForKey);
        return consoleAccess;
    },
);

export const getShowManageUserSettings = createSelector(
    'showManageUserSettings',
    getLicense,
    (state) => state,
    (license, state) => {
        const hasWriteUserManagementPermission = haveISystemPermission(state, {permission: Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_USERS});

        const isEnterprise = isEnterpriseLicense(license);

        return hasWriteUserManagementPermission && isEnterprise;
    },
);

export const getShowLockedManageUserSettings = createSelector(
    'showLockedManageUserSettings',
    getLicense,
    (state) => state,
    (license, state) => {
        const hasWriteUserManagementPermission = haveISystemPermission(state, {permission: Permissions.SYSCONSOLE_WRITE_USERMANAGEMENT_USERS});

        const isEnterprise = isEnterpriseLicense(license);

        return hasWriteUserManagementPermission && !isEnterprise;
    },
);
