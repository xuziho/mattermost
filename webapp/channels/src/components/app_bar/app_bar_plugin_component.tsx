// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {getCurrentChannel, getMyCurrentChannelMembership} from 'mattermost-redux/selectors/entities/channels';

import {getActiveRhsComponent} from 'selectors/rhs';

import PluginIcon from 'components/widgets/icons/plugin_icon';
import WithTooltip from 'components/with_tooltip';

import type {AppBarAction, ChannelHeaderButtonAction} from 'types/store/plugins';

type AppBarComponentProps = {
    component: ChannelHeaderButtonAction | AppBarAction;
}

enum ImageLoadState {
    LOADING = 'loading',
    LOADED = 'loaded',
    ERROR = 'error',
}

export const isAppBarComponent = (x: Record<string, any> | undefined): x is (ChannelHeaderButtonAction | AppBarAction) => {
    return Boolean(x?.id && x?.pluginId);
};

const AppBarPluginComponent = ({
    component,
}: AppBarComponentProps) => {
    const channel = useSelector(getCurrentChannel);
    const channelMember = useSelector(getMyCurrentChannelMembership);
    const activeRhsComponent = useSelector(getActiveRhsComponent);

    const [imageLoadState, setImageLoadState] = useState<ImageLoadState>(ImageLoadState.LOADING);

    const iconUrl = 'iconUrl' in component ? component.iconUrl : undefined;
    const icon = 'icon' in component ? component.icon : undefined;
    const dropdownText = 'dropdownText' in component ? component.dropdownText : undefined;
    const rhsComponentId = 'rhsComponentId' in component ? component.rhsComponentId : undefined;

    useEffect(() => {
        setImageLoadState(ImageLoadState.LOADING);
    }, [iconUrl]);

    const onImageLoadComplete = () => {
        setImageLoadState(ImageLoadState.LOADED);
    };

    const onImageLoadError = () => {
        setImageLoadState(ImageLoadState.ERROR);
    };

    const buttonId = `app-bar-icon-${component.pluginId}-${component.id}`;
    const tooltipText = component.tooltipText || dropdownText || component.pluginId;

    let content: React.ReactNode = (
        <div
            role='button'
            tabIndex={0}
            className='app-bar__icon-inner'
        >
            <img
                src={iconUrl}
                alt={component.pluginId}
                onLoad={onImageLoadComplete}
                onError={onImageLoadError}
            />
        </div>
    );

    const isButtonActive = rhsComponentId ? activeRhsComponent?.id === rhsComponentId : component.pluginId === activeRhsComponent?.pluginId;

    if (!iconUrl) {
        content = (
            <div
                role='button'
                tabIndex={0}
                className={classNames('app-bar__old-icon app-bar__icon-inner app-bar__icon-inner--centered', {'app-bar__old-icon--active': isButtonActive})}
            >
                {icon}
            </div>
        );
    }

    if (imageLoadState === ImageLoadState.ERROR) {
        content = (
            <PluginIcon className='icon__plugin'/>
        );
    }

    return (
        <WithTooltip
            title={tooltipText}
            isVertical={false}
        >
            <div
                id={buttonId}
                className={classNames('app-bar__icon', {'app-bar__icon--active': isButtonActive})}
                onClick={() => {
                    if (channel && channelMember) {
                        component.action?.(channel, channelMember);
                        return;
                    }
                    if ('rhsComponentId' in component) {
                        component.action();
                    }
                }}
            >
                {content}
            </div>
        </WithTooltip>
    );
};

export default AppBarPluginComponent;
