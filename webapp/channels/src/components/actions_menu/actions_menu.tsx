// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {IntlShape} from 'react-intl';
import {injectIntl} from 'react-intl';

import type {AppBinding} from '@mattermost/types/apps';
import type {Post} from '@mattermost/types/posts';

import {AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import type {ActionResult} from 'mattermost-redux/types/actions';

import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';

import {createCallContext} from 'utils/apps';
import {Constants, Locations} from 'utils/constants';
import * as PostUtils from 'utils/post_utils';

import type {HandleBindingClick, OpenAppsModal, PostEphemeralCallResponseForPost} from 'types/apps';

import ActionsMenuButton from './actions_menu_button';
import {ActionsMenuIcon} from './actions_menu_icon';

import './actions_menu.scss';

const MENU_BOTTOM_MARGIN = 80;

export type Props = {
    appBindings: AppBinding[] | null;
    appsEnabled: boolean;
    handleDropdownOpened: (open: boolean) => void;
    intl: IntlShape;
    isMenuOpen: boolean;
    isSysAdmin: boolean;
    location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | 'SEARCH' | string;
    post: Post;
    teamId: string;

    actions: {

        /**
         * Function to post the ephemeral message for a call response
         */
        postEphemeralCallResponseForPost: PostEphemeralCallResponseForPost;

        /**
         * Function to handle clicking of any post-menu bindings
         */
        handleBindingClick: HandleBindingClick;

        /**
         * Function to open the Apps modal with a form
         */
        openAppsModal: OpenAppsModal;

        /**
         * Function to get the post menu bindings for this post.
         */
        fetchBindings: (channelId: string, teamId: string) => Promise<ActionResult<AppBinding[]>>;

    }; // TechDebt: Made non-mandatory while converting to typescript
}

type State = {
    openUp: boolean;
    appBindings?: AppBinding[];
}

export class ActionMenuClass extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        appBindings: [],
        location: Locations.CENTER,
    };
    private buttonElement: HTMLButtonElement | null = null;

    constructor(props: Props) {
        super(props);

        this.state = {
            openUp: false,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.isMenuOpen && !prevProps.isMenuOpen) {
            this.fetchBindings();
        }
    }

    static getDerivedStateFromProps(props: Props) {
        const state: Partial<State> = {};
        if (props.appBindings) {
            state.appBindings = props.appBindings;
        }
        return state;
    }

    private buttonRef = (element: HTMLButtonElement | null) => {
        this.buttonElement = element;
    };

    fetchBindings = () => {
        if (this.props.appsEnabled && !this.state.appBindings) {
            this.props.actions.fetchBindings(this.props.post.channel_id, this.props.teamId).then(({data}) => {
                this.setState({appBindings: data});
            });
        }
    };

    onClickAppBinding = async (binding: AppBinding) => {
        const {post, intl} = this.props;

        const context = createCallContext(
            binding.app_id,
            binding.location,
            this.props.post.channel_id,
            this.props.teamId,
            this.props.post.id,
            this.props.post.root_id,
        );

        const res = await this.props.actions.handleBindingClick(binding, context, intl);

        if (res.error) {
            const errorResponse = res.error;
            const errorMessage = errorResponse.text || intl.formatMessage({
                id: 'apps.error.unknown',
                defaultMessage: 'Unknown error occurred.',
            });
            this.props.actions.postEphemeralCallResponseForPost(errorResponse, errorMessage, post);
            return;
        }

        const callResp = res.data!;
        switch (callResp.type) {
        case AppCallResponseTypes.OK:
            if (callResp.text) {
                this.props.actions.postEphemeralCallResponseForPost(callResp, callResp.text, post);
            }
            break;
        case AppCallResponseTypes.NAVIGATE:
            break;
        case AppCallResponseTypes.FORM:
            if (callResp.form) {
                this.props.actions.openAppsModal(callResp.form, context);
            }
            break;
        default: {
            const errorMessage = intl.formatMessage({
                id: 'apps.error.responses.unknown_type',
                defaultMessage: 'App response type not supported. Response type: {type}.',
            }, {
                type: callResp.type,
            });
            this.props.actions.postEphemeralCallResponseForPost(callResp, errorMessage, post);
        }
        }
    };

    renderDivider = (suffix: string): React.ReactNode => {
        return (
            <li
                id={`divider_post_${this.props.post.id}_${suffix}`}
                className='MenuItem__divider'
                role='menuitem'
            />
        );
    };

    openDropdown = () => {
        this.props.handleDropdownOpened(true);
    };

    closeDropdown = () => {
        this.props.handleDropdownOpened(false);
    };

    handleDropdownOpened = (open: boolean) => {
        this.props.handleDropdownOpened(open);

        if (!open) {
            return;
        }

        const buttonRect = this.buttonElement?.getBoundingClientRect();
        let y;
        if (typeof buttonRect?.y === 'undefined') {
            y = typeof buttonRect?.top == 'undefined' ? 0 : buttonRect?.top;
        } else {
            y = buttonRect?.y;
        }
        const windowHeight = window.innerHeight;

        const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
        const spaceOnTop = y - Constants.CHANNEL_HEADER_HEIGHT;
        const spaceOnBottom = (totalSpace - (spaceOnTop + Constants.POST_AREA_HEIGHT));

        this.setState({
            openUp: (spaceOnTop > spaceOnBottom),
        });
    };

    render(): React.ReactNode {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        if (isSystemMessage) {
            return null;
        }

        let appBindings = [] as JSX.Element[];
        if (this.props.appsEnabled && this.state.appBindings) {
            appBindings = this.state.appBindings.map((item) => {
                let icon: JSX.Element | undefined;
                if (item.icon) {
                    icon = (
                        <img
                            key={item.app_id + 'app_icon'}
                            src={item.icon}
                        />);
                }

                return (
                    <Menu.ItemAction
                        text={item.label}
                        key={item.app_id + item.location}
                        onClick={() => this.onClickAppBinding(item)}
                        icon={icon}
                    />
                );
            });
        }

        const {formatMessage} = this.props.intl;

        const hasApps = Boolean(appBindings.length);
        if (!hasApps) {
            return null;
        }

        const buttonId = `${this.props.location}_actions_button_${this.props.post.id}`;
        const popupId = `${this.props.location}_actions_dropdown_${this.props.post.id}`;

        return (
            <MenuWrapper
                open={this.props.isMenuOpen}
                onToggle={this.handleDropdownOpened}
            >
                <ActionsMenuButton
                    ref={this.buttonRef}
                    buttonId={buttonId}
                    popupId={popupId}
                    isMenuOpen={this.props.isMenuOpen}
                />
                <Menu
                    listId={popupId}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ariaLabel={formatMessage({id: 'post_info.menuAriaLabel', defaultMessage: 'Post extra options'})}
                >
                    {appBindings}
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(ActionMenuClass);
