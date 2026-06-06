// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {defineMessage, type MessageDescriptor} from 'react-intl';

import type {AdminConfig, ClientLicense} from '@mattermost/types/config';

import RestrictedIndicator from 'components/widgets/menu/menu_items/restricted_indicator';

import {getLicenseTier, LicenseSkus} from 'utils/constants';

import type {Check, ConsoleAccess} from './types';
import ValidationResult from './validation';

export const it = {
    not: (func: Check) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess, isSystemAdmin?: boolean) => {
        return typeof func === 'function' ? !func(config, state, license, enterpriseReady, consoleAccess, isSystemAdmin) : !func;
    },
    all: (...funcs: Check[]) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess, isSystemAdmin?: boolean) => {
        for (const func of funcs) {
            if (typeof func === 'function' ? !func(config, state, license, enterpriseReady, consoleAccess, isSystemAdmin) : !func) {
                return false;
            }
        }
        return true;
    },
    any: (...funcs: Check[]) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess, isSystemAdmin?: boolean) => {
        for (const func of funcs) {
            if (typeof func === 'function' ? func(config, state, license, enterpriseReady, consoleAccess, isSystemAdmin) : func) {
                return true;
            }
        }
        return false;
    },
    stateMatches: (key: string, regex: RegExp) => (config: Partial<AdminConfig>, state: any) => state[key].match(regex),
    stateEquals: (key: string, value: any) => (config: Partial<AdminConfig>, state: any) => state[key] === value,
    stateEqualsOrDefault: (key: string, value: any, defaultValue: any) => (config: Partial<AdminConfig>, state: any) => {
        const stateValue = state[key];
        return stateValue === value || (stateValue == null && value === defaultValue);
    },
    stateIsTrue: (key: string) => (config: Partial<AdminConfig>, state: any) => Boolean(state[key]),
    stateIsFalse: (key: string) => (config: Partial<AdminConfig>, state: any) => !state[key],
    configIsTrue: (group: keyof Partial<AdminConfig>, setting: string) => (config: Partial<AdminConfig>) => Boolean((config[group] as any)?.[setting]),
    configIsFalse: (group: keyof Partial<AdminConfig>, setting: string) => (config: Partial<AdminConfig>) => !(config[group] as any)?.[setting],
    configContains: (group: keyof Partial<AdminConfig>, setting: string, word: string) => (config: Partial<AdminConfig>) => Boolean((config[group] as any)?.[setting]?.includes(word)),
    enterpriseReady: (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean) => Boolean(enterpriseReady),
    licensed: (config: Partial<AdminConfig>, state: any, license?: ClientLicense) => license?.IsLicensed === 'true',
    licensedForFeature: (feature: string) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense) => Boolean(license?.IsLicensed && license[feature] === 'true'),
    licensedForSku: (skuName: string) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense) => Boolean(license?.IsLicensed && license.SkuShortName === skuName),
    minLicenseTier: (skuName: string) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense) => Boolean(license?.IsLicensed && getLicenseTier(license.SkuShortName) >= getLicenseTier(skuName)),
    userHasReadPermissionOnResource: (key: string) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess) => (consoleAccess?.read as any)?.[key],
    userHasReadPermissionOnSomeResources: (key: { [key: string]: string }) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess) => Object.values(key).some((resource) => (consoleAccess?.read as any)?.[resource]),
    userHasWritePermissionOnResource: (key: string) => (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess) => (consoleAccess?.write as any)?.[key],
    isSystemAdmin: (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess, isSystemAdmin?: boolean) => Boolean(isSystemAdmin),
};

export const validators = {
    isRequired: (text: MessageDescriptor | string) => (value: string) => new ValidationResult(Boolean(value), text),
    minValue: (min: number, text: MessageDescriptor | string) => (value: number) => new ValidationResult((value >= min), text),
    maxValue: (max: number, text: MessageDescriptor | string) => (value: number) => new ValidationResult((value <= max), text),
};

export const usesLegacyOauth = (config: Partial<AdminConfig>, state: any, license?: ClientLicense, enterpriseReady?: boolean, consoleAccess?: ConsoleAccess) => {
    if (!config.GitLabSettings || !config.GoogleSettings || !config.Office365Settings) {
        return false;
    }

    return it.any(
        it.all(
            it.not(it.configContains('GitLabSettings', 'Scope', 'openid')),
            it.any(
                it.configIsTrue('GitLabSettings', 'Id'),
                it.configIsTrue('GitLabSettings', 'Secret'),
            ),
        ),
        it.all(
            it.not(it.configContains('GoogleSettings', 'Scope', 'openid')),
            it.any(
                it.configIsTrue('GoogleSettings', 'Id'),
                it.configIsTrue('GoogleSettings', 'Secret'),
            ),
        ),
        it.all(
            it.not(it.configContains('Office365Settings', 'Scope', 'openid')),
            it.any(
                it.configIsTrue('Office365Settings', 'Id'),
                it.configIsTrue('Office365Settings', 'Secret'),
            ),
        ),
    )(config, state, license, enterpriseReady, consoleAccess);
};

export const getRestrictedIndicator = (displayBlocked = false, minimumPlanRequiredForFeature = LicenseSkus.Professional) => ({
    value: () => (
        <RestrictedIndicator
            useModal={false}
            blocked={displayBlocked}
            minimumPlanRequiredForFeature={minimumPlanRequiredForFeature}
            tooltipMessageBlocked={defineMessage({
                id: 'admin.sidebar.restricted_indicator.tooltip.message.blocked',
                // eslint-disable-next-line formatjs/enforce-placeholders -- Placeholders provided in RestrictedIndicator
                defaultMessage: 'This {minimumPlanRequiredForFeature} feature is not available on this server.',
            })}
        />
    ),
    shouldDisplay: () => displayBlocked,
});
