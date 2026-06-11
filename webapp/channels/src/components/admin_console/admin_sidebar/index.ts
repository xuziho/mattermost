// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import type {ConnectedProps} from 'react-redux';

import {getConfig, getLicense} from 'mattermost-redux/selectors/entities/general';

import {getAdminDefinition, getConsoleAccess} from 'selectors/admin_console';
import {getNavigationBlocked} from 'selectors/views/admin';

import type {GlobalState} from 'types/store';

import AdminSidebar from './admin_sidebar';

function mapStateToProps(state: GlobalState) {
    const license = getLicense(state);
    const config = getConfig(state);
    const buildEnterpriseReady = config.BuildEnterpriseReady === 'true';
    const siteName = config.SiteName;
    const adminDefinition = getAdminDefinition(state);
    const consoleAccess = getConsoleAccess(state);
    return {
        license,
        config: state.entities.admin.config,
        navigationBlocked: getNavigationBlocked(state),
        buildEnterpriseReady,
        siteName,
        adminDefinition,
        consoleAccess,
        showTaskList: false,
    };
}

const connector = connect(mapStateToProps, () => ({}));

export type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(AdminSidebar);
