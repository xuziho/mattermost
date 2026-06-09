// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import WarningIcon from 'components/widgets/icons/fa_warning_icon';

import {ErrorPageTypes, Constants} from 'utils/constants';
import {verifyErrorPageSignature} from 'utils/error_signature';

import ErrorMessage from './error_message';
import ErrorTitle from './error_title';

type Location = {
    search: string;
}

type Props = {
    location: Location;
    asymmetricSigningPublicKey?: string;
    siteName?: string;
    isGuest?: boolean;
}

type State = {
    trustedParams?: URLSearchParams;
}

export default class ErrorPage extends React.PureComponent<Props, State> {
    public state: State = {};
    private mounted = false;

    public componentDidMount() {
        this.mounted = true;
        document.body.setAttribute('class', 'sticky error');
        this.verifySignedParams();
    }

    public componentWillUnmount() {
        this.mounted = false;
        document.body.removeAttribute('class');
    }

    public componentDidUpdate(prevProps: Props) {
        if (
            prevProps.location.search !== this.props.location.search ||
            prevProps.asymmetricSigningPublicKey !== this.props.asymmetricSigningPublicKey
        ) {
            this.setState({trustedParams: undefined});
            this.verifySignedParams();
        }
    }

    private async verifySignedParams() {
        const search = this.props.location.search;
        const key = this.props.asymmetricSigningPublicKey;
        const params: URLSearchParams = new URLSearchParams(this.props.location.search);
        const signature = params.get('s');

        if (!signature) {
            return;
        }

        params.delete('s');
        const signedPath = '/error?' + params.toString();

        if (
            await verifyErrorPageSignature(key, signedPath, signature) &&
            this.mounted &&
            this.props.location.search === search &&
            this.props.asymmetricSigningPublicKey === key
        ) {
            this.setState({trustedParams: params});
        }
    }

    public render() {
        const {isGuest} = this.props;
        const params: URLSearchParams = this.state.trustedParams || new URLSearchParams(this.props.location.search);
        const trustParams = Boolean(this.state.trustedParams);

        const type = params.get('type');
        const title = (trustParams && params.get('title')) || '';
        const message = (trustParams && params.get('message')) || '';
        const service = (trustParams && params.get('service')) || '';
        const returnTo = (trustParams && params.get('returnTo')) || '';

        let backButton;
        if (type === ErrorPageTypes.PERMALINK_NOT_FOUND && returnTo) {
            backButton = (
                <Link to={returnTo}>
                    <FormattedMessage
                        id='error.generic.link'
                        defaultMessage='Back to Mattermost'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.CLOUD_ARCHIVED && returnTo) {
            backButton = (
                <Link to={returnTo}>
                    <FormattedMessage
                        id='error.generic.link'
                        defaultMessage='Back to Mattermost'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.TEAM_NOT_FOUND) {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.siteLink'
                        defaultMessage='Back to {siteName}'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.CHANNEL_NOT_FOUND && isGuest) {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.channelNotFound.guest_link'
                        defaultMessage='Back'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.CHANNEL_NOT_FOUND) {
            backButton = (
                <Link to={returnTo}>
                    <FormattedMessage
                        id='error.channelNotFound.link'
                        defaultMessage='Back to {defaultChannelName}'
                        values={{
                            defaultChannelName: Constants.DEFAULT_CHANNEL_UI_NAME,
                        }}
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.OAUTH_ACCESS_DENIED || type === ErrorPageTypes.OAUTH_MISSING_CODE) {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.link_login'
                        defaultMessage='Back to Login Page'
                    />
                </Link>
            );
        } else if (type === ErrorPageTypes.OAUTH_INVALID_PARAM || type === ErrorPageTypes.OAUTH_INVALID_REDIRECT_URL) {
            backButton = null;
        } else {
            backButton = (
                <Link to='/'>
                    <FormattedMessage
                        id='error.generic.siteLink'
                        defaultMessage='Back to {siteName}'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </Link>
            );
        }

        const errorPage = (
            <div className='container-fluid'>
                <div className='error__container'>
                    <div className='error__icon'>
                        <WarningIcon/>
                    </div>
                    <h2 data-testid='errorMessageTitle'>
                        <ErrorTitle
                            type={type}
                            title={title}
                        />
                    </h2>
                    <ErrorMessage
                        type={type}
                        message={message}
                        service={service}
                        isGuest={isGuest}
                    />
                    {backButton}
                </div>
            </div>
        );

        return (
            <>
                {errorPage}
            </>
        );
    }
}
