// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {LogLevel} from '@mattermost/types/client4';
import type {ClientConfig} from '@mattermost/types/config';

import {AppsTypes, GeneralTypes} from 'mattermost-redux/action_types';
import {Client4} from 'mattermost-redux/client';
import type {ActionFuncAsync} from 'mattermost-redux/types/actions';

import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {loadRolesIfNeeded} from './roles';

export function getClientConfig(): ActionFuncAsync<ClientConfig> {
    return async (dispatch, getState) => {
        let data;
        try {
            data = await Client4.getClientConfig();
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            return {error};
        }

        Client4.setEnableLogging(data.EnableDeveloper === 'true');
        Client4.setDiagnosticId(data.DiagnosticId);

        const type = data.AppsPluginEnabled === 'true' ? AppsTypes.APPS_PLUGIN_ENABLED : AppsTypes.APPS_PLUGIN_DISABLED;
        const actions = [{type: GeneralTypes.CLIENT_CONFIG_RECEIVED, data}, {type}];
        dispatch(batchActions(actions));

        return {data};
    };
}

export function getLicenseConfig() {
    return bindClientFunc({
        clientFunc: Client4.getClientLicenseOld,
        onSuccess: [GeneralTypes.CLIENT_LICENSE_RECEIVED],
    });
}

export function getCustomProfileAttributeFields() {
    return bindClientFunc({
        clientFunc: Client4.getCustomProfileAttributeFields,
        onSuccess: [GeneralTypes.CUSTOM_PROFILE_ATTRIBUTE_FIELDS_RECEIVED],
    });
}

export function logClientError(message: string, level = LogLevel.Error) {
    return bindClientFunc({
        clientFunc: Client4.logClientError,
        onRequest: GeneralTypes.LOG_CLIENT_ERROR_REQUEST,
        onSuccess: GeneralTypes.LOG_CLIENT_ERROR_SUCCESS,
        onFailure: GeneralTypes.LOG_CLIENT_ERROR_FAILURE,
        params: [
            message,
            level,
        ],
    });
}

export function setServerVersion(serverVersion: string): ActionFuncAsync {
    return async (dispatch) => {
        dispatch({type: GeneralTypes.RECEIVED_SERVER_VERSION, data: serverVersion});
        dispatch(loadRolesIfNeeded([]));

        return {data: true};
    };
}

export function setUrl(url: string) {
    Client4.setUrl(url);
    return true;
}

export default {
    getClientConfig,
    getLicenseConfig,
    getCustomProfileAttributeFields,
    logClientError,
    setServerVersion,
    setUrl,
};
