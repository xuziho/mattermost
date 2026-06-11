// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {appBarEnabled, getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';

import AppBarBinding, {isAppBinding} from './app_bar_binding';

import './app_bar.scss';

export default function AppBar() {
    const appBarBindings = useSelector(getAppBarAppBindings);
    const enabled = useSelector(appBarEnabled);

    if (!enabled || !appBarBindings.length) {
        return null;
    }

    const items = appBarBindings.map((x) => {
        if (!x) {
            return x;
        }

        if (isAppBinding(x)) {
            return (
                <AppBarBinding
                    key={`${x.app_id}_${x.label}`}
                    binding={x}
                />
            );
        }
        return x;
    });

    return (
        <div className={'app-bar'}>
            <div className={'app-bar__top'}>
                {items}
            </div>
        </div>
    );
}
