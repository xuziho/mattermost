// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';

import {InformationOutlineIcon} from '@mattermost/compass-icons/components';

import './save_confirmation_modal.scss';

type Props = {
    onExited: () => void;
    onConfirm?: () => void;
    title?: string;
    subtitle: JSX.Element | string;
    buttonText?: string;
    includeDisclaimer?: boolean;
}

export default function SaveConfirmationModal({onExited, onConfirm, title, subtitle, includeDisclaimer, buttonText}: Props) {
    const {formatMessage} = useIntl();
    return (
        <Modal
            className={'SaveConfirmationModal'}
            dialogClassName={'SaveConfirmationModal__dialog'}
            show={true}
            onExited={onExited}
            onHide={onExited}
        >
            <Modal.Header closeButton={true}>
                <div className='title'>
                    {title}
                </div>
            </Modal.Header>
            <Modal.Body>
                {subtitle}
                {includeDisclaimer &&
                    <div className='disclaimer'>
                        <div className='Icon'>
                            <InformationOutlineIcon/>
                        </div>
                        <div className='Body'>
                            <div className='Title'>{formatMessage({id: 'admin.ip_filtering.save_disclaimer_title', defaultMessage: 'Restoring access if you block yourself'})}</div>
                            <div className='Subtitle'>
                                {formatMessage({id: 'admin.ip_filtering.save_disclaimer_subtitle', defaultMessage: 'If these settings block your access, restore access from the server configuration or ask another system administrator to disable IP filtering.'})}
                            </div>
                        </div>
                    </div>
                }
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-tertiary'
                    onClick={onExited}
                >
                    {formatMessage({id: 'admin.ip_filtering.cancel', defaultMessage: 'Cancel'})}
                </button>
                <button
                    data-testid='save-confirmation-button'
                    type='button'
                    className='btn btn-primary btn-danger'
                    onClick={() => onConfirm?.()}
                >
                    {buttonText}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
