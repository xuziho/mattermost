// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import webSocketClient from 'client/web_websocket_client';

import type {GlobalState} from 'types/store';
import type {PluginsState} from 'types/store/plugins';

import PluggableErrorBoundary from './error_boundary';

type ComponentProps<
    Key extends keyof PluginsState['components'],
> = PluginsState['components'][Key][number] extends {component: React.ComponentType<infer Props>} ? Props : Record<never, never>;
type WrapperProps<T extends keyof PluginsState['components']> = {

    /*
     * Override the component to be plugged
     */
    pluggableName: T;

    /*
     * Id of the specific component to be plugged.
     */
    pluggableId?: string;

}

export type PluggableProps<Key extends keyof PluginsState['components']> = WrapperProps<Key> & Omit<ComponentProps<Key>, keyof WrapperProps<Key> | 'theme' | 'webSocketClient'>

export default function Pluggable<Key extends keyof PluginsState['components']>(props: PluggableProps<Key>) {
    const {
        pluggableId,
        pluggableName,
        ...otherProps
    } = props;

    type PluggableType = PluginsState['components'][Key][number];
    const theme = useSelector(getTheme);
    const allPluginComponents = useSelector((state: GlobalState) => {
        const allComponents = state.plugins.components;
        if (Object.hasOwn(allComponents, pluggableName)) {
            return allComponents[pluggableName] as PluggableType[];
        }
        return undefined;
    });
    if (!pluggableName || !allPluginComponents) {
        return null;
    }

    let pluginComponents: PluggableType[] = [...allPluginComponents];
    if (pluggableId) {
        pluginComponents = pluginComponents.filter(
            (element) => element.id === pluggableId);
    }

    // Override the default component with any registered plugin's component
    // Select a specific component by pluginId if available
    const content = pluginComponents.map((p) => {
        if (!('component' in p) || !p.component) {
            return null;
        }

        // The function arguments typing makes sure the passed props are
        // correct, so it is safe to cast here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Component = p.component as React.ComponentType<any>;

        return (
            <PluggableErrorBoundary
                key={pluggableName + p.id}
                pluginId={p.pluginId}
            >
                <Component
                    {...otherProps}
                    theme={theme}
                    webSocketClient={webSocketClient}
                />
            </PluggableErrorBoundary>
        );
    });

    return (
        <>
            {content}
        </>
    );
}

export type PluggableComponentType = typeof Pluggable;
