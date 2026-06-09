// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, useIntl} from 'react-intl';

import type {ClientConfig, ClientLicense} from '@mattermost/types/config';

import {Client4} from 'mattermost-redux/client';

import CopyButton from 'components/copy_button';
import Nbsp from 'components/html_entities/nbsp';

import {getDesktopVersion, isDesktopApp} from 'utils/user_agent';

type SocketStatus = {
    connected: boolean;
    serverHostname: string | undefined;
}

type Props = {

    /**
     * Function called after the modal has been hidden
     */
    onExited: () => void;

    /**
     * Global config object
     */
    config: Partial<ClientConfig>;

    /**
     * Global license object
     */
    license: ClientLicense;

    socketStatus: SocketStatus;
};

export default function AboutBuildModal(props: Props) {
    const intl = useIntl();
    const [show, setShow] = useState(true);
    const [loadMetric, setLoadMetric] = useState<number | null>(0);

    useEffect(() => {
        const fetchLoadMetric = async () => {
            try {
                const result = await Client4.getLicenseLoadMetric();
                if (result?.load) {
                    setLoadMetric(result.load);
                }
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error('Error fetching load metric:', e);
            }
        };

        fetchLoadMetric();
    }, []);

    const doHide = () => {
        setShow(false);
        props.onExited();
    };

    const config = props.config;
    const title = (
        <FormattedMessage
            id='about.agentCompanyOsTitle'
            defaultMessage='AgentCompanyOS Collaboration Frontend'
        />
    );

    const subTitle = (
        <FormattedMessage
            id='about.agentCompanyOsSubtitle'
            defaultMessage='A lightweight collaboration surface for teams, channels, messages, files, and AgentCompanyOS workflows.'
        />
    );

    const getServerVersionString = () => {
        const version = config.BuildNumber === 'dev' ? config.BuildNumber : config.Version;
        const fipsSuffix = config.IsFipsEnabled === 'true' ? ' (FIPS)' : '';
        return intl.formatMessage(
            {id: 'about.serverVersion', defaultMessage: 'Server Version:'},
        ) + '\u00a0' + version + fipsSuffix;
    };

    const getDesktopVersionString = () => {
        return intl.formatMessage(
            {id: 'about.desktopVersion', defaultMessage: 'Desktop Version:'},
        ) + '\u00a0' + getDesktopVersion();
    };

    const getLoadMetricString = () => {
        return intl.formatMessage(
            {id: 'about.loadmetric', defaultMessage: 'Load Metric:'},
        ) + '\u00a0' + loadMetric;
    };

    const getDbVersionString = () => {
        return intl.formatMessage(
            {id: 'about.dbversion', defaultMessage: 'Database Schema Version:'},
        ) + '\u00a0' + config.SchemaVersion;
    };

    const getBuildNumberString = () => {
        return intl.formatMessage(
            {id: 'about.buildnumber', defaultMessage: 'Build Number:'},
        ) + '\u00a0' + (config.BuildNumber === 'dev' ? 'n/a' : config.BuildNumber);
    };

    const getDatabaseString = () => {
        return intl.formatMessage(
            {id: 'about.database', defaultMessage: 'Database:'},
        ) + '\u00a0' + config.SQLDriverName;
    };

    const versionInfo = () => {
        const parts = [
            getServerVersionString(),
            isDesktopApp() && getDesktopVersionString(),
            (loadMetric !== null && loadMetric > 0) && getLoadMetricString(),
            getDbVersionString(),
            getBuildNumberString(),
            getDatabaseString(),
        ].filter(Boolean);
        return parts.join('\n');
    };

    let serverHostname;
    if (!props.socketStatus.connected) {
        serverHostname = (
            <div>
                <FormattedMessage
                    id='about.serverHostname'
                    defaultMessage='Hostname:'
                />
                <Nbsp/>
                <FormattedMessage
                    id='about.serverDisconnected'
                    defaultMessage='disconnected'
                />
            </div>
        );
    } else if (props.socketStatus.serverHostname) {
        serverHostname = (
            <div>
                <FormattedMessage
                    id='about.serverHostname'
                    defaultMessage='Hostname:'
                />
                <Nbsp/>
                {props.socketStatus.serverHostname}
            </div>
        );
    } else {
        serverHostname = (
            <div>
                <FormattedMessage
                    id='about.serverHostname'
                    defaultMessage='Hostname:'
                />
                <Nbsp/>
                <FormattedMessage
                    id='about.serverUnknown'
                    defaultMessage='server did not provide hostname'
                />
            </div>
        );
    }

    return (
        <Modal
            dialogClassName='a11y__modal about-modal'
            show={show}
            onHide={doHide}
            onExited={props.onExited}
            role='dialog'
            aria-labelledby='aboutModalLabel'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title
                    componentClass='h1'
                    id='aboutModalLabel'
                >
                    <FormattedMessage
                        id='about.title'
                        values={{
                            appTitle: config.SiteName || 'AgentCompanyOS',
                        }}
                        defaultMessage='About {appTitle}'
                    />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='about-modal__content'>
                    <div className='about-modal__logo'>
                        <span aria-hidden='true'>{'AC'}</span>
                    </div>
                    <div>
                        <h3 className='about-modal__title'>
                            <strong>
                                {title}
                            </strong>
                        </h3>
                        <p className='about-modal__subtitle pb-2'>
                            {subTitle}
                        </p>
                        <div className='form-group less'>
                            <div
                                className='about-modal__version-info'
                                data-testid='aboutModalVersionInfo'
                            >
                                {getServerVersionString()}<br/>
                                {isDesktopApp() && (
                                    <>
                                        {getDesktopVersionString()}<br/>
                                    </>
                                )}
                                {(loadMetric !== null && loadMetric > 0) && (
                                    <>
                                        {getLoadMetricString()}<br/>
                                    </>
                                )}
                                {getDbVersionString()}<br/>
                                {getBuildNumberString()}<br/>
                                {getDatabaseString()}<br/>
                                <CopyButton
                                    className='about-modal__version-info-copy-button'
                                    isForText={true}
                                    content={versionInfo()}
                                />
                            </div>
                            {serverHostname}
                        </div>
                    </div>
                </div>
                <div className='about-modal__footer'>
                    <div className='form-group'>
                        <div className='about-modal__copyright'>
                            <FormattedMessage
                                id='about.copyright'
                                defaultMessage='Copyright 2015 - {currentYear} {appTitle}. All rights reserved'
                                values={{
                                    currentYear: new Date().getFullYear(),
                                    appTitle: config.SiteName || 'AgentCompanyOS',
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className='about-modal__notice form-group pt-3'>
                    <p>
                        <FormattedMessage
                            id='about.notice'
                            defaultMessage='AgentCompanyOS includes open source collaboration components and keeps the runtime focused on lightweight team messaging.'
                        />
                    </p>
                </div>
                <div className='about-modal__hash'>
                    <p>
                        <FormattedMessage
                            id='about.hash'
                            defaultMessage='Build Hash:'
                        />
                        <Nbsp/>
                        {config.BuildHash}
                    </p>
                    <p>
                        <FormattedMessage
                            id='about.date'
                            defaultMessage='Build Date:'
                        />
                        <Nbsp/>
                        {config.BuildDate}
                    </p>
                </div>
            </Modal.Body>
        </Modal>
    );
}
