// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import partition from 'lodash/partition';
import React from 'react';
import {useSelector} from 'react-redux';

import {getAppBarAppBindings} from 'mattermost-redux/selectors/entities/apps';

import {getAppBarPluginComponents, getChannelHeaderPluginComponents, shouldShowAppBar} from 'selectors/plugins';

import {suitePluginIds} from 'utils/constants';

import AppBarBinding, {isAppBinding} from './app_bar_binding';
import AppBarPluginComponent, {isAppBarComponent} from './app_bar_plugin_component';

import './app_bar.scss';

export default function AppBar() {
    const channelHeaderComponents = useSelector(getChannelHeaderPluginComponents);
    const appBarPluginComponents = useSelector(getAppBarPluginComponents);
    const appBarBindings = useSelector(getAppBarAppBindings);
    const enabled = useSelector(shouldShowAppBar);

    if (!enabled) {
        return null;
    }

    const agentsPluginId = suitePluginIds.agents;

    // Partition channel header components: Agents vs others
    const [agentsComponents, otherChannelHeaderComponents] = partition(channelHeaderComponents, ({pluginId}) => {
        return pluginId === agentsPluginId;
    });

    const items = [
        ...agentsComponents,
        ...appBarPluginComponents,
        getDivider(
            agentsComponents.length + appBarPluginComponents.length,
            otherChannelHeaderComponents.length + appBarBindings.length,
        ),
        ...otherChannelHeaderComponents,
        ...appBarBindings,
    ].map((x) => {
        if (!x) {
            return x;
        }

        if (isAppBarComponent(x)) {
            return (
                <AppBarPluginComponent
                    key={x.id}
                    component={x}
                />
            );
        } else if (isAppBinding(x)) {
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

const getDivider = (beforeCount: number, afterCount: number) => (beforeCount && afterCount ? (
    <hr
        key='divider'
        className='app-bar__divider'
    />
) : null);
