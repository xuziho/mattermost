// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {lazy} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import {setSystemEmojis} from 'mattermost-redux/actions/emojis';
import {setUrl} from 'mattermost-redux/actions/general';
import {Client4} from 'mattermost-redux/client';

import {temporarilySetPageLoadContext} from 'actions/telemetry_actions.jsx';

import {makeAsyncComponent} from 'components/async_load';
import GlobalHeader from 'components/global_header/global_header';
import {HFRoute} from 'components/header_footer_route/header_footer_route';
import {HFTRoute, LoggedInHFTRoute} from 'components/header_footer_template_route';
import InitialLoadingScreen from 'components/initial_loading_screen';
import LoggedInRoute from 'components/logged_in_route';
import PluginRoot from 'components/plugin_root/plugin_root';
import Readout from 'components/readout/readout';
import {WithUserTheme} from 'components/theme_provider';

import 'utils/a11y_controller_instance';
import {expirationScheduler} from 'utils/burn_on_read_expiration_scheduler';
import {PageLoadContext, SCHEDULED_POST_URL_SUFFIX} from 'utils/constants';
import DesktopApp from 'utils/desktop_api';
import {EmojiIndicesByAlias} from 'utils/emoji';
import {TEAM_NAME_PATH_PATTERN} from 'utils/path';
import {getSiteURL} from 'utils/url';
import {isTextDroppableEvent} from 'utils/utils';
import {initializePlugins} from 'plugins';

import LuxonController from './luxon_controller';
import PerformanceReporterController from './performance_reporter_controller';
import RootProvider from './root_provider';
import RootRedirect from './root_redirect';

import type {PropsFromRedux} from './index';

const MobileViewWatcher = makeAsyncComponent('MobileViewWatcher', lazy(() => import('components/mobile_view_watcher')));
const WindowSizeObserver = makeAsyncComponent('WindowSizeObserver', lazy(() => import('components/window_size_observer/WindowSizeObserver')));
const ErrorPage = makeAsyncComponent('ErrorPage', lazy(() => import('components/error_page')));
const Login = makeAsyncComponent('LoginController', lazy(() => import('components/login/login')));
const PasswordResetSendLink = makeAsyncComponent('PasswordResedSendLink', lazy(() => import('components/password_reset_send_link')));
const PasswordResetForm = makeAsyncComponent('PasswordResetForm', lazy(() => import('components/password_reset_form')));
const Signup = makeAsyncComponent('SignupController', lazy(() => import('components/signup/signup')));
const ShouldVerifyEmail = makeAsyncComponent('ShouldVerifyEmail', lazy(() => import('components/should_verify_email/should_verify_email')));
const DoVerifyEmail = makeAsyncComponent('DoVerifyEmail', lazy(() => import('components/do_verify_email/do_verify_email')));
const ClaimController = makeAsyncComponent('ClaimController', lazy(() => import('components/claim')));
const TermsOfService = makeAsyncComponent('TermsOfService', lazy(() => import('components/terms_of_service')));
const AdminConsole = makeAsyncComponent('AdminConsole', lazy(() => import('components/admin_console')));
const SelectTeam = makeAsyncComponent('SelectTeam', lazy(() => import('components/select_team')));
const Authorize = makeAsyncComponent('Authorize', lazy(() => import('components/authorize')));
const CreateTeam = makeAsyncComponent('CreateTeam', lazy(() => import('components/create_team')));
const Mfa = makeAsyncComponent('Mfa', lazy(() => import('components/mfa/mfa_controller')));
const TeamController = makeAsyncComponent('TeamController', lazy(() => import('components/team_controller')));
const AnnouncementBarController = makeAsyncComponent('AnnouncementBarController', lazy(() => import('components/announcement_bar')));
const SystemNotice = makeAsyncComponent('SystemNotice', lazy(() => import('components/system_notice')));
const TeamSidebar = makeAsyncComponent('TeamSidebar', lazy(() => import('components/team_sidebar')));
const SidebarRight = makeAsyncComponent('SidebarRight', lazy(() => import('components/sidebar_right')));
const ModalController = makeAsyncComponent('ModalController', lazy(() => import('components/modal_controller')));
const AppBar = makeAsyncComponent('AppBar', lazy(() => import('components/app_bar/app_bar')));
const ComponentLibrary = makeAsyncComponent('ComponentLibrary', lazy(() => import('components/component_library')));
const PopoutController = makeAsyncComponent('PopoutController', lazy(() => import('components/popout_controller')));

export type Props = PropsFromRedux & RouteComponentProps

interface State {
    shouldMountAppRoutes?: boolean;
}

export default class Root extends React.PureComponent<Props, State> {
    // The constructor adds a bunch of event listeners,
    // so we do need this.
    constructor(props: Props) {
        super(props);

        setUrl(getSiteURL());

        // Disable auth header to enable CSRF check
        Client4.setAuthHeader = false;

        setSystemEmojis(new Set(EmojiIndicesByAlias.keys()));

        this.state = {
            shouldMountAppRoutes: false,
        };
    }

    onConfigLoaded = () => {
        this.setState({shouldMountAppRoutes: true});

        initializePlugins();
        this.props.actions.migrateRecentEmojis();
        this.props.actions.loadRecentlyUsedCustomEmojis();
    };

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.props.location.pathname === '/') {
            if (this.props.noAccounts) {
                prevProps.history.push('/signup_user_complete');
            } else if (this.props.showTermsOfService) {
                prevProps.history.push('/terms_of_service');
            }
        }

        if (
            this.props.shouldShowAppBar !== prevProps.shouldShowAppBar ||
            this.props.rhsIsOpen !== prevProps.rhsIsOpen ||
            this.props.rhsIsExpanded !== prevProps.rhsIsExpanded
        ) {
            this.setRootMeta();
        }

        if (prevState.shouldMountAppRoutes === false && this.state.shouldMountAppRoutes === true) {
            if (!doesRouteBelongToTeamControllerRoutes(this.props.location.pathname)) {
                DesktopApp.reactAppInitialized();
                InitialLoadingScreen.stop('root');
            }
        }
    }

    captureUTMParams() {
        const qs = new URLSearchParams(window.location.search);

        // list of key that we want to track
        const keys = ['utm_source', 'utm_medium', 'utm_campaign'];

        const campaign = keys.reduce((acc, key) => {
            if (qs.has(key)) {
                const value = qs.get(key);
                if (value) {
                    acc[key] = value;
                }
                qs.delete(key);
            }
            return acc;
        }, {} as Record<string, string>);

        if (Object.keys(campaign).length > 0) {
            this.props.history.replace({search: qs.toString()});
            return campaign;
        }
        return null;
    }

    initiateMeRequests = async () => {
        const {isLoaded, isMeRequested} = await this.props.actions.loadConfigAndMe();

        if (isLoaded) {
            const isUserAtRootRoute = this.props.location.pathname === '/';

            if (isUserAtRootRoute) {
                if (isMeRequested) {
                    this.props.actions.redirectToDefaultTeam(new URLSearchParams(this.props.location.search));
                } else if (this.props.noAccounts) {
                    this.props.history.push('/signup_user_complete');
                }
            }

            this.onConfigLoaded();
        }
    };

    handleDropEvent = (e: DragEvent) => {
        if (e.dataTransfer && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind === 'file') {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    handleDragOverEvent = (e: DragEvent) => {
        if (!isTextDroppableEvent(e)) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    componentDidMount() {
        temporarilySetPageLoadContext(PageLoadContext.PAGE_LOAD);

        this.initiateMeRequests();

        // Initialize burn-on-read expiration scheduler
        expirationScheduler.initialize(this.props.dispatch);

        // Force logout of all tabs if one tab is logged out
        window.addEventListener('storage', this.handleLogoutLoginSignal);

        // Prevent drag and drop files from navigating away from the app
        document.addEventListener('drop', this.handleDropEvent);

        document.addEventListener('dragover', this.handleDragOverEvent);
    }

    componentWillUnmount() {
        // Cleanup burn-on-read expiration scheduler
        expirationScheduler.cleanup();

        window.removeEventListener('storage', this.handleLogoutLoginSignal);
        document.removeEventListener('drop', this.handleDropEvent);
        document.removeEventListener('dragover', this.handleDragOverEvent);
    }

    handleLogoutLoginSignal = (e: StorageEvent) => {
        this.props.actions.handleLoginLogoutSignal(e);
    };

    setRootMeta = () => {
        const root = document.getElementById('root')!;

        for (const [className, enabled] of Object.entries({
            'app-bar-enabled': this.props.shouldShowAppBar,
            'rhs-open': this.props.rhsIsOpen,
            'rhs-open-expanded': this.props.rhsIsExpanded,
        })) {
            root.classList.toggle(className, enabled);
        }
    };

    render() {
        if (!this.state.shouldMountAppRoutes) {
            return <div/>;
        }

        return (
            <RootProvider>
                <MobileViewWatcher/>
                <LuxonController/>
                <PerformanceReporterController/>
                <Switch>
                    <Route
                        path={'/error'}
                        component={ErrorPage}
                    />
                    <HFRoute
                        path={'/login'}
                        component={Login}
                    />
                    <HFTRoute
                        path={'/reset_password'}
                        component={PasswordResetSendLink}
                    />
                    <HFTRoute
                        path={'/reset_password_complete'}
                        component={PasswordResetForm}
                    />
                    <HFRoute
                        path={'/signup_user_complete'}
                        component={Signup}
                    />
                    <HFRoute
                        path={'/should_verify_email'}
                        component={ShouldVerifyEmail}
                    />
                    <HFRoute
                        path={'/do_verify_email'}
                        component={DoVerifyEmail}
                    />
                    <HFTRoute
                        path={'/claim'}
                        component={ClaimController}
                    />
                    <LoggedInRoute
                        path={'/terms_of_service'}
                        component={TermsOfService}
                    />
                    {this.props.isDevModeEnabled && (
                        <Route
                            path={'/component_library'}
                            component={ComponentLibrary}
                        />
                    )}
                    <Route
                        path={'/admin_console'}
                    >
                        <Switch>
                            <LoggedInRoute
                                path={'/admin_console'}
                                component={AdminConsole}
                            />
                            <RootRedirect/>
                        </Switch>
                    </Route>
                    <LoggedInHFTRoute
                        path={'/select_team'}
                        component={SelectTeam}
                    />
                    <LoggedInHFTRoute
                        path={'/oauth/authorize'}
                        component={Authorize}
                    />
                    <LoggedInHFTRoute
                        path={'/create_team'}
                        component={CreateTeam}
                    />
                    <LoggedInRoute
                        path={'/mfa'}
                        component={Mfa}
                    />
                    <Redirect
                        from={'/_redirect/integrations/:subpath*'}
                        to={`/${this.props.permalinkRedirectTeamName}/integrations/:subpath*`}
                    />
                    <Redirect
                        from={'/_redirect/pl/:postid'}
                        to={`/${this.props.permalinkRedirectTeamName}/pl/:postid`}
                    />
                    <Route
                        path={'/_popout'}
                        component={PopoutController}
                    />
                    <WithUserTheme>
                        <WindowSizeObserver/>
                        <ModalController/>
                        <AnnouncementBarController/>
                        <SystemNotice/>
                        <GlobalHeader/>
                        <TeamSidebar/>
                        <div className='main-wrapper'>
                            <Switch>
                                <LoggedInRoute
                                    path={`/:team(${TEAM_NAME_PATH_PATTERN})`}
                                    component={TeamController}
                                />
                                <RootRedirect/>
                            </Switch>
                            <SidebarRight/>
                        </div>
                        <AppBar/>
                        <PluginRoot/>
                        <Readout/>
                    </WithUserTheme>
                </Switch>
            </RootProvider>
        );
    }
}

export function doesRouteBelongToTeamControllerRoutes(pathname: RouteComponentProps['location']['pathname']): boolean {
    // Note: we have specifically added admin_console to the negative lookahead as admin_console can have integrations as subpaths (admin_console/integrations/bot_accounts)
    // and we don't want to treat those as team controller routes.
    const TEAM_CONTROLLER_PATH_PATTERN = new RegExp(`^/(?!admin_console)([a-z0-9\\-_]+)/(channels|messages|threads|drafts|integrations|emoji|${SCHEDULED_POST_URL_SUFFIX})(/.*)?$`);

    return TEAM_CONTROLLER_PATH_PATTERN.test(pathname);
}
