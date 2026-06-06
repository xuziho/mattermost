// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {RouteComponentProps} from 'react-router-dom';
import {Route} from 'react-router-dom';

import LoggedIn from 'components/logged_in';

type Props = {
    component: React.ComponentType<RouteComponentProps<any>>;
    path: string | string[];
};

export default function LoggedInRoute(props: Props) {
    const {component: Component, ...rest} = props;

    return (
        <Route
            {...rest}
            render={(routeProps) => (
                <LoggedIn {...routeProps}>
                    <Component {...(routeProps)}/>
                </LoggedIn>
            )}
        />
    );
}
