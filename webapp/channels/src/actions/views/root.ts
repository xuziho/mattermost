// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import en from 'i18n/en.json';
import {ActionTypes} from 'utils/constants';

import type {ActionFuncAsync} from 'types/store';

export function loadTranslations(locale: string, url: string): ActionFuncAsync {
    return async (dispatch) => {
        const translations = {...en};

        // Need to go to the server for languages other than English
        if (locale !== 'en') {
            try {
                const serverTranslations = await Client4.getTranslations(url);
                Object.assign(translations, serverTranslations);
            } catch (error) {
                console.error(error); //eslint-disable-line no-console
            }
        }
        dispatch({
            type: ActionTypes.RECEIVED_TRANSLATIONS,
            data: {
                locale,
                translations,
            },
        });
        return {data: true};
    };
}

export function setReadout(message: string) {
    return {
        type: ActionTypes.SET_READOUT,
        data: message,
    };
}
